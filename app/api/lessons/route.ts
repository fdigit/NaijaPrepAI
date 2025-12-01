// 💥 CRITICAL FIX: Forces Next.js to use the Node.js environment
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { saveLesson, getLessons } from '@/services/lessonService';
import { ClassLevel, Term } from '@prisma/client';
import { awardXP, updateDailyStreak, checkAndAwardBadges, updateSubjectProgress, XP_VALUES } from '@/services/gamificationService';
import { recordLessonGeneration } from '@/services/studySessionService';

export async function POST(request: NextRequest) {
  try {
    // Don't pass request - auth() automatically reads from request context
    const session = await auth();
    
    // Log for debugging
    console.log('Session in POST /api/lessons:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      sessionKeys: session ? Object.keys(session) : [],
      userKeys: session?.user ? Object.keys(session.user) : [],
      sessionType: typeof session,
      sessionStringified: JSON.stringify(session),
    });
    
    if (!session?.user?.id) {
      console.error('No session or user.id found. Full session object:', JSON.stringify(session, null, 2));
      // Check if session exists but user is missing
      if (session && !session.user) {
        console.error('Session exists but user object is missing!');
      }
      return NextResponse.json(
        { 
          error: 'Unauthorized. Please sign in to save lessons.',
          debug: process.env.NODE_ENV === 'development' ? 'Session exists but user.id is missing. Check session callback.' : undefined
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.selection || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields: selection and content' },
        { status: 400 }
      );
    }
    
    // Include userId (user is logged in)
    const lesson = await saveLesson(
      body.selection,
      body.content,
      session.user.id
    );
    
    // Award XP for generating lesson
    try {
      await awardXP(session.user.id, XP_VALUES.GENERATE_LESSON, 'Generated a lesson');
      await updateDailyStreak(session.user.id);
      
      // Record study session for weekly progress
      await recordLessonGeneration(session.user.id, lesson.id);
      
      // Update subject progress
      await updateSubjectProgress(session.user.id, body.selection.subject, {
        lessonsCompleted: 1,
        xpEarned: XP_VALUES.GENERATE_LESSON,
      });
      
      // Check for badges
      const user = await import('@/lib/prisma').then(m => m.prisma.user.findUnique({
        where: { id: session.user.id },
        include: { lessons: { select: { id: true, subject: true } } },
      }));
      
      if (user) {
        await checkAndAwardBadges(session.user.id, {
          lessonsGenerated: user.lessons.length,
          subject: body.selection.subject,
          subjectLessons: user.lessons.filter(l => l.subject === body.selection.subject).length,
        });
      }
    } catch (gamificationError) {
      // Don't fail lesson save if gamification fails
      console.error('Gamification error:', gamificationError);
    }
    
    return NextResponse.json(lesson, { status: 201 });
  } catch (error: any) {
    console.error('Error saving lesson:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to save lesson',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: any = {};
    
    if (searchParams.get('classLevel')) {
      filters.classLevel = searchParams.get('classLevel') as ClassLevel;
    }
    if (searchParams.get('subject')) {
      filters.subject = searchParams.get('subject');
    }
    if (searchParams.get('term')) {
      filters.term = searchParams.get('term') as Term;
    }
    if (searchParams.get('week')) {
      filters.week = parseInt(searchParams.get('week')!);
    }
    if (searchParams.get('userId')) {
      filters.userId = searchParams.get('userId');
    }

    const limit = searchParams.get('limit') 
      ? parseInt(searchParams.get('limit')!)
      : undefined;

    const lessons = await getLessons(filters, limit);
    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    );
  }
}

