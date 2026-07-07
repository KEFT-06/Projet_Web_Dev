import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CustomerOrders } from '../components/customer/CustomerOrders';

// Mock the storage functions
vi.mock('../lib/storage', () => ({
  getMenuItems: vi.fn(() => [
    {
      id: '1',
      name: 'Test Dish',
      description: 'A test dish',
      price: 1000,
      category: 'main',
      available: true,
      inStock: true,
      image: 'test.jpg'
    }
  ]),
  getOrders: vi.fn(() => []),
  addOrder: vi.fn(),
  updateUserLoyaltyPoints: vi.fn(),
  getUserFavorites: vi.fn(() => []),
  addToFavorites: vi.fn(),
  removeFromFavorites: vi.fn(),
  isFavorite: vi.fn(() => false),
  addUserFavorite: vi.fn(),
}));

// Mock the AppContext
vi.mock('../lib/AppContext', () => ({
  useApp: vi.fn(() => ({
    t: {
      orders: 'Commandes',
      cart: 'Panier',
      placeOrder: 'Passer la commande',
      address: 'Adresse',
      orderHistory: 'Historique des commandes',
      ourMenu: 'Notre Menu',
      selectCategory: 'Sélectionner une catégorie',
      allItems: 'Tous les articles',
      starters: 'Entrées',
      mainCourses: 'Plats principaux',
      drinks: 'Boissons',
    },
  })),
}));

// Mock toast - fix the import issue
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock ImageWithFallback
vi.mock('../figma/ImageWithFallback', () => ({
  ImageWithFallback: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

describe('CustomerOrders', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    password: 'password',
    firstName: 'Test',
    lastName: 'User',
    role: 'customer' as const,
    loyaltyPoints: 0,
    referralCode: 'TEST123',
    referredBy: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders menu items', () => {
    render(<CustomerOrders user={mockUser} />);

    expect(screen.getByText('Test Dish')).toBeInTheDocument();
    expect(screen.getByText('A test dish')).toBeInTheDocument();
  });

  it('allows adding items to cart', async () => {
    const user = userEvent.setup();
    render(<CustomerOrders user={mockUser} />);

    const addButton = screen.getByRole('button', { name: '+' });
    await user.click(addButton);

    expect(screen.getByText('Panier (1)')).toBeInTheDocument(); // Cart should show 1 item
  });

  it('allows toggling favorites', async () => {
    const user = userEvent.setup();
    render(<CustomerOrders user={mockUser} />);

    const heartButton = screen.getByRole('button', { name: /♡|♥/i });
    await user.click(heartButton);

    // Check if addUserFavorite was called
    const { addUserFavorite } = await import('../lib/storage');
    expect(addUserFavorite).toHaveBeenCalledWith('1', '1'); // userId, itemId
  });

  it('displays order history', () => {
    render(<CustomerOrders user={mockUser} />);

    expect(screen.getByText('Historique des commandes')).toBeInTheDocument();
  });
});
