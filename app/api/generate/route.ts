import { NextRequest, NextResponse } from 'next/server';
import { generateLessonPlan } from '@/services/geminiService';
import { SelectionState } from '@/types';

export async function POST(request: NextRequest) {
  try {
    // Validate API key is present
    if (!process.env.GEMINI_API_KEY && !process.env.API_KEY) {
      console.error('GEMINI_API_KEY is missing from environment variables');
      return NextResponse.json(
        { 
          error: 'API configuration error',
          details: 'GEMINI_API_KEY is not configured. Please add it to your .env.local file.'
        },
        { status: 500 }
      );
    }

    const body: { selection: SelectionState } = await request.json();
    
    // Validate selection data
    if (!body.selection || !body.selection.subject || !body.selection.topic) {
      return NextResponse.json(
        { error: 'Invalid request', details: 'Missing required fields: subject and topic are required' },
        { status: 400 }
      );
    }

    const content = await generateLessonPlan(body.selection);
    return NextResponse.json(content);
  } catch (error: any) {
    console.error('Error generating lesson:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to generate lesson content';
    let errorDetails = error?.message || 'Unknown error';
    
    // Check for specific error types
    if (error?.message?.includes('API key') || error?.message?.includes('authentication')) {
      errorMessage = 'API authentication failed';
      errorDetails = 'Invalid or missing GEMINI_API_KEY. Please check your .env.local file and ensure the API key is valid.';
    } else if (error?.message?.includes('quota') || error?.message?.includes('rate limit')) {
      errorMessage = 'API quota exceeded';
      errorDetails = 'You have exceeded your API quota. Please check your Google AI Studio account.';
    } else if (error?.message?.includes('network') || error?.code === 'ECONNREFUSED') {
      errorMessage = 'Network error';
      errorDetails = 'Unable to connect to the AI service. Please check your internet connection.';
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: 500 }
    );
  }
}




