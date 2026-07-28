/**
 * Referral System Utility
 * Handles referral link generation, tracking, and XP rewards
 */

import { SecureStorage } from './secureStorage';

export interface ReferralConfig {
  enabled: boolean;
  signupReward: number; // XP for referee signup
  referrerReward: number; // XP for referrer when referee signs up
  completionReward: number; // Additional XP when referee completes onboarding
  maxReferrals: number; // Max referrals per user (0 = unlimited)
  expiryDays: number; // Days until referral link expires (0 = never)
}

export interface ReferralData {
  userId: string;
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  activeReferrals: number;
  pendingXP: number;
  earnedXP: number;
  referrals: ReferralRecord[];
  createdAt: number;
}

export interface ReferralRecord {
  id: string;
  referredUserId: string;
  referredUserName: string;
  referredUserEmail: string;
  status: 'pending' | 'active' | 'completed';
  signupDate: number;
  completionDate?: number;
  xpEarned: number;
  xpClaimed: boolean;
}

export interface ClaimableXP {
  totalPending: number;
  claims: XPClaim[];
}

export interface XPClaim {
  id: string;
  referralId: string;
  userName: string;
  amount: number;
  reason: string;
  date: number;
}

export class ReferralService {
  private static CONFIG_KEY = 'referral_config';
  private static REFERRAL_KEY_PREFIX = 'user_referral_';
  private static CLAIMS_KEY_PREFIX = 'user_claims_';

  /**
   * Get referral configuration
   */
  static getConfig(): ReferralConfig {
    const config = SecureStorage.get<ReferralConfig>(this.CONFIG_KEY);
    if (config) return config;

    // Default configuration
    const defaultConfig: ReferralConfig = {
      enabled: true,
      signupReward: 100,
      referrerReward: 200,
      completionReward: 300,
      maxReferrals: 0, // Unlimited
      expiryDays: 0, // Never expires
    };

    SecureStorage.set(this.CONFIG_KEY, defaultConfig);
    return defaultConfig;
  }

  /**
   * Update referral configuration (admin only)
   */
  static updateConfig(config: Partial<ReferralConfig>): void {
    const currentConfig = this.getConfig();
    const updatedConfig = { ...currentConfig, ...config };
    SecureStorage.set(this.CONFIG_KEY, updatedConfig);
  }

  /**
   * Generate referral code for user
   */
  static generateReferralCode(userId: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `${timestamp}${random}`;
  }

  /**
   * Get user referral data
   */
  static getUserReferralData(userId: string): ReferralData {
    const key = this.REFERRAL_KEY_PREFIX + userId;
    const data = SecureStorage.get<ReferralData>(key);
    
    if (data) return data;

    // Create new referral data
    const referralCode = this.generateReferralCode(userId);
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://cryplounge.com';
    
    const newData: ReferralData = {
      userId,
      referralCode,
      referralLink: `${baseUrl}/signup?ref=${referralCode}`,
      totalReferrals: 0,
      activeReferrals: 0,
      pendingXP: 0,
      earnedXP: 0,
      referrals: [],
      createdAt: Date.now(),
    };

    SecureStorage.set(key, newData);
    return newData;
  }

  /**
   * Add a referral (when someone signs up with referral code)
   */
  static addReferral(
    referrerUserId: string,
    referredUserId: string,
    referredUserName: string,
    referredUserEmail: string
  ): ReferralRecord {
    const data = this.getUserReferralData(referrerUserId);
    const config = this.getConfig();

    const newReferral: ReferralRecord = {
      id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      referredUserId,
      referredUserName,
      referredUserEmail,
      status: 'pending',
      signupDate: Date.now(),
      xpEarned: 0,
      xpClaimed: false,
    };

    data.referrals.push(newReferral);
    data.totalReferrals++;
    data.pendingXP += config.signupReward;

    const key = this.REFERRAL_KEY_PREFIX + referrerUserId;
    SecureStorage.set(key, data);

    return newReferral;
  }

  /**
   * Update referral status
   */
  static updateReferralStatus(
    referrerUserId: string,
    referralId: string,
    status: ReferralRecord['status']
  ): void {
    const data = this.getUserReferralData(referrerUserId);
    const config = this.getConfig();
    const referral = data.referrals.find(r => r.id === referralId);

    if (!referral) return;

    const oldStatus = referral.status;
    referral.status = status;

    // Update counters and XP based on status change
    if (status === 'active' && oldStatus === 'pending') {
      data.activeReferrals++;
      referral.xpEarned += config.referrerReward;
      data.pendingXP += config.referrerReward;
    }

    if (status === 'completed' && oldStatus === 'active') {
      referral.completionDate = Date.now();
      referral.xpEarned += config.completionReward;
      data.pendingXP += config.completionReward;
    }

    const key = this.REFERRAL_KEY_PREFIX + referrerUserId;
    SecureStorage.set(key, data);
  }

