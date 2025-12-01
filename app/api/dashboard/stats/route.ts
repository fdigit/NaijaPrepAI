// 💥 CRITICAL FIX: Forces Next.js to use the Node.js environment
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Don't pass request - auth() automatically reads from request context
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = request.nextUrl.searchParams.get('userId') || session.user.id;

    // Get total lessons
    const totalLessons = await prisma.lesson.count({
      where: { userId },
    });

    // Calculate study streak (consecutive days with study sessions)
    const studySessions = await prisma.studySession.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 30, // Check last 30 days
    });

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);

      const hasSession = studySessions.some((session) => {
        const sessionDate = new Date(session.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === checkDate.getTime();
      });

      if (hasSession) {
        streak++;
      } else if (i > 0) {
        // Break streak if we hit a day without study
        break;
      }
    }

    // Calculate overall progress (based on quiz attempts)
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId },
    });

    const overallProgress =
      quizAttempts.length > 0
        ? Math.round(
            (quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) /
              quizAttempts.length) *
              100
          ) / 100
        : 0;

    return NextResponse.json({
      totalLessons,
      studyStreak: streak,
      overallProgress,
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    console.error('Error details:', error?.message, error?.stack);
    return NextResponse.json(
      { 
        error: 'Failed to fetch stats',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

