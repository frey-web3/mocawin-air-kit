// ../components/TradeCard.tsx
import { useState, useMemo } from "react";

// Define the type for the prediction data (copied from page.tsx for local use)
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
  theme: "light" | "dark";
  // ADDED: Props passed from page.tsx to resolve the error
  isLoggedIn: boolean;
  handleLogin: () => Promise<void>; 
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

// Updated the component destructuring to include the new props
const TradeCard: React.FC<TradeCardProps> = ({ 
    prediction, 
    onClose, 
    theme, 
    isLoggedIn, // Included in destructuring
    handleLogin // Included in destructuring
}) => {
  const [tradeAmount, setTradeAmount] = useState<string>("");
  const [tradeSide, setTradeSide] = useState<"Yes" | "No">("Yes");
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper to determine text and background colors based on theme
  const cardBgClass = theme === "dark" 
    ? "bg-black border border-white/10 text-white" 
    : "bg-white border border-black/10 text-black";
  
  const inputClass = theme === "dark" 
    ? "bg-white/10 border border-white/20 text-white" 
    : "bg-black/5 border border-black/20 text-black";

  const buttonClass = tradeSide === 'Yes' 
    ? "bg-green-600 hover:bg-green-700" 
    : "bg-red-600 hover:bg-red-700";

  const currentPrice = tradeSide === 'Yes' ? prediction.yes : prediction.no;
  
  // 💡 UPDATED: Calculate both Payout and Profit
  const { estimatedPayout, estimatedProfit } = useMemo(() => {
    const amount = parseFloat(tradeAmount);
    // Return default values if the amount is invalid
    if (isNaN(amount) || amount <= 0) return { estimatedPayout: "0.00", estimatedProfit: "0.00" }; 

    // Payout = Amount * (100 / currentPrice)
    const payout = amount * (100 / currentPrice);
    const profit = payout - amount; // Calculate profit (Payout - Amount Traded)
    
    return {
        estimatedPayout: payout.toFixed(2),
        estimatedProfit: profit.toFixed(2), 
    };
  }, [tradeAmount, currentPrice]);


  /* -------------------------------------------------
     Trade Logic: Save to Local Storage
     ------------------------------------------------- */
  const handleConfirmTrade = () => {
    const amount = parseFloat(tradeAmount);

    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid trade amount.");
      return;
    }
    
    // Check if the user is logged in before proceeding to trade
    if (!isLoggedIn) {
        handleLogin();
        return; 
    }

    setIsProcessing(true);

    try {
      // 1. Get existing trades from localStorage
      const existingTrades: SavedTrade[] = JSON.parse(localStorage.getItem('myTrades') || '[]');
      
      // 2. Create the new trade object
      const newTrade: SavedTrade = {
        id: Date.now(), // Unique ID
        predictionId: prediction.id,
        title: prediction.title,
        amount,
        side: tradeSide,
        date: new Date().toISOString(),
      };

      // 3. Save the updated array back to localStorage
      localStorage.setItem('myTrades', JSON.stringify([...existingTrades, newTrade]));
      
      alert(`Successfully placed a ${tradeSide} trade for $${amount}!`);
      onClose(); // Close the modal
    } catch (e) {
      console.error("Failed to save trade to local storage:", e);
      alert("Error saving trade locally.");
    } finally {
      setIsProcessing(false);
    }
  };

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

        <h4 className="text-lg font-semibold mb-4 border-b pb-2">{prediction.title}</h4>

        {/* Trade Side Selector */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setTradeSide("Yes")}
            className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
              tradeSide === "Yes" ? "bg-green-500 text-white" : `${inputClass} opacity-80`
            }`}
          >
            Buy YES ({prediction.yes}%)
          </button>
          <button
            onClick={() => setTradeSide("No")}
            className={`flex-1 py-3 rounded-xl font-bold transition-colors ${
              tradeSide === "No" ? "bg-red-500 text-white" : `${inputClass} opacity-80`
            }`}
          >
            Buy NO ({prediction.no}%)
          </button>
        </div>

        {/* Amount Input */}
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
        
        {/* Summary */}
        <div className="space-y-2 mb-6 p-4 rounded-lg bg-opacity-5" style={{backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}}>
            <div className="flex justify-between text-sm">
                <span>Selected Side:</span>
                <span className={`font-semibold ${tradeSide === 'Yes' ? 'text-green-500' : 'text-red-500'}`}>{tradeSide}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span>Current Price:</span>
                <span className="font-semibold">{currentPrice}%</span>
            </div>
            {/* 💡 NEW: Estimated Profit Row */}
            <div className="flex justify-between text-sm">
                <span>Est. Potential Profit:</span>
                <span className={`font-semibold ${parseFloat(estimatedProfit) > 0 ? 'text-green-500' : ''}`}>{estimatedProfit} USD</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t border-opacity-20">
                {/* Changed label for clarity */}
                <span>Est. Total Payout:</span>
                <span>{estimatedPayout} USD</span>
            </div>
        </div>


        {/* Confirm Button */}
        <button
          onClick={isLoggedIn ? handleConfirmTrade : handleLogin} // Conditional action based on login state
          disabled={isProcessing || (!isLoggedIn && false) || (!isLoggedIn && true) ? false : !tradeAmount || parseFloat(tradeAmount) <= 0}
          className={`w-full py-3 rounded-xl font-bold text-white transition-opacity ${
            isProcessing || (!isLoggedIn && false) || (!isLoggedIn && true) ? 'opacity-50 cursor-not-allowed' : buttonClass
          }`}
        >
          {isLoggedIn 
            ? (isProcessing ? "Processing..." : `Confirm Buy ${tradeSide}`)
            : "Login to Trade"
          }
        </button>
      </div>
    </div>
  );
};

export default TradeCard;