import { vi } from 'vitest';
import type { ReactNode } from 'react';

// Mock AppContext
export const AppContext = ({ children }: { children: ReactNode }) => <div>{children}</div>;

export const useApp = vi.fn(() => ({
  t: (key: string) => key, // Simple mock that returns the key
  theme: 'light',
  language: 'fr',
}));
