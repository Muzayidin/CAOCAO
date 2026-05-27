import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from './generated/client';
import Redis from 'ioredis';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4003;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({ service: 'inventory-service', status: 'UP' });
});

// Middleware to extract tenant payload
const getTenantHeader = (req: any, res: any, next: any) => {
  const tenantId = req.headers['x-tenant-id'] as string;
  if (!tenantId) {
    return res.status(400).json({ error: 'Missing X-Tenant-ID header' });
  }
  req.tenantId = tenantId;
  next();
};

// Redis Subscriber for automatic background BOM deduction
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
let redisSub: Redis | null = null;
try {
  redisSub = new Redis(REDIS_URL, { maxRetriesPerRequest: 1, retryStrategy: () => null });
  redisSub.on('error', (err) => {});

  redisSub.subscribe('order.paid', (err) => {
    if (err) {
      console.log('Redis subscriber channel offline (using REST sync fallback).');
    } else {
      console.log('Successfully subscribed to order.paid channel for stock reductions');
    }
  });

  redisSub.on('message', async (channel, message) => {
    if (channel === 'order.paid') {
      try {
        const payload = JSON.parse(message);
        console.log(`Processing stock deduction for Tenant: ${payload.tenantId}, Order: ${payload.orderId}`);
        await deductStockForOrder(payload.tenantId, payload.items);
      } catch (e) {
        console.error('Error handling order stock reduction event:', e);
      }
    }
  });
} catch (e) {
  console.log('Redis subscriber offline. Using manual API endpoint backup.');
}

// Atomic stock deduction logic
async function deductStockForOrder(tenantId: string, items: any[]) {
  for (const item of items) {
    // 1. Get Recipe ingredients for this product
    const recipeItems = await prisma.recipeItem.findMany({
      where: { productId: item.productId },
    });

    for (const recipe of recipeItems) {
      const deductionQty = recipe.quantity * item.quantity;
      try {
        // 2. Decrement stock level atomically
        await prisma.ingredient.update({
          where: { id: recipe.ingredientId, tenantId },
          data: {
            stockLevel: {
              decrement: deductionQty,
            },
          },
        });
        console.log(`Deducted ${deductionQty} from Ingredient: ${recipe.ingredientId} for Product: ${item.productName}`);
      } catch (err: any) {
        console.error(`Failed to deduct stock for Ingredient ${recipe.ingredientId}:`, err.message);
      }
    }
  }
}

// Expose manual backup REST endpoint for dual resiliency
app.post('/deduct-stock', getTenantHeader, async (req: any, res: any) => {
  const { items } = req.body;
  if (!items || !items.length) {
    return res.status(400).json({ error: 'Missing items list to deduct' });
  }

  try {
    await deductStockForOrder(req.tenantId, items);
    res.json({ message: 'Stock deduction requested successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// REST Endpoints for Ingredients (Raw goods)
app.get('/ingredients', getTenantHeader, async (req: any, res: any) => {
  try {
    const ingredients = await prisma.ingredient.findMany({
      where: { tenantId: req.tenantId },
      orderBy: { name: 'asc' },
    });
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/ingredients', getTenantHeader, async (req: any, res: any) => {
  const { name, category, stockLevel, unit, safetyThreshold } = req.body;
  try {
    const ing = await prisma.ingredient.create({
      data: {
        tenantId: req.tenantId,
        name,
        category: category || 'BAR',
        stockLevel: parseFloat(stockLevel),
        unit,
        safetyThreshold: parseFloat(safetyThreshold || '500'),
      },
    });
    res.status(201).json(ing);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.patch('/ingredients/:id', getTenantHeader, async (req: any, res: any) => {
  const { id } = req.params;
  const { name, category, stockLevel, safetyThreshold } = req.body;
  try {
    const ing = await prisma.ingredient.update({
      where: { id, tenantId: req.tenantId },
      data: {
        ...(name && { name }),
        ...(category && { category }),
        ...(stockLevel !== undefined && { stockLevel: parseFloat(stockLevel) }),
        ...(safetyThreshold !== undefined && { safetyThreshold: parseFloat(safetyThreshold) }),
      },
    });
    res.json(ing);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// REST Endpoints for Products & Recipes (BOM)
app.get('/products', getTenantHeader, async (req: any, res: any) => {
  try {
    const products = await prisma.product.findMany({
      where: { tenantId: req.tenantId, isActive: true },
      include: {
        recipeItems: {
          include: {
            ingredient: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/products', getTenantHeader, async (req: any, res: any) => {
  const { name, category, price, imageUrl, recipe } = req.body; // recipe: Array of { ingredientId, quantity }
  try {
    const newProduct = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.create({
        data: {
          tenantId: req.tenantId,
          name,
          category,
          price: parseFloat(price),
          imageUrl,
        },
      });

      if (recipe && recipe.length > 0) {
        await tx.recipeItem.createMany({
          data: recipe.map((r: any) => ({
            productId: prod.id,
            ingredientId: r.ingredientId,
            quantity: parseFloat(r.quantity),
          })),
        });
      }
      return prod;
    });

    const fullProduct = await prisma.product.findUnique({
      where: { id: newProduct.id },
      include: { recipeItems: { include: { ingredient: true } } },
    });

    res.status(201).json(fullProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Record Waste Logs
app.post('/waste', getTenantHeader, async (req: any, res: any) => {
  const { ingredientId, quantity, reason, loggedBy } = req.body;
  try {
    const log = await prisma.$transaction(async (tx) => {
      // 1. Decrement stock
      await tx.ingredient.update({
        where: { id: ingredientId, tenantId: req.tenantId },
        data: { stockLevel: { decrement: parseFloat(quantity) } },
      });
      // 2. Add log
      return await tx.wasteLog.create({
        data: {
          tenantId: req.tenantId,
          ingredientId,
          quantity: parseFloat(quantity),
          reason,
          loggedBy,
        },
      });
    });
    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/waste', getTenantHeader, async (req: any, res: any) => {
  try {
    const logs = await prisma.wasteLog.findMany({
      where: { tenantId: req.tenantId },
      include: { ingredient: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Inventory Service running on port ${PORT}`);
});
