'use client';

import { createContext, useContext } from 'react';
import { AirService } from '@mocanetwork/airkit';

// Define the shape of the context data
interface AppContextType {
  // Auth State
  isLoggedIn: boolean;
  isLoggingIn: boolean;
  isInitialized: boolean;
  userAddress: string | null;
  
  // Auth Functions
  handleLogin: () => Promise<void>;
  handleLogout: () => Promise<void>;

  // AirService Instance
  airService: AirService | null;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Static Data
  predictions: any[];
  confirmedNews: string[];
}

// Create the context with a default value of null
export const AppContext = createContext<AppContextType | null>(null);

// Custom hook to use the AppContext
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
