# 🎯 PRINCIPES SOLID - GUIDE DÉTAILLÉ

## Introduction

Les principes **SOLID** sont 5 principes de conception orientée objet qui rendent le code plus maintenable, flexible et évolutif.

---

## 1️⃣ Single Responsibility Principle (SRP)

### Définition
> Une classe ne devrait avoir qu'une seule raison de changer.

### Principe
Chaque classe/module/fonction doit avoir **une seule responsabilité** bien définie.

### ✅ Exemple Correct

```typescript
// UserService: Responsabilité = Gestion des utilisateurs
export class UserService extends BaseService<User> {
  findByEmail(email: string): User | undefined {
    return this.getAll().find(u => u.email === email);
  }
  
  authenticate(email: string, password: string): User | undefined {
    const user = this.findByEmail(email);
    return user?.password === password ? user : undefined;
  }
}

// EmailService: Responsabilité = Envoi d'emails
export class EmailService {
  sendWelcomeEmail(user: User): void {
    // Logique d'envoi d'email
  }
}

// NotificationService: Responsabilité = Notifications
export class NotificationService {
  notifyNewUser(user: User): void {
    // Logique de notification
  }
}
```

### ❌ Exemple Incorrect

```typescript
// UserService fait TROP de choses
export class UserService {
  // Gestion utilisateurs
  createUser(data: UserData): User { }
  
  // Envoi d'emails (pas sa responsabilité!)
  sendWelcomeEmail(user: User): void { }
  
  // Notifications (pas sa responsabilité!)
  notifyAdmins(user: User): void { }
  
  // Logs (pas sa responsabilité!)
  logUserCreation(user: User): void { }
}
```

### 💡 Avantages
- Code plus facile à comprendre
- Tests plus simples
- Moins de bugs lors des modifications
- Réutilisabilité accrue

---

## 2️⃣ Open/Closed Principle (OCP)

### Définition
> Les entités logicielles doivent être ouvertes à l'extension mais fermées à la modification.

### Principe
On doit pouvoir **étendre** le comportement sans **modifier** le code existant.

### ✅ Exemple Correct

```typescript
// Classe de base (fermée à la modification)
export abstract class BaseService<T extends { id: string }> {
  protected storageKey: string;
  
  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }
  
  getAll(): T[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }
  
  // Méthodes communes...
}

// Extension sans modification (ouvert à l'extension)
export class UserService extends BaseService<User> {
  constructor() {
    super('users');
  }
  
  // Ajoute des méthodes spécifiques
  findByEmail(email: string): User | undefined {
    return this.getAll().find(u => u.email === email);
  }
}

export class OrderService extends BaseService<Order> {
  constructor() {
    super('orders');
  }
  
  // Ajoute d'autres méthodes spécifiques
  getByStatus(status: string): Order[] {
    return this.getAll().filter(o => o.status === status);
  }
}
```

### ❌ Exemple Incorrect

```typescript
// À chaque nouveau type, on doit MODIFIER cette classe
export class StorageService {
  getUsers(): User[] {
    return JSON.parse(localStorage.getItem('users') || '[]');
  }
  
  getOrders(): Order[] {
    return JSON.parse(localStorage.getItem('orders') || '[]');
  }
  
  // À chaque nouveau type, on ajoute une méthode...
  getProducts(): Product[] {
    return JSON.parse(localStorage.getItem('products') || '[]');
  }
}
```

### 💡 Avantages
- Pas besoin de modifier le code testé
- Réduit les risques de régression
- Facilite l'ajout de nouvelles fonctionnalités

---

## 3️⃣ Liskov Substitution Principle (LSP)

### Définition
> Les objets d'une classe dérivée doivent pouvoir remplacer les objets de la classe de base sans altérer le comportement du programme.

### Principe
Une classe enfant doit pouvoir être utilisée **partout** où la classe parent est attendue.

### ✅ Exemple Correct

