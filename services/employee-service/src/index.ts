import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from './generated/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4005;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({ service: 'employee-service', status: 'UP' });
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

// 1. Employee Scheduling
app.get('/schedules', async (req: any, res: any) => {
  try {
    const schedules = await prisma.schedule.findMany({
      where: { tenantId: req.tenantId },
      orderBy: { date: 'asc' },
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/schedules', async (req: any, res: any) => {
  const { employeeId, employeeName, date, shiftStart, shiftEnd } = req.body;
  if (!employeeId || !employeeName || !date || !shiftStart || !shiftEnd) {
    return res.status(400).json({ error: 'Missing required schedule params' });
  }

  try {
    const sched = await prisma.schedule.create({
      data: {
        tenantId: req.tenantId,
        employeeId,
        employeeName,
        date: new Date(date),
        shiftStart: new Date(shiftStart),
        shiftEnd: new Date(shiftEnd),
      },
    });
    res.status(201).json(sched);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. Attendance module (Clock-In / Clock-Out)
app.post('/attendance/clock-in', async (req: any, res: any) => {
  const { employeeId, employeeName } = req.body;
  if (!employeeId || !employeeName) {
    return res.status(400).json({ error: 'Employee ID and name are required' });
  }

  try {
    // Check if already clocked in today (where clockOut is null)
    const existing = await prisma.attendance.findFirst({
      where: {
        tenantId: req.tenantId,
        employeeId,
        clockOut: null,
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Employee is already clocked in' });
    }

    const attendance = await prisma.attendance.create({
      data: {
        tenantId: req.tenantId,
        employeeId,
        employeeName,
        clockIn: new Date(),
        status: 'PRESENT',
      },
    });

    res.status(201).json({ message: 'Clocked in successfully', attendance });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/attendance/clock-out', async (req: any, res: any) => {
  const { employeeId } = req.body;
  if (!employeeId) {
    return res.status(400).json({ error: 'Employee ID is required' });
  }

  try {
    const active = await prisma.attendance.findFirst({
      where: {
        tenantId: req.tenantId,
        employeeId,
        clockOut: null,
      },
    });

    if (!active) {
      return res.status(400).json({ error: 'Employee is not clocked in' });
    }

    const clockOutTime = new Date();
    const durationMs = clockOutTime.getTime() - active.clockIn.getTime();
    const hoursWorked = parseFloat((durationMs / (1000 * 60 * 60)).toFixed(2));

    const updated = await prisma.attendance.update({
      where: { id: active.id },
      data: {
        clockOut: clockOutTime,
        hoursWorked,
      },
    });

    res.json({ message: 'Clocked out successfully', attendance: updated });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/attendance', async (req: any, res: any) => {
  try {
    const logs = await prisma.attendance.findMany({
      where: { tenantId: req.tenantId },
      orderBy: { clockIn: 'desc' },
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. Automated Payroll calculation
app.post('/payroll/generate', async (req: any, res: any) => {
  const { employeeId, employeeName, monthYear, baseSalary, hourlyRate, allowance, deductions } = req.body;

  if (!employeeId || !employeeName || !monthYear || baseSalary === undefined) {
    return res.status(400).json({ error: 'Missing required payroll calculation params' });
  }

  try {
    // 1. Fetch total hours worked in that month
    const attendances = await prisma.attendance.findMany({
      where: {
        tenantId: req.tenantId,
        employeeId,
        clockIn: {
          gte: new Date(`${monthYear.split('-')[1]}-${monthYear.split('-')[0]}-01`),
        },
      },
    });

    let totalHours = 0;
    attendances.forEach((att) => {
      if (att.hoursWorked) totalHours += att.hoursWorked;
    });

    const activeHourlyRate = hourlyRate ? parseFloat(hourlyRate) : 0;
    const computedHourlyWages = totalHours * activeHourlyRate;

    const baseSalaryNum = parseFloat(baseSalary);
    const allowanceNum = allowance ? parseFloat(allowance) : 0;
    const deductionNum = deductions ? parseFloat(deductions) : 0;

    const netPay = baseSalaryNum + computedHourlyWages + allowanceNum - deductionNum;

    const pay = await prisma.payroll.create({
      data: {
        tenantId: req.tenantId,
        employeeId,
        employeeName,
        monthYear,
        baseSalary: baseSalaryNum + computedHourlyWages, // Combines wage structure
        allowances: allowanceNum,
        deductions: deductionNum,
        netPay,
        payslipUrl: `/payslips/payslip_${employeeId}_${monthYear}.pdf`,
      },
    });

    res.status(201).json({
      message: 'Monthly payroll processed successfully',
      payroll: pay,
      hoursCounted: totalHours,
    });
  } catch (error: any) {
    console.error('Payroll generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/payroll', async (req: any, res: any) => {
  try {
    const list = await prisma.payroll.findMany({
      where: { tenantId: req.tenantId },
      orderBy: { generatedAt: 'desc' },
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Employee Service running on port ${PORT}`);
});
