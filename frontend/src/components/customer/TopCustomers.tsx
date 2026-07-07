import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Trophy, Crown, Medal, Award, Calendar, Users } from 'lucide-react';
import { getUsers, getOrders } from '../../lib/storage';
import type { User, Order } from '../../lib/mockData';

interface CustomerStats {
  user: User;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: Date | null;
  loyaltyPoints: number;
}

export function TopCustomers() {
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month'>('month');
  const [topCustomers, setTopCustomers] = useState<CustomerStats[]>([]);

  useEffect(() => {
    loadTopCustomers();
  }, [timeFilter]);

  const loadTopCustomers = () => {
    const users = getUsers().filter(u => u.role === 'customer');
    const allOrders = getOrders();

    // Filter orders by time period
    const now = new Date();
    const filterDate = new Date();

    switch (timeFilter) {
      case 'day':
        filterDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        filterDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
    }

    const filteredOrders = allOrders.filter(order => order.timestamp >= filterDate);

    // Calculate stats for each customer
    const customerStats: CustomerStats[] = users.map(user => {
      const userOrders = filteredOrders.filter(order => order.customerId === user.id);
      const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);
      const lastOrder = userOrders.length > 0
        ? userOrders.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]
        : null;

      return {
        user,
        totalOrders: userOrders.length,
        totalSpent,
        averageOrderValue: userOrders.length > 0 ? totalSpent / userOrders.length : 0,
        lastOrderDate: lastOrder?.timestamp || null,
        loyaltyPoints: user.loyaltyPoints
      };
    });

    // Sort by total orders (primary) and total spent (secondary)
    const sortedCustomers = customerStats
      .filter(stats => stats.totalOrders > 0) // Only show customers with orders in the period
      .sort((a, b) => {
        if (b.totalOrders !== a.totalOrders) {
          return b.totalOrders - a.totalOrders;
        }
        return b.totalSpent - a.totalSpent;
      })
      .slice(0, 10);

    setTopCustomers(sortedCustomers);
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <Award className="h-5 w-5 text-blue-500" />;
    }
  };

  const getRankBadge = (index: number) => {
    const ranks = ['🥇 1st', '🥈 2nd', '🥉 3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
    return ranks[index] || `${index + 1}th`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Top 10 Customers</h1>
          <p className="text-muted-foreground">Our most loyal customers this period</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <Select value={timeFilter} onValueChange={(value: 'day' | 'week' | 'month') => setTimeFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topCustomers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No customer activity in the selected period</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topCustomers.map((customer, index) => (
                <div
                  key={customer.user.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    index < 3 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800' : 'bg-card'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getRankIcon(index)}
                      <Badge variant={index < 3 ? 'default' : 'secondary'}>
                        {getRankBadge(index)}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {customer.user.firstName} {customer.user.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {customer.totalOrders} orders • {customer.totalSpent.toLocaleString('fr-FR')} XAF spent
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      Avg: {customer.averageOrderValue.toLocaleString('fr-FR')} XAF
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {customer.loyaltyPoints} points
                    </div>
                    {customer.lastOrderDate && (
                      <div className="text-xs text-muted-foreground">
                        Last order: {customer.lastOrderDate.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{topCustomers.length}</div>
            <p className="text-sm text-muted-foreground">Active Customers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {topCustomers.reduce((sum, c) => sum + c.totalOrders, 0)}
            </div>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {topCustomers.reduce((sum, c) => sum + c.totalSpent, 0).toLocaleString('fr-FR')} XAF
            </div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
