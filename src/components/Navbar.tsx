// components/Navbar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Moon,
  Sun,
  User,
  LogOut,
  Crown,
  Zap,
  Menu,
  X,
  Search,
  Settings,
} from "lucide-react";

// Props Interface
interface Prediction {
  id: number;
  title: string;
  yes: number;
  no: number;
  volume: string;
}

interface NavbarProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
  activeTab: string; // Diterima dari parent
  setActiveTab: (tab: string) => void;
  isLoggedIn: boolean;
  userAddress: string | null;
  handleLogin: () => Promise<void>;
  handleLogout: () => Promise<void>;
  isLoggingIn: boolean;
  predictions: Prediction[];
  confirmedNews: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

// Search Logic
const filterPredictions = (predictions: Prediction[], query: string) => {
  if (!query) return [];
  return predictions.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase())
  );
};

// --- NAVIGATION PATH HELPER (UPDATED) ---
const getPath = (tab: string): string => {
  switch (tab.toLowerCase()) {
    case "home":
      return "/";
    case "market":
      return "/market"; // Path terpisah untuk Market
    case "my predictions":
      return "/my-predictions";
    default:
      return "/";
  }
};

// --- GET INITIAL ACTIVE TAB HELPER (UPDATED) ---
const getInitialActiveTab = (): string => {
  if (typeof window === 'undefined') return "home";
  const path = window.location.pathname.toLowerCase();
  
  if (path === "/my-predictions") {
    return "My Predictions";
  }
  if (path === "/market") {
    return "market";
  }
  // Jika path adalah '/', return 'home'
  return "home";
};


