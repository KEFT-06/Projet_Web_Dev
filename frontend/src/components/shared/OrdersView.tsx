import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { getOrders, saveOrders } from '../../lib/storage';
import type { Order } from '../../lib/mockData';
import { toast } from 'sonner';
import { apiListOrders, apiUpdateOrderStatus } from '../../lib/api';

interface OrdersViewProps {
  canEdit?: boolean;
  canDelete?: boolean;
}

export function OrdersView({ canEdit = false, canDelete = false }: OrdersViewProps) {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadOrders();
    // Reload on SSE events
    const base = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
    const es = new EventSource(base + '/api/stream');
    es.onmessage = () => loadOrders();
    es.onerror = () => {};
    return () => es.close();
  }, []);

  const loadOrders = async () => {
    const token = localStorage.getItem('auth_token') || undefined;
    const enableApiList = !!(import.meta as any).env?.VITE_ENABLE_ORDERS_GET;
    if (token && enableApiList) {
      try {
        const res = await apiListOrders(token);
        const mapped: Order[] = res.orders.map((o) => ({
          id: o.id,
          customerId: o.userId,
          customerName: o.userId,
          customerAddress: '',
          items: o.items.map(it => ({ menuItemId: it.id, quantity: it.quantity, itemName: it.name, price: it.price })),
          total: o.total,
          status: o.status,
          timestamp: new Date(o.created_at),
          paymentStatus: (o as any).paymentStatus || 'paid',
        }));
        const today = new Date().toDateString();
        const todayOrders = mapped.filter(o => o.timestamp.toDateString() === today);
        setOrders(todayOrders);
        return;
      } catch {}
    }
    // Fallback to local storage
    const allOrders = getOrders();
    const today = new Date().toDateString();
    const todayOrders = allOrders.filter(o => o.timestamp.toDateString() === today);
    setOrders(todayOrders);
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    const token = localStorage.getItem('auth_token') || undefined;
    if (token) {
      try {
        await apiUpdateOrderStatus(orderId, newStatus, token);
        await loadOrders();
        toast.success('Order status updated');
        return;
      } catch {}
    }
    // Fallback local update
    const allOrders = getOrders();
    const orderIndex = allOrders.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      allOrders[orderIndex].status = newStatus;
      saveOrders(allOrders);
      await loadOrders();
      toast.success('Order status updated (local)');
    }
  };

  const deleteOrder = (orderId: string) => {
    const allOrders = getOrders();
    const filteredOrders = allOrders.filter(o => o.id !== orderId);
    saveOrders(filteredOrders);
    loadOrders();
    toast.success('Order deleted');
  };

  const getStatusBadge = (status: Order['status']) => {
    const variants: Record<Order['status'], any> = {
      'pending': 'outline',
      'in-preparation': 'secondary',
      'in-delivery': 'default',
      'delivered': 'default',
      'cancelled': 'destructive',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8">Orders - {new Date().toLocaleDateString()}</h1>

      <Card>
        <CardHeader>
          <CardTitle>Today's Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No orders for today</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Address</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="hidden sm:table-cell">Time</TableHead>
                    <TableHead>Status</TableHead>
                    {(canEdit || canDelete) && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="whitespace-nowrap">{order.id}</TableCell>
                      <TableCell className="whitespace-nowrap">{order.customerName}</TableCell>
                      <TableCell className="hidden md:table-cell">{order.customerAddress}</TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          {order.items.map(item => (
                            <div key={item.menuItemId} className="text-sm">
                              {item.itemName} x{item.quantity}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{order.total.toLocaleString('fr-FR')} XAF</TableCell>
                      <TableCell className="hidden sm:table-cell whitespace-nowrap">
                        {order.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      {(canEdit || canDelete) && (
                        <TableCell>
                          <div className="flex flex-col sm:flex-row gap-2">
                            {canEdit && order.status !== 'delivered' && order.status !== 'cancelled' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const nextStatus: Record<string, Order['status']> = {
                                    'pending': 'in-preparation',
                                    'in-preparation': 'in-delivery',
                                    'in-delivery': 'delivered',
                                  };
                                  if (nextStatus[order.status]) {
                                    updateOrderStatus(order.id, nextStatus[order.status]);
                                  }
                                }}
                              >
                                Next Status
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this order?')) {
                                    deleteOrder(order.id);
                                  }
                                }}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}