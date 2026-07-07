import { Button } from '../ui/button';
import type { User } from '../../lib/mockData';
import { useApp } from '../../lib/AppContext';

interface WelcomePageProps {
  user: User;
  onGoToSpace: () => void;
}

export function WelcomePage({ user, onGoToSpace }: WelcomePageProps) {
  const { t } = useApp();
  const roleLabel =
    user.role === 'customer' ? t.customer :
    user.role === 'employee' ? t.employee :
    user.role === 'manager' ? t.manager : t.administrator;
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-6 p-8 rounded-lg">
        <h1 className="text-4xl font-bold text-primary">{t.welcome} {user.firstName} {user.lastName} !</h1>
        <p className="text-xl text-muted-foreground">{roleLabel}</p>
        <Button
          type="button"
          onClick={onGoToSpace}
          className="mt-8 px-8 py-6 text-lg"
          size="lg"
        >
          {t.goToMySpace}
        </Button>
      </div>
    </div>
  );
}