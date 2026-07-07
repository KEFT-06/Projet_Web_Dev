import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';

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
  price?: number;
}

interface FormState {
  title: string;
  description: string;
  image: string;
  startDate: Date;
  endDate: Date;
  type: PromotionType;
  price?: number;
}

export function PromotionsManagement() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    image: '',
    startDate: new Date(),
    endDate: new Date(),
    type: 'offer',
    price: undefined
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    // Charger les promotions depuis le localStorage
    const storedPromos = localStorage.getItem('promotions');
    if (storedPromos) {
      setPromotions(JSON.parse(storedPromos).map((p: any) => ({
        ...p,
        startDate: new Date(p.startDate),
        endDate: new Date(p.endDate)
      })));
    }
  }, []);

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
      };
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const resizedImage = await resizeImage(file);
      setForm(f => ({ ...f, image: resizedImage }));
    }
  };

  const handleAdd = async () => {
    if (!form.title.trim() || !form.image) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    const newPromo: Promotion = {
      id: Date.now().toString(),
      ...form,
      status: new Date() > form.startDate ? 'active' : 'scheduled'
    };

    const updatedPromos = [...promotions, newPromo];
    setPromotions(updatedPromos);
    localStorage.setItem('promotions', JSON.stringify(updatedPromos));
    setForm({ 
      title: '', 
      description: '', 
      image: '',
      startDate: new Date(),
      endDate: new Date(),
      type: 'offer' 
    });
    setImageFile(null);
    toast.success('Promotion ajoutée avec succès');
  };

  const handleEdit = (id: string) => {
    const promo = promotions.find(p => p.id === id);
    if (promo) {
      setForm({
        title: promo.title,
        description: promo.description,
        image: promo.image,
        startDate: promo.startDate,
        endDate: promo.endDate,
        type: promo.type,
        price: promo.price
      });
      setEditingId(id);
    }
  };

  const handleUpdate = async () => {
    if (!form.title.trim()) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    const updatedPromos = promotions.map(p => 
      p.id === editingId 
        ? { 
            ...p, 
            ...form,
            status: new Date() > form.startDate ? 'active' : 'scheduled'
          } 
        : p
    );

    setPromotions(updatedPromos);
    localStorage.setItem('promotions', JSON.stringify(updatedPromos));
    setForm({ 
      title: '', 
      description: '', 
      image: '',
      startDate: new Date(),
      endDate: new Date(),
      type: 'offer'
    });
    setEditingId(null);
    setImageFile(null);
    toast.success('Promotion mise à jour avec succès');
  };

  const handleDelete = (id: string) => {
    const updatedPromos = promotions.filter(p => p.id !== id);
    setPromotions(updatedPromos);
    localStorage.setItem('promotions', JSON.stringify(updatedPromos));
    toast.success('Promotion supprimée');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8">Gestion des Promotions & Événements</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{editingId ? 'Modifier la promotion' : 'Nouvelle promotion'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Type</label>
              <select 
                className="w-full rounded border p-2"
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value as PromotionType }))}
                id="promotion-type"
                title="Type de promotion"
                aria-label="Type de promotion"
              >
                <option value="offer">Offre spéciale</option>
                <option value="event">Événement</option>
                <option value="game">Jeu</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Titre</label>
              <Input 
                placeholder="Titre de la promotion" 
                value={form.title} 
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea 
                placeholder="Description détaillée..." 
                value={form.description} 
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="resize-none"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Image</label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                  id="promotion-image"
                  title="Sélectionner une image"
                  aria-label="Sélectionner une image"
                />
                {form.image && (
                  <div className="mt-2">
                    <img src={form.image} alt="Preview" className="max-w-xs rounded" />
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Date de début</label>
                <Input
                  type="date"
                  value={form.startDate.toISOString().split('T')[0]}
                  onChange={e => setForm(f => ({ ...f, startDate: new Date(e.target.value) }))}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Date de fin</label>
                <Input
                  type="date"
                  value={form.endDate.toISOString().split('T')[0]}
                  onChange={e => setForm(f => ({ ...f, endDate: new Date(e.target.value) }))}
                  required
                />
              </div>
            </div>

            {form.type === 'game' && (
              <div>
                <label className="text-sm font-medium mb-1 block">Prix (€)</label>
                <Input
                  type="number"
                  placeholder="Prix du jeu"
                  value={form.price || ''}
                  onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || undefined }))}
                  min="0"
                  step="0.01"
                />
              </div>
            )}

            {editingId ? (
              <div className="flex gap-2">
                <Button onClick={handleUpdate} type="button">Mettre à jour</Button>
                <Button variant="outline" onClick={() => {
                  setEditingId(null);
                  setForm({ 
                    title: '', 
                    description: '', 
                    image: '',
                    startDate: new Date(),
                    endDate: new Date(),
                    type: 'offer'
                  });
                  setImageFile(null);
                }} type="button">Annuler</Button>
              </div>
            ) : (
              <Button onClick={handleAdd} type="button">Ajouter</Button>
            )}
          </form>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map(promo => (
          <Card key={promo.id} className="overflow-hidden">
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={promo.image} 
                alt={promo.title} 
                className="w-full h-full object-cover transform hover:scale-105 transition-transform"
              />
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold truncate">{promo.title}</h3>
                <Badge variant={
                  promo.status === 'active' ? 'default' :
                  promo.status === 'scheduled' ? 'secondary' : 'destructive'
                }>
                  {promo.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{promo.description}</p>
              <div className="flex flex-col space-y-2 text-sm text-gray-500">
                <div>Début: {promo.startDate.toLocaleDateString()}</div>
                <div>Fin: {promo.endDate.toLocaleDateString()}</div>
                {promo.type === 'game' && promo.price && (
                  <div>Prix: {promo.price}€</div>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => handleEdit(promo.id)}>
                  Modifier
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(promo.id)}>
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