  /**
   * Get claimable XP for user
   */
  static getClaimableXP(userId: string): ClaimableXP {
    const data = this.getUserReferralData(userId);
    
    const claims: XPClaim[] = data.referrals
      .filter(r => !r.xpClaimed && r.xpEarned > 0)
      .map(r => ({
        id: r.id,
        referralId: r.id,
        userName: r.referredUserName,
        amount: r.xpEarned,
        reason: this.getClaimReason(r.status),
        date: r.completionDate || r.signupDate,
      }));

    return {
      totalPending: data.pendingXP,
      claims,
    };
  }

  /**
   * Claim XP from referrals
   */
  static claimXP(userId: string, claimIds?: string[]): number {
    const data = this.getUserReferralData(userId);
    let totalClaimed = 0;

    data.referrals.forEach(referral => {
      // If specific claims specified, only claim those
      if (claimIds && !claimIds.includes(referral.id)) return;
      
      if (!referral.xpClaimed && referral.xpEarned > 0) {
        totalClaimed += referral.xpEarned;
        referral.xpClaimed = true;
      }
    });

    data.earnedXP += totalClaimed;
    data.pendingXP -= totalClaimed;

    const key = this.REFERRAL_KEY_PREFIX + userId;
    SecureStorage.set(key, data);

    return totalClaimed;
  }

  /**
   * Get referral stats for admin
   */
  static getAllReferralStats(): {
    totalUsers: number;
    totalReferrals: number;
    activeReferrals: number;
    completedReferrals: number;
    totalXPAwarded: number;
    pendingXP: number;
    topReferrers: Array<{ userId: string; referralCount: number }>;
  } {
    // Get all referral data from storage
    const allData: ReferralData[] = [];
    
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.REFERRAL_KEY_PREFIX)) {
          const data = SecureStorage.get<ReferralData>(key);
          if (data) allData.push(data);
        }
      }
    }

    const stats = {
      totalUsers: allData.length,
      totalReferrals: 0,
      activeReferrals: 0,
      completedReferrals: 0,
      totalXPAwarded: 0,
      pendingXP: 0,
      topReferrers: [] as Array<{ userId: string; referralCount: number }>,
    };

    allData.forEach(data => {
      stats.totalReferrals += data.totalReferrals;
      stats.activeReferrals += data.activeReferrals;
      stats.totalXPAwarded += data.earnedXP;
      stats.pendingXP += data.pendingXP;
      
      data.referrals.forEach(ref => {
        if (ref.status === 'completed') stats.completedReferrals++;
      });
    });

    // Get top referrers
    stats.topReferrers = allData
      .map(data => ({ userId: data.userId, referralCount: data.totalReferrals }))
      .sort((a, b) => b.referralCount - a.referralCount)
      .slice(0, 10);

    return stats;
  }

  /**
   * Get claim reason text
   */
  private static getClaimReason(status: ReferralRecord['status']): string {
    switch (status) {
      case 'pending':
        return 'Friend signed up';
      case 'active':
        return 'Friend became active';
      case 'completed':
        return 'Friend completed onboarding';
      default:
        return 'Referral reward';
    }
  }

  /**
   * Validate referral code
   */
  static validateReferralCode(code: string): { valid: boolean; userId?: string } {
    if (!code || code.length < 6) {
      return { valid: false };
    }

    // Find user with this referral code
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.REFERRAL_KEY_PREFIX)) {
          const data = SecureStorage.get<ReferralData>(key);
          if (data?.referralCode === code) {
            return { valid: true, userId: data.userId };
          }
        }
      }
    }

    return { valid: false };
  }

  /**
   * Copy referral link to clipboard
   */
  static async copyReferralLink(link: string): Promise<boolean> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(link);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = link;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      return false;
    }
  }

  /**
   * Generate share URLs
   */
  static getShareUrls(referralLink: string, userName: string = 'CrypLounge'): {
    twitter: string;
    facebook: string;
    linkedin: string;
    whatsapp: string;
    telegram: string;
    email: string;
  } {
    const message = encodeURIComponent(`Join me on ${userName}! 🚀 Learn about crypto, earn XP, and connect with the community.`);
    const url = encodeURIComponent(referralLink);

    return {
      twitter: `https://twitter.com/intent/tweet?text=${message}&url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${message}%20${url}`,
      telegram: `https://t.me/share/url?url=${url}&text=${message}`,
      email: `mailto:?subject=${encodeURIComponent('Join me on CrypLounge!')}&body=${message}%20${url}`,
    };
  }
}
