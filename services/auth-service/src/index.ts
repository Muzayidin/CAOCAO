import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from './generated/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4001;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_pos_key';

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({ service: 'auth-service', status: 'UP' });
});

// Middleware to authenticate JWT
export const authenticateJWT = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// 1. Register a new Cafe (Tenant) and Owner
app.post('/register', async (req: any, res: any) => {
  const { cafeName, address, phone, name, email, password } = req.body;

  if (!cafeName || !name || !email || !password) {
    return res.status(400).json({ error: 'Missing required registration parameters' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create Tenant and Owner user atomically
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          cafeName,
          address,
          phone,
        },
      });

      const owner = await tx.user.create({
        data: {
          tenantId: tenant.id,
          name,
          email,
          passwordHash,
          role: 'OWNER',
          pinCode: '123456', // Default PIN code
        },
      });

      return { tenant, owner };
    });

    const token = jwt.sign(
      {
        userId: result.owner.id,
        tenantId: result.tenant.id,
        role: result.owner.role,
        name: result.owner.name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Tenant and Owner registered successfully',
      token,
      user: {
        id: result.owner.id,
        name: result.owner.name,
        email: result.owner.email,
        role: result.owner.role,
        tenantId: result.tenant.id,
        cafeName: result.tenant.cafeName,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. Login via Email & Password
app.post('/login', async (req: any, res: any) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials or inactive account' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenantId,
        role: user.role,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        cafeName: user.tenant.cafeName,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. Quick PIN Login for active terminals (Cashier/Waiter/Kitchen)
app.post('/login-pin', async (req: any, res: any) => {
  const { pinCode, tenantId } = req.body;

  if (!pinCode || !tenantId) {
    return res.status(400).json({ error: 'PIN Code and Tenant ID are required' });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        tenantId,
        pinCode,
        isActive: true,
      },
      include: { tenant: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid PIN' });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenantId,
        role: user.role,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'PIN Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        cafeName: user.tenant.cafeName,
      },
    });
  } catch (error) {
    console.error('PIN Login error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4. Invite/Add User (RBAC Restricted - Admin & Owner only)
app.post('/users', authenticateJWT, async (req: any, res: any) => {
  const { role: requesterRole, tenantId } = req.user;
  const { email, password, name, role, pinCode } = req.body;

  if (requesterRole !== 'OWNER' && requesterRole !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
  }

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        tenantId,
        email,
        passwordHash,
        name,
        role,
        pinCode: pinCode || '1234',
      },
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        pinCode: newUser.pinCode,
      },
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 5. Get Users list (For Owner/Admin Settings panel)
app.get('/users', authenticateJWT, async (req: any, res: any) => {
  const { role, tenantId } = req.user;

  if (role !== 'OWNER' && role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const users = await prisma.user.findMany({
      where: { tenantId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        pinCode: true,
        isActive: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});
