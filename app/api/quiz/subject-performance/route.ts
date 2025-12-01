// 💥 CRITICAL FIX: Forces Next.js to use the Node.js environment
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { getQuizAttemptsBySubject } from '@/services/quizService';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = request.nextUrl.searchParams.get('userId') || session.user.id;

    const subjectStats = await getQuizAttemptsBySubject(userId);

    // Convert to array format for easier frontend consumption
    const statsArray = Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      ...stats,
    }));

    return NextResponse.json({
      subjects: statsArray,
      totalSubjects: statsArray.length,
    });
  } catch (error: any) {
    console.error('Error fetching subject performance:', error);
    console.error('Error details:', error?.message, error?.stack);
    return NextResponse.json(
      { 
        error: 'Failed to fetch subject performance',
        details: error?.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

