import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { getOrders, getComplaints } from '../../lib/storage';
import type { Order, Complaint } from '../../lib/mockData';
import { Clock, AlertTriangle, CheckCircle, Package, TrendingUp, MessageSquare, Sparkles } from 'lucide-react';

export function EmployeeDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    const allOrders = getOrders();
    setOrders(allOrders);
    
    const allComplaints = getComplaints();
    setComplaints(allComplaints);
  }, []);

  const today = new Date().toDateString();
  const todayOrders = orders.filter(o => o.timestamp.toDateString() === today);
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'in-preparation');
  const activeOrders = orders.filter(o => o.status === 'in-delivery');
  const pendingComplaints = complaints.filter(c => c.status === 'pending');

  // Get urgent orders (oldest 3 pending/in-prep orders)
  const urgentOrders = [...pendingOrders]
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    .slice(0, 3);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with gradient */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Tableau de Bord Employé</h1>
            <p className="text-muted-foreground">Vue d'ensemble de vos activités</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-blue-700 dark:text-blue-400">Commandes du Jour</CardTitle>
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{todayOrders.length}</div>
            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Aujourd'hui
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-orange-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-orange-700 dark:text-orange-400">En Attente</CardTitle>
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center animate-pulse">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">{pendingOrders.length}</div>
            <p className="text-xs text-orange-600 mt-1">
              À traiter rapidement
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-green-700 dark:text-green-400">En Livraison</CardTitle>
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-400">{activeOrders.length}</div>
            <p className="text-xs text-green-600 mt-1">
              Livraisons actives
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950 border-red-200 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-red-700 dark:text-red-400">Réclamations</CardTitle>
              <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700 dark:text-red-400">{pendingComplaints.length}</div>
            <p className="text-xs text-red-600 mt-1">
              À répondre
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Orders */}
      <Card className="mb-8 border-orange-200">
        <CardHeader className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <CardTitle>Commandes Urgentes à Traiter</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {urgentOrders.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-muted-foreground">Aucune commande urgente</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Time Placed</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {urgentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>
                      {order.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell>
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.status === 'pending' ? 'destructive' : 'secondary'}>
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              <CardTitle>Commandes en Cours</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {pendingOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-muted-foreground">Aucune commande en cours</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                    <div>
                      <p>{order.customerName}</p>
                      <p className="text-sm text-gray-600">
                        {order.items.map(i => i.itemName).join(', ')}
                      </p>
                    </div>
                    <Badge>{order.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900 dark:to-pink-900">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-red-600" />
              <CardTitle>Réclamations à Traiter</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {pendingComplaints.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-muted-foreground">Aucune réclamation en attente</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingComplaints.slice(0, 5).map((complaint) => (
                  <div key={complaint.id} className="flex items-start justify-between p-3 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950 dark:to-pink-950 rounded-lg border border-red-200 hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <p>{complaint.customerName}</p>
                      <p className="text-sm text-gray-600">{complaint.subject}</p>
                    </div>
                    <Badge variant="outline">{complaint.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
