'use client';

import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import {
  AirService,
  BUILD_ENV,
  type AirEventListener,
  type BUILD_ENV_TYPE,
} from '@mocanetwork/airkit';
import { AppContext } from '../context/AppContext';
import { predictions } from '@/data/predictions';
import { confirmedNews } from '@/data/confirmedNews';

// --- Menggunakan NEXT_PUBLIC_AIR_PARTNER_ID ---
const AIR_PARTNER_ID = process.env.NEXT_PUBLIC_AIR_PARTNER_ID || 'YOUR_PARTNER_ID';

if (!AIR_PARTNER_ID || AIR_PARTNER_ID === 'YOUR_PARTNER_ID') {
  console.warn(
    // Pesan peringatan yang jelas
    'Warning: No valid AIR Partner ID provided. Set NEXT_PUBLIC_AIR_PARTNER_ID in .env.local'
  );
}

// Inisialisasi AirService menggunakan variabel publik
const airService = new AirService({ partnerId: AIR_PARTNER_ID });
// ---------------------------------------------

// This script is injected into the <head> to run before the page is rendered.
// It avoids the "flash" of the wrong theme by setting the theme class immediately.
export const ThemeInitializer = () => {
  const script = `
    (function() {
      function getInitialTheme() {
        try {
          const storedTheme = window.localStorage.getItem('theme');
          if (storedTheme) return storedTheme;
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
          return prefersDark.matches ? 'dark' : 'light';
        } catch (e) { 
          // localStorage is disabled
          return 'light';
        }
      }
      const theme = getInitialTheme();
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
};

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [currentEnv] = useState<BUILD_ENV_TYPE>(BUILD_ENV.SANDBOX);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark'); // Default for server
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');

  // On the client, sync React state with the theme set by the inline script
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    if (initialTheme !== theme) {
      setTheme(initialTheme as 'light' | 'dark');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      return newTheme;
    });
  };

  useEffect(() => {
    const initAirService = async () => {
      try {
        await airService.init({
          buildEnv: currentEnv,
          enableLogging: true,
          skipRehydration: false,
        });

        if (airService.isLoggedIn && airService.loginResult?.abstractAccountAddress) {
          setIsLoggedIn(true);
          setUserAddress(airService.loginResult.abstractAccountAddress);
        }
      } catch (e) {
        console.error('AirService init failed:', e);
      } finally {
        setIsInitialized(true);
      }
    };

    initAirService();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEnv]);

  useEffect(() => {
    if (!isInitialized) return;

    const listener: AirEventListener = (data) => {
      if (data.event === 'logged_in') {
        setIsLoggedIn(true);
        setUserAddress(data.result.abstractAccountAddress || null);
      } else if (data.event === 'logged_out') {
        setIsLoggedIn(false);
        setUserAddress(null);
      }
    };

    airService.on(listener);

    return () => {
      airService.off(listener);
    };
  }, [isInitialized]);

  const handleLogin = async () => {
    if (!isInitialized || isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await airService.login();
    } catch (e) {
      console.error('Login error:', e);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await airService.logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const contextValue = {
    isLoggedIn,
    isLoggingIn,
    isInitialized,
    userAddress,
    handleLogin,
    handleLogout,
    airService,
    theme,
    toggleTheme,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    predictions,
    confirmedNews,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen">
        {isInitialized ? (
          <>
            <Navbar />
            {children}
          </>
        ) : (
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-indigo-500"></div>
          </div>
        )}
      </div>
    </AppContext.Provider>
  );
}