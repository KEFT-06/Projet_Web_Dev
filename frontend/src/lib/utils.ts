// Utility functions for the application

/**
 * Format price in CFA francs
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString('fr-FR')} FCFA`;
}

/**
 * Translate order status to French
 */
export function translateOrderStatus(status: string): string {
  const translations: Record<string, string> = {
    'pending': 'En attente',
    'in-preparation': 'En préparation',
    'in-delivery': 'En livraison',
    'delivered': 'Livré',
    'cancelled': 'Annulé',
  };
  return translations[status] || status;
}

/**
 * Translate complaint status to French
 */
export function translateComplaintStatus(status: string): string {
  const translations: Record<string, string> = {
    'pending': 'En attente',
    'responded': 'Répondu',
    'resolved': 'Résolu',
  };
  return translations[status] || status;
}

/**
 * Translate employee status to French
 */
export function translateEmployeeStatus(status: string): string {
  const translations: Record<string, string> = {
    'active': 'Actif',
    'on-leave': 'En congé',
    'sick-leave': 'Arrêt maladie',
  };
  return translations[status] || status;
}

/**
 * Translate position to French
 */
export function translatePosition(position: string): string {
  const translations: Record<string, string> = {
    'cook': 'Cuisinier',
    'server': 'Serveur',
    'delivery': 'Livreur',
  };
  return translations[position] || position;
}

/**
 * Translate category to French
 */
export function translateCategory(category: string): string {
  const translations: Record<string, string> = {
    'starter': 'Entrées',
    'main': 'Plats principaux',
    'drink': 'Boissons',
  };
  return translations[category] || category;
}
