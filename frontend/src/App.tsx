import { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { AppProvider } from './lib/AppContext';
import { Header } from './components/Header';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { CustomerHome } from './components/customer/CustomerHome';
import { CustomerMenu } from './components/customer/CustomerMenu';
import { CustomerProfile } from './components/customer/CustomerProfile';
import { CustomerOrders } from './components/customer/CustomerOrders';
import { CustomerComplaint } from './components/customer/CustomerComplaint';
import { EmployeeHome } from './components/employee/EmployeeHome';
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';
import { DailyMenuManagement } from './components/employee/DailyMenuManagement';
import { WeeklyStatistics } from './components/employee/WeeklyStatistics';
import { OrdersView } from './components/shared/OrdersView';
// import { ComplaintsManagement } from './components/shared/ComplaintsManagement';
import { ManagerDashboard } from './components/manager/ManagerDashboard';
import ManagerEmployees from './components/manager/ManagerEmployees';
import AdminDashboard from './components/admin/AdminDashboard';

import { ModernPromotionsManagement } from './components/admin/ModernPromotionsManagement';
import { ComplaintsManagement } from './components/shared/ComplaintsManagement';
import { SettingsManagement } from './components/admin/SettingsManagement';
import { ContactsPage } from './components/shared/ContactsPage';
import { AboutPage } from './components/shared/AboutPage';
import { MenuManagement } from './components/shared/MenuManagement';
import { AccountPage } from './components/shared/AccountPage';
import { StatisticsPage } from './components/shared/StatisticsPage';
import { AdvancedStatistics } from './components/admin/AdvancedStatistics';
import { VerticalSidebar } from './components/shared/VerticalSidebar';
import { WelcomePage } from './components/shared/WelcomePage';
import { ModernHomePage } from './components/shared/ModernHomePage';
import { NotificationsCenter, type AppNotification } from './components/shared/NotificationsCenter';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { CookieBanner } from './components/shared/CookieBanner';
import { TopCustomers } from './components/customer/TopCustomers';
import { initializeStorage, getCurrentUser, setCurrentUser, rebuildMenuFromPublicJson, trackEmployeeLogout } from './lib/storage';
import { CookieConsent } from './components/shared/CookieConsent';
import { toast } from 'sonner';
import type { User } from './lib/mockData';

type Page = 
  | 'login' 
  | 'signup'
  | 'welcome'
  | 'forgot'
  | 'home' 
  | 'menu' 
  | 'profile' 
  | 'orders'
  | 'complaint' 
  | 'dashboard'
  | 'employees'
  | 'statistics'
  | 'promotions'
  | 'settings'
  | 'account'
  | 'about'
  | 'contacts'
  | 'complaints'
  | 'customer-home'
  | 'employee-home'
  | 'manager-home'
  | 'admin-home'
  | 'top-customers'
  | 'daily-menu';

type Role = 'student' | 'employee' | 'manager' | 'admin';

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<Role>('student');
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [notifCount, setNotifCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifList, setNotifList] = useState<AppNotification[]>([]);

  const inferRoleFromEmail = (email: string): Role => {
    const e = (email || '').toLowerCase();
    if (e.endsWith('@zeduc.admin.com')) return 'admin';
    if (e.endsWith('@zeduc.manager.com')) return 'manager';
    if (e.endsWith('@zeduc.employe.com') || e.endsWith('@zeduc.employe,com')) return 'employee';
    return 'student';
  };

  useEffect(() => {
    // Initialize storage on app load
    initializeStorage();
    // Rebuild menu from public JSON (images-driven)
    try { void rebuildMenuFromPublicJson(); } catch {}
    
    // Check if user is already logged in
    const savedUser = getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
      setCurrentRole(inferRoleFromEmail(savedUser.email));
      setCurrentPage('home');
    }
  }, []);

  // Real-time notifications via SSE
  useEffect(() => {
    const base = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
    const es = new EventSource(base + '/api/stream');
    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data || '{}');
        if (data?.type === 'order_created') {
          toast.success('Nouvelle commande créée');
          setNotifCount((n) => n + 1);
          setNotifList((lst) => [...lst, { id: crypto.randomUUID?.() || String(Date.now()), type: 'order_created', message: 'Nouvelle commande créée', time: new Date().toISOString() }]);
        } else if (data?.type === 'order_status') {
          toast.info(`Commande mise à jour: ${data.status}`);
          setNotifCount((n) => n + 1);
          setNotifList((lst) => [...lst, { id: crypto.randomUUID?.() || String(Date.now()), type: 'order_status', message: `Commande mise à jour: ${data.status}`, time: new Date().toISOString() }]);
        } else if (data?.type === 'order_paid') {
          toast.success('Commande payée');
          setNotifCount((n) => n + 1);
          setNotifList((lst) => [...lst, { id: crypto.randomUUID?.() || String(Date.now()), type: 'order_paid', message: 'Commande payée', time: new Date().toISOString() }]);
        }
      } catch {}
    };
    es.onerror = () => {};
    return () => es.close();
  }, []);

  const handleLogin = (loggedInUser: User, _role: Role) => {
    setUser(loggedInUser);
    setCurrentUser(loggedInUser);
    const r = inferRoleFromEmail(loggedInUser.email);
    setCurrentRole(r);
    // After login, go to Welcome then Home (will render EmployeeHome or WelcomePage depending on role)
    setCurrentPage('welcome');
  };

  const handleLogout = () => {
    // Track employee logout for real-time monitoring
    if (user && (user.role === 'employee' || user.role === 'manager')) {
      trackEmployeeLogout(user.id);
    }

    setUser(null);
    try { localStorage.removeItem('auth_token'); } catch {}
    setCurrentUser(null);
    setCurrentRole('student');
    setCurrentPage('login');
  };

  const handleSignupSuccess = (_newUser: User) => {
    // Redirect to login page instead of auto-login
    setCurrentPage('login');
  };

  const handleNavigate = (page: string) => {
    // Handle role switching
    if (page === 'customer-home') {
      setCurrentRole('student');
      setCurrentPage('home');
      return;
    }
    if (page === 'employee-home') {
      setCurrentRole('employee');
      setCurrentPage('home');
      return;
    }
    if (page === 'manager-home') {
      setCurrentRole('manager');
      setCurrentPage('home');
      return;
    }
    if (page === 'admin-home') {
      setCurrentRole('admin');
      setCurrentPage('home');
      return;
    }
    
    setCurrentPage(page as Page);
  };

  const renderPage = () => {
    // Home page (not logged in)
    if (currentPage === 'home' && !user) {
      return <ModernHomePage onNavigate={handleNavigate} />;
    }

    // Auth pages
    if (currentPage === 'login') {
      return (
        <LoginPage
          onLogin={handleLogin}
          onNavigateToSignup={() => setCurrentPage('signup')}
          onNavigateToForgot={() => setCurrentPage('forgot')}
        />
      );
    }

    if (currentPage === 'signup') {
      return (
        <SignupPage
          onSignupSuccess={handleSignupSuccess}
          onNavigateToLogin={() => setCurrentPage('login')}
        />
      );
    }

    if (currentPage === 'forgot') {
      return (
        <ForgotPasswordPage
          onBackToLogin={() => setCurrentPage('login')}
        />
      );
    }

    // Require authentication for all other pages
    if (!user) {
      return <ModernHomePage onNavigate={handleNavigate} />;
    }

    // Customer Interface
    if (currentRole === 'student') {
      switch (currentPage) {
        case 'welcome':
          return <WelcomePage user={user} onGoToSpace={() => setCurrentPage('home')} />;
        case 'home':
          return <CustomerHome onNavigate={handleNavigate} user={user} />;
        case 'menu':
          return <CustomerMenu user={user} />;
        case 'orders':
          return <CustomerOrders user={user} />;
        case 'profile':
          return <CustomerProfile user={user} onGoTopCustomers={() => setCurrentPage('top-customers')} />;
        case 'top-customers':
          return <TopCustomers />;
        case 'complaint':
          return <CustomerComplaint user={user} />;
        default:
          return <CustomerHome onNavigate={handleNavigate} user={user} />;
      }
    }

    // Employee Interface (with vertical sidebar)
    if (currentRole === 'employee') {
      return (
        <>
          <VerticalSidebar role="employee" currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout} />
          {(() => {
            switch (currentPage) {
              case 'welcome':
                return <EmployeeHome onNavigate={handleNavigate} role={currentRole} />;
              case 'home':
                return <EmployeeHome onNavigate={handleNavigate} role={currentRole} />;
              case 'dashboard':
                return <div className="ml-64"><EmployeeDashboard /></div>;
              case 'orders':
                return <div className="ml-64"><OrdersView canEdit={false} canDelete={false} /></div>;
              case 'menu':
                return <div className="ml-64"><MenuManagement canEdit={true} canDelete={false} /></div>;
              case 'daily-menu':
                return <div className="ml-64"><DailyMenuManagement userId={user.id} /></div>;
              case 'statistics':
                return <div className="ml-64"><WeeklyStatistics /></div>;
              case 'complaints':
                return <div className="ml-64"><ComplaintsManagement user={user} role="employee" /></div>;
              case 'about':
                return <div className="ml-64"><AboutPage /></div>;
              case 'contacts':
                return <div className="ml-64"><ContactsPage /></div>;
              default:
                return <EmployeeHome onNavigate={handleNavigate} />;
            }
          })()}
        </>
      );
    }

    // Manager Interface (with vertical sidebar)
    if (currentRole === 'manager') {
      return (
        <>
          <VerticalSidebar role="manager" currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout} />
          {(() => {
            switch (currentPage) {
              case 'welcome':
                return <EmployeeHome onNavigate={handleNavigate} role={currentRole} />;
              case 'home':
                return <EmployeeHome onNavigate={handleNavigate} role={currentRole} />;
              case 'dashboard':
                return <div className="ml-64"><ManagerDashboard onNavigate={handleNavigate} /></div>;
              case 'orders':
                return <div className="ml-64"><OrdersView canEdit={true} canDelete={true} /></div>;
              case 'employees':
                return <div className="ml-64"><ManagerEmployees /></div>;
              case 'menu':
                return <div className="ml-64"><MenuManagement canEdit={true} canDelete={true} /></div>;
              case 'complaints':
                return <div className="ml-64"><ComplaintsManagement user={user} role="manager" /></div>;
              case 'statistics':
                return <StatisticsPage />;
              case 'account':
                return <div className="ml-64"><AccountPage user={user} /></div>;
              case 'about':
                return <div className="ml-64"><AboutPage /></div>;
              case 'contacts':
                return <div className="ml-64"><ContactsPage /></div>;
              default:
                return <EmployeeHome onNavigate={handleNavigate} />;
            }
          })()}
        </>
      );
    }

    // Admin Interface (with vertical sidebar)
    if (currentRole === 'admin') {
      return (
        <>
          <VerticalSidebar role="admin" currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout} />
          {(() => {
            switch (currentPage) {
              case 'welcome':
                return <EmployeeHome onNavigate={handleNavigate} role={currentRole} />;
              case 'home':
                return <EmployeeHome onNavigate={handleNavigate} role={currentRole} />;
              case 'dashboard':
                return <div className="ml-64"><AdminDashboard onNavigate={handleNavigate} /></div>;
              case 'orders':
                return <div className="ml-64"><OrdersView canEdit={true} canDelete={true} /></div>;
              case 'employees':
                return <div className="ml-64"><ManagerEmployees /></div>;
              case 'menu':
                return <div className="ml-64"><MenuManagement canEdit={true} canDelete={true} /></div>;
              case 'complaints':
                return <div className="ml-64"><ComplaintsManagement user={user} role="admin" /></div>;
              case 'promotions':
                return <div className="ml-64"><ModernPromotionsManagement /></div>;
              case 'settings':
                return <div className="ml-64"><SettingsManagement /></div>;
              case 'statistics':
                return <div className="ml-64"><AdvancedStatistics /></div>;
              case 'account':
                return <div className="ml-64"><AccountPage user={user} /></div>;
              case 'about':
                return <div className="ml-64"><AboutPage /></div>;
              case 'contacts':
                return <div className="ml-64"><ContactsPage /></div>;
              default:
                return <EmployeeHome onNavigate={handleNavigate} />;
            }
          })()}
        </>
      );
    }

    return <CustomerHome onNavigate={handleNavigate} user={user} />;
  };

  return (
    <div className="min-h-screen bg-[#E4E4E4] dark:bg-[#1A1410]">
      {currentPage !== 'login' && currentPage !== 'signup' && user && (
        <>
          {currentRole === 'student' && (
            <Header
              currentPage={currentPage}
              onNavigate={handleNavigate}
              user={user}
              onLogin={() => setCurrentPage('login')}
              onLogout={handleLogout}
              role={currentRole}
              notifCount={notifCount}
              onClearNotif={() => { setNotifCount(0); setNotifOpen(true); }}
            />
          )}
        </>
      )}
      
      {renderPage()}
      
      <NotificationsCenter
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifList}
        onClearAll={() => { setNotifList([]); setNotifCount(0); }}
      />

      {/* Floating notifications button for all roles */}
      {user && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            variant="outline"
            onClick={() => { setNotifCount(0); setNotifOpen(true); }}
            className="relative border-[#C5B59A] dark:border-[#4A4440] bg-background text-foreground"
          >
            Notifications
            {notifCount > 0 && (
              <span className="ml-2 bg-red-600 text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">
                {notifCount}
              </span>
            )}
          </Button>
        </div>
      )}

      <CookieConsent />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
      <CookieBanner />
    </AppProvider>
  );
}
