// components/ClaimDetailCard.tsx
import { CheckCircle, XCircle, Calendar } from 'lucide-react';
import { ClaimHistory } from '../app/profile/page';

interface ClaimDetailCardProps {
  claim: ClaimHistory;
  theme: 'light' | 'dark';
  onClose: () => void;
}

export default function ClaimDetailCard({ claim, theme, onClose }: ClaimDetailCardProps) {
  const bgClass = theme === 'dark' ? 'bg-black border-white/10' : 'bg-white border-black/10';
  const innerBg = theme === 'dark' ? 'bg-white/5' : 'bg-black/5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${bgClass} border`}>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">Claim Details</h3>
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

        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-4">
          {claim.claimType === 'win' ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : (
            <XCircle className="w-6 h-6 text-red-500" />
          )}
          <span
            className={`px-3 py-1 rounded-lg text-sm font-semibold ${
              claim.claimType === 'win'
                ? 'bg-green-500/20 text-green-500'
                : 'bg-red-500/20 text-red-500'
            }`}
          >
            {claim.claimType === 'win' ? 'WINNING CLAIM' : 'RESOLVED AS LOSS'}
          </span>
        </div>

        <p className="mb-4 font-medium">{claim.title}</p>

        {/* Details */}
        <div className={`p-4 rounded-lg mb-4 ${innerBg}`}>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="opacity-70">Winning Side</span>
              <span
                className={`font-semibold ${
                  claim.winningSide === 'Yes' ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {claim.winningSide}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="opacity-70">Amount Traded</span>
              <span className="font-semibold">${claim.totalAmountTraded.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-lg font-semibold border-t pt-3">
              <span>Payout (USD)</span>
              <span className={claim.claimType === 'win' ? 'text-green-500' : 'text-gray-500'}>
                ${claim.payoutUSD.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-lg font-semibold">
              <span>WinPoints</span>
              <span className="text-yellow-500">{claim.winPoints} WP</span>
            </div>
          </div>

          {/* Air Kit Bonus */}
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-indigo-600/20 border border-purple-500/50">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-xs">AK</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Air Kit Bonus Applied
                </p>
                <p className="text-xs opacity-80 mt-0.5">
                  +{Math.floor(claim.winPoints / 1.1 * 0.1)} WP extra earned
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Claimed At */}
        <div className="flex items-center gap-2 text-sm opacity-70 mb-4">
          <Calendar className="w-4 h-4" />
          <span>
            Claimed on{' '}
            {new Date(claim.claimedAt).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`w-full py-2.5 rounded-lg font-medium transition-colors ${
            theme === 'dark' ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'
          }`}
        >
          Close
        </button>
      </div>
    </div>
  );
}