// LocalStorage utilities for persisting data

import type {
  User,
  MenuItem,
  Order,
  Complaint,
  Event,
  Employee,
  DailyMenu,
} from './mockData';
import {
  mockUsers,
  mockMenuItems,
  mockOrders,
  mockComplaints,
  mockEvents,
  mockEmployees,
} from './mockData';

const DATA_VERSION = '3';

const STORAGE_KEYS = {
  USERS: 'restaurant_users',
  MENU_ITEMS: 'restaurant_menu',
  ORDERS: 'restaurant_orders',
  COMPLAINTS: 'restaurant_complaints',
  EVENTS: 'restaurant_events',
  EMPLOYEES: 'restaurant_employees',
  CURRENT_USER: 'restaurant_current_user',
  USER_FAVORITES: 'user_favorites',
  REMEMBER_ME: 'restaurant_remember_me',
  DATA_VERSION: 'restaurant_data_version',
  DAILY_MENU: 'restaurant_daily_menu',
};

// Initialize data if not exists
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MENU_ITEMS)) {
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(mockMenuItems));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(mockOrders));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMPLAINTS)) {
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(mockComplaints));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(mockEvents));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) {
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(mockEmployees));
  }

  try {
    const storedVersion = localStorage.getItem(STORAGE_KEYS.DATA_VERSION);
    const raw = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
    const items = raw ? JSON.parse(raw) : [];
    const invalid = !Array.isArray(items) || items.some((it: any) => {
      if (!it || typeof it !== 'object') return true;
      const img = it.image;
      if (!img || typeof img !== 'string') return true;
      if (img.startsWith('data:')) return false;
      return !img.startsWith('/data/images/');
    });
    if (storedVersion !== DATA_VERSION || invalid) {
      localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(mockMenuItems));
      localStorage.setItem(STORAGE_KEYS.DATA_VERSION, DATA_VERSION);
    }
  } catch {
    localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(mockMenuItems));
    localStorage.setItem(STORAGE_KEYS.DATA_VERSION, DATA_VERSION);
  }
};

// Users
export const getUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!data) return [];
  const users = JSON.parse(data);
  return users.map((user: any) => ({
    ...user,
    hireDate: user.hireDate ? new Date(user.hireDate) : undefined,
    createdAt: user.createdAt ? new Date(user.createdAt) : undefined,
    lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined,
    lastLogout: user.lastLogout ? new Date(user.lastLogout) : undefined,
    loginHistory: user.loginHistory ? user.loginHistory.map((entry: any) => ({
      login: new Date(entry.login),
      logout: entry.logout ? new Date(entry.logout) : undefined
    })) : [],
    timeSpent: user.timeSpent || 0
  }));
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

// Track employee login
export const trackEmployeeLogin = (userId: string) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    const now = new Date();
    users[userIndex].lastLogin = now;
    
    // Initialize login history if not exists
    if (!users[userIndex].loginHistory) {
      users[userIndex].loginHistory = [];
    }
    
    // Add new login session
    users[userIndex].loginHistory!.push({ login: now });
    
    saveUsers(users);
  }
};

// Track employee logout and calculate time spent
export const trackEmployeeLogout = (userId: string) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex !== -1) {
    const now = new Date();
    users[userIndex].lastLogout = now;
    
    // Update last session with logout time
    if (users[userIndex].loginHistory && users[userIndex].loginHistory!.length > 0) {
      const lastSession = users[userIndex].loginHistory![users[userIndex].loginHistory!.length - 1];
      lastSession.logout = now;
      
      // Calculate time spent in this session (in milliseconds)
      const sessionTime = now.getTime() - lastSession.login.getTime();
      
      // Add to total time spent
      if (!users[userIndex].timeSpent) {
        users[userIndex].timeSpent = 0;
      }
      users[userIndex].timeSpent! += sessionTime;
    }
    
    saveUsers(users);
  }
};

// Get currently connected employees (logged in within last 5 minutes)
export const getConnectedEmployees = (): User[] => {
  const users = getUsers();
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  
  return users.filter(user => {
    if (user.role !== 'employee' && user.role !== 'manager') return false;
    if (!user.lastLogin) return false;
    
    const lastLogin = new Date(user.lastLogin);
    const lastLogout = user.lastLogout ? new Date(user.lastLogout) : null;
    
    // User is connected if they logged in recently and haven't logged out since
    return lastLogin > fiveMinutesAgo && (!lastLogout || lastLogout < lastLogin);
  });
};

export const addUser = (user: User) => {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
};

