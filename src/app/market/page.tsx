// app/market/page.tsx
"use client";

import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar"; 
import TradeCard from "../../components/TradeCard"; 
import { Moon, Sun, ChevronLeft, ChevronRight, Zap } from "lucide-react"; 
import {
  AirService,
  BUILD_ENV,
  type AirEventListener,
  type BUILD_ENV_TYPE,
} from "@mocanetwork/airkit";

/* -------------------------------------------------
   1. AirService instance
   ------------------------------------------------- */
const PARTNER_ID = process.env.NEXT_PUBLIC_PARTNER_ID || "YOUR_PARTNER_ID";

if (!PARTNER_ID || PARTNER_ID === "YOUR_PARTNER_ID") {
  console.warn("Warning: No valid Partner ID provided. Set NEXT_PUBLIC_PARTNER_ID in .env.local");
}

const airService = new AirService({ partnerId: PARTNER_ID });

/* -------------------------------------------------
   2. Static data (18 Predictions)
   ------------------------------------------------- */
interface Prediction {
    id: number; 
    title: string; 
    yes: number; 
    no: number; 
    volume: string;
}

// 18 Kartu Prediksi
const predictions: Prediction[] = [
    { id: 1, title: "Bitcoin will reach $130k by end of Q4 2025", yes: 65, no: 35, volume: "1.2M" },
    { id: 2, title: "AI will pass Turing test with a new framework", yes: 45, no: 55, volume: "850K" },
    { id: 3, title: "Tesla stock closes above $500 next month", yes: 58, no: 42, volume: "2.1M" }, 
    { id: 4, title: "Next World Cup winner will be from South America", yes: 72, no: 28, volume: "3.5M" },
    { id: 5, title: "Ethereum reaches $5k before the end of the year", yes: 51, no: 49, volume: "1.8M" },
    { id: 6, title: "Mars landing of manned mission by 2030", yes: 38, no: 62, volume: "920K" },
    { id: 7, title: "US Election outcome results in a hung parliament", yes: 48, no: 52, volume: "5.2M" },
    { id: 8, title: "Climate goals of 2025 will be met globally", yes: 33, no: 67, volume: "1.1M" },
    { id: 9, title: "New tech IPO success reaches $50B valuation", yes: 61, no: 39, volume: "780K" },
    { id: 10, title: "Amazon stock hits $200 after split announcement", yes: 70, no: 30, volume: "2.5M" },
    { id: 11, title: "Google releases commercial Quantum PC by 2026", yes: 40, no: 60, volume: "1.5M" },
    { id: 12, title: "Oil price drops below $60 per barrel next quarter", yes: 55, no: 45, volume: "3.2M" }, 
    { id: 13, title: "SpaceX lands Starship on Moon by next year", yes: 68, no: 32, volume: "4.0M" },
    { id: 14, title: "Polygon becomes L1 killer and reaches $5", yes: 49, no: 51, volume: "2.0M" },
    { id: 15, title: "Global temperature increase stops by next decade", yes: 35, no: 65, volume: "1.0M" },
    { id: 16, title: "Europe wins next Olympics with most gold medals", yes: 50, no: 50, volume: "4.8M" },
    { id: 17, title: "Major gaming company bankrupts due to regulation", yes: 30, no: 70, volume: "900K" },
    { id: 18, title: "Decentralized Social Media Dominates market share", yes: 63, no: 37, volume: "1.3M" },
];

const confirmedNews = [
    "Confirmed: Bitcoin REJECTED $130k this quarter.",
    "Resolved: Mars Landing prediction will be settled next week.",
    "Winner Declared: Check the World Cup bet results!",
    "Payout Alert: Ethereum $5k market has been resolved.",
    "AI Turing Test market closed. Check your trades.",
];


