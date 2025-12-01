// 💥 CRITICAL FIX: Forces Next.js to use the Node.js environment
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { saveQuizAttempt } from '@/services/quizService';
import { awardXP, updateDailyStreak, checkAndAwardBadges, updateSubjectProgress, XP_VALUES } from '@/services/gamificationService';
import { recordQuizCompletion } from '@/services/studySessionService';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { lessonId, answers, timeSpent, totalQuestions: providedTotalQuestions } = body;

    if (!lessonId || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Missing required fields: lessonId and answers' },
        { status: 400 }
      );
    }

    // Validate lesson exists and get total questions
    const { prisma } = await import('@/lib/prisma');
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { 
        id: true,
        practiceQuestions: true,
        subject: true,
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Get total questions from lesson or use provided value
    let totalQuestions = providedTotalQuestions;
    if (!totalQuestions) {
      if (Array.isArray(lesson.practiceQuestions)) {
        totalQuestions = lesson.practiceQuestions.length;
      } else {
        // Fallback to answered questions count
        totalQuestions = answers.length;
      }
    }

    // Calculate score based on answered questions
    const answeredCount = answers.length;
    const correctAnswers = answers.filter((a: any) => a.isCorrect).length;
    // Score is percentage of correct answers out of total questions
    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    // Save quiz attempt
    const attempt = await saveQuizAttempt({
      userId: session.user.id,
      lessonId,
      totalQuestions,
      correctAnswers,
      score,
      timeSpent: timeSpent || undefined,
      answers,
    });

    // Award XP for completing quiz
    try {
      let xpEarned = XP_VALUES.COMPLETE_QUIZ;
      if (score === 100) {
        xpEarned += XP_VALUES.QUIZ_PERFECT_SCORE; // Bonus for perfect score
      }
      
      await awardXP(session.user.id, xpEarned, `Completed quiz (${score.toFixed(0)}%)`);
      await updateDailyStreak(session.user.id);
      
      // Record study session for weekly progress
      await recordQuizCompletion(session.user.id, lessonId, timeSpent);
      
      // Update subject progress
      await updateSubjectProgress(session.user.id, lesson.subject, {
        quizzesPassed: 1,
        xpEarned,
      });
      
      // Check for badges
      const user = await import('@/lib/prisma').then(m => m.prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          quizAttempts: { select: { id: true, score: true } },
        },
      }));
      
      if (user) {
        const perfectQuizzes = user.quizAttempts.filter(q => q.score === 100).length;
        await checkAndAwardBadges(session.user.id, {
          quizzesCompleted: user.quizAttempts.length,
          perfectQuizzes,
          subject: lesson.subject,
        });
      }
    } catch (gamificationError) {
      // Don't fail quiz save if gamification fails
      console.error('Gamification error:', gamificationError);
    }

    return NextResponse.json({
      success: true,
      attempt: {
        id: attempt.id,
        score,
        correctAnswers,
        totalQuestions,
        createdAt: attempt.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error saving quiz attempt:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save quiz attempt',
        details: error?.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

