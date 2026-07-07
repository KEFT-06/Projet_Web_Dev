import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { getMenuItems, saveMenuItems } from '../../lib/storage';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { formatPrice } from '../../lib/utils';

// Textes traduits (à déplacer dans translations.ts plus tard)
const texts = {
  menuManagement: "Gestion du menu",
  addMenuItem: "Ajouter un élément",
  editMenuItem: "Modifier l\'élément",
  filterByCategory: "Filtrer par catégorie",
  allCategories: "Toutes les catégories",
  starters: "Entrées",
  mains: "Plats",
  drinks: "Boissons",
  name: "Nom",
  category: "Catégorie",
  description: "Description",
  price: "Prix",
  image: "Image",
  available: "Disponible",
  inStock: "En stock",
  cancel: "Annuler",
  update: "Mettre à jour",
  create: "Créer",
  confirmDelete: "Confirmer la suppression",
  deleteMenuItemConfirmation: "Êtes-vous sûr de vouloir supprimer cet élément du menu ?",
  delete: "Supprimer",
  imageUploadError: "Erreur lors du téléchargement de l\'image",
  menuItemUpdated: "Élément du menu mis à jour",
  menuItemCreated: "Élément du menu créé",
  menuItemDeleted: "Élément du menu supprimé",
  menuItemDeleteError: "Erreur lors de la suppression de l\'élément",
  menuItemSaveError: "Erreur lors de l\'enregistrement de l\'élément",
  error: "Erreur"
};

interface MenuItem {
  id: string;
  name: string;
  category: "starter" | "main" | "drink";
  price: number;
  description: string;
  image: string;
  available: boolean;
  inStock: boolean;
}

interface MenuFormData {
  name: string;
  category: "starter" | "main" | "drink";
  price: number;
  description: string;
  image: string;
  available: boolean;
  inStock: boolean;
}

interface MenuManagementProps {
  canEdit: boolean;
  canDelete: boolean;
}

const defaultFormData: MenuFormData = {
  name: "",
  category: "main",
  price: 0,
  description: "",
  image: "",
  available: true,
  inStock: true
};
export function MenuManagement({ canEdit, canDelete }: MenuManagementProps) {
  const t = texts;
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [formData, setFormData] = useState<MenuFormData>(defaultFormData);
  const [filter, setFilter] = useState<"all" | "starter" | "main" | "drink">("all");
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Fonction pour convertir une image en base64
  const imageToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Handler pour le changement d\'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageLoading(true);
      try {
        imageToBase64(e.target.files[0]).then(base64Image => {
          setFormData(prev => ({ ...prev, image: base64Image }));
          setImageLoading(false);
        }).catch(error => {
          console.error("Error converting image:", error);
          toast.error(t.imageUploadError);
          setImageLoading(false);
        });
      } catch (error) {
        console.error("Error converting image:", error);
        toast.error(t.imageUploadError);
        setImageLoading(false);
      }
    }
  };

  // Handler pour le changement des champs du formulaire
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    const name = e.target.name;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (item: MenuItem) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description,
      image: item.image,
      available: item.available,
      inStock: item.inStock
    });
    setShowDialog(true);
  };

  const handleDelete = (item: MenuItem) => {
    setSelectedItem(item);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedItem) return;
    setLoading(true);
    try {
      const updatedItems = menuItems.filter(item => item.id !== selectedItem.id);
      setMenuItems(updatedItems);
      saveMenuItems(updatedItems);
      toast.success(t.menuItemDeleted);
      setShowDeleteDialog(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Error deleting menu item:", error);
      toast.error(t.menuItemDeleteError);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
    setSelectedItem(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error("Le nom est requis");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("La description est requise");
      return;
    }
    if (formData.price <= 0) {
      toast.error("Le prix doit être supérieur à 0");
      return;
    }

    setLoading(true);
    try {
      let updatedItems: MenuItem[];

      if (selectedItem) {
        // Update
        const updatedItem = { ...selectedItem, ...formData };
        updatedItems = menuItems.map(item =>
          item.id === selectedItem.id ? updatedItem : item
        );
        toast.success(t.menuItemUpdated);
      } else {
        // Create
        const newItem = {
          ...formData,
          id: crypto.randomUUID()
        } as MenuItem;
        updatedItems = [...menuItems, newItem];
        toast.success(t.menuItemCreated);
      }

      // Update state and storage
      setMenuItems(updatedItems);
      saveMenuItems(updatedItems);

      // Reset dialog after successful operation
      resetDialog();
    } catch (error) {
      console.error("Error saving menu item:", error);
      toast.error(t.menuItemSaveError);
    } finally {
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setShowDialog(false);
    setSelectedItem(null);
    setFormData(defaultFormData);
    // Reset file input
    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  useEffect(() => {
    const loadMenuItems = () => {
      setLoading(true);
      try {
        const items = getMenuItems();
        setMenuItems(items);
      } catch (error) {
        console.error("Error loading menu items:", error);
        toast.error(t.error);
      } finally {
        setLoading(false);
      }
    };

    loadMenuItems();
  }, [t.error]);
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t.menuManagement}</h2>
        {canEdit && (
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t.addMenuItem}
          </Button>
        )}
      </div>

      <div className="mb-6">
        <Select value={filter} onValueChange={(value: "all" | "starter" | "main" | "drink") => setFilter(value)}>
          <SelectTrigger>
            <SelectValue placeholder={t.filterByCategory} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.allCategories}</SelectItem>
            <SelectItem value="starter">{t.starters}</SelectItem>
            <SelectItem value="main">{t.mains}</SelectItem>
            <SelectItem value="drink">{t.drinks}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Chargement...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menuItems
            .filter(item => filter === "all" || item.category === filter)
            .map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="relative h-48">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="object-cover w-full h-full"
                  />
                  <Badge
                    variant={item.available ? "default" : "secondary"}
                    className="absolute top-2 right-2"
                  >
                    {item.available ? t.inStock : "Non disponible"}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                  <p className="text-gray-600 mb-2">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold notranslate" translate="no">{formatPrice(Number(item.price) || 0)}</span>
                    <div className="space-x-2">
                      {canEdit && (
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {/* Dialog for adding/editing menu item */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? t.editMenuItem : t.addMenuItem}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">{t.name}</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">{t.category}</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value: "starter" | "main" | "drink") => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.category} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">{t.starters}</SelectItem>
                  <SelectItem value="main">{t.mains}</SelectItem>
                  <SelectItem value="drink">{t.drinks}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">{t.description}</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="price">{t.price}</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleFormChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="image">{t.image}</Label>
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={imageLoading}
              />
              {imageLoading && <p className="text-sm text-gray-500 mt-1">Chargement de l'image...</p>}
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="available"
                name="available"
                checked={formData.available}
                onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, available: checked }))}
              />
              <Label htmlFor="available">{t.available}</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={resetDialog}>
                {t.cancel}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedItem ? t.update : t.create}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog for confirming deletion */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.confirmDelete}</DialogTitle>
            <DialogDescription>
              {t.deleteMenuItemConfirmation}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDeleteDialog}>
              {t.cancel}
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              {t.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
