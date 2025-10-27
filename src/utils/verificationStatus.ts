// src/utils/verificationStatus.ts
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Ban,
  HelpCircle,
  LucideIcon 
} from 'lucide-react';

export type VerificationStatus = 
  | 'Compliant'
  | 'Revoked'
  | 'Expired'
  | 'Pending'
  | 'Failed'
  | 'Rejected'
  | 'Processing'
  | 'Unknown';

interface StatusConfig {
  color: string;
  bgColor: string;
  icon: LucideIcon;
  emoji: string;
  description: string;
  label: string;
}

const statusConfigs: Record<VerificationStatus, StatusConfig> = {
  Compliant: {
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-500/10',
    icon: CheckCircle,
    emoji: '✅',
    description: 'The credential is valid and compliant with all requirements.',
    label: 'Verified'
  },
  Revoked: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-500/10',
    icon: Ban,
    emoji: '🚫',
    description: 'The credential has been revoked and is no longer valid.',
    label: 'Revoked'
  },
  Expired: {
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-500/10',
    icon: Clock,
    emoji: '⏰',
    description: 'The credential has expired and needs to be renewed.',
    label: 'Expired'
  },
  Pending: {
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    icon: Clock,
    emoji: '⏳',
    description: 'Verification is in progress. Please complete the verification process.',
    label: 'Pending'
  },
  Processing: {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
    icon: Clock,
    emoji: '🔄',
    description: 'Your verification request is being processed.',
    label: 'Processing'
  },
  Failed: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-500/10',
    icon: XCircle,
    emoji: '❌',
    description: 'Verification failed. Please try again or contact support.',
    label: 'Failed'
  },
  Rejected: {
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-500/10',
    icon: XCircle,
    emoji: '🚫',
    description: 'The verification request was rejected. Credentials do not meet requirements.',
    label: 'Rejected'
  },
  Unknown: {
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-500/10',
    icon: HelpCircle,
    emoji: '❓',
    description: 'Verification status is unknown. Please try again.',
    label: 'Unknown'
  }
};

export function getStatusColor(status: string): string {
  const normalizedStatus = normalizeStatus(status);
  return statusConfigs[normalizedStatus]?.color || statusConfigs.Unknown.color;
}

export function getStatusBgColor(status: string): string {
  const normalizedStatus = normalizeStatus(status);
  return statusConfigs[normalizedStatus]?.bgColor || statusConfigs.Unknown.bgColor;
}

export function getStatusIcon(status: string): LucideIcon {
  const normalizedStatus = normalizeStatus(status);
  return statusConfigs[normalizedStatus]?.icon || statusConfigs.Unknown.icon;
}

export function getStatusEmoji(status: string): string {
  const normalizedStatus = normalizeStatus(status);
  return statusConfigs[normalizedStatus]?.emoji || statusConfigs.Unknown.emoji;
}

export function getStatusDescription(status: string): string {
  const normalizedStatus = normalizeStatus(status);
  return statusConfigs[normalizedStatus]?.description || statusConfigs.Unknown.description;
}

export function getStatusLabel(status: string): string {
  const normalizedStatus = normalizeStatus(status);
  return statusConfigs[normalizedStatus]?.label || status;
}

export function isVerified(status: string): boolean {
  return normalizeStatus(status) === 'Compliant';
}

export function isVerificationPending(status: string): boolean {
  const normalized = normalizeStatus(status);
  return normalized === 'Pending' || normalized === 'Processing';
}

export function isVerificationFailed(status: string): boolean {
  const normalized = normalizeStatus(status);
  return normalized === 'Failed' || normalized === 'Rejected' || 
         normalized === 'Revoked' || normalized === 'Expired';
}

// Helper to normalize status strings (case-insensitive matching)
function normalizeStatus(status: string): VerificationStatus {
  const lowerStatus = status.toLowerCase();
  
  const statusMap: Record<string, VerificationStatus> = {
    'compliant': 'Compliant',
    'verified': 'Compliant',
    'valid': 'Compliant',
    'success': 'Compliant',
    'completed': 'Compliant',
    'revoked': 'Revoked',
    'expired': 'Expired',
    'pending': 'Pending',
    'processing': 'Processing',
    'in_progress': 'Processing',
    'failed': 'Failed',
    'rejected': 'Rejected',
    'denied': 'Rejected',
  };
  
  return statusMap[lowerStatus] || 'Unknown';
}