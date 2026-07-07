import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Bell, ShoppingCart, MessageSquare, Gift, RefreshCw, AlertCircle, CheckCircle, X } from 'lucide-react';
import { notificationService, type Notification } from '../../lib/notificationService';
import { useApp } from '../../lib/AppContext';
import type { User } from '../../lib/mockData';

export type AppNotification = {
  id: string;
  type: 'order_created' | 'order_status' | 'order_paid' | string;
  message: string;
  time: string; // ISO
};

interface NotificationsCenterProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

export function NotificationsCenter({ open, onClose, user }: NotificationsCenterProps) {
  const { language } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Charger les notifications
    const loadNotifications = () => {
      const userNotifs = notificationService.getUserNotifications(user.id, user.role);
      setNotifications(userNotifs);
      setUnreadCount(notificationService.getUnreadCount(user.id, user.role));
    };

    loadNotifications();

    // S'abonner aux nouvelles notifications
    const unsubscribe = notificationService.subscribe(user.id, () => {
      loadNotifications();
    });

    // Actualiser toutes les 5 secondes
    const interval = setInterval(loadNotifications, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [user]);

  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
    if (user) {
      const userNotifs = notificationService.getUserNotifications(user.id, user.role);
      setNotifications(userNotifs);
      setUnreadCount(notificationService.getUnreadCount(user.id, user.role));
    }
  };

  const handleMarkAllAsRead = () => {
    if (user) {
      notificationService.markAllAsRead(user.id, user.role);
      const userNotifs = notificationService.getUserNotifications(user.id, user.role);
      setNotifications(userNotifs);
      setUnreadCount(0);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order:new':
      case 'order:status':
        return <ShoppingCart className="w-4 h-4" />;
      case 'complaint:new':
      case 'complaint:response':
        return <MessageSquare className="w-4 h-4" />;
      case 'promotion:new':
        return <Gift className="w-4 h-4" />;
      case 'refund:processed':
        return <RefreshCw className="w-4 h-4" />;
      case 'admin:message':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order:new':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'complaint:new':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'promotion:new':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'refund:processed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'admin:message':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="bg-[#E4E4E4] dark:bg-[#2A2420] border-[#C5B59A] dark:border-[#4A4440] max-w-2xl w-[90vw]">
        <DialogHeader>
          <DialogTitle className="text-[#3A2F1F] dark:text-[#E8DCC8] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <span>{language === 'fr' ? 'Notifications' : 'Notifications'}</span>
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
              )}
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleMarkAllAsRead}
                  className="border-[#CFBD97] dark:border-[#8B7355]"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {language === 'fr' ? 'Tout marquer comme lu' : 'Mark all as read'}
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-3">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">{language === 'fr' ? 'Aucune notification' : 'No notifications'}</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  notification.read 
                    ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900' 
                    : 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-950'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{notification.title}</h4>
                        {!notification.read && (
                          <Badge className="bg-orange-500 text-white text-xs">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-foreground/80">{notification.message}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{notification.from.name}</span>
                        <span>•</span>
                        <span>{notification.from.role}</span>
                        <span>•</span>
                        <span>{new Date(notification.timestamp).toLocaleString(language)}</span>
                      </div>
                    </div>
                  </div>
                  {!notification.read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="ml-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Export du composant Badge de notification
export function NotificationBadge({ user }: { user: User | null }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const checkUnread = () => {
      setUnreadCount(notificationService.getUnreadCount(user.id, user.role));
    };

    checkUnread();
    const interval = setInterval(checkUnread, 5000);

    return () => clearInterval(interval);
  }, [user]);

  if (unreadCount === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  );
}
