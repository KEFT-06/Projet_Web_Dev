import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { getOrders, getUsers, saveOrders, getEmployees } from '../../lib/storage';
import type { Order, Employee } from '../../lib/mockData';
import { DollarSign, Users, TrendingUp, Award, Home, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '../../lib/utils';

export function ManagerDashboard({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allOrders = getOrders();
    setOrders(allOrders);
    setEmployees(getEmployees());
  };

  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => o.timestamp.toDateString() === today);
  const todaySales = todayOrders.reduce((sum, order) => sum + order.total, 0);
  const activeOrders = orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');
  
  const newCustomers = getUsers().filter(u => 
    u.role === 'customer' && 
    new Date(u.id.substring(1)).toDateString() === today
  ).length;

  const totalLoyaltyPoints = getUsers()
    .filter(u => u.role === 'customer')
    .reduce((sum, user) => sum + user.loyaltyPoints, 0);

  // Statistiques de parrainage
  const referredCustomers = getUsers()
    .filter(u => u.role === 'customer' && u.referredBy)
    .length;

  // Total des ventes (toutes commandes)
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  // Get 3 most urgent orders
  const urgentOrders = [...activeOrders]
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    .slice(0, 3);

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const allOrders = getOrders();
    const orderIndex = allOrders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
      allOrders[orderIndex].status = newStatus;
      saveOrders(allOrders);
      loadData();
      toast.success('Order updated');
    }
  };

  const cancelOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'cancelled');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bienvenue, Manager</h1>
        <Button
          onClick={() => onNavigate?.('customer-home')}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Go to my space
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Today's Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl notranslate" translate="no">{formatPrice(todaySales)}</div>
            <p className="text-xs text-gray-600">{todayOrders.length} commandes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Active Orders</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl">{activeOrders.length}</div>
            <p className="text-xs text-gray-600">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">New Customers</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl">{newCustomers}</div>
            <p className="text-xs text-gray-600">Registered today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Points Fidélité</CardTitle>
              <Award className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl">{totalLoyaltyPoints}</div>
            <p className="text-xs text-gray-600">Distribués</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Parrainages</CardTitle>
              <UserPlus className="h-4 w-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl">{referredCustomers}</div>
            <p className="text-xs text-gray-600">Clients parrainés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Revenu Total</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl notranslate" translate="no">{formatPrice(totalRevenue)}</div>
            <p className="text-xs text-gray-600">{orders.length} commandes</p>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Orders */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Urgent Orders - Real-time Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          {urgentOrders.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No urgent orders</p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead className="hidden sm:table-cell">Order Time</TableHead>
                    <TableHead className="hidden md:table-cell">Customer Address</TableHead>
                    <TableHead>Customer Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="hidden sm:table-cell">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {urgentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="whitespace-nowrap">{order.id}</TableCell>
                      <TableCell className="hidden sm:table-cell whitespace-nowrap">
                        {order.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{order.customerAddress}</TableCell>
                      <TableCell className="whitespace-nowrap">{order.customerName}</TableCell>
                      <TableCell>
                        <Badge variant={
                          order.status === 'pending' ? 'destructive' :
                          order.status === 'in-preparation' ? 'secondary' :
                          'default'
                        }>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap notranslate" translate="no">{formatPrice(order.total)}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm('Cancel this order?')) {
                              cancelOrder(order.id);
                            }
                          }}
                        >
                          Cancel
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Employee Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="whitespace-nowrap">{emp.firstName} {emp.lastName}</TableCell>
                    <TableCell className="capitalize">{emp.position}</TableCell>
                    <TableCell>
                      <Badge variant={emp.status === 'active' ? 'default' : 'secondary'}>
                        {emp.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{emp.email}</TableCell>
                    <TableCell className="hidden lg:table-cell">{emp.phone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}