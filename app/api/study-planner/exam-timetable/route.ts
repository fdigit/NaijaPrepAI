// 💥 CRITICAL FIX: Forces Next.js to use the Node.js environment
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET - Get user's exam timetables
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = request.nextUrl.searchParams.get('userId') || session.user.id;
    const activeOnly = request.nextUrl.searchParams.get('activeOnly') === 'true';

    const where: any = { userId };
    if (activeOnly) {
      where.isActive = true;
    }

    const timetables = await prisma.examTimetable.findMany({
      where,
      orderBy: {
        examDate: 'asc',
      },
    });

    return NextResponse.json(timetables);
  } catch (error: any) {
    console.error('Error fetching exam timetables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exam timetables', details: error?.message },
      { status: 500 }
    );
  }
}

// POST - Create a new exam timetable
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { examName, examDate, endDate, subjectExams } = body;

    if (!examName || !examDate) {
      return NextResponse.json(
        { error: 'examName and examDate are required' },
        { status: 400 }
      );
    }

    // Deactivate other timetables if this is set as active
    if (body.isActive !== false) {
      await prisma.examTimetable.updateMany({
        where: {
          userId: session.user.id,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
    }

    const timetable = await prisma.examTimetable.create({
      data: {
        userId: session.user.id,
        examName,
        examDate: new Date(examDate),
        endDate: endDate ? new Date(endDate) : null,
        subjectExams: subjectExams || [],
        isActive: body.isActive !== false,
      },
    });

    return NextResponse.json(timetable);
  } catch (error: any) {
    console.error('Error creating exam timetable:', error);
    return NextResponse.json(
      { error: 'Failed to create exam timetable', details: error?.message },
      { status: 500 }
    );
  }
}

// PATCH - Update an exam timetable
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
    const existing = await prisma.examTimetable.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    // If activating this timetable, deactivate others
    if (updateData.isActive === true) {
      await prisma.examTimetable.updateMany({
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
    if (updateData.examDate) {
      updateData.examDate = new Date(updateData.examDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    const timetable = await prisma.examTimetable.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(timetable);
  } catch (error: any) {
    console.error('Error updating exam timetable:', error);
    return NextResponse.json(
      { error: 'Failed to update exam timetable', details: error?.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete an exam timetable
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Check ownership
    const existing = await prisma.examTimetable.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    await prisma.examTimetable.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting exam timetable:', error);
    return NextResponse.json(
      { error: 'Failed to delete exam timetable', details: error?.message },
      { status: 500 }
    );
  }
}

