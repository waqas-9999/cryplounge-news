import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { SecureStorage } from '../utils/secureStorage';

// XP Transaction for audit trail
interface XPTransaction {
  id: string;
  userId: string; // In production, get from auth context
  sourceType: 'lesson' | 'quiz' | 'course' | 'enrollment' | 'review' | 'achievement';
  sourceId: string;
  xpAmount: number;
  txType: 'grant' | 'revoke';
  reason: string;
  dailyTotal: number; // Running total for the day
  cappedAmount?: number; // If daily cap was hit
  timestamp: string;
}

interface XPContextType {
  totalXP: number;
  level: number;
  xpToNextLevel: number;
  currentLevelXP: number;
  dailyXPEarned: number;
  dailyXPLimit: number;
  earnXP: (amount: number, reason: string, sourceType?: string, sourceId?: string) => number;
  hasCompletedLesson: (lessonId: string) => boolean;
  completeLesson: (lessonId: string, xp: number) => void;
  hasEnrolledCourse: (courseId: string) => boolean;
  enrollCourse: (courseId: string, xp: number) => void;
  hasCompletedCourse: (courseId: string) => boolean;
  completeCourse: (courseId: string, xp: number) => void;
  hasReviewedCourse: (courseId: string) => boolean;
  reviewCourse: (courseId: string, xp: number) => void;
  dailyStreak: number;
  achievements: Achievement[];
  getCompletedCoursesCount: () => number;
  getCompletedLessonsCount: () => number;
  getXPTransactions: () => XPTransaction[];
  getTodaysTransactions: () => XPTransaction[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  unlockedAt?: string;
}

const XPContext = createContext<XPContextType | undefined>(undefined);

export function useXP() {
  const context = useContext(XPContext);
  if (!context) {
    throw new Error('useXP must be used within XPProvider');
  }
  return context;
}

interface XPProviderProps {
  children: ReactNode;
}

// XP required for each level (exponential growth)
const getXPForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Daily XP cap (150 XP per day as per requirements)
const DAILY_XP_LIMIT = 150;

// Get today's date string in UTC (YYYY-MM-DD)
const getTodayDateString = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// Generate unique transaction ID
const generateTransactionId = (): string => {
  return `xp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export function XPProvider({ children }: XPProviderProps) {
  const [totalXP, setTotalXP] = useState(() => {
    const saved = SecureStorage.get<number>('cryplounge_xp');
    return saved ?? 0;
  });

  // XP Transactions for audit trail
  const [xpTransactions, setXPTransactions] = useState<XPTransaction[]>(() => {
    const saved = SecureStorage.get<XPTransaction[]>('cryplounge_xp_transactions');
    return saved ?? [];
  });

  // Track daily XP earned
  const [dailyXPEarned, setDailyXPEarned] = useState(0);

  const [completedLessons, setCompletedLessons] = useState<Set<string>>(() => {
    const saved = SecureStorage.get<string[]>('cryplounge_completed_lessons');
    return saved ? new Set(saved) : new Set();
  });

  const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(() => {
    const saved = SecureStorage.get<string[]>('cryplounge_enrolled_courses');
    return saved ? new Set(saved) : new Set();
  });

  const [completedCourses, setCompletedCourses] = useState<Set<string>>(() => {
    const saved = SecureStorage.get<string[]>('cryplounge_completed_courses');
    return saved ? new Set(saved) : new Set();
  });

  const [reviewedCourses, setReviewedCourses] = useState<Set<string>>(() => {
    const saved = SecureStorage.get<string[]>('cryplounge_reviewed_courses');
    return saved ? new Set(saved) : new Set();
  });

  const [dailyStreak, setDailyStreak] = useState(() => {
    const saved = SecureStorage.get<number>('cryplounge_daily_streak');
    return saved ?? 0;
  });

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first_enrollment',
      name: 'First Steps',
      description: 'Enroll in your first course',
      icon: '🎯',
      xpReward: 50,
    },
    {
      id: 'first_lesson',
      name: 'Knowledge Seeker',
      description: 'Complete your first lesson',
      icon: '📚',
      xpReward: 50,
    },
    {
      id: 'first_course',
      name: 'Course Champion',
      description: 'Complete your first course',
      icon: '🏆',
      xpReward: 200,
    },
    {
      id: 'level_5',
      name: 'Rising Star',
      description: 'Reach level 5',
      icon: '⭐',
      xpReward: 500,
    },
    {
      id: 'level_10',
      name: 'Expert Learner',
      description: 'Reach level 10',
      icon: '💎',
      xpReward: 1000,
    },
    {
      id: 'streak_7',
      name: 'Week Warrior',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      xpReward: 300,
    },
  ]);

  // Calculate current level and XP progress
  const calculateLevel = (xp: number): { level: number; currentLevelXP: number; xpToNextLevel: number } => {
    let level = 1;
    let totalXPNeeded = 0;
    
    while (totalXPNeeded + getXPForLevel(level) <= xp) {
      totalXPNeeded += getXPForLevel(level);
      level++;
    }
    
    const currentLevelXP = xp - totalXPNeeded;
    const xpToNextLevel = getXPForLevel(level);
    
    return { level, currentLevelXP, xpToNextLevel };
  };

  const { level, currentLevelXP, xpToNextLevel } = calculateLevel(totalXP);

  // Save to secure storage
  useEffect(() => {
    SecureStorage.set('cryplounge_xp', totalXP);
  }, [totalXP]);

  useEffect(() => {
    SecureStorage.set('cryplounge_completed_lessons', [...completedLessons]);
  }, [completedLessons]);

  useEffect(() => {
    SecureStorage.set('cryplounge_enrolled_courses', [...enrolledCourses]);
  }, [enrolledCourses]);

  useEffect(() => {
    SecureStorage.set('cryplounge_completed_courses', [...completedCourses]);
  }, [completedCourses]);

  useEffect(() => {
    SecureStorage.set('cryplounge_reviewed_courses', [...reviewedCourses]);
  }, [reviewedCourses]);

  useEffect(() => {
    SecureStorage.set('cryplounge_daily_streak', dailyStreak);
  }, [dailyStreak]);

  useEffect(() => {
    SecureStorage.set('cryplounge_xp_transactions', xpTransactions);
  }, [xpTransactions]);

  // Calculate daily XP earned (resets at UTC midnight)
  useEffect(() => {
    const today = getTodayDateString();
    const todayTransactions = xpTransactions.filter(tx => 
      tx.timestamp.startsWith(today) && tx.txType === 'grant'
    );
    const todayTotal = todayTransactions.reduce((sum, tx) => sum + (tx.cappedAmount || tx.xpAmount), 0);
    setDailyXPEarned(todayTotal);
  }, [xpTransactions]);

  const earnXP = (amount: number, reason: string, sourceType: string = 'achievement', sourceId: string = ''): number => {
    const previousLevel = level;
    
    // Check daily cap
    const remainingDailyXP = DAILY_XP_LIMIT - dailyXPEarned;
    let actualXPAwarded = amount;
    let cappedAmount: number | undefined = undefined;
    
    if (remainingDailyXP <= 0) {
      toast.error('Daily XP Cap Reached', {
        description: `You've earned ${DAILY_XP_LIMIT} XP today. Come back tomorrow!`,
        duration: 4000,
      });
      return 0;
    }
    
    if (amount > remainingDailyXP) {
      actualXPAwarded = remainingDailyXP;
      cappedAmount = actualXPAwarded;
      toast.warning('Partial XP Awarded', {
        description: `Daily cap reached. Awarded ${actualXPAwarded} of ${amount} XP`,
        duration: 4000,
      });
    }
    
    // Create audit transaction
    const transaction: XPTransaction = {
      id: generateTransactionId(),
      userId: 'user_local', // In production, get from AuthContext
      sourceType: sourceType as any,
      sourceId: sourceId || generateTransactionId(),
      xpAmount: amount,
      txType: 'grant',
      reason,
      dailyTotal: dailyXPEarned + actualXPAwarded,
      cappedAmount,
      timestamp: new Date().toISOString(),
    };
    
    // Record transaction
    setXPTransactions(prev => [...prev, transaction]);
    
    // Award XP
    setTotalXP(prev => prev + actualXPAwarded);
    
    // Show toast notification
    toast.success(`+${actualXPAwarded} XP`, {
      description: reason,
      duration: 3000,
    });

    // Check if leveled up
    const newStats = calculateLevel(totalXP + actualXPAwarded);
    if (newStats.level > previousLevel) {
      toast.success(`🎉 Level Up! You're now Level ${newStats.level}`, {
        description: `Keep learning to unlock more achievements!`,
        duration: 5000,
      });
    }
    
    return actualXPAwarded;
  };

  const completeLesson = (lessonId: string, xp: number) => {
    if (!completedLessons.has(lessonId)) {
      setCompletedLessons(prev => new Set([...prev, lessonId]));
      earnXP(xp, 'Lesson completed!', 'lesson', lessonId);
      
      // Check for first lesson achievement
      if (completedLessons.size === 0) {
        earnXP(50, '🎯 Achievement: First Lesson!', 'achievement', 'first_lesson');
      }
    }
  };

  const enrollCourse = (courseId: string, xp: number) => {
    if (!enrolledCourses.has(courseId)) {
      setEnrolledCourses(prev => new Set([...prev, courseId]));
      earnXP(xp, 'Course enrolled!', 'enrollment', courseId);
      
      // Check for first enrollment achievement
      if (enrolledCourses.size === 0) {
        earnXP(50, '🎯 Achievement: First Enrollment!', 'achievement', 'first_enrollment');
      }
    }
  };

  const completeCourse = (courseId: string, xp: number) => {
    if (!completedCourses.has(courseId)) {
      setCompletedCourses(prev => new Set([...prev, courseId]));
      earnXP(xp, 'Course completed! 🎉', 'course', courseId);
      
      // Check for first course completion achievement
      if (completedCourses.size === 0) {
        earnXP(200, '🏆 Achievement: First Course Completed!', 'achievement', 'first_course');
      }
    }
  };

  const reviewCourse = (courseId: string, xp: number) => {
    if (!reviewedCourses.has(courseId)) {
      setReviewedCourses(prev => new Set([...prev, courseId]));
      earnXP(xp, 'Review submitted!', 'review', courseId);
    }
  };

  const hasCompletedLesson = (lessonId: string) => completedLessons.has(lessonId);
  const hasEnrolledCourse = (courseId: string) => enrolledCourses.has(courseId);
  const hasCompletedCourse = (courseId: string) => completedCourses.has(courseId);
  const hasReviewedCourse = (courseId: string) => reviewedCourses.has(courseId);
  const getCompletedCoursesCount = () => completedCourses.size;
  const getCompletedLessonsCount = () => completedLessons.size;
  
  // Get all transactions
  const getXPTransactions = () => xpTransactions;
  
  // Get today's transactions
  const getTodaysTransactions = () => {
    const today = getTodayDateString();
    return xpTransactions.filter(tx => tx.timestamp.startsWith(today));
  };

  const value: XPContextType = {
    totalXP,
    level,
    xpToNextLevel,
    currentLevelXP,
    dailyXPEarned,
    dailyXPLimit: DAILY_XP_LIMIT,
    earnXP,
    hasCompletedLesson,
    completeLesson,
    hasEnrolledCourse,
    enrollCourse,
    hasCompletedCourse,
    completeCourse,
    hasReviewedCourse,
    reviewCourse,
    dailyStreak,
    achievements,
    getCompletedCoursesCount,
    getCompletedLessonsCount,
    getXPTransactions,
    getTodaysTransactions,
  };

  return <XPContext.Provider value={value}>{children}</XPContext.Provider>;
}
