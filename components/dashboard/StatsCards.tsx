'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, Flame, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  userId: string;
}

interface Stats {
  totalLessons: number;
  studyStreak: number;
  overallProgress: number;
}

export default function StatsCards({ userId }: StatsCardsProps) {
  const [stats, setStats] = useState<Stats>({
    totalLessons: 0,
    studyStreak: 0,
    overallProgress: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`/api/dashboard/stats?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchStats();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
            <div className="h-20 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Lessons Completed',
      value: stats.totalLessons,
      icon: GraduationCap,
      color: 'bg-[#00695C]',
      textColor: 'text-[#00695C]',
    },
    {
      title: 'Study Streak',
      value: `${stats.studyStreak} days`,
      icon: Flame,
      color: 'bg-[#FF9800]',
      textColor: 'text-[#FF9800]',
    },
    {
      title: 'Overall Progress',
      value: `${stats.overallProgress}%`,
      icon: TrendingUp,
      color: 'bg-[#4CAF50]',
      textColor: 'text-[#4CAF50]',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} p-3 rounded-lg`}>
                <Icon className="text-white" size={24} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold text-slate-900">{card.value}</p>
              <p className="text-sm text-slate-600 font-medium">{card.title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}




