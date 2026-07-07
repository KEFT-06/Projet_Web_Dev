import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data.json');

const adapter = new JSONFile(dbPath);
export const db = new Low(adapter, { users: [], orders: [] });

export async function initDB() {
  await db.read();
  if (!db.data) db.data = { users: [], orders: [] };
  if (!Array.isArray(db.data.users)) db.data.users = [];
  if (!Array.isArray(db.data.orders)) db.data.orders = [];
  await db.write();
}

export function getUserByEmail(email) {
  return db.data.users.find((u) => u.email === email) || null;
}

export function getUserById(id) {
  return db.data.users.find((u) => u.id === id) || null;
}

export async function createUser({ id, email, password_hash, first_name, last_name, role, phone, residence, room, referral_code, referred_by, loyalty_points }) {
  const created_at = new Date().toISOString();
  const row = { id, email, password_hash, first_name, last_name, role, phone: phone || null, residence: residence || null, room: room || null, referral_code: referral_code || null, referred_by: referred_by || null, loyalty_points: typeof loyalty_points === 'number' ? loyalty_points : 0, created_at };
  db.data.users.push(row);
  await db.write();
  return row;
}

export async function updateUser(id, patch) {
  const idx = db.data.users.findIndex((u) => u.id === id);
  if (idx === -1) return null;
  db.data.users[idx] = { ...db.data.users[idx], ...patch };
  await db.write();
  return db.data.users[idx];
}

// Orders helpers
export function getOrders() {
  return db.data.orders;
}

export function getOrderById(id) {
  return db.data.orders.find((o) => o.id === id) || null;
}

export async function createOrder(order) {
  db.data.orders.push(order);
  await db.write();
  return order;
}

export async function updateOrder(id, patch) {
  const idx = db.data.orders.findIndex((o) => o.id === id);
  if (idx === -1) return null;
  db.data.orders[idx] = { ...db.data.orders[idx], ...patch };
  await db.write();
  return db.data.orders[idx];
}
