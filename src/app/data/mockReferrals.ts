/**
 * Mock Referral Data
 * Sample referral data for demonstration
 */

import { ReferralRecord } from '../utils/referral';

export const mockReferralRecords: ReferralRecord[] = [
  {
    id: 'ref_001',
    referredUserId: 'user_001',
    referredUserName: 'Sarah Chen',
    referredUserEmail: 'sarah.chen@example.com',
    status: 'completed',
    signupDate: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
    completionDate: Date.now() - 10 * 24 * 60 * 60 * 1000, // 10 days ago
    xpEarned: 600, // 100 signup + 200 active + 300 completion
    xpClaimed: true,
  },
  {
    id: 'ref_002',
    referredUserId: 'user_002',
    referredUserName: 'Michael Rodriguez',
    referredUserEmail: 'm.rodriguez@example.com',
    status: 'active',
    signupDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    xpEarned: 300, // 100 signup + 200 active
    xpClaimed: false,
  },
  {
    id: 'ref_003',
    referredUserId: 'user_003',
    referredUserName: 'Emma Thompson',
    referredUserEmail: 'emma.t@example.com',
    status: 'active',
    signupDate: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
    xpEarned: 300, // 100 signup + 200 active
    xpClaimed: false,
  },
  {
    id: 'ref_004',
    referredUserId: 'user_004',
    referredUserName: 'David Kim',
    referredUserEmail: 'david.kim@example.com',
    status: 'pending',
    signupDate: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    xpEarned: 0, // Just signed up
    xpClaimed: false,
  },
  {
    id: 'ref_005',
    referredUserId: 'user_005',
    referredUserName: 'Jessica Martinez',
    referredUserEmail: 'jessica.m@example.com',
    status: 'completed',
    signupDate: Date.now() - 20 * 24 * 60 * 60 * 1000, // 20 days ago
    completionDate: Date.now() - 18 * 24 * 60 * 60 * 1000, // 18 days ago
    xpEarned: 600,
    xpClaimed: true,
  },
];

export const mockReferralStats = {
  totalReferrals: 5,
  activeReferrals: 3,
  completedReferrals: 2,
  pendingReferrals: 1,
  totalXPEarned: 1200,
  pendingXP: 600,
  claimedXP: 600,
};
