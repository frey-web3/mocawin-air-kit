// components/ClaimCard.tsx
"use client";

import { useState } from "react";

interface ClaimCardProps {
  title: string;
  payoutUSD: number;
  winPoints: number;
  theme: "light" | "dark";
  onClaim: () => void;
  onClose: () => void;
  // --- NEW: claimType prop ---
  claimType: 'win' | 'loss';
}

export default function ClaimCard({
  title,
  payoutUSD,
  winPoints,
  theme,
  onClaim,
  onClose,
  claimType, // Destructure new prop
}: ClaimCardProps) {
  const [processing, setProcessing] = useState(false);

  const handleConfirm = async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 600));
    onClaim();
    setProcessing(false);
    onClose();
  };

  const bg = theme === "dark" ? "bg-black border-white/10" : "bg-white border-black/10";
  const text = theme === "dark" ? "text-white" : "text-black";
  
  // --- NEW: Conditional styling and text ---
  const headerText = claimType === 'win' ? "Claim Your Winnings" : "Clear Resolved Market";
  const payoutColor = claimType === 'win' ? "text-green-500" : "text-gray-500/80";
  const buttonBg = claimType === 'win' 
    ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
    : "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700";
  const confirmText = claimType === 'win' ? "Confirm Claim" : "Confirm Clear";
  const payoutUSDText = claimType === 'win' ? `$${payoutUSD.toFixed(2)}` : `$0.00 (Loss)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${bg} ${text}`}>
        {/* Header (UPDATED) */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">{headerText}</h3>
          <button onClick={onClose} className="opacity-70 hover:opacity-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* NEW: Conditional description for loss */}
        {claimType === 'loss' && (
            <p className="mb-4 text-sm text-red-400/80 font-medium">
                You will not receive a payout, but you will still receive WinPoints for participating in the market.
            </p>
        )}

        <p className="mb-4">{title}</p>

        {/* Payout Summary (UPDATED) */}
        <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-white/5" : "bg-black/5"}`}>
          <div className="flex justify-between text-lg font-semibold">
            <span>Total Payout (USD)</span>
            <span className={payoutColor}>{payoutUSDText}</span>
          </div>

          <div className="mt-3 flex justify-between text-lg font-semibold">
            <span>WinPoints (WP)</span>
            <span className="text-yellow-500">{winPoints} WP</span>
          </div>

          {/* MVP FEATURE: AIR KIT BONUS – STAND OUT (UPDATED TEXT) */}
          <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-indigo-600/20 border border-purple-500/50 shadow-lg animate-pulse-slow">
            <div className="flex items-center gap-2.5">
              {/* Air Kit Logo Badge */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-xs">AK</span>
                </div>
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-50 blur-md animate-pulse"></div>
              </div>

              <div className="flex-1">
                <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  BONUS: +10% WP for using <span className="underline decoration-pink-400">Air Kit</span> login!
                </p>
                <p className="text-xs opacity-80 mt-0.5">
                  You earned <strong className="text-yellow-400">+{Math.floor(winPoints / 1.1 * 0.1)} WP</strong> extra
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons (UPDATED) */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={processing}
            className={`flex-1 py-2.5 rounded-lg font-medium transition-opacity ${
              theme === "dark" ? "bg-white/10 hover:bg-white/20" : "bg-black/10 hover:bg-black/20"
            }`}
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={processing}
            className={`flex-1 py-2.5 rounded-lg font-bold text-white transition-opacity relative overflow-hidden ${
              processing ? "opacity-50" : buttonBg
            }`}
          >
            <span className="relative z-10">{processing ? "Processing…" : confirmText}</span>
            {!processing && (
              <div className="absolute inset-0 bg-white/20 animate-ping"></div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}