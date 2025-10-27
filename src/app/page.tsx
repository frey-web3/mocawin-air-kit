'use client';

import { useState } from 'react';
import TradeCard from '../components/TradeCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface Prediction {
  id: number;
  title: string;
  yes: number;
  no: number;
  volume: string;
}

const banners = [
  {
    id: 1,
    title: 'Welcome to the Future of Prediction',
    dark_bg: 'bg-gradient-to-r from-gray-900 to-gray-800',
    light_bg: 'bg-gradient-to-r from-gray-200 to-gray-100',
    dark_text: 'text-white',
    light_text: 'text-gray-900',
  },
  {
    id: 2,
    title: 'Trade on Real-World Events',
    dark_bg: 'bg-gradient-to-r from-indigo-900 to-indigo-800',
    light_bg: 'bg-gradient-to-r from-indigo-200 to-indigo-100',
    dark_text: 'text-white',
    light_text: 'text-indigo-900',
  },
  {
    id: 3,
    title: 'Earn Crypto with Your Insights',
    dark_bg: 'bg-gradient-to-r from-purple-900 to-purple-800',
    light_bg: 'bg-gradient-to-r from-purple-200 to-purple-100',
    dark_text: 'text-white',
    light_text: 'text-purple-900',
  },
  {
    id: 4,
    title: 'Join a Global Community of Traders',
    dark_bg: 'bg-gradient-to-r from-red-900 to-red-800',
    light_bg: 'bg-gradient-to-r from-red-200 to-red-100',
    dark_text: 'text-white',
    light_text: 'text-red-900',
  },
];

const predictions: Prediction[] = [
  {
    id: 1,
    title: 'Will Bitcoin surpass $150k by year-end?',
    yes: 70,
    no: 30,
    volume: '2.5M',
  },
  {
    id: 2,
    title: 'Will AI achieve general intelligence by 2030?',
    yes: 40,
    no: 60,
    volume: '1.8M',
  },
  {
    id: 3,
    title: "Will Tesla's stock price double in the next 5 years?",
    yes: 55,
    no: 45,
    volume: '3.2M',
  },
  {
    id: 4,
    title: 'Who will win the next FIFA World Cup?',
    yes: 60,
    no: 40,
    volume: '4.1M',
  },
  {
    id: 5,
    title: 'Will Ethereum transition to Proof-of-Stake successfully?',
    yes: 80,
    no: 20,
    volume: '2.9M',
  },
  {
    id: 6,
    title: 'Will humanity establish a permanent base on Mars by 2040?',
    yes: 25,
    no: 75,
    volume: '1.2M',
  },
  {
    id: 7,
    title: 'Who will win the next US Presidential Election?',
    yes: 52,
    no: 48,
    volume: '6.3M',
  },
  {
    id: 8,
    title: 'Will global climate goals be met by 2050?',
    yes: 35,
    no: 65,
    volume: '2.1M',
  },
  {
    id: 9,
    title: 'Will a new tech IPO achieve a $1 trillion valuation?',
    yes: 48,
    no: 52,
    volume: '1.5M',
  },
];

export default function PredictionMarket() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [isTradeCardOpen, setIsTradeCardOpen] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(
    null
  );
  const { isLoggedIn, handleLogin, theme } = useAppContext();

  const handleTradeButtonClick = (prediction: Prediction) => {
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

  const nextBanner = () => setCurrentBanner((i) => (i + 1) % banners.length);
  const prevBanner = () =>
    setCurrentBanner((i) => (i - 1 + banners.length) % banners.length);

  return (
    <main className="py-8 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="relative mb-16 rounded-3xl overflow-hidden h-80 sm:h-96">
        {banners.map((b, i) => (
          <div
            key={b.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === currentBanner ? 'opacity-100' : 'opacity-0'
            } ${theme === 'dark' ? b.dark_bg : b.light_bg} flex items-center justify-center`}
          >
            <h2 className={`text-4xl sm:text-6xl font-extrabold text-center px-4 tracking-tight ${
              theme === 'dark' ? b.dark_text : b.light_text
            }`}>
              {b.title}
            </h2>
          </div>
        ))}

        <button
          onClick={prevBanner}
          className={`absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-3 backdrop-blur-sm transition-all ${
            theme === 'dark' ? 'bg-black/30 hover:bg-black/50' : 'bg-white/30 hover:bg-white/50'
          }`}>
          <ChevronLeft className={`w-8 h-8 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`} />
        </button>

        <button
          onClick={nextBanner}
          className={`absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-3 backdrop-blur-sm transition-all ${
            theme === 'dark' ? 'bg-black/30 hover:bg-black/50' : 'bg-white/30 hover:bg-white/50'
          }`}>
          <ChevronRight className={`w-8 h-8 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`} />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentBanner(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                i === currentBanner
                  ? `${theme === 'dark' ? 'bg-white' : 'bg-gray-800'} scale-125`
                  : `${theme === 'dark' ? 'bg-white/60' : 'bg-gray-800/60'}`
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
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
            <h3 className={`font-bold text-xl mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {p.title}
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    Yes
                  </span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                    {p.yes}%
                  </span>
                </div>
                <div className={`h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-full bg-green-500 transition-all duration-1000"
                    style={{ width: `${p.yes}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    No
                  </span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                    {p.no}%
                  </span>
                </div>
                <div className={`h-3 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-full bg-red-500 transition-all duration-1000"
                    style={{ width: `${p.no}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className={`text-sm ${theme === 'dark' ? 'opacity-70' : 'opacity-80'}`}>
                Volume: {p.volume}
              </span>
              <button
                onClick={() => handleTradeButtonClick(p)}
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
