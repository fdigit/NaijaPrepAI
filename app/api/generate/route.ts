import { NextRequest, NextResponse } from 'next/server';
import { generateLessonPlan } from '@/services/geminiService';
import { SelectionState } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: { selection: SelectionState } = await request.json();
    const content = await generateLessonPlan(body.selection);
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error generating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to generate lesson content' },
      { status: 500 }
    );
  }
}




