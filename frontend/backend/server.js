import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db, initDB, getUserByEmail, createUser, getUserById, getOrders, createOrder, updateOrder } from './db.js';

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

// Simple auth helpers
function verifyAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const m = header.match(/^Bearer (.+)$/);
    if (!m) return res.status(401).json({ error: 'unauthorized' });
    const decoded = jwt.verify(m[1], JWT_SECRET);
    req.auth = { userId: decoded.sub, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({ error: 'unauthorized' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth || !roles.includes(req.auth.role)) return res.status(403).json({ error: 'forbidden' });
    next();
  };
}

async function seedUsers() {
  await db.read();
  const count = Array.isArray(db.data.users) ? db.data.users.length : 0;
  if (count > 0) return;
  const defaults = [
    { firstName: 'Jean', lastName: 'Dupont', email: 'client@example.com', role: 'customer', password: '123456' },
    { firstName: 'Emma', lastName: 'Mbappe', email: 'emp@zeduc.employe.com', role: 'employee', password: '123456' },
    { firstName: 'Paul', lastName: 'Manager', email: 'boss@zeduc.manager.com', role: 'manager', password: '123456' },
    { firstName: 'Admin', lastName: 'Root', email: 'root@zeduc.admin.com', role: 'admin', password: '123456' },
  ];
  for (const u of defaults) {
    const password_hash = await bcrypt.hash(u.password, 10);
    await createUser({
      id: uuidv4(),
      email: u.email,
      password_hash,
      first_name: u.firstName,
      last_name: u.lastName,
      role: u.role,
      phone: null,
    });
  }
  console.log('Seeded default users into JSON database');
}

function signToken(user) {
  const payload = { sub: user.id, role: user.role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function sanitizeUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    phone: row.phone || undefined,
    residence: row.residence || undefined,
    room: row.room || undefined,
    referralCode: row.referral_code || undefined,
    loyaltyPoints: row.loyalty_points || 0,
    createdAt: row.created_at,
  };
}

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, residence, room, referralCode } = req.body || {};
    if (!firstName || !lastName || !email || !password) return res.status(400).json({ error: 'missing_fields' });
    // Password validation: at least one uppercase and one digit, length >= 6
    if (!/^(?=.*[A-Z])(?=.*\d).{6,}$/.test(password)) return res.status(400).json({ error: 'weak_password' });
    const existing = getUserByEmail(email);
    if (existing) return res.status(409).json({ error: 'email_exists' });
    const password_hash = await bcrypt.hash(password, 10);
    // Referral linkage
    let referred_by = null;
    if (referralCode) {
      await db.read();
      const ref = db.data.users.find(u => u.referral_code === String(referralCode));
      if (ref) referred_by = ref.id;
    }
    const user = await createUser({ id: uuidv4(), email, password_hash, first_name: firstName, last_name: lastName, role: 'customer', phone, residence, room, referral_code: (uuidv4().slice(0, 8)).toUpperCase(), referred_by, loyalty_points: 0 });
    const san = sanitizeUser(user);
    const token = signToken(san);
    return res.json({ user: san, token });
  } catch (e) {
    return res.status(500).json({ error: 'server_error' });
  }
});

// Payment endpoint (mock)
app.post('/api/orders/:id/pay', verifyAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.read();
    const order = getOrders().find(o => o.id === id);
    if (!order) return res.status(404).json({ error: 'not_found' });
    if (order.userId !== req.auth.userId && !['employee','manager','admin'].includes(req.auth.role)) return res.status(403).json({ error: 'forbidden' });
    order.paymentStatus = 'paid';
    await db.write();
    broadcastEvent({ type: 'order_paid', orderId: id });
    return res.json({ order });
  } catch (e) {
    return res.status(500).json({ error: 'server_error' });
  }
});

// Stats endpoints
app.get('/api/stats/weekly', verifyAuth, async (req, res) => {
  try {
    await db.read();
    const now = new Date();
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0,10);
      return { key, date: key, count: 0, revenue: 0 };
    });
    for (const o of getOrders()) {
      const key = (o.created_at || '').slice(0,10);
      const slot = days.find(d => d.key === key);
      if (slot) { slot.count += 1; slot.revenue += Number(o.total || 0); }
    }
    return res.json({ days });
  } catch (e) {
    return res.status(500).json({ error: 'server_error' });
  }
});

app.get('/api/stats/overview', verifyAuth, async (req, res) => {
  try {
    await db.read();
    const orders = getOrders();
    const totalRevenue = orders.reduce((s,o)=> s + Number(o.total||0), 0);
    const totalOrders = orders.length;
    const map = new Map();
    for (const o of orders) map.set(o.userId, (map.get(o.userId)||0)+1);
    const top = Array.from(map.entries()).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([userId, count])=>({ userId, count }));
    return res.json({ totalRevenue, totalOrders, topCustomers: top });
  } catch (e) {
    return res.status(500).json({ error: 'server_error' });
  }
});

// Employee management (admin/manager)
app.get('/api/users', verifyAuth, requireRole('manager','admin'), async (req, res) => {
  await db.read();
  const role = req.query.role;
  let users = db.data.users;
  if (role) users = users.filter(u => u.role === role);
  return res.json({ users: users.map(sanitizeUser) });
});

