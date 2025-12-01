'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import LessonView from '@/components/LessonView';
import { LessonContent, SelectionState } from '@/types';
import { BookOpen, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LessonPreviewPage() {
  const router = useRouter();
  const [lessonData, setLessonData] = useState<{ selection: SelectionState; content: LessonContent } | null>(null);

  useEffect(() => {
    const tempLesson = sessionStorage.getItem('tempLesson');
    if (tempLesson) {
      try {
        const data = JSON.parse(tempLesson);
        setLessonData(data);
        // Clear from sessionStorage after loading
        sessionStorage.removeItem('tempLesson');
      } catch (error) {
        console.error('Error parsing lesson data:', error);
        router.push('/');
      }
    } else {
      router.push('/');
    }
  }, [router]);

  if (!lessonData) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00695C]"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-[#FF9800] to-[#FFC107] rounded-xl p-4 text-center">
          <p className="text-white font-medium">
            <Link href="/auth/signin" className="underline font-semibold">
              Sign in
            </Link>{' '}
            to save this lesson and access it anytime from your dashboard!
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <BookOpen size={16} />
            <span>
              Current Lesson:{' '}
              <span className="font-semibold text-slate-700">
                {lessonData.selection.classLevel} &bull; {lessonData.selection.subject} &bull; Week {lessonData.selection.week}
              </span>
            </span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-[#00695C] hover:text-[#1976D2] font-medium transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>

        <LessonView content={lessonData.content} />
      </div>
    </Layout>
  );
}




