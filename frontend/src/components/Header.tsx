import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { ShoppingCart, Bell } from 'lucide-react';
import { useState } from 'react';
import type { User } from '../lib/mockData';
import { useApp } from '../lib/AppContext';
import { LanguageThemeToggle } from './shared/LanguageThemeToggle';
import logoLight from 'figma:asset/6915f644ddb74896e8e60fd63fb403396fe94520.png';
import logoDark from 'figma:asset/a9910aea54ee8db13a6aba96c2e19683fd5b24fc.png';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  role: 'student' | 'employee' | 'manager' | 'admin';
  notifCount?: number;
  onClearNotif?: () => void;
}

export function Header({ currentPage, onNavigate, user, onLogin, onLogout, role, notifCount = 0, onClearNotif }: HeaderProps) {
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { t, theme } = useApp();

  const customerPages = ['home', 'menu', 'profile', 'complaint'];
  const employeePages = ['home', 'dashboard', 'orders', 'menu', 'complaints', 'about', 'contacts'];
  const managerPages = ['home', 'dashboard', 'orders', 'employees', 'menu', 'complaints', 'about', 'contacts'];
  const adminPages = ['home', 'dashboard', 'orders', 'employees', 'menu', 'complaints', 'events', 'about', 'contacts'];

  const getPages = () => {
    switch (role) {
      case 'student':
        return customerPages;
      case 'employee':
        return employeePages;
      case 'manager':
        return managerPages;
      case 'admin':
        return adminPages;
      default:
        return customerPages;
    }
  };

  const getPageLabel = (page: string) => {
    const labels: Record<string, string> = {
      home: t.home,
      menu: t.menu,
      profile: t.profile,
      complaint: t.complaints,
      dashboard: t.dashboard,
      orders: t.orders,
      employees: t.employees,
      complaints: t.complaints,
      events: t.events,
      about: t.about,
      contacts: t.contacts,
    };
    return labels[page] || page;
  };

  const handleExit = () => {
    if (role === 'student') {
      onLogout();
    } else {
      setShowLogoutConfirm(true);
    }
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    setShowExitDialog(true);
  };

  const handleRoleSwitch = (newRole: string) => {
    setShowExitDialog(false);
    if (newRole === 'logout') {
      onLogout();
    } else {
      onNavigate(`${newRole}-home`);
    }
  };

  const getAvailableRoles = () => {
    const roles = ['student'];
    if (user?.role === 'employee' || user?.role === 'manager' || user?.role === 'admin') {
      roles.push('employee');
    }
    if (user?.role === 'manager' || user?.role === 'admin') {
      roles.push('manager');
    }
    if (user?.role === 'admin') {
      roles.push('admin');
    }
    return roles;
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'student': t.customer,
      'employee': t.employee,
      'manager': t.manager,
      'admin': t.administrator,
    };
    return labels[role] || role;
  };

  return (
    <>
      <header className="bg-[#E4E4E4] dark:bg-[#2A2420] border-b border-[#C5B59A] dark:border-[#4A4440]">
        <div className="container mx-auto px-4 py-3 md:py-4">
          {/* Logo and Page Title */}
          <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
            {/* Circular Logo */}
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#CFBD97] dark:border-[#8B7355]">
              <img 
                src={theme === 'dark' ? logoLight : logoDark} 
                alt="ZEDUC-SP@CE" 
                className="w-full h-full object-cover" 
              />
            </div>
            
            {/* Page Title */}
            <h1 className="text-[#3A2F1F] dark:text-[#E8DCC8] text-xl md:text-2xl lg:text-3xl">
              {getPageLabel(currentPage)}
            </h1>
          </div>

          {/* Navigation */}
          <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-3 md:gap-2">
            <nav className="flex gap-1 md:gap-2 flex-wrap w-full md:w-auto">
              {getPages().map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onNavigate(page)}
                  className={`text-xs md:text-sm ${currentPage === page ? 'bg-[#CFBD97] dark:bg-[#8B7355] text-[#3A2F1F] dark:text-[#E8DCC8] hover:bg-[#CFBD97]/90' : 'text-[#3A2F1F] dark:text-[#E8DCC8] hover:bg-[#E8DCC8] dark:hover:bg-[#3A3430]'}`}
                >
                  {getPageLabel(page)}
                </Button>
              ))}
              <Button variant="ghost" size="sm" onClick={handleExit} className="text-xs md:text-sm text-[#3A2F1F] dark:text-[#E8DCC8] hover:bg-[#E8DCC8] dark:hover:bg-[#3A3430]">
                {t.logout}
              </Button>
            </nav>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              {/* Notifications visible pour tous les rôles */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => { onClearNotif?.(); onNavigate('orders'); }}
                className="relative border-[#C5B59A] dark:border-[#4A4440] text-[#3A2F1F] dark:text-[#E8DCC8] hover:bg-[#E8DCC8] dark:hover:bg-[#3A3430]"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4 md:h-5 md:w-5" />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">
                    {notifCount}
                  </span>
                )}
              </Button>

              {role === 'student' && (
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => onNavigate('orders')}
                  className="border-[#C5B59A] dark:border-[#4A4440] text-[#3A2F1F] dark:text-[#E8DCC8] hover:bg-[#E8DCC8] dark:hover:bg-[#3A3430] flex-shrink-0"
                >
                  <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="sr-only">{t.viewOrder}</span>
                </Button>
              )}
              
              {user ? (
                <>
                  <LanguageThemeToggle />
                  <Button variant="outline" size="sm" onClick={onLogout} className="border-[#CFBD97] dark:border-[#8B7355] text-[#3A2F1F] dark:text-[#E8DCC8] hover:bg-[#E8DCC8] dark:hover:bg-[#3A3430] text-xs md:text-sm">
                    <span className="hidden sm:inline">{t.logout} ({user.firstName})</span>
                    <span className="sm:hidden">{t.logout}</span>
                  </Button>
                </>
              ) : (
                <>
                  <LanguageThemeToggle />
                  <Button onClick={onLogin} size="sm" className="bg-[#CFBD97] dark:bg-[#8B7355] text-[#3A2F1F] dark:text-[#E8DCC8] hover:bg-[#CFBD97]/90 text-xs md:text-sm">
                    {t.login}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="bg-[#E4E4E4] dark:bg-[#2A2420] border-[#C5B59A] dark:border-[#4A4440] max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-[#3A2F1F] dark:text-[#E8DCC8]">{t.confirmLogout}</DialogTitle>
            <DialogDescription className="text-[#6B5D4F] dark:text-[#B5A89A]">
              {t.logoutMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button
              onClick={() => setShowLogoutConfirm(false)}
              variant="outline"
              className="flex-1 border-[#CFBD97] dark:border-[#8B7355] text-[#3A2F1F] dark:text-[#E8DCC8] hover:bg-[#E8DCC8] dark:hover:bg-[#3A3430]"
            >
              {t.no}
            </Button>
            <Button
              onClick={handleLogoutConfirm}
              className="flex-1 bg-[#CFBD97] dark:bg-[#8B7355] text-[#3A2F1F] dark:text-[#E8DCC8] hover:bg-[#CFBD97]/90"
            >
              {t.yes}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exit Dialog for Employee/Manager/Admin */}
      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="bg-[#E4E4E4] dark:bg-[#2A2420] border-[#C5B59A] dark:border-[#4A4440] max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-[#3A2F1F] dark:text-[#E8DCC8]">{t.chooseInterface}</DialogTitle>
            <DialogDescription className="text-[#6B5D4F] dark:text-[#B5A89A]">
              {t.chooseInterface}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            {getAvailableRoles().map((availableRole) => (
              <Button
                key={availableRole}
                onClick={() => handleRoleSwitch(availableRole)}
                variant="outline"
                className="border-[#CFBD97] dark:border-[#8B7355] text-[#3A2F1F] dark:text-[#E8DCC8] hover:bg-[#E8DCC8] dark:hover:bg-[#3A3430]"
              >
                {getRoleLabel(availableRole)}
              </Button>
            ))}
            <Button onClick={() => handleRoleSwitch('logout')} variant="destructive">
              {t.logout}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}