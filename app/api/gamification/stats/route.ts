// 💥 CRITICAL FIX: Forces Next.js to use the Node.js environment
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { getUserGamificationStats } from '@/services/gamificationService';

/**
 * GET /api/gamification/stats
 * Get user's gamification statistics
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getUserGamificationStats(session.user.id);
    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error fetching gamification stats:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch gamification stats' },
      { status: 500 }
    );
  }
}

