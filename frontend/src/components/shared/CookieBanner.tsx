import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { X, Cookie, Shield, Settings } from 'lucide-react';

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Afficher après 1 seconde
      setTimeout(() => setShow(true), 1000);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookie_consent', 'all');
    setShow(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem('cookie_consent', 'essential');
    setShow(false);
  };

  const handleClose = () => {
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up">
      <Card className="max-w-4xl mx-auto bg-white dark:bg-gray-800 border-2 border-orange-200 dark:border-orange-800 shadow-2xl">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center flex-shrink-0">
                <Cookie className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">🍪 Nous utilisons des cookies</h3>
                <p className="text-sm text-muted-foreground">Pour améliorer votre expérience</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Nous utilisons des cookies pour personnaliser le contenu, analyser notre trafic et améliorer votre expérience. 
            En cliquant sur "Accepter tout", vous consentez à notre utilisation des cookies.
          </p>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 dark:text-blue-400">
                <strong>Votre vie privée est importante.</strong> Vous pouvez modifier vos préférences à tout moment dans les paramètres.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleAcceptAll}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
            >
              ✅ Accepter tout
            </Button>
            <Button
              onClick={handleRejectAll}
              variant="outline"
              className="flex-1 border-gray-300 hover:bg-gray-50"
            >
              Essentiel uniquement
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Personnaliser
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-4">
            En savoir plus sur notre{' '}
            <a href="#" className="text-blue-600 hover:underline">
              politique de confidentialité
            </a>
            {' '}et nos{' '}
            <a href="#" className="text-blue-600 hover:underline">
              conditions d'utilisation
            </a>
            .
          </p>
        </div>
      </Card>
    </div>
  );
}
