import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getTranslation } from './translations';
import type { Language, Translations } from './translations';
import { realTimeService, type RealTimeData } from './realTimeService';
import type { User } from './mockData';

export interface Restaurant {
  id: string;
  name: string;
  theme: RestaurantTheme;
}

export interface RestaurantTheme {
  background: string;
  logoBackground: string;
  pageBackground: string;
  buttonColor: string;
  textColor: string;
}

export const defaultTheme: RestaurantTheme = {
  background: '#E1D3B5',
  logoBackground: '#E4E4E4',
  pageBackground: '#E4E4E4',
  buttonColor: '#CFBD97',
  textColor: '#3A2F1F',
};

export const predefinedThemes: Record<string, RestaurantTheme> = {
  beige: defaultTheme,
  blue: {
    background: '#B5D3E1',
    logoBackground: '#E4E4E4',
    pageBackground: '#E4E4E4',
    buttonColor: '#97BDCF',
    textColor: '#1F2F3A',
  },
  green: {
    background: '#C5E1B5',
    logoBackground: '#E4E4E4',
    pageBackground: '#E4E4E4',
    buttonColor: '#A7CF97',
    textColor: '#2F3A1F',
  },
  purple: {
    background: '#D5B5E1',
    logoBackground: '#E4E4E4',
    pageBackground: '#E4E4E4',
    buttonColor: '#BD97CF',
    textColor: '#3A1F3A',
  },
  orange: {
    background: '#E1C5B5',
    logoBackground: '#E4E4E4',
    pageBackground: '#E4E4E4',
    buttonColor: '#CF9A97',
    textColor: '#3A2F1F',
  },
};

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentRestaurant: Restaurant;
  restaurants: Restaurant[];
  setCurrentRestaurant: (restaurant: Restaurant) => void;
  addRestaurant: (restaurant: Restaurant) => void;
  // Système de mise à jour en temps réel
  realTimeData: {
    currentUser: any | null;
    notifications: any[];
    activeOrders: any[];
    onlineUsers: string[];
    loyaltyPoints: number;
    referralCode: string;
    referralPoints: number;
    lastUpdate: Date;
  };
  updateRealTimeData: () => void;
  sendNotification: (userId: string, message: string) => void;
  markOrderAsComplete: (orderId: string) => void;
  updateLoyaltyPoints: (userId: string, points: number) => void;
  updateUserStatus: (userId: string, isOnline: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([
    {
      id: 'main',
      name: 'Mon Miam Miam',
      theme: defaultTheme,
    },
  ]);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant>(restaurants[0]);
  
  // État pour les données en temps réel
  const [realTimeData, setRealTimeData] = useState<RealTimeData>({
    currentUser: null,
    notifications: [],
    activeOrders: [],
    onlineUsers: [],
    loyaltyPoints: 0,
    referralCode: '',
    referralPoints: 0,
    lastUpdate: new Date()
  });

  // Synchronisation avec le RealTimeService
  useEffect(() => {
    const unsubscribe = realTimeService.subscribe('app-context', (data) => {
      setRealTimeData(prev => ({ ...prev, ...data }));
    });
    return () => unsubscribe();
  }, []);

  // Fonctions de mise à jour en temps réel
  const updateRealTimeData = () => {
    // Simuler une mise à jour des données en temps réel
    setRealTimeData(prev => ({
      ...prev,
      lastUpdate: new Date()
    }));
  };

  const sendNotification = (userId: string, message: string) => {
    setRealTimeData(prev => ({
      ...prev,
      notifications: [...prev.notifications, { userId, message, timestamp: new Date() }]
    }));
  };

  const markOrderAsComplete = (orderId: string) => {
    setRealTimeData(prev => ({
      ...prev,
      activeOrders: prev.activeOrders.filter(order => order.id !== orderId)
    }));
  };

  const updateLoyaltyPoints = (userId: string, points: number) => {
    setRealTimeData(prev => ({
      ...prev,
      loyaltyPoints: prev.loyaltyPoints + points
    }));
  };

  const updateUserStatus = (userId: string, isOnline: boolean) => {
    setRealTimeData(prev => ({
      ...prev,
      onlineUsers: isOnline 
        ? [...prev.onlineUsers, userId]
        : prev.onlineUsers.filter(id => id !== userId)
    }));
  };

  // Mise à jour automatique toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(updateRealTimeData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Load preferences from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('app_language') as Language;
    const savedTheme = localStorage.getItem('app_theme') as 'light' | 'dark';
    const savedRestaurants = localStorage.getItem('app_restaurants');
    const savedCurrentRestaurant = localStorage.getItem('app_current_restaurant');

    if (savedLanguage) setLanguage(savedLanguage);
    if (savedTheme) setTheme(savedTheme);
    if (savedRestaurants) {
      const parsed = JSON.parse(savedRestaurants);
      setRestaurants(parsed);
      if (savedCurrentRestaurant) {
        const currentRest = parsed.find((r: Restaurant) => r.id === savedCurrentRestaurant);
        if (currentRest) setCurrentRestaurant(currentRest);
      }
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('app_theme', theme);
    // Update document class for dark mode
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('app_restaurants', JSON.stringify(restaurants));
  }, [restaurants]);

  useEffect(() => {
    localStorage.setItem('app_current_restaurant', currentRestaurant.id);
  }, [currentRestaurant]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const addRestaurant = (restaurant: Restaurant) => {
    setRestaurants(prev => [...prev, restaurant]);
  };

  const value: AppContextType = {
    language,
    setLanguage,
    t: getTranslation(language),
    theme,
    toggleTheme,
    currentRestaurant,
    restaurants,
    setCurrentRestaurant,
    addRestaurant,
    realTimeData,
    updateRealTimeData,
    sendNotification,
    markOrderAsComplete,
    updateLoyaltyPoints,
    updateUserStatus,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}