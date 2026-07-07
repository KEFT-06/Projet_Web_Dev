/**
 * Service de notifications temps réel
 * Simule les notifications WebSocket en utilisant localStorage et des events
 * En production, remplacer par Socket.io
 */

import { toast } from 'sonner';
import type { User, Order, Complaint } from './mockData';

export type NotificationType = 
  | 'order:new'
  | 'order:status'
  | 'complaint:new'
  | 'complaint:response'
  | 'promotion:new'
  | 'menu:updated'
  | 'refund:processed'
  | 'admin:message';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  from: {
    name: string;
    role: string;
    email: string;
  };
  to: string[]; // user IDs ou roles
  data?: any;
  timestamp: Date;
  read: boolean;
}

class NotificationService {
  private listeners: Map<string, Set<(notification: Notification) => void>> = new Map();
  private notifications: Notification[] = [];
  private currentUser: User | null = null;
  private storageKey = 'restaurant_notifications';
  private pollInterval: number | null = null;

  constructor() {
    this.loadNotifications();
    this.startPolling();
  }

  // Charger les notifications depuis localStorage
  private loadNotifications() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.notifications = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      this.notifications = [];
    }
  }

  // Sauvegarder les notifications
  private saveNotifications() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  // Définir l'utilisateur actuel
  setCurrentUser(user: User | null) {
    this.currentUser = user;
  }

  // S'abonner aux notifications
  subscribe(userId: string, callback: (notification: Notification) => void) {
    if (!this.listeners.has(userId)) {
      this.listeners.set(userId, new Set());
    }
    this.listeners.get(userId)!.add(callback);

    // Retourner fonction de désabonnement
    return () => {
      const userListeners = this.listeners.get(userId);
      if (userListeners) {
        userListeners.delete(callback);
        if (userListeners.size === 0) {
          this.listeners.delete(userId);
        }
      }
    };
  }

  // Envoyer une notification
  send(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };

    this.notifications.push(newNotification);
    this.saveNotifications();
    this.broadcast(newNotification);

    // Afficher toast si destinataire actuel
    if (this.currentUser && this.isRecipient(this.currentUser, newNotification)) {
      this.showToast(newNotification);
    }
  }

  // Vérifier si l'utilisateur est destinataire
  private isRecipient(user: User, notification: Notification): boolean {
    return notification.to.includes(user.id) || 
           notification.to.includes(user.role) ||
           notification.to.includes('all');
  }

  // Diffuser la notification aux abonnés
  private broadcast(notification: Notification) {
    notification.to.forEach(recipient => {
      const listeners = this.listeners.get(recipient);
      if (listeners) {
        listeners.forEach(callback => callback(notification));
      }
    });

    // Diffuser aussi par rôle
    if (this.currentUser) {
      const roleListeners = this.listeners.get(this.currentUser.role);
      if (roleListeners) {
        roleListeners.forEach(callback => callback(notification));
      }
    }
  }

  // Afficher toast notification
  private showToast(notification: Notification) {
    const toastOptions = {
      duration: 5000,
      description: `De: ${notification.from.name} (${notification.from.role})`
    };

    switch (notification.type) {
      case 'order:new':
        toast.success(notification.message, toastOptions);
        break;
      case 'order:status':
        toast.info(notification.message, toastOptions);
        break;
      case 'complaint:new':
      case 'complaint:response':
        toast.warning(notification.message, toastOptions);
        break;
      case 'promotion:new':
        toast(notification.message, {
          ...toastOptions,
          icon: '🎉'
        });
        break;
      case 'refund:processed':
        toast.success(notification.message, toastOptions);
        break;
      case 'admin:message':
        toast.message(notification.message, {
          ...toastOptions,
          duration: 10000
        });
        break;
      default:
        toast(notification.message, toastOptions);
    }
  }

  // Récupérer les notifications pour un utilisateur
  getUserNotifications(userId: string, role: string): Notification[] {
    return this.notifications.filter(n => 
      n.to.includes(userId) || 
      n.to.includes(role) || 
      n.to.includes('all')
    ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Marquer comme lu
  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  // Marquer toutes comme lues
  markAllAsRead(userId: string, role: string) {
    this.notifications.forEach(n => {
      if (n.to.includes(userId) || n.to.includes(role) || n.to.includes('all')) {
        n.read = true;
      }
    });
    this.saveNotifications();
  }

  // Supprimer les anciennes notifications (>7 jours)
  cleanOldNotifications() {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    this.notifications = this.notifications.filter(n => 
      n.timestamp > oneWeekAgo
    );
    this.saveNotifications();
  }

  // Polling pour simuler temps réel (en attendant WebSocket)
  private startPolling() {
    // Vérifier les nouvelles notifications toutes les 5 secondes
    this.pollInterval = window.setInterval(() => {
      this.loadNotifications();
      
      if (this.currentUser) {
        const unread = this.getUserNotifications(
          this.currentUser.id, 
          this.currentUser.role
        ).filter(n => !n.read);
        
        // Diffuser les nouvelles notifications non lues
        unread.forEach(n => {
          if (this.shouldShowNotification(n)) {
            this.broadcast(n);
          }
        });
      }
    }, 5000);
  }

  private shouldShowNotification(notification: Notification): boolean {
    // Vérifier si la notification a moins de 10 secondes
    const tenSecondsAgo = new Date();
    tenSecondsAgo.setSeconds(tenSecondsAgo.getSeconds() - 10);
    return notification.timestamp > tenSecondsAgo;
  }

  // Arrêter le polling
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  // Obtenir le nombre de non lues
  getUnreadCount(userId: string, role: string): number {
    return this.getUserNotifications(userId, role).filter(n => !n.read).length;
  }
}

// Instance singleton
export const notificationService = new NotificationService();

// Helper functions pour envoyer des notifications spécifiques

export const notifyNewOrder = (order: Order, fromUser: User) => {
  notificationService.send({
    type: 'order:new',
    title: 'Nouvelle Commande',
    message: `Nouvelle commande #${order.id.substring(0, 8)} de ${order.customerName}`,
    from: {
      name: `${fromUser.firstName} ${fromUser.lastName}`,
      role: fromUser.role,
      email: fromUser.email
    },
    to: ['employee', 'manager', 'admin'],
    data: { orderId: order.id }
  });
};

export const notifyOrderStatusChange = (order: Order, newStatus: string, fromUser: User) => {
  notificationService.send({
    type: 'order:status',
    title: 'Changement de Statut',
    message: `Commande #${order.id.substring(0, 8)} est maintenant ${newStatus}`,
    from: {
      name: `${fromUser.firstName} ${fromUser.lastName}`,
      role: fromUser.role,
      email: fromUser.email
    },
    to: [order.customerId, 'manager', 'admin'],
    data: { orderId: order.id, status: newStatus }
  });
};

export const notifyNewComplaint = (complaint: Complaint, fromUser: User) => {
  notificationService.send({
    type: 'complaint:new',
    title: 'Nouvelle Réclamation',
    message: `Réclamation de ${complaint.customerName}: ${complaint.subject}`,
    from: {
      name: `${fromUser.firstName} ${fromUser.lastName}`,
      role: fromUser.role,
      email: fromUser.email
    },
    to: ['employee', 'manager', 'admin'],
    data: { complaintId: complaint.id }
  });
};

export const notifyComplaintResponse = (complaint: Complaint, fromUser: User) => {
  notificationService.send({
    type: 'complaint:response',
    title: 'Réponse à Réclamation',
    message: `Votre réclamation a reçu une réponse de ${fromUser.role}`,
    from: {
      name: `${fromUser.firstName} ${fromUser.lastName}`,
      role: fromUser.role,
      email: fromUser.email
    },
    to: [complaint.customerId],
    data: { complaintId: complaint.id }
  });
};

export const notifyNewPromotion = (promotion: any, fromUser: User) => {
  notificationService.send({
    type: 'promotion:new',
    title: '🎉 Nouvelle Promotion!',
    message: `${promotion.title} - ${promotion.description}`,
    from: {
      name: `${fromUser.firstName} ${fromUser.lastName}`,
      role: fromUser.role,
      email: fromUser.email
    },
    to: ['all'],
    data: { promotionId: promotion.id }
  });
};

export const notifyRefund = (order: Order, amount: number, fromUser: User) => {
  notificationService.send({
    type: 'refund:processed',
    title: 'Remboursement Effectué',
    message: `Remboursement de ${amount} FCFA pour la commande #${order.id.substring(0, 8)}`,
    from: {
      name: `${fromUser.firstName} ${fromUser.lastName}`,
      role: fromUser.role,
      email: fromUser.email
    },
    to: [order.customerId],
    data: { orderId: order.id, amount }
  });
};

export const sendAdminMessage = (message: string, recipients: string[], fromUser: User) => {
  notificationService.send({
    type: 'admin:message',
    title: 'Message de l\'Administration',
    message,
    from: {
      name: `${fromUser.firstName} ${fromUser.lastName}`,
      role: fromUser.role,
      email: fromUser.email
    },
    to: recipients,
    data: {}
  });
};
