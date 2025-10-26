// app/my-predictions/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import Navbar from "../../components/Navbar"; 
import { ArrowLeft } from 'lucide-react';

// --- IMPORT CLAIM CARD ---
import ClaimCard from "../../components/ClaimCard";

// --- AIR KIT IMPORTS ---
import {
    AirService,
    BUILD_ENV,
    type AirEventListener,
    type BUILD_ENV_TYPE,
  } from "@mocanetwork/airkit";
  
// --- AIR KIT SERVICE INSTANCE ---
const PARTNER_ID = process.env.NEXT_PUBLIC_PARTNER_ID || "YOUR_PARTNER_ID";

if (!PARTNER_ID || PARTNER_ID === "YOUR_PARTNER_ID") {
  console.warn("Warning: No valid Partner ID provided. Set NEXT_PUBLIC_PARTNER_ID in .env.local");
}

const airService = new AirService({ partnerId: PARTNER_ID });

// --- Static Data (18 ITEMS) ---
interface Prediction {
    id: number; 
    title: string; 
    yes: number; 
    no: number; 
    volume: string;
}

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

// --- Trade Interfaces ---
interface SavedTrade {
    id: number;
    predictionId: number;
    title: string;
    amount: number;
    side: 'Yes' | 'No';
    date: string;
}

interface TradeWithPayout extends SavedTrade {
    potentialPayout: number;
}

interface DisplayPrediction extends Prediction {
    myTrades: TradeWithPayout[];
    totalAmountTraded: number; 
    totalPayoutIfYesWins: number;
    totalPayoutIfNoWins: number;
    winningSide?: 'Yes' | 'No';
    winningPayout?: number;
}

