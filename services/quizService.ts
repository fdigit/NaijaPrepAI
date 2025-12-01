import { prisma } from '../lib/prisma';

export interface QuizAttemptData {
  userId: string;
  lessonId: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number; // Percentage (0-100)
  timeSpent?: number; // Seconds
  answers: Array<{
    questionIndex: number;
    selectedOption: number;
    isCorrect: boolean;
  }>;
}

/**
 * Save a quiz attempt to the database
 */
export const saveQuizAttempt = async (data: QuizAttemptData) => {
  try {
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: data.userId,
        lessonId: data.lessonId,
        totalQuestions: data.totalQuestions,
        correctAnswers: data.correctAnswers,
        score: data.score,
        timeSpent: data.timeSpent,
        answers: data.answers as any, // Store as JSON
      },
    });
    return attempt;
  } catch (error) {
    console.error('Error saving quiz attempt:', error);
    throw error;
  }
};

/**
 * Get quiz attempts for a user
 */
export const getUserQuizAttempts = async (userId: string) => {
  try {
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId },
      include: {
        lesson: {
          select: {
            id: true,
            subject: true,
            topicTitle: true,
            classLevel: true,
            term: true,
            week: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return attempts;
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    throw error;
  }
};

/**
 * Get quiz attempts grouped by subject
 */
export const getQuizAttemptsBySubject = async (userId: string) => {
  try {
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId },
      include: {
        lesson: {
          select: {
            subject: true,
          },
        },
      },
    });

    // If no attempts, return empty object
    if (attempts.length === 0) {
      return {};
    }

    // Group by subject
    const subjectStats: Record<
      string,
      {
        totalAttempts: number;
        totalQuestions: number;
        totalCorrect: number;
        averageScore: number;
        bestScore: number;
        worstScore: number;
        attempts: Array<{
          id: string;
          score: number;
          correctAnswers: number;
          totalQuestions: number;
          createdAt: Date;
          lessonTitle?: string;
        }>;
      }
    > = {};

    attempts.forEach((attempt) => {
      // Skip if lesson is null (shouldn't happen, but safety check)
      if (!attempt.lesson) {
        console.warn('Quiz attempt has no lesson:', attempt.id);
        return;
      }

      const subject = attempt.lesson.subject || 'Unknown';
      if (!subjectStats[subject]) {
        subjectStats[subject] = {
          totalAttempts: 0,
          totalQuestions: 0,
          totalCorrect: 0,
          averageScore: 0,
          bestScore: 0,
          worstScore: 100,
          attempts: [],
        };
      }

      const stats = subjectStats[subject];
      stats.totalAttempts += 1;
      stats.totalQuestions += attempt.totalQuestions;
      stats.totalCorrect += attempt.correctAnswers;
      stats.bestScore = Math.max(stats.bestScore, attempt.score);
      // Initialize worstScore on first attempt, then compare
      if (stats.totalAttempts === 1) {
        stats.worstScore = attempt.score;
      } else {
        stats.worstScore = Math.min(stats.worstScore, attempt.score);
      }

      stats.attempts.push({
        id: attempt.id,
        score: attempt.score,
        correctAnswers: attempt.correctAnswers,
        totalQuestions: attempt.totalQuestions,
        createdAt: attempt.createdAt,
      });
    });

    // Calculate averages
    Object.keys(subjectStats).forEach((subject) => {
      const stats = subjectStats[subject];
      stats.averageScore =
        stats.totalAttempts > 0 && stats.totalQuestions > 0
          ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100 * 100) / 100
          : 0;
    });

    return subjectStats;
  } catch (error) {
    console.error('Error fetching quiz attempts by subject:', error);
    throw error;
  }
};

/**
 * Get recent quiz attempts for a specific subject
 */
export const getRecentQuizAttemptsBySubject = async (
  userId: string,
  subject: string,
  limit: number = 10
) => {
  try {
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        lesson: {
          subject,
        },
      },
      include: {
        lesson: {
          select: {
            topicTitle: true,
            subject: true,
            classLevel: true,
            term: true,
            week: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
    return attempts;
  } catch (error) {
    console.error('Error fetching recent quiz attempts by subject:', error);
    throw error;
  }
};

