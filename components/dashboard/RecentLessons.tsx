'use client';

import { useEffect, useState } from 'react';
import { BookOpen, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';

interface RecentLessonsProps {
  userId: string;
}

interface Lesson {
  id: string;
  topicTitle: string;
  subject: string;
  classLevel: string;
  week: number;
  createdAt: string;
}

export default function RecentLessons({ userId }: RecentLessonsProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentLessons() {
      try {
        const response = await fetch(`/api/lessons?userId=${userId}&limit=3`);
        if (response.ok) {
          const data = await response.json();
          setLessons(data);
        }
      } catch (error) {
        console.error('Error fetching recent lessons:', error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchRecentLessons();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 animate-pulse">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="text-[#00695C]" size={24} />
          <h2 className="text-xl font-bold text-slate-900">Recent Lessons</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-slate-600 mb-4">No lessons yet. Start your learning journey!</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#00695C] font-semibold hover:text-[#1976D2] transition-colors"
          >
            Generate Your First Lesson
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BookOpen className="text-[#00695C]" size={24} />
          <h2 className="text-xl font-bold text-slate-900">Recent Lessons</h2>
        </div>
        <Link
          href="/dashboard/lessons"
          className="text-sm text-[#00695C] font-medium hover:text-[#1976D2] transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="space-y-4">
        {lessons.map((lesson) => (
          <Link
            key={lesson.id}
            href={`/lessons/${lesson.id}`}
            className="block p-4 rounded-lg border border-slate-200 hover:border-[#00695C] hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-[#00695C] transition-colors">
                  {lesson.topicTitle}
                </h3>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <BookOpen size={14} />
                    {lesson.subject}
                  </span>
                  <span>{lesson.classLevel}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {formatDate(lesson.createdAt)}
                  </span>
                </div>
              </div>
              <ArrowRight
                className="text-slate-400 group-hover:text-[#00695C] transition-colors"
                size={20}
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}




