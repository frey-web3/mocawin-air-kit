'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Moon,
  Sun,
  User,
  LogOut,
  Crown,
  Menu,
  X,
  Search,
  UserCircle,
  Home,
  Rss,
  ChartNoAxesColumn,
} from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppContext } from '../context/AppContext';

interface Prediction {
  id: number;
  title: string;
  yes: number;
  no: number;
  volume: string;
}

const filterPredictions = (predictions: Prediction[], query: string) => {
  if (!query) return [];
  return predictions.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase())
  );
};

export default function Navbar() {
  const {
    theme,
    toggleTheme,
    isLoggedIn,
    userAddress,
    handleLogin,
    handleLogout,
    isLoggingIn,
    predictions,
    searchQuery,
    setSearchQuery,
  } = useAppContext();

  const router = useRouter();
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);

  const filteredResults = filterPredictions(predictions, searchQuery);

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Market', href: '/market', icon: Rss },
    { name: 'My Predictions', href: '/my-predictions', icon: ChartNoAxesColumn },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(event.target as Node)) {
        setIsDesktopSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (href: string) => {
    router.push(href);
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-40 w-full ${
          theme === 'dark'
            ? 'bg-gray-900/80 border-b border-slate-800 text-white'
            : 'bg-white/80 border-b border-slate-200 text-slate-800'
        } backdrop-blur-xl`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left Side: Menu for Mobile, Logo+Links for Desktop */}
            <div className="flex items-center">
              <button
                onClick={() => setIsMenuOpen(true)}
                className={`md:hidden p-2 -ml-2 rounded-full ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden md:flex items-center space-x-8">
                <a href="/" className="flex items-center space-x-2">
                  <Crown className={`w-8 h-8 ${theme === 'dark' ? 'text-indigo-500' : 'text-indigo-600'}`} />
                  <span className="text-2xl font-bold">Mocawin</span>
                </a>
                <div className="flex items-center space-x-6">
                  {navLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={(e) => { e.preventDefault(); handleNavigation(link.href); }}
                      className={`text-sm font-medium transition-colors ${
                        pathname === link.href 
                          ? (theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600')
                          : (theme === 'dark' ? 'hover:text-indigo-400' : 'hover:text-indigo-600')
                      }`}
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Center: Logo for Mobile */}
            <div className="md:hidden">
              <a href="/" className="flex items-center space-x-2">
                <Crown className={`w-8 h-8 ${theme === 'dark' ? 'text-indigo-500' : 'text-indigo-600'}`} />
              </a>
            </div>

            {/* Right Side: Search, Login/User Dropdown */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="relative hidden md:block" ref={desktopSearchRef}>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsDesktopSearchOpen(true)}
                  className={`w-48 lg:w-64 py-2 pl-10 pr-4 text-sm rounded-full transition-all duration-300 ${theme === 'dark' ? 'bg-slate-800 focus:bg-slate-700 border-transparent focus:border-indigo-500 text-white' : 'bg-slate-100 focus:bg-white border-slate-200 focus:border-indigo-500 text-black'} focus:outline-none`}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                {isDesktopSearchOpen && searchQuery && (
                  <div className={`absolute top-full mt-2 w-full rounded-xl shadow-lg p-2 z-50 max-h-80 overflow-y-auto ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    {filteredResults.length > 0 ? (
                      filteredResults.map((p) => (
                        <div key={p.id} className={`p-2 rounded-lg cursor-pointer ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`} onClick={() => setIsDesktopSearchOpen(false)}>
                          <h3 className="font-semibold text-sm">{p.title}</h3>
                          <span className="text-xs text-slate-400">Volume: {p.volume}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-sm py-3 text-slate-400">No results.</p>
                    )}
                  </div>
                )}
              </div>

              <button onClick={() => setIsSearchModalOpen(true)} className={`md:hidden p-2 -mr-2 rounded-full ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                <Search className="w-5 h-5" />
              </button>

              {isLoggedIn ? (
                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setIsDropdownOpen((prev) => !prev)} className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-200 hover:bg-slate-300'}`}>
                    <User className={`w-5 h-5 ${theme === 'dark' ? 'text-white' : 'text-slate-600'}`} />
                  </button>
                  {isDropdownOpen && (
                     <div className={`absolute right-0 mt-2 w-72 origin-top-right rounded-2xl shadow-lg z-50 p-4 ${theme === 'dark' ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${theme === 'dark' ? 'bg-indigo-500' : 'bg-indigo-600'}`}>
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Wallet Address</p>
                          <p className="text-sm font-semibold">{userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <a href="/profile" onClick={(e) => { e.preventDefault(); handleNavigation('/profile'); setIsDropdownOpen(false); }} className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-sm font-medium ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                          <span>Profile</span>
                          <UserCircle className="w-5 h-5 text-slate-400" />
                        </a>
                        <button onClick={toggleTheme} className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-sm font-medium ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                          <span>Theme</span>
                          {theme === 'light' ? <Moon className="w-5 h-5 text-slate-400" /> : <Sun className="w-5 h-5 text-slate-400" />}
                        </button>
                        <button onClick={handleLogout} className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-sm font-medium ${theme === 'dark' ? 'hover:bg-red-900/50 text-red-400' : 'hover:bg-red-100 text-red-500'}`}>
                          <span>Logout</span>
                          <LogOut className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className={`flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white transition-colors ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-700 hover:bg-indigo-800'} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoggingIn ? 'Connecting...' : <span className="hidden md:block">Login / Sign Up</span>}
                  {isLoggingIn || <span className="md:hidden">Login</span>}
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar (Mobile Menu) */}
        <div
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ease-in-out ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}>

        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        ></div>

        <div
          className={`relative w-80 h-full p-6 text-slate-200 ${
            theme === 'dark' ? 'bg-slate-900' : 'bg-gray-800'
          } transition-transform duration-300 ease-in-out transform ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-8">
            <a href="/" className="flex items-center space-x-2">
              <Crown className={`w-8 h-8 ${theme === 'dark' ? 'text-indigo-500' : 'text-indigo-500'}`} />
              <span className="text-2xl font-bold">Mocawin</span>
            </a>
            <button onClick={() => setIsMenuOpen(false)} className={`p-2 rounded-full ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-700'}`}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => { e.preventDefault(); handleNavigation(link.href); }}
                  className={`flex items-center space-x-3 p-3 rounded-lg font-medium transition-colors ${
                    pathname === link.href 
                      ? (theme === 'dark' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-500/20 text-indigo-300') 
                      : (theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-700')
                  }`}>
                  <Icon className="w-5 h-5" />
                  <span>{link.name}</span>
                </a>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Search Modal (Mobile) */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-gray-900/90 backdrop-blur-sm" onClick={() => setIsSearchModalOpen(false)}>
          <div className="relative w-full p-4" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search markets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className={`w-full py-3 pl-11 pr-10 text-base rounded-full ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white text-black'} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <button onClick={() => setIsSearchModalOpen(false)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            {searchQuery && (
              <div className="mt-4 max-h-[70vh] overflow-y-auto rounded-lg">
                {filteredResults.length > 0 ? (
                  filteredResults.map((p) => (
                    <div key={p.id} className={`p-3 mb-2 rounded-lg cursor-pointer ${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-white hover:bg-slate-100 text-black'}`} onClick={() => setIsSearchModalOpen(false)}>
                      <h3 className="font-semibold">{p.title}</h3>
                      <span className="text-sm text-slate-400">Volume: {p.volume}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-lg py-6 text-slate-400">No results found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
