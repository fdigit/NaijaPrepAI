import { prisma } from '../lib/prisma';

/**
 * Gamification Service
 * Handles XP points, badges, streaks, and achievements
 */

// XP Point Values
export const XP_VALUES = {
  GENERATE_LESSON: 50,
  COMPLETE_QUIZ: 30,
  QUIZ_PERFECT_SCORE: 50, // Bonus for 100% quiz score
  COMPLETE_EXAM_PREP: 100,
  EXAM_PREP_HIGH_SCORE: 150, // Bonus for 80%+ exam score
  DAILY_STREAK_BONUS: 10, // Bonus XP per day of streak
} as const;

// Badge Definitions
export const BADGES = {
  // Learning Badges
  FIRST_LESSON: { id: 'first_lesson', name: 'First Steps', description: 'Generated your first lesson', icon: '🎯' },
  FAST_LEARNER: { id: 'fast_learner', name: 'Fast Learner', description: 'Completed 5 quizzes in one day', icon: '⚡' },
  CONSISTENT_STUDENT: { id: 'consistent_student', name: 'Consistent Student', description: '7-day study streak', icon: '🔥' },
  DEDICATED_LEARNER: { id: 'dedicated_learner', name: 'Dedicated Learner', description: '30-day study streak', icon: '💪' },
  
  // Subject Mastery Badges
  MATH_GURU: { id: 'math_guru', name: 'Mathematics Guru', description: 'Completed 10 Mathematics lessons', icon: '📐' },
  SCIENCE_MASTER: { id: 'science_master', name: 'Science Master', description: 'Completed 10 Science lessons', icon: '🔬' },
  ENGLISH_EXPERT: { id: 'english_expert', name: 'English Expert', description: 'Completed 10 English lessons', icon: '📚' },
  
  // Achievement Badges
  QUIZ_MASTER: { id: 'quiz_master', name: 'Quiz Master', description: 'Scored 100% on 5 quizzes', icon: '🏆' },
  EXAM_CHAMPION: { id: 'exam_champion', name: 'Exam Champion', description: 'Scored 90%+ on an exam prep', icon: '👑' },
  LESSON_CREATOR: { id: 'lesson_creator', name: 'Lesson Creator', description: 'Generated 20 lessons', icon: '✨' },
  XP_LEGEND: { id: 'xp_legend', name: 'XP Legend', description: 'Reached 10,000 XP points', icon: '🌟' },
} as const;

// Level thresholds (XP required for each level)
const LEVEL_THRESHOLDS = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  1000,   // Level 5
  2000,   // Level 6
  3500,   // Level 7
  5500,   // Level 8
  8000,   // Level 9
  10000,  // Level 10
  15000,  // Level 11
  20000,  // Level 12
  30000,  // Level 13
  40000,  // Level 14
  50000,  // Level 15
];

/**
 * Calculate user level based on XP
 */
export function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * Calculate XP needed for next level
 */
export function getXPForNextLevel(currentXP: number): number {
  const currentLevel = calculateLevel(currentXP);
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return 0; // Max level
  }
  return LEVEL_THRESHOLDS[currentLevel] - currentXP;
}

/**
 * Award XP to user
 */
export async function awardXP(
  userId: string,
  xpAmount: number,
  reason: string
): Promise<{ newXP: number; newLevel: number; leveledUp: boolean }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xpPoints: true, level: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const newXP = user.xpPoints + xpAmount;
  const oldLevel = user.level;
  const newLevel = calculateLevel(newXP);
  const leveledUp = newLevel > oldLevel;

  await prisma.user.update({
    where: { id: userId },
    data: {
      xpPoints: newXP,
      level: newLevel,
    },
  });

  // Check for level-based badges
  if (leveledUp) {
    await checkAndAwardBadges(userId, { level: newLevel });
  }

  return { newXP, newLevel, leveledUp };
}

/**
 * Update daily streak
 */
