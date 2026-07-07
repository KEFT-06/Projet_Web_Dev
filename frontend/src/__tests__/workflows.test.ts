/**
 * Tests Fonctionnels - Workflows Complets
 * 
 * Ces tests valident les scénarios utilisateur de bout en bout
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  calculatePointsEarned,
  calculateDiscountFromPoints,
  validatePointsUsage,
  processReferralReward,
  createReferralReward,
  getReferralStats,
  recordLoyaltyTransaction,
  getLoyaltyTransactions,
  LOYALTY_CONFIG,
} from '../lib/loyaltySystem';

describe('Workflow: Inscription et Parrainage', () => {
  beforeEach(() => {
    localStorage.clear();
    
    // Setup utilisateurs de test
    const mockUsers = [
      {
        id: 'parrain1',
        email: 'parrain@test.com',
        firstName: 'Antoine',
        lastName: 'Dupont',
        referralCode: 'ANT1234ABCD',
        loyaltyPoints: 10,
        role: 'customer',
      },
      {
        id: 'filleul1',
        email: 'filleul@test.com',
        firstName: 'Marie',
        lastName: 'Martin',
        referralCode: 'MAR5678EFGH',
        loyaltyPoints: 0,
        role: 'customer',
        usedReferralCode: 'ANT1234ABCD',
      },
    ];
    localStorage.setItem('restaurant_users', JSON.stringify(mockUsers));
    localStorage.setItem('referral_rewards', JSON.stringify([]));
    localStorage.setItem('loyalty_transactions', JSON.stringify([]));
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('Scénario complet: Nouveau client utilise un code de parrainage', () => {
    const parrainId = 'parrain1';
    const filleulId = 'filleul1';
    const referralCode = 'ANT1234ABCD';

    // 1. Créer la récompense de parrainage
    const reward = createReferralReward(parrainId, filleulId, referralCode);
    expect(reward.status).toBe('pending');
    expect(reward.pointsAwarded).toBe(0);

    // 2. Le filleul passe sa première commande
    processReferralReward(filleulId);

    // 3. Vérifier que le parrain a reçu ses points
    const users = JSON.parse(localStorage.getItem('restaurant_users') || '[]');
    const parrain = users.find((u: any) => u.id === parrainId);
    const filleul = users.find((u: any) => u.id === filleulId);

    expect(parrain.loyaltyPoints).toBe(10 + LOYALTY_CONFIG.REFERRAL_BONUS_POINTS);
    expect(filleul.loyaltyPoints).toBe(LOYALTY_CONFIG.REFERRED_BONUS_POINTS);

    // 4. Vérifier les transactions
    const parrainTransactions = getLoyaltyTransactions(parrainId);
    const filleulTransactions = getLoyaltyTransactions(filleulId);

    expect(parrainTransactions).toHaveLength(1);
    expect(parrainTransactions[0].type).toBe('referral');
    expect(parrainTransactions[0].points).toBe(LOYALTY_CONFIG.REFERRAL_BONUS_POINTS);

    expect(filleulTransactions).toHaveLength(1);
    expect(filleulTransactions[0].type).toBe('bonus');
    expect(filleulTransactions[0].points).toBe(LOYALTY_CONFIG.REFERRED_BONUS_POINTS);

    // 5. Vérifier les statistiques de parrainage
    const stats = getReferralStats(parrainId);
    expect(stats.totalReferrals).toBe(1);
    expect(stats.completedReferrals).toBe(1);
    expect(stats.totalPointsEarned).toBe(LOYALTY_CONFIG.REFERRAL_BONUS_POINTS);
  });
});

describe('Workflow: Commande avec Points de Fidélité', () => {
  beforeEach(() => {
    localStorage.clear();
    
    const mockUsers = [
      {
        id: 'customer1',
        email: 'customer@test.com',
        firstName: 'Jean',
        lastName: 'Durand',
        loyaltyPoints: 30,
        role: 'customer',
      },
    ];
    localStorage.setItem('restaurant_users', JSON.stringify(mockUsers));
    localStorage.setItem('loyalty_transactions', JSON.stringify([]));
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('Scénario complet: Client passe une commande et utilise ses points', () => {
    const customerId = 'customer1';
    const orderTotal = 8000; // 8000 FCFA
    let currentPoints = 30;

    // 1. Client veut utiliser 15 points (1000 FCFA de réduction)
    const pointsToUse = 15;
    const validation = validatePointsUsage(pointsToUse, currentPoints, orderTotal);
    expect(validation.valid).toBe(true);

    // 2. Calculer la réduction
    const discount = calculateDiscountFromPoints(pointsToUse);
    expect(discount).toBe(1000);

    // 3. Calculer le nouveau total
    const finalTotal = orderTotal - discount;
    expect(finalTotal).toBe(7000);

    // 4. Enregistrer l'utilisation des points
    recordLoyaltyTransaction({
      userId: customerId,
      type: 'spend',
      points: -pointsToUse,
      orderId: 'order123',
      description: `Réduction de ${discount} FCFA`,
    });

    // 5. Mettre à jour les points du client
    currentPoints -= pointsToUse;
    expect(currentPoints).toBe(15);

    // 6. Calculer les points gagnés pour cette commande
    const pointsEarned = calculatePointsEarned(finalTotal, currentPoints);
    expect(pointsEarned).toBe(7); // 7000 / 1000 = 7 points

    // 7. Enregistrer les points gagnés
    recordLoyaltyTransaction({
      userId: customerId,
      type: 'earn',
      points: pointsEarned,
      orderId: 'order123',
      description: `Points gagnés pour commande de ${finalTotal} FCFA`,
    });

    // 8. Mettre à jour les points finaux
    currentPoints += pointsEarned;
    expect(currentPoints).toBe(22); // 15 + 7

    // 9. Vérifier l'historique des transactions
    const transactions = getLoyaltyTransactions(customerId);
    expect(transactions).toHaveLength(2);
    expect(transactions[0].type).toBe('spend');
    expect(transactions[0].points).toBe(-15);
    expect(transactions[1].type).toBe('earn');
    expect(transactions[1].points).toBe(7);
  });

  it('Scénario: Client ne peut pas utiliser plus de points que disponibles', () => {
    const customerId = 'customer1';
    const orderTotal = 5000;
    const currentPoints = 30;

    // Tenter d'utiliser 45 points (plus que disponible)
    const validation = validatePointsUsage(45, currentPoints, orderTotal);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('insuffisants');
    expect(validation.maxPoints).toBe(30);
  });

  it('Scénario: Réduction ne peut pas dépasser le montant de la commande', () => {
    const customerId = 'customer1';
    const orderTotal = 1500; // Petit montant
    const currentPoints = 30; // 30 points = 2000 FCFA de réduction

    // Tenter d'utiliser 30 points pour une commande de 1500 FCFA
    const validation = validatePointsUsage(30, currentPoints, orderTotal);
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('dépasser');
    expect(validation.maxPoints).toBe(15); // Max 1 set pour 1500 FCFA
  });
});

describe('Workflow: Progression des Paliers de Fidélité', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('loyalty_transactions', JSON.stringify([]));
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('Scénario: Client progresse de Bronze à Platine', () => {
    const customerId = 'customer1';
    let currentPoints = 0;

    // Étape 1: Bronze (0 points)
    let pointsEarned = calculatePointsEarned(10000, currentPoints);
    expect(pointsEarned).toBe(10); // Pas de bonus
    currentPoints += pointsEarned;

    // Étape 2: Toujours Bronze (10 points)
    pointsEarned = calculatePointsEarned(10000, currentPoints);
    expect(pointsEarned).toBe(10);
    currentPoints += pointsEarned;

    // Continuer jusqu'à Argent (50 points)
    while (currentPoints < 50) {
      pointsEarned = calculatePointsEarned(10000, currentPoints);
      currentPoints += pointsEarned;
    }

    // Étape 3: Argent (50+ points) - Bonus x1.2
    expect(currentPoints).toBeGreaterThanOrEqual(50);
    pointsEarned = calculatePointsEarned(10000, currentPoints);
    expect(pointsEarned).toBe(12); // 10 + 20% bonus
    currentPoints += pointsEarned;

    // Continuer jusqu'à Or (150 points)
    while (currentPoints < 150) {
      pointsEarned = calculatePointsEarned(10000, currentPoints);
      currentPoints += pointsEarned;
    }

    // Étape 4: Or (150+ points) - Bonus x1.5
    expect(currentPoints).toBeGreaterThanOrEqual(150);
    pointsEarned = calculatePointsEarned(10000, currentPoints);
    expect(pointsEarned).toBe(15); // 10 + 50% bonus
    currentPoints += pointsEarned;

    // Continuer jusqu'à Platine (300 points)
    while (currentPoints < 300) {
      pointsEarned = calculatePointsEarned(10000, currentPoints);
      currentPoints += pointsEarned;
    }

    // Étape 5: Platine (300+ points) - Bonus x2
    expect(currentPoints).toBeGreaterThanOrEqual(300);
    pointsEarned = calculatePointsEarned(10000, currentPoints);
    expect(pointsEarned).toBe(20); // 10 + 100% bonus

    // Vérifier que le client a bien progressé
    expect(currentPoints).toBeGreaterThan(300);
  });
});

describe('Workflow: Parrainage Multiple', () => {
  beforeEach(() => {
    localStorage.clear();
    
    const mockUsers = [
      {
        id: 'parrain1',
        email: 'parrain@test.com',
        firstName: 'Antoine',
        referralCode: 'ANT1234ABCD',
        loyaltyPoints: 0,
        role: 'customer',
      },
    ];
    
    // Créer 5 filleuls
    for (let i = 1; i <= 5; i++) {
      mockUsers.push({
        id: `filleul${i}`,
        email: `filleul${i}@test.com`,
        firstName: `Filleul${i}`,
        referralCode: `FIL${i}234ABCD`,
        loyaltyPoints: 0,
        role: 'customer',
        usedReferralCode: 'ANT1234ABCD',
      });
    }
    
    localStorage.setItem('restaurant_users', JSON.stringify(mockUsers));
    localStorage.setItem('referral_rewards', JSON.stringify([]));
    localStorage.setItem('loyalty_transactions', JSON.stringify([]));
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('Scénario: Parrain gagne des points avec plusieurs filleuls', () => {
    const parrainId = 'parrain1';
    const referralCode = 'ANT1234ABCD';

    // Créer les récompenses pour 5 filleuls
    for (let i = 1; i <= 5; i++) {
      createReferralReward(parrainId, `filleul${i}`, referralCode);
    }

    // Simuler les premières commandes de chaque filleul
    for (let i = 1; i <= 5; i++) {
      processReferralReward(`filleul${i}`);
    }

    // Vérifier les statistiques
    const stats = getReferralStats(parrainId);
    expect(stats.totalReferrals).toBe(5);
    expect(stats.completedReferrals).toBe(5);
    expect(stats.totalPointsEarned).toBe(LOYALTY_CONFIG.REFERRAL_BONUS_POINTS * 5);

    // Vérifier les points du parrain
    const users = JSON.parse(localStorage.getItem('restaurant_users') || '[]');
    const parrain = users.find((u: any) => u.id === parrainId);
    expect(parrain.loyaltyPoints).toBe(LOYALTY_CONFIG.REFERRAL_BONUS_POINTS * 5);

    // Vérifier que chaque filleul a reçu son bonus
    for (let i = 1; i <= 5; i++) {
      const filleul = users.find((u: any) => u.id === `filleul${i}`);
      expect(filleul.loyaltyPoints).toBe(LOYALTY_CONFIG.REFERRED_BONUS_POINTS);
    }
  });
});