```typescript
// Classe de base
export abstract class PaymentProcessor {
  abstract processPayment(amount: number): Promise<boolean>;
}

// Implémentations qui respectent le contrat
export class CreditCardProcessor extends PaymentProcessor {
  async processPayment(amount: number): Promise<boolean> {
    // Traite le paiement par carte
    return true;
  }
}

export class PayPalProcessor extends PaymentProcessor {
  async processPayment(amount: number): Promise<boolean> {
    // Traite le paiement PayPal
    return true;
  }
}

// Utilisation: on peut substituer n'importe quelle implémentation
function checkout(processor: PaymentProcessor, amount: number) {
  return processor.processPayment(amount);
}

// Fonctionne avec n'importe quel processeur
checkout(new CreditCardProcessor(), 100);
checkout(new PayPalProcessor(), 100);
```

### ❌ Exemple Incorrect

```typescript
export class PaymentProcessor {
  processPayment(amount: number): Promise<boolean> {
    // Implémentation de base
    return Promise.resolve(true);
  }
}

// Viole LSP: change le comportement attendu
export class FreePaymentProcessor extends PaymentProcessor {
  processPayment(amount: number): Promise<boolean> {
    // Lance une erreur au lieu de retourner boolean
    throw new Error('Free payments not allowed');
  }
}

// Casse le code qui attend un boolean
function checkout(processor: PaymentProcessor, amount: number) {
  const result = await processor.processPayment(amount); // CRASH!
  if (result) {
    // ...
  }
}
```

### 💡 Avantages
- Polymorphisme fiable
- Code prévisible
- Facilite les tests avec des mocks

---

## 4️⃣ Interface Segregation Principle (ISP)

### Définition
> Les clients ne devraient pas dépendre d'interfaces qu'ils n'utilisent pas.

### Principe
Créer des **interfaces spécifiques** plutôt qu'une **interface générale**.

### ✅ Exemple Correct

```typescript
// Interfaces spécifiques et petites
interface IReadable<T> {
  getAll(): T[];
  getById(id: string): T | undefined;
}

interface IWritable<T> {
  create(item: Omit<T, 'id'>): T;
  update(id: string, item: Partial<T>): T | undefined;
  delete(id: string): boolean;
}

interface ISearchable<T> {
  search(query: string): T[];
  filter(predicate: (item: T) => boolean): T[];
}

// Les classes implémentent seulement ce dont elles ont besoin
export class ReadOnlyUserService implements IReadable<User> {
  getAll(): User[] { /* ... */ }
  getById(id: string): User | undefined { /* ... */ }
  // Pas de create/update/delete
}

export class FullUserService implements IReadable<User>, IWritable<User>, ISearchable<User> {
  // Implémente toutes les méthodes
}
```

### ❌ Exemple Incorrect

```typescript
// Interface trop large
interface IUserService {
  // Lecture
  getAll(): User[];
  getById(id: string): User | undefined;
  
  // Écriture
  create(item: User): User;
  update(id: string, item: User): User;
  delete(id: string): boolean;
  
  // Recherche
  search(query: string): User[];
  
  // Analytics
  getStatistics(): Statistics;
  
  // Export
  exportToPDF(): void;
  exportToExcel(): void;
}

// Classe forcée d'implémenter TOUT même si elle n'a besoin que de lecture
export class ReadOnlyUserService implements IUserService {
  getAll(): User[] { /* ... */ }
  getById(id: string): User | undefined { /* ... */ }
  
  // Forcé d'implémenter ces méthodes inutiles
  create(item: User): User { throw new Error('Not supported'); }
  update(id: string, item: User): User { throw new Error('Not supported'); }
  delete(id: string): boolean { throw new Error('Not supported'); }
  search(query: string): User[] { throw new Error('Not supported'); }
  getStatistics(): Statistics { throw new Error('Not supported'); }
  exportToPDF(): void { throw new Error('Not supported'); }
  exportToExcel(): void { throw new Error('Not supported'); }
}
```

### 💡 Avantages
- Interfaces plus claires
- Moins de dépendances inutiles
- Code plus flexible

---

## 5️⃣ Dependency Inversion Principle (DIP)

