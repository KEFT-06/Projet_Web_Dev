import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { getOrders, getUsers, getEmployees } from '../../lib/storage';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon, DollarSign, Users, TrendingUp, ShoppingBag, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface ChartData {
  name: string;
  value: number;
}

interface Stats {
  totalSales: number;
  salesPercentage: number;
  newCustomers: number;
  returningCustomers: number;
  dailyRevenue: ChartData[];
  weeklyRevenue: ChartData[];
  monthlyRevenue: ChartData[];
  customerGrowth: ChartData[];
  employeePerformance: ChartData[];
  topSellingItems: ChartData[];
  ordersByHour: ChartData[];
}

export default function Statistics() {
  const [stats, setStats] = useState<Stats>({
    totalSales: 0,
    salesPercentage: 0,
    newCustomers: 0,
    returningCustomers: 0,
    dailyRevenue: [],
    weeklyRevenue: [],
    monthlyRevenue: [],
    customerGrowth: [],
    employeePerformance: [],
    topSellingItems: [],
    ordersByHour: []
  });

  useEffect(() => {
    loadData();
    // Simulation de mises à jour en temps réel
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    const orders = getOrders();
    const users = getUsers().filter(u => u.role === 'customer');
    const employees = getEmployees();

    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calcul des nouveaux clients
    const newCustomers = users.filter(u => {
      const userId = parseInt(u.id.substring(1));
      return new Date(userId) > thirtyDaysAgo;
    }).length;

    // Calcul des clients fidèles
    const returningCustomers = users.filter(u => {
      const userOrders = orders.filter(o => o.customerId === u.id);
      return userOrders.length > 1;
    }).length;

    // Calcul des ventes
    const totalSales = orders.filter(o => o.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total, 0);
    
    const lastMonthOrders = orders.filter(o => 
      new Date(o.timestamp).getTime() > thirtyDaysAgo.getTime() && 
      o.status !== 'cancelled'
    );
    
    const salesPercentage = lastMonthOrders.length > 0 
      ? ((lastMonthOrders.reduce((sum, o) => sum + o.total, 0) / totalSales) * 100)
      : 0;

    // Générer des données de graphique simulées
    const dailyRevenue = generateDailyRevenue();
    const customerGrowth = generateCustomerGrowth();
    const employeePerformance = generateEmployeePerformance(employees);

    // Génération des données pour les graphiques
    const dailyRevenue = generateDailyRevenue(orders);
    const weeklyRevenue = generateWeeklyRevenue(orders);
    const monthlyRevenue = generateMonthlyRevenue(orders);
    const customerGrowth = generateCustomerGrowth(users);
    const employeePerformance = generateEmployeePerformance(employees, orders);
    const topSellingItems = generateTopSellingItems(orders);
    const ordersByHour = generateOrdersByHour(orders);

    setStats({
      totalSales,
      salesPercentage,
      newCustomers,
      returningCustomers,
      dailyRevenue,
      weeklyRevenue,
      monthlyRevenue,
      customerGrowth,
      employeePerformance,
      topSellingItems,
      ordersByHour
    });
  };

  const generateDailyRevenue = (orders: any[]): ChartData[] => {
    const today = new Date();
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return hours.map(hour => {
      const hourOrders = orders.filter(o => {
        const orderDate = new Date(o.timestamp);
        return orderDate.getHours() === hour &&
               orderDate.getDate() === today.getDate() &&
               orderDate.getMonth() === today.getMonth();
      });
      
      return {
        name: `${hour}h`,
        value: hourOrders.reduce((sum, o) => sum + o.total, 0)
      };
    });
  };

  const generateWeeklyRevenue = (orders: any[]): ChartData[] => {
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const today = new Date();
    
    return days.map(day => {
      const dayOrders = orders.filter(o => {
        const orderDate = new Date(o.timestamp);
        return days[orderDate.getDay()] === day &&
               orderDate > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      });
      
      return {
        name: day,
        value: dayOrders.reduce((sum, o) => sum + o.total, 0)
      };
    });
  };

  const generateMonthlyRevenue = (orders: any[]): ChartData[] => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const today = new Date();
    
    return months.slice(0, today.getMonth() + 1).map(month => {
      const monthOrders = orders.filter(o => {
        const orderDate = new Date(o.timestamp);
        return months[orderDate.getMonth()] === month &&
               orderDate.getFullYear() === today.getFullYear();
      });
      
      return {
        name: month,
        value: monthOrders.reduce((sum, o) => sum + o.total, 0)
      };
    });
  };

  const generateCustomerGrowth = (users: any[]): ChartData[] => {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'];
    const today = new Date();
    
    return months.map((month, index) => ({
      name: month,
      value: users.filter(u => {
        const createdAt = new Date(parseInt(u.id.substring(1)));
        return createdAt.getMonth() === today.getMonth() - (5 - index);
      }).length
    }));
  };

  const generateTopSellingItems = (orders: any[]): ChartData[] => {
    const itemCounts = orders.reduce((acc: any, order: any) => {
      order.items.forEach((item: any) => {
        acc[item.name] = (acc[item.name] || 0) + item.quantity;
      });
      return acc;
    }, {});

    return Object.entries(itemCounts)
      .map(([name, value]) => ({ name, value: value as number }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const generateOrdersByHour = (orders: any[]): ChartData[] => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return hours.map(hour => ({
      name: `${hour}h`,
      value: orders.filter(o => new Date(o.timestamp).getHours() === hour).length
    }));
  };

  const generateEmployeePerformance = (employees: any[], orders: any[]): ChartData[] => {
    return employees
      .filter(e => e.role === 'employee')
      .map(employee => ({
        name: `${employee.firstName} ${employee.lastName.charAt(0)}.`,
        value: orders.filter(o => o.employeeId === employee.id).length
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Statistiques en temps réel</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                Ventes Totales
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSales.toFixed(2)} €</div>
            <div className="flex items-center text-sm">
              {stats.salesPercentage > 0 ? (
                <ArrowUpIcon className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 text-red-500" />
              )}
              <span className={stats.salesPercentage > 0 ? "text-green-500" : "text-red-500"}>
                {Math.abs(stats.salesPercentage).toFixed(1)}%
              </span>
              <span className="text-gray-500 ml-1">vs mois dernier</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Nouveaux Clients
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newCustomers}</div>
            <p className="text-sm text-gray-500">Derniers 30 jours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                Clients Fidèles
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.returningCustomers}</div>
            <p className="text-sm text-gray-500">Clients avec commandes multiples</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenus Journaliers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.dailyRevenue}>
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
            <CardTitle>Croissance Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.customerGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance des Employés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.employeePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#ffc658" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}