import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Tag, 
  Gift, 
  Gamepad2, 
  PartyPopper,
  Sparkles,
  Eye,
  Clock
} from 'lucide-react';

type PromotionStatus = 'active' | 'scheduled' | 'expired';
type PromotionType = 'offer' | 'event' | 'game';

interface Promotion {
  id: string;
  title: string;
  description: string;
  image: string;
  startDate: Date;
  endDate: Date;
  type: PromotionType;
  status: PromotionStatus;
  discount?: number;
  backgroundColor?: string;
  textColor?: string;
}

const PROMO_TEMPLATES = {
  offer: {
    backgroundColor: 'from-red-500 to-orange-500',
    textColor: 'text-white',
    icon: Gift,
    label: 'Offre Spéciale'
  },
  event: {
    backgroundColor: 'from-purple-500 to-pink-500',
    textColor: 'text-white',
    icon: PartyPopper,
    label: 'Événement'
  },
  game: {
    backgroundColor: 'from-blue-500 to-cyan-500',
    textColor: 'text-white',
    icon: Gamepad2,
    label: 'Jeu Concours'
  }
};

export function ModernPromotionsManagement() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
  const [previewPromo, setPreviewPromo] = useState<Promotion | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    image: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    type: 'offer' as PromotionType,
    discount: ''
  });

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = () => {
    const stored = localStorage.getItem('restaurant_promotions');
    if (stored) {
      const promos = JSON.parse(stored).map((p: any) => ({
        ...p,
        startDate: new Date(p.startDate),
        endDate: new Date(p.endDate)
      }));
      setPromotions(promos);
    } else {
      // Créer des promotions par défaut
      const defaultPromos: Promotion[] = [
        {
          id: 'promo1',
          title: '🎉 -30% sur tous les plats!',
          description: 'Profitez de 30% de réduction sur l\'ensemble de notre carte du lundi au vendredi.',
          image: '/data/images/promo-30-percent.jpg',
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          type: 'offer',
          status: 'active',
          discount: 30,
          backgroundColor: 'from-red-500 to-orange-500',
          textColor: 'text-white'
        },
        {
          id: 'promo2',
          title: '🎊 Soirée Étudiante - Vendredi',
          description: 'Rejoignez-nous pour une soirée spéciale étudiante avec DJ, jeux et prix réduits!',
          image: '/data/images/event-student-night.jpg',
          startDate: new Date(),
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          type: 'event',
          status: 'active',
          backgroundColor: 'from-purple-500 to-pink-500',
          textColor: 'text-white'
        },
        {
          id: 'promo3',
          title: '🎮 Gagnez un repas gratuit!',
          description: 'Participez à notre jeu concours et tentez de gagner un repas complet gratuit pour 2 personnes.',
          image: '/data/images/game-free-meal.jpg',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          type: 'game',
          status: 'active',
          backgroundColor: 'from-blue-500 to-cyan-500',
          textColor: 'text-white'
        }
      ];
      localStorage.setItem('restaurant_promotions', JSON.stringify(defaultPromos));
      setPromotions(defaultPromos);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title || !form.description || !form.startDate || !form.endDate) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const template = PROMO_TEMPLATES[form.type];
    const newPromo: Promotion = {
      id: editingPromo?.id || `promo_${Date.now()}`,
      title: form.title,
      description: form.description,
      image: form.image || '/data/images/default-promo.jpg',
      startDate: new Date(form.startDate),
      endDate: new Date(form.endDate),
      type: form.type,
      status: new Date(form.startDate) <= new Date() ? 'active' : 'scheduled',
      discount: form.discount ? parseInt(form.discount) : undefined,
      backgroundColor: template.backgroundColor,
      textColor: template.textColor
    };

    let updatedPromos;
    if (editingPromo) {
      updatedPromos = promotions.map(p => p.id === editingPromo.id ? newPromo : p);
      toast.success('Promotion modifiée avec succès!');
    } else {
      updatedPromos = [...promotions, newPromo];
      toast.success('Promotion créée avec succès!');
    }

    localStorage.setItem('restaurant_promotions', JSON.stringify(updatedPromos));
    setPromotions(updatedPromos);
    resetForm();
  };

  const handleEdit = (promo: Promotion) => {
    setEditingPromo(promo);
    setForm({
      title: promo.title,
      description: promo.description,
      image: promo.image,
      startDate: promo.startDate.toISOString().split('T')[0],
      endDate: promo.endDate.toISOString().split('T')[0],
      type: promo.type,
      discount: promo.discount?.toString() || ''
    });
    setShowDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette promotion?')) {
      const updatedPromos = promotions.filter(p => p.id !== id);
      localStorage.setItem('restaurant_promotions', JSON.stringify(updatedPromos));
      setPromotions(updatedPromos);
      toast.success('Promotion supprimée');
    }
  };

  const handlePreview = (promo: Promotion) => {
    setPreviewPromo(promo);
    setShowPreview(true);
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      image: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      type: 'offer',
      discount: ''
    });
    setEditingPromo(null);
    setShowDialog(false);
  };

  const getStatusBadge = (status: PromotionStatus) => {
    const variants = {
      active: 'default',
      scheduled: 'secondary',
      expired: 'destructive'
    };
    const labels = {
      active: 'Active',
      scheduled: 'Programmée',
      expired: 'Expirée'
    };
    return <Badge variant={variants[status] as any}>{labels[status]}</Badge>;
  };

  const getTypeIcon = (type: PromotionType) => {
    const Icon = PROMO_TEMPLATES[type].icon;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Gestion des Promotions</h1>
              <p className="text-muted-foreground">Créez et gérez vos offres, événements et jeux</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowDialog(true)}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Promotion
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Promotions Actives</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                  {promotions.filter(p => p.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <Tag className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Programmées</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-400">
                  {promotions.filter(p => p.status === 'scheduled').length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Promotions</p>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-400">
                  {promotions.length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map((promo) => (
          <Card key={promo.id} className="overflow-hidden hover:shadow-xl transition-shadow">
            {/* Affiche de la promotion */}
            <div className={`relative h-48 bg-gradient-to-br ${promo.backgroundColor} p-6 flex flex-col justify-between`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(promo.type)}
                  <Badge className="bg-white/20 text-white border-white/30">
                    {PROMO_TEMPLATES[promo.type].label}
                  </Badge>
                </div>
                {promo.discount && (
                  <div className="inline-block bg-yellow-400 text-black px-3 py-1 rounded-full font-bold text-2xl mb-2">
                    -{promo.discount}%
                  </div>
                )}
              </div>
              
              <div className="relative z-10">
                <h3 className={`text-xl font-bold ${promo.textColor} mb-2 line-clamp-2`}>
                  {promo.title}
                </h3>
              </div>
            </div>

            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {promo.description}
              </p>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Calendar className="w-4 h-4" />
                <span>
                  {promo.startDate.toLocaleDateString()} - {promo.endDate.toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                {getStatusBadge(promo.status)}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePreview(promo)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(promo)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(promo.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog Création/Édition */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPromo ? 'Modifier la Promotion' : 'Nouvelle Promotion'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Type de Promotion</label>
              <Select 
                value={form.type} 
                onValueChange={(value) => setForm({ ...form, type: value as PromotionType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="offer">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4" />
                      Offre Spéciale
                    </div>
                  </SelectItem>
                  <SelectItem value="event">
                    <div className="flex items-center gap-2">
                      <PartyPopper className="w-4 h-4" />
                      Événement
                    </div>
                  </SelectItem>
                  <SelectItem value="game">
                    <div className="flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4" />
                      Jeu Concours
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Titre *</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Ex: -30% sur tous les plats!"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description *</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Décrivez votre promotion..."
                rows={4}
                required
              />
            </div>

            {form.type === 'offer' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Réduction (%)</label>
                <Input
                  type="number"
                  value={form.discount}
                  onChange={(e) => setForm({ ...form, discount: e.target.value })}
                  placeholder="Ex: 30"
                  min="0"
                  max="100"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Date de Début *</label>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Date de Fin *</label>
                <Input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Image</label>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="flex-1"
                />
                {form.image && (
                  <img src={form.image} alt="Preview" className="w-20 h-20 object-cover rounded" />
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetForm}>
                Annuler
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-orange-600 to-red-600">
                {editingPromo ? 'Modifier' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Prévisualisation */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Aperçu de l'Affiche</DialogTitle>
          </DialogHeader>
          
          {previewPromo && (
            <div className="space-y-4">
              <div className={`relative h-64 bg-gradient-to-br ${previewPromo.backgroundColor} p-6 flex flex-col justify-between rounded-lg overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(previewPromo.type)}
                    <Badge className="bg-white/20 text-white border-white/30">
                      {PROMO_TEMPLATES[previewPromo.type].label}
                    </Badge>
                  </div>
                  {previewPromo.discount && (
                    <div className="inline-block bg-yellow-400 text-black px-4 py-2 rounded-full font-bold text-3xl mb-2">
                      -{previewPromo.discount}%
                    </div>
                  )}
                </div>
                
                <div className="relative z-10">
                  <h3 className={`text-2xl font-bold ${previewPromo.textColor} mb-2`}>
                    {previewPromo.title}
                  </h3>
                  <p className={`text-sm ${previewPromo.textColor} opacity-90`}>
                    {previewPromo.description}
                  </p>
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                Cette affiche sera affichée sur la page d'accueil
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
