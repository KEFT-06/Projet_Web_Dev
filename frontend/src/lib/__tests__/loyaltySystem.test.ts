/**
 * Tests Unitaires - Système de Fidélité et Parrainage
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculatePointsEarned,
  calculateDiscountFromPoints,
  validatePointsUsage,
  getUserLoyaltyTier,
  generateReferralCode,
  validateReferralCode,
  LOYALTY_CONFIG,
  LOYALTY_TIERS,
} from '../loyaltySystem';

describe('Système de Fidélité', () => {
  describe('calculatePointsEarned', () => {
    it('devrait calculer correctement les points pour une commande de 5000 FCFA', () => {
      const points = calculatePointsEarned(5000, 0);
      expect(points).toBe(5); // 5000 / 1000 = 5 points
    });

    it('devrait retourner 0 pour une commande inférieure au minimum', () => {
      const points = calculatePointsEarned(500, 0);
      expect(points).toBe(0);
    });

    it('devrait appliquer le multiplicateur de bonus pour le palier Argent', () => {
      const points = calculatePointsEarned(10000, 50); // Palier Argent (x1.2)
      expect(points).toBe(12); // 10 points de base + 2 points bonus
    });

    it('devrait appliquer le multiplicateur de bonus pour le palier Or', () => {
      const points = calculatePointsEarned(10000, 150); // Palier Or (x1.5)
      expect(points).toBe(15); // 10 points de base + 5 points bonus
    });

    it('devrait appliquer le multiplicateur de bonus pour le palier Platine', () => {
      const points = calculatePointsEarned(10000, 300); // Palier Platine (x2)
      expect(points).toBe(20); // 10 points de base + 10 points bonus
    });
  });

  describe('calculateDiscountFromPoints', () => {
    it('devrait calculer 1000 FCFA de réduction pour 15 points', () => {
      const discount = calculateDiscountFromPoints(15);
      expect(discount).toBe(1000);
    });

    it('devrait calculer 2000 FCFA de réduction pour 30 points', () => {
      const discount = calculateDiscountFromPoints(30);
      expect(discount).toBe(2000);
    });

    it('devrait retourner 0 pour moins de 15 points', () => {
      const discount = calculateDiscountFromPoints(10);
      expect(discount).toBe(0);
    });

    it('devrait arrondir vers le bas pour 20 points', () => {
      const discount = calculateDiscountFromPoints(20);
      expect(discount).toBe(1000); // Seulement 1 set complet de 15 points
    });
  });

  describe('validatePointsUsage', () => {
    it('devrait valider l\'utilisation de points valides', () => {
      const result = validatePointsUsage(15, 20, 5000);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('devrait rejeter les points négatifs', () => {
      const result = validatePointsUsage(-5, 20, 5000);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('négatifs');
    });

    it('devrait rejeter si points insuffisants', () => {
      const result = validatePointsUsage(30, 20, 5000);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('insuffisants');
      expect(result.maxPoints).toBe(20);
    });

    it('devrait rejeter si la réduction dépasse le montant de la commande', () => {
      const result = validatePointsUsage(45, 50, 2000); // 45 points = 3000 FCFA > 2000 FCFA
      expect(result.valid).toBe(false);
      expect(result.error).toContain('dépasser');
      expect(result.maxPoints).toBe(30); // Max 2 sets pour 2000 FCFA
    });
  });

  describe('getUserLoyaltyTier', () => {
    it('devrait retourner Bronze pour 0-49 points', () => {
      const tier = getUserLoyaltyTier(25);
      expect(tier.name).toBe('Bronze');
      expect(tier.badge).toBe('🥉');
    });

    it('devrait retourner Argent pour 50-149 points', () => {
      const tier = getUserLoyaltyTier(100);
      expect(tier.name).toBe('Argent');
      expect(tier.badge).toBe('🥈');
      expect(tier.benefits.discountPercentage).toBe(5);
    });

    it('devrait retourner Or pour 150-299 points', () => {
      const tier = getUserLoyaltyTier(200);
      expect(tier.name).toBe('Or');
      expect(tier.badge).toBe('🥇');
      expect(tier.benefits.freeDelivery).toBe(true);
    });

    it('devrait retourner Platine pour 300+ points', () => {
      const tier = getUserLoyaltyTier(500);
      expect(tier.name).toBe('Platine');
      expect(tier.badge).toBe('💎');
      expect(tier.benefits.prioritySupport).toBe(true);
    });
  });
});

describe('Système de Parrainage', () => {
  describe('generateReferralCode', () => {
    it('devrait générer un code de parrainage valide', () => {
      const code = generateReferralCode('user123', 'Antoine');
      expect(code).toHaveLength(11); // 3 + 4 + 4
      expect(code).toMatch(/^[A-Z0-9]+$/);
      expect(code.substring(0, 3)).toBe('ANT');
    });

    it('devrait générer des codes différents pour le même utilisateur', () => {
      const code1 = generateReferralCode('user123', 'Antoine');
      const code2 = generateReferralCode('user123', 'Antoine');
      expect(code1).not.toBe(code2);
    });
  });

  describe('validateReferralCode', () => {
    beforeEach(() => {
      // Setup mock localStorage
      const mockUsers = [
        { id: 'user1', referralCode: 'ABC1234DEFG', firstName: 'Antoine' },
        { id: 'user2', referralCode: 'XYZ5678HIJK', firstName: 'Marie' },
      ];
      localStorage.setItem('restaurant_users', JSON.stringify(mockUsers));
      localStorage.setItem('referral_rewards', JSON.stringify([]));
    });

    it('devrait valider un code de parrainage existant', () => {
      const result = validateReferralCode('ABC1234DEFG', 'user3');
      expect(result.valid).toBe(true);
      expect(result.referrerId).toBe('user1');
    });

    it('devrait rejeter un code invalide', () => {
      const result = validateReferralCode('INVALID', 'user3');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('introuvable');
    });

    it('devrait rejeter si l\'utilisateur utilise son propre code', () => {
      const result = validateReferralCode('ABC1234DEFG', 'user1');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('propre code');
    });

    it('devrait rejeter un code trop court', () => {
      const result = validateReferralCode('ABC', 'user3');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('invalide');
    });
  });
});

describe('Configuration du Système', () => {
  it('devrait avoir une configuration cohérente', () => {
    expect(LOYALTY_CONFIG.POINTS_PER_1000_FCFA).toBeGreaterThan(0);
    expect(LOYALTY_CONFIG.POINTS_FOR_1000_FCFA_DISCOUNT).toBeGreaterThan(0);
    expect(LOYALTY_CONFIG.REFERRAL_BONUS_POINTS).toBeGreaterThan(0);
    expect(LOYALTY_CONFIG.MIN_ORDER_FOR_POINTS).toBeGreaterThan(0);
  });

  it('devrait avoir des paliers de fidélité ordonnés', () => {
    for (let i = 1; i < LOYALTY_TIERS.length; i++) {
      expect(LOYALTY_TIERS[i].minPoints).toBeGreaterThan(LOYALTY_TIERS[i - 1].minPoints);
    }
  });

  it('devrait avoir des multiplicateurs de bonus croissants', () => {
    for (let i = 1; i < LOYALTY_TIERS.length; i++) {
      expect(LOYALTY_TIERS[i].benefits.bonusPointsMultiplier).toBeGreaterThanOrEqual(
        LOYALTY_TIERS[i - 1].benefits.bonusPointsMultiplier
      );
    }
  });
});
