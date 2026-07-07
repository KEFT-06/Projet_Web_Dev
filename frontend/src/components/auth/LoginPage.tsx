import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { getRememberMeCredentials, setRememberMeCredentials, clearRememberMeCredentials, trackEmployeeLogin } from '../../lib/storage';
import type { User } from '../../lib/mockData';
import { toast } from 'sonner';
import { useApp } from '../../lib/AppContext';
import { LanguageThemeToggle } from '../shared/LanguageThemeToggle';
import { Eye, EyeOff } from 'lucide-react';
import logoImage from 'figma:asset/28476932319219b2b1cdde44a68f4f218172c6e8.png';
import { apiLogin } from '../../lib/api';

interface LoginPageProps {
  onLogin: (user: User, role: 'student' | 'employee' | 'manager' | 'admin') => void;
  onNavigateToSignup: () => void;
  onNavigateToForgot?: () => void;
}

export function LoginPage({ onLogin, onNavigateToSignup, onNavigateToForgot }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useApp();

  // Load remember me credentials on component mount
  useEffect(() => {
    const savedCredentials = getRememberMeCredentials();
    if (savedCredentials) {
      setEmail(savedCredentials.email);
      setPassword(savedCredentials.password);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error(t.language === 'fr' ? 'L\'email est requis' : t.language === 'en' ? 'Email is required' : 'Se requiere el correo electrónico');
      return;
    }

    if (!password.trim()) {
      toast.error(t.language === 'fr' ? 'Le mot de passe est requis' : t.language === 'en' ? 'Password is required' : 'Se requiere la contraseña');
      return;
    }

    try {
      const { user, token } = await apiLogin(email, password);
      const mappedUser: User = {
        id: user.id,
        email: user.email,
        password: '',
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        loyaltyPoints: typeof (user as any).loyaltyPoints === 'number' ? (user as any).loyaltyPoints : 0,
      };
      // Remember me credentials
      if (rememberMe) {
        setRememberMeCredentials(email, password);
      } else {
        clearRememberMeCredentials();
      }
      // Persist auth token for later API calls
      localStorage.setItem('auth_token', token);
      
      // Track employee login for real-time monitoring
      if (mappedUser.role === 'employee' || mappedUser.role === 'manager') {
        trackEmployeeLogin(mappedUser.id);
      }
      
      onLogin(mappedUser, mappedUser.role);
    } catch (err: any) {
      console.error('Login error:', err);
      const code = err?.body?.error;
      const validationErrors = err?.body?.errors;
      const message = err?.body?.message;
      
      if (validationErrors) {
        // Afficher la première erreur de validation
        const firstError = Object.values(validationErrors)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : String(firstError));
      } else if (code === 'invalid_credentials' || message?.includes('incorrects')) {
        toast.error(t.language === 'fr' ? 'Identifiants invalides' : t.language === 'en' ? 'Invalid credentials' : 'Credenciales inválidas');
      } else {
        toast.error(t.language === 'fr' ? `Erreur serveur (${err.status || 'inconnue'})` : t.language === 'en' ? `Server error (${err.status || 'unknown'})` : `Error del servidor (${err.status || 'desconocido'})`);
      }
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-[#E1D3B5] dark:bg-[#1A1410] px-4 py-8">
        {/* Language and Theme Toggle */}
        <div className="fixed top-4 right-4 z-50">
          <LanguageThemeToggle />
        </div>

        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-[#E4E4E4] dark:bg-[#2A2420] rounded-full flex items-center justify-center shadow-lg border-4 border-[#CFBD97] dark:border-[#8B7355] overflow-hidden">
              <img src={logoImage} alt="Mon Miam Miam" className="w-full h-full object-cover" />
            </div>
          </div>

          <Card className="bg-[#E4E4E4] dark:bg-[#2A2420] border-[#C5B59A] dark:border-[#4A4440]">
            <CardHeader>
              <CardTitle className="text-center text-[#3A2F1F] dark:text-[#E8DCC8]">{t.login}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#3A2F1F] dark:text-[#E8DCC8]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t.language === 'fr' ? "Entrez votre email" : "Enter your email"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-[#F5F0E8] dark:bg-[#3A3430] text-[#3A2F1F] dark:text-[#E8DCC8] placeholder:text-[#6B5D4F] dark:placeholder:text-[#8B7D6F] border-[#C5B59A] dark:border-[#4A4440]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#3A2F1F] dark:text-[#E8DCC8]">
                    {t.password}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="123@"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-[#F5F0E8] dark:bg-[#3A3430] text-[#3A2F1F] dark:text-[#E8DCC8] placeholder:text-[#6B5D4F] dark:placeholder:text-[#8B7D6F] border-[#C5B59A] dark:border-[#4A4440] pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-[#6B5D4F] dark:text-[#8B7D6F]" />
                      ) : (
                        <Eye className="h-4 w-4 text-[#6B5D4F] dark:text-[#8B7D6F]" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#CFBD97] dark:bg-[#8B7355] text-[#3A2F1F] dark:text-[#E8DCC8] hover:bg-[#CFBD97]/90 border-0"
                >
                  {t.login}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button 
                variant="ghost"
                onClick={() => onNavigateToForgot?.()}
                className="w-full text-[#3A2F1F] dark:text-[#E8DCC8] hover:bg-[#E8DCC8] dark:hover:bg-[#3A3430]"
              >
                {t.language === 'fr' ? 'Mot de passe oublié ?' : 'Forgot password?'}
              </Button>
              <Button 
                variant="outline" 
                onClick={onNavigateToSignup} 
                className="w-full border-[#CFBD97] dark:border-[#8B7355] text-[#3A2F1F] dark:text-[#E8DCC8] hover:bg-[#E8DCC8] dark:hover:bg-[#3A3430]"
              >
                {t.createAccount}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}