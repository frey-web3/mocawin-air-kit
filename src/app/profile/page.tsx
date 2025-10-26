// app/profile/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Navbar from "../../components/Navbar";
import { 
    Trophy, TrendingUp, DollarSign, Award, Calendar, CheckCircle, XCircle, 
    UserCircle, Settings, Mail, Fingerprint, Globe, Briefcase, Key, Loader2, LogOut 
} from 'lucide-react';

// --- AIR KIT IMPORTS ---
import {
    AirService,
    BUILD_ENV,
    type AirEventListener,
    type BUILD_ENV_TYPE,
} from "@mocanetwork/airkit";

// --- MOCK AirUserDetails (Based on provided structure) ---
interface AirIdDetails {
    airId: string;
    airIdUrl: string;
}

interface AirUserDetails {
    partnerId: string;
    partnerUserId: string;
    airId?: AirIdDetails;
    user: {
        id: string;
        // FIX: Allow null to match the type of the userAddress state (string | null)
        abstractAccountAddress?: string | null; 
        email?: string | null; // Also updated for robustness
        isMFASetup: boolean; // Key property for MFA status
    };
}

// --- AIR KIT SERVICE INSTANCE ---
const PARTNER_ID = process.env.NEXT_PUBLIC_PARTNER_ID || "YOUR_PARTNER_ID";

if (!PARTNER_ID || PARTNER_ID === "YOUR_PARTNER_ID") {
  console.warn("Warning: No valid Partner ID provided. Set NEXT_PUBLIC_PARTNER_ID in .env.local");
}

// @ts-ignore: airService will be initialized
const airService = new AirService({ partnerId: PARTNER_ID });

// --- Static Data for Navbar ---
const predictions = [
    { id: 1, title: "Bitcoin will reach $130k by end of Q4 2025", yes: 65, no: 35, volume: "1.2M" },
    { id: 2, title: "AI will pass Turing test with a new framework", yes: 45, no: 55, volume: "850K" },
    { id: 3, title: "Tesla stock closes above $500 next month", yes: 58, no: 42, volume: "2.1M" },
];

const confirmedNews = [
    "Confirmed: Bitcoin REJECTED $130k this quarter.",
    "Resolved: Mars Landing prediction will be settled next week.",
    "Winner Declared: Check the World Cup bet results!",
];

export interface ClaimHistory {
  id: string;
  predictionId: number;
  title: string;
  payoutUSD: number;
  winPoints: number;
  claimType: 'win' | 'loss';
  claimedAt: string;
  totalAmountTraded: number;
  winningSide: 'Yes' | 'No';
}

// Import the new component (assuming this component exists)
import ClaimDetailCard from '../../components/ClaimDetailCard';

// --- NEW COMPONENT FOR USER MANAGEMENT TAB (RENAMED) ---
interface AccountDetailsProps {
    theme: "light" | "dark";
    airService: AirService;
    isLoggedIn: boolean;
    userAddress: string | null;
    handleLogout: () => Promise<void>; // Added handleLogout prop
}

