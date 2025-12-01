// 💥 CRITICAL FIX: Forces Next.js to use the Node.js environment
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { getExamPrepById, calculateExamResults, ExamAttempt, saveExamPrepAttempt } from '@/services/examPrepService';
import { ExamQuestion } from '@/types';
import { awardXP, updateDailyStreak, checkAndAwardBadges, XP_VALUES } from '@/services/gamificationService';
import { recordExamPrepCompletion } from '@/services/studySessionService';

/**
 * POST /api/exam-prep/[id]/attempt
 * Submit exam attempt and get results
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { answers, timeSpent } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Answers array is required' },
        { status: 400 }
      );
    }

    // Get exam prep
    const examPrep = await getExamPrepById(id, session.user.id);

    if (!examPrep) {
      return NextResponse.json(
        { error: 'Exam prep not found' },
        { status: 404 }
      );
    }

    // Parse questions from JSON
    const questions = examPrep.questions as unknown as ExamQuestion[];

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions found in exam prep' },
        { status: 400 }
      );
    }

    // Calculate results
    const results = calculateExamResults(questions, answers as ExamAttempt[]);

    // Save attempt to database
    try {
      console.log(`[Exam Attempt] Saving attempt for userId: ${session.user.id}, examPrepId: ${id}`);
      const savedAttempt = await saveExamPrepAttempt({
        userId: session.user.id,
        examPrepId: id,
        totalQuestions: results.totalQuestions,
        correctAnswers: results.correctAnswers,
        score: results.score,
        timeSpent: timeSpent || undefined,
        answers: answers as ExamAttempt[],
      });
      console.log(`[Exam Attempt] Successfully saved attempt:`, savedAttempt.id);
    } catch (saveError) {
      console.error('[Exam Attempt] Error saving exam attempt:', saveError);
      // Continue even if save fails - still return results
    }

    // Award XP for completing exam prep
    try {
      let xpEarned = XP_VALUES.COMPLETE_EXAM_PREP;
      if (results.score >= 80) {
        xpEarned += XP_VALUES.EXAM_PREP_HIGH_SCORE; // Bonus for high score
      }
      
      await awardXP(session.user.id, xpEarned, `Completed exam prep (${results.score.toFixed(0)}%)`);
      await updateDailyStreak(session.user.id);
      
      // Record study session for weekly progress
      await recordExamPrepCompletion(session.user.id, timeSpent);
      
      // Check for badges
      await checkAndAwardBadges(session.user.id, {
        examScore: results.score,
        subject: examPrep.subject,
      });
    } catch (gamificationError) {
      // Don't fail exam attempt if gamification fails
      console.error('Gamification error:', gamificationError);
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Error processing exam attempt:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process exam attempt' },
      { status: 500 }
    );
  }
}

