import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { User } from '../../lib/mockData';
import { UserCircle, Mail, Shield } from 'lucide-react';
import { useApp } from '../../lib/AppContext';
import { LanguageThemeToggle } from './LanguageThemeToggle';

interface AccountPageProps {
  user: User;
}

export function AccountPage({ user }: AccountPageProps) {
  const { t } = useApp();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-foreground">{t.account}</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <UserCircle className="h-5 w-5" />
              {t.personalInfo}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground">
            <div>
              <p className="text-sm text-muted-foreground">{t.name}</p>
              <p>{user.firstName} {user.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.email}</p>
              <p>{user.email}</p>
            </div>
            {user.position && (
              <div>
                <p className="text-sm text-muted-foreground">Position</p>
                <p className="capitalize">{user.position}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t.settings}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">{t.language} & {t.theme}</p>
              <LanguageThemeToggle />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t.email}</p>
              <p className="text-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