export default function Navbar({
  theme,
  toggleTheme,
  activeTab: propActiveTab,
  setActiveTab,
  isLoggedIn,
  userAddress,
  handleLogin,
  handleLogout,
  isLoggingIn,
  predictions,
  confirmedNews,
  searchQuery,
  setSearchQuery,
}: NavbarProps) {
  /* ---------- UI state ---------- */
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false);
  const [backdropOpacity, setBackdropOpacity] = useState(0);
  const [backdropBlur, setBackdropBlur] = useState(0);
  
  // State lokal untuk mengelola tab aktif jika tidak diset oleh prop
  const [localActiveTab, setLocalActiveTab] = useState(propActiveTab || getInitialActiveTab());

  const dropdownRef = useRef<HTMLDivElement>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileDropdownContentRef = useRef<HTMLDivElement>(null);

  const filteredResults = filterPredictions(predictions, searchQuery);

  // Nilai Tab Aktif yang digunakan: prop jika ada, state lokal jika tidak
  const currentActiveTab = propActiveTab || localActiveTab;

  /* -------------------------------------------------
     useEffect untuk Sync Tab
     ------------------------------------------------- */
  useEffect(() => {
    if (propActiveTab) {
        setLocalActiveTab(propActiveTab);
    } else {
        setLocalActiveTab(getInitialActiveTab());
    }
  }, [propActiveTab]);


  /* -------------------------------------------------
     Click-outside handling
     ------------------------------------------------- */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const targetNode = event.target as Node;

      // 1. Logic for Desktop Search
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(targetNode)
      ) {
        setIsDesktopSearchOpen(false);
      }

      // 2. Logic for Dropdown Close (Applies to both Mobile and Desktop)
      const isClickInsideDesktopDropdown = dropdownRef.current && dropdownRef.current.contains(targetNode);
      const isClickInsideMobileDropdown = mobileDropdownContentRef.current && mobileDropdownContentRef.current.contains(targetNode);
      
      const mobileUserButton = document.querySelector('[aria-label="User menu mobile"]');
      const isClickOnMobileButton = mobileUserButton && mobileUserButton.contains(targetNode);

      if (
          isDropdownOpen && 
          !isClickInsideDesktopDropdown && 
          !isClickInsideMobileDropdown &&
          !isClickOnMobileButton
      ) {
          setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  /* -------------------------------------------------
     Sidebar open → blur & opacity animation
     ------------------------------------------------- */
  useEffect(() => {
    if (isMenuOpen) {
      const timer = setTimeout(() => {
        setBackdropOpacity(0.5);
        setBackdropBlur(8);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setBackdropOpacity(0);
      setBackdropBlur(0);
    }
  }, [isMenuOpen]);

  const closeMobileSearch = () => {
    setIsMobileSearchOpen(false);
    setSearchQuery("");
  };

  const handleDesktopSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchQuery(e.target.value);
  const handleMobileSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSearchQuery(e.target.value);
    
  // --- HANDLER KLIK TAB BARU ---
  const handleTabClick = (tab: string) => {
    setActiveTab(tab); 
    setLocalActiveTab(tab);
    window.location.href = getPath(tab); 
  };

  return (
    <>
      {/* MOBILE SEARCH OVERLAY (Tidak ada perubahan) */}
      {isMobileSearchOpen && (
        <div
          className={`fixed inset-0 z-[110] p-4 sm:hidden ${
            theme === "dark" ? "bg-black" : "bg-white"
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-grow">
              <Search
                className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                  theme === "dark" ? "text-white/50" : "text-black/50"
                }`}
              />
              <input
                type="text"
                placeholder="Search markets..."
                value={searchQuery}
                onChange={handleMobileSearchChange}
                className={`pl-10 pr-10 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 w-full transition-colors ${
                  theme === "dark"
                    ? "bg-black border-white/20 text-white focus:ring-amber-600"
                    : "bg-white border-black/20 text-black focus:ring-amber-600"
                }`}
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full opacity-70 hover:opacity-100"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={closeMobileSearch}
              className="text-sm font-medium text-amber-600 hover:text-amber-500 transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Search Results */}
          <div className="overflow-y-auto h-[calc(100vh-80px)]">
            {searchQuery.length > 0 && filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredResults.map((p) => (
                  <div
                    key={p.id}
                    className={`rounded-xl p-4 border transition-all cursor-pointer ${
                      theme === "dark"
                        ? "bg-white/5 border-white/10 hover:border-white/20"
                        : "bg-black/5 border-black/10 hover:border-black/20"
                    }`}
                    onClick={closeMobileSearch}
                  >
                    <h3 className="font-semibold text-lg mb-2">{p.title}</h3>
                    <span className="text-sm opacity-70">
                      Volume: {p.volume}
                    </span>
                    <div className="flex items-center mt-3 text-sm">
                      <span className="text-green-500 font-medium mr-4">
                        Yes: {p.yes}%
                      </span>
                      <span className="text-red-500 font-medium">
                        No: {p.no}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchQuery.length > 0 ? (
              <p className="text-center mt-8 opacity-70">
                No markets found for "{searchQuery}".
              </p>
            ) : (
              <p className="text-center mt-8 opacity-70">
                Start typing to search markets.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ---------- NAVBAR ---------- */}
      <nav
        className={`sticky top-0 z-50 ${
          theme === "dark"
            ? "bg-black/95 text-white shadow-lg border-b border-white/10"
            : "bg-white/95 text-black shadow-md border-b border-black/10"
        } backdrop-blur-sm px-4 sm:px-8`}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto py-3">
          {/* LEFT: Logo + Tabs + Desktop Search */}
          <div className="flex items-center gap-6 flex-1">
            {/* Mobile menu icon */}
            <button
              className="p-2 sm:hidden rounded-lg transition-colors hover:opacity-80"
              onClick={() => setIsMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo: Mengarah ke Home */}
            <div 
                className="hidden md:flex items-center gap-2 cursor-pointer flex-shrink-0"
                onClick={() => handleTabClick("home")} 
            >
              <Crown className="w-7 h-7 text-amber-600" />
              <span className="text-2xl sm:text-3xl font-semibold">
                <span className="font-extrabold">Mocawin</span>
              </span>
            </div>

            {/* Desktop tabs (UPDATED LOGIC) */}
            <div className="hidden md:flex items-center gap-6 flex-shrink-0">
              {/* Tabs: Home, Market, My Predictions */}
              {["home", "market", "My Predictions"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={`transition-opacity text-sm sm:text-base pb-1 ${
                    // Logika aktif yang membandingkan tab saat ini dengan tab di loop
                    currentActiveTab.toLowerCase() === tab.toLowerCase()
                      ? "font-bold opacity-100 border-b-2 border-amber-600"
                      : "font-semibold opacity-70 hover:opacity-90"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Desktop Search */}
            <div
              className="relative hidden md:block max-w-[400px] w-full flex-1"
              ref={desktopSearchRef}
            >
              <div className="flex items-center">
                <Search
                  className={`absolute left-3 w-4 h-4 ${
                    theme === "dark" ? "text-white/50" : "text-black/50"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Search markets..."
                  value={searchQuery}
                  onChange={handleDesktopSearchChange}
                  onFocus={() => setIsDesktopSearchOpen(true)}
                  className={`pl-10 pr-10 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 w-full transition-colors ${
                    theme === "dark"
                      ? "bg-black border-white/20 text-white focus:ring-amber-600"
                      : "bg-white border-black/20 text-black focus:ring-amber-600"
                  }`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full opacity-70 hover:opacity-100"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Desktop dropdown */}
              {isDesktopSearchOpen && searchQuery.length > 0 && (
                <div
                  className={`absolute left-0 mt-2 w-full rounded-xl shadow-2xl p-3 z-50 max-h-80 overflow-y-auto ${
                    theme === "dark"
                      ? "bg-black border border-white/10"
                      : "bg-white border border-black/10"
                  }`}
                >
                  {filteredResults.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {filteredResults.map((p) => (
                        <div
                          key={p.id}
                          className={`rounded-lg p-2 transition-all cursor-pointer ${
                            theme === "dark"
                              ? "hover:bg-white/5"
                              : "hover:bg-black/5"
                          }`}
                          onClick={() => {
                            setSearchQuery("");
                            setIsDesktopSearchOpen(false);
                          }}
                        >
                          <h3 className="font-semibold text-sm">{p.title}</h3>
                          <span className="text-xs opacity-70">
                            Volume: {p.volume}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-sm py-4 opacity-70">
                      No results for "{searchQuery}".
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: User actions (Tidak ada perubahan) */}
          <div className="flex items-center gap-4">
            {/* Mobile search icon */}
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className={`p-2 rounded-lg md:hidden transition-colors hover:opacity-80 ${
                theme === "dark"
                  ? "border-white/20 hover:bg-white/10"
                  : "border-black/20 hover:bg-black/5"
              }`}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Mobile Login/User Icon */}
            <div className="relative md:hidden">
              {isLoggedIn ? (
                <button
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className={`p-2 rounded-lg border transition-colors hover:opacity-80 ${
                    theme === "dark"
                      ? "border-white/20 hover:bg-white/10"
                      : "border-black/20 hover:bg-black/5"
                  }`}
                  aria-label="User menu mobile"
                >
                  <User className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-colors hover:opacity-80 disabled:opacity-50 text-sm font-semibold ${
                    theme === "dark"
                      ? "border-white/20 hover:bg-white/10"
                      : "border-black/20 hover:bg-black/5"
                  }`}
                  aria-label="Login mobile"
                >
                  {isLoggingIn ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  <span>{isLoggingIn ? "Logging In..." : "Login"}</span>
                </button>
              )}
            </div>

            {/* Desktop User / Login */}
            <div className="relative hidden md:block" ref={dropdownRef}>
              {isLoggedIn ? (
                <button
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className={`px-3 py-2 rounded-lg border transition-colors hover:opacity-80 ${
                    theme === "dark"
                      ? "border-white/20 hover:bg-white/10"
                      : "border-black/20 hover:bg-black/5"
                  }`}
                  aria-label="User menu"
                >
                  <User className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors hover:opacity-80 disabled:opacity-50 text-sm font-semibold ${
                    theme === "dark"
                      ? "border-white/20 hover:bg-white/10"
                      : "border-black/20 hover:bg-black/5"
                  }`}
                >
                  {isLoggingIn ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  <span>Login</span>
                </button>
              )}

              {/* Desktop Dropdown */}
              {isLoggedIn && isDropdownOpen && (
                <div
                  className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl p-4 z-50 ${
                    theme === "dark"
                      ? "bg-black border border-white/10"
                      : "bg-white border border-black/10"
                  }`}
                >
                  <div
                    className={`flex items-center gap-2 p-2 rounded-lg mb-3 ${
                      theme === "dark" ? "bg-white/5" : "bg-black/5"
                    }`}
                  >
                    <Settings className="w-5 h-5 opacity-60 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">
                      {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}
                    </span>
                  </div>

                  <button
                    onClick={toggleTheme}
                    className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors text-sm font-medium hover:opacity-90 ${
                      theme === "dark" ? "hover:bg-white/5" : "hover:bg-black/5"
                    }`}
                  >
                    <span>Theme</span>
                    {theme === "light" ? (
                      <Moon className="w-5 h-5" />
                    ) : (
                      <Sun className="w-5 h-5" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                        handleLogout();
                        setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors text-sm font-medium hover:opacity-90 mt-1 ${
                      theme === "dark"
                        ? "hover:bg-white/5 text-red-400"
                        : "hover:bg-black/5 text-red-600"
                    }`}
                  >
                    <span>Logout</span>
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            {/* Mobile Dropdown */}
            {isLoggedIn && isDropdownOpen && (
                <div
                  id="mobile-dropdown"
                  ref={mobileDropdownContentRef}
                  className={`absolute right-4 top-[60px] w-64 rounded-xl shadow-2xl p-4 z-50 md:hidden ${
                    theme === "dark"
                      ? "bg-black border border-white/10"
                      : "bg-white border border-black/10"
                  }`}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div
                    className={`flex items-center gap-2 p-2 rounded-lg mb-3 ${
                      theme === "dark" ? "bg-white/5" : "bg-black/5"
                    }`}
                  >
                    <Settings className="w-5 h-5 opacity-60 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">
                      Wallet: {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      toggleTheme();
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors text-sm font-medium hover:opacity-90 ${
                      theme === "dark" ? "hover:bg-white/5" : "hover:bg-black/5"
                    }`}
                  >
                    <span>Theme</span>
                    {theme === "light" ? (
                      <Moon className="w-5 h-5" />
                    ) : (
                      <Sun className="w-5 h-5" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors text-sm font-medium hover:opacity-90 mt-1 ${
                      theme === "dark"
                        ? "hover:bg-white/5 text-red-400"
                        : "hover:bg-black/5 text-red-600"
                    }`}
                  >
                    <span>Logout</span>
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              )}
          </div>
        </div>

        {/* FLASH NEWS (Tidak ada perubahan) */}
        <div
          className={`flex items-center rounded-lg px-3 py-1 mb-2 text-xs border overflow-hidden whitespace-nowrap w-full mx-auto ${
            theme === "dark"
              ? "bg-amber-600/10 border-amber-600 text-amber-500"
              : "bg-amber-100 border-amber-700 text-amber-800"
          }`}
          onMouseEnter={(e) => {
            const el = e.currentTarget.querySelector(
              ".animate-ticker"
            ) as HTMLElement;
            if (el) el.style.animationPlayState = "paused";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget.querySelector(
              ".animate-ticker"
            ) as HTMLElement;
            if (el) el.style.animationPlayState = "running";
          }}
        >
          <Zap className="w-4 h-4 mr-1.5 flex-shrink-0" />
          <div className="ticker-wrap w-full overflow-hidden">
            <div className="ticker-content inline-block animate-ticker">
              {confirmedNews.map((news, i) => (
                <span
                  key={`n-${i}`}
                  className="mr-8 font-medium hover:underline cursor-pointer"
                >
                  {news}
                </span>
              ))}
              {confirmedNews.map((news, i) => (
                <span
                  key={`dup-${i}`}
                  className="mr-8 font-medium hover:underline cursor-pointer"
                >
                  {news}
                </span>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU SIDEBAR (UPDATED LOGIC) */}
      <div
        className={`fixed inset-0 z-[100] transition-transform duration-300 sm:hidden ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black transition-all duration-300"
          style={{
            backgroundColor: `rgba(0,0,0,${backdropOpacity})`,
            backdropFilter: `blur(${backdropBlur}px)`,
          }}
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Sidebar */}
        <div
          className={`relative w-64 h-full p-5 ${
            theme === "dark" ? "bg-black" : "bg-white"
          } shadow-xl`}
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Crown className="w-7 h-7 text-amber-600" />
              <span className="text-xl font-semibold">
                <span className="font-extrabold">Mocawin</span>
              </span>
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className={`p-2 rounded-lg border transition-colors hover:opacity-80 ${
                theme === "dark"
                  ? "border-white/20 hover:bg-white/10"
                  : "border-black/20 hover:bg-black/5"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {/* Navigasi Mobile: Home, Market, My Predictions */}
            {["home", "market", "My Predictions"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  handleTabClick(tab);
                  setIsMenuOpen(false);
                }}
                className={`text-left text-lg py-2 transition-colors ${
                    currentActiveTab.toLowerCase() === tab.toLowerCase()
                    ? theme === "dark"
                      ? "text-amber-500 font-bold border-l-4 border-amber-500 pl-2"
                      : "text-amber-700 font-bold border-l-4 border-amber-700 pl-2"
                    : "opacity-70 hover:opacity-100 font-medium pl-2"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}

            <hr
              className={`my-2 ${
                theme === "dark" ? "border-white/10" : "border-black/10"
              }`}
            />
            
            {/* Hanya tampilkan informasi alamat jika sudah login */}
            {isLoggedIn && (
              <div
                className={`flex items-center gap-2 p-2 rounded-lg mb-1 ${
                  theme === "dark" ? "bg-white/5" : "bg-black/5"
                }`}
              >
                <User className="w-5 h-5 opacity-60 flex-shrink-0" />
                <span className="text-sm font-medium truncate">
                  Wallet: {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}
                </span>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Ticker keyframes (Tidak ada perubahan) */}
      <style jsx global>{`
        @keyframes ticker {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        .animate-ticker {
          animation: ticker 25s linear infinite;
          padding-right: 100%;
          white-space: nowrap;
        }
        .ticker-content {
          display: inline-block;
        }
      `}</style>
    </>
  );
}