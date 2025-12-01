'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Award } from 'lucide-react';

interface PerformanceAnalyticsProps {
  userId: string;
}

interface PerformanceData {
  strengths: { subject: string; score: number }[];
  weaknesses: { subject: string; score: number }[];
  averageScore: number;
}

export default function PerformanceAnalytics({ userId }: PerformanceAnalyticsProps) {
  const [performance, setPerformance] = useState<PerformanceData>({
    strengths: [],
    weaknesses: [],
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPerformance() {
      try {
        const response = await fetch(`/api/dashboard/performance?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setPerformance(data);
        }
      } catch (error) {
        console.error('Error fetching performance:', error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchPerformance();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 animate-pulse">
        <div className="h-64 bg-slate-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 mb-6">
        <Award className="text-[#FF9800]" size={24} />
        <h2 className="text-xl font-bold text-slate-900">Performance</h2>
      </div>

      <div className="space-y-6">
        {/* Average Score */}
        <div className="text-center p-4 bg-gradient-to-r from-[#00695C] to-[#1976D2] rounded-lg text-white">
          <p className="text-sm opacity-90 mb-1">Average Score</p>
          <p className="text-4xl font-bold">{performance.averageScore}%</p>
        </div>

        {/* Strengths */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="text-[#4CAF50]" size={18} />
            <h3 className="font-semibold text-slate-900">Top Strengths</h3>
          </div>
          {performance.strengths.length > 0 ? (
            <div className="space-y-2">
              {performance.strengths.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-[#4CAF50]/10 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">{item.subject}</span>
                  <span className="text-sm font-bold text-[#4CAF50]">{item.score}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">Complete quizzes to see your strengths</p>
          )}
        </div>

        {/* Weaknesses */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="text-[#E53935]" size={18} />
            <h3 className="font-semibold text-slate-900">Areas to Improve</h3>
          </div>
          {performance.weaknesses.length > 0 ? (
            <div className="space-y-2">
              {performance.weaknesses.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-[#E53935]/10 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">{item.subject}</span>
                  <span className="text-sm font-bold text-[#E53935]">{item.score}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">Complete quizzes to identify areas for improvement</p>
          )}
        </div>
      </div>
    </div>
  );
}