export async function updateDailyStreak(userId: string): Promise<{ streak: number; isNewStreak: boolean }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { dailyStreak: true, lastActivityDate: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActivity = user.lastActivityDate
    ? new Date(user.lastActivityDate)
    : null;
  if (lastActivity) {
    lastActivity.setHours(0, 0, 0, 0);
  }

  let newStreak = user.dailyStreak;
  let isNewStreak = false;

  if (!lastActivity) {
    // First activity
    newStreak = 1;
    isNewStreak = true;
  } else {
    const daysDiff = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      // Same day, no change
      newStreak = user.dailyStreak;
    } else if (daysDiff === 1) {
      // Consecutive day
      newStreak = user.dailyStreak + 1;
      isNewStreak = true;
    } else {
      // Streak broken
      newStreak = 1;
      isNewStreak = true;
    }
  }

  // Award streak bonus XP
  if (isNewStreak && newStreak > 1) {
    const streakBonus = (newStreak - 1) * XP_VALUES.DAILY_STREAK_BONUS;
    await awardXP(userId, streakBonus, `Daily streak bonus (${newStreak} days)`);
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      dailyStreak: newStreak,
      lastActivityDate: today,
    },
  });

  // Check for streak-based badges
  await checkAndAwardBadges(userId, { streak: newStreak });

  return { streak: newStreak, isNewStreak };
}

/**
 * Award a badge to user
 */
export async function awardBadge(
  userId: string,
  badgeId: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { badges: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Check if badge already awarded
  if (user.badges.includes(badgeId)) {
    return false;
  }

  const updatedBadges = [...user.badges, badgeId];
  await prisma.user.update({
    where: { id: userId },
    data: {
      badges: updatedBadges,
    },
  });

  return true;
}

/**
 * Check and award badges based on achievements
 */
export async function checkAndAwardBadges(
  userId: string,
  context: {
    level?: number;
    streak?: number;
    lessonsGenerated?: number;
    quizzesCompleted?: number;
    perfectQuizzes?: number;
    subject?: string;
    subjectLessons?: number;
    examScore?: number;
    totalXP?: number;
  }
): Promise<string[]> {
  const awardedBadges: string[] = [];

  // Get current user stats
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      badges: true,
      xpPoints: true,
      lessons: { select: { id: true, subject: true } },
      quizAttempts: {
        select: { id: true, score: true },
      },
      examPrepAttempts: {
        select: { id: true, score: true },
      },
    },
  });

  if (!user) {
    return awardedBadges;
  }

  // Level-based badges
  if (context.level && context.level >= 10) {
    if (!user.badges.includes(BADGES.XP_LEGEND.id)) {
      await awardBadge(userId, BADGES.XP_LEGEND.id);
      awardedBadges.push(BADGES.XP_LEGEND.id);
    }
  }

  // Streak-based badges
  if (context.streak) {
    if (context.streak >= 7 && !user.badges.includes(BADGES.CONSISTENT_STUDENT.id)) {
      await awardBadge(userId, BADGES.CONSISTENT_STUDENT.id);
      awardedBadges.push(BADGES.CONSISTENT_STUDENT.id);
    }
    if (context.streak >= 30 && !user.badges.includes(BADGES.DEDICATED_LEARNER.id)) {
      await awardBadge(userId, BADGES.DEDICATED_LEARNER.id);
      awardedBadges.push(BADGES.DEDICATED_LEARNER.id);
    }
  }

  // Lesson-based badges
  const lessonsCount = user.lessons.length;
  if (lessonsCount >= 1 && !user.badges.includes(BADGES.FIRST_LESSON.id)) {
    await awardBadge(userId, BADGES.FIRST_LESSON.id);
    awardedBadges.push(BADGES.FIRST_LESSON.id);
  }
  if (lessonsCount >= 20 && !user.badges.includes(BADGES.LESSON_CREATOR.id)) {
    await awardBadge(userId, BADGES.LESSON_CREATOR.id);
    awardedBadges.push(BADGES.LESSON_CREATOR.id);
  }

  // Quiz-based badges
  const perfectQuizzes = user.quizAttempts.filter((q) => q.score === 100).length;
  if (perfectQuizzes >= 5 && !user.badges.includes(BADGES.QUIZ_MASTER.id)) {
    await awardBadge(userId, BADGES.QUIZ_MASTER.id);
    awardedBadges.push(BADGES.QUIZ_MASTER.id);
  }

  // Subject-based badges
  if (context.subject) {
    const subjectLessons = user.lessons.filter((l) => l.subject === context.subject).length;
    if (context.subject === 'Mathematics' && subjectLessons >= 10 && !user.badges.includes(BADGES.MATH_GURU.id)) {
      await awardBadge(userId, BADGES.MATH_GURU.id);
      awardedBadges.push(BADGES.MATH_GURU.id);
    }
    if (['Physics', 'Chemistry', 'Biology'].includes(context.subject) && subjectLessons >= 10 && !user.badges.includes(BADGES.SCIENCE_MASTER.id)) {
      await awardBadge(userId, BADGES.SCIENCE_MASTER.id);
      awardedBadges.push(BADGES.SCIENCE_MASTER.id);
    }
    if (context.subject === 'English' && subjectLessons >= 10 && !user.badges.includes(BADGES.ENGLISH_EXPERT.id)) {
      await awardBadge(userId, BADGES.ENGLISH_EXPERT.id);
      awardedBadges.push(BADGES.ENGLISH_EXPERT.id);
    }
  }

  // Exam-based badges
  if (context.examScore && context.examScore >= 90) {
    if (!user.badges.includes(BADGES.EXAM_CHAMPION.id)) {
      await awardBadge(userId, BADGES.EXAM_CHAMPION.id);
      awardedBadges.push(BADGES.EXAM_CHAMPION.id);
    }
  }

  return awardedBadges;
}

