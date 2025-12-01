import { prisma } from '../lib/prisma';
import { ClassLevel as PrismaClassLevel } from '@prisma/client';
import { ExamQuestion, ClassLevel } from '../types';
import { generateExamQuestions } from './geminiService';

/**
 * Convert TypeScript ClassLevel enum to Prisma ClassLevel enum
 */
function mapClassLevelToPrisma(classLevel: ClassLevel): PrismaClassLevel {
  const normalized = classLevel.replace(/\s+/g, '').toUpperCase();
  if (normalized === 'JSS1') return PrismaClassLevel.JSS1;
  if (normalized === 'JSS2') return PrismaClassLevel.JSS2;
  if (normalized === 'JSS3') return PrismaClassLevel.JSS3;
  if (normalized === 'SSS1') return PrismaClassLevel.SSS1;
  if (normalized === 'SSS2') return PrismaClassLevel.SSS2;
  if (normalized === 'SSS3') return PrismaClassLevel.SSS3;
  return PrismaClassLevel.SSS1;
}

/**
 * Get all lessons for a specific subject and user
 */
export async function getLessonsBySubject(
  userId: string,
  subject: string,
  classLevel?: ClassLevel
) {
  try {
    const prismaClassLevel = classLevel ? mapClassLevelToPrisma(classLevel) : undefined;
    const lessons = await prisma.lesson.findMany({
      where: {
        userId,
        subject,
        ...(prismaClassLevel && { classLevel: prismaClassLevel }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return lessons;
  } catch (error) {
    console.error('Error fetching lessons by subject:', error);
    throw error;
  }
}

/**
 * Aggregate lesson content for AI processing
 */
export interface AggregatedContent {
  topics: string[];
  fullContent: string;
  summaryPoints: string[];
  lessonCount: number;
}

export function aggregateLessonContent(lessons: any[]): AggregatedContent {
  if (lessons.length === 0) {
    return {
      topics: [],
      fullContent: '',
      summaryPoints: [],
      lessonCount: 0,
    };
  }

  const topics: string[] = [];
  const summaryPoints: string[] = [];
  const contentParts: string[] = [];

  lessons.forEach((lesson) => {
    // Collect topics
    if (lesson.topic && !topics.includes(lesson.topic)) {
      topics.push(lesson.topic);
    }
    if (lesson.topicTitle && !topics.includes(lesson.topicTitle)) {
      topics.push(lesson.topicTitle);
    }

    // Collect summary points
    if (lesson.summaryPoints && Array.isArray(lesson.summaryPoints)) {
      summaryPoints.push(...lesson.summaryPoints);
    }

    // Collect main content with topic header
    if (lesson.mainContent) {
      contentParts.push(
        `\n## Topic: ${lesson.topicTitle || lesson.topic}\n\n${lesson.mainContent}`
      );
    }
  });

  return {
    topics: [...new Set(topics)], // Remove duplicates
    fullContent: contentParts.join('\n\n'),
    summaryPoints: [...new Set(summaryPoints)], // Remove duplicates
    lessonCount: lessons.length,
  };
}

/**
 * Generate exam questions using AI
 */
export async function generateExamPrep(
  userId: string,
  subject: string,
  classLevel: ClassLevel,
  examName?: string,
  questionCount: number = 50
) {
  try {
    // 1. Get all lessons for this subject
    const lessons = await getLessonsBySubject(userId, subject, classLevel);

    if (lessons.length === 0) {
      throw new Error(
        `No lessons found for subject "${subject}". Please create some lessons first.`
      );
    }

    // 2. Aggregate lesson content
    const aggregatedContent = aggregateLessonContent(lessons);

    // 3. Generate questions using AI
    // Convert to Prisma ClassLevel for generateExamQuestions
    const prismaClassLevelForAI = mapClassLevelToPrisma(classLevel);
    const questions = await generateExamQuestions(
      subject,
      prismaClassLevelForAI,
      aggregatedContent,
      questionCount
    );

    // 4. Extract topics covered from lessons
    const topicsCovered = aggregatedContent.topics;

    // 5. Save to database
    const prismaClassLevel = mapClassLevelToPrisma(classLevel);
    const examPrep = await prisma.examPrep.create({
      data: {
        userId,
        subject,
        classLevel: prismaClassLevel,
        examName: examName || `${subject} Exam Prep`,
        sourceLessonIds: lessons.map((l) => l.id),
        questions: questions as any,
        totalQuestions: questions.length,
        topicsCovered,
        isActive: true,
      },
    });

    return examPrep;
  } catch (error) {
    console.error('Error generating exam prep:', error);
    throw error;
  }
}

/**
 * Get exam preps for a user
 */
export async function getExamPreps(
  userId: string,
  filters?: {
    subject?: string;
    classLevel?: PrismaClassLevel;
    isActive?: boolean;
  }
) {
  try {
    const whereClause: any = {
      userId,
    };
    
    if (filters?.subject) {
      whereClause.subject = filters.subject;
    }
    
    if (filters?.classLevel) {
      whereClause.classLevel = filters.classLevel;
    }
    
    // Default to showing only active exams if not specified
    if (filters?.isActive !== undefined) {
      whereClause.isActive = filters.isActive;
    } else {
      // Default: show only active exams
      whereClause.isActive = true;
    }
    
    const examPreps = await prisma.examPrep.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return examPreps;
  } catch (error) {
    console.error('Error fetching exam preps:', error);
    throw error;
  }
}

/**
 * Get a specific exam prep by ID
 */
export async function getExamPrepById(id: string, userId?: string) {
  try {
    const examPrep = await prisma.examPrep.findUnique({
      where: { id },
    });

    // Verify ownership if userId provided
    if (examPrep && userId && examPrep.userId !== userId) {
      throw new Error('Unauthorized access to exam prep');
    }

    return examPrep;
  } catch (error) {
    console.error('Error fetching exam prep:', error);
    throw error;
  }
}

/**
 * Delete an exam prep
 */
export async function deleteExamPrep(id: string, userId: string) {
  try {
    // Verify ownership
    const examPrep = await prisma.examPrep.findUnique({
      where: { id },
    });

    if (!examPrep) {
      throw new Error('Exam prep not found');
    }

    if (examPrep.userId !== userId) {
      throw new Error('Unauthorized: Cannot delete this exam prep');
    }

    await prisma.examPrep.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting exam prep:', error);
    throw error;
  }
}

/**
 * Calculate exam results
 */
export interface ExamAttempt {
  questionIndex: number;
  selectedOption: number;
}

export interface ExamResult {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  results: Array<{
    questionIndex: number;
    isCorrect: boolean;
    selectedOption: number;
    correctOption: number;
    explanation: string;
    question: string;
  }>;
}

export function calculateExamResults(
  questions: ExamQuestion[],
  answers: ExamAttempt[]
): ExamResult {
  let correctAnswers = 0;
  const results: ExamResult['results'] = [];

  questions.forEach((question, index) => {
    const answer = answers.find((a) => a.questionIndex === index);
    const selectedOption = answer?.selectedOption ?? -1;
    const isCorrect = selectedOption === question.correctOptionIndex;

    if (isCorrect) {
      correctAnswers++;
    }

    results.push({
      questionIndex: index,
      isCorrect,
      selectedOption,
      correctOption: question.correctOptionIndex,
      explanation: question.explanation,
      question: question.question,
    });
  });

  const score = questions.length > 0 ? (correctAnswers / questions.length) * 100 : 0;

  return {
    score: Math.round(score * 100) / 100, // Round to 2 decimal places
    correctAnswers,
    totalQuestions: questions.length,
    results,
  };
}

/**
 * Save an exam prep attempt
 */
export interface ExamPrepAttemptData {
  userId: string;
  examPrepId: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number; // Percentage
  timeSpent?: number; // Seconds
  answers: ExamAttempt[];
}

export async function saveExamPrepAttempt(data: ExamPrepAttemptData) {
  try {
    const attempt = await prisma.examPrepAttempt.create({
      data: {
        userId: data.userId,
        examPrepId: data.examPrepId,
        totalQuestions: data.totalQuestions,
        correctAnswers: data.correctAnswers,
        score: data.score,
        timeSpent: data.timeSpent,
        answers: data.answers as any, // Store as JSON
      },
    });
    return attempt;
  } catch (error) {
    console.error('Error saving exam prep attempt:', error);
    throw error;
  }
}

/**
 * Get the best attempt for an exam prep
 */
export async function getBestExamPrepAttempt(userId: string, examPrepId: string) {
  try {
    const attempt = await prisma.examPrepAttempt.findFirst({
      where: {
        userId,
        examPrepId,
      },
      orderBy: {
        score: 'desc', // Get highest score
      },
    });
    return attempt;
  } catch (error) {
    console.error('Error fetching best exam prep attempt:', error);
    throw error;
  }
}

/**
 * Get all attempts for an exam prep
 */
export async function getExamPrepAttempts(userId: string, examPrepId: string) {
  try {
    const attempts = await prisma.examPrepAttempt.findMany({
      where: {
        userId,
        examPrepId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return attempts;
  } catch (error) {
    console.error('Error fetching exam prep attempts:', error);
    throw error;
  }
}

/**
 * Get attempt statistics for an exam prep
 */
export async function getExamPrepAttemptStats(userId: string, examPrepId: string) {
  try {
    console.log(`[getExamPrepAttemptStats] Checking attempts for userId: ${userId}, examPrepId: ${examPrepId}`);
    
    const attempts = await prisma.examPrepAttempt.findMany({
      where: {
        userId,
        examPrepId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(`[getExamPrepAttemptStats] Found ${attempts.length} attempts`);

    if (attempts.length === 0) {
      return {
        attemptCount: 0,
        bestAttempt: null,
        lastAttempt: null,
      };
    }

    const bestAttempt = attempts.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    const stats = {
      attemptCount: attempts.length,
      bestAttempt: {
        score: bestAttempt.score,
        correctAnswers: bestAttempt.correctAnswers,
        totalQuestions: bestAttempt.totalQuestions,
        createdAt: bestAttempt.createdAt,
      },
      lastAttempt: {
        score: attempts[0].score, // First one is most recent due to orderBy desc
        correctAnswers: attempts[0].correctAnswers,
        totalQuestions: attempts[0].totalQuestions,
        createdAt: attempts[0].createdAt,
      },
    };
    
    console.log(`[getExamPrepAttemptStats] Returning stats:`, stats);
    return stats;
  } catch (error) {
    console.error('Error fetching exam prep attempt stats:', error);
    throw error;
  }
}

