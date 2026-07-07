import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  ChefHat, 
  Sparkles, 
  TrendingUp, 
  Gift, 
  Gamepad2,
  Calendar,
  Clock,
  Star,
  ArrowRight,
  Utensils,
  Coffee,
  Wine
} from 'lucide-react';
import { getMenuItems, getAllDailyMenus } from '../../lib/storage';
import type { MenuItem } from '../../lib/mockData';
import { formatPrice } from '../../lib/utils';

interface ModernHomePageProps {
  onNavigate: (page: string) => void;
}

export function ModernHomePage({ onNavigate }: ModernHomePageProps) {
  const [dailyMenu, setDailyMenu] = useState<{
    starters: MenuItem[];
    mains: MenuItem[];
    drinks: MenuItem[];
  }>({ starters: [], mains: [], drinks: [] });
  
  const [promotions, setPromotions] = useState<any[]>([]);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  useEffect(() => {
    loadDailyMenu();
    loadPromotions();
    
    // Auto-rotation des promotions
    const interval = setInterval(() => {
      setCurrentPromoIndex(prev => (prev + 1) % Math.max(promotions.length, 1));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [promotions.length]);

  const loadDailyMenu = () => {
    const allItems = getMenuItems();
    const today = new Date().toISOString().split('T')[0];
    const allMenus = getAllDailyMenus();
    const menu = allMenus.find(m => m.date === today);
    
    if (menu) {
      setDailyMenu({
        starters: allItems.filter(item => menu.starters.includes(item.id)).slice(0, 4),
        mains: allItems.filter(item => menu.mains.includes(item.id)).slice(0, 4),
        drinks: allItems.filter(item => menu.drinks.includes(item.id)).slice(0, 4)
      });
    } else {
      // Menu par défaut si pas de menu du jour
      setDailyMenu({
        starters: allItems.filter(item => item.category === 'starter' && item.available).slice(0, 4),
        mains: allItems.filter(item => item.category === 'main' && item.available).slice(0, 4),
        drinks: allItems.filter(item => item.category === 'drink' && item.available).slice(0, 4)
      });
    }
  };

  const loadPromotions = () => {
    const stored = localStorage.getItem('restaurant_promotions');
    if (stored) {
      const promos = JSON.parse(stored);
      const now = new Date();
      const active = promos.filter((p: any) => {
        const start = new Date(p.startDate);
        const end = new Date(p.endDate);
        return p.status === 'active' && now >= start && now <= end;
      });
      setPromotions(active);
    }
  };

  const getPromoIcon = (type: string) => {
    switch (type) {
      case 'offer': return <Gift className="w-6 h-6" />;
      case 'event': return <Calendar className="w-6 h-6" />;
      case 'game': return <Gamepad2 className="w-6 h-6" />;
      default: return <Sparkles className="w-6 h-6" />;
    }
  };

  const getPromoGradient = (type: string) => {
    switch (type) {
      case 'offer': return 'from-orange-500 to-red-600';
      case 'event': return 'from-blue-500 to-purple-600';
      case 'game': return 'from-green-500 to-teal-600';
      default: return 'from-pink-500 to-purple-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-4">
              <ChefHat className="w-12 h-12 animate-bounce" />
              <h1 className="text-5xl md:text-6xl font-bold">ZEDUC-SP@CE</h1>
            </div>
            <p className="text-xl md:text-2xl text-orange-100">
              Savourez l'Excellence Culinaire Camerounaise
            </p>
            <div className="flex flex-wrap gap-4 justify-center mt-8">
              <Button 
                size="lg" 
                onClick={() => onNavigate('login')}
                className="bg-white text-orange-600 hover:bg-orange-50 px-8 py-6 text-lg font-semibold shadow-lg"
              >
                Se Connecter
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => onNavigate('signup')}
                className="border-2 border-white text-white hover:bg-white/20 px-8 py-6 text-lg font-semibold"
              >
                S'inscrire
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-orange-50 dark:from-gray-900"></div>
      </div>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Promotions Section */}
        {promotions.length > 0 && (
          <section className="animate-slide-up">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Promotions & Événements</h2>
                <p className="text-muted-foreground">Ne manquez pas nos offres spéciales!</p>
              </div>
            </div>

            <div className="relative">
              <Card className="overflow-hidden border-2 border-purple-200 shadow-2xl">
                <div className={`bg-gradient-to-r ${getPromoGradient(promotions[currentPromoIndex]?.type)} p-8 text-white`}>
                  <div className="flex items-start gap-6">
                    {/* Image de la promotion */}
                    <div className="hidden md:block w-1/3 rounded-lg overflow-hidden shadow-xl">
                      <img 
                        src={promotions[currentPromoIndex]?.image || '/placeholder-promo.jpg'} 
                        alt={promotions[currentPromoIndex]?.title}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                    
                    {/* Contenu de la promotion */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          {getPromoIcon(promotions[currentPromoIndex]?.type)}
                        </div>
                        <Badge className="bg-white/20 text-white border-white/30 text-lg px-4 py-1">
                          {promotions[currentPromoIndex]?.type === 'offer' ? '🎁 Offre Spéciale' :
                           promotions[currentPromoIndex]?.type === 'event' ? '📅 Événement' :
                           '🎮 Jeu'}
                        </Badge>
                      </div>
                      
                      <h3 className="text-4xl font-bold">{promotions[currentPromoIndex]?.title}</h3>
                      <p className="text-xl text-white/90">{promotions[currentPromoIndex]?.description}</p>
                      
                      {promotions[currentPromoIndex]?.discount && (
                        <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
                          <span className="text-3xl font-bold">-{promotions[currentPromoIndex].discount}%</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-white/80">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Jusqu'au {new Date(promotions[currentPromoIndex]?.endDate).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                      
                      <Button 
                        size="lg"
                        onClick={() => onNavigate('login')}
                        className="bg-white text-purple-600 hover:bg-purple-50 font-semibold"
                      >
                        Profiter de l'offre <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
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
                      onClick={() => setCurrentPromoIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentPromoIndex 
                          ? 'bg-purple-600 w-8' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Menu du Jour Section */}
        <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">Menu du Jour</h2>
              <p className="text-muted-foreground">Découvrez notre sélection quotidienne</p>
            </div>
          </div>

          {/* Entrées */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Utensils className="w-6 h-6 text-green-600" />
              <h3 className="text-2xl font-bold text-green-600">Entrées</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dailyMenu.starters.map((item) => (
                <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-green-100 overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-green-500 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Entrée
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-lg mb-2 line-clamp-1">{item.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-600">{formatPrice(item.price)}</span>
                      <Button size="sm" onClick={() => onNavigate('login')} className="bg-green-600 hover:bg-green-700">
                        Commander
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Plats Principaux */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <ChefHat className="w-6 h-6 text-orange-600" />
              <h3 className="text-2xl font-bold text-orange-600">Plats Principaux</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dailyMenu.mains.map((item) => (
                <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-orange-100 overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-orange-500 text-white">
                        <Star className="w-3 h-3 mr-1" />
                        Plat
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-lg mb-2 line-clamp-1">{item.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-orange-600">{formatPrice(item.price)}</span>
                      <Button size="sm" onClick={() => onNavigate('login')} className="bg-orange-600 hover:bg-orange-700">
                        Commander
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Boissons */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Coffee className="w-6 h-6 text-blue-600" />
              <h3 className="text-2xl font-bold text-blue-600">Boissons</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dailyMenu.drinks.map((item) => (
                <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 border-blue-100 overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-blue-500 text-white">
                        <Wine className="w-3 h-3 mr-1" />
                        Boisson
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-lg mb-2 line-clamp-1">{item.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600">{formatPrice(item.price)}</span>
                      <Button size="sm" onClick={() => onNavigate('login')} className="bg-blue-600 hover:bg-blue-700">
                        Commander
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-white text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <TrendingUp className="w-16 h-16 mx-auto mb-6 animate-bounce" />
          <h2 className="text-4xl font-bold mb-4">Rejoignez-nous Aujourd'hui!</h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Inscrivez-vous maintenant et profitez de points de fidélité, de parrainages et d'offres exclusives!
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => onNavigate('signup')}
              className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-6 text-lg font-semibold"
            >
              Créer un Compte
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => onNavigate('login')}
              className="border-2 border-white text-white hover:bg-white/20 px-8 py-6 text-lg font-semibold"
            >
              J'ai déjà un Compte
            </Button>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ChefHat className="w-8 h-8" />
            <span className="text-2xl font-bold">ZEDUC-SP@CE</span>
          </div>
          <p className="text-gray-400 mb-4">Votre restaurant universitaire préféré</p>
          <p className="text-sm text-gray-500">© 2024 ZEDUC-SP@CE. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