/**
 * Update subject progress
 */
export async function updateSubjectProgress(
  userId: string,
  subject: string,
  update: {
    lessonsCompleted?: number;
    quizzesPassed?: number;
    xpEarned?: number;
  }
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subjectProgress: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const progress = (user.subjectProgress as Record<string, any>) || {};
  const subjectData = progress[subject] || {
    lessonsCompleted: 0,
    quizzesPassed: 0,
    xpEarned: 0,
  };

  if (update.lessonsCompleted !== undefined) {
    subjectData.lessonsCompleted = (subjectData.lessonsCompleted || 0) + update.lessonsCompleted;
  }
  if (update.quizzesPassed !== undefined) {
    subjectData.quizzesPassed = (subjectData.quizzesPassed || 0) + update.quizzesPassed;
  }
  if (update.xpEarned !== undefined) {
    subjectData.xpEarned = (subjectData.xpEarned || 0) + update.xpEarned;
  }

  progress[subject] = subjectData;

  await prisma.user.update({
    where: { id: userId },
    data: {
      subjectProgress: progress as any,
    },
  });
}

/**
 * Get user gamification stats
 */
export async function getUserGamificationStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      xpPoints: true,
      level: true,
      badges: true,
      dailyStreak: true,
      lastActivityDate: true,
      subjectProgress: true,
      lessons: {
        select: { id: true, subject: true },
      },
      quizAttempts: {
        select: { id: true, score: true, createdAt: true },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const xpForNextLevel = getXPForNextLevel(user.xpPoints);
  const progressToNextLevel = user.level < LEVEL_THRESHOLDS.length
    ? ((user.xpPoints - LEVEL_THRESHOLDS[user.level - 1]) / (LEVEL_THRESHOLDS[user.level] - LEVEL_THRESHOLDS[user.level - 1])) * 100
    : 100;

  // Get badge details
  const badgeDetails = user.badges.map((badgeId) => {
    const badge = Object.values(BADGES).find((b) => b.id === badgeId);
    return badge || null;
  }).filter(Boolean);

  return {
    xp: user.xpPoints,
    level: user.level,
    xpForNextLevel,
    progressToNextLevel,
    badges: badgeDetails,
    dailyStreak: user.dailyStreak,
    lastActivityDate: user.lastActivityDate,
    subjectProgress: user.subjectProgress || {},
    totalLessons: user.lessons.length,
    totalQuizzes: user.quizAttempts.length,
    perfectQuizzes: user.quizAttempts.filter((q) => q.score === 100).length,
  };
}

