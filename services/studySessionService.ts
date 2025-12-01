import { prisma } from '../lib/prisma';

/**
 * Study Session Service
 * Tracks user study activities for weekly progress
 */

/**
 * Create or update a study session for today
 * This ensures we track daily activity for weekly progress
 */
export async function recordStudySession(
  userId: string,
  options?: {
    lessonId?: string;
    duration?: number; // Minutes
  }
): Promise<void> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if a session already exists for today
    const existingSession = await prisma.studySession.findFirst({
      where: {
        userId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Next day
        },
      },
    });

    if (existingSession) {
      // Update existing session - add duration if provided
      if (options?.duration) {
        await prisma.studySession.update({
          where: { id: existingSession.id },
          data: {
            duration: existingSession.duration + options.duration,
            ...(options.lessonId && { lessonId: options.lessonId }),
          },
        });
      }
    } else {
      // Create new session for today
      await prisma.studySession.create({
        data: {
          userId,
          date: today,
          duration: options?.duration || 5, // Default 5 minutes for any activity
          ...(options?.lessonId && { lessonId: options.lessonId }),
        },
      });
    }
  } catch (error) {
    // Don't fail the main operation if study session tracking fails
    console.error('Error recording study session:', error);
  }
}

/**
 * Record study session when user generates a lesson
 */
export async function recordLessonGeneration(userId: string, lessonId: string): Promise<void> {
  await recordStudySession(userId, {
    lessonId,
    duration: 10, // Generating a lesson counts as ~10 minutes of study
  });
}

/**
 * Record study session when user completes a quiz
 */
export async function recordQuizCompletion(
  userId: string,
  lessonId: string,
  timeSpent?: number
): Promise<void> {
  // Convert seconds to minutes, or default to 5 minutes
  const duration = timeSpent ? Math.max(1, Math.round(timeSpent / 60)) : 5;
  
  await recordStudySession(userId, {
    lessonId,
    duration,
  });
}

/**
 * Record study session when user completes an exam prep
 */
export async function recordExamPrepCompletion(
  userId: string,
  timeSpent?: number
): Promise<void> {
  // Convert seconds to minutes, or default to 15 minutes for exam prep
  const duration = timeSpent ? Math.max(1, Math.round(timeSpent / 60)) : 15;
  
  await recordStudySession(userId, {
    duration,
  });
}

/**
 * Get weekly study statistics
 */
export async function getWeeklyStats(userId: string) {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const sessions = await prisma.studySession.findMany({
    where: {
      userId,
      date: {
        gte: startOfWeek,
        lte: endOfWeek,
      },
    },
    include: {
      lesson: {
        select: {
          subject: true,
        },
      },
    },
  });

  const totalMinutes = sessions.reduce((sum, session) => sum + session.duration, 0);
  const uniqueDays = new Set(
    sessions.map((s) => {
      const d = new Date(s.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  ).size;

  return {
    totalSessions: sessions.length,
    totalMinutes,
    totalHours: Math.round((totalMinutes / 60) * 10) / 10,
    daysActive: uniqueDays,
    sessions,
  };
}

