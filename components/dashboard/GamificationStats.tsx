'use client';

import { useEffect, useState } from 'react';
import { Trophy, Zap, Flame, Award, TrendingUp } from 'lucide-react';

interface GamificationStats {
  xp: number;
  level: number;
  xpForNextLevel: number;
  progressToNextLevel: number;
  badges: Array<{ id: string; name: string; description: string; icon: string }>;
  dailyStreak: number;
  totalLessons: number;
  totalQuizzes: number;
  perfectQuizzes: number;
}

export default function GamificationStats({ userId }: { userId: string }) {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    fetch('/api/gamification/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching gamification stats:', error);
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-4 bg-slate-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* XP and Level Card */}
      <div className="bg-gradient-to-br from-[#00695C] to-[#004D40] rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">Level {stats.level}</h3>
            <p className="text-[#B2DFDB] text-sm">Keep learning to level up!</p>
          </div>
          <div className="bg-white/20 rounded-full p-3">
            <Trophy size={32} />
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-[#B2DFDB]">{stats.xp} XP</span>
            <span className="text-[#B2DFDB]">
              {stats.xpForNextLevel > 0 ? `${stats.xpForNextLevel} XP to next level` : 'Max Level!'}
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
            <div
              className="bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(stats.progressToNextLevel, 100)}%` }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap size={16} />
              <span className="text-2xl font-bold">{stats.xp}</span>
            </div>
            <p className="text-xs text-[#B2DFDB]">Total XP</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame size={16} />
              <span className="text-2xl font-bold">{stats.dailyStreak}</span>
            </div>
            <p className="text-xs text-[#B2DFDB]">Day Streak</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Award size={16} />
              <span className="text-2xl font-bold">{stats.badges.length}</span>
            </div>
            <p className="text-xs text-[#B2DFDB]">Badges</p>
          </div>
        </div>
      </div>

      {/* Daily Streak Card */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2">
              <Flame className="text-orange-500" size={20} />
              Daily Streak
            </h3>
            <p className="text-slate-600 text-sm">
              {stats.dailyStreak === 0
                ? "Start your learning journey today!"
                : stats.dailyStreak === 1
                ? "Great start! Come back tomorrow to keep your streak going."
                : `Amazing! You've studied for ${stats.dailyStreak} days in a row!`}
            </p>
          </div>
          <div className="text-4xl font-bold text-orange-500">
            {stats.dailyStreak}
          </div>
        </div>
      </div>

      {/* Badges Card */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Award className="text-[#00695C]" size={20} />
          Your Badges
        </h3>
        {stats.badges.length === 0 ? (
          <div className="text-center py-8">
            <Award size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">
              Complete activities to earn badges!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {stats.badges.map((badge) => (
              <div
                key={badge.id}
                className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 text-center border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h4 className="font-semibold text-slate-900 text-sm mb-1">
                  {badge.name}
                </h4>
                <p className="text-xs text-slate-600">{badge.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="text-[#00695C]" size={20} />
          Your Progress
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Lessons Generated</span>
            <span className="font-semibold text-slate-900">{stats.totalLessons}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Quizzes Completed</span>
            <span className="font-semibold text-slate-900">{stats.totalQuizzes}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Perfect Scores</span>
            <span className="font-semibold text-green-600">{stats.perfectQuizzes}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

