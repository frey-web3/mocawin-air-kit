// page.tsx (Refactored)
"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar"; 
import TradeCard from "../components/TradeCard"; // <-- NEW IMPORT
import { Moon, Sun, ChevronLeft, ChevronRight } from "lucide-react"; 
import {
  AirService,
  BUILD_ENV,
  type AirEventListener,
  type BUILD_ENV_TYPE,
} from "@mocanetwork/airkit";

/* -------------------------------------------------
   1. AirService instance (created once)
   ------------------------------------------------- */
const PARTNER_ID = process.env.NEXT_PUBLIC_PARTNER_ID || "YOUR_PARTNER_ID";

if (!PARTNER_ID || PARTNER_ID === "YOUR_PARTNER_ID") {
  console.warn("Warning: No valid Partner ID provided. Set NEXT_PUBLIC_PARTNER_ID in .env.local");
}

const airService = new AirService({ partnerId: PARTNER_ID });

/* -------------------------------------------------
   2. Static data (banners + predictions + news)
   ------------------------------------------------- */
// Define the Prediction Type for cleaner code
interface Prediction {
    id: number; 
    title: string; 
    yes: number; 
    no: number; 
    volume: string;
}

const banners = [
  { id: 1, title: "Welcome to Prediction Market", bg: "bg-gradient-to-r from-blue-500 to-purple-600" },
  { id: 2, title: "Trade Your Predictions", bg: "bg-gradient-to-r from-green-500 to-teal-600" },
  { id: 3, title: "Earn Rewards Daily", bg: "bg-gradient-to-r from-orange-500 to-red-600" },
  { id: 4, title: "Join the Community", bg: "bg-gradient-to-r from-pink-500 to-rose-600" },
];

const predictions: Prediction[] = [ // <-- USE INTERFACE HERE
  { id: 1, title: "Bitcoin will reach $130k", yes: 65, no: 35, volume: "1.2M" },
  { id: 2, title: "AI will pass Turing test", yes: 45, no: 55, volume: "850K" },
  { id: 3, title: "Tesla stock above $500", yes: 58, no: 42, volume: "2.1M" }, 
  { id: 4, title: "Next World Cup winner", yes: 72, no: 28, volume: "3.5M" },
  { id: 5, title: "Ethereum reaches $5k", yes: 51, no: 49, volume: "1.8M" },
  { id: 6, title: "Mars landing by 2030", yes: 38, no: 62, volume: "920K" },
  { id: 7, title: "US Election outcome", yes: 48, no: 52, volume: "5.2M" },
  { id: 8, title: "Climate goals met", yes: 33, no: 67, volume: "1.1M" },
  { id: 9, title: "New tech IPO success", yes: 61, no: 39, volume: "780K" },
];

// Data untuk Flash News
const confirmedNews = [
    "✅ Confirmed: Bitcoin REJECTED $130k this quarter.",
    "🚀 Resolved: Mars Landing prediction will be settled next week.",
    "🏆 Winner Declared: Check the World Cup bet results!",
    "💰 Payout Alert: Ethereum $5k market has been resolved.",
    "📉 AI Turing Test market closed. Check your trades.",
];

/* -------------------------------------------------
   3. Main component
   ------------------------------------------------- */
