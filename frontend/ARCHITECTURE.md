# 🏗️ ARCHITECTURE FRONTEND - MON MIAM MIAM

## 📋 Table des Matières
1. [Vue d'ensemble](#vue-densemble)
2. [Principes de Conception](#principes-de-conception)
3. [Structure du Projet](#structure-du-projet)
4. [Services](#services)
5. [Hooks Personnalisés](#hooks-personnalisés)
6. [Composants](#composants)
7. [Patterns et Best Practices](#patterns-et-best-practices)
8. [Guide de Contribution](#guide-de-contribution)

---

## 🎯 Vue d'ensemble

L'application **Mon Miam Miam** est construite avec **React + TypeScript** en suivant les principes **SOLID**, **DRY** et **KISS** pour garantir un code maintenable, testable et évolutif.

### Technologies Principales
- **React 18** - Framework UI
- **TypeScript** - Typage statique
- **TailwindCSS** - Styling
- **Vite** - Build tool
- **Lucide React** - Icônes

---

## 🧩 Principes de Conception

### 1. SOLID

#### **S - Single Responsibility Principle**
Chaque classe/composant a une seule responsabilité.

```typescript
// ✅ BON: Service avec une seule responsabilité
export class UserService extends BaseService<User> {
  // Gère uniquement les utilisateurs
  findByEmail(email: string): User | undefined { }
  authenticate(email: string, password: string): User | undefined { }
}

// ❌ MAUVAIS: Service avec plusieurs responsabilités
export class AppService {
  // Gère users, orders, payments, etc. - TROP DE RESPONSABILITÉS
}
```

#### **O - Open/Closed Principle**
Ouvert à l'extension, fermé à la modification.

```typescript
// ✅ BON: Classe de base extensible
export abstract class BaseService<T> {
  // Méthodes de base que les services enfants peuvent étendre
}

export class UserService extends BaseService<User> {
  // Étend BaseService sans le modifier
}
```

#### **L - Liskov Substitution Principle**
Les classes dérivées doivent pouvoir remplacer leurs classes de base.

```typescript
// ✅ BON: UserService peut remplacer BaseService
const service: BaseService<User> = new UserService();
service.getAll(); // Fonctionne correctement
```

#### **I - Interface Segregation Principle**
Les interfaces doivent être spécifiques et petites.

```typescript
// ✅ BON: Interfaces spécifiques
interface IStorageService<T> {
  getAll(): T[];
  getById(id: string): T | undefined;
}

interface IAuthService {
  login(email: string, password: string): Promise<boolean>;
  logout(): void;
}
```

#### **D - Dependency Inversion Principle**
Dépendre des abstractions, pas des implémentations.

```typescript
// ✅ BON: Dépend de l'interface
function processOrders(service: IStorageService<Order>) {
  const orders = service.getAll();
  // ...
}
```

### 2. DRY (Don't Repeat Yourself)

Éviter la duplication de code en créant des abstractions réutilisables.

```typescript
// ✅ BON: Service de base réutilisable
export abstract class BaseService<T> {
  getAll(): T[] { /* implémentation commune */ }
  getById(id: string): T | undefined { /* implémentation commune */ }
}

// Tous les services réutilisent cette logique
export class UserService extends BaseService<User> { }
export class OrderService extends BaseService<Order> { }
```

### 3. KISS (Keep It Simple, Stupid)

Garder le code simple et compréhensible.

```typescript
// ✅ BON: Simple et clair
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// ❌ MAUVAIS: Trop complexe
function calculateTotal(items: CartItem[]): number {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item && item.price && item.quantity) {
      const itemTotal = item.price * item.quantity;
      if (!isNaN(itemTotal)) {
        total = total + itemTotal;
      }
    }
  }
  return total;
}
```

---

## 📁 Structure du Projet

```
frontend/
├── src/
│   ├── services/           # Services métier (SOLID)
│   │   ├── BaseService.ts      # Service de base générique
│   │   ├── UserService.ts      # Gestion des utilisateurs
│   │   ├── OrderService.ts     # Gestion des commandes
│   │   └── ...
│   │
│   ├── hooks/              # Hooks personnalisés (DRY)
│   │   ├── useAuth.ts          # Authentification
│   │   ├── useOrders.ts        # Commandes
│   │   ├── useLocalStorage.ts  # LocalStorage
│   │   └── ...
│   │
│   ├── components/         # Composants React
│   │   ├── ui/                 # Composants UI réutilisables
│   │   ├── customer/           # Composants client
│   │   ├── employee/           # Composants employé
│   │   ├── manager/            # Composants manager
│   │   ├── admin/              # Composants admin
│   │   └── shared/             # Composants partagés
│   │
│   ├── lib/                # Utilitaires et helpers
│   │   ├── mockData.ts         # Types et données mock
│   │   ├── utils.ts            # Fonctions utilitaires
│   │   ├── translations.ts     # i18n
│   │   └── ...
│   │
│   └── __tests__/          # Tests unitaires
│       ├── services/
│       ├── hooks/
│       └── components/
│
├── ARCHITECTURE.md         # Ce fichier
├── SOLID_PRINCIPLES.md     # Guide détaillé SOLID
└── CONTRIBUTING.md         # Guide de contribution
```

---

## 🔧 Services

### BaseService<T>

Service de base générique pour toutes les opérations CRUD.

**Responsabilité:** Gestion CRUD de base pour n'importe quel type d'entité.

```typescript
export abstract class BaseService<T extends { id: string }> {
  protected storageKey: string;

  // Opérations CRUD de base
  getAll(): T[]
  getById(id: string): T | undefined
  create(item: Omit<T, 'id'>): T
  update(id: string, item: Partial<T>): T | undefined
  delete(id: string): boolean
  
  // Utilitaires
  filter(predicate: (item: T) => boolean): T[]
  count(): number
  exists(id: string): boolean
}
```

**Utilisation:**
```typescript
// Créer un nouveau service
export class ProductService extends BaseService<Product> {
  constructor() {
    super('products_storage_key');
  }
  
  // Ajouter des méthodes spécifiques
  findByCategory(category: string): Product[] {
    return this.filter(p => p.category === category);
  }
}
```

### UserService

Service de gestion des utilisateurs.

**Responsabilité:** Opérations liées aux utilisateurs (auth, profil, fidélité).

```typescript
export class UserService extends BaseService<User> {
  // Authentification
  authenticate(email: string, password: string): User | undefined
  
  // Recherche
  findByEmail(email: string): User | undefined
  findByRole(role: User['role']): User[]
  
  // Fidélité
  updateLoyaltyPoints(userId: string, points: number): User | undefined
  
  // Parrainage
  generateReferralCode(userId: string): string
  validateReferralCode(code: string): User | undefined
  
  // Sessions
  recordLogin(userId: string): void
  recordLogout(userId: string): void
}
```

### OrderService

Service de gestion des commandes.

**Responsabilité:** Opérations liées aux commandes.

```typescript
export class OrderService extends BaseService<Order> {
  // Filtrage
  getByCustomer(customerId: string): Order[]
  getByStatus(status: OrderStatus): Order[]
  
  // Mise à jour
  updateStatus(orderId: string, status: OrderStatus): Order | undefined
  markAsPaid(orderId: string): Order | undefined
  cancelOrder(orderId: string): Order | undefined
  
  // Statistiques
  calculateRevenue(startDate?: Date, endDate?: Date): number
  getStatistics(): OrderStatistics
  getAverageBasketValue(): number
}
```

---

## 🪝 Hooks Personnalisés

### useAuth

Hook pour gérer l'authentification.

**Responsabilité:** Gestion de l'état d'authentification et des opérations associées.

```typescript
export function useAuth(): UseAuthReturn {
  return {
    user: User | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    error: string | null,
    
    login: (email, password) => Promise<boolean>,
    logout: () => void,
    signup: (userData) => Promise<boolean>,
    updateUser: (updates) => void,
    refreshUser: () => void,
  };
}
```

**Utilisation:**
```typescript
function LoginComponent() {
  const { login, isLoading, error } = useAuth();
  
  const handleSubmit = async (email: string, password: string) => {
    const success = await login(email, password);
    if (success) {
      // Rediriger vers le dashboard
    }
  };
}
```

### useOrders

Hook pour gérer les commandes.

**Responsabilité:** Gestion de l'état des commandes et des opérations associées.

```typescript
export function useOrders(options?: UseOrdersOptions): UseOrdersReturn {
  return {
    orders: Order[],
    isLoading: boolean,
    error: string | null,
    
    refresh: () => void,
    updateOrderStatus: (orderId, status) => boolean,
    cancelOrder: (orderId) => boolean,
    getOrderById: (orderId) => Order | undefined,
  };
}
```

**Utilisation:**
```typescript
function OrdersList() {
  const { orders, isLoading, updateOrderStatus } = useOrders({
    customerId: user.id,
    autoRefresh: true,
  });
  
  if (isLoading) return <Loader />;
  
  return (
    <div>
      {orders.map(order => (
        <OrderCard 
          key={order.id}
          order={order}
          onStatusChange={(status) => updateOrderStatus(order.id, status)}
        />
      ))}
    </div>
  );
}
```

### useLocalStorage

Hook pour gérer le localStorage de manière réactive.

**Responsabilité:** Synchronisation entre React state et localStorage.

```typescript
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void, () => void]
```

**Utilisation:**
```typescript
function ThemeToggle() {
  const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Toggle Theme
    </button>
  );
}
```

---

## 🧱 Composants

### Principes de Composition

1. **Composants Atomiques** - Petits, réutilisables, une seule responsabilité
2. **Composants Composés** - Combinaison de composants atomiques
3. **Composants de Page** - Orchestration des composants composés

```
Atomique:    <Button>, <Input>, <Card>
             ↓
Composé:     <LoginForm>, <OrderCard>
             ↓
Page:        <LoginPage>, <OrdersPage>
```

### Exemple de Composition

```typescript
// Atomique
function Button({ children, onClick }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>;
}

// Composé
function LoginForm({ onSubmit }: LoginFormProps) {
  return (
    <form onSubmit={onSubmit}>
      <Input type="email" />
      <Input type="password" />
      <Button>Login</Button>
    </form>
  );
}

// Page
function LoginPage() {
  const { login } = useAuth();
  
  return (
    <div>
      <h1>Login</h1>
      <LoginForm onSubmit={login} />
    </div>
  );
}
```

---

## 📐 Patterns et Best Practices

### 1. Singleton Pattern

Utilisé pour les services pour garantir une seule instance.

```typescript
export class UserService extends BaseService<User> {
  private static instance: UserService;

  private constructor() {
    super('restaurant_users');
  }

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }
}

// Utilisation
const userService = UserService.getInstance();
```

### 2. Repository Pattern

Services agissent comme des repositories pour l'accès aux données.

```typescript
// Service = Repository
const users = userService.getAll();
const user = userService.getById('123');
userService.create(newUser);
```

### 3. Custom Hooks Pattern

Encapsuler la logique réutilisable dans des hooks.

```typescript
// Au lieu de dupliquer cette logique partout:
function Component1() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const userData = localStorage.getItem('user');
    setUser(JSON.parse(userData));
  }, []);
}

// Créer un hook:
function useCurrentUser() {
  const [user, setUser] = useLocalStorage('user', null);
  return user;
}

// Utiliser partout:
function Component1() {
  const user = useCurrentUser();
}
```

### 4. Composition over Inheritance

Préférer la composition à l'héritage pour les composants.

```typescript
// ✅ BON: Composition
function UserProfile({ user }: { user: User }) {
  return (
    <Card>
      <Avatar src={user.avatar} />
      <UserInfo user={user} />
      <UserStats user={user} />
    </Card>
  );
}

// ❌ MAUVAIS: Héritage
class UserProfile extends BaseProfile {
  // Difficile à maintenir et tester
}
```

---

## 🧪 Tests

### Structure des Tests

```
__tests__/
├── services/
│   ├── UserService.test.ts
│   └── OrderService.test.ts
├── hooks/
│   ├── useAuth.test.ts
│   └── useOrders.test.ts
└── components/
    ├── Button.test.tsx
    └── LoginForm.test.tsx
```

### Exemple de Test de Service

```typescript
describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    localStorage.clear();
    service = UserService.getInstance();
  });

  it('should create a new user', () => {
    const user = service.create({
      email: 'test@example.com',
      password: 'Test123@',
      firstName: 'John',
      lastName: 'Doe',
      role: 'customer',
      loyaltyPoints: 0,
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });

  it('should authenticate user with correct credentials', () => {
    service.create({
      email: 'test@example.com',
      password: 'Test123@',
      // ...
    });

    const authenticated = service.authenticate('test@example.com', 'Test123@');
    expect(authenticated).toBeDefined();
  });
});
```

---

## 📝 Guide de Contribution

### Ajouter un Nouveau Service

1. Créer le fichier dans `src/services/`
2. Étendre `BaseService<T>`
3. Ajouter les méthodes spécifiques
4. Créer les tests
5. Documenter l'API

```typescript
// src/services/ProductService.ts
export class ProductService extends BaseService<Product> {
  constructor() {
    super('products');
  }

  findByCategory(category: string): Product[] {
    return this.filter(p => p.category === category);
  }
}

export const productService = ProductService.getInstance();
```

### Ajouter un Nouveau Hook

1. Créer le fichier dans `src/hooks/`
2. Suivre la convention `use[Name]`
3. Documenter les paramètres et le retour
4. Créer les tests

```typescript
// src/hooks/useProducts.ts
export function useProducts(category?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    const data = category 
      ? productService.findByCategory(category)
      : productService.getAll();
    setProducts(data);
  }, [category]);

  return { products };
}
```

### Checklist avant Commit

- [ ] Code suit les principes SOLID, DRY, KISS
- [ ] Tests unitaires écrits et passent
- [ ] Documentation mise à jour
- [ ] Pas de duplication de code
- [ ] Types TypeScript corrects
- [ ] Pas d'erreurs ESLint

---

## 📚 Ressources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Clean Code](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)

---

**Dernière mise à jour:** 31 Octobre 2024  
**Version:** 2.0.0  
**Mainteneur:** Équipe Dev ZEDUC-SP@CE
