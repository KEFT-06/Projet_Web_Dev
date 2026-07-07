import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useApp } from '../../lib/AppContext';
import { predefinedThemes, Restaurant, RestaurantTheme } from '../../lib/AppContext';
import { Store, Plus, Palette } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function RestaurantManager() {
  const { t, restaurants, addRestaurant, setCurrentRestaurant, currentRestaurant } = useApp();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRestaurantName, setNewRestaurantName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>('beige');

  const handleCreateRestaurant = () => {
    if (!newRestaurantName.trim()) {
      toast.error('Veuillez entrer un nom de restaurant');
      return;
    }

    const newRestaurant: Restaurant = {
      id: `rest-${Date.now()}`,
      name: newRestaurantName,
      theme: predefinedThemes[selectedTheme] || predefinedThemes.beige,
    };

    addRestaurant(newRestaurant);
    toast.success(`Restaurant "${newRestaurantName}" créé avec succès !`);
    setNewRestaurantName('');
    setSelectedTheme('beige');
    setShowCreateDialog(false);
  };

  const themeColors = [
    { id: 'beige', name: 'Beige (Par défaut)', color: '#E1D3B5' },
    { id: 'blue', name: 'Bleu', color: '#B5D3E1' },
    { id: 'green', name: 'Vert', color: '#C5E1B5' },
    { id: 'purple', name: 'Violet', color: '#D5B5E1' },
    { id: 'orange', name: 'Orange', color: '#E1C5B5' },
  ];

  return (
    <div className="ml-64">
      <div className="container mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Store className="h-8 w-8 text-primary" />
            <h1 className="text-foreground">{t.manageRestaurants}</h1>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-5 w-5" />
                {t.createRestaurant}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">{t.createRestaurant}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    {t.restaurantName}
                  </Label>
                  <Input
                    id="name"
                    placeholder="Entrez le nom du restaurant"
                    value={newRestaurantName}
                    onChange={(e) => setNewRestaurantName(e.target.value)}
                    className="bg-input-background text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-foreground">
                    {t.selectTheme}
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {themeColors.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setSelectedTheme(theme.id)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedTheme === theme.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div
                          className="w-full h-12 rounded mb-2"
                          style={{ backgroundColor: theme.color }}
                        />
                        <p className="text-sm text-foreground">{theme.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleCreateRestaurant}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {t.createRestaurant}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Current Restaurant */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Store className="h-5 w-5" />
              Restaurant Actuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-lg"
                style={{ backgroundColor: currentRestaurant.theme.background }}
              />
              <div>
                <h3 className="text-lg text-foreground">{currentRestaurant.name}</h3>
                <p className="text-sm text-muted-foreground">Restaurant actif</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Restaurant List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <Card
              key={restaurant.id}
              className={`bg-card border-border hover:shadow-lg transition-shadow cursor-pointer ${
                currentRestaurant.id === restaurant.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => {
                setCurrentRestaurant(restaurant);
                toast.success(`Basculé vers ${restaurant.name}`);
              }}
            >
              <CardHeader>
                <CardTitle className="text-foreground flex items-center justify-between">
                  <span>{restaurant.name}</span>
                  {currentRestaurant.id === restaurant.id && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      Actif
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div
                    className="w-full h-24 rounded-lg"
                    style={{ backgroundColor: restaurant.theme.background }}
                  />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Palette className="h-4 w-4" />
                    <span>Thème personnalisé</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {restaurants.length === 1 && (
          <Card className="bg-muted border-border mt-8">
            <CardContent className="pt-6 text-center">
              <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Créez des restaurants supplémentaires pour étendre votre réseau
              </p>
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(true)}
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Plus className="mr-2 h-4 w-4" />
                Créer un nouveau restaurant
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