const AccountDetailsContent: React.FC<AccountDetailsProps> = ({ theme, airService, isLoggedIn, userAddress, handleLogout }) => {
    const [userInfo, setUserInfo] = useState<AirUserDetails | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isMfaSettingUp, setIsMfaSettingUp] = useState(false); // New state for MFA setup
    const [error, setError] = useState<string | null>(null);

    const cardClass = theme === "dark"
        ? "bg-white/5 border border-white/10"
        : "bg-black/5 border border-black/10";

    useEffect(() => {
        if (isLoggedIn) {
            fetchUserInfo();
        }
    }, [isLoggedIn]);

    const fetchUserInfo = async () => {
        if (!isLoggedIn) return;
        setIsLoading(true);
        setError(null);
        try {
            // Check if getUserInfo exists on the service instance (AirKit is an external dependency)
            // @ts-ignore
            const userDetails: AirUserDetails = await airService.getUserInfo();
            setUserInfo(userDetails);
        } catch (e) {
            console.error("Failed to fetch user info:", e);
            setError("Failed to load user data from AirKit. See console for details.");
            // Mock data for demonstration if fetching fails
            setUserInfo({
                partnerId: PARTNER_ID,
                partnerUserId: "mock-user-12345",
                airId: { airId: "Moca-123", airIdUrl: "https://moca.network/id/moca-123" },
                user: {
                    id: "user-abc-xyz",
                    abstractAccountAddress: userAddress,
                    email: "user.private@email.com",
                    isMFASetup: false, // Defaulting to false for testing the setup button
                }
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetupMfa = async () => {
        if (!airService || isMfaSettingUp || !userInfo || !userInfo.user.abstractAccountAddress) return;

        setIsMfaSettingUp(true);
        setError(null);
        try {
            // @ts-ignore
            await airService.setupOrUpdateMfa();
            
            // --- MODIFIED: Reload after successful MFA setup/update ---
            window.location.reload(); 
            // -----------------------------------------------------------

        } catch (e) {
            console.error("MFA setup failed:", e);
            setError("MFA setup failed. Please try again.");
        } finally {
            setIsMfaSettingUp(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className={`p-10 text-center rounded-xl border border-dashed ${theme === "dark" ? "border-white/20" : "border-black/20"}`}>
                <Key className="w-16 h-16 mx-auto mb-4 opacity-30" />
                {/* UPDATED MESSAGE */}
                <p className="text-xl opacity-80">Login Required</p>
                <p className="mt-2 opacity-60">Please log in to view your account details.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-40">
                <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                <p className="ml-3">Loading user details...</p>
            </div>
        );
    }

    if (error && !userInfo) {
        return <p className="text-red-500 p-4">{error}</p>;
    }

    if (!userInfo) {
        return <p className="p-4 opacity-70">No user information available.</p>;
    }

    const { airId, user } = userInfo; // Removed partnerId, partnerUserId from destructuring
    const isMfaActive = user.isMFASetup;

    // Helper to render detail rows
    const DetailRow = ({ icon: Icon, label, value, colorClass = "text-inherit", isAddress = false }: { icon: React.ElementType, label: string, value: string | undefined | null, colorClass?: string, isAddress?: boolean }) => (
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 border-b border-dashed last:border-b-0`}>
            <div className={`flex items-center gap-3 ${isAddress ? 'mb-2 sm:mb-0' : ''}`}>
                <Icon className={`w-5 h-5 opacity-70 flex-shrink-0 ${colorClass}`} />
                <span className="font-medium opacity-80">{label}</span>
            </div>
            <span className={`font-semibold text-left sm:text-right ${isAddress ? 'break-all sm:break-all' : 'flex-shrink-0'} ${colorClass}`}>
                {value || "N/A"}
            </span>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* UPDATED TITLE: Same style as Claim History (now both use text-xl font-bold with icon) */}
            <h3 className="text-xl font-bold flex items-center gap-2">
                <Settings className="w-6 h-6 text-amber-500" />
                Account Settings
            </h3>

            {/* User Info Card */}
            <div className={`p-6 rounded-xl ${cardClass} transition-all`}>
                <DetailRow 
                    icon={UserCircle} 
                    label="Abstract Account Address" 
                    value={user.abstractAccountAddress} 
                    colorClass="text-amber-500"
                    isAddress={true} 
                />
                <DetailRow icon={Mail} label="Email" value={user.email} />
                
                {/* MFA STATUS ROW */}
                <div className="flex justify-between items-center py-3">
                    <div className="flex items-center gap-3">
                        <Fingerprint className={`w-5 h-5 opacity-70 flex-shrink-0 ${isMfaActive ? 'text-green-500' : 'text-red-500'}`} />
                        <span className="font-medium opacity-80">Multi-Factor Authentication</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`font-semibold text-right ${isMfaActive ? 'text-green-500' : 'text-red-500'}`}>
                            {isMfaActive ? 'Enabled' : 'Disabled'}
                        </span>
                        {!isMfaActive && (
                            <button
                                onClick={handleSetupMfa} // Calls handleSetupMfa
                                disabled={isMfaSettingUp || !user.abstractAccountAddress}
                                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                    theme === 'dark' 
                                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                                }`}
                            >
                                {isMfaSettingUp ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Setting Up
                                    </span>
                                ) : (
                                    "Enable MFA"
                                )}
                            </button>
                        )}
                        {isMfaActive && (
                             <button
                                onClick={handleSetupMfa} // FIXED: Now explicitly calls handleSetupMfa to trigger update widget
                                disabled={isMfaSettingUp}
                                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                    theme === 'dark' 
                                        ? 'bg-white/10 hover:bg-white/20 text-white/80'
                                        : 'bg-black/10 hover:bg-black/20 text-black/80'
                                }`}
                            >
                                {isMfaSettingUp ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" /> Updating
                                    </span>
                                ) : (
                                    "Update MFA"
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold transition-colors text-white ${
                    theme === 'dark' 
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-red-500 hover:bg-red-600'
                }`}
            >
                <LogOut className="w-5 h-5" />
                Log Out
            </button>

            {/* AirID Card */}
            {airId && (
                <div className={`p-6 rounded-xl ${cardClass} transition-all`}>
                    <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-purple-500" />
                        Moca AirID
                    </h4>
                    <DetailRow icon={Globe} label="AirID" value={airId.airId} />
                    <DetailRow icon={Briefcase} label="AirID URL" value={airId.airIdUrl} />
                </div>
            )}
            
            {error && <p className="text-red-500 p-4 border border-red-500 rounded-lg">{error}</p>}
        </div>
    );
};

