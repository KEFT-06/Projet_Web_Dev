import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getOrders, getUsers } from '../../lib/storage';
import type { User } from '../../lib/mockData';
import { apiStatsOverview } from '../../lib/api';

export function CustomerTopCustomers() {
  const [period, setPeriod] = useState<'day'|'week'|'month'>('week');
  const [top, setTop] = useState<{ user: User; orderCount: number }[]>([]);

  useEffect(() => {
    // Try API overview for global ranking (fallback to local)
    const token = localStorage.getItem('auth_token') || undefined;
    let cancelled = false;
    (async () => {
      if (token) {
        try {
          const ov = await apiStatsOverview(token);
          if (cancelled) return;
          // Map to users if present in storage; otherwise show IDs only
          const users = getUsers();
          const byId = new Map(users.map(u => [u.id, u] as const));
          const list = ov.topCustomers.slice(0, 10).map((c) => {
            const u = byId.get(c.userId) || { id: c.userId, email: '', password: '', firstName: c.userId.slice(0,6), lastName: '', role: 'customer' as const, loyaltyPoints: 0 };
            return { user: u as User, orderCount: c.count };
          });
          setTop(list);
          return;
        } catch {}
      }
      // Fallback: compute from local orders with current period filter
      const orders = getOrders();
      const users = getUsers().filter(u => u.role === 'customer');
      const now = new Date();
      const filtered = orders.filter((o) => {
        const d = new Date(o.timestamp);
        if (period === 'day') return d.toDateString() === now.toDateString();
        if (period === 'week') {
          const diff = (now.getTime() - d.getTime()) / (1000*60*60*24);
          return diff <= 7;
        }
        if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        return true;
      });
      const counts = new Map<string, number>();
      for (const o of filtered) counts.set(o.customerId, (counts.get(o.customerId) || 0) + 1);
      const list = users
        .map(u => ({ user: u, orderCount: counts.get(u.id) || 0 }))
        .filter(x => x.orderCount > 0)
        .sort((a,b) => b.orderCount - a.orderCount)
        .slice(0, 10);
      if (!cancelled) setTop(list);
    })();
    return () => { cancelled = true; };
  }, [period]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-foreground">Top 10 des meilleurs clients</h1>
        <div className="w-44">
          <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
            <SelectTrigger className="bg-input text-foreground border-border">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="day" className="text-foreground">Jour</SelectItem>
              <SelectItem value="week" className="text-foreground">Semaine</SelectItem>
              <SelectItem value="month" className="text-foreground">Mois</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Classement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {top.length === 0 ? (
              <div className="text-muted-foreground">Aucune donnée pour cette période</div>
            ) : top.map((entry, idx) => (
              <div key={entry.user.id} className="flex items-center justify-between p-2 rounded">
                <div className="flex items-center gap-3">
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full ${idx < 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>{idx+1}</span>
                  <span className="text-foreground">{entry.user.firstName} {entry.user.lastName}</span>
                </div>
                <Badge className="bg-muted text-foreground">{entry.orderCount} commandes</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
