/**
 * Système de Fidélité et Parrainage - ZEDUC-SP@CE
 * 
 * Objectifs:
 * - Fidélité: Récompenser les clients réguliers avec des points
 * - Parrainage: Encourager le bouche-à-oreille avec des bonus
 */

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'spend' | 'bonus' | 'referral';
  points: number;
  orderId?: string;
  referralCode?: string;
  timestamp: Date;
  description: string;
}

export interface ReferralReward {
  referrerId: string;
  referredId: string;
  referralCode: string;
  status: 'pending' | 'completed' | 'expired';
  pointsAwarded: number;
  timestamp: Date;
}

export interface LoyaltyTier {
  name: string;
  minPoints: number;
  benefits: {
    discountPercentage: number;
    bonusPointsMultiplier: number;
    freeDelivery: boolean;
    prioritySupport: boolean;
  };
  badge: string;
  color: string;
}

// Configuration du système de fidélité
export const LOYALTY_CONFIG = {
  // Points gagnés par 1000 FCFA dépensés
  POINTS_PER_1000_FCFA: 1,
  
  // Points nécessaires pour 1000 FCFA de réduction
  POINTS_FOR_1000_FCFA_DISCOUNT: 15,
  
  // Points bonus pour le parrain
  REFERRAL_BONUS_POINTS: 5,
  
  // Points bonus pour le filleul (première commande)
  REFERRED_BONUS_POINTS: 3,
  
  // Montant minimum de commande pour gagner des points
  MIN_ORDER_FOR_POINTS: 1000,
  
  // Durée de validité des points (en jours, 0 = illimité)
  POINTS_EXPIRY_DAYS: 365,
  
  // Nombre maximum de parrainages par utilisateur
  MAX_REFERRALS_PER_USER: 50,
};

// Paliers de fidélité
export const LOYALTY_TIERS: LoyaltyTier[] = [
  {
    name: 'Bronze',
    minPoints: 0,
    benefits: {
      discountPercentage: 0,
      bonusPointsMultiplier: 1,
      freeDelivery: false,
      prioritySupport: false,
    },
    badge: '🥉',
    color: 'from-orange-400 to-orange-600',
  },
  {
    name: 'Argent',
    minPoints: 50,
    benefits: {
      discountPercentage: 5,
      bonusPointsMultiplier: 1.2,
      freeDelivery: false,
      prioritySupport: false,
    },
    badge: '🥈',
    color: 'from-gray-300 to-gray-500',
  },
  {
    name: 'Or',
    minPoints: 150,
    benefits: {
      discountPercentage: 10,
      bonusPointsMultiplier: 1.5,
      freeDelivery: true,
      prioritySupport: false,
    },
    badge: '🥇',
    color: 'from-yellow-400 to-yellow-600',
  },
  {
    name: 'Platine',
    minPoints: 300,
    benefits: {
      discountPercentage: 15,
      bonusPointsMultiplier: 2,
      freeDelivery: true,
      prioritySupport: true,
    },
    badge: '💎',
    color: 'from-cyan-400 to-blue-600',
  },
];

/**
 * Obtenir le palier de fidélité d'un utilisateur
 */
export function getUserLoyaltyTier(points: number): LoyaltyTier {
  const sortedTiers = [...LOYALTY_TIERS].sort((a, b) => b.minPoints - a.minPoints);
  return sortedTiers.find(tier => points >= tier.minPoints) || LOYALTY_TIERS[0];
}

/**
 * Calculer les points gagnés pour une commande
 */
export function calculatePointsEarned(orderTotal: number, currentPoints: number): number {
  if (orderTotal < LOYALTY_CONFIG.MIN_ORDER_FOR_POINTS) {
    return 0;
  }
  
  const tier = getUserLoyaltyTier(currentPoints);
  const basePoints = Math.floor(orderTotal / 1000) * LOYALTY_CONFIG.POINTS_PER_1000_FCFA;
  const bonusPoints = Math.floor(basePoints * (tier.benefits.bonusPointsMultiplier - 1));
  
  return basePoints + bonusPoints;
}

