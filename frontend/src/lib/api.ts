const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

async function request(path: string, options: RequestInit = {}, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as any),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  console.log('API Request:', { url: `${BASE_URL}${path}`, method: options.method, body: options.body });

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  
  console.log('API Response:', { status: res.status, statusText: res.statusText });

  if (!res.ok) {
    let msg: any = undefined;
    try { msg = await res.json(); } catch {}
    console.error('API Error:', { status: res.status, body: msg });
    throw Object.assign(new Error('Request failed'), { status: res.status, body: msg });
  }
  return res.json();
}

export type LoginResponse = { user: { id: string; email: string; name: string; firstName: string; lastName: string; role: 'student'|'employee'|'manager'|'admin'; phone?: string; residence?: string; room?: string; referralCode?: string; loyaltyPoints?: number; createdAt: string }; token: string };

export async function apiLogin(email: string, password: string): Promise<LoginResponse> {
  return request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
}

export async function apiSignup(params: { firstName: string; lastName: string; email: string; password: string; phone?: string; residence?: string; room?: string; referralCode?: string }): Promise<LoginResponse> {
  return request('/api/auth/register', { method: 'POST', body: JSON.stringify(params) });
}

export async function apiMe(token: string): Promise<{ user: LoginResponse['user'] }> {
  return request('/api/auth/me', { method: 'GET' }, token);
}

export type OrderItemInput = { id: string; name: string; price: number; quantity: number };
export type CreateOrderInput = {
  items: { menu_item_id: string; quantity: number; price: number }[];
  delivery_type: 'delivery' | 'on_site';
  delivery_address?: string;
  delivery_time?: string;
  comment?: string;
  points_to_use?: number;
};
export type OrderResponse = { order: { id: string; userId: string; items: OrderItemInput[]; subtotal: number; deliveryFee: number; discount: number; total: number; deliveryMode: 'delivery'|'onsite'; arrivalTime?: string|null; comment?: string|null; status: 'pending'|'in-preparation'|'in-delivery'|'delivered'|'cancelled'; created_at: string } };

export async function apiCreateOrder(input: CreateOrderInput, token: string): Promise<OrderResponse> {
  const payload = {
    ...input,
  };
  return request('/api/orders', { method: 'POST', body: JSON.stringify(payload) }, token);
}

export async function apiUpdateOrderStatus(orderId: string, status: 'pending'|'in-preparation'|'in-delivery'|'delivered'|'cancelled', token: string): Promise<OrderResponse> {
  return request(`/api/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, token);
}

export async function apiPayOrder(orderId: string, token: string): Promise<OrderResponse> {
  return request(`/api/orders/${orderId}/pay`, { method: 'POST' }, token);
}

// Users (admin/manager)
export type UserSummary = { id: string; email: string; name: string; role: 'student'|'employee'|'manager'|'admin'; phone?: string; createdAt: string };
export async function apiGetUsers(role: 'employee'|'manager'|'admin'|'student'|undefined, token: string): Promise<{ users: UserSummary[] }> {
  const q = role ? `?role=${encodeURIComponent(role)}` : '';
  return request(`/api/users${q}`, { method: 'GET' }, token);
}
export async function apiCreateUser(input: { name: string; email: string; password: string; phone?: string; role: 'employee'|'manager'|'admin' }, token: string): Promise<{ user: UserSummary }> {
  return request(`/api/users`, { method: 'POST', body: JSON.stringify(input) }, token);
}
export async function apiDeleteUser(id: string, token: string): Promise<{ ok: boolean }> {
  return request(`/api/users/${id}`, { method: 'DELETE' }, token);
}

// Stats
export async function apiStatsWeekly(token: string): Promise<{ days: { key: string; date: string; count: number; revenue: number }[] }> {
  return request(`/api/stats/weekly`, { method: 'GET' }, token);
}
export async function apiStatsOverview(token: string): Promise<{ totalRevenue: number; totalOrders: number; topCustomers: { userId: string; count: number }[] }> {
  return request(`/api/stats/overview`, { method: 'GET' }, token);
}

// Orders list (if API available)
export type OrderListItem = OrderResponse['order'];
export async function apiListOrders(token: string): Promise<{ orders: OrderListItem[] }> {
  return request(`/api/orders`, { method: 'GET' }, token);
}
