import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getMenuItems, getEvents, saveEvents } from '../../lib/storage';
import type { MenuItem, Event, User } from '../../lib/mockData';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Search, ShoppingCart, Trash2, Plus, Minus, Sparkles, Clock, MapPin, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '../../lib/utils';
import { useApp } from '../../lib/AppContext';
import { apiCreateOrder, apiPayOrder } from '../../lib/api';
import { addOrder } from '../../lib/storage';
import { notifyNewOrder } from '../../lib/notificationService';

interface CustomerMenuProps {
  user: User | null;
}

export function CustomerMenu({ user }: CustomerMenuProps) {
  const { t } = useApp();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number }[]>([]);
  const [deliveryMode, setDeliveryMode] = useState<'onsite'|'delivery'>('onsite');
  const [arrivalTime, setArrivalTime] = useState('');
  const [comment, setComment] = useState('');
  const [pointsToUse, setPointsToUse] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'starter' | 'main' | 'drink'>('all');
  const [isPaying, setIsPaying] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    setLoading(true);
    // simulate async and allow skeleton to render at least one frame
    try {
      const items = getMenuItems();
      const evs = getEvents();
      setMenuItems(items);
      setEvents(evs);
    } finally {
      setTimeout(() => setLoading(false), 0);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(searchQuery.trim().toLowerCase()), 250);
    return () => clearTimeout(id);
  }, [searchQuery]);

  const filteredItems = menuItems.filter((item) => {
    const q = debouncedQuery;
    const matchesSearch = q.length === 0 || item.name.toLowerCase().includes(q) ||
                         item.description.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.available;
  });

  // Deduplicate by name to avoid duplicate dishes/entries/drinks across data sources
  const uniqueByNameMap = new Map<string, MenuItem>();
  for (const it of filteredItems) {
    if (!uniqueByNameMap.has(it.name)) uniqueByNameMap.set(it.name, it);
  }
  const uniqueItems = Array.from(uniqueByNameMap.values());
  const visibleItems = uniqueItems.slice(0, visibleCount);

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(c => c.item.id === item.id);
    if (existingItem) {
      setCart(cart.map(c =>
        c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setCart([...cart, { item, quantity: 1 }]);
    }
    toast.success(`${item.name} ${t.addToCart}`);
  };

  // Totals preview
  const subtotal = cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0);
  const deliveryFee = deliveryMode === 'delivery' ? 500 : 0;
  const maxPoints = Math.max(0, Math.min(user?.loyaltyPoints || 0, Math.floor((subtotal + deliveryFee) / 10)));
  const pointsApplied = Math.max(0, Math.min(pointsToUse, maxPoints));
  const discount = pointsApplied * 10;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  const checkout = async () => {
    if (!user) {
      toast.error(t.login);
      return;
    }
    // Vérification: seul un étudiant (customer) peut commander
    if (user.role !== 'customer') {
      toast.error('Seuls les étudiants peuvent passer des commandes');
      return;
    }
    if (cart.length === 0) {
      toast.error(t.cart + ' empty');
      return;
    }
    const token = localStorage.getItem('auth_token');
    if (!token) {
      toast.error('Not authenticated');
      return;
    }
    try {
      setIsPaying(true);
      const items = cart.map(c => ({ id: c.item.id, name: c.item.name, price: c.item.price, quantity: c.quantity }));
      const { order } = await apiCreateOrder({ items, deliveryMode, arrivalTime: deliveryMode === 'onsite' ? arrivalTime || undefined : undefined, comment: comment || undefined, loyaltyPointsToUse: pointsApplied }, token);
      await apiPayOrder(order.id, token);
      toast.success('Commande payée avec succès');
      try {
        const newOrder = {
          id: order.id,
          customerId: user.id,
          customerName: `${user.firstName} ${user.lastName}`,
          customerAddress: '',
          items: items.map(it => ({ menuItemId: it.id, quantity: it.quantity, itemName: it.name, price: it.price })),
          total: order.total,
          status: order.status as any,
          timestamp: new Date(order.created_at),
          paymentStatus: 'paid' as const,
        };
        addOrder(newOrder);
        
        // Envoyer notification de nouvelle commande
        notifyNewOrder(newOrder, user);
      } catch {}
      setCart([]);
      setPointsToUse(0);
      setComment('');
      setArrivalTime('');
    } catch (e: any) {
      const code = e?.body?.error;
      if (code === 'empty_cart') toast.error('Panier vide');
      else toast.error('Erreur lors du paiement');
    } finally {
      setIsPaying(false);
    }
  };

  const registerForEvent = (eventId: string) => {
    if (!user) {
      toast.error(t.login + ' to ' + t.signup.toLowerCase());
      return;
    }

    const allEvents = getEvents();
    const eventIndex = allEvents.findIndex(e => e.id === eventId);

    if (eventIndex !== -1) {
      const event = allEvents[eventIndex];

      if (event.participants.includes(user.id)) {
        toast.error(t.alreadyRegistered);
        return;
      }

      if (event.participants.length >= event.maxParticipants) {
        toast.error(t.unavailable);
        return;
      }

      event.participants.push(user.id);
      allEvents[eventIndex] = event;
      saveEvents(allEvents);
      setEvents(allEvents);
      toast.success(t.confirm);
    }
  };

  const categories = [
    { id: 'all', label: t.allItems },
    { id: 'starter', label: t.starters },
    { id: 'main', label: t.mainCourses },
    { id: 'drink', label: t.drinks },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header avec gradient */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t.ourMenu}</h1>
            <p className="text-muted-foreground">Découvrez nos délicieux plats</p>
          </div>
        </div>
        {/* Badge Panier */}
        {cart.length > 0 && (
          <div className="relative">
            <Button
              variant="outline"
              size="lg"
              className="relative border-orange-200 hover:bg-orange-50"
              onClick={() => document.getElementById('cart-section')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Panier
              <Badge className="ml-2 bg-orange-500 text-white">{cart.length}</Badge>
            </Button>
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="mb-6 md:mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t.searchDishes}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input text-foreground placeholder:text-muted-foreground h-11"
            />
          </div>
          <div className="w-full md:w-64">
            <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
              <SelectTrigger className="bg-input text-foreground border-border h-11">
                <SelectValue placeholder={t.selectCategory} />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id} className="text-foreground hover:bg-muted">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

      {/* Skeleton while loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-border rounded-md p-4 animate-pulse bg-card">
              <div className="h-40 bg-muted rounded mb-3" />
              <div className="h-4 bg-muted rounded w-2/3 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Checkout Controls */}
      <div id="cart-section" className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900">
            <CardTitle className="text-foreground flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
              Options de commande
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="text-sm text-foreground font-medium flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Mode
                </label>
                <Select value={deliveryMode} onValueChange={(v) => setDeliveryMode(v as any)}>
                  <SelectTrigger className="bg-input text-foreground border-border">
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="onsite" className="text-foreground">🍽️ Sur place</SelectItem>
                    <SelectItem value="delivery" className="text-foreground">🚚 Livraison</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {deliveryMode === 'onsite' && (
                <div>
                  <label className="text-sm text-foreground font-medium flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Heure d'arrivée
                  </label>
                  <Input type="time" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} className="bg-input text-foreground border-border" />
                </div>
              )}
              {deliveryMode === 'delivery' && (
                <div>
                  <label className="text-sm text-foreground font-medium flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    Adresse
                  </label>
                  <Input placeholder="Votre adresse de livraison" className="bg-input text-foreground border-border" />
                </div>
              )}
              <div>
                <label className="text-sm text-foreground font-medium flex items-center gap-1">
                  <Gift className="w-4 h-4" />
                  Points à utiliser (max {maxPoints})
                </label>
                <Input type="number" min={0} max={maxPoints} value={pointsToUse} onChange={(e) => setPointsToUse(Math.max(0, Math.min(maxPoints, Number(e.target.value||0))))} className="bg-input text-foreground border-border" />
                {pointsApplied > 0 && (
                  <p className="text-xs text-green-600 mt-1">💰 Vous économisez {formatPrice(discount)}!</p>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm text-foreground">Commentaire</label>
              <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Ex: sans piment, sonnette en panne" className="bg-input text-foreground border-border" />
            </div>
            <div className="text-sm text-foreground grid grid-cols-2 gap-2">
              <div>Sous-total</div><div className="text-right notranslate" translate="no">{formatPrice(subtotal)}</div>
              <div>Livraison</div><div className="text-right notranslate" translate="no">{formatPrice(deliveryFee)}</div>
              <div>Réduction (points)</div><div className="text-right notranslate" translate="no">- {formatPrice(discount)}</div>
              <div className="font-semibold">Total à payer</div><div className="text-right font-semibold notranslate" translate="no">{formatPrice(total)}</div>
            </div>
            <Button onClick={checkout} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold" disabled={cart.length === 0 || isPaying}>
              {isPaying ? 'Paiement en cours…' : '💳 Payer maintenant'}
            </Button>
          </CardContent>
        </Card>
      </div>

        {/* Panier détaillé */}
        {cart.length > 0 && (
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-orange-200">
            <CardHeader className="bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900 dark:to-amber-900">
              <CardTitle className="text-foreground flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4 text-white" />
                </div>
                Mon Panier ({cart.length} articles)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-orange-200">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.item.name}</p>
                      <p className="text-sm text-muted-foreground">{formatPrice(item.item.price)} × {item.quantity}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (item.quantity > 1) {
                            setCart(cart.map(c => c.item.id === item.item.id ? { ...c, quantity: c.quantity - 1 } : c));
                          } else {
                            setCart(cart.filter(c => c.item.id !== item.item.id));
                          }
                        }}
                        className="w-8 h-8 p-0"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="font-semibold w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCart(cart.map(c => c.item.id === item.item.id ? { ...c, quantity: c.quantity + 1 } : c))}
                        className="w-8 h-8 p-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setCart(cart.filter(c => c.item.id !== item.item.id));
                          toast.success('Article retiré du panier');
                        }}
                        className="w-8 h-8 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="ml-4 font-semibold text-foreground whitespace-nowrap">
                      {formatPrice(item.item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
              {cart.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setCart([]);
                    toast.success('Panier vidé');
                  }}
                  className="w-full mt-4 border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Vider le panier
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        {visibleItems.map((item) => (
          <Card key={item.id} className="bg-card border-border hover:shadow-xl hover:scale-105 transition-all duration-300">
            <CardHeader className="p-0">
              <ImageWithFallback
                src={item.image}
                alt={item.name}
                className="w-full h-48 object-cover rounded-t-lg"
              />
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-2">
                <CardTitle className="text-foreground">{item.name}</CardTitle>
                <Badge variant={item.inStock ? 'default' : 'secondary'} className="bg-muted text-foreground">
                  {item.inStock ? 'En stock' : 'Rupture'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
              <p className="text-primary notranslate" translate="no">{formatPrice(item.price)}</p>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => {
                  addToCart(item);
                  // Animation confetti légère
                  const btn = document.activeElement as HTMLElement;
                  btn?.classList.add('animate-pulse');
                  setTimeout(() => btn?.classList.remove('animate-pulse'), 500);
                }}
                disabled={!item.inStock}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {t.addToCart}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {uniqueItems.length > visibleCount && (
        <div className="flex justify-center mb-12">
          <Button variant="outline" onClick={() => setVisibleCount((c) => c + 12)} className="border-border text-foreground">
            Charger plus
          </Button>
        </div>
      )}

      {/* Events Section */}
      <div className="mt-12">
        <h2 className="mb-4 md:mb-6 text-foreground">{t.upcomingEvents}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {events.map((event) => (
            <Card key={event.id} className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">{event.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
                <div className="space-y-2 text-sm text-foreground">
                  <p>
                    <strong>{t.date} :</strong> {event.date.toLocaleDateString('fr-FR')} à {event.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p>
                    <strong>{t.participants} :</strong> {event.participants.length} / {event.maxParticipants}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => registerForEvent(event.id)}
                  disabled={!user || event.participants.includes(user?.id || '') || event.participants.length >= event.maxParticipants}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {event.participants.includes(user?.id || '') ? t.alreadyRegistered :
                   event.participants.length >= event.maxParticipants ? t.full :
                   t.register}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart Summary Floating */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 right-4 left-4 md:left-auto bg-gradient-to-br from-orange-500 to-red-600 text-white p-4 rounded-lg shadow-2xl border-2 border-orange-300 w-auto md:max-w-sm z-50 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              {t.cart} ({cart.length})
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => document.getElementById('cart-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-white hover:bg-white/20"
            >
              Voir détails
            </Button>
          </div>
          <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
            {cart.slice(0, 3).map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="truncate mr-2">{item.item.name} x{item.quantity}</span>
                <span className="whitespace-nowrap notranslate font-semibold" translate="no">{formatPrice(item.item.price * item.quantity)}</span>
              </div>
            ))}
            {cart.length > 3 && (
              <p className="text-xs opacity-80">+ {cart.length - 3} autres articles...</p>
            )}
          </div>
          <div className="border-t border-white/30 pt-2 mb-3">
            <div className="flex justify-between font-bold text-lg">
              <span>{t.total} :</span>
              <span className="notranslate" translate="no">{formatPrice(cart.reduce((sum, item) => sum + (item.item.price * item.quantity), 0))}</span>
            </div>
          </div>
          <Button className="w-full bg-white text-orange-600 hover:bg-orange-50 font-bold" onClick={() => {
            document.getElementById('cart-section')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            💳 {t.placeOrder}
          </Button>
        </div>
      )}
    </div>
  );
}