// --- COMPONENT FOR REWARDS TAB (Original Content) ---
// RENAMED TO ClaimHistoryContent
interface ClaimHistoryContentProps {
    theme: "light" | "dark";
    claimHistory: ClaimHistory[];
    setSelectedClaim: (claim: ClaimHistory | null) => void; // ADDED PROP
}
const ClaimHistoryContent: React.FC<ClaimHistoryContentProps> = ({ theme, claimHistory, setSelectedClaim }) => {
    // Calculations remain here for encapsulation
    const totalClaims = claimHistory.length;
    const totalWins = claimHistory.filter(c => c.claimType === 'win').length;
    const totalLosses = claimHistory.filter(c => c.claimType === 'loss').length;
    const totalPayoutUSD = claimHistory.reduce((sum, c) => sum + c.payoutUSD, 0);
    const totalWinPoints = claimHistory.reduce((sum, c) => sum + c.winPoints, 0);
    const winRate = totalClaims > 0 ? ((totalWins / totalClaims) * 100).toFixed(1) : '0.0';

    const cardClass = theme === "dark"
        ? "bg-white/5 border border-white/10 hover:border-white/20"
        : "bg-black/5 border border-black/10 hover:border-black/20";
    
    return (
        <>
            {/* Statistics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Total Claims */}
                <div className={`p-6 rounded-xl ${cardClass} transition-all`}>
                    <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                        <Trophy className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="text-sm opacity-70">Total Claims</span>
                    </div>
                    <p className="text-3xl font-bold">{totalClaims}</p>
                </div>

                {/* Win Rate */}
                <div className={`p-6 rounded-xl ${cardClass} transition-all`}>
                    <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-green-500/20">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <span className="text-sm opacity-70">Win Rate</span>
                    </div>
                    <p className="text-3xl font-bold text-green-500">{winRate}%</p>
                    <p className="text-xs opacity-60 mt-1">{totalWins}W / {totalLosses}L</p>
                </div>

                {/* Total Payout */}
                <div className={`p-6 rounded-xl ${cardClass} transition-all`}>
                    <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-yellow-500/20">
                        <DollarSign className="w-5 h-5 text-yellow-500" />
                    </div>
                    <span className="text-sm opacity-70">Total Payout</span>
                    </div>
                    <p className="text-3xl font-bold text-yellow-500">${totalPayoutUSD.toFixed(2)}</p>
                </div>

                {/* Total WinPoints */}
                <div className={`p-6 rounded-xl ${cardClass} transition-all`}>
                    <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-purple-500/20">
                        <Award className="w-5 h-5 text-purple-500" />
                    </div>
                    <span className="text-sm opacity-70">Total WinPoints</span>
                    </div>
                    <p className="text-3xl font-bold text-purple-500">{totalWinPoints} WP</p>
                </div>
            </div>

            {/* Claim History Section */}
            <div>
            {/* MODIFIED: Updated header to match Account Details style and added icon */}
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                <Trophy className="w-6 h-6 text-amber-500" />
                Your Claim History
            </h3>
            
            {claimHistory.length === 0 ? (
                <div className={`p-10 text-center rounded-xl border border-dashed ${
                theme === "dark" ? "border-white/20" : "border-black/20"
                }`}>
                <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-xl opacity-80">No claims recorded yet</p>
                <p className="mt-2 opacity-60">Settled predictions you have claimed will appear here</p>
                <a 
                    href="/my-predictions" 
                    className={`inline-block mt-4 px-6 py-2 rounded-lg font-medium transition-colors ${
                    theme === "dark" 
                        ? "bg-white/10 hover:bg-white/20" 
                        : "bg-black/10 hover:bg-black/20"
                    }`}
                >
                    Go to My Predictions
                </a>
                </div>
            ) : (
                <div className="space-y-4">
                {claimHistory
                    .sort((a, b) => new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime())
                    .map((claim) => (
                    <div
                        key={claim.id}
                        onClick={() => setSelectedClaim(claim)} // ADDED: Click handler to set the selected claim
                        className={`p-6 rounded-xl cursor-pointer transition-all ${cardClass} group`}
                    >
                        {/* Updated Flex Structure for Mobile Reordering */}
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
                        {/* Left Side: Title, Status, Traded + Date (Always on top/left) */}
                        <div className="flex-1 min-w-0 order-1"> 
                            <div className="flex items-center gap-2 mb-2">
                            {claim.claimType === 'win' ? (
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            ) : (
                                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            )}
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                claim.claimType === 'win'
                                ? 'bg-green-500/20 text-green-500'
                                : 'bg-red-500/20 text-red-500'
                            }`}>
                                {claim.claimType === 'win' ? 'WIN' : 'LOSS'}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                theme === "dark" ? 'bg-white/10' : 'bg-black/10'
                            }`}>
                                {claim.winningSide}
                            </span>
                            </div>
                            
                            <h3 className="font-semibold text-lg mb-3 pr-4 line-clamp-2">
                            {claim.title}
                            </h3>
                            
                            {/* Traded + Date Row */}
                            <div className="flex items-center gap-4 text-sm opacity-70">
                            <div className="flex items-center gap-1.5">
                                <DollarSign className="w-4 h-4" />
                                <span>Traded: ${claim.totalAmountTraded.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                <span>
                                {new Date(claim.claimedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                                </span>
                            </div>
                            </div>
                        </div>

                        {/* Right Side: Payout & WP (Moved to bottom on mobile) */}
                        <div className="w-full sm:w-auto text-left sm:text-right space-y-1 pt-3 sm:pt-0 border-t border-dashed sm:border-t-0 order-3 sm:order-2">
                            <div className="flex gap-4 sm:block sm:space-y-1"> 
                                {/* Payout */}
                                <div className="sm:mb-2">
                                    <span className="block text-xs opacity-70 sm:mb-0">Payout</span>
                                    <div className={`text-2xl font-bold transition-colors ${
                                    claim.claimType === 'win' 
                                        ? 'text-green-500 group-hover:text-green-400' 
                                        : 'text-gray-500'
                                    }`}>
                                    ${claim.payoutUSD.toFixed(2)}
                                    </div>
                                </div>

                                {/* WinPoints */}
                                <div className="sm:mt-2">
                                    <span className="block text-xs opacity-70 sm:mb-0">WinPoints</span>
                                    <div className="flex items-center gap-1.5 justify-start sm:justify-end">
                                    <Award className="w-5 h-5 text-purple-500" />
                                    <span className="text-lg font-bold text-purple-500">
                                        {claim.winPoints} WP
                                    </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    ))}
                </div>
            )}
            </div>
        </>
    );
};


// --- MAIN PROFILE PAGE COMPONENT ---
export default function ProfilePage() {
  /* ---------- AirService state ---------- */
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [currentEnv] = useState<BUILD_ENV_TYPE>(BUILD_ENV.SANDBOX);

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [claimHistory, setClaimHistory] = useState<ClaimHistory[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<ClaimHistory | null>(null);
  
  // Tab state for sidebar
  const [activeTab, setActiveContentTab] = useState("Claim History"); 
  const [searchQuery, setSearchQuery] = useState("");

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
                  // Fallback if needed
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

  // Initialize theme and load claim history
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setTheme(e.matches ? "dark" : "light");
    setTheme(mql.matches ? "dark" : "light");
    mql.addEventListener("change", handler);
    
    // Load claim history from localStorage
    try {
      const historyString = localStorage.getItem('claimHistory');
      if (historyString) {
        const parsedHistory = JSON.parse(historyString);
        setClaimHistory(parsedHistory);
      }
    } catch (e) {
      console.error("Failed to load claim history:", e);
    }

    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  // UI Classes
  const containerClass = theme === "dark" ? "bg-black text-white" : "bg-white text-black";
  const cardClass = theme === "dark"
    ? "bg-white/5 border border-white/10 hover:border-white/20"
    : "bg-black/5 border border-black/10 hover:border-black/20";
  
  // Tabs for the sidebar
  const tabs = [
      // MODIFIED: Pass the setSelectedClaim function down to ClaimHistoryContent
      { 
          name: "Claim History", 
          icon: Trophy, 
          content: <ClaimHistoryContent theme={theme} claimHistory={claimHistory} setSelectedClaim={setSelectedClaim} /> 
      },
      // UPDATED TAB NAME AND COMPONENT
      { name: "Account Details", icon: UserCircle, content: <AccountDetailsContent theme={theme} airService={airService} isLoggedIn={isLoggedIn} userAddress={userAddress} handleLogout={handleLogout} /> },
  ];
  
  const currentContent = tabs.find(t => t.name === activeTab)?.content;

  return (
    <div className={`min-h-screen ${containerClass} flex flex-col`}>
      {/* -------------------- NAVBAR COMPONENT -------------------- */}
      <Navbar
          theme={theme}
          toggleTheme={toggleTheme}
          activeTab={"Profile"} 
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

      <main className="px-4 sm:px-8 py-4 max-w-7xl mx-auto flex-grow w-full">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>
        
        {/* Main Content Area: Sidebar + Right Content */}
        <div className="flex flex-col md:flex-row gap-8 items-start"> 
            {/* Sidebar (Left) */}
            <nav className={`w-full md:w-64 p-4 rounded-xl ${cardClass.replace('hover:', '')} sticky top-4`}>
                <h2 className="text-lg font-bold mb-4">Navigation</h2>
                <div className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:overflow-x-visible md:pb-0">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.name;
                        return (
                            <button
                                key={tab.name}
                                onClick={() => setActiveContentTab(tab.name)}
                                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm font-semibold whitespace-nowrap ${
                                    isActive
                                        ? "bg-amber-600 text-white"
                                        : theme === "dark"
                                            ? "hover:bg-white/10 opacity-70 hover:opacity-100"
                                            : "hover:bg-black/10 opacity-70 hover:opacity-100"
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{tab.name}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Content (Right) */}
            <div className="flex-1 min-w-0">
                {currentContent}
            </div>
        </div>
      </main>

      {/* Render Claim Detail Card - Logic for opening it needs to be re-added to ClaimHistoryContent */}
      {selectedClaim && (
        <ClaimDetailCard
          claim={selectedClaim}
          theme={theme}
          onClose={() => setSelectedClaim(null)}
        />
      )}

      {/* Footer */}
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