app.post('/api/users', verifyAuth, requireRole('manager','admin'), async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body || {};
    if (!firstName || !lastName || !email || !password || !role) return res.status(400).json({ error: 'missing_fields' });
    if (!/^(?=.*[A-Z])(?=.*\d).{6,}$/.test(password)) return res.status(400).json({ error: 'weak_password' });
    const existing = getUserByEmail(email);
    if (existing) return res.status(409).json({ error: 'email_exists' });
    const password_hash = await bcrypt.hash(password, 10);
    const user = await createUser({ id: uuidv4(), email, password_hash, first_name: firstName, last_name: lastName, role, phone });
    return res.json({ user: sanitizeUser(user) });
  } catch (e) {
    return res.status(500).json({ error: 'server_error' });
  }
});

app.delete('/api/users/:id', verifyAuth, requireRole('manager','admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.read();
    const before = db.data.users.length;
    db.data.users = db.data.users.filter(u => u.id !== id);
    if (db.data.users.length === before) return res.status(404).json({ error: 'not_found' });
    await db.write();
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'server_error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'missing_fields' });
    const row = getUserByEmail(email);
    if (!row) return res.status(401).json({ error: 'invalid_credentials' });
    const ok = await bcrypt.compare(password, row.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
    const san = sanitizeUser(row);
    const token = signToken(san);
    return res.json({ user: san, token });
  } catch (e) {
    return res.status(500).json({ error: 'server_error' });
  }
});

app.get('/api/auth/me', (req, res) => {
  try {
    const header = req.headers.authorization || '';
    const m = header.match(/^Bearer (.+)$/);
    if (!m) return res.status(401).json({ error: 'unauthorized' });
    const decoded = jwt.verify(m[1], JWT_SECRET);
    const row = getUserById(decoded.sub);
    if (!row) return res.status(401).json({ error: 'unauthorized' });
    const san = sanitizeUser(row);
    return res.json({ user: san });
  } catch (e) {
    return res.status(401).json({ error: 'unauthorized' });
  }
});

// Orders API
app.post('/api/orders', verifyAuth, async (req, res) => {
  try {
    const { items, deliveryMode, arrivalTime, comment, loyaltyPointsToUse } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'empty_cart' });
    // Compute totals
    const subtotal = items.reduce((sum, it) => sum + (Number(it.price) * Number(it.quantity || 1)), 0);
    const deliveryFee = deliveryMode === 'delivery' ? 500 : 0; // flat fee example
    await db.read();
    const userRow = getUserById(req.auth.userId);
    const currentPoints = userRow?.loyalty_points || 0;
    const usePoints = Math.min(Number(loyaltyPointsToUse || 0), currentPoints);
    const discount = usePoints * 10; // 1 point = 10 FCFA discount (example)
    const total = Math.max(0, subtotal + deliveryFee - discount);
    const order = {
      id: uuidv4(),
      userId: req.auth.userId,
      items,
      subtotal,
      deliveryFee,
      discount,
      total,
      deliveryMode: deliveryMode === 'delivery' ? 'delivery' : 'onsite',
      arrivalTime: deliveryMode === 'onsite' ? (arrivalTime || null) : null,
      comment: comment || null,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    await createOrder(order);
    // Loyalty: earn points from subtotal (pre-discount)
    const earned = Math.floor(subtotal / 1000);
    const newPoints = currentPoints - usePoints + earned;
    userRow.loyalty_points = newPoints;
    // Referral bonus if this is the first order and referred_by exists
    const hasPrevious = getOrders().some(o => o.userId === req.auth.userId && o.id !== order.id);
    if (!hasPrevious && userRow.referred_by) {
      const ref = getUserById(userRow.referred_by);
      if (ref) ref.loyalty_points = (ref.loyalty_points || 0) + 5; // bonus points
    }
    await db.write();
    // Notify via SSE
    broadcastEvent({ type: 'order_created', orderId: order.id, userId: order.userId, status: order.status });
    return res.json({ order });
  } catch (e) {
    return res.status(500).json({ error: 'server_error' });
  }
});

app.patch('/api/orders/:id/status', verifyAuth, requireRole('employee','manager','admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    const allowed = ['pending','in-preparation','in-delivery','delivered','cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'invalid_status' });
    const updated = await updateOrder(id, { status });
    if (!updated) return res.status(404).json({ error: 'not_found' });
    broadcastEvent({ type: 'order_status', orderId: id, status });
    return res.json({ order: updated });
  } catch (e) {
    return res.status(500).json({ error: 'server_error' });
  }
});

// SSE notifications
const sseClients = new Set();
function broadcastEvent(payload) {
  for (const res of sseClients) {
    try { res.write(`data: ${JSON.stringify(payload)}\n\n`); } catch {}
  }
}

app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();
  res.write(`data: ${JSON.stringify({ type: 'hello' })}\n\n`);
  sseClients.add(res);
  req.on('close', () => { sseClients.delete(res); });
});

initDB().then(() => seedUsers()).then(() => {
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
});
