/**
 * UserService - Service de gestion des utilisateurs
 * 
 * Principe SOLID:
 * - Single Responsibility: Gère uniquement les utilisateurs
 * - Dependency Inversion: Dépend de l'abstraction BaseService
 * 
 * Principe DRY: Réutilise BaseService pour éviter la duplication
 * Principe KISS: Interface simple et méthodes spécifiques aux utilisateurs
 */

import { BaseService } from './BaseService';
import type { User } from '../lib/mockData';

/**
 * Service pour gérer les opérations sur les utilisateurs
 */
export class UserService extends BaseService<User> {
  private static instance: UserService;

  private constructor() {
    super('restaurant_users');
  }

  /**
   * Singleton pattern pour garantir une seule instance
   * @returns Instance unique du UserService
   */
  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Trouve un utilisateur par email
   * @param email - Email de l'utilisateur
   * @returns Utilisateur trouvé ou undefined
   */
  findByEmail(email: string): User | undefined {
    return this.getAll().find(user => user.email === email);
  }

  /**
   * Trouve des utilisateurs par rôle
   * @param role - Rôle recherché
   * @returns Array d'utilisateurs avec ce rôle
   */
  findByRole(role: User['role']): User[] {
    return this.filter(user => user.role === role);
  }

  /**
   * Vérifie si un email existe déjà
   * @param email - Email à vérifier
   * @returns true si l'email existe, false sinon
   */
  emailExists(email: string): boolean {
    return this.findByEmail(email) !== undefined;
  }

  /**
   * Authentifie un utilisateur
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe
   * @returns Utilisateur authentifié ou undefined
   */
  authenticate(email: string, password: string): User | undefined {
    const user = this.findByEmail(email);
    if (!user || user.password !== password) {
      return undefined;
    }
    return user;
  }

  /**
   * Met à jour les points de fidélité d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @param points - Nombre de points à ajouter (peut être négatif)
   * @returns Utilisateur mis à jour ou undefined
   */
  updateLoyaltyPoints(userId: string, points: number): User | undefined {
    const user = this.getById(userId);
    if (!user) return undefined;

    const newPoints = Math.max(0, (user.loyaltyPoints || 0) + points);
    return this.update(userId, { loyaltyPoints: newPoints });
  }

  /**
   * Enregistre une connexion utilisateur
   * @param userId - ID de l'utilisateur
   */
  recordLogin(userId: string): void {
    const user = this.getById(userId);
    if (!user) return;

    const now = new Date();
    const loginHistory = user.loginHistory || [];
    
    loginHistory.push({ login: now });

    this.update(userId, {
      lastLogin: now,
      loginHistory,
    });
  }

  /**
   * Enregistre une déconnexion utilisateur
   * @param userId - ID de l'utilisateur
   */
  recordLogout(userId: string): void {
    const user = this.getById(userId);
    if (!user) return;

    const now = new Date();
    const loginHistory = user.loginHistory || [];
    
    // Met à jour la dernière session
    if (loginHistory.length > 0) {
      const lastSession = loginHistory[loginHistory.length - 1];
      if (!lastSession.logout) {
        lastSession.logout = now;
        
        // Calcule le temps passé
        const timeSpent = now.getTime() - lastSession.login.getTime();
        const totalTimeSpent = (user.timeSpent || 0) + timeSpent;

        this.update(userId, {
          lastLogout: now,
          loginHistory,
          timeSpent: totalTimeSpent,
        });
      }
    }
  }

  /**
   * Génère un code de parrainage unique
   * @param userId - ID de l'utilisateur
   * @returns Code de parrainage
   */
  generateReferralCode(userId: string): string {
    const prefix = userId.substring(0, 3).toUpperCase();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `${prefix}${random}`;
  }

  /**
   * Valide un code de parrainage
   * @param code - Code de parrainage à valider
   * @returns Utilisateur parrain ou undefined
   */
  validateReferralCode(code: string): User | undefined {
    return this.getAll().find(user => user.referralCode === code);
  }

  /**
   * Applique un code de parrainage à un nouvel utilisateur
   * @param newUserId - ID du nouvel utilisateur
   * @param referralCode - Code de parrainage
   * @returns true si appliqué avec succès, false sinon
   */
  applyReferralCode(newUserId: string, referralCode: string): boolean {
    const referrer = this.validateReferralCode(referralCode);
    if (!referrer) return false;

    this.update(newUserId, { referredBy: referrer.id });
    return true;
  }

  /**
   * Obtient les statistiques d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @returns Statistiques de l'utilisateur
   */
  getUserStats(userId: string): {
    totalLogins: number;
    totalTimeSpent: number;
    averageSessionTime: number;
    loyaltyPoints: number;
  } | undefined {
    const user = this.getById(userId);
    if (!user) return undefined;

    const totalLogins = user.loginHistory?.length || 0;
    const totalTimeSpent = user.timeSpent || 0;
    const averageSessionTime = totalLogins > 0 ? totalTimeSpent / totalLogins : 0;

    return {
      totalLogins,
      totalTimeSpent,
      averageSessionTime,
      loyaltyPoints: user.loyaltyPoints || 0,
    };
  }

  /**
   * Obtient les utilisateurs actifs (connectés dans les dernières 24h)
   * @returns Array d'utilisateurs actifs
   */
  getActiveUsers(): User[] {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    return this.filter(user => {
      if (!user.lastLogin) return false;
      return new Date(user.lastLogin) > oneDayAgo;
    });
  }

  /**
   * Change le mot de passe d'un utilisateur
   * @param userId - ID de l'utilisateur
   * @param newPassword - Nouveau mot de passe
   * @returns true si changé avec succès, false sinon
   */
  changePassword(userId: string, newPassword: string): boolean {
    const updated = this.update(userId, { password: newPassword });
    return updated !== undefined;
  }
}

// Export de l'instance singleton
export const userService = UserService.getInstance();
