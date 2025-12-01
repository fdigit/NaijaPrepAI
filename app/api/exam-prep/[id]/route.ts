// 💥 CRITICAL FIX: Forces Next.js to use the Node.js environment
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { getExamPrepById } from '@/services/examPrepService';

/**
 * GET /api/exam-prep/[id]
 * Get a specific exam prep by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const examPrep = await getExamPrepById(id, session.user.id);

    if (!examPrep) {
      return NextResponse.json(
        { error: 'Exam prep not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ examPrep });
  } catch (error: any) {
    console.error('Error fetching exam prep:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch exam prep' },
      { status: 500 }
    );
  }
}

