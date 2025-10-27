'use client';

import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import ClaimCard from '../../components/ClaimCard';
import { useAppContext } from '../../context/AppContext';

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
  const { theme, isLoggedIn, handleLogin, isLoggingIn } = useAppContext();
  const [myTrades, setMyTrades] = useState<SavedTrade[]>([]);
  const [claimModal, setClaimModal] = useState<{
    open: boolean;
    predictionId?: number;
    title?: string;
    payout?: number;
    wp?: number;
    claimType: 'win' | 'loss';
  }>({ open: false, claimType: 'win' });

  useEffect(() => {
    if (isLoggedIn) {
      try {
        const tradesString = localStorage.getItem('myTrades');
        if (tradesString) {
          setMyTrades(JSON.parse(tradesString));
        }
      } catch (e) {
        console.error('Failed to load trades:', e);
      }
    }
  }, [isLoggedIn]);

  const userPredictions: DisplayPrediction[] = useMemo(() => {
    const tradesMap = myTrades.reduce((acc, trade) => {
      if (!acc[trade.predictionId]) acc[trade.predictionId] = [];
      acc[trade.predictionId].push(trade);
      return acc;
    }, {} as Record<number, SavedTrade[]>);

    return predictions
      .filter((p) => tradesMap[p.id]?.length > 0)
      .map((p) => {
        const rawTrades = tradesMap[p.id];
        let totalAmount = 0;
        let totalYes = 0;
        let totalNo = 0;
        const tradesWithPayout: TradeWithPayout[] = [];

        rawTrades.forEach((trade) => {
          const price = trade.side === 'Yes' ? p.yes : p.no;
          const payout = trade.amount * (100 / price);

          totalAmount += trade.amount;
          if (trade.side === 'Yes') totalYes += trade.amount;
          else totalNo += trade.amount;

          tradesWithPayout.push({ ...trade, potentialPayout: payout });
        });

        const payoutYes = totalYes > 0 ? totalYes * (100 / p.yes) : 0;
        const payoutNo = totalNo > 0 ? totalNo * (100 / p.no) : 0;

        let winningSide: 'Yes' | 'No' | undefined;
        let winningPayout = 0;

        if (p.yes > 50) {
          winningSide = 'Yes';
          winningPayout = rawTrades
            .filter((t) => t.side === 'Yes')
            .reduce((sum, t) => sum + t.amount * (100 / p.yes), 0);
        } else if (p.no > 50) {
          winningSide = 'No';
          winningPayout = rawTrades
            .filter((t) => t.side === 'No')
            .reduce((sum, t) => sum + t.amount * (100 / p.no), 0);
        }

        tradesWithPayout.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

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

  const confirmClaim = () => {
    if (!claimModal.predictionId) return;

    const remaining = myTrades.filter(
      (t) => t.predictionId !== claimModal.predictionId
    );
    localStorage.setItem('myTrades', JSON.stringify(remaining));
    setMyTrades(remaining);

    const message =
      claimModal.claimType === 'win'
        ? `Claim $${claimModal.payout?.toFixed(2)} + ${claimModal.wp} WP successful!`
        : `Market resolved. Claim $0.00 + ${claimModal.wp} WP for participation!`;

    alert(message);
    setClaimModal({ open: false, claimType: 'win' });
  };

  const getSideColor = (side: 'Yes' | 'No') => {
    if (theme === 'dark') {
      return side === 'Yes' ? 'text-green-400' : 'text-red-400';
    } else {
      return side === 'Yes' ? 'text-green-600' : 'text-red-600';
    }
  };

  return (
    <main className="py-8 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
          My Predictions
        </h1>
        <p className={`max-w-2xl mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
          Review your active and past predictions. Claim your winnings when a market resolves.
        </p>
      </div>

      {isLoggedIn && userPredictions.length === 0 && (
        <div className={`text-center py-20 px-8 rounded-3xl border-2 border-dashed ${
          theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-300 bg-gray-100/50'
        }`}>
          <h2 className="text-2xl font-bold mb-3">No Active Predictions</h2>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} mb-6 max-w-sm mx-auto`}>
            It looks like you haven't made any predictions yet. Head over to the market to get started.
          </p>
          <a
            href="/market"
            className="inline-block px-8 py-3 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 transform hover:scale-105"
          >
            Explore Markets
          </a>
        </div>
      )}

      {!isLoggedIn && (
        <div className={`text-center py-20 px-8 rounded-3xl border-2 border-dashed ${
          theme === 'dark' ? 'border-gray-700 bg-gray-900/50' : 'border-gray-300 bg-gray-100/50'
        }`}>
          <h2 className="text-2xl font-bold mb-3">Login to View Your Predictions</h2>
          <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} mb-6 max-w-sm mx-auto`}>
            Please login to see your active and past predictions.
          </p>
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="inline-block px-8 py-3 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? 'Connecting...' : 'Login to Trade'}
          </button>
        </div>
      )}

      {isLoggedIn && userPredictions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {userPredictions.map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl p-6 border transition-all duration-300 ${
                theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
              <h3 className="font-bold text-xl mb-4">{p.title}</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold">Yes</span>
                    <span className={`font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                      {p.yes}%
                    </span>
                  </div>
                  <div className={`h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className="h-full bg-green-500" style={{ width: `${p.yes}%` }}/>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold">No</span>
                    <span className={`font-bold ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                      {p.no}%
                    </span>
                  </div>
                  <div className={`h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div className="h-full bg-red-500" style={{ width: `${p.no}%` }}/>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg border-2 mb-6 ${
                theme === 'dark' ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50/50 border-gray-200'
              }`}>
                <div className={`flex justify-between text-sm mb-2 pb-2 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <span className="opacity-70">Total Amount Traded:</span>
                  <span className="font-semibold">${p.totalAmountTraded.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2 font-bold">
                  <span className="opacity-70">Payout (Yes):</span>
                  <span className={theme === 'dark' ? 'text-green-400' : 'text-green-600'}>
                    ${p.totalPayoutIfYesWins.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1 font-bold">
                  <span className="opacity-70">Payout (No):</span>
                  <span className={theme === 'dark' ? 'text-red-400' : 'text-red-600'}>
                    ${p.totalPayoutIfNoWins.toFixed(2)}
                  </span>
                </div>
              </div>

              <h4 className={`font-bold mb-3 border-t pt-4 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                Your Trades ({p.myTrades.length})
              </h4>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2 simple-scrollbar">
                {p.myTrades.map((trade) => (
                  <div
                    key={trade.id}
                    className={`p-3 rounded-lg text-sm border ${theme === 'dark' ? 'bg-gray-900/70 border-gray-700' : 'bg-gray-100/70 border-gray-200'}`}>
                    <div className="flex justify-between font-semibold">
                      <span className={getSideColor(trade.side)}>{trade.side}</span>
                      <span className={`font-bold ${theme === 'dark' ? 'text-white/90' : 'text-gray-800/90'}`}>
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

              {p.winningSide && (
                <button
                  onClick={() => openClaim(p)}
                  className={`mt-6 w-full py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 border-2 ${
                    p.winningPayout && p.winningPayout > 0
                      ? (theme === 'dark' 
                          ? 'bg-green-500/10 border-green-500 text-green-400 hover:bg-green-500/20' 
                          : 'bg-green-500/10 border-green-500 text-green-600 hover:bg-green-500/20')
                      : (theme === 'dark' 
                          ? 'bg-red-500/10 border-red-500 text-red-400 hover:bg-red-500/20' 
                          : 'bg-red-500/10 border-red-500 text-red-600 hover:bg-red-500/20')
                  }`}>
                  {p.winningPayout && p.winningPayout > 0 ? 'Claim Winnings' : 'Clear Market (Loss)'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {claimModal.open && (
        <ClaimCard
          title={claimModal.title!}
          payoutUSD={claimModal.payout!}
          winPoints={claimModal.wp!}
          theme={theme}
          onClose={() => setClaimModal({ open: false, claimType: 'win' })}
          onClaim={confirmClaim}
          claimType={claimModal.claimType}
          predictionId={claimModal.predictionId!}
          totalAmountTraded={
            userPredictions.find((p) => p.id === claimModal.predictionId)?.totalAmountTraded || 0
          }
          winningSide={
            userPredictions.find((p) => p.id === claimModal.predictionId)?.winningSide || 'Yes'
          }
        />
      )}

      <footer className={`text-center py-10 mt-16 border-t ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
        <p className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>
          Mocawin © 2024 - A Mocaverse Product
        </p>
      </footer>
    </main>
  );
}