/**
 * Calculer la réduction disponible avec les points
 */
export function calculateDiscountFromPoints(points: number): number {
  const discountSets = Math.floor(points / LOYALTY_CONFIG.POINTS_FOR_1000_FCFA_DISCOUNT);
  return discountSets * 1000;
}

/**
 * Valider l'utilisation de points
 */
export function validatePointsUsage(
  pointsToUse: number,
  availablePoints: number,
  orderTotal: number
): { valid: boolean; error?: string; maxPoints?: number } {
  if (pointsToUse < 0) {
    return { valid: false, error: 'Les points ne peuvent pas être négatifs' };
  }
  
  if (pointsToUse > availablePoints) {
    return { 
      valid: false, 
      error: 'Points insuffisants',
      maxPoints: availablePoints 
    };
  }
  
  const discount = calculateDiscountFromPoints(pointsToUse);
  if (discount > orderTotal) {
    const maxPointsForOrder = Math.floor(orderTotal / 1000) * LOYALTY_CONFIG.POINTS_FOR_1000_FCFA_DISCOUNT;
    return { 
      valid: false, 
      error: 'La réduction ne peut pas dépasser le montant de la commande',
      maxPoints: maxPointsForOrder
    };
  }
  
  return { valid: true };
}

/**
 * Enregistrer une transaction de points
 */
