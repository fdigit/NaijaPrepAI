// 💥 CRITICAL FIX: Forces Next.js to use the Node.js environment
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import {
  generateExamPrep,
  getExamPreps,
  deleteExamPrep,
  getExamPrepAttemptStats,
} from '@/services/examPrepService';
import { ClassLevel as PrismaClassLevel } from '@prisma/client';
import { ClassLevel as TSClassLevel } from '@/types';

/**
 * GET /api/exam-prep
 * Get all exam preps for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const classLevelParam = searchParams.get('classLevel');
    const isActiveParam = searchParams.get('isActive');

    const filters: any = {};
    if (subject && subject !== 'all') filters.subject = subject;
    if (classLevelParam && classLevelParam !== 'all') {
      // Convert TypeScript ClassLevel format (JSS 1) to Prisma format (JSS1)
      const normalized = classLevelParam.replace(/\s+/g, '').toUpperCase();
      filters.classLevel = normalized as PrismaClassLevel;
    }
    // Only filter by isActive if explicitly provided
    if (isActiveParam !== null && isActiveParam !== undefined) {
      filters.isActive = isActiveParam === 'true';
    }

    const examPreps = await getExamPreps(session.user.id, filters);
    
    console.log(`[Exam Prep API] Found ${examPreps.length} exam preps for user ${session.user.id}`);

    // Get attempt statistics for each exam prep
    const examPrepsWithAttempts = await Promise.all(
      examPreps.map(async (examPrep) => {
        try {
          const attemptStats = await getExamPrepAttemptStats(session.user.id, examPrep.id);
          return {
            id: examPrep.id,
            subject: examPrep.subject,
            classLevel: examPrep.classLevel,
            examName: examPrep.examName,
            totalQuestions: examPrep.totalQuestions,
            topicsCovered: examPrep.topicsCovered,
            createdAt: examPrep.createdAt.toISOString(),
            isActive: examPrep.isActive,
            attemptCount: attemptStats.attemptCount,
            lastAttempt: attemptStats.lastAttempt
              ? {
                  score: attemptStats.lastAttempt.score,
                  correctAnswers: attemptStats.lastAttempt.correctAnswers,
                  totalQuestions: attemptStats.lastAttempt.totalQuestions,
                  createdAt: attemptStats.lastAttempt.createdAt.toISOString(),
                }
              : null,
            bestAttempt: attemptStats.bestAttempt
              ? {
                  score: attemptStats.bestAttempt.score,
                  correctAnswers: attemptStats.bestAttempt.correctAnswers,
                  totalQuestions: attemptStats.bestAttempt.totalQuestions,
                  createdAt: attemptStats.bestAttempt.createdAt.toISOString(),
                }
              : null,
          };
        } catch (error) {
          console.error(`Error getting attempt stats for exam prep ${examPrep.id}:`, error);
          return {
            id: examPrep.id,
            subject: examPrep.subject,
            classLevel: examPrep.classLevel,
            examName: examPrep.examName,
            totalQuestions: examPrep.totalQuestions,
            topicsCovered: examPrep.topicsCovered,
            createdAt: examPrep.createdAt.toISOString(),
            isActive: examPrep.isActive,
            attemptCount: 0,
            lastAttempt: null,
            bestAttempt: null,
          };
        }
      })
    );

    return NextResponse.json({ examPreps: examPrepsWithAttempts });
  } catch (error: any) {
    console.error('Error fetching exam preps:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch exam preps' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/exam-prep
 * Generate a new exam prep
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subject, classLevel, examName, questionCount } = body;

    if (!subject) {
      return NextResponse.json(
        { error: 'Subject is required' },
        { status: 400 }
      );
    }

    // Auto-detect class level from user profile if not provided
    let finalClassLevel: TSClassLevel;
    
    if (classLevel) {
      // User provided class level - validate it
      const validClassLevels = Object.values(TSClassLevel);
      if (!validClassLevels.includes(classLevel as TSClassLevel)) {
        return NextResponse.json(
          { error: 'Invalid class level' },
          { status: 400 }
        );
      }
      finalClassLevel = classLevel as TSClassLevel;
    } else {
      // Auto-detect from user profile
      const { prisma } = await import('@/lib/prisma');
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { classLevel: true },
      });
      
      if (!user?.classLevel) {
        return NextResponse.json(
          { error: 'Class level is required. Please set your class level in Settings first.' },
          { status: 400 }
        );
      }
      
      // Map Prisma ClassLevel (JSS1, JSS2, etc.) to TypeScript ClassLevel (JSS 1, JSS 2, etc.)
      const prismaToTsMap: Record<string, TSClassLevel> = {
        'JSS1': TSClassLevel.JSS1,
        'JSS2': TSClassLevel.JSS2,
        'JSS3': TSClassLevel.JSS3,
        'SSS1': TSClassLevel.SSS1,
        'SSS2': TSClassLevel.SSS2,
        'SSS3': TSClassLevel.SSS3,
      };
      finalClassLevel = prismaToTsMap[user.classLevel] || TSClassLevel.SSS1;
    }

    const examPrep = await generateExamPrep(
      session.user.id,
      subject,
      finalClassLevel as TSClassLevel,
      examName,
      questionCount || 50
    );

    return NextResponse.json({ examPrep }, { status: 201 });
  } catch (error: any) {
    console.error('Error generating exam prep:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate exam prep' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/exam-prep?id=...
 * Delete an exam prep
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Exam prep ID is required' },
        { status: 400 }
      );
    }

    await deleteExamPrep(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting exam prep:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete exam prep' },
      { status: 500 }
    );
  }
}

