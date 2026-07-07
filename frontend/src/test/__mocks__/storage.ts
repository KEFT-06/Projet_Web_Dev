import { vi } from 'vitest';

// Mock implementation for localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock implementation for storage functions
export const getMenuItems = vi.fn();
export const getOrders = vi.fn();
export const addOrder = vi.fn();
export const updateUserLoyaltyPoints = vi.fn();
export const getUserFavorites = vi.fn();
export const addToFavorites = vi.fn();
export const removeFromFavorites = vi.fn();
export const isFavorite = vi.fn();
