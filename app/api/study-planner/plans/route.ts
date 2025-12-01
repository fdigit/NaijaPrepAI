// 💥 CRITICAL FIX: Forces Next.js to use the Node.js environment
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { getActiveStudyPlan, getUserStudyPlans, saveStudyPlan } from '@/services/studyPlannerService';
import { prisma } from '@/lib/prisma';

// GET - Get user's study plans
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = request.nextUrl.searchParams.get('userId') || session.user.id;
    const activeOnly = request.nextUrl.searchParams.get('activeOnly') === 'true';

    if (activeOnly) {
      const plan = await getActiveStudyPlan(userId);
      return NextResponse.json(plan ? [plan] : []);
    }

    const plans = await getUserStudyPlans(userId);
    return NextResponse.json(plans);
  } catch (error: any) {
    console.error('Error fetching study plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch study plans', details: error?.message },
      { status: 500 }
    );
  }
}

// POST - Save a study plan
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planName, timetables, examTimetableId } = body;

    if (!planName || !timetables) {
      return NextResponse.json(
        { error: 'planName and timetables are required' },
        { status: 400 }
      );
    }

    // Deactivate other plans if this is set as active
    await prisma.studyPlan.updateMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    const plan = await saveStudyPlan(
      session.user.id,
      planName,
      timetables,
      examTimetableId
    );

    return NextResponse.json(plan);
  } catch (error: any) {
    console.error('Error saving study plan:', error);
    return NextResponse.json(
      { error: 'Failed to save study plan', details: error?.message },
      { status: 500 }
    );
  }
}

// PATCH - Update a study plan
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Check ownership
    const existing = await prisma.studyPlan.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    // If activating this plan, deactivate others
    if (updateData.isActive === true) {
      await prisma.studyPlan.updateMany({
        where: {
          userId: session.user.id,
          isActive: true,
          id: { not: id },
        },
        data: {
          isActive: false,
        },
      });
    }

    // Convert dates if provided
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    const plan = await prisma.studyPlan.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(plan);
  } catch (error: any) {
    console.error('Error updating study plan:', error);
    return NextResponse.json(
      { error: 'Failed to update study plan', details: error?.message },
      { status: 500 }
    );
  }
}

