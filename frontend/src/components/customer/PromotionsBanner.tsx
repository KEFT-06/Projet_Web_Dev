import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  Gift, 
  Gamepad2, 
  PartyPopper,
  Calendar,
  ArrowRight
} from 'lucide-react';

interface Promotion {
  id: string;
  title: string;
  description: string;
  image: string;
  startDate: Date;
  endDate: Date;
  type: 'offer' | 'event' | 'game';
  status: 'active' | 'scheduled' | 'expired';
  discount?: number;
  backgroundColor?: string;
  textColor?: string;
}

const PROMO_ICONS = {
  offer: Gift,
  event: PartyPopper,
  game: Gamepad2
};

const PROMO_LABELS = {
  offer: 'Offre Spéciale',
  event: 'Événement',
  game: 'Jeu Concours'
};

export function PromotionsBanner() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadPromotions();
    
    // Auto-rotation toutes les 5 secondes
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.max(promotions.length, 1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [promotions.length]);

  const loadPromotions = () => {
    const stored = localStorage.getItem('restaurant_promotions');
    if (stored) {
      const promos = JSON.parse(stored)
        .map((p: any) => ({
          ...p,
          startDate: new Date(p.startDate),
          endDate: new Date(p.endDate)
        }))
        .filter((p: Promotion) => p.status === 'active');
      setPromotions(promos);
    }
  };

  const nextPromo = () => {
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
  };

  const prevPromo = () => {
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
  };

  if (promotions.length === 0) {
    return null;
  }

  const currentPromo = promotions[currentIndex];
  const Icon = PROMO_ICONS[currentPromo.type];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Gift className="w-6 h-6 text-orange-500" />
          Promotions & Événements
        </h2>
        {promotions.length > 1 && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={prevPromo}
              className="w-8 h-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {promotions.length}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={nextPromo}
              className="w-8 h-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Partie gauche - Affiche colorée */}
          <div className={`relative bg-gradient-to-br ${currentPromo.backgroundColor} p-8 flex flex-col justify-between min-h-[300px]`}>
            {/* Décorations */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" />
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/5 rounded-full -ml-12 -mt-12" />
            
            {/* Contenu */}
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <Badge className="bg-white/20 text-white border-white/30 text-sm">
                  {PROMO_LABELS[currentPromo.type]}
                </Badge>
              </div>
              
              {currentPromo.discount && (
                <div className="inline-block bg-yellow-400 text-black px-6 py-3 rounded-full font-bold text-4xl mb-4 shadow-lg">
                  -{currentPromo.discount}%
                </div>
              )}
            </div>
            
            <div className="relative z-10">
              <h3 className={`text-3xl md:text-4xl font-bold ${currentPromo.textColor} mb-3 leading-tight`}>
                {currentPromo.title}
              </h3>
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <Calendar className="w-4 h-4" />
                <span>
                  Jusqu'au {currentPromo.endDate.toLocaleDateString('fr-FR', { 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Partie droite - Détails */}
          <div className="p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col justify-between">
            <div>
              <h4 className="text-xl font-semibold mb-4">Détails de l'offre</h4>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {currentPromo.description}
              </p>
              
              {currentPromo.type === 'offer' && (
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                    ✨ Profitez de cette offre exceptionnelle dès maintenant!
                  </p>
                </div>
              )}
              
              {currentPromo.type === 'event' && (
                <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-purple-700 dark:text-purple-400 font-medium">
                    🎉 Réservez votre place pour cet événement unique!
                  </p>
                </div>
              )}
              
              {currentPromo.type === 'game' && (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                    🎮 Participez maintenant et tentez votre chance!
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                En profiter
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              {promotions.length > 1 && (
                <Button variant="outline" onClick={nextPromo}>
                  Suivant
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Indicateurs de pagination */}
      {promotions.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {promotions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-orange-500 w-8' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