// Menu Items
export const getMenuItems = (): MenuItem[] => {
  const data = localStorage.getItem(STORAGE_KEYS.MENU_ITEMS);
  return data ? JSON.parse(data) : [];
};

export const saveMenuItems = (items: MenuItem[]) => {
  localStorage.setItem(STORAGE_KEYS.MENU_ITEMS, JSON.stringify(items));
};

export const rebuildMenuFromPublicJson = async (): Promise<void> => {
  try {
    const url = `${(import.meta as any).env?.BASE_URL || import.meta.env.BASE_URL || '/'}data/menu_display.json`;
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();
    const list: MenuItem[] = [];
    let i = 1;
    const pushItems = (arr: any[], category: 'starter'|'main'|'drink') => {
      if (!Array.isArray(arr)) return;
      for (const it of arr) {
        const id = `auto_${category}_${i++}`;
        list.push({
          id,
          name: it.titre || it.title || 'Item',
          category,
          price: typeof it.prix === 'number' ? it.prix : Number(it.prix) || 0,
          description: it.description || '',
          image: `/data/images/${it.fichier}`,
          available: true,
          inStock: true,
        });
      }
    };
    pushItems(data?.entrees, 'starter');
    pushItems(data?.plats, 'main');
    pushItems(data?.boissons, 'drink');
    if (list.length > 0) {
      saveMenuItems(list);
      localStorage.setItem(STORAGE_KEYS.DATA_VERSION, DATA_VERSION);
    }
  } catch {}
};

// Orders
export const getOrders = (): Order[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
  if (!data) return [];
  const orders = JSON.parse(data);
  return orders.map((order: any) => ({
    ...order,
    timestamp: new Date(order.timestamp),
  }));
};

export const saveOrders = (orders: Order[]) => {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
};

export const addOrder = (order: Order) => {
  const orders = getOrders();
  orders.push(order);
  saveOrders(orders);
};

// Complaints
export const getComplaints = (): Complaint[] => {
  const data = localStorage.getItem(STORAGE_KEYS.COMPLAINTS);
  if (!data) return [];
  const complaints = JSON.parse(data);
  return complaints.map((complaint: any) => ({
    ...complaint,
    timestamp: new Date(complaint.timestamp),
  }));
};

export const saveComplaints = (complaints: Complaint[]) => {
  localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints));
};

export const addComplaint = (complaint: Complaint) => {
  const complaints = getComplaints();
  complaints.push(complaint);
  saveComplaints(complaints);
};

// Events
export const getEvents = (): Event[] => {
  const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
  if (!data) return [];
  const events = JSON.parse(data);
  return events.map((event: any) => ({
    ...event,
    date: new Date(event.date),
  }));
};

export const saveEvents = (events: Event[]) => {
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
};

export const addEvent = (event: Event) => {
  const events = getEvents();
  events.push(event);
  saveEvents(events);
};

// Employees
export const getEmployees = (): Employee[] => {
  const data = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
  if (!data) return [];
  const employees = JSON.parse(data);
  return employees.map((emp: any) => ({
    ...emp,
    hireDate: new Date(emp.hireDate),
  }));
};

export const saveEmployees = (employees: Employee[]) => {
  localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
};

// Current User
export const getCurrentUser = (): User | null => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : null;
};

export const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

// Loyalty and Referral Functions
export const updateUserLoyaltyPoints = (userId: string, pointsToAdd: number) => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex].loyaltyPoints += pointsToAdd;
    saveUsers(users);
    return users[userIndex];
  }
  return null;
};

export const getUserByReferralCode = (referralCode: string): User | null => {
  const users = getUsers();
  return users.find(u => u.referralCode === referralCode) || null;
};

export const processReferralSignup = (newUser: User, referralCode: string): boolean => {
  const referrer = getUserByReferralCode(referralCode);
  if (referrer && referrer.id !== newUser.id) {
    // Just set referredBy for new user - points awarded on first order
    newUser.referredBy = referrer.id;
    return true;
  }
  return false;
};

export const processReferralReward = (userId: string): boolean => {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (user && user.referredBy) {
    // Check if this is the user's first order
    const orders = getOrders();
    const userOrders = orders.filter(o => o.customerId === userId);
    if (userOrders.length === 1) { // First order
      updateUserLoyaltyPoints(user.referredBy, 2);
      return true;
    }
  }
  return false;
};

// Favorites Functions
export const getUserFavorites = (userId: string): string[] => {
  const data = localStorage.getItem(`user_favorites_${userId}`);
  return data ? JSON.parse(data) : [];
};

