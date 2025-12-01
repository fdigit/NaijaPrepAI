'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import GamificationStats from '@/components/dashboard/GamificationStats';
import AchievementNotification from '@/components/dashboard/AchievementNotification';
import { Trophy, Zap, Flame, Award, Target } from 'lucide-react';

export default function GamificationPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00695C]"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  return (
    <DashboardLayout>
      <AchievementNotification />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#00695C] to-[#004D40] rounded-lg shadow-lg p-8 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-white/20 rounded-full p-4">
                <Trophy size={40} />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Gamification Hub</h1>
                <p className="text-[#B2DFDB]">
                  Track your progress, earn badges, and level up your learning journey!
                </p>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">How to Earn Rewards</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 bg-[#00695C]/10 rounded-lg p-3">
                  <Zap className="text-[#00695C]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Earn XP Points</h3>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Generate lesson: +50 XP</li>
                    <li>• Complete quiz: +30 XP</li>
                    <li>• Perfect quiz score: +50 XP bonus</li>
                    <li>• Complete exam prep: +100 XP</li>
                    <li>• High exam score (80%+): +150 XP bonus</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
                  <Flame className="text-orange-500" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Daily Streaks</h3>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• Study every day to build your streak</li>
                    <li>• Earn bonus XP for consecutive days</li>
                    <li>• 7 days: Consistent Student badge</li>
                    <li>• 30 days: Dedicated Learner badge</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                  <Award className="text-yellow-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Unlock Badges</h3>
                  <ul className="text-sm text-slate-600 space-y-1">
                    <li>• First Steps: Generate first lesson</li>
                    <li>• Subject Master: 10 lessons per subject</li>
                    <li>• Quiz Master: 5 perfect scores</li>
                    <li>• Exam Champion: 90%+ exam score</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Gamification Stats */}
          <GamificationStats userId={session?.user?.id || ''} />

          {/* Badge Collection */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Target className="text-[#00695C]" size={24} />
              All Available Badges
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: '🎯', name: 'First Steps', desc: 'Generated your first lesson' },
                { icon: '⚡', name: 'Fast Learner', desc: 'Completed 5 quizzes in one day' },
                { icon: '🔥', name: 'Consistent Student', desc: '7-day study streak' },
                { icon: '💪', name: 'Dedicated Learner', desc: '30-day study streak' },
                { icon: '📐', name: 'Mathematics Guru', desc: 'Completed 10 Mathematics lessons' },
                { icon: '🔬', name: 'Science Master', desc: 'Completed 10 Science lessons' },
                { icon: '📚', name: 'English Expert', desc: 'Completed 10 English lessons' },
                { icon: '🏆', name: 'Quiz Master', desc: 'Scored 100% on 5 quizzes' },
                { icon: '👑', name: 'Exam Champion', desc: 'Scored 90%+ on an exam prep' },
                { icon: '✨', name: 'Lesson Creator', desc: 'Generated 20 lessons' },
                { icon: '🌟', name: 'XP Legend', desc: 'Reached 10,000 XP points' },
              ].map((badge, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200 hover:shadow-md transition-shadow"
                >
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <h4 className="font-semibold text-slate-900 mb-1">{badge.name}</h4>
                  <p className="text-sm text-slate-600">{badge.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

