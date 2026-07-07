import { useApp } from '../../lib/AppContext';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ClipboardList, Users, MessageSquare, TrendingUp, Home } from 'lucide-react';
export function EmployeeHome({ onNavigate, role }: { onNavigate: (page: string) => void; role?: 'employee' | 'manager' | 'admin' }) {
  const { t } = useApp();
  const nameLabel = role === 'manager' ? t.manager : role === 'admin' ? t.administrator : t.employee;

  const quickActions = [
    {
      icon: ClipboardList,
      title: t.dashboard,
      description: t.accessDashboardDesc,
      action: () => onNavigate('dashboard'),
    },
    {
      icon: Users,
      title: t.orders,
      description: t.manageOrdersDesc,
      action: () => onNavigate('orders'),
    },
    {
      icon: MessageSquare,
      title: t.complaints,
      description: t.processComplaintsDesc,
      action: () => onNavigate('complaints'),
    },
    {
      icon: TrendingUp,
      title: t.menu,
      description: t.updateMenuDesc,
      action: () => onNavigate('menu'),
    },
  ];

  return (
    <div className="ml-64">
      <div className="container mx-auto px-8 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="mb-8 text-foreground">{t.employeeWelcome.replace('{name}', nameLabel)}</h1>
          
          <div className="prose prose-lg mx-auto mb-12">
            <p className="text-muted-foreground text-center">
              {t.employeePortalWelcome}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card
                  key={index}
                  className="bg-card border-border hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={action.action}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-2 text-foreground">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {/* "Go to my space" button */}
            <Card
              className="bg-card border-border hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onNavigate('dashboard')}
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Home className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-foreground">{t.goToMySpace}</h3>
                    <p className="text-sm text-muted-foreground">{t.accessCustomerInterface}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <h2 className="mb-4 text-foreground">{t.ourMission}</h2>
                <p className="text-muted-foreground">
                  {t.ourMissionText}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <h2 className="mb-4 text-foreground">{t.ourValues}</h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• {t.qualityInEveryDish}</li>
                  <li>• {t.serviceExcellence}</li>
                  <li>• {t.teamwork}</li>
                  <li>• {t.customerSatisfaction}</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6 text-center">
              <h2 className="mb-4 text-foreground">{t.needHelp}</h2>
              <p className="mb-4 text-muted-foreground">
                {t.contactSupervisor}
              </p>
              <Button
                variant="outline"
                onClick={() => onNavigate('contacts')}
                className="border-primary text-primary hover:bg-primary/10"
              >
                {t.viewContacts}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