export const addUserFavorite = (userId: string, itemId: string) => {
  const favorites = getUserFavorites(userId);
  if (!favorites.includes(itemId)) {
    favorites.push(itemId);
    localStorage.setItem(`user_favorites_${userId}`, JSON.stringify(favorites));
  }
};

export const removeUserFavorite = (userId: string, itemId: string) => {
  const favorites = getUserFavorites(userId);
  const updatedFavorites = favorites.filter(id => id !== itemId);
  localStorage.setItem(`user_favorites_${userId}`, JSON.stringify(updatedFavorites));
};

// Remember Me Functions
export const getRememberMeCredentials = (): { email: string; password: string } | null => {
  const data = localStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
  return data ? JSON.parse(data) : null;
};

export const setRememberMeCredentials = (email: string, password: string) => {
  localStorage.setItem(STORAGE_KEYS.REMEMBER_ME, JSON.stringify({ email, password }));
};

export const clearRememberMeCredentials = () => {
  localStorage.removeItem(STORAGE_KEYS.REMEMBER_ME);
};

// Password Reset Functions
export const generatePasswordResetToken = (email: string): string => {
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const resetRequests = JSON.parse(localStorage.getItem('password_reset_tokens') || '{}');
  
  // Token valide pour 1 heure (timestamp en ms)
  resetRequests[email] = {
    token,
    expires: Date.now() + 60 * 60 * 1000,
    used: false
  };
  
  localStorage.setItem('password_reset_tokens', JSON.stringify(resetRequests));
  return token;
};

export const validatePasswordResetToken = (email: string, token: string): boolean => {
  const resetRequests = JSON.parse(localStorage.getItem('password_reset_tokens') || '{}');
  const request = resetRequests[email];
  
  if (!request) return false;
  if (request.used) return false;
  if (request.expires < Date.now()) return false;
  if (request.token !== token) return false;
  
  return true;
};

export const changeUserPassword = (email: string, newPassword: string, token?: string): boolean => {
  // Si un token est fourni, valider d'abord
  if (token) {
    const isValid = validatePasswordResetToken(email, token);
    if (!isValid) return false;
    
    // Marquer le token comme utilisé
    const resetRequests = JSON.parse(localStorage.getItem('password_reset_tokens') || '{}');
    if (resetRequests[email]) {
      resetRequests[email].used = true;
      localStorage.setItem('password_reset_tokens', JSON.stringify(resetRequests));
    }
  }
  
  // Changer le mot de passe
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email === email);
  
  if (userIndex === -1) return false;
  
  users[userIndex].password = newPassword;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  
  return true;
};

// Daily Menu Functions
export const getTodaysDailyMenu = (): DailyMenu | null => {
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const data = localStorage.getItem(STORAGE_KEYS.DAILY_MENU);
  if (!data) return null;
  
  const dailyMenus: DailyMenu[] = JSON.parse(data);
  return dailyMenus.find(menu => menu.date === today) || null;
};

export const getAllDailyMenus = (): DailyMenu[] => {
  const data = localStorage.getItem(STORAGE_KEYS.DAILY_MENU);
  if (!data) return [];
  
  const menus = JSON.parse(data);
  return menus.map((menu: any) => ({
    ...menu,
    createdAt: new Date(menu.createdAt)
  }));
};

export const saveDailyMenu = (dailyMenu: DailyMenu) => {
  const allMenus = getAllDailyMenus();
  const today = new Date().toISOString().split('T')[0];
  
  // Remove existing menu for today if any
  const filtered = allMenus.filter(menu => menu.date !== today);
  
  // Add new menu
  filtered.push(dailyMenu);
  
  localStorage.setItem(STORAGE_KEYS.DAILY_MENU, JSON.stringify(filtered));
};

export const deleteDailyMenu = (date: string) => {
  const allMenus = getAllDailyMenus();
  const filtered = allMenus.filter(menu => menu.date !== date);
  localStorage.setItem(STORAGE_KEYS.DAILY_MENU, JSON.stringify(filtered));
};

// Get menu items that are in today's daily menu
export const getTodaysDishesOfTheDay = (): MenuItem[] => {
  const dailyMenu = getTodaysDailyMenu();
  if (!dailyMenu) return [];
  
  const allItems = getMenuItems();
  const dailyItemIds = [
    ...dailyMenu.starters,
    ...dailyMenu.mains,
    ...dailyMenu.drinks
  ];
  
  return allItems.filter(item => dailyItemIds.includes(item.id));
};
