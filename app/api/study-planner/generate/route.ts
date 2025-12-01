// 💥 CRITICAL FIX: Forces Next.js to use the Node.js environment
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { generateStudyPlan, saveStudyPlan } from '@/services/studyPlannerService';

// POST - Generate a study plan
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { examTimetableId, daysUntilExam, planName, save } = body;

    // Generate the study plan
    const timetables = await generateStudyPlan(
      session.user.id,
      examTimetableId,
      daysUntilExam
    );

    // Save to database if requested
    let savedPlan = null;
    if (save && planName) {
      savedPlan = await saveStudyPlan(
        session.user.id,
        planName,
        timetables,
        examTimetableId
      );
    }

    return NextResponse.json({
      timetables,
      savedPlan,
    });
  } catch (error: any) {
    console.error('Error generating study plan:', error);
    return NextResponse.json(
      { error: 'Failed to generate study plan', details: error?.message },
      { status: 500 }
    );
  }
}

