'use client';

import { Sparkles, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface WelcomeCardProps {
  userName: string;
}

export default function WelcomeCard({ userName }: WelcomeCardProps) {
  // For now, we'll show a generic action. Later, this will fetch the last lesson
  const continueLesson = {
    topic: 'Quadratic Equations',
    subject: 'Mathematics',
    id: '1',
  };

  return (
    <div className="bg-gradient-to-r from-[#00695C] to-[#1976D2] rounded-2xl p-6 md:p-8 text-white shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Welcome back, {userName.split(' ')[0]}! 👋
          </h1>
          <p className="text-green-50 text-sm md:text-base">
            Ready to continue your learning journey?
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard/generate"
            className="flex items-center justify-center gap-2 bg-white text-[#00695C] font-semibold px-6 py-3 rounded-lg hover:bg-green-50 transition-colors shadow-md"
          >
            <Sparkles size={20} />
            Start New Lesson
          </Link>
          {continueLesson && (
            <Link
              href={`/lessons/${continueLesson.id}`}
              className="flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/30 transition-colors border border-white/30"
            >
              <BookOpen size={20} />
              Continue: {continueLesson.topic}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}




