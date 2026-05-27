/**
 * CAOCAO POS - Central API Client
 * Manages communication with the 5 core microservices.
 */

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:4001';
const ORDER_URL = process.env.NEXT_PUBLIC_ORDER_SERVICE_URL || 'http://localhost:4002';
const INVENTORY_URL = process.env.NEXT_PUBLIC_INVENTORY_SERVICE_URL || 'http://localhost:4003';
const SHIFT_URL = process.env.NEXT_PUBLIC_SHIFT_SERVICE_URL || 'http://localhost:4004';
const EMPLOYEE_URL = process.env.NEXT_PUBLIC_EMPLOYEE_SERVICE_URL || 'http://localhost:4005';

interface RequestOptions extends RequestInit {
  tenantId?: string;
  useAuth?: boolean;
}

async function apiRequest(baseUrl: string, endpoint: string, options: RequestOptions = {}) {
  const { tenantId, useAuth = true, ...fetchOptions } = options;
  
  const headers = new Headers(fetchOptions.headers || {});
  headers.set('Content-Type', 'application/json');
  
  if (tenantId) {
    headers.set('X-Tenant-ID', tenantId);
  } else {
    const storedTenantId = localStorage.getItem('pos_tenant_id');
    if (storedTenantId) headers.set('X-Tenant-ID', storedTenantId);
  }

  if (useAuth) {
    const token = localStorage.getItem('pos_token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  auth: {
    register: (data: any) => apiRequest(AUTH_URL, '/register', { method: 'POST', body: JSON.stringify(data), useAuth: false }),
    login: (data: any) => apiRequest(AUTH_URL, '/login', { method: 'POST', body: JSON.stringify(data), useAuth: false }),
    loginPin: (data: any) => apiRequest(AUTH_URL, '/login-pin', { method: 'POST', body: JSON.stringify(data), useAuth: false }),
    getUsers: () => apiRequest(AUTH_URL, '/users'),
    createUser: (data: any) => apiRequest(AUTH_URL, '/users', { method: 'POST', body: JSON.stringify(data) }),
  },
  
  order: {
    getTables: () => apiRequest(ORDER_URL, '/tables'),
    createTable: (data: any) => apiRequest(ORDER_URL, '/tables', { method: 'POST', body: JSON.stringify(data) }),
    updateTable: (id: string, data: any) => apiRequest(ORDER_URL, `/tables/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    createOrder: (data: any) => apiRequest(ORDER_URL, '/orders', { method: 'POST', body: JSON.stringify(data) }),
    syncOrders: (orders: any[]) => apiRequest(ORDER_URL, '/orders/sync', { method: 'POST', body: JSON.stringify({ orders }) }),
    getPendingOrders: () => apiRequest(ORDER_URL, '/orders/pending'),
    getKdsTickets: (category?: string) => apiRequest(ORDER_URL, `/kds/tickets${category ? `?category=${category}` : ''}`),
    updateKdsTicket: (id: string, status: string) => apiRequest(ORDER_URL, `/kds/tickets/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    updateKdsItem: (id: string, isCompleted: boolean) => apiRequest(ORDER_URL, `/kds/items/${id}`, { method: 'PATCH', body: JSON.stringify({ isCompleted }) }),
    splitOrder: (id: string, splitOrders: any[]) => apiRequest(ORDER_URL, `/orders/${id}/split`, { method: 'POST', body: JSON.stringify({ splitOrders }) }),
  },

  inventory: {
    getIngredients: () => apiRequest(INVENTORY_URL, '/ingredients'),
    createIngredient: (data: any) => apiRequest(INVENTORY_URL, '/ingredients', { method: 'POST', body: JSON.stringify(data) }),
    updateIngredient: (id: string, data: any) => apiRequest(INVENTORY_URL, `/ingredients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    getProducts: () => apiRequest(INVENTORY_URL, '/products'),
    createProduct: (data: any) => apiRequest(INVENTORY_URL, '/products', { method: 'POST', body: JSON.stringify(data) }),
    logWaste: (data: any) => apiRequest(INVENTORY_URL, '/waste', { method: 'POST', body: JSON.stringify(data) }),
    getWasteLogs: () => apiRequest(INVENTORY_URL, '/waste'),
  },

  shift: {
    getActiveShift: (cashierId?: string) => apiRequest(SHIFT_URL, `/shifts/active${cashierId ? `?cashierId=${cashierId}` : ''}`),
    openShift: (data: any) => apiRequest(SHIFT_URL, '/shifts/open', { method: 'POST', body: JSON.stringify(data) }),
    closeShift: (id: string, data: any) => apiRequest(SHIFT_URL, `/shifts/${id}/close`, { method: 'POST', body: JSON.stringify(data) }),
    getShifts: () => apiRequest(SHIFT_URL, '/shifts'),
  },

  employee: {
    getSchedules: () => apiRequest(EMPLOYEE_URL, '/schedules'),
    createSchedule: (data: any) => apiRequest(EMPLOYEE_URL, '/schedules', { method: 'POST', body: JSON.stringify(data) }),
    clockIn: (data: any) => apiRequest(EMPLOYEE_URL, '/attendance/clock-in', { method: 'POST', body: JSON.stringify(data) }),
    clockOut: (data: any) => apiRequest(EMPLOYEE_URL, '/attendance/clock-out', { method: 'POST', body: JSON.stringify(data) }),
    getAttendance: () => apiRequest(EMPLOYEE_URL, '/attendance'),
    generatePayroll: (data: any) => apiRequest(EMPLOYEE_URL, '/payroll/generate', { method: 'POST', body: JSON.stringify(data) }),
    getPayroll: () => apiRequest(EMPLOYEE_URL, '/payroll'),
  }
};
