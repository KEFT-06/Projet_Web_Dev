import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { getOrders, getUsers } from '../../lib/storage';
import type { Order } from '../../lib/mockData';
import { formatPrice } from '../../lib/utils';
import { BarChart3, TrendingUp, ShoppingBag, DollarSign, Users } from 'lucide-react';
import { useApp } from '../../lib/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { apiStatsWeekly, apiStatsOverview } from '../../lib/api';

type Period = 'day' | 'week' | 'month' | 'year';

interface ChartData {
  name: string;
  value: number;
}

export function StatisticsPage() {
  const { t } = useApp();
  const [stats, setStats] = useState({
    day: { revenue: 0, orders: 0, users: 0 },
    week: { revenue: 0, orders: 0, users: 0 },
    month: { revenue: 0, orders: 0, users: 0 },
    year: { revenue: 0, orders: 0, users: 0 },
  });
  const [chartData, setChartData] = useState({
    day: { orders: [] as ChartData[], revenue: [] as ChartData[] },
    week: { orders: [] as ChartData[], revenue: [] as ChartData[] },
    month: { orders: [] as ChartData[], revenue: [] as ChartData[] },
    year: { orders: [] as ChartData[], revenue: [] as ChartData[] },
  });
  const [overview, setOverview] = useState<{ totalRevenue: number; totalOrders: number; topCustomers: { userId: string; count: number }[] }>({ totalRevenue: 0, totalOrders: 0, topCustomers: [] });

  useEffect(() => {
    calculateStatistics();
    const interval = setInterval(calculateStatistics, 5000);
    return () => clearInterval(interval);
  }, []);

  const calculateStatistics = async () => {
    const orders = getOrders();
    const users = getUsers();
    const now = new Date();
    const token = localStorage.getItem('auth_token') || undefined;

    if (token) {
      try {
        const weekly = await apiStatsWeekly(token);
        const ov = await apiStatsOverview(token);
        const weekOrdersCount = weekly.days.reduce((s, d) => s + d.count, 0);
        const weekRevenue = weekly.days.reduce((s, d) => s + d.revenue, 0);
        setStats((prev) => ({
          ...prev,
          week: { revenue: weekRevenue, orders: weekOrdersCount, users: prev.week.users },
        }));
        setChartData((prev) => ({
          ...prev,
          week: {
            orders: weekly.days.map((d) => ({ name: d.date.slice(5), value: d.count })),
            revenue: weekly.days.map((d) => ({ name: d.date.slice(5), value: d.revenue })),
          },
        }));
        setOverview(ov);
        setStats((prev) => ({
          ...prev,
          day: prev.day,
          month: prev.month,
          year: prev.year,
        }));
      } catch {
      }
    }

    const filterOrders = (period: Period): Order[] => {
      return orders.filter(order => {
        const orderDate = new Date(order.timestamp);

        switch (period) {
          case 'day':
            return (
              orderDate.getDate() === now.getDate() &&
              orderDate.getMonth() === now.getMonth() &&
              orderDate.getFullYear() === now.getFullYear()
            );
          case 'week':
            const weekAgo = new Date(now);
            weekAgo.setDate(now.getDate() - 7);
            return orderDate >= weekAgo;
          case 'month':
            return (
              orderDate.getMonth() === now.getMonth() &&
              orderDate.getFullYear() === now.getFullYear()
            );
          case 'year':
            return orderDate.getFullYear() === now.getFullYear();
          default:
            return false;
        }
      });
    };

    const filterUsers = (period: Period): typeof users => {
      return users.filter(user => {
        if (!user.loginHistory || user.loginHistory.length === 0) return false;

        return user.loginHistory.some(login => {
          const loginDate = new Date(login.login);

          switch (period) {
            case 'day':
              return (
                loginDate.getDate() === now.getDate() &&
                loginDate.getMonth() === now.getMonth() &&
                loginDate.getFullYear() === now.getFullYear()
              );
            case 'week':
              const weekAgo = new Date(now);
              weekAgo.setDate(now.getDate() - 7);
              return loginDate >= weekAgo;
            case 'month':
              return (
                loginDate.getMonth() === now.getMonth() &&
                loginDate.getFullYear() === now.getFullYear()
              );
            case 'year':
              return loginDate.getFullYear() === now.getFullYear();
            default:
              return false;
          }
        });
      });
    };

    const calculatePeriodStats = (period: Period) => {
      const periodOrders = filterOrders(period);
      const periodUsers = filterUsers(period);
      const revenue = periodOrders
        .filter(o => o.status !== 'cancelled')
        .reduce((sum, order) => sum + order.total, 0);

      return {
        revenue,
        orders: periodOrders.length,
        users: periodUsers.length,
      };
    };

    const generateOrdersData = (period: Period): ChartData[] => {
      const periodOrders = filterOrders(period);
      switch (period) {
        case 'day':
          return Array.from({ length: 24 }, (_, hour) => ({
            name: `${hour}h`,
            value: periodOrders.filter(o => new Date(o.timestamp).getHours() === hour).length
          }));
        case 'week':
          const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
          return days.map(day => ({
            name: day,
            value: periodOrders.filter(o => days[new Date(o.timestamp).getDay()] === day).length
          }));
        case 'month':
          const weeks = Array.from({ length: 4 }, (_, i) => i + 1);
          return weeks.map(week => ({
            name: `Sem ${week}`,
            value: periodOrders.filter(o => {
              const orderDate = new Date(o.timestamp);
              const weekNum = Math.ceil(orderDate.getDate() / 7);
              return weekNum === week;
            }).length
          }));
        case 'year':
          const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
          return months.map(month => ({
            name: month,
            value: periodOrders.filter(o => months[new Date(o.timestamp).getMonth()] === month).length
          }));
        default:
          return [];
      }
    };

    const generateRevenueData = (period: Period): ChartData[] => {
      const periodOrders = filterOrders(period);
      switch (period) {
        case 'day':
          return Array.from({ length: 24 }, (_, hour) => ({
            name: `${hour}h`,
            value: periodOrders
              .filter(o => o.status !== 'cancelled' && new Date(o.timestamp).getHours() === hour)
              .reduce((sum, o) => sum + o.total, 0)
          }));
        case 'week':
          const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
          return days.map(day => ({
            name: day,
            value: periodOrders
              .filter(o => o.status !== 'cancelled' && days[new Date(o.timestamp).getDay()] === day)
              .reduce((sum, o) => sum + o.total, 0)
          }));
        case 'month':
          const weeks = Array.from({ length: 4 }, (_, i) => i + 1);
          return weeks.map(week => ({
            name: `Sem ${week}`,
            value: periodOrders
              .filter(o => {
                if (o.status === 'cancelled') return false;
                const orderDate = new Date(o.timestamp);
                const weekNum = Math.ceil(orderDate.getDate() / 7);
                return weekNum === week;
              })
              .reduce((sum, o) => sum + o.total, 0)
          }));
        case 'year':
          const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
          return months.map(month => ({
            name: month,
            value: periodOrders
              .filter(o => o.status !== 'cancelled' && months[new Date(o.timestamp).getMonth()] === month)
              .reduce((sum, o) => sum + o.total, 0)
          }));
        default:
          return [];
      }
    };

    setStats((prev) => ({
      day: calculatePeriodStats('day'),
      week: prev.week.revenue || prev.week.orders ? prev.week : calculatePeriodStats('week'),
      month: calculatePeriodStats('month'),
      year: calculatePeriodStats('year'),
    }));

    setChartData((prev) => ({
      day: { orders: generateOrdersData('day'), revenue: generateRevenueData('day') },
      week: prev.week.orders.length || prev.week.revenue.length ? prev.week : { orders: generateOrdersData('week'), revenue: generateRevenueData('week') },
      month: { orders: generateOrdersData('month'), revenue: generateRevenueData('month') },
      year: { orders: generateOrdersData('year'), revenue: generateRevenueData('year') },
    }));
  };

  const StatCard = ({ title, value, icon: Icon, subtitle }: { title: string; value: string; icon: any; subtitle?: string }) => (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl text-foreground">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <BarChart3 className="h-8 w-8 text-primary" />
        <h1 className="text-foreground">{t.statistics}</h1>
      </div>

      {/* Overview */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Revenu total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-foreground">{formatPrice(overview.totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Commandes totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-foreground">{overview.totalOrders}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Top 10 clients (par nb de commandes)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-40 overflow-y-auto text-sm text-foreground">
              {overview.topCustomers.length === 0 ? (
                <div className="text-muted-foreground">Aucune donnée</div>
              ) : (
                <ul className="space-y-1">
                  {overview.topCustomers.map((c, idx) => (
                    <li key={c.userId} className="flex justify-between">
                      <span>#{idx + 1} {c.userId.slice(0,8)}…</span>
                      <span>{c.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="day" className="space-y-6">
        <TabsList className="bg-muted">
          <TabsTrigger value="day" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            {t.day}
          </TabsTrigger>
          <TabsTrigger value="week" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            {t.week}
          </TabsTrigger>
          <TabsTrigger value="month" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            {t.month}
          </TabsTrigger>
          <TabsTrigger value="year" className="text-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            {t.year}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="day" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <StatCard
              title={t.revenue}
              value={formatPrice(stats.day.revenue)}
              icon={DollarSign}
              subtitle={`Aujourd'hui`}
            />
            <StatCard
              title={t.totalOrders}
              value={stats.day.orders.toString()}
              icon={ShoppingBag}
              subtitle={`Aujourd'hui`}
            />
            <StatCard
              title="Utilisateurs actifs"
              value={stats.day.users.toString()}
              icon={Users}
              subtitle={`Aujourd'hui`}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenus par Heure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.day.revenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Commandes par Heure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.day.orders}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <StatCard
              title={t.revenue}
              value={formatPrice(stats.week.revenue)}
              icon={DollarSign}
              subtitle="7 derniers jours"
            />
            <StatCard
              title={t.totalOrders}
              value={stats.week.orders.toString()}
              icon={ShoppingBag}
              subtitle="7 derniers jours"
            />
            <StatCard
              title="Utilisateurs actifs"
              value={stats.week.users.toString()}
              icon={Users}
              subtitle="7 derniers jours"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenus par Jour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.week.revenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Commandes par Jour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.week.orders}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="month" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <StatCard
              title={t.revenue}
              value={formatPrice(stats.month.revenue)}
              icon={DollarSign}
              subtitle="Ce mois"
            />
            <StatCard
              title={t.totalOrders}
              value={stats.month.orders.toString()}
              icon={ShoppingBag}
              subtitle="Ce mois"
            />
            <StatCard
              title="Utilisateurs actifs"
              value={stats.month.users.toString()}
              icon={Users}
              subtitle="Ce mois"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenus par Semaine</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.month.revenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Commandes par Semaine</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.month.orders}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="year" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <StatCard
              title={t.revenue}
              value={formatPrice(stats.year.revenue)}
              icon={DollarSign}
              subtitle="Cette année"
            />
            <StatCard
              title={t.totalOrders}
              value={stats.year.orders.toString()}
              icon={ShoppingBag}
              subtitle="Cette année"
            />
            <StatCard
              title="Utilisateurs actifs"
              value={stats.year.users.toString()}
              icon={Users}
              subtitle="Cette année"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenus par Mois</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.year.revenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Commandes par Mois</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.year.orders}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Additional Insights */}
      <div className="mt-8 grid md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Tendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              {stats.week.revenue > stats.month.revenue / 4
                ? 'Croissance positive cette semaine'
                : 'Performance stable'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Moyenne par commande</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-foreground">
              {stats.month.orders > 0
                ? formatPrice(Math.round(stats.month.revenue / stats.month.orders))
                : formatPrice(0)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Ce mois</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Commandes quotidiennes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-foreground">
              {stats.month.orders > 0
                ? Math.round(stats.month.orders / 30)
                : 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Moyenne par jour</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
