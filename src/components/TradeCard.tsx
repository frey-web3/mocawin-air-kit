'use client';

import { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';

// Define the type for the prediction data
interface Prediction {
  id: number;
  title: string;
  yes: number;
  no: number;
  volume: string;
}

interface TradeCardProps {
  prediction: Prediction;
  onClose: () => void;
}

// Define the type for a saved trade
interface SavedTrade {
  id: number;
  predictionId: number;
  title: string;
  amount: number;
  side: 'Yes' | 'No';
  date: string;
}

const TradeCard: React.FC<TradeCardProps> = ({ prediction, onClose }) => {
  const { theme } = useAppContext();

  const [tradeAmount, setTradeAmount] = useState<string>('');
  const [tradeSide, setTradeSide] = useState<'Yes' | 'No'>('Yes');
  const [isProcessing, setIsProcessing] = useState(false);

  const cardBgClass = theme === 'dark' 
    ? 'bg-gray-800 border border-gray-700 text-white' 
    : 'bg-white border border-black/10 text-black';
  
  const inputClass = theme === 'dark' 
    ? 'bg-gray-700 border border-gray-600 text-white' 
    : 'bg-black/5 border border-black/20 text-black';

  const buttonClass = tradeSide === 'Yes' 
    ? 'bg-green-600 hover:bg-green-700' 
    : 'bg-red-600 hover:bg-red-700';

  const currentPrice = tradeSide === 'Yes' ? prediction.yes : prediction.no;
  
  const { estimatedPayout, estimatedProfit } = useMemo(() => {
    const amount = parseFloat(tradeAmount);
    if (isNaN(amount) || amount <= 0) return { estimatedPayout: '0.00', estimatedProfit: '0.00' };

    const payout = amount * (100 / currentPrice);
    const profit = payout - amount;
    
    return {
        estimatedPayout: payout.toFixed(2),
        estimatedProfit: profit.toFixed(2), 
    };
  }, [tradeAmount, currentPrice]);

  const handleConfirmTrade = () => {
    const amount = parseFloat(tradeAmount);

    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid trade amount.');
      return;
    }

    setIsProcessing(true);

    try {
      const existingTrades: SavedTrade[] = JSON.parse(localStorage.getItem('myTrades') || '[]');
      
      const newTrade: SavedTrade = {
        id: Date.now(),
        predictionId: prediction.id,
        title: prediction.title,
        amount,
        side: tradeSide,
        date: new Date().toISOString(),
      };

      localStorage.setItem('myTrades', JSON.stringify([...existingTrades, newTrade]));
      
      alert(`Successfully placed a ${tradeSide} trade for $${amount}!`);
      onClose();
    } catch (e) {
      console.error('Failed to save trade to local storage:', e);
      alert('Error saving trade locally.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isButtonDisabled = isProcessing || !tradeAmount || parseFloat(tradeAmount) <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl transition-all transform ${cardBgClass}`}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">Place Trade</h3>
          <button onClick={onClose} className="text-opacity-70 hover:text-opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <h4 className="text-lg font-semibold mb-4 pb-2">{prediction.title}</h4>

        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setTradeSide('Yes')}
            className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
              tradeSide === 'Yes' ? 'bg-green-500 text-white' : `${inputClass} opacity-80`
            }`}
          >
            Buy YES ({prediction.yes}%)
          </button>
          <button
            onClick={() => setTradeSide('No')}
            className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
              tradeSide === 'No' ? 'bg-red-500 text-white' : `${inputClass} opacity-80`
            }`}
          >
            Buy NO ({prediction.no}%)
          </button>
        </div>

        <div className="mb-6">
          <label htmlFor="amount" className="block text-sm font-medium mb-2">
            Amount to Trade (USD)
          </label>
          <input
            id="amount"
            type="number"
            value={tradeAmount}
            onChange={(e) => setTradeAmount(e.target.value)}
            placeholder="e.g., 100"
            min="1"
            className={`w-full p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${inputClass}`}
          />
        </div>
        
        {/* Trade Summary Section */}
        <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
                <span className="opacity-70">Selected Side:</span>
                <span className={`font-semibold ${
                    tradeSide === 'Yes' 
                    ? (theme === 'dark' ? 'text-green-400' : 'text-green-600') 
                    : (theme === 'dark' ? 'text-red-400' : 'text-red-600')
                }`}>{tradeSide}</span>
            </div>
            <div className="flex justify-between text-sm font-bold">
                <span className="opacity-70">Est. Potential Profit:</span>
                <span className={`font-semibold ${
                    parseFloat(estimatedProfit) > 0 
                    ? (theme === 'dark' ? 'text-green-400' : 'text-green-600') 
                    : ''
                }`}>{estimatedProfit} USD</span>
            </div>
            <div className="flex justify-between text-sm font-bold">
                <span className="opacity-70">Est. Total Payout:</span>
                <span>{estimatedPayout} USD</span>
            </div>
        </div>

        <button
          onClick={handleConfirmTrade}
          disabled={isButtonDisabled}
          className={`w-full py-3 rounded-xl font-bold text-white transition-opacity ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : buttonClass}`}
        >
          {isProcessing ? 'Processing...' : `Confirm Buy ${tradeSide}`}
        </button>
      </div>
    </div>
  );
};

export default TradeCard;