### Définition
> Les modules de haut niveau ne doivent pas dépendre des modules de bas niveau. Les deux doivent dépendre d'abstractions.

### Principe
Dépendre des **abstractions** (interfaces) plutôt que des **implémentations** concrètes.

### ✅ Exemple Correct

```typescript
// Abstraction
interface IStorageService {
  save(key: string, value: any): void;
  load(key: string): any;
}

// Implémentations concrètes
export class LocalStorageService implements IStorageService {
  save(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
  
  load(key: string): any {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
}

export class SessionStorageService implements IStorageService {
  save(key: string, value: any): void {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
  
  load(key: string): any {
    const data = sessionStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
}

// Module de haut niveau dépend de l'abstraction
export class UserRepository {
  constructor(private storage: IStorageService) {}
  
  saveUser(user: User): void {
    this.storage.save('user', user);
  }
  
  loadUser(): User | null {
    return this.storage.load('user');
  }
}

// Utilisation: on peut changer l'implémentation facilement
const repo1 = new UserRepository(new LocalStorageService());
const repo2 = new UserRepository(new SessionStorageService());
```

### ❌ Exemple Incorrect

```typescript
// Module de haut niveau dépend directement de l'implémentation
export class UserRepository {
  private storage = new LocalStorageService(); // Dépendance concrète!
  
  saveUser(user: User): void {
    this.storage.save('user', user);
  }
  
  loadUser(): User | null {
    return this.storage.load('user');
  }
}

// Impossible de changer l'implémentation sans modifier UserRepository
// Difficile à tester (dépend de localStorage)
```

### 💡 Avantages
- Code découplé
- Facilite les tests (injection de mocks)
- Changement d'implémentation sans modification

---

## 🎓 Application Pratique dans Mon Miam Miam

### Architecture Globale

```
┌─────────────────────────────────────────┐
│         Composants React (UI)           │
│  - LoginForm, OrdersList, Dashboard     │
└──────────────┬──────────────────────────┘
               │ utilise
               ↓
┌─────────────────────────────────────────┐
│       Hooks Personnalisés (Logic)       │
│  - useAuth, useOrders, useLocalStorage  │
└──────────────┬──────────────────────────┘
               │ utilise
               ↓
┌─────────────────────────────────────────┐
│        Services (Business Logic)        │
│  - UserService, OrderService            │
└──────────────┬──────────────────────────┘
               │ étend
               ↓
┌─────────────────────────────────────────┐
│       BaseService (Abstraction)         │
│  - CRUD operations génériques           │
└─────────────────────────────────────────┘
```

### Respect des Principes

| Principe | Application |
|----------|-------------|
| **SRP** | Chaque service a une responsabilité unique (UserService = users, OrderService = orders) |
| **OCP** | BaseService extensible sans modification |
| **LSP** | Tous les services peuvent remplacer BaseService |
| **ISP** | Interfaces spécifiques (IStorageService, IAuthService) |
| **DIP** | Composants dépendent des hooks, hooks dépendent des services (abstractions) |

---

## 📋 Checklist SOLID

Avant de commiter du code, vérifier:

- [ ] **SRP**: Ma classe/fonction a-t-elle une seule responsabilité?
- [ ] **OCP**: Puis-je étendre sans modifier?
- [ ] **LSP**: Les classes dérivées peuvent-elles remplacer la classe de base?
- [ ] **ISP**: Mes interfaces sont-elles spécifiques et petites?
- [ ] **DIP**: Est-ce que je dépends d'abstractions plutôt que d'implémentations?

---

## 🔗 Ressources

- [SOLID Principles - Wikipedia](https://en.wikipedia.org/wiki/SOLID)
- [Clean Architecture - Robert C. Martin](https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164)
- [Design Patterns - Gang of Four](https://www.amazon.com/Design-Patterns-Elements-Reusable-Object-Oriented/dp/0201633612)

---

**Dernière mise à jour:** 31 Octobre 2024  
**Auteur:** Équipe Dev ZEDUC-SP@CE
