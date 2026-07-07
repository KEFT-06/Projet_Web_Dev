// Statistics service with role-based filtering

import { getOrders, getUsers, getComplaints, getMenuItems } from './storage';
import type { Order, User, Complaint, MenuItem } from './mockData';
import type { Role } from './permissions';

export interface StatisticsData {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalComplaints: number;
  averageOrderValue: number;
  topSellingItems: Array<{ item: MenuItem; quantity: number; revenue: number }>;
  ordersByStatus: Record<Order['status'], number>;
  complaintsByStatus: Record<Complaint['status'], number>;
  customerRetention: number;
  loyaltyPointsDistributed: number;
  recentActivity: Array<{
    type: 'order' | 'complaint' | 'user';
    description: string;
    timestamp: Date;
  }>;
}

export function getStatisticsForRole(role: Role, timeFilter?: 'day' | 'week' | 'month'): StatisticsData {
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
    default:
      filterDate.setFullYear(2020); // All time
  }

  const orders = getOrders().filter(order => order.timestamp >= filterDate);
  const users = getUsers();
  const complaints = getComplaints().filter(complaint => complaint.timestamp >= filterDate);
  const menuItems = getMenuItems();

  // Calculate basic metrics
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalCustomers = users.filter(u => u.role === 'customer').length;
  const totalComplaints = complaints.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Top selling items
  const itemSales = new Map<string, { quantity: number; revenue: number }>();
  orders.forEach(order => {
    order.items.forEach(item => {
      const existing = itemSales.get(item.menuItemId) || { quantity: 0, revenue: 0 };
      itemSales.set(item.menuItemId, {
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + (item.price * item.quantity)
      });
    });
  });

  const topSellingItems = Array.from(itemSales.entries())
    .map(([menuItemId, stats]) => {
      const item = menuItems.find(m => m.id === menuItemId);
      return item ? { item, ...stats } : null;
    })
    .filter((item): item is { item: MenuItem; quantity: number; revenue: number } => item !== null)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Orders by status
  const ordersByStatus = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<Order['status'], number>);

  // Complaints by status
  const complaintsByStatus = complaints.reduce((acc, complaint) => {
    acc[complaint.status] = (acc[complaint.status] || 0) + 1;
    return acc;
  }, {} as Record<Complaint['status'], number>);

  // Customer retention (simplified - customers with multiple orders)
  const customerOrderCounts = orders.reduce((acc, order) => {
    acc[order.customerId] = (acc[order.customerId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const customersWithMultipleOrders = Object.values(customerOrderCounts).filter(count => count > 1).length;
  const customerRetention = totalCustomers > 0 ? (customersWithMultipleOrders / totalCustomers) * 100 : 0;

  // Loyalty points
  const loyaltyPointsDistributed = users
    .filter(u => u.role === 'customer')
    .reduce((sum, user) => sum + user.loyaltyPoints, 0);

  // Recent activity (last 10 items)
  const recentActivity = [
    ...orders.slice(-5).map(order => ({
      type: 'order' as const,
      description: `New order from ${order.customerName} - ${order.total} XAF`,
      timestamp: order.timestamp
    })),
    ...complaints.slice(-3).map(complaint => ({
      type: 'complaint' as const,
      description: `Complaint from ${complaint.customerName}: ${complaint.subject}`,
      timestamp: complaint.timestamp
    })),
    ...users.filter(u => u.createdAt && u.createdAt >= filterDate).slice(-2).map(user => ({
      type: 'user' as const,
      description: `New ${user.role} registered: ${user.firstName} ${user.lastName}`,
      timestamp: user.createdAt!
    }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);

  // Role-based filtering
  const filteredData: StatisticsData = {
    totalOrders,
    totalRevenue,
    totalCustomers,
    totalComplaints,
    averageOrderValue,
    topSellingItems,
    ordersByStatus,
    complaintsByStatus,
    customerRetention,
    loyaltyPointsDistributed,
    recentActivity
  };

  // Apply role-based restrictions
  switch (role) {
    case 'employee':
      // Employees see limited stats, no customer data
      return {
        ...filteredData,
        totalCustomers: 0, // Hide customer count
        customerRetention: 0, // Hide retention metrics
        loyaltyPointsDistributed: 0, // Hide loyalty data
      };

    case 'manager':
      // Managers see most stats but limited customer details
      return filteredData;

    case 'admin':
      // Admins see everything
      return filteredData;

    default:
      // Customers see minimal stats
      return {
        totalOrders: 0,
        totalRevenue: 0,
        totalCustomers: 0,
        totalComplaints: 0,
        averageOrderValue: 0,
        topSellingItems: [],
        ordersByStatus: {} as any,
        complaintsByStatus: {} as any,
        customerRetention: 0,
        loyaltyPointsDistributed: 0,
        recentActivity: []
      };
  }
}
