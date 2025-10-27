// components/ClaimDetailCard.tsx
import { CheckCircle, XCircle, Calendar } from 'lucide-react';
import { ClaimHistory } from '../app/profile/page';

interface ClaimDetailCardProps {
  claim: ClaimHistory;
  theme: 'light' | 'dark';
  onClose: () => void;
}

export default function ClaimDetailCard({ claim, theme, onClose }: ClaimDetailCardProps) {
  const isWin = claim.claimType === 'win';

  const bgClass = theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-black';
  const innerBg = theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-100/70';
  const textColor = theme === 'dark' ? 'text-slate-300' : 'text-slate-700';
  const mutedTextColor = theme === 'dark' ? 'opacity-70' : 'text-slate-500';

  const iconColors = {
    green: theme === 'dark' ? 'text-green-400' : 'text-green-600',
    red: theme === 'dark' ? 'text-red-400' : 'text-red-600',
    yellow: theme === 'dark' ? 'text-yellow-400' : 'text-amber-600',
    purple: theme === 'dark' ? 'text-purple-400' : 'text-purple-600',
    slate: theme === 'dark' ? 'text-slate-500' : 'text-slate-400',
  };

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
          {isWin ? (
            <CheckCircle className={`w-6 h-6 ${iconColors.green}`} />
          ) : (
            <XCircle className={`w-6 h-6 ${iconColors.red}`} />
          )}
          <span
            className={`px-3 py-1 rounded-lg text-sm font-semibold ${
              isWin
                ? (theme === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-500/10 text-green-700')
                : (theme === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-500/10 text-red-700')
            }`}
          >
            {isWin ? 'WINNING CLAIM' : 'RESOLVED AS LOSS'}
          </span>
        </div>

        <p className={`mb-4 font-medium ${textColor}`}>{claim.title}</p>

        {/* Details */}
        <div className={`p-4 rounded-lg mb-4 space-y-3 ${innerBg}`}>
            <div className="flex justify-between">
              <span className={mutedTextColor}>Winning Side</span>
              <span
                className={`font-semibold ${
                  claim.winningSide === 'Yes' ? iconColors.green : iconColors.red
                }`}
              >
                {claim.winningSide}
              </span>
            </div>

            <div className="flex justify-between">
              <span className={mutedTextColor}>Amount Traded</span>
              <span className={`font-semibold ${textColor}`}>${claim.totalAmountTraded.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-lg font-semibold">
              <span className={textColor}>Payout (USD)</span>
              <span className={isWin ? iconColors.green : iconColors.slate}>
                ${claim.payoutUSD.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-lg font-semibold">
              <span className={textColor}>WinPoints</span>
              <span className={iconColors.yellow}>{claim.winPoints} WP</span>
            </div>

          {/* Air Kit Bonus */}
          <div className={`mt-4 p-4 rounded-xl bg-gradient-to-r border ${
            theme === 'dark'
            ? 'from-purple-600/20 via-pink-600/20 to-indigo-600/20 border-purple-500/50'
            : 'from-purple-600/10 via-pink-600/10 to-indigo-600/10 border-purple-500/30'
          }`}>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-xs">AK</span>
                </div>
              </div>
              <div className="flex-1">
                <p className={`text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r ${
                  theme === 'dark' ? 'from-purple-400 to-pink-400' : 'from-purple-600 to-pink-600'
                }`}>
                  Air Kit Bonus Applied
                </p>
                <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'opacity-80' : 'opacity-90'}`}>
                  +{Math.floor(claim.winPoints / 1.1 * 0.1)} WP extra earned
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Claimed At */}
        <div className={`flex items-center gap-2 text-sm mb-4 ${mutedTextColor}`}>
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
            theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          Close
        </button>
      </div>
    </div>
  );
}
