import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import type { User } from '../../lib/mockData';

import { toast } from 'sonner';
import { useApp } from '../../lib/AppContext';
import { LanguageThemeToggle } from '../shared/LanguageThemeToggle';
import { Eye, EyeOff } from 'lucide-react';
import logoImage from 'figma:asset/28476932319219b2b1cdde44a68f4f218172c6e8.png';
import { apiSignup } from '../../lib/api';

interface SignupPageProps {
  onSignupSuccess: (user: User) => void;
  onNavigateToLogin: () => void;
}

export function SignupPage({ onSignupSuccess, onNavigateToLogin }: SignupPageProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    residence: '',
    room: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });
  const [hasReferralCode, setHasReferralCode] = useState(false);
  const [acceptCookies, setAcceptCookies] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { t, language } = useApp();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      const msg = language === 'fr' ? 'Veuillez entrer votre nom et prénom' : language === 'en' ? 'Please enter your first and last name' : 'Por favor ingrese su nombre y apellido';
      toast.error(msg);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      const msg = language === 'fr' ? 'Les mots de passe ne correspondent pas' : language === 'en' ? 'Passwords do not match' : 'Las contraseñas no coinciden';
      toast.error(msg);
      return;
    }

    // Strong password: at least 6 chars, one uppercase, one digit
    if (!/^(?=.*[A-Z])(?=.*\d).{6,}$/.test(formData.password)) {
      const msg = language === 'fr' ? 'Mot de passe trop faible (au moins une majuscule et un chiffre)' : language === 'en' ? 'Weak password (at least one uppercase and one digit)' : 'Contraseña débil (al menos una mayúscula y un dígito)';
      toast.error(msg);
      return;
    }

    if (!acceptCookies || !acceptTerms) {
      const msg = language === 'fr' ? 'Vous devez accepter les cookies et les conditions' : language === 'en' ? 'You must accept cookies and terms' : 'Debe aceptar las cookies y los términos';
      toast.error(msg);
      return;
    }

    try {
      const { user } = await apiSignup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        residence: formData.residence || undefined,
        room: formData.room || undefined,
        referralCode: hasReferralCode ? (formData.referralCode || undefined) : undefined,
      });
      const mapped: User = {
        id: user.id,
        email: user.email,
        password: '',
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        loyaltyPoints: 0,
      };
      const msg = language === 'fr' ? 'Compte créé avec succès !' : language === 'en' ? 'Account created successfully!' : '¡Cuenta creada exitosamente!';
      toast.success(msg);
      onSignupSuccess(mapped);
    } catch (err: any) {
      console.error('Signup error:', err);
      const code = err?.body?.error;
      const validationErrors = err?.body?.errors;
      
      if (validationErrors) {
        // Afficher la première erreur de validation
        const firstError = Object.values(validationErrors)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : String(firstError));
      } else if (code === 'email_exists') {
        const msg = language === 'fr' ? 'Un compte avec cet email existe déjà' : language === 'en' ? 'An account with this email already exists' : 'Ya existe una cuenta con este correo electrónico';
        toast.error(msg);
      } else if (code === 'weak_password') {
        const msg = language === 'fr' ? 'Mot de passe trop faible (au moins une majuscule et un chiffre)' : language === 'en' ? 'Weak password (at least one uppercase and one digit)' : 'Contraseña débil (al menos una mayúscula y un dígito)';
        toast.error(msg);
      } else {
        const msg = language === 'fr' ? `Erreur serveur (${err.status || 'inconnue'})` : language === 'en' ? `Server error (${err.status || 'unknown'})` : `Error del servidor (${err.status || 'desconocido'})`;
        toast.error(msg);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E1D3B5] dark:bg-[#1A1410] px-4 py-8 relative">
      {/* Language and Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-40 h-40 bg-[#E4E4E4] dark:bg-[#2A2420] rounded-full flex items-center justify-center shadow-lg border-4 border-[#CFBD97] dark:border-[#8B7355] overflow-hidden">
            <img src={logoImage} alt="Mon Miam Miam" className="w-full h-full object-cover" />
          </div>
        </div>

        <Card className="bg-[#E4E4E4] dark:bg-[#2A2420] border-[#C5B59A] dark:border-[#4A4440]">
          <CardHeader>
            <CardTitle className="text-center text-[#3A2F1F] dark:text-[#E8DCC8]">{t.createAccount}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-[#3A2F1F] dark:text-[#E8DCC8]">{t.firstName} *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Jean"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="bg-[#F5F0E8] dark:bg-[#3A3430] text-[#3A2F1F] dark:text-[#E8DCC8] placeholder:text-[#6B5D4F] dark:placeholder:text-[#8B7D6F] border-[#C5B59A] dark:border-[#4A4440]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-[#3A2F1F] dark:text-[#E8DCC8]">{t.lastName} *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Dupont"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="bg-[#F5F0E8] dark:bg-[#3A3430] text-[#3A2F1F] dark:text-[#E8DCC8] placeholder:text-[#6B5D4F] dark:placeholder:text-[#8B7D6F] border-[#C5B59A] dark:border-[#4A4440]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#3A2F1F] dark:text-[#E8DCC8]">{t.email} *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="votre.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-[#F5F0E8] dark:bg-[#3A3430] text-[#3A2F1F] dark:text-[#E8DCC8] placeholder:text-[#6B5D4F] dark:placeholder:text-[#8B7D6F] border-[#C5B59A] dark:border-[#4A4440]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[#3A2F1F] dark:text-[#E8DCC8]">{t.phone}</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+237 6 XX XX XX XX"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-[#F5F0E8] dark:bg-[#3A3430] text-[#3A2F1F] dark:text-[#E8DCC8] placeholder:text-[#6B5D4F] dark:placeholder:text-[#8B7D6F] border-[#C5B59A] dark:border-[#4A4440]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="residence" className="text-[#3A2F1F] dark:text-[#E8DCC8]">Résidence (Livraison)</Label>
                  <Input
                    id="residence"
                    name="residence"
                    type="text"
                    placeholder="Campus X, Résidence A"
                    value={formData.residence}
                    onChange={handleChange}
                    className="bg-[#F5F0E8] dark:bg-[#3A3430] text-[#3A2F1F] dark:text-[#E8DCC8] placeholder:text-[#6B5D4F] dark:placeholder:text-[#8B7D6F] border-[#C5B59A] dark:border-[#4A4440]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room" className="text-[#3A2F1F] dark:text-[#E8DCC8]">Chambre</Label>
                  <Input
                    id="room"
                    name="room"
                    type="text"
                    placeholder="B-203"
                    value={formData.room}
                    onChange={handleChange}
                    className="bg-[#F5F0E8] dark:bg-[#3A3430] text-[#3A2F1F] dark:text-[#E8DCC8] placeholder:text-[#6B5D4F] dark:placeholder:text-[#8B7D6F] border-[#C5B59A] dark:border-[#4A4440]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#3A2F1F] dark:text-[#E8DCC8]">{t.password} *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={language === 'fr' ? 'Au moins 6 caractères' : language === 'en' ? 'At least 6 characters' : 'Al menos 6 caracteres'}
                    value={formData.password}
                    onChange={handleChange}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[#3A2F1F] dark:text-[#E8DCC8]">{t.confirmPassword} *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={language === 'fr' ? 'Répétez votre mot de passe' : language === 'en' ? 'Repeat your password' : 'Repita su contraseña'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="bg-[#F5F0E8] dark:bg-[#3A3430] text-[#3A2F1F] dark:text-[#E8DCC8] placeholder:text-[#6B5D4F] dark:placeholder:text-[#8B7D6F] border-[#C5B59A] dark:border-[#4A4440] pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-[#6B5D4F] dark:text-[#8B7D6F]" />
                    ) : (
                      <Eye className="h-4 w-4 text-[#6B5D4F] dark:text-[#8B7D6F]" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Referral Code Section */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasReferral"
                    checked={hasReferralCode}
                    onCheckedChange={(checked) => setHasReferralCode(checked as boolean)}
                  />
                  <label htmlFor="hasReferral" className="text-sm cursor-pointer text-[#3A2F1F] dark:text-[#E8DCC8]">
                    {t.haveReferralCode}
                  </label>
                </div>
                
                {hasReferralCode && (
                  <Input
                    id="referralCode"
                    name="referralCode"
                    type="text"
                    placeholder={t.referralCodePlaceholder}
                    value={formData.referralCode}
                    onChange={handleChange}
                    className="bg-[#F5F0E8] dark:bg-[#3A3430] text-[#3A2F1F] dark:text-[#E8DCC8] placeholder:text-[#6B5D4F] dark:placeholder:text-[#8B7D6F] border-[#C5B59A] dark:border-[#4A4440]"
                  />
                )}
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label
                    htmlFor="rememberMe"
                    className="text-sm text-[#3A2F1F] dark:text-[#E8DCC8] cursor-pointer"
                  >
                    {language === 'fr' ? 'Se souvenir de moi' : language === 'en' ? 'Remember me' : 'Recordarme'}
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="cookies"
                    checked={acceptCookies}
                    onCheckedChange={(checked) => setAcceptCookies(checked as boolean)}
                  />
                  <label htmlFor="cookies" className="text-sm cursor-pointer text-[#3A2F1F] dark:text-[#E8DCC8]">
                    {t.acceptCookies}
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  />
                  <label htmlFor="terms" className="text-sm cursor-pointer text-[#3A2F1F] dark:text-[#E8DCC8]">
                    {t.acceptTerms}
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full bg-[#CFBD97] dark:bg-[#8B7355] text-[#3A2F1F] dark:text-[#E8DCC8] hover:bg-[#CFBD97]/90">
                {t.createAccount}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <p className="text-sm text-center text-[#3A2F1F] dark:text-[#E8DCC8]">{t.alreadyRegistered}</p>
            <Button variant="outline" onClick={onNavigateToLogin} className="w-full border-[#CFBD97] dark:border-[#8B7355] text-[#3A2F1F] dark:text-[#E8DCC8] hover:bg-[#E8DCC8] dark:hover:bg-[#3A3430]">
              {t.login}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
