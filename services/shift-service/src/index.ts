import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from './generated/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4004;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({ service: 'shift-service', status: 'UP' });
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

app.use(getTenantHeader);

// 1. Get active shift status for a cashier
app.get('/shifts/active', async (req: any, res: any) => {
  const { cashierId } = req.query;
  try {
    const activeShift = await prisma.shift.findFirst({
      where: {
        tenantId: req.tenantId,
        status: 'OPEN',
        ...(cashierId && { cashierId }),
      },
    });
    res.json(activeShift || null);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. Open Shift
app.post('/shifts/open', async (req: any, res: any) => {
  const { cashierId, cashierName, startCapital, notes } = req.body;

  if (!cashierId || startCapital === undefined) {
    return res.status(400).json({ error: 'Missing Cashier ID or starting capital amount' });
  }

  try {
    // Ensure no existing open shift
    const existing = await prisma.shift.findFirst({
      where: { tenantId: req.tenantId, cashierId, status: 'OPEN' },
    });

    if (existing) {
      return res.status(400).json({ error: 'There is already an active shift open for this Cashier' });
    }

    const shift = await prisma.shift.create({
      data: {
        tenantId: req.tenantId,
        cashierId,
        cashierName,
        startCapital: parseFloat(startCapital),
        status: 'OPEN',
        notes,
      },
    });

    res.status(201).json(shift);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. Close Shift & Reconcile cash capital
app.post('/shifts/:id/close', async (req: any, res: any) => {
  const { id } = req.params;
  const { actualCash, cashSalesEarned, notes } = req.body; // cashSalesEarned passed from POS/order records

  if (actualCash === undefined || cashSalesEarned === undefined) {
    return res.status(400).json({ error: 'Actual counted cash and cash sales earned are required' });
  }

  try {
    const shift = await prisma.shift.findUnique({
      where: { id },
    });

    if (!shift || shift.tenantId !== req.tenantId) {
      return res.status(404).json({ error: 'Shift session not found' });
    }

    if (shift.status === 'CLOSED') {
      return res.status(400).json({ error: 'Shift is already closed and archived' });
    }

    const expectedCash = shift.startCapital + parseFloat(cashSalesEarned);
    const actualCashNum = parseFloat(actualCash);
    const discrepancy = actualCashNum - expectedCash;

    const closedShift = await prisma.shift.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        expectedCash,
        actualCash: actualCashNum,
        discrepancy,
        notes: notes || shift.notes,
      },
    });

    res.json({
      message: 'Shift reconciled and closed successfully',
      closedShift,
    });
  } catch (error) {
    console.error('Close shift error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get historical shift logs
app.get('/shifts', async (req: any, res: any) => {
  try {
    const logs = await prisma.shift.findMany({
      where: { tenantId: req.tenantId },
      orderBy: { openedAt: 'desc' },
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Shift Service running on port ${PORT}`);
});
