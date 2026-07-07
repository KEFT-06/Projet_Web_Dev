import { Home, LayoutDashboard, ShoppingBag, Users, Menu as MenuIcon, MessageSquare, BarChart3, UserCircle, Info, Phone, LogOut, Tag, Settings } from 'lucide-react';
import { Button } from '../ui/button';
import { useApp } from '../../lib/AppContext';
import { LanguageThemeToggle } from './LanguageThemeToggle';

interface VerticalSidebarProps {
  role: 'employee' | 'manager' | 'admin';
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

export function VerticalSidebar({ role, currentPage, onNavigate, onLogout }: VerticalSidebarProps) {
  const { t } = useApp();

  const menuItems = [
    { id: 'home', label: t.home, icon: Home, roles: ['employee', 'manager', 'admin'] },
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard, roles: ['employee', 'manager', 'admin'] },
    { id: 'menu', label: t.menu, icon: MenuIcon, roles: ['employee', 'manager', 'admin'] },
    { id: 'orders', label: t.orders, icon: ShoppingBag, roles: ['employee', 'manager', 'admin'] },
    { id: 'complaints', label: t.complaints, icon: MessageSquare, roles: ['employee', 'manager', 'admin'] },
    { id: 'employees', label: t.employees, icon: Users, roles: ['manager', 'admin'] },
    { id: 'statistics', label: t.statistics, icon: BarChart3, roles: ['manager', 'admin'] },
        { id: 'promotions', label: t.promotions, icon: Tag, roles: ['admin'] },
    { id: 'settings', label: t.settings, icon: Settings, roles: ['admin'] },
    { id: 'account', label: t.account, icon: UserCircle, roles: ['manager', 'admin'] },
    { id: 'about', label: t.about, icon: Info, roles: ['employee', 'manager', 'admin'] },
    { id: 'contacts', label: t.contacts, icon: Phone, roles: ['employee', 'manager', 'admin'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(role));

  const handleLogout = () => {
    // Navigate to customer home page
    if (onLogout) {
      onLogout();
    } else {
      onNavigate('customer-home');
    }
  };

  return (
    <div className="w-64 h-screen bg-[#E4E4E4] dark:bg-[#2A2420] border-r border-[#C5B59A] dark:border-[#4A4440] fixed left-0 top-0 overflow-y-auto flex flex-col">
      <div className="p-6 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[#3A2F1F] dark:text-[#E8DCC8]">
            {role === 'employee' && t.employee}
            {role === 'manager' && t.manager}
            {role === 'admin' && t.administrator}
          </h2>
        </div>
        
        <nav className="space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <Button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                variant={isActive ? 'default' : 'ghost'}
                className={`w-full justify-start ${
                  isActive
                    ? 'bg-[#CFBD97] dark:bg-[#8B7355] text-[#3A2F1F] dark:text-[#E8DCC8]'
                    : 'text-[#3A2F1F] dark:text-[#E8DCC8] hover:bg-[#E8DCC8] dark:hover:bg-[#3A3430]'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Bottom section with language toggle and logout */}
      <div className="p-6 border-t border-[#C5B59A] dark:border-[#4A4440] space-y-3">
        <div className="flex justify-center">
          <LanguageThemeToggle />
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start border-[#CFBD97] dark:border-[#8B7355] text-[#3A2F1F] dark:text-[#E8DCC8] hover:bg-[#E8DCC8] dark:hover:bg-[#3A3430]"
        >
          <LogOut className="mr-3 h-5 w-5" />
          {t.logout}
        </Button>
      </div>
    </div>
  );
}
