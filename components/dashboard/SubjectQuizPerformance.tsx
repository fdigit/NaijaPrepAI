'use client';

import { useEffect, useState } from 'react';
import { Trophy, TrendingUp, TrendingDown, BookOpen, Award, AlertCircle } from 'lucide-react';

interface SubjectStats {
  subject: string;
  totalAttempts: number;
  totalQuestions: number;
  totalCorrect: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  attempts: Array<{
    id: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    createdAt: Date;
  }>;
}

interface SubjectQuizPerformanceProps {
  userId: string;
}

export default function SubjectQuizPerformance({ userId }: SubjectQuizPerformanceProps) {
  const [subjectStats, setSubjectStats] = useState<SubjectStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubjectPerformance() {
      try {
        const response = await fetch(`/api/quiz/subject-performance?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setSubjectStats(data.subjects || []);
        } else {
          setError('Failed to load subject performance');
        }
      } catch (err) {
        setError('Failed to load subject performance');
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchSubjectPerformance();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00695C]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (subjectStats.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <BookOpen size={20} />
          Quiz Performance by Subject
        </h3>
        <div className="text-center py-8 text-slate-500">
          <p>No quiz attempts yet. Complete practice quizzes to see your performance!</p>
        </div>
      </div>
    );
  }

  // Sort by average score (descending)
  const sortedStats = [...subjectStats].sort((a, b) => b.averageScore - a.averageScore);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
        <Trophy size={20} className="text-yellow-500" />
        Quiz Performance by Subject
      </h3>

      <div className="space-y-4">
        {sortedStats.map((stats) => {
          const scoreColor =
            stats.averageScore >= 80
              ? 'text-green-600'
              : stats.averageScore >= 60
              ? 'text-yellow-600'
              : 'text-red-600';

          return (
            <div
              key={stats.subject}
              className="border border-slate-200 rounded-lg p-4 hover:border-[#00695C] transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 text-lg mb-1">{stats.subject}</h4>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} />
                      {stats.totalAttempts} attempt{stats.totalAttempts !== 1 ? 's' : ''}
                    </span>
                    <span>
                      {stats.totalCorrect} / {stats.totalQuestions} correct
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${scoreColor}`}>
                    {stats.averageScore.toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-500">Average</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      stats.averageScore >= 80
                        ? 'bg-green-500'
                        : stats.averageScore >= 60
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(stats.averageScore, 100)}%` }}
                  />
                </div>
              </div>

              {/* Score Range */}
              <div className="flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <TrendingUp size={12} className="text-green-600" />
                  <span>Best: {stats.bestScore.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown size={12} className="text-red-600" />
                  <span>Worst: {stats.worstScore.toFixed(1)}%</span>
                </div>
              </div>

              {/* Recent Attempts Preview */}
              {stats.attempts.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="text-xs font-medium text-slate-500 mb-2">Recent Attempts:</div>
                  <div className="flex gap-2 flex-wrap">
                    {stats.attempts.slice(0, 5).map((attempt) => (
                      <div
                        key={attempt.id}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          attempt.score >= 80
                            ? 'bg-green-100 text-green-700'
                            : attempt.score >= 60
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {attempt.score.toFixed(0)}%
                      </div>
                    ))}
                    {stats.attempts.length > 5 && (
                      <div className="px-2 py-1 rounded text-xs text-slate-500">
                        +{stats.attempts.length - 5} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-[#00695C]">
            {subjectStats.reduce((sum, s) => sum + s.totalAttempts, 0)}
          </div>
          <div className="text-xs text-slate-600 mt-1">Total Attempts</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#00695C]">
            {subjectStats.length}
          </div>
          <div className="text-xs text-slate-600 mt-1">Subjects</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-[#00695C]">
            {subjectStats.length > 0
              ? (
                  subjectStats.reduce((sum, s) => sum + s.averageScore, 0) / subjectStats.length
                ).toFixed(1)
              : '0.0'}
            %
          </div>
          <div className="text-xs text-slate-600 mt-1">Overall Average</div>
        </div>
      </div>
    </div>
  );
}

