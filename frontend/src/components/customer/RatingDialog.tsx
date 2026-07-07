import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Star, Send, Camera, Smile, Meh, Frown } from 'lucide-react';
import { toast } from 'sonner';
import type { Order } from '../../lib/mockData';

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
}

const RATING_LABELS = {
  1: { label: 'Très mauvais', icon: Frown, color: 'text-red-500' },
  2: { label: 'Mauvais', icon: Frown, color: 'text-orange-500' },
  3: { label: 'Moyen', icon: Meh, color: 'text-yellow-500' },
  4: { label: 'Bon', icon: Smile, color: 'text-lime-500' },
  5: { label: 'Excellent', icon: Smile, color: 'text-green-500' }
};

export function RatingDialog({ open, onOpenChange, order }: RatingDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);

  const badges = [
    { id: 'fast', label: '⚡ Rapide', category: 'delivery' },
    { id: 'hot', label: '🔥 Chaud', category: 'quality' },
    { id: 'delicious', label: '😋 Délicieux', category: 'quality' },
    { id: 'generous', label: '🍽️ Généreux', category: 'quality' },
    { id: 'polite', label: '😊 Courtois', category: 'service' },
    { id: 'clean', label: '✨ Propre', category: 'quality' },
  ];

  const toggleBadge = (badgeId: string) => {
    if (selectedBadges.includes(badgeId)) {
      setSelectedBadges(selectedBadges.filter(id => id !== badgeId));
    } else {
      setSelectedBadges([...selectedBadges, badgeId]);
    }
  };

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error('Veuillez sélectionner une note');
      return;
    }

    // Sauvegarder l'avis
    const reviews = JSON.parse(localStorage.getItem('order_reviews') || '[]');
    reviews.push({
      orderId: order.id,
      rating,
      comment,
      badges: selectedBadges,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('order_reviews', JSON.stringify(reviews));

    toast.success('Merci pour votre avis! 🎉');
    onOpenChange(false);
    
    // Reset
    setRating(0);
    setComment('');
    setSelectedBadges([]);
  };

  const currentRating = hoveredRating || rating;
  const RatingIcon = currentRating > 0 ? RATING_LABELS[currentRating as keyof typeof RATING_LABELS]?.icon : Smile;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            Comment était votre commande?
          </DialogTitle>
          <p className="text-center text-sm text-muted-foreground">
            Commande #{order.id}
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Étoiles */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`w-12 h-12 ${
                      star <= currentRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            
            {currentRating > 0 && (
              <div className="flex items-center gap-2 animate-fade-in">
                {RatingIcon && <RatingIcon className={`w-8 h-8 ${RATING_LABELS[currentRating as keyof typeof RATING_LABELS]?.color}`} />}
                <span className={`text-lg font-semibold ${RATING_LABELS[currentRating as keyof typeof RATING_LABELS]?.color}`}>
                  {RATING_LABELS[currentRating as keyof typeof RATING_LABELS]?.label}
                </span>
              </div>
            )}
          </div>

          {/* Badges rapides */}
          {rating > 0 && (
            <div className="space-y-3 animate-fade-in">
              <p className="text-sm font-medium text-center">Qu'avez-vous particulièrement apprécié?</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {badges.map((badge) => (
                  <button
                    key={badge.id}
                    onClick={() => toggleBadge(badge.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedBadges.includes(badge.id)
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {badge.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Commentaire */}
          {rating > 0 && (
            <div className="space-y-2 animate-fade-in">
              <label className="text-sm font-medium">
                Partagez votre expérience (optionnel)
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Dites-nous en plus sur votre expérience..."
                rows={4}
                className="resize-none"
              />
            </div>
          )}

          {/* Photos (placeholder) */}
          {rating > 0 && (
            <div className="space-y-2 animate-fade-in">
              <label className="text-sm font-medium">Ajouter des photos (optionnel)</label>
              <Button
                variant="outline"
                className="w-full border-dashed border-2 h-24 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex flex-col items-center gap-2">
                  <Camera className="w-6 h-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Cliquez pour ajouter des photos</span>
                </div>
              </Button>
            </div>
          )}

          {/* Articles de la commande */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">Articles commandés:</p>
            <div className="space-y-1">
              {order.items.map((item, idx) => (
                <div key={idx} className="text-sm text-muted-foreground">
                  • {item.itemName} x{item.quantity}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Plus tard
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
          >
            <Send className="w-4 h-4 mr-2" />
            Envoyer mon avis
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
