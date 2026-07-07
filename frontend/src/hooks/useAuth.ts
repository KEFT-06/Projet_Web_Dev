/**
 * useAuth - Hook personnalisé pour la gestion de l'authentification
 * 
 * Principe SOLID:
 * - Single Responsibility: Gère uniquement l'authentification
 * - Interface Segregation: Expose uniquement les méthodes nécessaires
 * 
 * Principe DRY: Centralise toute la logique d'authentification
 * Principe KISS: API simple et intuitive
 */

import { useState, useEffect, useCallback } from 'react';
import { userService } from '../services/UserService';
import type { User } from '../lib/mockData';
import { useLocalStorage } from './useLocalStorage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (userData: Omit<User, 'id' | 'loyaltyPoints'>) => Promise<boolean>;
  updateUser: (updates: Partial<User>) => void;
  refreshUser: () => void;
}

/**
 * Hook pour gérer l'authentification de l'utilisateur
 * @returns Objet contenant l'état et les méthodes d'authentification
 */
export function useAuth(): UseAuthReturn {
  const [currentUserId, setCurrentUserId] = useLocalStorage<string | null>(
    'restaurant_current_user',
    null
  );

  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  /**
   * Charge l'utilisateur actuel depuis le localStorage
   */
  const loadUser = useCallback(() => {
    if (!currentUserId) {
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      return;
    }

    const user = userService.getById(currentUserId);
    
    if (user) {
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } else {
      // Utilisateur non trouvé, nettoyer le localStorage
      setCurrentUserId(null);
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'User not found',
      });
    }
  }, [currentUserId, setCurrentUserId]);

  /**
   * Connexion de l'utilisateur
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe
   * @returns true si connexion réussie, false sinon
   */
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const user = userService.authenticate(email, password);

        if (!user) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Invalid email or password',
          }));
          return false;
        }

        // Enregistrer la connexion
        userService.recordLogin(user.id);

        // Mettre à jour l'état
        setCurrentUserId(user.id);
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return true;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Login failed',
        }));
        return false;
      }
    },
    [setCurrentUserId]
  );

  /**
   * Déconnexion de l'utilisateur
   */
  const logout = useCallback(() => {
    if (state.user) {
      userService.recordLogout(state.user.id);
    }

    setCurrentUserId(null);
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, [state.user, setCurrentUserId]);

  /**
   * Inscription d'un nouvel utilisateur
   * @param userData - Données de l'utilisateur
   * @returns true si inscription réussie, false sinon
   */
  const signup = useCallback(
    async (userData: Omit<User, 'id' | 'loyaltyPoints'>): Promise<boolean> => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        // Vérifier si l'email existe déjà
        if (userService.emailExists(userData.email)) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'Email already exists',
          }));
          return false;
        }

        // Créer l'utilisateur
        const newUser = userService.create({
          ...userData,
          loyaltyPoints: 0,
          referralCode: userService.generateReferralCode(userData.email),
          createdAt: new Date(),
        });

        // Connecter automatiquement l'utilisateur
        setCurrentUserId(newUser.id);
        setState({
          user: newUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        return true;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Signup failed',
        }));
        return false;
      }
    },
    [setCurrentUserId]
  );

  /**
   * Met à jour les informations de l'utilisateur
   * @param updates - Modifications à appliquer
   */
  const updateUser = useCallback(
    (updates: Partial<User>) => {
      if (!state.user) return;

      const updatedUser = userService.update(state.user.id, updates);
      
      if (updatedUser) {
        setState(prev => ({
          ...prev,
          user: updatedUser,
        }));
      }
    },
    [state.user]
  );

  /**
   * Rafraîchit les données de l'utilisateur
   */
  const refreshUser = useCallback(() => {
    loadUser();
  }, [loadUser]);

  // Charger l'utilisateur au montage
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return {
    ...state,
    login,
    logout,
    signup,
    updateUser,
    refreshUser,
  };
}
