import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { getMenuItems, getOrders, addOrder, updateUserLoyaltyPoints, getUserFavorites, addUserFavorite, removeUserFavorite, processReferralReward } from '../../lib/storage';
import type { MenuItem, Order, User, Event } from '../../lib/mockData';
import { formatPrice, translateOrderStatus } from '../../lib/utils';
import { ShoppingCart, Plus, Minus, Trash2, Heart, RotateCcw, MessageSquare, Sparkles, Filter, Search, Clock, CheckCircle, Truck, XCircle, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../lib/AppContext';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { RatingDialog } from './RatingDialog';

interface CustomerOrdersProps {
  user: User;
}

interface CartItem {
  item: MenuItem;
  quantity: number;
}

export function CustomerOrders({ user }: CustomerOrdersProps) {
  const { t } = useApp();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'starter' | 'main' | 'drink'>('all');
  const [showCheckout, setShowCheckout] = useState(false);
  const [address, setAddress] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
  const [selectedOrderForRating, setSelectedOrderForRating] = useState<Order | null>(null);

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = () => {
    const items = getMenuItems().filter(item => item.available && item.inStock);
    setMenuItems(items);

    const userOrders = getOrders().filter(o => o.customerId === user.id);
    setOrders(userOrders.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
  };

  const reorderItems = (order: Order) => {
    const itemsToAdd: CartItem[] = [];
    order.items.forEach(orderItem => {
      const menuItem = menuItems.find(m => m.id === orderItem.menuItemId);
      if (menuItem && menuItem.available && menuItem.inStock) {
        itemsToAdd.push({ item: menuItem, quantity: orderItem.quantity });
      }
    });
    setCart([...cart, ...itemsToAdd]);
    toast.success('Articles ajoutés au panier!');
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.itemName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in-preparation': return <Package className="w-4 h-4" />;
      case 'in-delivery': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'in-preparation': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in-delivery': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredItems = menuItems.filter(item =>
    selectedCategory === 'all' || item.category === selectedCategory
  );

  const addToCart = (item: MenuItem) => {
    const existingItem = cart.find(c => c.item.id === item.id);
    if (existingItem) {
      setCart(cart.map(c =>
        c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
      ));
    } else {
      setCart([...cart, { item, quantity: 1 }]);
    }
    toast.success(`${item.name} ajouté au panier`);
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(cart.map(c => {
      if (c.item.id === itemId) {
        const newQuantity = c.quantity + delta;
        return { ...c, quantity: Math.max(0, newQuantity) };
      }
      return c;
    }).filter(c => c.quantity > 0));
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(c => c.item.id !== itemId));
    toast.success('Article retiré du panier');
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0);
    const discount = user.loyaltyPoints >= 15 ? 1000 : 0; // 15 points = 1000F discount
    return subtotal - discount;
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('Votre panier est vide');
      return;
    }
    if (!address.trim()) {
      toast.error('Veuillez entrer une adresse de livraison');
      return;
    }

    const newOrder: Order = {
      id: `o${Date.now()}`,
      customerId: user.id,
      customerName: `${user.firstName} ${user.lastName}`,
      customerAddress: address,
      items: cart.map(c => ({
        menuItemId: c.item.id,
        quantity: c.quantity,
        itemName: c.item.name,
        price: c.item.price,
      })),
      total: calculateTotal(),
      status: 'pending',
      timestamp: new Date(),
      paymentStatus: 'paid',
    };

    addOrder(newOrder);

    // Process referral reward if this is the user's first order
    processReferralReward(user.id);

    // Award loyalty points: 1 point per 1000 FCFA spent
    const pointsEarned = Math.floor(newOrder.total / 1000);
    if (pointsEarned > 0) {
      updateUserLoyaltyPoints(user.id, pointsEarned);
      toast.success(`Commande passée avec succès ! Vous avez gagné ${pointsEarned} points de fidélité.`);
    } else {
      toast.success('Commande passée avec succès !');
    }

    // Reset loyalty points if used for discount
    if (user.loyaltyPoints >= 15) {
      user.loyaltyPoints = 0;
      // Update user in storage (simplified)
    }

    setCart([]);
    setAddress('');
    setShowCheckout(false);
    loadData();
  };

  const getStatusBadgeVariant = (status: string): any => {
    const variants: Record<string, any> = {
      'delivered': 'default',
      'in-delivery': 'secondary',
      'in-preparation': 'outline',
      'pending': 'outline',
      'cancelled': 'destructive',
    };
    return variants[status] || 'outline';
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
      {/* Header avec gradient */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t.orders}</h1>
            <p className="text-muted-foreground">Gérez vos commandes</p>
          </div>
        </div>
        <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto">
              <ShoppingCart className="mr-2 h-5 w-5" />
              {t.cart} ({cart.length})
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">{t.cart}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Panier vide</p>
              ) : (
                <>
                  <div className="space-y-3 max-h-[300px] md:max-h-[400px] overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.item.id} className="flex items-center gap-3 md:gap-4 p-3 bg-muted rounded-lg">
                        <ImageWithFallback
                          src={item.item.image}
                          alt={item.item.name}
                          className="w-16 h-16 md:w-20 md:h-20 object-cover rounded flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-foreground truncate">{item.item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(item.item.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.item.id, -1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center text-foreground">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.item.id, 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromCart(item.item.id)}
                            className="h-8 w-8 p-0 ml-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-foreground">{t.address}</Label>
                      <Input
                        id="address"
                        placeholder="Entrez votre adresse de livraison"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="bg-input-background text-foreground"
                      />
                    </div>

                    <div className="space-y-2 text-foreground text-sm md:text-base">
                      <div className="flex justify-between">
                        <span>Sous-total:</span>
                        <span>{formatPrice(cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0))}</span>
                      </div>
                      {user.loyaltyPoints >= 15 && (
                        <div className="flex justify-between text-green-600">
                          <span>Réduction (1000F):</span>
                          <span>-{formatPrice(1000)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-medium text-base md:text-lg">
                        <span>Total:</span>
                        <span>{formatPrice(calculateTotal())}</span>
                      </div>
                    </div>

                    <Button
                      onClick={handleCheckout}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {t.placeOrder}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Menu Items */}
      <div className="mb-12">
        <h2 className="mb-4 md:mb-6 text-foreground">{t.ourMenu}</h2>

        <div className="mb-6">
          <Select value={selectedCategory} onValueChange={(value: 'all' | 'starter' | 'main' | 'drink') => setSelectedCategory(value)}>
            <SelectTrigger className="w-full md:max-w-xs bg-input-background text-foreground border-border">
              <SelectValue placeholder={t.selectCategory} />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all" className="text-foreground">{t.allItems}</SelectItem>
              <SelectItem value="starter" className="text-foreground">{t.starters}</SelectItem>
              <SelectItem value="main" className="text-foreground">{t.mainCourses}</SelectItem>
              <SelectItem value="drink" className="text-foreground">{t.drinks}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="bg-card border-border hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <ImageWithFallback
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </CardHeader>
              <CardContent className="pt-4">
                <h3 className="mb-2 text-foreground">{item.name}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-primary">{formatPrice(item.price)}</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const favorites = getUserFavorites(user.id);
                        if (favorites.includes(item.id)) {
                          removeUserFavorite(user.id, item.id);
                          toast.success('Retiré des favoris');
                        } else {
                          addUserFavorite(user.id, item.id);
                          toast.success('Ajouté aux favoris');
                        }
                      }}
                      className="h-8 w-8 p-0"
                      aria-label={getUserFavorites(user.id).includes(item.id) ? '♥' : '♡'}
                    >
                      <Heart
                        className={`h-4 w-4 ${
                          getUserFavorites(user.id).includes(item.id)
                            ? 'fill-red-500 text-red-500'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => addToCart(item)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      aria-label="+"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Order History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">{t.orderHistory}</h2>
          <Badge className="bg-blue-100 text-blue-700">{filteredOrders.length} commandes</Badge>
        </div>

        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par ID ou article..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="Filtrer par statut" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="in-preparation">En préparation</SelectItem>
              <SelectItem value="in-delivery">En livraison</SelectItem>
              <SelectItem value="delivered">Livrée</SelectItem>
              <SelectItem value="cancelled">Annulée</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {filteredOrders.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12">
              <p className="text-center text-muted-foreground">{t.noOrders}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="bg-card border-border hover:shadow-lg transition-all">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-foreground text-base md:text-lg">
                          {t.orderId}: {order.id}
                        </CardTitle>
                        <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                          {getStatusIcon(order.status)}
                          {translateOrderStatus(order.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {order.timestamp.toLocaleDateString('fr-FR')} à{' '}
                        {order.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => reorderItems(order)}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Recommander
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Timeline de statut */}
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className={`flex items-center gap-2 ${order.status === 'pending' || order.status === 'in-preparation' || order.status === 'in-delivery' || order.status === 'delivered' ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status === 'pending' || order.status === 'in-preparation' || order.status === 'in-delivery' || order.status === 'delivered' ? 'bg-blue-500' : 'bg-gray-300'}`}>
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-medium">Reçue</span>
                      </div>
                      <div className={`flex-1 h-1 mx-2 ${order.status === 'in-preparation' || order.status === 'in-delivery' || order.status === 'delivered' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                      <div className={`flex items-center gap-2 ${order.status === 'in-preparation' || order.status === 'in-delivery' || order.status === 'delivered' ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status === 'in-preparation' || order.status === 'in-delivery' || order.status === 'delivered' ? 'bg-blue-500' : 'bg-gray-300'}`}>
                          <Package className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-medium">Préparation</span>
                      </div>
                      <div className={`flex-1 h-1 mx-2 ${order.status === 'in-delivery' || order.status === 'delivered' ? 'bg-blue-500' : 'bg-gray-300'}`} />
                      <div className={`flex items-center gap-2 ${order.status === 'in-delivery' || order.status === 'delivered' ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status === 'in-delivery' || order.status === 'delivered' ? 'bg-blue-500' : 'bg-gray-300'}`}>
                          <Truck className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-medium">Livraison</span>
                      </div>
                      <div className={`flex-1 h-1 mx-2 ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <div className={`flex items-center gap-2 ${order.status === 'delivered' ? 'text-green-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-300'}`}>
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-medium">Livrée</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm text-foreground p-2 bg-gray-50 dark:bg-gray-900 rounded">
                        <span className="truncate mr-2 font-medium">
                          {item.itemName} <span className="text-muted-foreground">x{item.quantity}</span>
                        </span>
                        <span className="whitespace-nowrap font-semibold">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between text-foreground mb-2">
                      <span className="font-medium text-lg">Total:</span>
                      <span className="font-bold text-lg text-blue-600">{formatPrice(order.total)}</span>
                    </div>
                    {order.status === 'delivered' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedOrderForRating(order);
                          setRatingDialogOpen(true);
                        }}
                        className="w-full mt-2 border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Laisser un avis
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Rating Dialog */}
      {selectedOrderForRating && (
        <RatingDialog
          open={ratingDialogOpen}
          onOpenChange={setRatingDialogOpen}
          order={selectedOrderForRating}
        />
      )}
    </div>
  );
}
