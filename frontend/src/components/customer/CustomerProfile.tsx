import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { toast } from 'sonner';
import { getUsers, getOrders, getComplaints } from '../../lib/storage';
import type { User, Order, Complaint } from '../../lib/mockData';
import { Trophy, User as UserIcon, Sparkles, Copy, Share2, TrendingUp, DollarSign, Package, Award, Gift } from 'lucide-react';
import { formatPrice, translateOrderStatus, translateComplaintStatus } from '../../lib/utils';

interface CustomerProfileProps {
  user: User;
  onGoTopCustomers?: () => void;
}

export function CustomerProfile({ user, onGoTopCustomers }: CustomerProfileProps) {
  const [topCustomers, setTopCustomers] = useState<{ user: User; orderCount: number }[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [complaintHistory, setComplaintHistory] = useState<Complaint[]>([]);

  useEffect(() => {
    // Get all customers and their order counts
    const allUsers = getUsers().filter(u => u.role === 'customer');
    const allOrders = getOrders();
    
    const customerOrderCounts = allUsers.map(customer => ({
      user: customer,
      orderCount: allOrders.filter(o => o.customerId === customer.id).length,
    }));

    // Sort by order count and get top 10 (only customers with orders)
    const top10 = customerOrderCounts
      .filter(customer => customer.orderCount > 0)
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 10);
    
    setTopCustomers(top10);

    // Get current user's orders
    const userOrders = allOrders.filter(o => o.customerId === user.id);
    setOrderHistory(userOrders);

    // Get current user's complaints
    const userComplaints = getComplaints().filter(c => c.customerId === user.id);
    setComplaintHistory(userComplaints);
  }, [user.id]);

  const getStatusBadgeVariant = (status: string): any => {
    const variants: Record<string, any> = {
      'delivered': 'default',
      'in-delivery': 'secondary',
      'in-preparation': 'outline',
      'pending': 'outline',
      'cancelled': 'destructive',
      'resolved': 'default',
      'responded': 'secondary',
    };
    return variants[status] || 'outline';
  };

  const totalSpent = orderHistory.reduce((sum, order) => sum + order.total, 0);
  const thisMonthOrders = orderHistory.filter(o => {
    const orderMonth = new Date(o.timestamp).getMonth();
    const currentMonth = new Date().getMonth();
    return orderMonth === currentMonth;
  }).length;
  const pointsToNextReward = 15 - (user.loyaltyPoints % 15);
  const progressPercent = ((user.loyaltyPoints % 15) / 15) * 100;

  const copyReferralCode = () => {
    if (user.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      toast.success('🎉 Code de parrainage copié!');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header avec gradient */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mon Profil</h1>
          <p className="text-muted-foreground">Bienvenue {user.firstName}!</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Dépensé</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">{formatPrice(totalSpent)}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Commandes</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{orderHistory.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ce Mois</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{thisMonthOrders}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Points Fidélité</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{user.loyaltyPoints}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Personal Information */}
        <Card className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-gray-200 hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <CardTitle className="text-foreground flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                <UserIcon className="h-4 w-4 text-white" />
              </div>
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-foreground">
            <div>
              <p className="text-sm text-muted-foreground">Nom</p>
              <p>{user.firstName} {user.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p>{user.email}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Points de fidélité
                </p>
                <span className="text-2xl font-bold text-yellow-700">{user.loyaltyPoints}</span>
              </div>
              <div className="space-y-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {user.loyaltyPoints >= 15 ? (
                    <span className="text-green-600 font-semibold">✅ Réduction de 1000F disponible!</span>
                  ) : (
                    <span>Plus que {pointsToNextReward} points pour 1000F de réduction</span>
                  )}
                </p>
              </div>
            </div>
            {user.referralCode && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="h-5 w-5 text-green-600" />
                  <p className="text-sm font-medium text-foreground">Votre code de parrainage</p>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-mono bg-white dark:bg-gray-800 px-4 py-2 rounded text-lg font-bold text-green-700 flex-1 text-center border-2 border-green-300">
                    {user.referralCode}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={copyReferralCode}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copier
                  </Button>
                  <Button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Mon code de parrainage',
                          text: `Utilisez mon code ${user.referralCode} pour commander et gagnez des points!`
                        });
                      } else {
                        copyReferralCode();
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Partager
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  🎁 Gagnez 2 points par parrainage réussi!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 border-yellow-200 hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900 dark:to-amber-900">
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-white" />
                </div>
                Top 10 des meilleurs clients
              </CardTitle>
              {onGoTopCustomers && (
                <button onClick={onGoTopCustomers} className="text-sm underline text-foreground hover:opacity-80">Voir plus</button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topCustomers.map((customer, index) => (
                <div
                  key={customer.user.id}
                  className={`flex items-center justify-between p-2 rounded ${
                    customer.user.id === user.id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-lg' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg' :
                      'bg-muted text-foreground'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                    </span>
                    <span className="text-foreground">
                      {customer.user.firstName} {customer.user.lastName}
                      {customer.user.id === user.id && ' (Vous)'}
                    </span>
                  </div>
                  <Badge className="bg-muted text-foreground">{customer.orderCount} commandes</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order History */}
      <Card className="mb-8 bg-card border-border hover:shadow-lg transition-shadow">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900">
          <CardTitle className="text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <Package className="h-4 w-4 text-white" />
            </div>
            Historique des commandes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orderHistory.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Aucune commande</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-foreground">ID Commande</TableHead>
                    <TableHead className="text-foreground">Date</TableHead>
                    <TableHead className="text-foreground">Articles</TableHead>
                    <TableHead className="text-foreground">Total</TableHead>
                    <TableHead className="text-foreground">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderHistory.map((order) => (
                    <TableRow key={order.id} className="border-border">
                      <TableCell className="text-foreground">{order.id}</TableCell>
                      <TableCell className="text-foreground">{order.timestamp.toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell className="text-foreground">
                        {order.items.map(item => item.itemName).join(', ')}
                      </TableCell>
                      <TableCell className="text-foreground">{formatPrice(order.total)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)} className="bg-muted text-foreground">
                          {translateOrderStatus(order.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complaint History */}
      <Card className="bg-card border-border hover:shadow-lg transition-shadow">
        <CardHeader className="bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900 dark:to-pink-900">
          <CardTitle className="text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
              <Award className="h-4 w-4 text-white" />
            </div>
            Historique des réclamations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {complaintHistory.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Aucune réclamation soumise</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-foreground">Date</TableHead>
                    <TableHead className="text-foreground">Sujet</TableHead>
                    <TableHead className="text-foreground">Message</TableHead>
                    <TableHead className="text-foreground">Statut</TableHead>
                    <TableHead className="text-foreground">Réponse</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaintHistory.map((complaint) => (
                    <TableRow key={complaint.id} className="border-border">
                      <TableCell className="text-foreground">{complaint.timestamp.toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell className="text-foreground">{complaint.subject}</TableCell>
                      <TableCell className="max-w-xs truncate text-foreground">{complaint.message}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(complaint.status)} className="bg-muted text-foreground">
                          {translateComplaintStatus(complaint.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-foreground">
                        {complaint.adminResponse || complaint.managerResponse || complaint.employeeResponse || '-'}
                      </TableCell>
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
