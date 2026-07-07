# 🎨 PRINCIPES DRY & KISS - GUIDE PRATIQUE

## Table des Matières
1. [DRY - Don't Repeat Yourself](#dry---dont-repeat-yourself)
2. [KISS - Keep It Simple, Stupid](#kiss---keep-it-simple-stupid)
3. [Application Pratique](#application-pratique)
4. [Anti-Patterns à Éviter](#anti-patterns-à-éviter)

---

## 🔄 DRY - Don't Repeat Yourself

### Définition
> Chaque connaissance doit avoir une représentation unique, non ambiguë et faisant autorité dans un système.

### Principe
**Ne jamais dupliquer de code.** Si vous copiez-collez, vous faites probablement quelque chose de mal.

---

### ✅ Exemples Corrects

#### 1. Service de Base Réutilisable

```typescript
// ✅ BON: Logique CRUD centralisée
export abstract class BaseService<T extends { id: string }> {
  protected storageKey: string;

  getAll(): T[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  getById(id: string): T | undefined {
    return this.getAll().find(item => item.id === id);
  }

  create(item: Omit<T, 'id'>): T {
    const items = this.getAll();
    const newItem = { ...item, id: this.generateId() } as T;
    items.push(newItem);
    this.save(items);
    return newItem;
  }

  // Autres méthodes CRUD...
}

// Réutilisation sans duplication
export class UserService extends BaseService<User> {
  constructor() {
    super('users');
  }
}

export class OrderService extends BaseService<Order> {
  constructor() {
    super('orders');
  }
}
```

#### 2. Hook Réutilisable

```typescript
// ✅ BON: Hook générique pour localStorage
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  const updateValue = (newValue: T) => {
    setValue(newValue);
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [value, updateValue] as const;
}

// Utilisation partout sans duplication
function Component1() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
}

function Component2() {
  const [language, setLanguage] = useLocalStorage('language', 'fr');
}
```

#### 3. Composant Réutilisable

```typescript
// ✅ BON: Composant Button réutilisable
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', size = 'md', children, onClick }: ButtonProps) {
  const baseClasses = 'rounded font-semibold transition-colors';
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
  };
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// Utilisation partout
<Button variant="primary">Save</Button>
<Button variant="danger" size="sm">Delete</Button>
```

---

### ❌ Exemples Incorrects

#### 1. Duplication de Logique CRUD

```typescript
// ❌ MAUVAIS: Code dupliqué dans chaque service
export class UserService {
  getAll(): User[] {
    const data = localStorage.getItem('users');
    return data ? JSON.parse(data) : [];
  }

  getById(id: string): User | undefined {
    return this.getAll().find(u => u.id === id);
  }

  create(user: Omit<User, 'id'>): User {
    const users = this.getAll();
    const newUser = { ...user, id: Date.now().toString() };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return newUser;
  }
}

export class OrderService {
  // MÊME CODE DUPLIQUÉ! 😱
  getAll(): Order[] {
    const data = localStorage.getItem('orders');
    return data ? JSON.parse(data) : [];
  }

  getById(id: string): Order | undefined {
    return this.getAll().find(o => o.id === id);
  }

  create(order: Omit<Order, 'id'>): Order {
    const orders = this.getAll();
    const newOrder = { ...order, id: Date.now().toString() };
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    return newOrder;
  }
}
```

#### 2. Duplication de Logique UI

```typescript
// ❌ MAUVAIS: Même logique répétée
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <form>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border rounded px-4 py-2 w-full"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border rounded px-4 py-2 w-full"
      />
    </form>
  );
}

function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <form>
      {/* MÊME CODE DUPLIQUÉ! */}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border rounded px-4 py-2 w-full"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border rounded px-4 py-2 w-full"
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="border rounded px-4 py-2 w-full"
      />
    </form>
  );
}
```

---

## 💡 KISS - Keep It Simple, Stupid

### Définition
> La simplicité doit être un objectif clé de la conception, et la complexité inutile doit être évitée.

### Principe
**Écrire du code simple et compréhensible.** Si c'est compliqué, c'est probablement mal fait.

---

### ✅ Exemples Corrects

#### 1. Fonction Simple

```typescript
// ✅ BON: Simple et clair
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// ✅ BON: Nom explicite, une seule responsabilité
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ✅ BON: Logique claire
function getDiscountedPrice(price: number, discountPercent: number): number {
  return price * (1 - discountPercent / 100);
}
```

#### 2. Composant Simple

```typescript
// ✅ BON: Composant simple et focalisé
interface UserCardProps {
  user: User;
  onEdit: () => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
  return (
    <div className="border rounded p-4">
      <h3>{user.firstName} {user.lastName}</h3>
      <p>{user.email}</p>
      <button onClick={onEdit}>Edit</button>
    </div>
  );
}
```

#### 3. Hook Simple

```typescript
// ✅ BON: Hook simple avec un seul objectif
export function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);
  const toggle = () => setValue(v => !v);
  return [value, toggle] as const;
}

// Utilisation
function Component() {
  const [isOpen, toggleOpen] = useToggle();
  
  return (
    <div>
      <button onClick={toggleOpen}>Toggle</button>
      {isOpen && <Modal />}
    </div>
  );
}
```

---

### ❌ Exemples Incorrects

#### 1. Fonction Trop Complexe

```typescript
// ❌ MAUVAIS: Trop complexe, difficile à comprendre
function calculateTotal(items: CartItem[]): number {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item && item.price && item.quantity) {
      const itemPrice = parseFloat(item.price.toString());
      const itemQuantity = parseInt(item.quantity.toString());
      if (!isNaN(itemPrice) && !isNaN(itemQuantity)) {
        const itemTotal = itemPrice * itemQuantity;
        if (itemTotal > 0) {
          total = total + itemTotal;
        }
      }
    }
  }
  return total;
}

// ✅ MIEUX: Simple et clair
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
```

#### 2. Composant Trop Complexe

```typescript
// ❌ MAUVAIS: Fait trop de choses
function UserDashboard() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [page, setPage] = useState(1);
  
  useEffect(() => {
    // 100 lignes de logique...
  }, [filter, sortBy, page]);
  
  const handleUserEdit = () => { /* ... */ };
  const handleUserDelete = () => { /* ... */ };
  const handleOrderCreate = () => { /* ... */ };
  const handleStatsRefresh = () => { /* ... */ };
  
  return (
    <div>
      {/* 200 lignes de JSX... */}
    </div>
  );
}

// ✅ MIEUX: Diviser en composants plus petits
function UserDashboard() {
  return (
    <div>
      <UsersList />
      <OrdersList />
      <Statistics />
    </div>
  );
}
```

#### 3. Logique Trop Imbriquée

```typescript
// ❌ MAUVAIS: Trop d'imbrication
function processOrder(order: Order) {
  if (order) {
    if (order.items) {
      if (order.items.length > 0) {
        if (order.customer) {
          if (order.customer.email) {
            if (validateEmail(order.customer.email)) {
              if (order.total > 0) {
                if (order.paymentMethod) {
                  // Logique...
                }
              }
            }
          }
        }
      }
    }
  }
}

// ✅ MIEUX: Early returns
function processOrder(order: Order) {
  if (!order) return;
  if (!order.items || order.items.length === 0) return;
  if (!order.customer || !order.customer.email) return;
  if (!validateEmail(order.customer.email)) return;
  if (order.total <= 0) return;
  if (!order.paymentMethod) return;
  
  // Logique...
}
```

---

## 🎯 Application Pratique

### Refactoring Step-by-Step

#### Avant (Code Dupliqué et Complexe)

```typescript
// ❌ Code à refactorer
function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  
  useEffect(() => {
    const data = localStorage.getItem('users');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setUsers(parsed);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);
  
  return <div>{/* ... */}</div>;
}

function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  
  useEffect(() => {
    const data = localStorage.getItem('orders');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setOrders(parsed);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);
  
  return <div>{/* ... */}</div>;
}
```

#### Après (DRY + KISS)

```typescript
// ✅ Code refactoré

// 1. Créer un hook réutilisable (DRY)
function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : initialValue;
    } catch {
      return initialValue;
    }
  });
  
  return [value, setValue] as const;
}

// 2. Utiliser le hook (KISS)
function UsersList() {
  const [users] = useLocalStorage<User[]>('users', []);
  return <div>{/* ... */}</div>;
}

function OrdersList() {
  const [orders] = useLocalStorage<Order[]>('orders', []);
  return <div>{/* ... */}</div>;
}
```

---

## 🚫 Anti-Patterns à Éviter

### 1. Magic Numbers

```typescript
// ❌ MAUVAIS
function calculateDiscount(price: number): number {
  if (price > 1000) {
    return price * 0.15;
  } else if (price > 500) {
    return price * 0.10;
  }
  return price * 0.05;
}

// ✅ BON
const DISCOUNT_RATES = {
  PREMIUM: 0.15,
  STANDARD: 0.10,
  BASIC: 0.05,
};

const PRICE_THRESHOLDS = {
  PREMIUM: 1000,
  STANDARD: 500,
};

function calculateDiscount(price: number): number {
  if (price > PRICE_THRESHOLDS.PREMIUM) {
    return price * DISCOUNT_RATES.PREMIUM;
  } else if (price > PRICE_THRESHOLDS.STANDARD) {
    return price * DISCOUNT_RATES.STANDARD;
  }
  return price * DISCOUNT_RATES.BASIC;
}
```

### 2. God Objects

```typescript
// ❌ MAUVAIS: Classe qui fait tout
class Application {
  handleUsers() { }
  handleOrders() { }
  handlePayments() { }
  handleNotifications() { }
  handleReports() { }
  handleSettings() { }
  // 50 autres méthodes...
}

// ✅ BON: Séparation des responsabilités
class UserService { }
class OrderService { }
class PaymentService { }
class NotificationService { }
class ReportService { }
class SettingsService { }
```

### 3. Commentaires Excessifs

```typescript
// ❌ MAUVAIS: Code qui a besoin de commentaires pour être compris
// Calcule le total avec la taxe et la réduction
function calc(p: number, t: number, d: number): number {
  // Applique la taxe
  const wt = p + (p * t / 100);
  // Applique la réduction
  const wd = wt - (wt * d / 100);
  return wd;
}

// ✅ BON: Code auto-documenté
function calculateFinalPrice(
  basePrice: number,
  taxPercent: number,
  discountPercent: number
): number {
  const priceWithTax = basePrice * (1 + taxPercent / 100);
  const finalPrice = priceWithTax * (1 - discountPercent / 100);
  return finalPrice;
}
```

---

## 📋 Checklist DRY & KISS

Avant de commiter:

### DRY
- [ ] Ai-je copié-collé du code?
- [ ] Cette logique existe-t-elle déjà ailleurs?
- [ ] Puis-je créer une fonction/composant/hook réutilisable?
- [ ] Les constantes sont-elles définies une seule fois?

### KISS
- [ ] Mon code est-il facile à comprendre?
- [ ] Ai-je utilisé des noms de variables explicites?
- [ ] Ma fonction fait-elle une seule chose?
- [ ] Ai-je évité les imbrications excessives?
- [ ] Mon composant est-il trop grand? (>200 lignes = trop)

---

## 🎓 Exercices Pratiques

### Exercice 1: Identifier la Duplication

Trouvez la duplication dans ce code et refactorisez:

```typescript
function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function validateUserEmail(user: User): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(user.email);
}

function checkEmailFormat(emailAddress: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(emailAddress);
}
```

### Exercice 2: Simplifier le Code

Simplifiez cette fonction:

```typescript
function getUserStatus(user: User): string {
  if (user.isActive === true) {
    if (user.isPremium === true) {
      return 'Premium Active';
    } else {
      return 'Active';
    }
  } else {
    if (user.isPremium === true) {
      return 'Premium Inactive';
    } else {
      return 'Inactive';
    }
  }
}
```

---

**Dernière mise à jour:** 31 Octobre 2024  
**Auteur:** Équipe Dev ZEDUC-SP@CE
