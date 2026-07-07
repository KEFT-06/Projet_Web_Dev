import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { getUsers, getMenuItems, saveUsers } from "../../lib/storage";
import { Users, Tag, Home, UserCheck, Sparkles, TrendingUp, Package, DollarSign, BarChart3, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { realTimeService } from "../../lib/realTimeService";

import type { User } from "../../lib/mockData";

interface DashboardStats {
  menuItems: number;
  activeEmployees: number;
  activePromotions: number;
}

type EmployeeData = {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  status: string;
  email: string;
  createdAt?: Date;
  lastLogin?: Date;
  timeSpent?: number;
};

export default function AdminDashboard({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [connectedEmployees, setConnectedEmployees] = useState<Array<{
    id: string;
    firstName: string;
    lastName: string;
    position: string;
    role: string;
    lastSeen: Date;
  }>>([]);
  const [stats, setStats] = useState<DashboardStats>({
    menuItems: 0,
    activeEmployees: 0,
    activePromotions: 0
  });


  useEffect(() => {
    const loadData = async () => {
      const userData = await getUsers();
      const menuData = await getMenuItems();

      const employeeData = userData
        .filter(user => user.role === "employee" || user.role === "manager")
        .map(user => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          position: user.position || "",
          status: user.status || "inactive",
          email: user.email,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          timeSpent: user.timeSpent
        }));

      setEmployees(employeeData);
      setStats({
        menuItems: menuData?.length || 0,
        activeEmployees: employeeData.filter(emp => emp.status === "active").length,
        activePromotions: 3
      });
    };

    loadData();

    // Subscribe to real-time updates for connected employees
    const unsubscribe = realTimeService.subscribe('admin-dashboard', (data) => {
      if (data.connectedEmployees) {
        setConnectedEmployees(data.connectedEmployees);
      }
    });

    return unsubscribe;
  }, []);



  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header avec gradient */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Tableau de Bord Administrateur</h1>
            <p className="text-muted-foreground">Gestion complète du restaurant</p>
          </div>
        </div>
        <Button
          onClick={() => onNavigate?.('customer-home')}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Home className="h-4 w-4" />
          Mon Espace
        </Button>
      </div>
      
      {/* Stats Grid avec gradients */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">Éléments du Menu</CardTitle>
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{stats.menuItems}</div>
            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Plats disponibles
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">Employés Actifs</CardTitle>
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-400">{stats.activeEmployees}</div>
            <p className="text-xs text-green-600 mt-1">
              Personnel en service
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-orange-200 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-400">Promotions Actives</CardTitle>
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
              <Tag className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">{stats.activePromotions}</div>
            <p className="text-xs text-orange-600 mt-1">
              Offres en cours
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900">
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-white" />
              </div>
              Employés Connectés
            </CardTitle>
          </CardHeader>
          <CardContent>
            {connectedEmployees.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-muted-foreground">Aucun employé connecté actuellement</p>
              </div>
            ) : (
              <div className="space-y-3">
                {connectedEmployees.map((emp) => (
                  <div key={emp.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 rounded-lg hover:shadow-md transition-shadow">
                    <div>
                      <p className="font-medium">{emp.firstName} {emp.lastName}</p>
                      <p className="text-sm text-muted-foreground capitalize">{emp.position}</p>
                    </div>
                    <Badge variant={emp.role === "manager" ? "default" : "secondary"}>
                      {emp.role}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900">
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              Gestion des Employés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Time Spent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp: EmployeeData) => (
                  <TableRow key={emp.id}>
                    <TableCell>
                      {emp.firstName} {emp.lastName}
                    </TableCell>
                    <TableCell>{emp.position}</TableCell>
                    <TableCell>
                      <Badge variant={emp.status === "active" ? "default" : "secondary"}>
                        {emp.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{emp.email || '-'}</TableCell>
                    <TableCell>
                      {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      {emp.lastLogin ? new Date(emp.lastLogin).toLocaleString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      {emp.timeSpent ? `${Math.round(emp.timeSpent)} min` : '0 min'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
