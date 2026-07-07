/**
 * useOrders - Hook personnalisé pour la gestion des commandes
 * 
 * Principe DRY: Centralise la logique des commandes
 * Principe KISS: Interface simple pour les opérations courantes
 */

import { useState, useEffect, useCallback } from 'react';
import { orderService, type OrderStatus } from '../services/OrderService';
import type { Order } from '../lib/mockData';

interface UseOrdersOptions {
  customerId?: string;
  status?: OrderStatus;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseOrdersReturn {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => boolean;
  cancelOrder: (orderId: string) => boolean;
  getOrderById: (orderId: string) => Order | undefined;
}

/**
 * Hook pour gérer les commandes
 * @param options - Options de filtrage et de rafraîchissement
 * @returns Objet contenant les commandes et les méthodes de gestion
 */
export function useOrders(options: UseOrdersOptions = {}): UseOrdersReturn {
  const {
    customerId,
    status,
    autoRefresh = false,
    refreshInterval = 5000,
  } = options;

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Charge les commandes selon les filtres
   */
  const loadOrders = useCallback(() => {
    try {
      setIsLoading(true);
      setError(null);

      let result: Order[];

      if (customerId) {
        result = orderService.getByCustomer(customerId);
      } else if (status) {
        result = orderService.getByStatus(status);
      } else {
        result = orderService.getAll();
      }

      setOrders(result);
    } catch (err) {
      setError('Failed to load orders');
      console.error('Error loading orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [customerId, status]);

  /**
   * Met à jour le statut d'une commande
   * @param orderId - ID de la commande
   * @param newStatus - Nouveau statut
   * @returns true si mise à jour réussie, false sinon
   */
  const updateOrderStatus = useCallback(
    (orderId: string, newStatus: OrderStatus): boolean => {
      try {
        const updated = orderService.updateStatus(orderId, newStatus);
        if (updated) {
          loadOrders();
          return true;
        }
        return false;
      } catch (err) {
        console.error('Error updating order status:', err);
        return false;
      }
    },
    [loadOrders]
  );

  /**
   * Annule une commande
   * @param orderId - ID de la commande
   * @returns true si annulation réussie, false sinon
   */
  const cancelOrder = useCallback(
    (orderId: string): boolean => {
      try {
        const cancelled = orderService.cancelOrder(orderId);
        if (cancelled) {
          loadOrders();
          return true;
        }
        return false;
      } catch (err) {
        console.error('Error cancelling order:', err);
        return false;
      }
    },
    [loadOrders]
  );

  /**
   * Récupère une commande par son ID
   * @param orderId - ID de la commande
   * @returns Commande trouvée ou undefined
   */
  const getOrderById = useCallback(
    (orderId: string): Order | undefined => {
      return orders.find(order => order.id === orderId);
    },
    [orders]
  );

  // Charger les commandes au montage et lors des changements de filtres
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Rafraîchissement automatique si activé
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadOrders();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadOrders]);

  return {
    orders,
    isLoading,
    error,
    refresh: loadOrders,
    updateOrderStatus,
    cancelOrder,
    getOrderById,
  };
}

/**
 * Hook pour obtenir les statistiques des commandes
 * @returns Statistiques des commandes
 */
export function useOrderStatistics() {
  const [stats, setStats] = useState(orderService.getStatistics());
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(() => {
    setIsLoading(true);
    try {
      setStats(orderService.getStatistics());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, isLoading, refresh };
}
