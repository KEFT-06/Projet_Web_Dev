/**
 * BaseService - Service de base pour toutes les opérations CRUD
 * 
 * Principe SOLID appliqué:
 * - Single Responsibility: Gère uniquement les opérations CRUD de base
 * - Open/Closed: Ouvert à l'extension, fermé à la modification
 * - Liskov Substitution: Peut être étendu par d'autres services
 * 
 * Principe DRY: Évite la duplication du code CRUD dans chaque service
 * Principe KISS: Interface simple et claire
 */

export interface IStorageService<T> {
  getAll(): T[];
  getById(id: string): T | undefined;
  create(item: Omit<T, 'id'>): T;
  update(id: string, item: Partial<T>): T | undefined;
  delete(id: string): boolean;
  save(items: T[]): void;
}

/**
 * Service de base générique pour les opérations localStorage
 * @template T - Type de l'entité gérée
 */
export abstract class BaseService<T extends { id: string }> implements IStorageService<T> {
  protected storageKey: string;

  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  /**
   * Récupère tous les éléments du localStorage
   * @returns Array d'éléments
   */
  getAll(): T[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error loading ${this.storageKey}:`, error);
      return [];
    }
  }

  /**
   * Récupère un élément par son ID
   * @param id - Identifiant de l'élément
   * @returns L'élément trouvé ou undefined
   */
  getById(id: string): T | undefined {
    const items = this.getAll();
    return items.find(item => item.id === id);
  }

  /**
   * Crée un nouvel élément
   * @param item - Données de l'élément (sans ID)
   * @returns L'élément créé avec son ID
   */
  create(item: Omit<T, 'id'>): T {
    const items = this.getAll();
    const newItem = {
      ...item,
      id: this.generateId(),
    } as T;
    
    items.push(newItem);
    this.save(items);
    return newItem;
  }

  /**
   * Met à jour un élément existant
   * @param id - Identifiant de l'élément
   * @param updates - Modifications à appliquer
   * @returns L'élément mis à jour ou undefined
   */
  update(id: string, updates: Partial<T>): T | undefined {
    const items = this.getAll();
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return undefined;
    
    items[index] = { ...items[index], ...updates };
    this.save(items);
    return items[index];
  }

  /**
   * Supprime un élément
   * @param id - Identifiant de l'élément
   * @returns true si supprimé, false sinon
   */
  delete(id: string): boolean {
    const items = this.getAll();
    const filteredItems = items.filter(item => item.id !== id);
    
    if (filteredItems.length === items.length) return false;
    
    this.save(filteredItems);
    return true;
  }

  /**
   * Sauvegarde les éléments dans le localStorage
   * @param items - Array d'éléments à sauvegarder
   */
  save(items: T[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (error) {
      console.error(`Error saving ${this.storageKey}:`, error);
      throw new Error(`Failed to save ${this.storageKey}`);
    }
  }

  /**
   * Génère un ID unique
   * @returns ID unique
   */
  protected generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Filtre les éléments selon un prédicat
   * @param predicate - Fonction de filtrage
   * @returns Array d'éléments filtrés
   */
  filter(predicate: (item: T) => boolean): T[] {
    return this.getAll().filter(predicate);
  }

  /**
   * Compte le nombre d'éléments
   * @returns Nombre d'éléments
   */
  count(): number {
    return this.getAll().length;
  }

  /**
   * Vérifie si un élément existe
   * @param id - Identifiant de l'élément
   * @returns true si existe, false sinon
   */
  exists(id: string): boolean {
    return this.getById(id) !== undefined;
  }

  /**
   * Vide tous les éléments
   */
  clear(): void {
    this.save([]);
  }
}

/**
 * Décorateur pour logger les opérations
 */
export function LogOperation(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function (...args: any[]) {
    console.log(`[${target.constructor.name}] ${propertyKey} called with:`, args);
    const result = originalMethod.apply(this, args);
    console.log(`[${target.constructor.name}] ${propertyKey} returned:`, result);
    return result;
  };
  
  return descriptor;
}
