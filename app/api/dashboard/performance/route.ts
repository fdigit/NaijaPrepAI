// 💥 CRITICAL FIX: Forces Next.js to use the Node.js environment
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = request.nextUrl.searchParams.get('userId') || session.user.id;

    // Get all quiz attempts with lesson data
    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId },
      include: {
        lesson: {
          select: {
            subject: true,
          },
        },
      },
    });

    if (quizAttempts.length === 0) {
      return NextResponse.json({
        strengths: [],
        weaknesses: [],
        averageScore: 0,
      });
    }

    // Calculate average score
    const averageScore = Math.round(
      (quizAttempts.reduce((sum, attempt) => sum + attempt.score, 0) /
        quizAttempts.length) *
        100
    ) / 100;

    // Group by subject and calculate averages
    const subjectScores: Record<string, { total: number; count: number }> = {};

    quizAttempts.forEach((attempt) => {
      const subject = attempt.lesson?.subject || 'Unknown';
      if (!subjectScores[subject]) {
        subjectScores[subject] = { total: 0, count: 0 };
      }
      subjectScores[subject].total += attempt.score;
      subjectScores[subject].count += 1;
    });

    // Calculate average per subject
    const subjectAverages = Object.entries(subjectScores).map(([subject, data]) => ({
      subject,
      score: Math.round((data.total / data.count) * 100) / 100,
    }));

    // Sort and get top 3 strengths and weaknesses
    const sorted = subjectAverages.sort((a, b) => b.score - a.score);
    const strengths = sorted.slice(0, 3);
    const weaknesses = sorted.slice(-3).reverse();

    return NextResponse.json({
      strengths,
      weaknesses,
      averageScore,
    });
  } catch (error: any) {
    console.error('Error fetching performance:', error);
    console.error('Error details:', error?.message, error?.stack);
    return NextResponse.json(
      { 
        error: 'Failed to fetch performance',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

