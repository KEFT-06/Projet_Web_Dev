import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getOrders, getUsers, getMenuItems } from '../../lib/storage';
import type { Order, User } from '../../lib/mockData';
import { formatPrice } from '../../lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users as UsersIcon, 
  Package,
  Clock,
  Star,
  Award,
  Sparkles,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react';

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
  completionRate: number;
  growthRate: number;
}

interface DailyStat {
  date: string;
  revenue: number;
  orders: number;
}

export function AdvancedStatistics() {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
    completionRate: 0,
    growthRate: 0
  });
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; count: number; revenue: number }[]>([]);
  const [topCustomers, setTopCustomers] = useState<{ name: string; orders: number; total: number }[]>([]);

  useEffect(() => {
    calculateStats();
  }, [period]);

  const calculateStats = () => {
    const orders = getOrders();
    const users = getUsers().filter(u => u.role === 'customer');
    const menuItems = getMenuItems();
    const now = new Date();

    // Filtrer par période
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.timestamp);
      const diffDays = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (period) {
        case 'week': return diffDays <= 7;
        case 'month': return diffDays <= 30;
        case 'year': return diffDays <= 365;
        default: return false;
      }
    });

    // Stats globales
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = filteredOrders.length;
    const completedOrders = filteredOrders.filter(o => o.status === 'delivered').length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    // Taux de croissance (comparaison avec période précédente)
    const previousPeriodStart = new Date(now);
    const previousPeriodEnd = new Date(now);
    
    switch (period) {
      case 'week':
        previousPeriodStart.setDate(now.getDate() - 14);
        previousPeriodEnd.setDate(now.getDate() - 7);
        break;
      case 'month':
        previousPeriodStart.setDate(now.getDate() - 60);
        previousPeriodEnd.setDate(now.getDate() - 30);
        break;
      case 'year':
        previousPeriodStart.setDate(now.getDate() - 730);
        previousPeriodEnd.setDate(now.getDate() - 365);
        break;
    }

    const previousOrders = orders.filter(o => {
      const orderDate = new Date(o.timestamp);
      return orderDate >= previousPeriodStart && orderDate < previousPeriodEnd;
    });
    const previousRevenue = previousOrders.reduce((sum, o) => sum + o.total, 0);
    const growthRate = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    setStats({
      totalRevenue,
      totalOrders,
      totalCustomers: users.length,
      avgOrderValue,
      completionRate,
      growthRate
    });

    // Stats journalières
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 12;
    const dailyData: DailyStat[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      
      const dayOrders = filteredOrders.filter(o => {
        const orderDate = new Date(o.timestamp);
        return orderDate.toDateString() === date.toDateString();
      });
      
      dailyData.push({
        date: dateStr,
        revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
        orders: dayOrders.length
      });
    }
    setDailyStats(dailyData);

    // Top produits
    const productCounts: { [key: string]: { count: number; revenue: number } } = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productCounts[item.itemName]) {
          productCounts[item.itemName] = { count: 0, revenue: 0 };
        }
        productCounts[item.itemName].count += item.quantity;
        productCounts[item.itemName].revenue += item.price * item.quantity;
      });
    });
    
    const topProds = Object.entries(productCounts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    setTopProducts(topProds);

    // Top clients
    const customerOrders: { [key: string]: { name: string; orders: number; total: number } } = {};
    filteredOrders.forEach(order => {
      if (!customerOrders[order.customerId]) {
        customerOrders[order.customerId] = {
          name: order.customerName,
          orders: 0,
          total: 0
        };
      }
      customerOrders[order.customerId].orders++;
      customerOrders[order.customerId].total += order.total;
    });
    
    const topCust = Object.values(customerOrders)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    setTopCustomers(topCust);
  };

  const maxRevenue = Math.max(...dailyStats.map(d => d.revenue), 1);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Statistiques Avancées</h1>
            <p className="text-muted-foreground">Analyse détaillée des performances</p>
          </div>
        </div>
        
        <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
          <SelectTrigger className="w-48">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">7 derniers jours</SelectItem>
            <SelectItem value="month">30 derniers jours</SelectItem>
            <SelectItem value="year">12 derniers mois</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${stats.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.growthRate >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(stats.growthRate).toFixed(1)}%
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Chiffre d'Affaires</p>
            <p className="text-3xl font-bold text-green-700 dark:text-green-400">{formatPrice(stats.totalRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">vs période précédente</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm text-muted-foreground">Commandes</p>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">{stats.totalOrders}</p>
            <p className="text-xs text-muted-foreground mt-1">Total sur la période</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm text-muted-foreground">Panier Moyen</p>
            <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">{formatPrice(stats.avgOrderValue)}</p>
            <p className="text-xs text-muted-foreground mt-1">Par commande</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-orange-200 hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <Award className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-sm text-muted-foreground">Taux de Réussite</p>
            <p className="text-3xl font-bold text-orange-700 dark:text-orange-400">{stats.completionRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground mt-1">Commandes livrées</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Graphique Évolution */}
        <Card className="border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900">
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              Évolution du Chiffre d'Affaires
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {dailyStats.map((day, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{day.date}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{day.orders} cmd</span>
                      <span className="font-semibold">{formatPrice(day.revenue)}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${(day.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Produits */}
        <Card className="border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900">
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <Award className="w-4 h-4 text-white" />
              </div>
              Top 5 Produits Vendus
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                    idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                    idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.count} vendus</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{formatPrice(product.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Clients */}
      <Card className="border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
              <UsersIcon className="w-4 h-4 text-white" />
            </div>
            Top 5 Meilleurs Clients
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {topCustomers.map((customer, idx) => (
              <div key={idx} className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-4 rounded-lg border border-purple-200">
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl mb-2 ${
                    idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                    idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                    idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                  </div>
                  <p className="font-semibold text-sm mb-1">{customer.name}</p>
                  <p className="text-xs text-muted-foreground mb-2">{customer.orders} commandes</p>
                  <p className="font-bold text-purple-600">{formatPrice(customer.total)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