export default function MyPredictions() {
    /* ---------- AirService state ---------- */
    const [isInitialized, setIsInitialized] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userAddress, setUserAddress] = useState<string | null>(null);
    const [currentEnv] = useState<BUILD_ENV_TYPE>(BUILD_ENV.SANDBOX); // Use the same env

    const [myTrades, setMyTrades] = useState<SavedTrade[]>([]);
    const [theme, setTheme] = useState<"light" | "dark">("light");
    // Explicit state for Navbar
    const [activeTab] = useState("My Predictions"); 
    const [searchQuery, setSearchQuery] = useState("");

    const [claimModal, setClaimModal] = useState<{
        open: boolean;
        predictionId?: number;
        title?: string;
        payout?: number;
        wp?: number;
        claimType: 'win' | 'loss'; // This state must be sent to ClaimCard
    }>({ open: false, claimType: 'win' }); 

    const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

    /* -------------------------------------------------
        1. AirService Initialization & Auth Logic
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
        2. Other useEffects (Theme & Trades)
    ------------------------------------------------- */
    useEffect(() => {
        const mql = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = (e: MediaQueryListEvent) => setTheme(e.matches ? "dark" : "light");
        setTheme(mql.matches ? "dark" : "light");
        mql.addEventListener("change", handler);
        
        try {
            const tradesString = localStorage.getItem('myTrades');
            if (tradesString) {
                setMyTrades(JSON.parse(tradesString));
            }
        } catch (e) {
            console.error("Failed to load trades:", e);
        }

        return () => mql.removeEventListener("change", handler);
    }, []);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
    }, [theme]);

    // --- Compute user predictions with payouts & winning logic ---
    const userPredictions: DisplayPrediction[] = useMemo(() => {
        const tradesMap = myTrades.reduce((acc, trade) => {
            if (!acc[trade.predictionId]) acc[trade.predictionId] = [];
            acc[trade.predictionId].push(trade);
            return acc;
        }, {} as Record<number, SavedTrade[]>);

        return predictions
            .filter(p => tradesMap[p.id]?.length > 0)
            .map(p => {
                const rawTrades = tradesMap[p.id];
                let totalAmount = 0;
                let totalYes = 0;
                let totalNo = 0;
                const tradesWithPayout: TradeWithPayout[] = [];

                rawTrades.forEach(trade => {
                    const price = trade.side === 'Yes' ? p.yes : p.no;
                    const payout = trade.amount * (100 / price);

                    totalAmount += trade.amount;
                    if (trade.side === 'Yes') totalYes += trade.amount;
                    else totalNo += trade.amount;

                    tradesWithPayout.push({ ...trade, potentialPayout: payout });
                });

                const payoutYes = totalYes > 0 ? totalYes * (100 / p.yes) : 0; 
                const payoutNo = totalNo > 0 ? totalNo * (100 / p.no) : 0; 

                // --- Determine Winner (demo logic: >50% wins) ---
                let winningSide: 'Yes' | 'No' | undefined;
                let winningPayout = 0;

                if (p.yes > 50) {
                    winningSide = 'Yes';
                    // Total payout only from user trades betting 'Yes'
                    winningPayout = rawTrades.filter(t => t.side === 'Yes').reduce((sum, t) => sum + (t.amount * (100 / p.yes)), 0); 
                } else if (p.no > 50) {
                    winningSide = 'No';
                    // Total payout only from user trades betting 'No'
                    winningPayout = rawTrades.filter(t => t.side === 'No').reduce((sum, t) => sum + (t.amount * (100 / p.no)), 0);
                }

                tradesWithPayout.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                return {
                    ...p,
                    myTrades: tradesWithPayout,
                    totalAmountTraded: totalAmount,
                    totalPayoutIfYesWins: payoutYes,
                    totalPayoutIfNoWins: payoutNo,
                    winningSide,
                    winningPayout,
                };
            });
    }, [myTrades]);


    // --- Open Claim Modal (1 Claim Per Card) ---
    const openClaim = (pred: DisplayPrediction) => {
        if (!pred.winningSide) return; 

        const payout = pred.winningPayout || 0; 
        
        const claimType: 'win' | 'loss' = payout > 0 ? 'win' : 'loss';
        
        const baseWP = Math.floor(pred.totalAmountTraded);
        const bonusWP = Math.floor(baseWP * 0.1); 
        const totalWP = baseWP + bonusWP;

        setClaimModal({
            open: true,
            predictionId: pred.id,
            title: pred.title,
            payout: payout,
            wp: totalWP,
            claimType: claimType,
        });
    };

    // --- Confirm Claim ---
    const confirmClaim = () => {
        if (!claimModal.predictionId) return;

        // Delete all trades associated with the claimed PredictionId
        const remaining = myTrades.filter(t => t.predictionId !== claimModal.predictionId);
        localStorage.setItem('myTrades', JSON.stringify(remaining));
        setMyTrades(remaining);
        
        const message = claimModal.claimType === 'win'
            ? `Claim $${claimModal.payout?.toFixed(2)} + ${claimModal.wp} WP successful!`
            : `Market resolved. Claim $0.00 + ${claimModal.wp} WP for participation!`;
            
        alert(message);
        setClaimModal({ open: false, claimType: 'win' });
    };

    // --- UI Classes ---
    const containerClass = theme === "dark" ? "bg-black text-white" : "bg-white text-black";
    const cardClass = theme === "dark"
        ? "bg-white/5 border border-white/10 hover:border-white/20"
        : "bg-black/5 border border-black/10 hover:border-black/20";
        
    const getSideColor = (side: 'Yes' | 'No') => side === 'Yes' ? 'text-green-500' : 'text-red-500';

    return (
        <div className={`min-h-screen ${containerClass} flex flex-col`}>
            
            {/* -------------------- NAVBAR COMPONENT -------------------- */}
            <Navbar
                theme={theme}
                toggleTheme={toggleTheme}
                activeTab={activeTab} 
                setActiveTab={() => {}} 
                
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

            <main className="px-4 sm:px-8 w-full mx-auto pt-2 md:pb-8 pb-4 flex-grow">
                <div className="max-w-7xl mx-auto"> 
                    <h1 className="text-3xl font-bold mb-4 flex items-center">
                        <a href="/" className="hover:opacity-60 transition-opacity"></a>
                        My Current Predictions
                    </h1>
                    <p className="mb-8 text-opacity-70">
                        These are the market predictions where you placed trades locally in this browser.
                    </p>
                </div>

                {userPredictions.length === 0 ? (
                    <div className="max-w-7xl mx-auto p-10 text-center rounded-xl border border-dashed border-opacity-30">
                        <p className="text-xl opacity-80">You don't have any active local trades yet.</p>
                        <p className="mt-2 opacity-60">Go back to the market to place a prediction.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"> 
                        {userPredictions.map((p) => (
                            <div key={p.id} className={`rounded-xl p-6 border transition-all ${cardClass}`}>
                                <h3 className="font-semibold text-lg mb-3">{p.title}</h3>

                                {/* YES/NO Bar */}
                                <div className="space-y-3 mb-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Yes</span>
                                            <span className="font-medium">{p.yes}%</span>
                                        </div>
                                        <div className={`h-2 rounded-full overflow-hidden ${theme === "dark" ? "bg-white/10" : "bg-black/10"}`}>
                                            <div className="h-full bg-green-500 transition-all duration-700" style={{ width: `${p.yes}%` }} />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>No</span>
                                            <span className="font-medium">{p.no}%</span>
                                        </div>
                                        <div className={`h-2 rounded-full overflow-hidden ${theme === "dark" ? "bg-white/10" : "bg-black/10"}`}>
                                            <div className="h-full bg-red-500 transition-all duration-700" style={{ width: `${p.no}%` }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Total Trade Summary */}
                                <div className={`p-3 rounded-lg border my-4 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                                    <div className="flex justify-between text-sm">
                                        <span className="opacity-70">Total Amount Traded:</span>
                                        <span className="font-semibold">${p.totalAmountTraded.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm mt-1 font-bold pt-2 border-t border-opacity-20">
                                        <span className="opacity-70">Est. Total Payout (If YES Wins):</span>
                                        <span className="text-green-500">${p.totalPayoutIfYesWins.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm mt-1 font-bold">
                                        <span className="opacity-70">Est. Total Payout (If NO Wins):</span>
                                        <span className="text-red-500">${p.totalPayoutIfNoWins.toFixed(2)}</span>
                                    </div>
                                </div>
                                
                                <h4 className="font-bold mb-2 border-t pt-3 mt-3">Your Trades ({p.myTrades.length})</h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                    {p.myTrades.map((trade) => (
                                        <div key={trade.id} className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'} text-sm`}>
                                            <div className="flex justify-between font-semibold">
                                                <span className={getSideColor(trade.side)}>{trade.side}</span>
                                                <span className="font-bold text-white/80">
                                                    Est. Payout: ${trade.potentialPayout.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs opacity-70 mt-1">
                                                <span>Bet: ${trade.amount.toFixed(2)}</span>
                                                <span>{new Date(trade.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* --- CLAIM BUTTON --- */}
                                {p.winningSide && (
                                    <button
                                        onClick={() => isLoggedIn ? openClaim(p) : handleLogin()} 
                                        className={`mt-4 w-full py-2.5 rounded-lg font-semibold transition-all ${
                                            p.winningPayout && p.winningPayout > 0
                                                ? (theme === "dark" ? "bg-green-900/30 border border-green-700 text-green-400 hover:opacity-80" : "bg-green-100 border border-green-300 text-green-700 hover:opacity-80")
                                                : (theme === "dark" ? "bg-red-900/30 border border-red-700 text-red-400 hover:opacity-80" : "bg-red-100 border border-red-300 text-red-700 hover:opacity-80")
                                        }`}
                                    >
                                        {isLoggedIn 
                                            ? (p.winningPayout && p.winningPayout > 0 ? "Claim Winnings" : "Clear Market (Loss)")
                                            : "Login to Claim"
                                        }
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* --- CLAIM MODAL --- */}
            {claimModal.open && (
                <ClaimCard
                    title={claimModal.title!}
                    payoutUSD={claimModal.payout!}
                    winPoints={claimModal.wp!}
                    theme={theme}
                    onClose={() => setClaimModal({ open: false, claimType: 'win' })} 
                    onClaim={confirmClaim}
                    claimType={claimModal.claimType} // Passing claimType
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