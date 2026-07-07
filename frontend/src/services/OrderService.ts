/**
 * OrderService - Service de gestion des commandes
 * 
 * Principe SOLID:
 * - Single Responsibility: Gère uniquement les commandes
 * - Open/Closed: Extensible sans modification
 * 
 * Principe DRY: Réutilise BaseService
 * Principe KISS: Méthodes simples et claires
 */

import { BaseService } from './BaseService';
import type { Order } from '../lib/mockData';

export type OrderStatus = 'pending' | 'in-preparation' | 'in-delivery' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid';

/**
 * Service pour gérer les commandes
 */
export class OrderService extends BaseService<Order> {
  private static instance: OrderService;

  private constructor() {
    super('restaurant_orders');
  }

  /**
   * Singleton pattern
   */
  static getInstance(): OrderService {
    if (!OrderService.instance) {
      OrderService.instance = new OrderService();
    }
    return OrderService.instance;
  }

  /**
   * Récupère les commandes d'un client
   * @param customerId - ID du client
   * @returns Array de commandes
   */
  getByCustomer(customerId: string): Order[] {
    return this.filter(order => order.customerId === customerId);
  }

  /**
   * Récupère les commandes par statut
   * @param status - Statut recherché
   * @returns Array de commandes
   */
  getByStatus(status: OrderStatus): Order[] {
    return this.filter(order => order.status === status);
  }

  /**
   * Récupère les commandes par statut de paiement
   * @param paymentStatus - Statut de paiement
   * @returns Array de commandes
   */
  getByPaymentStatus(paymentStatus: PaymentStatus): Order[] {
    return this.filter(order => order.paymentStatus === paymentStatus);
  }

  /**
   * Met à jour le statut d'une commande
   * @param orderId - ID de la commande
   * @param status - Nouveau statut
   * @returns Commande mise à jour ou undefined
   */
  updateStatus(orderId: string, status: OrderStatus): Order | undefined {
    return this.update(orderId, { status });
  }

  /**
   * Marque une commande comme payée
   * @param orderId - ID de la commande
   * @returns Commande mise à jour ou undefined
   */
  markAsPaid(orderId: string): Order | undefined {
    return this.update(orderId, { paymentStatus: 'paid' });
  }

  /**
   * Calcule le total des revenus
   * @param startDate - Date de début (optionnelle)
   * @param endDate - Date de fin (optionnelle)
   * @returns Total des revenus
   */
  calculateRevenue(startDate?: Date, endDate?: Date): number {
    let orders = this.filter(order => order.paymentStatus === 'paid');

    if (startDate) {
      orders = orders.filter(order => new Date(order.timestamp) >= startDate);
    }

    if (endDate) {
      orders = orders.filter(order => new Date(order.timestamp) <= endDate);
    }

    return orders.reduce((sum, order) => sum + order.total, 0);
  }

  /**
   * Obtient les statistiques des commandes
   * @returns Statistiques
   */
  getStatistics(): {
    total: number;
    pending: number;
    inPreparation: number;
    delivered: number;
    cancelled: number;
    totalRevenue: number;
    averageOrderValue: number;
  } {
    const all = this.getAll();
    const paid = this.filter(order => order.paymentStatus === 'paid');

    const totalRevenue = paid.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = paid.length > 0 ? totalRevenue / paid.length : 0;

    return {
      total: all.length,
      pending: this.getByStatus('pending').length,
      inPreparation: this.getByStatus('in-preparation').length,
      delivered: this.getByStatus('delivered').length,
      cancelled: this.getByStatus('cancelled').length,
      totalRevenue,
      averageOrderValue,
    };
  }

  /**
   * Obtient les commandes récentes
   * @param limit - Nombre de commandes à retourner
   * @returns Array de commandes récentes
   */
  getRecent(limit: number = 10): Order[] {
    return this.getAll()
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Obtient les commandes du jour
   * @returns Array de commandes du jour
   */
  getTodayOrders(): Order[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.filter(order => {
      const orderDate = new Date(order.timestamp);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });
  }

  /**
   * Annule une commande
   * @param orderId - ID de la commande
   * @param reason - Raison de l'annulation
   * @returns Commande annulée ou undefined
   */
  cancelOrder(orderId: string, reason?: string): Order | undefined {
    const order = this.getById(orderId);
    if (!order) return undefined;

    // Ne peut annuler que les commandes en attente ou en préparation
    if (order.status !== 'pending' && order.status !== 'in-preparation') {
      return undefined;
    }

    return this.update(orderId, { 
      status: 'cancelled',
      // Vous pouvez ajouter un champ 'cancellationReason' au type Order si nécessaire
    });
  }

  /**
   * Vérifie si un client peut passer une commande
   * @param customerId - ID du client
   * @returns true si peut commander, false sinon
   */
  canPlaceOrder(customerId: string): boolean {
    // Vérifier s'il n'y a pas trop de commandes en attente
    const pendingOrders = this.filter(
      order => order.customerId === customerId && 
      (order.status === 'pending' || order.status === 'in-preparation')
    );

    return pendingOrders.length < 3; // Max 3 commandes en cours
  }

  /**
   * Obtient le panier moyen
   * @returns Valeur moyenne du panier
   */
  getAverageBasketValue(): number {
    const paidOrders = this.filter(order => order.paymentStatus === 'paid');
    if (paidOrders.length === 0) return 0;

    const total = paidOrders.reduce((sum, order) => sum + order.total, 0);
    return total / paidOrders.length;
  }
}

// Export de l'instance singleton
export const orderService = OrderService.getInstance();
