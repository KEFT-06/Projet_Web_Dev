import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  ChefHat, 
  Coffee, 
  Utensils, 
  X, 
  Check,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { getMenuItems, getTodaysDailyMenu, saveDailyMenu } from '../../lib/storage';
import type { MenuItem, DailyMenu } from '../../lib/mockData';
import { toast } from 'sonner';

interface DailyMenuManagementProps {
  userId: string;
}

export function DailyMenuManagement({ userId }: DailyMenuManagementProps) {
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const [currentDailyMenu, setCurrentDailyMenu] = useState<DailyMenu | null>(null);
  const [selectedStarters, setSelectedStarters] = useState<string[]>([]);
  const [selectedMains, setSelectedMains] = useState<string[]>([]);
  const [selectedDrinks, setSelectedDrinks] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const items = getMenuItems();
    setAllMenuItems(items);
    
    const todaysMenu = getTodaysDailyMenu();
    setCurrentDailyMenu(todaysMenu);
    
    if (todaysMenu) {
      setSelectedStarters(todaysMenu.starters);
      setSelectedMains(todaysMenu.mains);
      setSelectedDrinks(todaysMenu.drinks);
    }
  };

  const toggleSelection = (itemId: string, category: 'starter' | 'main' | 'drink') => {
    if (category === 'starter') {
      if (selectedStarters.includes(itemId)) {
        setSelectedStarters(selectedStarters.filter(id => id !== itemId));
      } else if (selectedStarters.length < 4) {
        setSelectedStarters([...selectedStarters, itemId]);
      } else {
        toast.error('Maximum 4 entrées pour le menu du jour');
      }
    } else if (category === 'main') {
      if (selectedMains.includes(itemId)) {
        setSelectedMains(selectedMains.filter(id => id !== itemId));
      } else if (selectedMains.length < 4) {
        setSelectedMains([...selectedMains, itemId]);
      } else {
        toast.error('Maximum 4 plats principaux pour le menu du jour');
      }
    } else if (category === 'drink') {
      if (selectedDrinks.includes(itemId)) {
        setSelectedDrinks(selectedDrinks.filter(id => id !== itemId));
      } else if (selectedDrinks.length < 4) {
        setSelectedDrinks([...selectedDrinks, itemId]);
      } else {
        toast.error('Maximum 4 boissons pour le menu du jour');
      }
    }
  };

  const saveDailyMenuConfig = () => {
    if (selectedStarters.length === 0 && selectedMains.length === 0 && selectedDrinks.length === 0) {
      toast.error('Sélectionnez au moins un plat pour le menu du jour');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const dailyMenu: DailyMenu = {
      id: `dm_${Date.now()}`,
      date: today,
      starters: selectedStarters,
      mains: selectedMains,
      drinks: selectedDrinks,
      createdBy: userId,
      createdAt: new Date()
    };

    saveDailyMenu(dailyMenu);
    setCurrentDailyMenu(dailyMenu);
    toast.success('Menu du jour enregistré avec succès!');
  };

  const clearSelection = () => {
    setSelectedStarters([]);
    setSelectedMains([]);
    setSelectedDrinks([]);
  };

  const starters = allMenuItems.filter(item => item.category === 'starter' && item.available);
  const mains = allMenuItems.filter(item => item.category === 'main' && item.available);
  const drinks = allMenuItems.filter(item => item.category === 'drink' && item.available);

  const isSelected = (itemId: string) => {
    return selectedStarters.includes(itemId) || selectedMains.includes(itemId) || selectedDrinks.includes(itemId);
  };

  const renderMenuItem = (item: MenuItem, category: 'starter' | 'main' | 'drink') => {
    const selected = isSelected(item.id);
    
    return (
      <Card 
        key={item.id}
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
          selected 
            ? 'border-2 border-green-500 bg-green-50 dark:bg-green-950' 
            : 'hover:border-gray-300'
        }`}
        onClick={() => toggleSelection(item.id, category)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="relative w-20 h-20 flex-shrink-0">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-full h-full object-cover rounded-lg"
              />
              {selected && (
                <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm mb-1 truncate">{item.name}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {item.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-green-600 notranslate" translate="no">
                  {item.price.toLocaleString('fr-FR')} FCFA
                </span>
                {!item.inStock && (
                  <Badge variant="destructive" className="text-xs">Épuisé</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ChefHat className="w-8 h-8 text-orange-500" />
          <h1 className="text-3xl font-bold">Gestion du Menu du Jour</h1>
        </div>
        <p className="text-muted-foreground">
          Sélectionnez jusqu'à 4 plats par catégorie pour composer le menu du jour
        </p>
      </div>

      {/* Current Daily Menu Status */}
      {currentDailyMenu && (
        <Card className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-700 dark:text-green-400">
                Menu du jour actif
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Entrées:</span>
                <span className="ml-2 font-semibold">{currentDailyMenu.starters.length}/4</span>
              </div>
              <div>
                <span className="text-muted-foreground">Plats:</span>
                <span className="ml-2 font-semibold">{currentDailyMenu.mains.length}/4</span>
              </div>
              <div>
                <span className="text-muted-foreground">Boissons:</span>
                <span className="ml-2 font-semibold">{currentDailyMenu.drinks.length}/4</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selection Summary */}
      <Card className="mb-6 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Utensils className="w-5 h-5 text-orange-500" />
                <span className="text-sm">
                  <strong>{selectedStarters.length}</strong>/4 Entrées
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-red-500" />
                <span className="text-sm">
                  <strong>{selectedMains.length}</strong>/4 Plats
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Coffee className="w-5 h-5 text-blue-500" />
                <span className="text-sm">
                  <strong>{selectedDrinks.length}</strong>/4 Boissons
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearSelection}
                disabled={selectedStarters.length === 0 && selectedMains.length === 0 && selectedDrinks.length === 0}
              >
                <X className="w-4 h-4 mr-2" />
                Effacer
              </Button>
              <Button 
                size="sm"
                onClick={saveDailyMenuConfig}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Enregistrer le Menu
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-1">Important:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Les plats sélectionnés seront affichés sur l'accueil de tous les utilisateurs</li>
                <li>Les plats non sélectionnés seront marqués comme "Non disponible aujourd'hui"</li>
                <li>Le menu du jour est valable uniquement pour aujourd'hui</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Starters Section */}
      <Card className="mb-6">
        <CardHeader className="bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900 dark:to-orange-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-orange-600" />
              <CardTitle>Entrées ({selectedStarters.length}/4 sélectionnées)</CardTitle>
            </div>
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              {starters.length} disponibles
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {starters.map(item => renderMenuItem(item, 'starter'))}
          </div>
        </CardContent>
      </Card>

      {/* Mains Section */}
      <Card className="mb-6">
        <CardHeader className="bg-gradient-to-r from-red-100 to-red-50 dark:from-red-900 dark:to-red-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-red-600" />
              <CardTitle>Plats Principaux ({selectedMains.length}/4 sélectionnés)</CardTitle>
            </div>
            <Badge variant="outline" className="text-red-600 border-red-600">
              {mains.length} disponibles
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mains.map(item => renderMenuItem(item, 'main'))}
          </div>
        </CardContent>
      </Card>

      {/* Drinks Section */}
      <Card className="mb-6">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coffee className="w-5 h-5 text-blue-600" />
              <CardTitle>Boissons ({selectedDrinks.length}/4 sélectionnées)</CardTitle>
            </div>
            <Badge variant="outline" className="text-blue-600 border-blue-600">
              {drinks.length} disponibles
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {drinks.map(item => renderMenuItem(item, 'drink'))}
          </div>
        </CardContent>
      </Card>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <Button 
          size="lg"
          onClick={saveDailyMenuConfig}
          className="bg-green-600 hover:bg-green-700 shadow-lg rounded-full h-14 px-6"
          disabled={selectedStarters.length === 0 && selectedMains.length === 0 && selectedDrinks.length === 0}
        >
          <Check className="w-5 h-5 mr-2" />
          Enregistrer le Menu du Jour
        </Button>
      </div>
    </div>
  );
}
