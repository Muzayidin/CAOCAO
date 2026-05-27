import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from './generated/client';
import Redis from 'ioredis';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4002;

// Redis Setup (With soft fallback if offline)
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
let redis: Redis | null = null;
try {
  redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 1, retryStrategy: () => null });
  redis.on('error', (err) => {});
} catch (e) {
  console.log('Redis broker is offline, falling back to local memory event mock.');
}

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({ service: 'order-service', status: 'UP' });
});

// Middleware to extract tenant payload from gateway headers
const getTenantHeader = (req: any, res: any, next: any) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  if (!tenantId) {
    return res.status(400).json({ error: 'Missing X-Tenant-ID header' });
  }
  req.tenantId = tenantId;
  next();
};

app.use(getTenantHeader);

// 1. Get Tables
app.get('/tables', async (req: any, res: any) => {
  try {
    const tables = await prisma.table.findMany({
      where: { tenantId: req.tenantId },
      orderBy: { name: 'asc' },
    });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. Upsert Table layout maps
app.post('/tables', async (req: any, res: any) => {
  const { name, x, y, status } = req.body;
  try {
    const table = await prisma.table.create({
      data: {
        tenantId: req.tenantId,
        name,
        x: x || 0,
        y: y || 0,
        status: status || 'AVAILABLE',
      },
    });
    res.status(201).json(table);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update Table status
app.patch('/tables/:id', async (req: any, res: any) => {
  const { status, x, y } = req.body;
  try {
    const table = await prisma.table.update({
      where: { id: req.id },
      data: {
        ...(status && { status }),
        ...(x !== undefined && { x }),
        ...(y !== undefined && { y }),
      },
    });
    res.json(table);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. Place Order & Route tickets to Kitchen/Bar (KDS)
app.post('/orders', async (req: any, res: any) => {
  const {
    tableId,
    tableName,
    waiterId,
    waiterName,
    items,
    discountType,
    discountVal,
    paymentMethod,
    isPaid,
  } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'Order must contain items' });
  }

  try {
    // Calculations
    let totalBefore = 0;
    items.forEach((item: any) => {
      totalBefore += item.unitPrice * item.quantity;
    });

    let discountAmount = 0;
    if (discountType === 'PERCENTAGE') {
      discountAmount = totalBefore * (discountVal / 100);
    } else if (discountType === 'NOMINAL') {
      discountAmount = discountVal;
    }

    const netBeforeTaxes = Math.max(0, totalBefore - discountAmount);
    const taxAmount = netBeforeTaxes * 0.11; // 11% PPN
    const serviceAmount = netBeforeTaxes * 0.05; // 5% Service Charge
    const totalAfter = netBeforeTaxes + taxAmount + serviceAmount;

    // Create Order within Transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          tenantId: req.tenantId,
          tableId,
          waiterId,
          waiterName,
          status: isPaid ? 'PAID' : 'PENDING',
          totalBefore,
          discountType,
          discountVal,
          taxAmount,
          serviceAmount,
          totalAfter,
          paymentMethod: paymentMethod || 'CASH',
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.unitPrice * item.quantity,
              notes: item.notes,
            })),
          },
        },
        include: { items: true },
      });

      // Route KDS Tickets (If foods exist -> Kitchen Ticket, If drinks exist -> Bar Ticket)
      const foodItems = items.filter((i: any) => i.category === 'FOOD');
      const drinkItems = items.filter((i: any) => i.category === 'DRINK' || i.category === 'ADD_ON');

      if (foodItems.length > 0) {
        await tx.kDSTicket.create({
          data: {
            tenantId: req.tenantId,
            orderId: order.id,
            tableName: tableName || 'Takeaway',
            waiterName,
            status: 'QUEUED',
            items: {
              create: foodItems.map((item: any) => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                category: 'FOOD',
                notes: item.notes,
              })),
            },
          },
        });
      }

      if (drinkItems.length > 0) {
        await tx.kDSTicket.create({
          data: {
            tenantId: req.tenantId,
            orderId: order.id,
            tableName: tableName || 'Takeaway',
            waiterName,
            status: 'QUEUED',
            items: {
              create: drinkItems.map((item: any) => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                category: item.category === 'FOOD' ? 'FOOD' : 'DRINK',
                notes: item.notes,
              })),
            },
          },
        });
      }

      // Update Table Status to occupied if pending
      if (tableId && !isPaid) {
        await tx.table.update({
          where: { id: tableId },
          data: { status: 'OCCUPIED' },
        });
      }

      return order;
    });

    // Event Publish to Redis: Paid order triggers inventory subtraction
    if (newOrder.status === 'PAID' && redis) {
      const eventPayload = {
        tenantId: req.tenantId,
        orderId: newOrder.id,
        items: newOrder.items,
      };
      await redis.publish('order.paid', JSON.stringify(eventPayload));
      console.log('Event order.paid published for order:', newOrder.id);
    }

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Offline Orders Synchronizer
app.post('/orders/sync', async (req: any, res: any) => {
  const { orders } = req.body;
  if (!orders || !orders.length) {
    return res.status(400).json({ error: 'No orders payload provided' });
  }

  try {
    const syncedOrders = [];
    for (const ord of orders) {
      // Calculate individual order
      let totalBefore = 0;
      ord.items.forEach((item: any) => {
        totalBefore += item.unitPrice * item.quantity;
      });
      let discountAmount = 0;
      if (ord.discountType === 'PERCENTAGE') {
        discountAmount = totalBefore * (ord.discountVal / 100);
      } else if (ord.discountType === 'NOMINAL') {
        discountAmount = ord.discountVal;
      }
      const netBeforeTaxes = Math.max(0, totalBefore - discountAmount);
      const taxAmount = netBeforeTaxes * 0.11;
      const serviceAmount = netBeforeTaxes * 0.05;
      const totalAfter = netBeforeTaxes + taxAmount + serviceAmount;

      const created = await prisma.order.create({
        data: {
          tenantId: req.tenantId,
          waiterId: ord.waiterId || 'offline-waiter',
          waiterName: ord.waiterName || 'Offline Drawer',
          status: 'PAID',
          totalBefore,
          discountType: ord.discountType,
          discountVal: ord.discountVal || 0,
          taxAmount,
          serviceAmount,
          totalAfter,
          paymentMethod: ord.paymentMethod || 'CASH',
          createdAt: ord.createdAt ? new Date(ord.createdAt) : new Date(),
          items: {
            create: ord.items.map((item: any) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              totalPrice: item.unitPrice * item.quantity,
              notes: item.notes,
            })),
          },
        },
        include: { items: true },
      });

      // Trigger Redis pub/sub inventory deduction
      if (redis) {
        await redis.publish(
          'order.paid',
          JSON.stringify({
            tenantId: req.tenantId,
            orderId: created.id,
            items: created.items,
          })
        );
      }
      syncedOrders.push(created);
    }
    res.json({ message: 'Sync complete', count: syncedOrders.length, syncedOrders });
  } catch (error: any) {
    console.error('Offline sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. KDS Ticket Listings
app.get('/kds/tickets', async (req: any, res: any) => {
  const { category } = req.query; // 'FOOD' or 'DRINK'
  try {
    const tickets = await prisma.kDSTicket.findMany({
      where: {
        tenantId: req.tenantId,
        status: { notIn: ['READY', 'SERVED'] },
        ...(category && {
          items: {
            some: {
              category: category as string,
            },
          },
        }),
      },
      include: { items: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Mark KDS ticket item completed
app.patch('/kds/items/:itemId', async (req: any, res: any) => {
  const { itemId } = req.params;
  const { isCompleted } = req.body;
  try {
    const item = await prisma.kDSTicketItem.update({
      where: { id: itemId },
      data: { isCompleted },
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Complete the entire KDS ticket
app.patch('/kds/tickets/:ticketId', async (req: any, res: any) => {
  const { ticketId } = req.params;
  const { status } = req.body; // IN_PROGRESS, READY, SERVED
  try {
    const ticket = await prisma.kDSTicket.update({
      where: { id: ticketId },
      data: { status: status as string },
      include: { items: true },
    });

    // Auto check-off elements
    if (status === 'READY' || status === 'SERVED') {
      await prisma.kDSTicketItem.updateMany({
        where: { ticketId },
        data: { isCompleted: true },
      });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 5. Split Bill Endpoint
app.post('/orders/:id/split', async (req: any, res: any) => {
  const { id: orderId } = req.params;
  const { splitOrders } = req.body; // Array of order items list with distinct split ratios

  try {
    const originalOrder = await prisma.order.findFirst({
      where: { id: orderId, tenantId: req.tenantId },
      include: { items: true },
    });

    if (!originalOrder) {
      return res.status(404).json({ error: 'Original order not found' });
    }

    const createdSplits: any[] = [];
    await prisma.$transaction(async (tx) => {
      // De-active or update original order to split-cancelled
      await tx.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      });

      for (const split of splitOrders) {
        let totalBefore = 0;
        split.items.forEach((item: any) => {
          totalBefore += item.unitPrice * item.quantity;
        });
        const taxAmount = totalBefore * 0.11;
        const serviceAmount = totalBefore * 0.05;
        const totalAfter = totalBefore + taxAmount + serviceAmount;

        const subOrder = await tx.order.create({
          data: {
            tenantId: req.tenantId,
            tableId: originalOrder.tableId,
            waiterId: originalOrder.waiterId,
            waiterName: originalOrder.waiterName,
            status: 'PENDING',
            totalBefore,
            taxAmount,
            serviceAmount,
            totalAfter,
            paymentMethod: split.paymentMethod || 'CASH',
            items: {
              create: split.items.map((item: any) => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.unitPrice * item.quantity,
                notes: item.notes,
              })),
            },
          },
          include: { items: true },
        });
        createdSplits.push(subOrder);
      }
    });

    res.json({ message: 'Split bills created successfully', splits: createdSplits });
  } catch (error) {
    console.error('Split bill error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Active pending orders (for cashier sidebar or table mapping occupancy queries)
app.get('/orders/pending', async (req: any, res: any) => {
  try {
    const orders = await prisma.order.findMany({
      where: { tenantId: req.tenantId, status: 'PENDING' },
      include: { items: true },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});
