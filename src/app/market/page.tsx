'use client';

import { useState } from 'react';
import TradeCard from '../../components/TradeCard';
import { Zap } from 'lucide-react';
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

export default function MarketPage() {
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(
    null
  );
  const [isTradeCardOpen, setIsTradeCardOpen] = useState(false);
  const { theme, isLoggedIn, handleLogin } = useAppContext();

  const openTradeCard = (prediction: Prediction) => {
    if (isLoggedIn) {
      setSelectedPrediction(prediction);
      setIsTradeCardOpen(true);
    } else {
      handleLogin();
    }
  };

  const closeTradeCard = () => {
    setIsTradeCardOpen(false);
    setSelectedPrediction(null);
  };

  return (
    <main className="py-8 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
          Market Overview
        </h1>
        <p className={`max-w-2xl mx-auto ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
          Explore all active markets. Place your trade and predict the future outcome.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {predictions.map((p) => (
          <div
            key={p.id}
            className={`rounded-2xl p-6 border transition-all duration-300 ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700 hover:border-indigo-500'
                : 'bg-white border-gray-200 hover:border-indigo-400'
            }`}>
            <h3 className="font-bold text-xl mb-4">{p.title}</h3>

            <div className="space-y-4 mb-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold">Yes</span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>{p.yes}%</span>
                </div>
                <div className={`h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${p.yes}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold">No</span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>{p.no}%</span>
                </div>
                <div className={`h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${p.no}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className={`text-sm flex items-center ${theme === 'dark' ? 'opacity-70' : 'opacity-80'}`}>
                <Zap className={`w-4 h-4 mr-1.5 ${theme === 'dark' ? 'text-yellow-400' : 'text-amber-500'}`} />
                Volume: {p.volume}
              </span>
              <button
                onClick={() => openTradeCard(p)}
                className="px-6 py-2 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all duration-300 transform hover:scale-105"
              >
                Trade Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {isTradeCardOpen && selectedPrediction && (
        <TradeCard
          prediction={selectedPrediction}
          onClose={closeTradeCard}
        />
      )}
    </main>
  );
}
