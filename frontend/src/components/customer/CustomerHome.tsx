import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ChefHat, Leaf, Award, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useApp } from '../../lib/AppContext';
import type { User } from '../../lib/mockData';
import { PromotionsBanner } from './PromotionsBanner';

interface CustomerHomeProps {
  onNavigate: (page: string) => void;
  user: User;
}

export function CustomerHome({ onNavigate, user }: CustomerHomeProps) {
  const { t } = useApp();

  const features = [
    {
      icon: Leaf,
      title: t.freshIngredients,
      description: t.freshIngredientsDesc,
    },
    {
      icon: ChefHat,
      title: t.expertChefs,
      description: t.expertChefsDesc,
    },
    {
      icon: Award,
      title: t.loyaltyRewards,
      description: t.loyaltyRewardsDesc,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1643101570532-88c8ecc07c1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5lJTIwZGluaW5nJTIwcmVzdGF1cmFudCUyMGludGVyaW9yfGVufDF8fHx8MTc2MTA2NTU4Mnww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Restaurant Interior"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-3xl px-4">
            <h1 className="mb-4 md:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white">{t.welcomeMessage}</h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 text-white/90">
              {t.aboutIntro2}
            </p>
            <div className="flex gap-3 md:gap-4 justify-center flex-wrap">
              <Button
                size="lg"
                className="bg-[#CFBD97] text-[#3A2F1F] hover:bg-[#CFBD97]/90 text-base md:text-lg px-6 md:px-8 py-5 md:py-6"
                onClick={() => onNavigate(`${user.role}-home`)}
              >
                {t.goToMySpace}
                <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-[#CFBD97] text-[#3A2F1F] hover:bg-[#CFBD97]/10 text-base md:text-lg px-6 md:px-8 py-5 md:py-6"
                onClick={() => onNavigate('menu')}
              >
                {t.viewMenu}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Promotions Banner */}
      <section className="py-8 md:py-12 bg-gradient-to-b from-orange-50 to-white dark:from-orange-950 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <PromotionsBanner />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 bg-[#E4E4E4] dark:bg-[#2A2420]">
        <div className="container mx-auto px-4">
          <h2 className="text-center mb-8 md:mb-12 text-foreground">{t.whyChooseUs}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="bg-card border-border hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6 text-center">
                    <div className="w-14 h-14 md:w-16 md:h-16 bg-[#CFBD97] dark:bg-[#8B7355] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-7 w-7 md:h-8 md:w-8 text-[#3A2F1F] dark:text-[#E8DCC8]" />
                    </div>
                    <h3 className="mb-3 text-foreground">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="py-12 md:py-16 bg-[#E1D3B5] dark:bg-[#1A1410]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <h2 className="mb-4 md:mb-6 text-foreground">{t.unforgettableExperience}</h2>
              <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6">
                {t.unforgettableExperienceDesc}
              </p>
              <ul className="space-y-3 text-foreground mb-6 md:mb-8">
                <li className="flex items-start">
                  <span className="text-[#CFBD97] dark:text-[#8B7355] mr-2">✓</span>
                  <span>{t.freshIngredientsDelivered}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#CFBD97] dark:text-[#8B7355] mr-2">✓</span>
                  <span>{t.variedMenuVegetarian}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#CFBD97] dark:text-[#8B7355] mr-2">✓</span>
                  <span>{t.fastReliableDelivery}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-[#CFBD97] dark:text-[#8B7355] mr-2">✓</span>
                  <span>{t.advantageousLoyaltyProgram}</span>
                </li>
              </ul>
            </div>
            <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden shadow-xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1732206036782-49ae43db8162?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVuY2glMjBmb29kJTIwY3Vpc2luZXxlbnwxfHx8fDE3NjExMjI3MTd8MA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="French Cuisine"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Chef Section */}
      <section className="py-12 md:py-16 bg-[#E4E4E4] dark:bg-[#2A2420]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden shadow-xl order-2 md:order-1">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1698653223689-24b0bfd5150b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVmJTIwY29va2luZyUyMHJlc3RhdXJhbnR8ZW58MXx8fHwxNzYxMDUwOTI3fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Chef Cooking"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="mb-4 md:mb-6 text-foreground">{t.ourPassionateChefs}</h2>
              <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6">
                {t.ourPassionateChefsDesc1}
              </p>
              <p className="text-muted-foreground">
                {t.ourPassionateChefsDesc2}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Loyalty Program */}
      <section className="py-12 md:py-16 bg-[#CFBD97] dark:bg-[#8B7355]">
        <div className="container mx-auto px-4 text-center">
          <Award className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 md:mb-6 text-[#3A2F1F] dark:text-[#E8DCC8]" />
          <h2 className="mb-4 md:mb-6 text-[#3A2F1F] dark:text-[#E8DCC8]">{t.loyaltyProgram}</h2>
          <p className="text-base md:text-lg max-w-2xl mx-auto mb-6 md:mb-8 text-[#3A2F1F] dark:text-[#E8DCC8]">
            {t.loyaltyProgramDesc}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto">
            <Card className="bg-[#E4E4E4] dark:bg-[#2A2420] border-[#C5B59A] dark:border-[#4A4440]">
              <CardContent className="pt-6">
                <p className="text-base md:text-lg text-foreground mb-2">{t.buyTenDishes}</p>
                <p className="text-2xl md:text-3xl text-[#CFBD97] dark:text-[#8B7355] mb-2">{t.onePoint}</p>
                <p className="text-sm text-muted-foreground">{t.tenPercentDiscount}</p>
              </CardContent>
            </Card>
            <Card className="bg-[#E4E4E4] dark:bg-[#2A2420] border-[#C5B59A] dark:border-[#4A4440]">
              <CardContent className="pt-6">
                <p className="text-base md:text-lg text-foreground mb-2">{t.referFriend}</p>
                <p className="text-2xl md:text-3xl text-[#CFBD97] dark:text-[#8B7355] mb-2">{t.twoPoints}</p>
                <p className="text-sm text-muted-foreground">{t.twentyPercentDiscount}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}