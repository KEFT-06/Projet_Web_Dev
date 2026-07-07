import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  Users, 
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { getOrders } from '../../lib/storage';
import type { Order } from '../../lib/mockData';
import { formatPrice } from '../../lib/utils';

export function WeeklyStatistics() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [weeklyData, setWeeklyData] = useState<{
    totalSales: number;
    totalOrders: number;
    avgOrderValue: number;
    completedOrders: number;
    cancelledOrders: number;
    topSellingItems: { name: string; count: number }[];
    dailyStats: { day: string; sales: number; orders: number }[];
  }>({
    totalSales: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    topSellingItems: [],
    dailyStats: []
  });

  useEffect(() => {
    loadWeeklyData();
  }, []);

  const loadWeeklyData = () => {
    const allOrders = getOrders();
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Filter orders from last 7 days
    const weeklyOrders = allOrders.filter(order => 
      order.timestamp >= weekAgo
    );
    
    setOrders(weeklyOrders);
    
    // Calculate statistics
    const totalSales = weeklyOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = weeklyOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    const completedOrders = weeklyOrders.filter(o => o.status === 'delivered').length;
    const cancelledOrders = weeklyOrders.filter(o => o.status === 'cancelled').length;
    
    // Top selling items
    const itemCounts: { [key: string]: number } = {};
    weeklyOrders.forEach(order => {
      order.items.forEach(item => {
        itemCounts[item.itemName] = (itemCounts[item.itemName] || 0) + item.quantity;
      });
    });
    
    const topSellingItems = Object.entries(itemCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Daily stats for last 7 days
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayOrders = weeklyOrders.filter(order => 
        order.timestamp.toDateString() === date.toDateString()
      );
      
      dailyStats.push({
        day: date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }),
        sales: dayOrders.reduce((sum, order) => sum + order.total, 0),
        orders: dayOrders.length
      });
    }
    
    setWeeklyData({
      totalSales,
      totalOrders,
      avgOrderValue,
      completedOrders,
      cancelledOrders,
      topSellingItems,
      dailyStats
    });
  };

  const completionRate = weeklyData.totalOrders > 0 
    ? ((weeklyData.completedOrders / weeklyData.totalOrders) * 100).toFixed(1)
    : '0';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold">Statistiques Hebdomadaires</h1>
        </div>
        <p className="text-muted-foreground flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Données des 7 derniers jours
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-green-700 dark:text-green-400">
                Ventes Totales
              </CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-400 notranslate" translate="no">
              {formatPrice(weeklyData.totalSales)}
            </div>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Cette semaine
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-blue-700 dark:text-blue-400">
                Commandes
              </CardTitle>
              <Package className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
              {weeklyData.totalOrders}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {weeklyData.completedOrders} livrées
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-purple-700 dark:text-purple-400">
                Panier Moyen
              </CardTitle>
              <Activity className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700 dark:text-purple-400 notranslate" translate="no">
              {formatPrice(weeklyData.avgOrderValue)}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              Par commande
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-orange-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-orange-700 dark:text-orange-400">
                Taux de Réussite
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">
              {completionRate}%
            </div>
            <p className="text-xs text-orange-600 mt-1">
              Commandes livrées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Stats */}
      <Card className="mb-8">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <CardTitle>Évolution Journalière</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {weeklyData.dailyStats.map((day, index) => {
              const maxSales = Math.max(...weeklyData.dailyStats.map(d => d.sales));
              const percentage = maxSales > 0 ? (day.sales / maxSales) * 100 : 0;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium w-20">{day.day}</span>
                    <span className="text-muted-foreground">{day.orders} commandes</span>
                    <span className="font-semibold notranslate" translate="no">
                      {formatPrice(day.sales)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-green-600" />
              <CardTitle>Top 5 Plats Vendus</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {weeklyData.topSellingItems.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucune vente cette semaine
              </p>
            ) : (
              <div className="space-y-4">
                {weeklyData.topSellingItems.map((item, index) => {
                  const maxCount = weeklyData.topSellingItems[0].count;
                  const percentage = (item.count / maxCount) * 100;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center font-bold text-white
                            ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-gray-300'}
                          `}>
                            {index + 1}
                          </div>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <Badge variant="outline" className="font-semibold">
                          {item.count} vendus
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            index === 2 ? 'bg-orange-600' : 
                            'bg-gray-300'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Status Breakdown */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <CardTitle>Répartition des Commandes</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-700 dark:text-green-400">
                      Livrées
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Commandes complétées
                    </p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-green-700 dark:text-green-400">
                  {weeklyData.completedOrders}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-700 dark:text-red-400">
                      Annulées
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Commandes annulées
                    </p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-red-700 dark:text-red-400">
                  {weeklyData.cancelledOrders}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-blue-700 dark:text-blue-400">
                      En Cours
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Commandes actives
                    </p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                  {weeklyData.totalOrders - weeklyData.completedOrders - weeklyData.cancelledOrders}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