export default function PredictionMarket() {
  /* ---------- Global UI state ---------- */
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState("home"); 
  const [currentBanner, setCurrentBanner] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  
  /* ---------- AirService state ---------- */
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [currentEnv] = useState<BUILD_ENV_TYPE>(BUILD_ENV.SANDBOX); 

  /* ---------- Trade Card State (NEW) ---------- */
  const [isTradeCardOpen, setIsTradeCardOpen] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);

  const openTradeCard = (prediction: Prediction) => {
    setSelectedPrediction(prediction);
    setIsTradeCardOpen(true);
  };

  const closeTradeCard = () => {
    setIsTradeCardOpen(false);
    setSelectedPrediction(null);
  };

  /* -------------------------------------------------
     4. Initialise AirService
     ------------------------------------------------- */
  const initAirService = async () => {
    try {
      await airService.init({
        buildEnv: currentEnv,
        enableLogging: true,
        skipRehydration: false, 
      });
      setIsInitialized(true);
      console.log("AirService initialized (env:", currentEnv, ")");

      if (airService.isLoggedIn && airService.loginResult?.abstractAccountAddress) {
        setIsLoggedIn(true);
        setUserAddress(airService.loginResult.abstractAccountAddress);
      }
    } catch (e) {
      console.error("AirService init failed:", e);
      setIsInitialized(true); 
    }
  };

  useEffect(() => {
    initAirService();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEnv]); 

  /* -------------------------------------------------
     5. Auth listeners & helpers
     ------------------------------------------------- */
  useEffect(() => {
    if (!isInitialized) return;

    const listener: AirEventListener = async (data) => {
      if (data.event === "logged_in") {
        setIsLoggedIn(true);
        const addr = data.result.abstractAccountAddress;
        if (addr) {
          setUserAddress(addr);
        } else {
          const accounts = await airService.provider.request({
            method: "eth_accounts",
            params: [],
          });
          setUserAddress(Array.isArray(accounts) && accounts.length ? accounts[0] : null);
        }
      } else if (data.event === "logged_out") {
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
      console.error("Login error:", e);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await airService.logout();
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  /* -------------------------------------------------
     6. Theme / Banner helpers
     ------------------------------------------------- */
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setTheme(e.matches ? "dark" : "light");
    setTheme(mql.matches ? "dark" : "light");
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentBanner((i) => (i + 1) % banners.length);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const nextBanner = () => setCurrentBanner((i) => (i + 1) % banners.length);
  const prevBanner = () => setCurrentBanner((i) => (i - 1 + banners.length) % banners.length);


  /* -------------------------------------------------
     7. Render
     ------------------------------------------------- */
  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-black text-white" : "bg-white text-black"}`}>
      
      {/* -------------------- NAVBAR COMPONENT -------------------- */}
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLoggedIn={isLoggedIn}
        userAddress={userAddress}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        predictions={predictions} // Pass static data down
        confirmedNews={confirmedNews} // Pass static data down
        searchQuery={searchQuery} // Pass search state
        setSearchQuery={setSearchQuery} // Pass search setter
      />

      {/* ---------- MAIN ---------- */}
      <main className="pt-8 pb-8 px-4 sm:px-8 max-w-7xl mx-auto"> 
        {/* ----- Banner Slider ----- */}
        <div className="relative mb-12 rounded-2xl overflow-hidden h-64 sm:h-80">
          {banners.map((b, i) => (
            <div
              key={b.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                i === currentBanner ? "opacity-100" : "opacity-0"
              } ${b.bg} flex items-center justify-center`}
            >
              <h2 className="text-3xl sm:text-5xl font-bold text-white text-center px-4">{b.title}</h2>
            </div>
          ))}

          <button
            onClick={prevBanner}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 backdrop-blur-sm"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <button
            onClick={nextBanner}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-2 backdrop-blur-sm"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBanner(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === currentBanner ? "bg-white" : "bg-white/50"}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* ----- Prediction Cards (Display All, Filtering is on the Navbar Search) ----- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {predictions.map((p) => (
            <div
              key={p.id}
              className={`rounded-xl p-6 border transition-all ${
                theme === "dark"
                  ? "bg-white/5 border-white/10 hover:border-white/20"
                  : "bg-black/5 border-black/10 hover:border-black/20"
              }`}
            >
              <h3 className="font-semibold text-lg mb-4">{p.title}</h3>

              <div className="space-y-3 mb-4">
                {/* YES */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Yes</span>
                    <span className="font-medium">{p.yes}%</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${theme === "dark" ? "bg-white/10" : "bg-black/10"}`}>
                    <div
                      className="h-full bg-green-500 transition-all duration-700"
                      style={{ width: `${p.yes}%` }}
                    />
                  </div>
                </div>

                {/* NO */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>No</span>
                    <span className="font-medium">{p.no}%</span>
                  </div>
                  <div className={`h-2 rounded-full overflow-hidden ${theme === "dark" ? "bg-white/10" : "bg-black/10"}`}>
                    <div
                      className="h-full bg-red-500 transition-all duration-700"
                      style={{ width: `${p.no}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm opacity-60">Volume: {p.volume}</span>
                <button
                  onClick={() => isLoggedIn ? openTradeCard(p) : handleLogin()} // <-- UPDATED CLICK HANDLER
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    theme === "dark"
                      ? "bg-white text-black hover:bg-white/90"
                      : "bg-black text-white hover:bg-black/90"
                  }`}
                >
                  {isLoggedIn ? "Trade" : "Login to Trade"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Trade Card Modal (NEW) */}
      {isTradeCardOpen && selectedPrediction && (
        <TradeCard
            prediction={selectedPrediction}
            onClose={closeTradeCard}
            theme={theme}
            isLoggedIn={isLoggedIn} // <-- ADDED PROP
            handleLogin={handleLogin} // <-- ADDED PROP
        />
      )}

      {/* ---------- FOOTER ---------- */}
      <footer
        className={`py-4 px-4 sm:px-8 border-t ${ 
          theme === "dark" 
            ? "bg-black text-white border-white/10" 
            : "bg-white text-black border-black/10"
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-sm gap-2">
          <p className="order-1 sm:order-none">© 2025 Prediction Market</p> 
          <div className="flex gap-4 order-3 sm:order-none"> 
            <a href="#" className="hover:opacity-80">Twitter</a>
            <a href="#" className="hover:opacity-80">Discord</a>
            <a href="#" className="hover:opacity-80">Telegram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}