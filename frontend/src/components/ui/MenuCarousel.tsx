/**
 * Composant Carousel moderne pour affichage du menu du jour
 * Limite: 4 plats, 4 entrées, 4 boissons
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { ChevronLeft, ChevronRight, Utensils, Coffee, ChefHat, Star } from 'lucide-react';
import { formatPrice } from '../../lib/utils';
import type { MenuItem } from '../../lib/mockData';

interface MenuCarouselProps {
  starters: MenuItem[];
  mains: MenuItem[];
  drinks: MenuItem[];
  onAddToCart?: (item: MenuItem) => void;
  title?: string;
  subtitle?: string;
}

export function MenuCarousel({
  starters,
  mains,
  drinks,
  onAddToCart,
  title = "Menu du Jour",
  subtitle = "Nos délicieux plats sélectionnés pour vous"
}: MenuCarouselProps) {
  const [activeCategory, setActiveCategory] = useState<'starters' | 'mains' | 'drinks'>('mains');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const categories = [
    { 
      id: 'starters' as const, 
      name: 'Entrées', 
      icon: ChefHat, 
      items: starters.slice(0, 4),
      color: 'from-green-500 to-emerald-600'
    },
    { 
      id: 'mains' as const, 
      name: 'Plats', 
      icon: Utensils, 
      items: mains.slice(0, 4),
      color: 'from-orange-500 to-red-600'
    },
    { 
      id: 'drinks' as const, 
      name: 'Boissons', 
      icon: Coffee, 
      items: drinks.slice(0, 4),
      color: 'from-blue-500 to-cyan-600'
    }
  ];

  const currentCategory = categories.find(c => c.id === activeCategory)!;
  const currentItems = currentCategory.items;

  useEffect(() => {
    if (!isAutoPlaying || currentItems.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % currentItems.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, currentItems.length]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => 
      prev === 0 ? currentItems.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => 
      (prev + 1) % currentItems.length
    );
  };

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  if (currentItems.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Utensils className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Aucun plat disponible pour le moment</p>
      </div>
    );
  }

  const currentItem = currentItems[currentIndex];

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent">
          {title}
        </h2>
        <p className="text-muted-foreground mt-2">{subtitle}</p>
      </div>

      {/* Category Selector */}
      <div className="flex justify-center gap-2 mb-6">
        {categories.map(category => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? 'default' : 'outline'}
              onClick={() => {
                setActiveCategory(category.id);
                setCurrentIndex(0);
              }}
              className={`flex items-center gap-2 ${
                activeCategory === category.id 
                  ? `bg-gradient-to-r ${category.color} text-white border-0`
                  : ''
              }`}
            >
              <Icon className="w-4 h-4" />
              {category.name}
              <Badge variant="secondary" className="ml-1">
                {category.items.length}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Main Carousel */}
      <div className="relative">
        <Card className="overflow-hidden border-2 shadow-xl">
          <div className={`h-2 bg-gradient-to-r ${currentCategory.color}`} />
          
          <CardContent className="p-0">
            <div className="relative h-[400px] md:h-[500px]">
              {/* Image principale */}
              <div className="absolute inset-0">
                <img
                  src={currentItem.image}
                  alt={currentItem.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://images.unsplash.com/photo-${
                      activeCategory === 'drinks' 
                        ? '1544145945-657873051d72' 
                        : '1546069901-ba9599a7e63c'
                    }?w=800&q=80`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              </div>

              {/* Informations du plat */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-2xl md:text-3xl font-bold">
                        {currentItem.name}
                      </h3>
                      {(currentItem as any).popular && (
                        <Badge className="bg-yellow-500 text-black">
                          <Star className="w-3 h-3 mr-1" />
                          Populaire
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm md:text-base text-gray-200 mb-3 line-clamp-2">
                      {currentItem.description}
                    </p>
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-3xl font-bold">
                        {formatPrice(currentItem.price)}
                      </span>
                      {(currentItem as any).calories && (
                        <Badge variant="secondary" className="bg-white/20 text-white">
                          {(currentItem as any).calories} kcal
                        </Badge>
                      )}
                      {(currentItem as any).preparationTime && (
                        <Badge variant="secondary" className="bg-white/20 text-white">
                          ⏱ {(currentItem as any).preparationTime} min
                        </Badge>
                      )}
                    </div>
                  </div>
                  {onAddToCart && (
                    <Button
                      onClick={() => onAddToCart(currentItem)}
                      className={`bg-gradient-to-r ${currentCategory.color} text-white border-0 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all`}
                    >
                      Ajouter au panier
                    </Button>
                  )}
                </div>
              </div>

              {/* Navigation buttons */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full shadow-lg"
                onClick={handlePrevious}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full shadow-lg"
                onClick={handleNext}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {currentItems.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? `w-8 bg-gradient-to-r ${currentCategory.color}`
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              onClick={() => handleDotClick(index)}
              aria-label={`Aller au plat ${index + 1}`}
            />
          ))}
        </div>

        {/* Miniatures */}
        <div className="grid grid-cols-4 gap-2 mt-6">
          {currentItems.map((item, index) => (
            <Card
              key={item.id}
              className={`cursor-pointer transition-all ${
                index === currentIndex
                  ? 'ring-2 ring-orange-500 transform scale-105'
                  : 'hover:shadow-lg'
              }`}
              onClick={() => handleDotClick(index)}
            >
              <div className="relative h-24">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover rounded-t-lg"
                  onError={(e) => {
                    e.currentTarget.src = `https://images.unsplash.com/photo-${
                      activeCategory === 'drinks' 
                        ? '1544145945-657873051d72' 
                        : '1546069901-ba9599a7e63c'
                    }?w=200&q=80`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-t-lg" />
                <div className="absolute bottom-1 left-1 right-1">
                  <p className="text-white text-xs font-semibold truncate">
                    {item.name}
                  </p>
                  <p className="text-white text-xs">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Controls */}
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          >
            {isAutoPlaying ? 'Pause' : 'Play'} Diaporama
          </Button>
        </div>
      </div>
    </div>
  );
}

// Mini version pour la page d'accueil
export function MenuCarouselMini({
  starters,
  mains,
  drinks,
  onViewMore
}: {
  starters: MenuItem[];
  mains: MenuItem[];
  drinks: MenuItem[];
  onViewMore?: () => void;
}) {
  const allItems = [
    ...mains.slice(0, 2),
    ...starters.slice(0, 1),
    ...drinks.slice(0, 1)
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allItems.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [allItems.length]);

  if (allItems.length === 0) return null;

  const currentItem = allItems[currentIndex];

  return (
    <Card className="overflow-hidden">
      <div className="relative h-64">
        <img
          src={currentItem.image}
          alt={currentItem.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h4 className="font-bold text-lg">{currentItem.name}</h4>
          <p className="text-2xl font-bold mt-1">
            {formatPrice(currentItem.price)}
          </p>
        </div>
      </div>
      {onViewMore && (
        <CardContent className="p-3">
          <Button onClick={onViewMore} className="w-full">
            Voir le menu complet
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
