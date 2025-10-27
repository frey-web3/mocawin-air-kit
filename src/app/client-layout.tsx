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

const PARTNER_ID = process.env.NEXT_PUBLIC_PARTNER_ID || 'YOUR_PARTNER_ID';

if (!PARTNER_ID || PARTNER_ID === 'YOUR_PARTNER_ID') {
  console.warn(
    'Warning: No valid Partner ID provided. Set NEXT_PUBLIC_PARTNER_ID in .env.local'
  );
}

const airService = new AirService({ partnerId: PARTNER_ID });

interface Prediction {
  id: number;
  title: string;
  yes: number;
  no: number;
  volume: string;
}

const predictions: Prediction[] = [
  {
    id: 1,
    title: 'Bitcoin will reach $130k by end of Q4 2025',
    yes: 65,
    no: 35,
    volume: '1.2M',
  },
  {
    id: 2,
    title: 'AI will pass Turing test with a new framework',
    yes: 45,
    no: 55,
    volume: '850K',
  },
  {
    id: 3,
    title: 'Tesla stock closes above $500 next month',
    yes: 58,
    no: 42,
    volume: '2.1M',
  },
  {
    id: 4,
    title: 'Next World Cup winner will be from South America',
    yes: 72,
    no: 28,
    volume: '3.5M',
  },
  {
    id: 5,
    title: 'Ethereum reaches $5k before the end of the year',
    yes: 51,
    no: 49,
    volume: '1.8M',
  },
  {
    id: 6,
    title: 'Mars landing of manned mission by 2030',
    yes: 38,
    no: 62,
    volume: '920K',
  },
  {
    id: 7,
    title: 'US Election outcome results in a hung parliament',
    yes: 48,
    no: 52,
    volume: '5.2M',
  },
  {
    id: 8,
    title: 'Climate goals of 2025 will be met globally',
    yes: 33,
    no: 67,
    volume: '1.1M',
  },
  {
    id: 9,
    title: 'New tech IPO success reaches $50B valuation',
    yes: 61,
    no: 39,
    volume: '780K',
  },
  {
    id: 10,
    title: 'Amazon stock hits $200 after split announcement',
    yes: 70,
    no: 30,
    volume: '2.5M',
  },
  {
    id: 11,
    title: 'Google releases commercial Quantum PC by 2026',
    yes: 40,
    no: 60,
    volume: '1.5M',
  },
  {
    id: 12,
    title: 'Oil price drops below $60 per barrel next quarter',
    yes: 55,
    no: 45,
    volume: '3.2M',
  },
  {
    id: 13,
    title: 'SpaceX lands Starship on Moon by next year',
    yes: 68,
    no: 32,
    volume: '4.0M',
  },
  {
    id: 14,
    title: 'Polygon becomes L1 killer and reaches $5',
    yes: 49,
    no: 51,
    volume: '2.0M',
  },
  {
    id: 15,
    title: 'Global temperature increase stops by next decade',
    yes: 35,
    no: 65,
    volume: '1.0M',
  },
  {
    id: 16,
    title: 'Europe wins next Olympics with most gold medals',
    yes: 50,
    no: 50,
    volume: '4.8M',
  },
  {
    id: 17,
    title: 'Major gaming company bankrupts due to regulation',
    yes: 30,
    no: 70,
    volume: '900K',
  },
  {
    id: 18,
    title: 'Decentralized Social Media Dominates market share',
    yes: 63,
    no: 37,
    volume: '1.3M',
  },
];

const confirmedNews = [
  '✅ Confirmed: Bitcoin REJECTED $130k this quarter.',
  '🚀 Resolved: Mars Landing prediction will be settled next week.',
  '🏆 Winner Declared: Check the World Cup bet results!',
  '💰 Payout Alert: Ethereum $5k market has been resolved.',
  '📉 AI Turing Test market closed. Check your trades.',
];

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
  const [jwt, setJwt] = useState<string | null>(null);
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
        setJwt(null);
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
      const response = await fetch('/api/auth/login', { method: 'POST' });
      const data = await response.json();

      if (response.ok) {
        setJwt(data.token);
        console.log("JWT acquired:", data.token);
      } else {
        throw new Error(data.error || 'Failed to fetch JWT');
      }
    } catch (e) {
      console.error('Login error:', e);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await airService.logout();
      setJwt(null);
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
    jwt,
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
