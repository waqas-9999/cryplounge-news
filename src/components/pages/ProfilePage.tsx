'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useXP } from '@/contexts/XPContext';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { User, Mail, Calendar, Award, BookOpen, Newspaper, Star, TrendingUp, Edit2, Lock, Bell, Trash2, CheckCircle, Users, Copy, Share2, Gift, Sparkles, Twitter, Facebook, Linkedin, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { ReferralService, ReferralData, ClaimableXP } from '@/utils/referral';

interface ProfilePageProps {
  images: any;
  onNavigate: (page: string) => void;
}

export function ProfilePage({ images, onNavigate }: ProfilePageProps) {
  const { user, updateProfile, logout, changePassword } = useAuth();
  const { totalXP, level, achievements, getCompletedCoursesCount, getCompletedLessonsCount, dailyStreak, earnXP } = useXP();
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'settings' | 'referrals'>('overview');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Referral states
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [claimableXP, setClaimableXP] = useState<ClaimableXP | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  // Edit form states
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');

  // Password form states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Delete account states
  const [deleteStep, setDeleteStep] = useState(1); // 1: reason, 2: OTP, 3: confirm
  const [deleteReason, setDeleteReason] = useState('');
  const [otpCode, setOtpCode] = useState('');

  if (!user) {
    return (
      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="text-center py-16">
          <p className="text-gray-600 dark:text-[#A0A0A5] mb-4">Please sign in to view your profile</p>
          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-3 bg-gradient-to-r from-yellow-400 via-orange-400 to-amber-500 text-gray-900 rounded-lg hover:shadow-lg hover:shadow-yellow-500/30 transition-all"
          >
            Go to Home
          </button>
        </div>
      </main>
    );
  }

  const handleSaveProfile = () => {
    updateProfile({ name: editName, email: editEmail });
    setIsEditingProfile(false);
    toast.success('Profile updated successfully!');
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      await changePassword(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
      toast.success('Password changed successfully!');
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const handleSendOTP = () => {
    // Simulate sending OTP to email
    toast.success('Verification code sent to ' + user.email);
    setDeleteStep(2);
  };

  const handleVerifyOTP = () => {
    // Simulate OTP verification
    if (otpCode.length === 6) {
      toast.success('Email verified successfully');
      setDeleteStep(3);
    } else {
      toast.error('Please enter a valid 6-digit code');
    }
  };

  const handleDeleteAccount = () => {
    logout();
    toast.success('Account deleted successfully');
    onNavigate('home');
  };

  const handleCancelDelete = () => {
    setDeleteStep(1);
    setDeleteReason('');
    setOtpCode('');
  };

  // Load referral data
  useEffect(() => {
    if (user?.id) {
      const data = ReferralService.getUserReferralData(user.id);
      setReferralData(data);
      
      const claimable = ReferralService.getClaimableXP(user.id);
      setClaimableXP(claimable);
    }
  }, [user?.id]);

  // Referral handlers
  const handleCopyReferralLink = async () => {
    if (!referralData) return;
    
    const success = await ReferralService.copyReferralLink(referralData.referralLink);
    if (success) {
      toast.success('Referral link copied to clipboard! 🎉');
    } else {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = (platform: string) => {
    if (!referralData) return;
    
    const shareUrls = ReferralService.getShareUrls(referralData.referralLink, user?.name || 'CrypLounge');
    const url = shareUrls[platform as keyof typeof shareUrls];
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
      toast.success(`Opening ${platform} share dialog...`);
    }
  };

  const handleClaimXP = () => {
    if (!user?.id || !claimableXP || claimableXP.totalPending === 0) return;
    
    setIsClaiming(true);
    
    setTimeout(() => {
      const claimed = ReferralService.claimXP(user.id);
      
      if (claimed > 0) {
        earnXP(claimed, `Claimed ${claimed} XP from referrals`);
        toast.success(`🎉 Claimed ${claimed} XP! Keep inviting friends!`);
        
        // Reload referral data
        const updatedData = ReferralService.getUserReferralData(user.id);
        setReferralData(updatedData);
        
        const updatedClaimable = ReferralService.getClaimableXP(user.id);
        setClaimableXP(updatedClaimable);
      }
      
      setIsClaiming(false);
    }, 800);
  };

  // XP System Stats for activity
  const recentActivity = [
    { id: 1, type: 'level', title: `Reached Level ${level}`, date: 'Current', icon: TrendingUp, color: 'blue' },
    { id: 2, type: 'xp', title: `Total XP: ${totalXP.toLocaleString()}`, date: 'Overall Progress', icon: Award, color: 'yellow' },
    { id: 3, type: 'courses', title: `${getCompletedCoursesCount()} Courses Completed`, date: 'Learn Progress', icon: BookOpen, color: 'green' },
    { id: 4, type: 'lessons', title: `${getCompletedLessonsCount()} Lessons Completed`, date: 'Learning Journey', icon: CheckCircle, color: 'purple' },
    { id: 5, type: 'streak', title: `${dailyStreak} Day Streak`, date: 'Keep it up!', icon: Star, color: 'orange' },
  ];

  const userAchievements = [
    { title: 'First Steps', desc: 'Created your account', earned: true },
    { title: 'Knowledge Seeker', desc: 'Earn 500 XP', earned: totalXP >= 500 },
    { title: 'Rising Star', desc: 'Reach Level 5', earned: level >= 5 },
    { title: 'Expert Learner', desc: 'Reach Level 10', earned: level >= 10 },
  ];

  return (
    <main className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 space-y-4 sm:space-y-5">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => onNavigate('home')} className="cursor-pointer hover:text-[#EFB81A] transition-colors text-sm">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-gray-400" />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-gray-800 dark:text-[#F3F3F5] text-sm">Profile</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Compact Premium Profile Header */}
      <div className="relative bg-gradient-to-br from-white via-[#F9D96A]/5 to-white dark:from-[#1A1A1C] dark:via-[#EFB81A]/5 dark:to-[#1A1A1C] rounded-2xl p-5 sm:p-6 border border-gray-200/50 dark:border-gray-800/50 shadow-lg shadow-black/5 dark:shadow-black/20 overflow-hidden">
        {/* Compact Ambient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#F9D96A]/10 via-transparent to-transparent dark:from-[#EFB81A]/10 opacity-50" />
        <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-[#F9D96A]/5 dark:bg-[#EFB81A]/5 rounded-full blur-[60px] -z-0" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-[#EFB81A]/5 dark:bg-[#F9D96A]/5 rounded-full blur-[50px] -z-0" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-5 relative z-10">
          {/* Compact Avatar */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#EFB81A] to-[#F9D96A] rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center shadow-xl ring-2 ring-white/50 dark:ring-gray-900/50 backdrop-blur-sm overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[#EFB81A] text-3xl sm:text-4xl">{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 bg-gradient-to-r from-[#EFB81A] to-[#F9D96A] text-black px-2.5 py-1 rounded-lg text-xs shadow-md ring-2 ring-white dark:ring-gray-900 backdrop-blur-sm">
              <div className="flex items-center gap-1">
                <Award className="w-3 h-3" />
                <span>Lv {level}</span>
              </div>
            </div>
          </div>

          {/* Compact User Info */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div>
              <h1 className="text-xl sm:text-2xl text-gray-900 dark:text-white mb-1">{user.name}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
            </div>
            
            {/* Compact Stats Grid */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 max-w-2xl mx-auto md:mx-0">
              {/* XP Card */}
              <div className="group relative bg-white dark:bg-gray-900/50 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <div className="absolute inset-0 bg-gradient-to-br from-[#EFB81A]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex flex-col items-center gap-1.5">
                  <div className="p-2 bg-gradient-to-br from-[#EFB81A] to-[#F9D96A] rounded-lg shadow-sm">
                    <TrendingUp className="w-3.5 h-3.5 text-black" />
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Total XP</div>
                  <div className="text-base sm:text-lg text-[#EFB81A]">{totalXP.toLocaleString()}</div>
                </div>
              </div>
              
              {/* Level Card */}
              <div className="group relative bg-white dark:bg-gray-900/50 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <div className="absolute inset-0 bg-gradient-to-br from-[#F9D96A]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex flex-col items-center gap-1.5">
                  <div className="p-2 bg-gradient-to-br from-[#F9D96A] to-[#EFB81A] rounded-lg shadow-sm">
                    <Award className="w-3.5 h-3.5 text-black" />
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Level</div>
                  <div className="text-base sm:text-lg text-[#EFB81A]">{level}</div>
                </div>
              </div>
              
              {/* Watchlist Card */}
              <div className="group relative bg-white dark:bg-gray-900/50 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                <div className="absolute inset-0 bg-gradient-to-br from-[#EFB81A]/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex flex-col items-center gap-1.5">
                  <div className="p-2 bg-gradient-to-br from-[#EFB81A] to-[#F9D96A] rounded-lg shadow-sm">
                    <Star className="w-3.5 h-3.5 text-black fill-black" />
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400">Saved</div>
                  <div className="text-base sm:text-lg text-[#EFB81A]">{user.watchlist.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Tabs */}
      <div className="relative bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200/50 dark:border-gray-800/50 p-1.5 shadow-md">
        <div className="flex gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`relative px-5 py-2.5 rounded-lg transition-all duration-300 whitespace-nowrap text-sm ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-[#EFB81A] to-[#F9D96A] text-black shadow-md shadow-[#EFB81A]/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
            }`}
            aria-label="View profile overview"
          >
            {activeTab === 'overview' && (
              <div className="absolute inset-0 bg-gradient-to-r from-[#EFB81A] to-[#F9D96A] rounded-lg blur-lg opacity-25 -z-10" />
            )}
            <span className="relative z-10">Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`relative px-5 py-2.5 rounded-lg transition-all duration-300 whitespace-nowrap text-sm ${
              activeTab === 'activity'
                ? 'bg-gradient-to-r from-[#EFB81A] to-[#F9D96A] text-black shadow-md shadow-[#EFB81A]/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
            }`}
            aria-label="View recent activity"
          >
            {activeTab === 'activity' && (
              <div className="absolute inset-0 bg-gradient-to-r from-[#EFB81A] to-[#F9D96A] rounded-lg blur-lg opacity-25 -z-10" />
            )}
            <span className="relative z-10">Activity</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`relative px-5 py-2.5 rounded-lg transition-all duration-300 whitespace-nowrap text-sm ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-[#EFB81A] to-[#F9D96A] text-black shadow-md shadow-[#EFB81A]/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
            }`}
            aria-label="Manage profile settings"
          >
            {activeTab === 'settings' && (
              <div className="absolute inset-0 bg-gradient-to-r from-[#EFB81A] to-[#F9D96A] rounded-lg blur-lg opacity-25 -z-10" />
            )}
            <span className="relative z-10">Settings</span>
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`relative px-5 py-2.5 rounded-lg transition-all duration-300 whitespace-nowrap text-sm ${
              activeTab === 'referrals'
                ? 'bg-gradient-to-r from-[#EFB81A] to-[#F9D96A] text-black shadow-md shadow-[#EFB81A]/20'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
            }`}
            aria-label="View referrals and rewards"
          >
            {activeTab === 'referrals' && (
              <div className="absolute inset-0 bg-gradient-to-r from-[#EFB81A] to-[#F9D96A] rounded-lg blur-lg opacity-25 -z-10" />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Referrals
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Compact Account Info */}
          <div className="group relative bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200/50 dark:border-gray-800/50 p-5 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-[#F9D96A]/5 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-0.5 h-5 bg-gradient-to-b from-[#EFB81A] to-[#F9D96A] rounded-full" />
                <h3 className="text-gray-800 dark:text-[#F3F3F5]">Account Information</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-900/30 hover:bg-gray-100/50 dark:hover:bg-gray-900/50 transition-all duration-200">
                  <div className="p-2 bg-gradient-to-br from-[#EFB81A]/10 to-[#F9D96A]/10 rounded-lg">
                    <User className="w-4 h-4 text-[#EFB81A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Full Name</div>
                    <div className="text-sm text-gray-900 dark:text-[#F3F3F5]">{user.name}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-900/30 hover:bg-gray-100/50 dark:hover:bg-gray-900/50 transition-all duration-200">
                  <div className="p-2 bg-gradient-to-br from-[#EFB81A]/10 to-[#F9D96A]/10 rounded-lg">
                    <Mail className="w-4 h-4 text-[#EFB81A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Email</div>
                    <div className="text-sm text-gray-900 dark:text-[#F3F3F5] break-all">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-900/30 hover:bg-gray-100/50 dark:hover:bg-gray-900/50 transition-all duration-200">
                  <div className="p-2 bg-gradient-to-br from-[#EFB81A]/10 to-[#F9D96A]/10 rounded-lg">
                    <Calendar className="w-4 h-4 text-[#EFB81A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Member Since</div>
                    <div className="text-sm text-gray-900 dark:text-[#F3F3F5]">
                      {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-900/30 hover:bg-gray-100/50 dark:hover:bg-gray-900/50 transition-all duration-200">
                  <div className="p-2 bg-gradient-to-br from-[#EFB81A]/10 to-[#F9D96A]/10 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-[#EFB81A]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Account Type</div>
                    <div className="text-sm text-gray-900 dark:text-[#F3F3F5] capitalize">{user.provider}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Achievements */}
          <div className="group relative bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200/50 dark:border-gray-800/50 p-5 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-[#EFB81A]/5 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-0.5 h-5 bg-gradient-to-b from-[#EFB81A] to-[#F9D96A] rounded-full" />
                <h3 className="text-gray-800 dark:text-[#F3F3F5]">Achievements</h3>
              </div>
              <div className="space-y-2.5">
                {userAchievements.map((achievement, idx) => (
                  <div
                    key={idx}
                    className={`group/item relative overflow-hidden rounded-lg transition-all duration-300 ${
                      achievement.earned
                        ? 'bg-gradient-to-br from-green-50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/10 border border-green-200 dark:border-green-900/50 shadow-sm hover:shadow-md'
                        : 'bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 hover:bg-gray-100/50 dark:hover:bg-gray-900/50'
                    }`}
                  >
                    {achievement.earned && (
                      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-xl" />
                    )}
                    <div className="relative flex items-start gap-2.5 p-3">
                      <div className={`p-2 rounded-lg shadow-sm ${
                        achievement.earned
                          ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-green-500/20'
                          : 'bg-gray-200 dark:bg-gray-800'
                      }`}>
                        {achievement.earned ? (
                          <CheckCircle className="w-3.5 h-3.5 text-white" />
                        ) : (
                          <Award className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm mb-0.5 ${
                          achievement.earned
                            ? 'text-green-900 dark:text-green-300'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {achievement.title}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-500">{achievement.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="group relative bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200/50 dark:border-gray-800/50 p-5 shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F9D96A]/5 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-0.5 h-5 bg-gradient-to-b from-[#EFB81A] to-[#F9D96A] rounded-full" />
              <h3 className="text-gray-800 dark:text-[#F3F3F5]">Recent Activity</h3>
            </div>
            <div className="space-y-2.5">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="group/item relative flex items-start gap-3 p-3 rounded-lg bg-gray-50/50 dark:bg-gray-900/30 hover:bg-gray-100/80 dark:hover:bg-gray-900/60 border border-transparent hover:border-[#EFB81A]/20 transition-all duration-200 hover:shadow-md">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#EFB81A]/5 to-transparent rounded-lg opacity-0 group-hover/item:opacity-100 transition-opacity duration-200" />
                    <div className={`relative p-2.5 rounded-lg shadow-sm bg-${activity.color}-100 dark:bg-${activity.color}-900/30 group-hover/item:shadow-md transition-all duration-200`}>
                      <Icon className={`w-4 h-4 text-${activity.color}-600 dark:text-${activity.color}-400`} />
                    </div>
                    <div className="relative flex-1 min-w-0">
                      <div className="text-sm text-gray-900 dark:text-[#F3F3F5] mb-0.5">{activity.title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{activity.date}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-4">
          {/* Edit Profile */}
          <div className="group relative bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200/50 dark:border-gray-800/50 p-5 shadow-md">
            <div className="absolute inset-0 bg-gradient-to-br from-[#F9D96A]/5 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-0.5 h-5 bg-gradient-to-b from-[#EFB81A] to-[#F9D96A] rounded-full" />
                  <h3 className="text-gray-800 dark:text-[#F3F3F5]">Profile Settings</h3>
                </div>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#EFB81A] hover:bg-[#EFB81A]/10 rounded-lg transition-all duration-200 border border-[#EFB81A]/20 hover:border-[#EFB81A]/40"
                  aria-label={isEditingProfile ? 'Cancel editing profile' : 'Edit profile'}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>{isEditingProfile ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>

              {isEditingProfile ? (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="editName" className="block text-[10px] uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">Full Name</label>
                    <input
                      id="editName"
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/10 transition-all duration-200"
                      aria-label="Edit your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="editEmail" className="block text-[10px] uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">Email Address</label>
                    <input
                      id="editEmail"
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/10 transition-all duration-200"
                      aria-label="Edit your email address"
                    />
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    className="relative w-full py-2.5 px-4 text-sm bg-gradient-to-r from-[#EFB81A] to-[#F9D96A] hover:from-[#F9D96A] hover:to-[#EFB81A] text-black rounded-lg transition-all duration-200 shadow-md shadow-[#EFB81A]/20 hover:shadow-lg hover:shadow-[#EFB81A]/25 hover:-translate-y-0.5"
                    aria-label="Save profile changes"
                  >
                    <span className="relative z-10">Save Changes</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="p-3 rounded-lg bg-gray-50/50 dark:bg-gray-900/30">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Name</div>
                    <div className="text-sm text-gray-900 dark:text-[#F3F3F5]">{user.name}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-gray-50/50 dark:bg-gray-900/30">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Email</div>
                    <div className="text-sm text-gray-900 dark:text-[#F3F3F5]">{user.email}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Change Password */}
          {user.provider === 'email' && (
            <div className="group relative bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200/50 dark:border-gray-800/50 p-5 shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-[#F9D96A]/5 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-0.5 h-5 bg-gradient-to-b from-[#EFB81A] to-[#F9D96A] rounded-full" />
                    <h3 className="text-gray-800 dark:text-[#F3F3F5]">Change Password</h3>
                  </div>
                  <button
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#EFB81A] hover:bg-[#EFB81A]/10 rounded-lg transition-all duration-200 border border-[#EFB81A]/20 hover:border-[#EFB81A]/40"
                    aria-label={isChangingPassword ? 'Cancel password change' : 'Change password'}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{isChangingPassword ? 'Cancel' : 'Change'}</span>
                  </button>
                </div>

                {isChangingPassword && (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="oldPassword" className="block text-[10px] uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">Current Password</label>
                      <input
                        id="oldPassword"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/10 transition-all duration-200"
                        aria-label="Enter current password"
                      />
                    </div>
                    <div>
                      <label htmlFor="newPassword" className="block text-[10px] uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">New Password</label>
                      <input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/10 transition-all duration-200"
                        aria-label="Enter new password"
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-[10px] uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">Confirm New Password</label>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/10 transition-all duration-200"
                        aria-label="Confirm new password"
                      />
                    </div>
                    <button
                      onClick={handleChangePassword}
                      className="relative w-full py-2.5 px-4 text-sm bg-gradient-to-r from-[#EFB81A] to-[#F9D96A] hover:from-[#F9D96A] hover:to-[#EFB81A] text-black rounded-lg transition-all duration-200 shadow-md shadow-[#EFB81A]/20 hover:shadow-lg hover:shadow-[#EFB81A]/25 hover:-translate-y-0.5"
                      aria-label="Update your password"
                    >
                      <span className="relative z-10">Update Password</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notifications */}
          <div className="group relative bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200/50 dark:border-gray-800/50 p-5 shadow-md">
            <div className="absolute inset-0 bg-gradient-to-br from-[#F9D96A]/5 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-0.5 h-5 bg-gradient-to-b from-[#EFB81A] to-[#F9D96A] rounded-full" />
                <Bell className="w-4 h-4 text-[#EFB81A]" />
                <h3 className="text-gray-800 dark:text-[#F3F3F5]">Notification Preferences</h3>
              </div>
              <div className="space-y-2.5">
                <label className="group/item flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer border border-transparent hover:border-[#EFB81A]/20 transition-all duration-200">
                  <span className="text-sm text-gray-800 dark:text-gray-300">Email notifications</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-[#EFB81A]" />
                </label>
                <label className="group/item flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer border border-transparent hover:border-[#EFB81A]/20 transition-all duration-200">
                  <span className="text-sm text-gray-800 dark:text-gray-300">Course updates</span>
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-[#EFB81A]" />
                </label>
                <label className="group/item flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer border border-transparent hover:border-[#EFB81A]/20 transition-all duration-200">
                  <span className="text-sm text-gray-800 dark:text-gray-300">Market alerts</span>
                  <input type="checkbox" className="w-4 h-4 rounded accent-[#EFB81A]" />
                </label>
              </div>
            </div>
          </div>

          {/* Delete Account */}
          <div className="group relative bg-white dark:bg-[#1A1A1C] rounded-xl border border-red-200/50 dark:border-red-500/30 p-5 shadow-md hover:shadow-red-500/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-transparent to-transparent dark:from-red-900/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-0.5 h-5 bg-gradient-to-b from-red-500 to-red-600 rounded-full" />
                <h3 className="text-gray-800 dark:text-[#F3F3F5]">Delete Account</h3>
              </div>
              
              {/* Compact Step Indicator */}
              <div className="flex items-center gap-2 mb-5">
                <div className={`flex items-center gap-1.5 ${deleteStep >= 1 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shadow-sm transition-all duration-200 ${deleteStep >= 1 ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                    {deleteStep > 1 ? <CheckCircle className="w-3.5 h-3.5" /> : <span>1</span>}
                  </div>
                  <span className="text-xs">Reason</span>
                </div>
                <div className={`flex-1 h-px rounded-full transition-all duration-200 ${deleteStep >= 2 ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                <div className={`flex items-center gap-1.5 ${deleteStep >= 2 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shadow-sm transition-all duration-200 ${deleteStep >= 2 ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                    {deleteStep > 2 ? <CheckCircle className="w-3.5 h-3.5" /> : <span>2</span>}
                  </div>
                  <span className="text-xs">Verify</span>
                </div>
                <div className={`flex-1 h-px rounded-full transition-all duration-200 ${deleteStep >= 3 ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gray-200 dark:bg-gray-700'}`} />
                <div className={`flex items-center gap-1.5 ${deleteStep >= 3 ? 'text-red-600 dark:text-red-400' : 'text-gray-400'}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shadow-sm transition-all duration-200 ${deleteStep >= 3 ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                    <span>3</span>
                  </div>
                  <span className="text-xs">Confirm</span>
                </div>
              </div>

              {/* Step 1: Reason (Optional) */}
              {deleteStep === 1 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                      Why are you leaving? <span className="text-gray-400">(Optional)</span>
                    </label>
                    <textarea
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      placeholder="Help us improve by sharing your feedback..."
                      className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 text-gray-900 dark:text-[#F3F3F5] resize-none transition-all duration-200"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2.5">
                    <button
                      onClick={handleSendOTP}
                      className="px-5 py-2 text-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-200 shadow-md shadow-red-500/20 hover:shadow-lg hover:-translate-y-0.5"
                    >
                      Continue
                    </button>
                    <button
                      onClick={handleCancelDelete}
                      className="px-5 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Email OTP Verification */}
              {deleteStep === 2 && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-500/20 rounded-lg">
                    <p className="text-xs text-blue-800 dark:text-blue-400">
                      We've sent a verification code to <span className="font-semibold">{user.email}</span>
                    </p>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                      Enter 6-digit code
                    </label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full px-3 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10 text-gray-900 dark:text-[#F3F3F5] text-center tracking-[0.3em] text-lg transition-all duration-200"
                      maxLength={6}
                    />
                  </div>
                  <div className="flex gap-2.5">
                    <button
                      onClick={handleVerifyOTP}
                      disabled={otpCode.length !== 6}
                      className="px-5 py-2 text-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 shadow-md shadow-red-500/20 hover:shadow-lg hover:-translate-y-0.5 disabled:shadow-none disabled:translate-y-0"
                    >
                      Verify Code
                    </button>
                    <button
                      onClick={handleCancelDelete}
                      className="px-5 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                  <button
                    onClick={handleSendOTP}
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:underline transition-colors"
                  >
                    Resend code
                  </button>
                </div>
              )}

              {/* Step 3: Final Confirmation */}
              {deleteStep === 3 && (
                <div className="space-y-3">
                  <div className="relative p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 border border-red-300 dark:border-red-500/30 rounded-lg overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-2xl" />
                    <p className="relative text-xs text-red-900 dark:text-red-300 leading-relaxed">
                      <span className="text-lg mr-1.5">⚠️</span>
                      <strong className="block mb-1.5 text-sm">Final Warning</strong>
                      This will permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  <div className="flex gap-2.5">
                    <button
                      onClick={handleDeleteAccount}
                      className="px-5 py-2 text-sm bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition-all duration-200 shadow-md shadow-red-500/20 hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Account Permanently</span>
                    </button>
                    <button
                      onClick={handleCancelDelete}
                      className="px-5 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Referrals Tab */}
      {activeTab === 'referrals' && (
        <div className="space-y-4">
          {/* Referral Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Referrals */}
            <div className="group relative bg-gradient-to-br from-white via-[#F9D96A]/5 to-white dark:from-[#1A1A1C] dark:via-[#EFB81A]/5 dark:to-[#1A1A1C] rounded-xl border border-gray-200/50 dark:border-gray-800/50 p-5 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-[#F9D96A]/10 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-[#EFB81A] to-[#F9D96A] rounded-xl shadow-lg shadow-[#EFB81A]/20">
                  <Users className="w-6 h-6 text-black" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Referrals</div>
                  <div className="text-2xl text-[#EFB81A]">{referralData?.totalReferrals || 0}</div>
                </div>
              </div>
            </div>

            {/* Active Referrals */}
            <div className="group relative bg-gradient-to-br from-white via-green-50/50 to-white dark:from-[#1A1A1C] dark:via-green-900/10 dark:to-[#1A1A1C] rounded-xl border border-gray-200/50 dark:border-gray-800/50 p-5 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg shadow-green-500/20">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Referrals</div>
                  <div className="text-2xl text-green-600 dark:text-green-400">{referralData?.activeReferrals || 0}</div>
                </div>
              </div>
            </div>

            {/* Pending XP */}
            <div className="group relative bg-gradient-to-br from-white via-purple-50/50 to-white dark:from-[#1A1A1C] dark:via-purple-900/10 dark:to-[#1A1A1C] rounded-xl border border-gray-200/50 dark:border-gray-800/50 p-5 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl shadow-lg shadow-purple-500/20">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending XP</div>
                  <div className="text-2xl text-purple-600 dark:text-purple-400">{claimableXP?.totalPending || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Claim XP Section */}
          {claimableXP && claimableXP.totalPending > 0 && (
            <div className="relative bg-gradient-to-br from-[#F9D96A]/10 via-[#EFB81A]/5 to-transparent border border-[#EFB81A]/20 rounded-xl p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#EFB81A]/10 rounded-full blur-3xl" />
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-[#EFB81A] to-[#F9D96A] rounded-2xl shadow-xl shadow-[#EFB81A]/30 animate-pulse">
                    <Sparkles className="w-8 h-8 text-black" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-white mb-1">🎉 You have XP to claim!</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Claim <span className="text-[#EFB81A]">{claimableXP.totalPending} XP</span> from {claimableXP.claims.length} referral{claimableXP.claims.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClaimXP}
                  disabled={isClaiming}
                  className="px-6 py-3 bg-gradient-to-r from-[#EFB81A] to-[#F9D96A] hover:from-[#F9D96A] hover:to-[#EFB81A] text-black rounded-xl shadow-lg shadow-[#EFB81A]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isClaiming ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    <>
                      <Gift className="w-5 h-5" />
                      Claim All XP
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Referral Link Section */}
          <div className="group relative bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200/50 dark:border-gray-800/50 p-6 shadow-md">
            <div className="absolute inset-0 bg-gradient-to-br from-[#F9D96A]/5 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-0.5 h-5 bg-gradient-to-b from-[#EFB81A] to-[#F9D96A] rounded-full" />
                <h3 className="text-gray-800 dark:text-[#F3F3F5]">Your Referral Link</h3>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Share your unique link with friends and earn XP when they sign up and become active!
              </p>

              {/* Referral Link Input with Copy Button */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={referralData?.referralLink || ''}
                  readOnly
                  className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:border-[#EFB81A] focus:ring-2 focus:ring-[#EFB81A]/10"
                />
                <button
                  onClick={handleCopyReferralLink}
                  className="px-6 py-3 bg-gradient-to-r from-[#EFB81A] to-[#F9D96A] hover:from-[#F9D96A] hover:to-[#EFB81A] text-black rounded-xl shadow-md shadow-[#EFB81A]/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>

              {/* Share Buttons */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[#EFB81A]" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Share on social media:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  <button
                    onClick={() => handleShare('twitter')}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] rounded-lg transition-all duration-200 border border-[#1DA1F2]/20 hover:border-[#1DA1F2]/40"
                  >
                    <Twitter className="w-4 h-4" />
                    <span className="text-sm">Twitter</span>
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] rounded-lg transition-all duration-200 border border-[#1877F2]/20 hover:border-[#1877F2]/40"
                  >
                    <Facebook className="w-4 h-4" />
                    <span className="text-sm">Facebook</span>
                  </button>
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 text-[#0A66C2] rounded-lg transition-all duration-200 border border-[#0A66C2]/20 hover:border-[#0A66C2]/40"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span className="text-sm">LinkedIn</span>
                  </button>
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-lg transition-all duration-200 border border-[#25D366]/20 hover:border-[#25D366]/40"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">WhatsApp</span>
                  </button>
                  <button
                    onClick={() => handleShare('telegram')}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0088CC]/10 hover:bg-[#0088CC]/20 text-[#0088CC] rounded-lg transition-all duration-200 border border-[#0088CC]/20 hover:border-[#0088CC]/40"
                  >
                    <Send className="w-4 h-4" />
                    <span className="text-sm">Telegram</span>
                  </button>
                  <button
                    onClick={() => handleShare('email')}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-500/10 hover:bg-gray-500/20 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 border border-gray-500/20 hover:border-gray-500/40"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">Email</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Referral List */}
          <div className="group relative bg-white dark:bg-[#1A1A1C] rounded-xl border border-gray-200/50 dark:border-gray-800/50 p-6 shadow-md">
            <div className="absolute inset-0 bg-gradient-to-br from-[#F9D96A]/5 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-0.5 h-5 bg-gradient-to-b from-[#EFB81A] to-[#F9D96A] rounded-full" />
                <h3 className="text-gray-800 dark:text-[#F3F3F5]">Your Referrals</h3>
              </div>

              {referralData && referralData.referrals.length > 0 ? (
                <div className="space-y-3">
                  {referralData.referrals.map((referral) => (
                    <div
                      key={referral.id}
                      className="group/item flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-900/30 hover:bg-gray-100/50 dark:hover:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-lg ${
                          referral.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                          referral.status === 'active' ? 'bg-blue-100 dark:bg-blue-900/30' :
                          'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <User className={`w-5 h-5 ${
                            referral.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                            referral.status === 'active' ? 'text-blue-600 dark:text-blue-400' :
                            'text-gray-600 dark:text-gray-400'
                          }`} />
                        </div>
                        <div>
                          <div className="text-sm text-gray-900 dark:text-gray-100">{referral.referredUserName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(referral.signupDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-xs ${
                          referral.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          referral.status === 'active' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                          'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                        }`}>
                          {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                        </div>
                        {referral.xpEarned > 0 && (
                          <div className="flex items-center gap-1 text-[#EFB81A]">
                            <Award className="w-4 h-4" />
                            <span className="text-sm">+{referral.xpEarned} XP</span>
                            {referral.xpClaimed && (
                              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">No referrals yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Start sharing your referral link to earn XP!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* How It Works */}
          <div className="group relative bg-gradient-to-br from-[#F9D96A]/10 via-[#EFB81A]/5 to-transparent border border-[#EFB81A]/20 rounded-xl p-6">
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-[#EFB81A]" />
                <h3 className="text-gray-800 dark:text-[#F3F3F5]">How Referrals Work</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#EFB81A] to-[#F9D96A] rounded-full flex items-center justify-center text-black shadow-lg">1</div>
                  <div>
                    <div className="text-sm text-gray-900 dark:text-gray-100 mb-1">Share Your Link</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Send your unique referral link to friends via social media or email</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#EFB81A] to-[#F9D96A] rounded-full flex items-center justify-center text-black shadow-lg">2</div>
                  <div>
                    <div className="text-sm text-gray-900 dark:text-gray-100 mb-1">Friend Signs Up</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">When they create an account using your link, you both earn rewards</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-[#EFB81A] to-[#F9D96A] rounded-full flex items-center justify-center text-black shadow-lg">3</div>
                  <div>
                    <div className="text-sm text-gray-900 dark:text-gray-100 mb-1">Earn XP</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Claim your XP and level up! More active referrals = more rewards</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