export function recordLoyaltyTransaction(transaction: Omit<LoyaltyTransaction, 'id' | 'timestamp'>): LoyaltyTransaction {
  const transactions = getLoyaltyTransactions();
  const newTransaction: LoyaltyTransaction = {
    ...transaction,
    id: `lt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
  };
  
  transactions.push(newTransaction);
  localStorage.setItem('loyalty_transactions', JSON.stringify(transactions));
  
  return newTransaction;
}

/**
 * Obtenir l'historique des transactions de points
 */
export function getLoyaltyTransactions(userId?: string): LoyaltyTransaction[] {
  const stored = localStorage.getItem('loyalty_transactions');
  if (!stored) return [];
  
  const transactions = JSON.parse(stored).map((t: any) => ({
    ...t,
    timestamp: new Date(t.timestamp),
  }));
  
  if (userId) {
    return transactions.filter((t: LoyaltyTransaction) => t.userId === userId);
  }
  
  return transactions;
}

/**
 * Générer un code de parrainage unique
 */
export function generateReferralCode(userId: string, userName: string): string {
  const prefix = userName.substring(0, 3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const hash = userId.substring(0, 4).toUpperCase();
  return `${prefix}${random}${hash}`;
}

/**
 * Valider un code de parrainage
 */
export function validateReferralCode(code: string, userId: string): { 
  valid: boolean; 
  error?: string; 
  referrerId?: string 
} {
  if (!code || code.length < 6) {
    return { valid: false, error: 'Code de parrainage invalide' };
  }
  
  // Récupérer tous les utilisateurs pour trouver le parrain
  const users = JSON.parse(localStorage.getItem('restaurant_users') || '[]');
  const referrer = users.find((u: any) => u.referralCode === code);
  
  if (!referrer) {
    return { valid: false, error: 'Code de parrainage introuvable' };
  }
  
  if (referrer.id === userId) {
    return { valid: false, error: 'Vous ne pouvez pas utiliser votre propre code' };
  }
  
  // Vérifier si l'utilisateur a déjà utilisé un code de parrainage
  const referrals = getReferralRewards();
  const alreadyReferred = referrals.find(r => r.referredId === userId);
  
  if (alreadyReferred) {
    return { valid: false, error: 'Vous avez déjà utilisé un code de parrainage' };
  }
  
  // Vérifier le nombre maximum de parrainages
  const referrerCount = referrals.filter(r => r.referrerId === referrer.id).length;
  if (referrerCount >= LOYALTY_CONFIG.MAX_REFERRALS_PER_USER) {
    return { valid: false, error: 'Ce code a atteint sa limite d\'utilisations' };
  }
  
  return { valid: true, referrerId: referrer.id };
}

/**
 * Traiter une récompense de parrainage
 */
export function processReferralReward(referredUserId: string): void {
  const referrals = getReferralRewards();
  const pendingReferral = referrals.find(
    r => r.referredId === referredUserId && r.status === 'pending'
  );
  
  if (!pendingReferral) return;
  
  // Marquer comme complété
  pendingReferral.status = 'completed';
  pendingReferral.pointsAwarded = LOYALTY_CONFIG.REFERRAL_BONUS_POINTS;
  localStorage.setItem('referral_rewards', JSON.stringify(referrals));
  
  // Ajouter les points au parrain
  const users = JSON.parse(localStorage.getItem('restaurant_users') || '[]');
  const referrerIndex = users.findIndex((u: any) => u.id === pendingReferral.referrerId);
  
  if (referrerIndex !== -1) {
    users[referrerIndex].loyaltyPoints = (users[referrerIndex].loyaltyPoints || 0) + LOYALTY_CONFIG.REFERRAL_BONUS_POINTS;
    localStorage.setItem('restaurant_users', JSON.stringify(users));
    
    // Enregistrer la transaction
    recordLoyaltyTransaction({
      userId: pendingReferral.referrerId,
      type: 'referral',
      points: LOYALTY_CONFIG.REFERRAL_BONUS_POINTS,
      referralCode: pendingReferral.referralCode,
      description: `Bonus de parrainage - ${LOYALTY_CONFIG.REFERRAL_BONUS_POINTS} points`,
    });
  }
  
  // Ajouter les points bonus au filleul
  const referredIndex = users.findIndex((u: any) => u.id === referredUserId);
  if (referredIndex !== -1) {
    users[referredIndex].loyaltyPoints = (users[referredIndex].loyaltyPoints || 0) + LOYALTY_CONFIG.REFERRED_BONUS_POINTS;
    localStorage.setItem('restaurant_users', JSON.stringify(users));
    
    recordLoyaltyTransaction({
      userId: referredUserId,
      type: 'bonus',
      points: LOYALTY_CONFIG.REFERRED_BONUS_POINTS,
      referralCode: pendingReferral.referralCode,
      description: `Bonus de bienvenue - ${LOYALTY_CONFIG.REFERRED_BONUS_POINTS} points`,
    });
  }
}

/**
 * Créer une récompense de parrainage
 */
export function createReferralReward(referrerId: string, referredId: string, referralCode: string): ReferralReward {
  const referrals = getReferralRewards();
  const newReward: ReferralReward = {
    referrerId,
    referredId,
    referralCode,
    status: 'pending',
    pointsAwarded: 0,
    timestamp: new Date(),
  };
  
  referrals.push(newReward);
  localStorage.setItem('referral_rewards', JSON.stringify(referrals));
  
  return newReward;
}

/**
 * Obtenir les récompenses de parrainage
 */
export function getReferralRewards(userId?: string): ReferralReward[] {
  const stored = localStorage.getItem('referral_rewards');
  if (!stored) return [];
  
  const rewards = JSON.parse(stored).map((r: any) => ({
    ...r,
    timestamp: new Date(r.timestamp),
  }));
  
  if (userId) {
    return rewards.filter((r: ReferralReward) => r.referrerId === userId || r.referredId === userId);
  }
  
  return rewards;
}

/**
 * Obtenir les statistiques de parrainage d'un utilisateur
 */
export function getReferralStats(userId: string): {
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalPointsEarned: number;
} {
  const referrals = getReferralRewards(userId).filter(r => r.referrerId === userId);
  
  return {
    totalReferrals: referrals.length,
    completedReferrals: referrals.filter(r => r.status === 'completed').length,
    pendingReferrals: referrals.filter(r => r.status === 'pending').length,
    totalPointsEarned: referrals.reduce((sum, r) => sum + r.pointsAwarded, 0),
  };
}
