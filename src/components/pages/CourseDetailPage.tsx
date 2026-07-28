'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Star, Clock, BookOpen, Users, Award, CheckCircle2, PlayCircle, FileText, Video, Lock, Heart, Share2, Download, TrendingUp, Target, Sparkles, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Course } from '@/data/learnData';
import { useXP } from '@/contexts/XPContext';
import { XPWidget } from '@/components/XPWidget';
import { RelatedLearnSection } from '@/components/RelatedLearnSection';
import { getMixedRelatedCourses } from '@/data/crossPromotionData';

interface CourseDetailPageProps {
  courseId: string;
  course: Course;
  onNavigate: (page: string) => void;
}

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'reading' | 'quiz';
  isCompleted: boolean;
  isLocked: boolean;
}

interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
}

export function CourseDetailPage({ courseId, course, onNavigate }: CourseDetailPageProps) {
  const { hasEnrolledCourse, enrollCourse, hasCompletedLesson, completeLesson, hasReviewedCourse, reviewCourse, hasCompletedCourse, completeCourse } = useXP();
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(hasEnrolledCourse(courseId));
  const [isSaved, setIsSaved] = useState(false);

  // Mock lessons data
  const lessons: Lesson[] = [
    { id: `${courseId}-1`, title: 'Introduction and Course Overview', duration: '12:30', type: 'video', isCompleted: hasCompletedLesson(`${courseId}-1`), isLocked: false },
    { id: `${courseId}-2`, title: 'Understanding the Fundamentals', duration: '18:45', type: 'video', isCompleted: hasCompletedLesson(`${courseId}-2`), isLocked: false },
    { id: `${courseId}-3`, title: 'Core Concepts - Reading Material', duration: '25 min', type: 'reading', isCompleted: hasCompletedLesson(`${courseId}-3`), isLocked: false },
    { id: `${courseId}-4`, title: 'Practical Examples and Use Cases', duration: '22:15', type: 'video', isCompleted: hasCompletedLesson(`${courseId}-4`), isLocked: false },
    { id: `${courseId}-5`, title: 'Hands-on Project Setup', duration: '30:00', type: 'video', isCompleted: hasCompletedLesson(`${courseId}-5`), isLocked: isEnrolled ? false : true },
    { id: `${courseId}-6`, title: 'Advanced Techniques', duration: '28:40', type: 'video', isCompleted: hasCompletedLesson(`${courseId}-6`), isLocked: isEnrolled ? false : true },
    { id: `${courseId}-7`, title: 'Best Practices and Patterns', duration: '20 min', type: 'reading', isCompleted: hasCompletedLesson(`${courseId}-7`), isLocked: isEnrolled ? false : true },
    { id: `${courseId}-8`, title: 'Final Assessment Quiz', duration: '15 min', type: 'quiz', isCompleted: hasCompletedLesson(`${courseId}-8`), isLocked: isEnrolled ? false : true },
  ];

  // Mock reviews
  const reviews: Review[] = [
    {
      id: '1',
      userName: 'Alex Johnson',
      rating: 5,
      date: '2 weeks ago',
      comment: 'Excellent course! The instructor explains complex concepts in a very clear and understandable way. Highly recommended for anyone looking to deepen their knowledge.',
      helpful: 42,
    },
    {
      id: '2',
      userName: 'Sarah Chen',
      rating: 4,
      date: '1 month ago',
      comment: 'Great content and well-structured. The hands-on projects were particularly useful. Would have liked more advanced examples though.',
      helpful: 28,
    },
    {
      id: '3',
      userName: 'Michael Rodriguez',
      rating: 5,
      date: '1 month ago',
      comment: 'Best course I\'ve taken so far! The practical approach and real-world examples make it easy to apply what you learn immediately.',
      helpful: 35,
    },
  ];

  const handleEnroll = () => {
    if (!isEnrolled) {
      setIsEnrolled(true);
      enrollCourse(courseId, course.enrollXP || 10);
    }
  };

  const handleRatingSubmit = () => {
    if (userRating > 0 && reviewText.trim() && !hasReviewedCourse(courseId)) {
      reviewCourse(courseId, 25);
      setReviewText('');
      setUserRating(0);
    }
  };

  const handleLessonComplete = (lessonId: string) => {
    if (!hasCompletedLesson(lessonId)) {
      completeLesson(lessonId, course.xpPerLesson || 20);
    }
  };

  // Check if all lessons are completed
  useEffect(() => {
    const allCompleted = lessons.every(lesson => hasCompletedLesson(lesson.id));
    if (allCompleted && isEnrolled && !hasCompletedCourse(courseId)) {
      completeCourse(courseId, course.xpReward || 100);
    }
  }, [lessons, courseId, course.xpReward, completeCourse, hasCompletedCourse, hasCompletedLesson, isEnrolled]);

  const completedLessons = lessons.filter(l => l.isCompleted).length;
  const progressPercentage = (completedLessons / lessons.length) * 100;

  const getLessonIcon = (type: Lesson['type']) => {
    switch (type) {
      case 'video':
        return Video;
      case 'reading':
        return FileText;
      case 'quiz':
        return Award;
      default:
        return BookOpen;
    }
  };

  return (
    <main 
      className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-8 space-y-8"
      aria-label="Course details and curriculum"
    >
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb navigation">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => onNavigate('home')} className="cursor-pointer">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator aria-hidden="true" />
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => onNavigate('learn')} className="cursor-pointer">Learn</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator aria-hidden="true" />
            {course.ecosystem && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={() => onNavigate(`learn/${course.ecosystem?.toLowerCase().replace(' ', '-')}`)} className="cursor-pointer">
                    {course.ecosystem}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator aria-hidden="true" />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage>{course.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </nav>

      {/* Back Button */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
        aria-label="Go back to courses list"
      >
        <ArrowLeft className="w-5 h-5" aria-hidden="true" />
        <span>Back to Courses</span>
      </button>

      {/* Course Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 via-purple-50 to-yellow-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-yellow-950/20 rounded-3xl p-8 md:p-12 border border-gray-200 dark:border-gray-800"
        role="region"
        aria-labelledby="course-title"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Course Info */}
          <div className="lg:col-span-2" role="article" aria-label="Course information">
            <div className="flex flex-wrap items-center gap-3 mb-4" role="group" aria-label="Course metadata">
              <span 
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl text-sm"
                role="status"
                aria-label={`Category: ${course.category}`}
              >
                {course.category}
              </span>
              <span 
                className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl text-sm"
                role="status"
                aria-label={`Difficulty: ${course.difficulty}`}
              >
                {course.difficulty}
              </span>
              {course.ecosystem && (
                <span 
                  className="px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-xl text-sm"
                  role="status"
                  aria-label={`Ecosystem: ${course.ecosystem}`}
                >
                  {course.ecosystem}
                </span>
              )}
              {course.ecosystemCategory && (
                <span 
                  className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl text-sm"
                  role="status"
                  aria-label={`Ecosystem category: ${course.ecosystemCategory}`}
                >
                  {course.ecosystemCategory}
                </span>
              )}
              {/* XP Reward Badge */}
              {course.xpReward && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl text-sm flex items-center gap-1.5 shadow-lg"
                  role="status"
                  aria-label={`XP reward: ${course.xpReward} points`}
                >
                  <Zap className="w-4 h-4" fill="white" aria-hidden="true" />
                  +{course.xpReward} XP
                </motion.span>
              )}
            </div>

            <h1 
              id="course-title"
              className="text-3xl md:text-4xl text-gray-900 dark:text-gray-100 mb-4"
            >
              {course.title}
            </h1>

            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              {course.description}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-6 mb-6" role="group" aria-label="Course statistics">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                <span className="text-gray-900 dark:text-white" aria-label={`Rating: ${course.rating} out of 5 stars`}>{course.rating}</span>
                <span className="text-sm text-gray-600 dark:text-gray-400" aria-label={`Based on ${course.reviewsCount} reviews`}>({course.reviewsCount} reviews)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Users className="w-5 h-5" aria-hidden="true" />
                <span aria-label={`${course.enrolledCount.toLocaleString()} students enrolled`}>{course.enrolledCount.toLocaleString()} enrolled</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Clock className="w-5 h-5" aria-hidden="true" />
                <span aria-label={`Course duration: ${course.duration}`}>{course.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <BookOpen className="w-5 h-5" aria-hidden="true" />
                <span aria-label={`${course.lessonsCount} lessons in total`}>{course.lessonsCount} lessons</span>
              </div>
            </div>

            {/* Instructor */}
            <div className="flex items-center gap-3 mb-6" role="complementary" aria-label="Instructor information">
              <Avatar>
                <AvatarFallback 
                  className="bg-gradient-to-br from-blue-500 to-purple-500 text-white"
                  aria-label={`Instructor initials: ${course.instructor.split(' ').map(n => n[0]).join('')}`}
                >
                  {course.instructor.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Instructor</p>
                <p className="text-gray-900 dark:text-white">{course.instructor}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3" role="group" aria-label="Course actions">
              {isEnrolled ? (
                <Button 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 px-8 py-6 text-lg"
                  aria-label="Continue learning this course"
                >
                  <PlayCircle className="w-5 h-5 mr-2" aria-hidden="true" />
                  Continue Learning
                </Button>
              ) : (
                <Button 
                  onClick={handleEnroll} 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 px-8 py-6 text-lg relative group"
                  aria-label={`Enroll in ${course.title} for free${course.enrollXP ? ` and earn ${course.enrollXP} XP` : ''}`}
                >
                  <span className="flex items-center gap-2">
                    Enroll Now - Free
                    {course.enrollXP && (
                      <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg" aria-label={`${course.enrollXP} experience points`}>
                        <Zap className="w-4 h-4" fill="currentColor" aria-hidden="true" />
                        +{course.enrollXP} XP
                      </span>
                    )}
                  </span>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setIsSaved(!isSaved)}
                className={`px-6 py-6 ${isSaved ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700' : ''}`}
                aria-label={isSaved ? 'Remove course from saved items' : 'Save course for later'}
                aria-pressed={isSaved}
              >
                <Heart className={`w-5 h-5 mr-2 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} aria-hidden="true" />
                {isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button 
                variant="outline" 
                className="px-6 py-6"
                aria-label="Share this course"
              >
                <Share2 className="w-5 h-5 mr-2" aria-hidden="true" />
                Share
              </Button>
            </div>
          </div>

          {/* Right: Progress & XP Info */}
          <div className="space-y-4">
            {isEnrolled && (
              <div 
                className="bg-white dark:bg-[#1A1A1C] rounded-2xl p-6 border border-gray-200 dark:border-gray-800"
                role="region"
                aria-labelledby="progress-heading"
              >
                <h3 id="progress-heading" className="text-gray-900 dark:text-white mb-4">Your Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300">Course Completion</span>
                      <span 
                        className="text-gray-900 dark:text-white"
                        aria-label={`${Math.round(progressPercentage)} percent complete`}
                      >
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                    <Progress 
                      value={progressPercentage} 
                      className="h-3"
                      aria-label={`Course progress: ${Math.round(progressPercentage)} percent`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(progressPercentage)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div>
                      <p className="text-2xl text-gray-900 dark:text-white" aria-label={`${completedLessons} lessons completed`}>{completedLessons}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
                    </div>
                    <div>
                      <p className="text-2xl text-gray-900 dark:text-white" aria-label={`${lessons.length - completedLessons} lessons remaining`}>{lessons.length - completedLessons}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Remaining</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-800" role="status" aria-live="polite">
                    <TrendingUp className="w-5 h-5 text-green-500" aria-hidden="true" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Keep up the great work!</span>
                  </div>
                </div>
              </div>
            )}

            {/* XP Rewards Breakdown */}
            <div 
              className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-2xl p-6 border-2 border-yellow-200 dark:border-yellow-800"
              role="region"
              aria-labelledby="xp-rewards-heading"
            >
              <h3 id="xp-rewards-heading" className="text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" aria-hidden="true" />
                XP Rewards
              </h3>
              <div className="space-y-3" role="list" aria-label="Available experience point rewards">
                {!isEnrolled && course.enrollXP && (
                  <div 
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-xl"
                    role="listitem"
                    aria-label={`Enroll in course to earn ${course.enrollXP} experience points`}
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">Enroll in course</span>
                    <span className="text-green-600 dark:text-green-400 font-bold" aria-hidden="true">+{course.enrollXP} XP</span>
                  </div>
                )}
                {course.xpPerLesson && (
                  <div 
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-xl"
                    role="listitem"
                    aria-label={`Earn ${course.xpPerLesson} experience points per lesson, ${lessons.length} lessons total`}
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">Per lesson ({lessons.length} total)</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold" aria-hidden="true">+{course.xpPerLesson} XP</span>
                  </div>
                )}
                {course.xpReward && (
                  <div 
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-xl border-2 border-yellow-300 dark:border-yellow-700"
                    role="listitem"
                    aria-label={`Complete entire course to earn ${course.xpReward} experience points bonus`}
                  >
                    <span className="text-sm text-gray-900 dark:text-white font-medium">Complete course</span>
                    <span className="text-yellow-700 dark:text-yellow-400 font-bold text-lg" aria-hidden="true">+{course.xpReward} XP</span>
                  </div>
                )}
                <div 
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-xl"
                  role="listitem"
                  aria-label="Submit review to earn 25 experience points"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">Submit review</span>
                  <span className="text-purple-600 dark:text-purple-400 font-bold" aria-hidden="true">+25 XP</span>
                </div>
              </div>
            </div>

            {/* XP Widget */}
            <XPWidget variant="full" />
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <Tabs defaultValue="curriculum" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid" role="tablist" aria-label="Course content sections">
          <TabsTrigger value="curriculum" role="tab" aria-controls="curriculum-panel">Curriculum</TabsTrigger>
          <TabsTrigger value="reviews" role="tab" aria-controls="reviews-panel">Reviews</TabsTrigger>
          <TabsTrigger value="about" role="tab" aria-controls="about-panel">About</TabsTrigger>
        </TabsList>

        {/* Curriculum Tab */}
        <TabsContent value="curriculum" className="mt-6" role="tabpanel" id="curriculum-panel" aria-labelledby="curriculum-tab">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1A1A1C] rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 id="curriculum-heading" className="text-gray-900 dark:text-white">Course Curriculum</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span aria-label={`Step ${completedLessons + 1} of ${lessons.length}`}>
                  Step {completedLessons + 1} of {lessons.length}
                </span>
              </div>
            </div>
            
            <nav 
              className="space-y-3"
              aria-label="Course lessons"
              role="navigation"
            >
              <ol className="space-y-3 list-none" role="list">
                {lessons.map((lesson, index) => {
                  const Icon = getLessonIcon(lesson.type);
                  const isNext = !lesson.isCompleted && !lesson.isLocked && index === completedLessons;
                  
                  return (
                    <li
                      key={lesson.id}
                      role="listitem"
                    >
                      <div
                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                          lesson.isLocked
                            ? 'border-gray-200 dark:border-gray-800 opacity-60'
                            : lesson.isCompleted
                            ? 'border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-900/10'
                            : isNext
                            ? 'border-yellow-400 dark:border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
                            : 'border-gray-200 dark:border-gray-800 hover:border-yellow-400 dark:hover:border-yellow-500 cursor-pointer'
                        }`}
                        aria-current={isNext ? 'step' : undefined}
                        aria-label={`Lesson ${index + 1}: ${lesson.title}. ${
                          lesson.isCompleted ? 'Completed' : 
                          lesson.isLocked ? 'Locked' : 
                          isNext ? 'Next lesson' : 'Available'
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div 
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              lesson.isCompleted
                                ? 'bg-green-500'
                                : lesson.isLocked
                                ? 'bg-gray-300 dark:bg-gray-700'
                                : isNext
                                ? 'bg-yellow-500'
                                : 'bg-blue-500'
                            }`}
                            aria-hidden="true"
                          >
                            {lesson.isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            ) : lesson.isLocked ? (
                              <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            ) : (
                              <Icon className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-900 dark:text-white">
                              {index + 1}. {lesson.title}
                              {isNext && (
                                <span className="ml-2 px-2 py-0.5 bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 text-xs rounded-full">
                                  Next
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {lesson.type} • {lesson.duration}
                            </p>
                          </div>
                        </div>
                        {!lesson.isLocked && !lesson.isCompleted && (
                          <Button 
                            size="sm" 
                            onClick={() => handleLessonComplete(lesson.id)}
                            className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 flex items-center gap-1.5"
                            aria-label={`Start lesson: ${lesson.title}${course.xpPerLesson ? ` and earn ${course.xpPerLesson} XP` : ''}`}
                          >
                            <PlayCircle className="w-3.5 h-3.5" aria-hidden="true" />
                            {isNext ? 'Start Next' : 'Start'}
                            {course.xpPerLesson && (
                              <span className="text-xs" aria-hidden="true">+{course.xpPerLesson} XP</span>
                            )}
                          </Button>
                        )}
                        {lesson.isCompleted && (
                          <div 
                            className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm"
                            role="status"
                            aria-label="Lesson completed"
                          >
                            <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                            <span>Completed</span>
                          </div>
                        )}
                        {lesson.isLocked && (
                          <div 
                            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm"
                            role="status"
                            aria-label="Lesson locked. Complete previous lessons to unlock"
                          >
                            <Lock className="w-4 h-4" aria-hidden="true" />
                            <span className="hidden sm:inline">Locked</span>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </nav>
            
            {/* Next/Previous Navigation */}
            {isEnrolled && (
              <div 
                className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between"
                role="navigation"
                aria-label="Lesson navigation"
              >
                <Button
                  variant="outline"
                  disabled={completedLessons === 0}
                  className="flex items-center gap-2"
                  aria-label="Go to previous lesson"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  Previous Lesson
                </Button>
                <Button
                  disabled={completedLessons >= lessons.length}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 flex items-center gap-2"
                  onClick={() => {
                    const nextLesson = lessons.find(l => !l.isCompleted && !l.isLocked);
                    if (nextLesson) handleLessonComplete(nextLesson.id);
                  }}
                  aria-label={completedLessons >= lessons.length ? 'All lessons completed' : 'Continue to next lesson'}
                >
                  {completedLessons >= lessons.length ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                      All Complete
                    </>
                  ) : (
                    <>
                      Next Lesson
                      <ArrowLeft className="w-4 h-4 rotate-180" aria-hidden="true" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="mt-6 space-y-6" role="tabpanel" id="reviews-panel" aria-labelledby="reviews-tab">
          {/* Rating Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1A1A1C] rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Average Rating */}
              <div className="text-center md:text-left" role="region" aria-labelledby="reviews-heading">
                <h2 id="reviews-heading" className="text-gray-900 dark:text-white mb-4">Student Reviews</h2>
                <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                  <div 
                    className="text-6xl text-gray-900 dark:text-white"
                    aria-label={`Average rating: ${course.rating} out of 5 stars`}
                  >
                    {course.rating}
                  </div>
                  <div>
                    <div 
                      className="flex gap-1 mb-2"
                      role="img"
                      aria-label={`${Math.round(course.rating)} out of 5 stars`}
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-6 h-6 ${
                            star <= Math.round(course.rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 dark:text-gray-700'
                          }`}
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {course.reviewsCount} reviews
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Leave a Review */}
              <div role="region" aria-labelledby="review-form-heading">
                <h3 id="review-form-heading" className="text-gray-900 dark:text-white mb-4">Leave a Review</h3>
                <form 
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRatingSubmit();
                  }}
                  aria-label="Submit course review"
                >
                  {/* Star Rating */}
                  <div>
                    <label 
                      id="rating-label"
                      className="text-sm text-gray-700 dark:text-gray-300 mb-2 block"
                    >
                      Your Rating
                    </label>
                    <div 
                      className="flex gap-2"
                      role="radiogroup"
                      aria-labelledby="rating-label"
                      aria-required="true"
                    >
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="transition-transform hover:scale-110"
                          role="radio"
                          aria-checked={userRating === star}
                          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= (hoveredRating || userRating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 dark:text-gray-700'
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Review Text */}
                  <div>
                    <label 
                      htmlFor="review-text"
                      className="text-sm text-gray-700 dark:text-gray-300 mb-2 block"
                    >
                      Your Review
                    </label>
                    <Textarea
                      id="review-text"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your experience with this course..."
                      className="min-h-[100px]"
                      aria-required="true"
                      aria-describedby="review-hint"
                    />
                    <p id="review-hint" className="sr-only">
                      Please provide detailed feedback about your learning experience
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={userRating === 0 || !reviewText.trim() || hasReviewedCourse(courseId)}
                    className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 disabled:opacity-50"
                    aria-label={hasReviewedCourse(courseId) ? 'Review already submitted' : `Submit review and earn 25 XP`}
                  >
                    {hasReviewedCourse(courseId) ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        Review Submitted
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Submit Review
                        <span className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-lg text-sm" aria-hidden="true">
                          <Zap className="w-3.5 h-3.5" fill="currentColor" />
                          +25 XP
                        </span>
                      </span>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>

          {/* Reviews List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
            role="region"
            aria-label="Student reviews list"
          >
            {reviews.map((review) => (
              <article
                key={review.id}
                className="bg-white dark:bg-[#1A1A1C] rounded-2xl p-6 border border-gray-200 dark:border-gray-800"
                aria-label={`Review by ${review.userName}`}
              >
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback 
                      className="bg-gradient-to-br from-blue-500 to-purple-500 text-white"
                      aria-label={`${review.userName} avatar`}
                    >
                      {review.userName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-gray-900 dark:text-white">{review.userName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <time dateTime={review.date}>{review.date}</time>
                        </p>
                      </div>
                      <div 
                        className="flex gap-1"
                        role="img"
                        aria-label={`Rated ${review.rating} out of 5 stars`}
                      >
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300 dark:text-gray-700'
                            }`}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{review.comment}</p>
                    <button 
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400"
                      aria-label={`Mark review as helpful. Currently ${review.helpful} people found this helpful`}
                    >
                      <span aria-hidden="true">👍</span> Helpful ({review.helpful})
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </motion.div>
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about" className="mt-6" role="tabpanel" id="about-panel" aria-labelledby="about-tab">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1A1A1C] rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-800"
          >
            <h2 id="about-heading" className="text-gray-900 dark:text-white mb-6">About This Course</h2>
            
            <div className="space-y-6">
              {/* What You'll Learn */}
              <section aria-labelledby="learning-outcomes-heading">
                <h3 id="learning-outcomes-heading" className="text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-yellow-500" aria-hidden="true" />
                  What You'll Learn
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3" role="list">
                  {[
                    'Master the fundamental concepts and principles',
                    'Build practical projects from scratch',
                    'Understand advanced techniques and patterns',
                    'Apply best practices in real-world scenarios',
                    'Gain hands-on experience with tools',
                    'Develop problem-solving skills',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3" role="listitem">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Requirements */}
              <section 
                className="pt-6 border-t border-gray-200 dark:border-gray-800"
                aria-labelledby="requirements-heading"
              >
                <h3 id="requirements-heading" className="text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" aria-hidden="true" />
                  Requirements
                </h3>
                <ul className="space-y-2" role="list">
                  {[
                    'Basic understanding of blockchain concepts',
                    'Willingness to learn and experiment',
                    'No prior experience required',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3" role="listitem">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0 mt-2" aria-hidden="true" />
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Tags */}
              <section 
                className="pt-6 border-t border-gray-200 dark:border-gray-800"
                aria-labelledby="tags-heading"
              >
                <h3 id="tags-heading" className="text-gray-900 dark:text-white mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2" role="list" aria-label="Course topics">
                  {course.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm"
                      role="listitem"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Related Learn Section - Cross Promotion */}
      <RelatedLearnSection
        courses={getMixedRelatedCourses({
          currentCategory: course.category,
          currentEcosystem: course.ecosystem,
          difficulty: course.difficulty,
          learnType: course.learnType
        })}
        title="Continue Your Learning Journey"
        onNavigate={onNavigate}
      />
    </main>
  );
}