export default function MarketPage() {
    /* ---------- AirService state ---------- */
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userAddress, setUserAddress] = useState<string | null>(null);
    const [currentEnv] = useState<BUILD_ENV_TYPE>(BUILD_ENV.SANDBOX);

    /* ---------- Local UI state ---------- */
    const [theme, setTheme] = useState<"light" | "dark">("light");
    // --- PENTING: Set activeTab ke 'market' ---
    const [activeTab, setActiveTab] = useState("market"); 
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
    const [isTradeCardOpen, setIsTradeCardOpen] = useState(false);

    const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));
    
    // Handler untuk membuka modal
    const openTradeCard = (prediction: Prediction) => {
        setSelectedPrediction(prediction);
        setIsTradeCardOpen(true);
    };

    const closeTradeCard = () => {
        setIsTradeCardOpen(false);
        setSelectedPrediction(null);
    };

    /* -------------------------------------------------
        AirService Logic 
    ------------------------------------------------- */
    const initAirService = async () => {
        try {
            await airService.init({
                buildEnv: currentEnv,
                enableLogging: true,
                skipRehydration: false, 
            });
            setIsInitialized(true);

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

    useEffect(() => {
        if (!isInitialized) return;

        const listener: AirEventListener = async (data) => {
            if (data.event === "logged_in") {
                setIsLoggedIn(true);
                const addr = data.result.abstractAccountAddress;
                setUserAddress(addr || null);
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
        Theme Effect 
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


    // --- UI Classes ---
    const containerClass = theme === "dark" ? "bg-black text-white" : "bg-white text-black";
    const cardClass = theme === "dark"
        ? "bg-white/5 border border-white/10 hover:border-white/20"
        : "bg-black/5 border border-black/10 hover:border-black/20";
        
    const getBarColor = (side: 'Yes' | 'No') => side === 'Yes' ? 'bg-green-500' : 'bg-red-500';

    return (
        <div className={`min-h-screen ${containerClass} flex flex-col`}>
            
            {/* -------------------- NAVBAR COMPONENT -------------------- */}
            <Navbar
                theme={theme}
                toggleTheme={toggleTheme}
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                
                // --- AIR KIT PROPS ---
                isLoggedIn={isLoggedIn}
                userAddress={userAddress}
                handleLogin={handleLogin}
                handleLogout={handleLogout}
                isLoggingIn={isLoggingIn}
                // --- END AIR KIT PROPS ---

                predictions={predictions} 
                confirmedNews={confirmedNews}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            <main className="px-4 sm:px-8 w-full mx-auto pt-8 md:pb-8 pb-4 flex-grow">
                <div className="max-w-7xl mx-auto mb-8"> 
                    <h1 className="text-3xl font-bold mb-2">
                        Market Overview
                    </h1>
                    <p className="text-opacity-70">
                        Explore all 18 active markets. Place your trade and predict the future outcome.
                    </p>
                </div>

                {/* --- GRID KARTU (3 KOLOM) --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
                    {predictions.map((p) => (
                        <div key={p.id} className={`rounded-xl p-5 border transition-all cursor-pointer ${cardClass}`}>
                            <h3 className="font-semibold text-lg mb-4 hover:text-amber-500" onClick={() => openTradeCard(p)}>
                                {p.title}
                            </h3>

                            {/* Volume */}
                            <div className="flex items-center text-sm opacity-70 mb-5">
                                <Zap className="w-4 h-4 mr-1 text-yellow-500" />
                                <span>Volume: ${p.volume}</span>
                            </div>

                            {/* Bar Yes */}
                            <div className="mb-2">
                                <div className="flex justify-between text-sm font-medium mb-1">
                                    <span className="text-green-500">YES</span>
                                    <span>{p.yes}%</span>
                                </div>
                                <div className={`h-2 rounded-full overflow-hidden ${theme === "dark" ? "bg-white/10" : "bg-black/10"}`}>
                                    <div className={`h-full ${getBarColor('Yes')} transition-all duration-700`} style={{ width: `${p.yes}%` }} />
                                </div>
                            </div>

                            {/* Bar No */}
                            <div className="mb-4">
                                <div className="flex justify-between text-sm font-medium mb-1">
                                    <span className="text-red-500">NO</span>
                                    <span>{p.no}%</span>
                                </div>
                                <div className={`h-2 rounded-full overflow-hidden ${theme === "dark" ? "bg-white/10" : "bg-black/10"}`}>
                                    <div className={`h-full ${getBarColor('No')} transition-all duration-700`} style={{ width: `${p.no}%` }} />
                                </div>
                            </div>
                            
                            {/* Tombol Trade */}
                            <div className="mt-4">
                                <button
                                    onClick={() => isLoggedIn ? openTradeCard(p) : handleLogin()}
                                    className={`w-full py-2.5 rounded-lg font-semibold transition-all shadow-lg ${
                                        theme === "dark"
                                        ? "bg-white text-black hover:bg-white/90"
                                        : "bg-black text-white hover:bg-black/90"
                                    }`}
                                >
                                    {isLoggedIn ? "Trade Now" : "Login to Trade"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Trade Card Modal (Assume you have components/TradeCard.tsx) */}
            {isTradeCardOpen && selectedPrediction && (
                <TradeCard
                    prediction={selectedPrediction}
                    onClose={closeTradeCard}
                    theme={theme}
                    isLoggedIn={isLoggedIn}
                    handleLogin={handleLogin}
                />
            )}

            {/* --- FOOTER --- */}
            <footer className={`py-4 px-4 sm:px-8 border-t ${ 
                theme === "dark" 
                    ? "bg-black text-white border-white/10" 
                    : "bg-white text-black border-black/10"
            }`}>
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