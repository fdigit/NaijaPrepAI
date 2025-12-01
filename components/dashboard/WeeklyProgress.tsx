'use client';

import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';

interface WeeklyProgressProps {
  userId: string;
}

interface DayProgress {
  day: string;
  date: number;
  completed: boolean;
  lessons: number;
}

export default function WeeklyProgress({ userId }: WeeklyProgressProps) {
  const [weekData, setWeekData] = useState<DayProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeeklyProgress() {
      try {
        const response = await fetch(`/api/dashboard/weekly-progress?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setWeekData(data);
        } else {
          // Generate default week data if no data exists
          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          const today = new Date();
          const defaultData = days.map((day, index) => {
            const date = new Date(today);
            date.setDate(today.getDate() - today.getDay() + index + 1);
            return {
              day,
              date: date.getDate(),
              completed: false,
              lessons: 0,
            };
          });
          setWeekData(defaultData);
        }
      } catch (error) {
        console.error('Error fetching weekly progress:', error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchWeeklyProgress();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 animate-pulse">
        <div className="h-64 bg-slate-200 rounded"></div>
      </div>
    );
  }

  const completedDays = weekData.filter((day) => day.completed).length;
  const totalLessons = weekData.reduce((sum, day) => sum + day.lessons, 0);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="text-[#00695C]" size={24} />
          <h2 className="text-xl font-bold text-slate-900">Weekly Progress</h2>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600">This Week</p>
          <p className="text-2xl font-bold text-[#00695C]">
            {completedDays}/7 days
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-[#00695C] to-[#4CAF50] h-3 rounded-full transition-all duration-500"
            style={{ width: `${(completedDays / 7) * 100}%` }}
          ></div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {weekData.map((day, index) => (
            <div
              key={index}
              className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                day.completed
                  ? 'bg-[#4CAF50]/10 border-[#4CAF50]'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <p className="text-xs font-medium text-slate-600 mb-1">{day.day}</p>
              <p
                className={`text-lg font-bold mb-1 ${
                  day.completed ? 'text-[#4CAF50]' : 'text-slate-400'
                }`}
              >
                {day.date}
              </p>
              {day.lessons > 0 && (
                <div className="w-2 h-2 rounded-full bg-[#4CAF50]"></div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{totalLessons}</span> lessons
            completed this week
          </p>
          <p className="text-sm text-[#00695C] font-medium">Keep it up! 🔥</p>
        </div>
      </div>
    </div>
  );
}




