// Service pour gérer les mises à jour en temps réel
import type { User, Order, MenuItem } from './mockData';
import { mockMenuItems, mockUsers } from './mockData';

interface RealTimeData {
  currentUser: User | null;
  activeOrders: Order[];
  onlineUsers: string[];
  connectedEmployees: Array<{
    id: string;
    firstName: string;
    lastName: string;
    position: string;
    role: string;
    lastSeen: Date;
    lastLogin?: Date;
    timeSpent?: number;
  }>;
  notifications: Array<{
    id: string;
    userId: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>;
  menuUpdates: {
    lastUpdate: Date;
    updatedItems: MenuItem[];
  };
  userStats: {
    loyaltyPoints: number;
    referralCode: string;
    referralPoints: number;
    lastOrder?: Order;
  };
}

class RealTimeService {
  private static instance: RealTimeService;
  private subscribers: Map<string, (data: Partial<RealTimeData>) => void>;
  private data: RealTimeData;
  private updateInterval: number | null;

  private constructor() {
    this.subscribers = new Map();
    this.data = {
      currentUser: null,
      activeOrders: [],
      onlineUsers: [],
      connectedEmployees: [],
      notifications: [],
      menuUpdates: {
        lastUpdate: new Date(),
        updatedItems: []
      },
      userStats: {
        loyaltyPoints: 0,
        referralCode: '',
        referralPoints: 0
      }
    };
    this.updateInterval = null;
  }

  public static getInstance(): RealTimeService {
    if (!RealTimeService.instance) {
      RealTimeService.instance = new RealTimeService();
    }
    return RealTimeService.instance;
  }

  public startUpdates() {
    if (this.updateInterval) return;
    this.updateInterval = setInterval(() => this.simulateUpdates(), 5000);
  }

  public stopUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  public subscribe(id: string, callback: (data: Partial<RealTimeData>) => void) {
    this.subscribers.set(id, callback);
    callback(this.data); // Envoyer les données initiales
    return () => {
      this.subscribers.delete(id);
    };
  }

  public updateData(partialData: Partial<RealTimeData>) {
    this.data = { ...this.data, ...partialData };
    this.notifySubscribers(partialData);
  }

  private notifySubscribers(data: Partial<RealTimeData>) {
    this.subscribers.forEach(callback => callback(data));
  }

  private simulateUpdates() {
    // Simuler des mises à jour aléatoires pour la démonstration
    const updates: Partial<RealTimeData> = {
      menuUpdates: {
        lastUpdate: new Date(),
        updatedItems: this.data.menuUpdates.updatedItems
      }
    };

    // Simulate connected employees
    const mockEmployees = [
      { id: 'emp1', firstName: 'Pierre', lastName: 'Dubois', position: 'cook', role: 'employee' },
      { id: 'emp2', firstName: 'Marie', lastName: 'Martin', position: 'server', role: 'employee' },
      { id: 'emp3', firstName: 'Luc', lastName: 'Bernard', position: 'delivery', role: 'employee' },
      { id: 'emp4', firstName: 'Sophie', lastName: 'Garcia', position: 'manager', role: 'manager' },
      { id: 'emp5', firstName: 'Jean', lastName: 'Leroy', position: 'cook', role: 'employee' }
    ];

    // Randomly select some employees as connected
    const connectedCount = Math.floor(Math.random() * 4) + 1; // 1-4 employees
    const shuffled = [...mockEmployees].sort(() => 0.5 - Math.random());
    updates.connectedEmployees = shuffled.slice(0, connectedCount).map(emp => ({
      ...emp,
      lastSeen: new Date()
    }));

    if (Math.random() > 0.7) { // 30% de chance d'avoir une nouvelle notification
      updates.notifications = [...this.data.notifications, {
        id: Date.now().toString(),
        userId: this.data.currentUser?.id || '',
        message: 'Nouvelle mise à jour du menu !',
        timestamp: new Date(),
        read: false
      }];
    }

    if (Math.random() > 0.8) { // 20% de chance de mettre à jour les points
      updates.userStats = {
        ...this.data.userStats,
        loyaltyPoints: this.data.userStats.loyaltyPoints + Math.floor(Math.random() * 10)
      };
    }

    this.updateData(updates);
  }

  public setCurrentUser(user: User | null) {
    this.updateData({ currentUser: user });
    if (user) {
      this.startUpdates();
    } else {
      this.stopUpdates();
    }
  }

  public addOrder(order: Order) {
    const activeOrders = [...this.data.activeOrders, order];
    this.updateData({ activeOrders });
  }

  public updateOrderStatus(orderId: string, status: Order['status']) {
    const activeOrders = this.data.activeOrders.map(order => 
      order.id === orderId ? { ...order, status } : order
    );
    this.updateData({ activeOrders });
  }

  public markNotificationAsRead(notificationId: string) {
    const notifications = this.data.notifications.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    this.updateData({ notifications });
  }
}

export const realTimeService = RealTimeService.getInstance();