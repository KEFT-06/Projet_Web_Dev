import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useApp } from '../../lib/AppContext';
import { toast } from 'sonner';
import { Mail, ArrowLeft, CheckCircle, Eye, EyeOff, LockKeyhole, RefreshCw } from 'lucide-react';
import logoImage from 'figma:asset/28476932319219b2b1cdde44a68f4f218172c6e8.png';
import { LanguageThemeToggle } from '../shared/LanguageThemeToggle';
import { generatePasswordResetToken, changeUserPassword, getUsers } from '../../lib/storage';
import { emailService } from '../../services/EmailService';

interface ForgotPasswordPageProps {
  onBackToLogin: () => void;
}

type Step = 'request' | 'code' | 'reset' | 'success';

export function ForgotPasswordPage({ onBackToLogin }: ForgotPasswordPageProps) {
  const { language } = useApp();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<Step>('request');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Vérifier si l'email existe
  const emailExists = (email: string) => {
    const users = getUsers();
    return users.some(user => user.email === email);
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error(language === 'fr' ? "Veuillez saisir votre email" : "Please enter your email");
      return;
    }
    
    try {
      setLoading(true);

      // Vérifier si l'email existe
      if (emailExists(email)) {
        // Générer un token de réinitialisation
        const token = generatePasswordResetToken(email);
        
        // Récupérer le nom de l'utilisateur
        const users = getUsers();
        const user = users.find(u => u.email === email);
        const userName = user ? `${user.firstName} ${user.lastName}` : 'Utilisateur';
        
        // Envoyer l'email de réinitialisation
        const emailSent = await emailService.sendPasswordResetEmail(
          email,
          userName,
          token.substring(0, 6) // Utiliser les 6 premiers caractères comme code
        );
        
        if (emailSent) {
          // Passer à l'étape de saisie du code
          toast.success(
            language === 'fr' 
              ? "Un code de réinitialisation a été envoyé à votre email" 
              : "A reset code has been sent to your email"
          );
          setStep('code');
        } else {
          toast.error(
            language === 'fr'
              ? "Erreur lors de l'envoi de l'email. Veuillez réessayer."
              : "Error sending email. Please try again."
          );
        }
      } else {
        // Ne pas révéler si l'email existe ou non (sécurité)
        await new Promise(r => setTimeout(r, 800));
        toast.success(
          language === 'fr' 
            ? "Si un compte existe avec cet email, un code de réinitialisation a été envoyé" 
            : "If an account exists with this email, a reset code has been sent"
        );
        // Quand même avancer pour simuler l'envoi réussi
        setStep('code');
      }
    } catch (error) {
      toast.error(language === 'fr' ? "Une erreur est survenue" : "An error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken.trim()) {
      toast.error(language === 'fr' ? "Veuillez saisir le code reçu par email" : "Please enter the code received by email");
      return;
    }

    try {
      setLoading(true);
      await new Promise(r => setTimeout(r, 500));
      
      // Vérifier que le code a au moins 6 caractères
      if (resetToken.length < 6) {
        toast.error(language === 'fr' ? "Le code doit contenir au moins 6 caractères" : "Code must be at least 6 characters");
        return;
      }
      
      // Récupérer le token complet stocké
      const resetRequests = JSON.parse(localStorage.getItem('password_reset_tokens') || '{}');
      const request = resetRequests[email];
      
      // Vérifier que le token existe et n'est pas expiré
      if (!request) {
        toast.error(language === 'fr' ? "Code invalide ou expiré" : "Invalid or expired code");
        return;
      }
      
      if (request.expires < Date.now()) {
        toast.error(language === 'fr' ? "Ce code a expiré. Veuillez demander un nouveau code." : "This code has expired. Please request a new code.");
        return;
      }
      
      if (request.used) {
        toast.error(language === 'fr' ? "Ce code a déjà été utilisé" : "This code has already been used");
        return;
      }
      
      // Vérifier que le code saisi correspond au début du token
      const storedCode = request.token.substring(0, 6);
      if (resetToken.toUpperCase() !== storedCode.toUpperCase()) {
        toast.error(language === 'fr' ? "Code incorrect" : "Incorrect code");
        return;
      }
      
      // Code valide, passer à l'étape de réinitialisation
      toast.success(language === 'fr' ? "Code vérifié avec succès!" : "Code verified successfully!");
      setStep('reset');
      
    } catch (error) {
      toast.error(language === 'fr' ? "Une erreur est survenue" : "An error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast.error(language === 'fr' ? "Veuillez saisir un nouveau mot de passe" : "Please enter a new password");
      return;
    }
    
    if (password.length < 6) {
      toast.error(language === 'fr' ? "Le mot de passe doit contenir au moins 6 caractères" : 
                                     "Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error(language === 'fr' ? "Les mots de passe ne correspondent pas" : "Passwords don't match");
      return;
    }

    try {
      setLoading(true);
      await new Promise(r => setTimeout(r, 800));
      
      // Changer le mot de passe
      const success = changeUserPassword(email, password, resetToken);
      
      if (success) {
        toast.success(language === 'fr' ? "Votre mot de passe a été réinitialisé avec succès" : 
                                          "Your password has been successfully reset");
        setStep('success');
      } else {
        toast.error(language === 'fr' ? "Échec de la réinitialisation du mot de passe" : 
                                         "Password reset failed");
      }
    } catch (error) {
      toast.error(language === 'fr' ? "Une erreur est survenue" : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="absolute top-4 right-4">
        <LanguageThemeToggle />
      </div>
      
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <img src={logoImage} alt="Logo" className="h-14 mx-auto mb-2" />
        </div>
        
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden">
          {/* En-tête avec gradient orange-rouge comme la charte graphique */}
          <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                {step === 'request' && <Mail className="w-8 h-8 text-white" />}
                {step === 'code' && <RefreshCw className="w-8 h-8 text-white" />}
                {(step === 'reset' || step === 'success') && <LockKeyhole className="w-8 h-8 text-white" />}
              </div>
            </div>
            
            <CardTitle className="text-center text-2xl font-bold">
              {step === 'request' && (language === 'fr' ? 'Mot de passe oublié?' : 'Forgot password?')}
              {step === 'code' && (language === 'fr' ? 'Vérification' : 'Verification')}
              {step === 'reset' && (language === 'fr' ? 'Nouveau mot de passe' : 'New password')}
              {step === 'success' && (language === 'fr' ? 'Réinitialisation réussie' : 'Reset successful')}
            </CardTitle>
            
            <p className="text-center text-sm text-white/80 mt-2">
              {step === 'request' && (language === 'fr' 
                ? 'Entrez votre email pour recevoir un code de réinitialisation'
                : 'Enter your email to receive a reset code')}
              {step === 'code' && (language === 'fr'
                ? 'Saisissez le code reçu par email'
                : 'Enter the code received by email')}
              {step === 'reset' && (language === 'fr'
                ? 'Créez un nouveau mot de passe sécurisé'
                : 'Create a new secure password')}
              {step === 'success' && (language === 'fr'
                ? 'Vous pouvez maintenant vous connecter avec votre nouveau mot de passe'
                : 'You can now log in with your new password')}
            </p>
          </CardHeader>
          
          <CardContent className="pt-6">
            {/* Étape 1: Demande de réinitialisation */}
            {step === 'request' && (
              <form onSubmit={handleRequestReset} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {language === 'fr' ? 'Adresse email' : 'Email address'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder={language === 'fr' ? "votre.email@exemple.com" : "your.email@example.com"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12"
                      required
                    />
                  </div>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-900 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      {language === 'fr'
                        ? 'Un email vous sera envoyé avec un code pour réinitialiser votre mot de passe.'
                        : 'An email will be sent with a code to reset your password.'}
                    </p>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {language === 'fr' ? 'Envoi en cours...' : 'Sending...'}
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      {language === 'fr' ? 'Envoyer le code' : 'Send code'}
                    </>
                  )}
                </Button>
              </form>
            )}
            
            {/* Étape 2: Saisie du code */}
            {step === 'code' && (
              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    {language === 'fr' ? 'Code de réinitialisation' : 'Reset code'}
                  </label>
                  <Input
                    type="text"
                    placeholder={language === 'fr' ? "Saisissez le code reçu" : "Enter the code received"}
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="h-12 text-center text-lg letter-spacing-wide"
                    maxLength={12}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {language === 'fr' ? 'Vérification...' : 'Verifying...'}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {language === 'fr' ? 'Vérifier le code' : 'Verify code'}
                    </>
                  )}
                </Button>
                
                <div className="text-center">
                  <button 
                    type="button"
                    onClick={() => setStep('request')}
                    className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 hover:underline"
                  >
                    {language === 'fr' ? 'Changer l\'adresse email' : 'Change email address'}
                  </button>
                </div>
              </form>
            )}
            
            {/* Étape 3: Nouveau mot de passe */}
            {step === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                {/* Mot de passe */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <LockKeyhole className="w-4 h-4" />
                    {language === 'fr' ? 'Nouveau mot de passe' : 'New password'}
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={language === 'fr' ? "Nouveau mot de passe" : "New password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Confirmer mot de passe */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <LockKeyhole className="w-4 h-4" />
                    {language === 'fr' ? 'Confirmer le mot de passe' : 'Confirm password'}
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={language === 'fr' ? "Confirmez le mot de passe" : "Confirm password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {language === 'fr' ? 'Réinitialisation...' : 'Resetting...'}
                    </>
                  ) : (
                    <>
                      <LockKeyhole className="w-4 h-4 mr-2" />
                      {language === 'fr' ? 'Réinitialiser le mot de passe' : 'Reset password'}
                    </>
                  )}
                </Button>
              </form>
            )}
            
            {/* Étape 4: Succès */}
            {step === 'success' && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">
                    {language === 'fr' ? 'Mot de passe réinitialisé!' : 'Password reset!'}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'fr'
                      ? 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.'
                      : 'Your password has been successfully reset. You can now login with your new password.'}
                  </p>
                </div>
                
                <Button 
                  onClick={onBackToLogin}
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold"
                >
                  {language === 'fr' ? 'Se connecter' : 'Log in'}
                </Button>
              </div>
            )}
          </CardContent>
          
          {/* Footer seulement visible pour les étapes 1, 2, 3 */}
          {step !== 'success' && (
            <CardFooter className="flex flex-col gap-3">
              <Button 
                variant="outline" 
                onClick={onBackToLogin} 
                className="w-full h-11 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {language === 'fr' ? 'Retour à la connexion' : 'Back to login'}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
