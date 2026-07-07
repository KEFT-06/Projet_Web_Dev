import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { getUsers, getConnectedEmployees } from '../../lib/storage';
import { Filter, Calendar, Clock } from 'lucide-react';
import type { User } from '../../lib/mockData';
import { Input } from '../ui/input';
import { apiGetUsers, apiCreateUser, apiDeleteUser } from '../../lib/api';

type Status = 'active' | 'inactive';
type TimeFilter = 'today' | 'week' | 'month' | 'all';

export default function ManagerEmployees() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [connectedEmployees, setConnectedEmployees] = useState<User[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'employee' as 'employee'|'manager', phone: '' });

  // Load employees on component mount
  useEffect(() => {
    loadEmployees();
    
    // Update connected employees every 10 seconds
    const interval = setInterval(() => {
      setConnectedEmployees(getConnectedEmployees());
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    const token = localStorage.getItem('auth_token') || undefined;
    if (token) {
      try {
        const res = await apiGetUsers(undefined, token);
        const mapped: User[] = res.users
          .filter(u => u.role === 'employee' || u.role === 'manager')
          .map(u => ({ id: u.id, email: u.email, password: '', firstName: u.firstName, lastName: u.lastName, role: u.role as any, loyaltyPoints: 0 }));
        setEmployees(mapped);
        setConnectedEmployees(getConnectedEmployees());
        setLoading(false);
        return;
      } catch {}
    }
    const allUsers = getUsers();
    const employeeUsers = allUsers.filter(user => user.role === 'employee' || user.role === 'manager');
    setEmployees(employeeUsers);
    setConnectedEmployees(getConnectedEmployees());
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('auth_token') || undefined;
    if (!token) return;
    try {
      await apiCreateUser({ firstName: form.firstName, lastName: form.lastName, email: form.email, password: form.password, phone: form.phone || undefined, role: form.role }, token);
      setForm({ firstName: '', lastName: '', email: '', password: '', role: 'employee', phone: '' });
      await loadEmployees();
    } catch {}
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('auth_token') || undefined;
    if (token) {
      try { await apiDeleteUser(id, token); await loadEmployees(); return; } catch {}
    }
  };

  // Filter employees based on status and time period
  const filteredEmployees = employees.filter(emp => {
    const statusMatch = statusFilter === 'all' || emp.status === statusFilter;

    if (timeFilter === 'all') return statusMatch;

    const now = new Date();
    const lastLogin = emp.lastLogin ? new Date(emp.lastLogin) : null;

    if (!lastLogin) return false;

    switch (timeFilter) {
      case 'today':
        return statusMatch && lastLogin.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return statusMatch && lastLogin >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return statusMatch && lastLogin >= monthAgo;
      default:
        return statusMatch;
    }
  });



  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employee Management</h1>
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={(value: Status | 'all') => setStatusFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeFilter} onValueChange={(value: TimeFilter) => setTimeFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Create employee */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Créer un employé</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <Input placeholder="Prénom" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            <Input placeholder="Nom" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input type="password" placeholder="Mot de passe (A1...)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as any })}>
              <SelectTrigger>
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="employee">Employé</SelectItem>
                <SelectItem value="manager">Gérant</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={loading}>Créer</Button>
          </form>
        </CardContent>
      </Card>

      {/* Connected Employees - Real-time */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            Employés Connectés en Temps Réel ({connectedEmployees.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connectedEmployees.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Aucun employé connecté actuellement</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectedEmployees.map((emp) => (
                <Card key={emp.id} className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold">{emp.firstName} {emp.lastName}</p>
                        <p className="text-sm text-muted-foreground">{emp.email}</p>
                      </div>
                      <Badge variant="default" className="bg-green-600">En ligne</Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><strong>Poste:</strong> {emp.role === 'manager' ? 'Gérant' : 'Employé'}</p>
                      <p><strong>Dernière connexion:</strong> {emp.lastLogin ? new Date(emp.lastLogin).toLocaleTimeString() : 'N/A'}</p>
                      <p><strong>Temps total:</strong> {emp.timeSpent ? `${Math.round(emp.timeSpent / 60000)} min` : '0 min'}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employee Activity Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Time Spent</TableHead>
                <TableHead>Login History</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    {employee.firstName} {employee.lastName}
                  </TableCell>
                  <TableCell>
                    <Badge variant={employee.position === 'manager' ? 'default' : 'secondary'}>
                      {employee.position}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        employee.status === 'active' ? 'default' :
                        employee.status === 'inactive' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {employee.lastLogin ? new Date(employee.lastLogin).toLocaleString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {employee.timeSpent ? `${Math.round(employee.timeSpent)} min` : '0 min'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {employee.loginHistory ? employee.loginHistory.length : 0} sessions
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(employee.id)}>Supprimer</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

    </div>
  );
}
