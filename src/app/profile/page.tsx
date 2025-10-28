'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Trophy,
  TrendingUp,
  DollarSign,
  Award,
  Calendar,
  CheckCircle,
  XCircle,
  UserCircle,
  Mail,
  Fingerprint,
  Wallet,
  Loader2,
  LogOut,
  Key,
} from 'lucide-react';
import ClaimDetailCard from '../../components/ClaimDetailCard';
import { useAppContext } from '../../context/AppContext';
import { type AirUserDetails } from '@mocanetwork/airkit';


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

const AccountDetailsContent: React.FC = () => {
  const { airService, userAddress, handleLogout, theme } = useAppContext();

  const [userInfo, setUserInfo] = useState<AirUserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMfaSettingUp, setIsMfaSettingUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserInfo = useCallback(async () => {
    if (!airService) return;
    setIsLoading(true);
    setError(null);
    try {
      const userDetails: AirUserDetails = await airService.getUserInfo();
      setUserInfo(userDetails);
    } catch (e) {
      console.error("Failed to fetch user info:", e);
      setError("Failed to load user data from AirKit. Using mock data.");
      setUserInfo({
        partnerId: 'mock-partner-id',
        partnerUserId: "mock-user-12345",
        user: {
          id: "user-abc-xyz",
          abstractAccountAddress: userAddress || undefined,
          email: "user.private@email.com",
          isMFASetup: false,
        }
      });
    } finally {
      setIsLoading(false);
    }
  }, [airService, userAddress]);

  useEffect(() => {
    if (airService) {
      fetchUserInfo();
    }
  }, [airService, fetchUserInfo]);

  const handleSetupMfa = async () => {
    if (!airService || isMfaSettingUp || !userInfo?.user.abstractAccountAddress) return;

    setIsMfaSettingUp(true);
    setError(null);
    try {
      await airService.setupOrUpdateMfa();
      window.location.reload();
    } catch (e) {
      console.error("MFA setup failed:", e);
      setError("MFA setup failed. Please try again.");
    } finally {
      setIsMfaSettingUp(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className={`w-8 h-8 ${theme === 'dark' ? 'text-indigo-500' : 'text-indigo-600'} animate-spin`} />
        <p className={`ml-4 text-lg ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Loading user details...</p>
      </div>
    );
  }
  
  if (error && !userInfo) {
    return <p className={`p-6 rounded-lg ${theme === 'dark' ? 'text-red-400 bg-red-500/10' : 'text-red-700 bg-red-500/10'}`}>{error}</p>;
  }

  if (!userInfo) {
    return <p className={`p-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>No user information available.</p>;
  }

  const { user } = userInfo;
  const isMfaActive = user.isMFASetup;

  const DetailRow = ({ icon: Icon, label, value, isAddress = false }: any) => (
    <div className="flex items-center justify-between py-4 border-b last:border-b-0">
      <div className="flex items-center gap-4">
        <Icon className={`w-6 h-6 ${label === 'Abstract Account Address' ? (theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600') : 'text-gray-400'}`} />
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className={`font-mono text-sm ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{value || '-'}</p>
        </div>
      </div>
    </div>
  );
  
  return (
    <>
      <div className="space-y-8">
        <div className={`rounded-2xl p-6 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><UserCircle className={theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'} /> Account Details</h3>
          
          <DetailRow 
            icon={Wallet}
            label="Abstract Account Address" 
            value={user.abstractAccountAddress} 
            isAddress={true}
          />
          <DetailRow icon={Mail} label="Email" value={user.email} />

          {/* MFA Row (Reverted to original compact style) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 last:border-b-0">
            <div className="flex items-center gap-4">
              <Fingerprint className={`w-6 h-6 ${isMfaActive ? (theme === 'dark' ? 'text-green-400' : 'text-green-600') : (theme === 'dark' ? 'text-red-400' : 'text-red-600')}`} />
              <div>
                <span className={`font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>MFA</span>
                <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{isMfaActive ? 'Enabled' : 'Not Enabled'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 sm:mt-0">
              <button
                onClick={handleSetupMfa}
                disabled={isMfaSettingUp || !user.abstractAccountAddress}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-2 ${
                  isMfaActive ? (theme === 'dark' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 hover:bg-indigo-500/20' : 'bg-indigo-500/10 border-indigo-500 text-indigo-600 hover:bg-indigo-500/20')
                            : (theme === 'dark' ? 'bg-green-500/10 border-green-500 text-green-400 hover:bg-green-500/20' : 'bg-green-500/10 border-green-500 text-green-600 hover:bg-green-500/20')
                }`}
              >
                {isMfaSettingUp ? <Loader2 className="w-5 h-5 animate-spin" /> : (isMfaActive ? 'Update MFA' : 'Set up MFA')}
              </button>
            </div>
          </div>
        </div>
        {/* Log Out button moved to the end of the main account details div for better grouping, similar to page - Copy.tsx */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-lg font-bold text-white bg-red-600 hover:bg-red-500 transition-all duration-300 transform hover:scale-105 border-2 border-red-500"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
        {/* Error message handling updated */}
        {error && (
          <p className={`p-6 rounded-lg ${theme === 'dark' ? 'text-red-400 bg-red-500/10' : 'text-red-700 bg-red-500/10'}`}>{error}</p>
        )}
      </div>
    </>
  );
};

// ... (Rest of ClaimHistoryContent and ProfilePage components remain unchanged)
const ClaimHistoryContent: React.FC<{ claimHistory: ClaimHistory[], setSelectedClaim: (claim: ClaimHistory | null) => void }> = ({ claimHistory, setSelectedClaim }) => {
  const { theme } = useAppContext();

  const totalClaims = claimHistory.length;
  const totalWins = claimHistory.filter(c => c.claimType === 'win').length;
  const totalLosses = claimHistory.length - totalWins;
  const totalPayoutUSD = claimHistory.reduce((sum, c) => sum + c.payoutUSD, 0);
  const totalWinPoints = claimHistory.reduce((sum, c) => sum + c.winPoints, 0);
  const winRate = totalClaims > 0 ? ((totalWins / totalClaims) * 100).toFixed(1) : '0.0';

  const StatCard = ({ icon: Icon, label, value, subValue, iconColor, valueColor }: any) => (
    <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-5`}>
      <div className="flex items-center gap-4 mb-3">
        <div className={`p-2.5 rounded-lg ${iconColor}/20`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <span className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} font-semibold`}>{label}</span>
      </div>
      <p className={`text-3xl font-extrabold ${valueColor}`}>{value}</p>
      {subValue && <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{subValue}</p>}
    </div>
  );

  const iconColors = {
    indigo: theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600',
    green: theme === 'dark' ? 'text-green-400' : 'text-green-600',
    yellow: theme === 'dark' ? 'text-yellow-400' : 'text-amber-600',
    purple: theme === 'dark' ? 'text-purple-400' : 'text-purple-600',
    red: theme === 'dark' ? 'text-red-400' : 'text-red-600',
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={Trophy} label="Total Claims" value={totalClaims} iconColor={iconColors.indigo} valueColor={iconColors.indigo} />
        <StatCard icon={TrendingUp} label="Win Rate" value={`${winRate}%`} subValue={`${totalWins}W / ${totalLosses}L`} iconColor={iconColors.green} valueColor={iconColors.green} />
        <StatCard icon={DollarSign} label="Total Payout" value={`$${totalPayoutUSD.toFixed(2)}`} iconColor={iconColors.yellow} valueColor={iconColors.yellow} />
        <StatCard icon={Award} label="Total WinPoints" value={`${totalWinPoints} WP`} iconColor={iconColors.purple} valueColor={iconColors.purple} />
      </div>

      <div>
        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><Trophy className={iconColors.indigo} /> Claim History</h3>
        {claimHistory.length === 0 ? (
          <div className={`text-center p-12 rounded-3xl border-2 border-dashed ${theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-100'}`}>
             <Trophy className={`w-16 h-16 mx-auto mb-6 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
            <h2 className="text-2xl font-bold mb-3">No Claims Yet</h2>
            <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} mb-6 max-w-sm mx-auto`}>
             Your claimed predictions will appear here once you've settled a market.
            </p>
            <a href="/my-predictions" className="inline-block px-8 py-3 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 transform hover:scale-105">
              View My Predictions
            </a>
          </div>
        ) : (
          <div className="space-y-5">
            {claimHistory
              .sort((a, b) => new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime())
              .map((claim) => {
                const isWin = claim.claimType === 'win';
                return (
                  <div
                    key={claim.id}
                    onClick={() => setSelectedClaim(claim)}
                    className={`border rounded-2xl p-5 cursor-pointer transition-all duration-300 ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-700 hover:border-indigo-500 hover:bg-gray-800/80' 
                        : 'bg-white border-gray-200 hover:border-indigo-500 hover:bg-gray-50'
                    }`}>
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {isWin ? (
                            <CheckCircle className={`w-6 h-6 ${iconColors.green}`} />
                          ) : (
                            <XCircle className={`w-6 h-6 ${iconColors.red}`} />
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${isWin ? (theme === 'dark' ? 'bg-green-500/10 text-green-400' : 'bg-green-500/10 text-green-700') : (theme === 'dark' ? 'bg-red-500/10 text-red-400' : 'bg-red-500/10 text-red-700')}`}>
                            {isWin ? 'WIN' : 'LOSS'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${theme === 'dark' ? 'bg-gray-700/60 text-slate-300' : 'bg-gray-200 text-slate-600'}`}>
                            {claim.winningSide}
                          </span>
                        </div>
                        <h4 className={`font-bold text-lg mb-3 line-clamp-2 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                          {claim.title}
                        </h4>
                        <div className={`flex items-center gap-4 text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          <div className="flex items-center gap-1.5">
                            <DollarSign className="w-4 h-4" />
                            <span>Traded: ${claim.totalAmountTraded.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(claim.claimedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`w-full sm:w-auto text-left sm:text-right pt-4 sm:pt-0 ${theme === 'dark' ? 'border-t border-gray-700 sm:border-none' : 'border-t border-gray-200 sm:border-none'}`}>
                        <div className="mb-2">
                          <span className={`block text-sm mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Payout</span>
                          <p className={`text-2xl font-bold ${isWin ? iconColors.green : (theme === 'dark' ? 'text-slate-500' : 'text-slate-400')}`}>${claim.payoutUSD.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className={`block text-sm mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>WinPoints</span>
                          <div className="flex items-center justify-start sm:justify-end gap-2">
                            <Award className={`w-5 h-5 ${iconColors.purple}`} />
                            <p className={`text-xl font-bold ${iconColors.purple}`}>{claim.winPoints} WP</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </>
  );
};

export default function ProfilePage() {
  const { theme, isLoggedIn, handleLogin, isLoggingIn } = useAppContext();
  const [claimHistory, setClaimHistory] = useState<ClaimHistory[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<ClaimHistory | null>(null);
  const [activeTab, setActiveContentTab] = useState("Claim History");

  useEffect(() => {
    try {
      const historyString = localStorage.getItem('claimHistory');
      if (historyString) {
        setClaimHistory(JSON.parse(historyString));
      }
    } catch (e) {
      console.error("Failed to load claim history:", e);
    }
  }, []);

  const tabs = [
    { name: "Claim History", icon: Trophy, content: <ClaimHistoryContent claimHistory={claimHistory} setSelectedClaim={setSelectedClaim} /> },
    { name: "Account Details", icon: UserCircle, content: <AccountDetailsContent /> },
  ];

  const currentContent = tabs.find(t => t.name === activeTab)?.content;

  if (!isLoggedIn) {
    return (
      <main className="py-8 px-4 sm:px-8 max-w-7xl mx-auto flex items-center justify-center" style={{minHeight: 'calc(100vh - 200px)'}}>
        <div className={`text-center p-12 rounded-3xl border-2 border-dashed ${theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-100'}`}>
          <Key className={`w-16 h-16 mx-auto mb-6 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
          <h2 className="text-2xl font-bold mb-3">Login Required</h2>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} max-w-xs mx-auto mb-6`}>
            Please log in to view your account details and manage your profile.
          </p>
          <button 
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? 'Connecting...' : 'Login / Sign Up'}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="py-8 px-4 sm:px-8 max-w-7xl mx-auto">
       <div className="mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
          User Profile
        </h1>
        <p className={`max-w-2xl mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
          Manage your account, view your claim history, and track your performance.
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
        <aside className={`w-full md:w-64 lg:w-72 p-4 rounded-2xl border ${theme === 'dark' ? 'bg-gray-800/50 border-gray-700/80' : 'bg-white border-gray-200/80'}`}>
          <nav className="flex md:flex-col gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.name;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveContentTab(tab.name)}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 text-base font-bold w-full text-left ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : (theme === 'dark' ? 'text-slate-400 hover:bg-gray-700/50 hover:text-white' : 'text-slate-500 hover:bg-gray-200/50 hover:text-slate-900')
                  }`}>
                  <Icon className="w-6 h-6" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1 min-w-0 w-full">
          {currentContent}
        </div>
      </div>

      {selectedClaim && (
        <ClaimDetailCard
          claim={selectedClaim}
          theme={theme}
          onClose={() => setSelectedClaim(null)}
        />
      )}
    </main>
  );
}