'use client';

import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LessonView from '@/components/LessonView';
import { LessonContent } from '@/types';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [lesson, setLesson] = useState<LessonContent | null>(null);
  const [lessonMetadata, setLessonMetadata] = useState<{
    classLevel?: string;
    subject?: string;
    term?: string;
    week?: number;
    topic?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLesson() {
      try {
        const response = await fetch(`/api/lessons/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          // Transform database lesson to LessonContent format
          const lessonContent: LessonContent = {
            topicTitle: data.topicTitle,
            introduction: data.introduction,
            mainContent: data.mainContent,
            summaryPoints: data.summaryPoints,
            practiceQuestions: data.practiceQuestions,
            theoryQuestion: data.theoryQuestion,
          };
          setLesson(lessonContent);
          
          // Store metadata for export
          setLessonMetadata({
            classLevel: data.classLevel,
            subject: data.subject,
            term: data.term,
            week: data.week,
            topic: data.topic,
          });
        } else {
          setError('Lesson not found');
        }
      } catch (err) {
        setError('Failed to load lesson');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchLesson();
    }
  }, [params.id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-[#00695C]" size={48} />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !lesson) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <p className="text-red-700 mb-4">{error || 'Lesson not found'}</p>
            <Link
              href="/dashboard/lessons"
              className="inline-flex items-center gap-2 text-[#00695C] font-semibold hover:underline"
            >
              <ArrowLeft size={18} />
              Back to My Lessons
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/dashboard/lessons"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-[#00695C] mb-6 font-medium transition-colors"
        >
          <ArrowLeft size={18} />
          Back to My Lessons
        </Link>
        <LessonView 
          content={lesson} 
          metadata={lessonMetadata || undefined}
          lessonId={params.id as string}
        />
      </div>
    </DashboardLayout>
  );
}




