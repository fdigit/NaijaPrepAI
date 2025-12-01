'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { FileText, Plus, Trash2, Calendar, GraduationCap, BookOpen, Loader2, Trophy, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { ClassLevel } from '@/types';
import { AVAILABLE_SUBJECTS } from '@/constants';

interface ExamPrep {
  id: string;
  subject: string;
  classLevel: ClassLevel;
  examName: string | null;
  totalQuestions: number;
  topicsCovered: string[];
  createdAt: string;
  isActive: boolean;
  attemptCount: number;
  lastAttempt?: {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    createdAt: string;
  } | null;
  bestAttempt?: {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    createdAt: string;
  } | null;
}

export default function ExamPrepPage() {
  const { data: session, status } = useSession();
  const [examPreps, setExamPreps] = useState<ExamPrep[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin');
    }
  }, [status]);

  useEffect(() => {
    async function fetchExamPreps() {
      if (!session?.user?.id) return;

      try {
        const params = new URLSearchParams();
        if (selectedSubject !== 'all') params.append('subject', selectedSubject);
        if (selectedClass !== 'all') params.append('classLevel', selectedClass);
        // Don't filter by isActive - show all active exams by default
        // Only filter if user explicitly wants inactive exams

        const response = await fetch(`/api/exam-prep?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched exam preps:', data);
          console.log('First exam prep details:', data.examPreps?.[0]);
          if (data.examPreps?.[0]) {
            console.log('Attempt count:', data.examPreps[0].attemptCount);
            console.log('Last attempt:', data.examPreps[0].lastAttempt);
          }
          setExamPreps(data.examPreps || []);
        } else {
          const errorData = await response.json();
          console.error('Error fetching exam preps:', errorData);
        }
      } catch (error) {
        console.error('Error fetching exam preps:', error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.id) {
      fetchExamPreps();
    }
  }, [session, selectedSubject, selectedClass]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam prep? This action cannot be undone.')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/exam-prep?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setExamPreps(examPreps.filter((ep) => ep.id !== id));
      } else {
        alert('Failed to delete exam prep');
      }
    } catch (error) {
      console.error('Error deleting exam prep:', error);
      alert('Failed to delete exam prep');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPreparationMessage = (score: number) => {
    if (score >= 90) {
      return {
        message: 'Excellent! You are highly prepared for the exam. Keep up the great work!',
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        emoji: '🎉',
      };
    } else if (score >= 80) {
      return {
        message: 'Very Good! You are well prepared. Review weak areas and you\'ll be exam-ready!',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        emoji: '👍',
      };
    } else if (score >= 70) {
      return {
        message: 'Good progress! You\'re on the right track. Practice more to boost your confidence.',
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        emoji: '📚',
      };
    } else if (score >= 60) {
      return {
        message: 'Keep practicing! Focus on your weak topics and retake to improve your score.',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        emoji: '💪',
      };
    } else {
      return {
        message: 'Don\'t give up! Review your notes, focus on key concepts, and practice more. You can do it!',
        color: 'text-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        emoji: '🔥',
      };
    }
  };

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-slate-200 rounded w-1/3"></div>
            <div className="h-16 bg-slate-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#00695C] p-3 rounded-lg">
                <FileText className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Exam Preparation</h1>
                <p className="text-slate-600">
                  Generate comprehensive CBT questions from your lesson notes
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/exam-prep/generate"
              className="bg-[#00695C] hover:bg-[#00695C]/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Generate New Exam
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <BookOpen size={16} className="inline mr-1" />
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00695C] focus:border-[#00695C] outline-none"
                >
                  <option value="all">All Subjects</option>
                  {AVAILABLE_SUBJECTS.map((subject) => (
                    <option key={subject.id} value={subject.name}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <GraduationCap size={16} className="inline mr-1" />
                  Class Level
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00695C] focus:border-[#00695C] outline-none"
                >
                  <option value="all">All Classes</option>
                  {Object.values(ClassLevel).map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Exam Preps Grid */}
        {examPreps.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <FileText className="mx-auto text-slate-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No exam preps yet
            </h3>
            <p className="text-slate-600 mb-6">
              Generate your first exam prep to practice with comprehensive CBT questions covering all your lesson notes!
            </p>
            <Link
              href="/dashboard/exam-prep/generate"
              className="inline-block bg-[#00695C] hover:bg-[#00695C]/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Generate Your First Exam Prep
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {examPreps.map((examPrep) => {
              // Debug: Log exam prep data
              if (examPrep.id) {
                console.log(`Exam Prep ${examPrep.id}:`, {
                  attemptCount: examPrep.attemptCount,
                  lastAttempt: examPrep.lastAttempt,
                  hasLastAttempt: !!examPrep.lastAttempt,
                });
              }
              
              return (
              <div
                key={examPrep.id}
                className="bg-white rounded-xl p-6 border border-slate-200 hover:border-[#00695C] hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {examPrep.examName || `${examPrep.subject} Exam Prep`}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 mb-3">
                      <span className="bg-[#00695C]/10 text-[#00695C] px-2 py-1 rounded font-medium">
                        {examPrep.subject}
                      </span>
                      <span className="text-slate-500">{examPrep.classLevel}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(examPrep.id)}
                    disabled={deletingId === examPrep.id}
                    className="text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    title="Delete exam prep"
                  >
                    {deletingId === examPrep.id ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>

                <div className="space-y-2 text-sm text-slate-600 border-t border-slate-100 pt-4 mb-4">
                  <div className="flex items-center gap-2">
                    <FileText size={14} />
                    <span>{examPrep.totalQuestions} questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} />
                    <span>{examPrep.topicsCovered.length} topics covered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{formatDate(examPrep.createdAt)}</span>
                  </div>
                  {(examPrep.attemptCount || 0) > 0 && examPrep.lastAttempt && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex items-center gap-2">
                        <Trophy size={14} className="text-yellow-600" />
                        <span className="font-semibold text-slate-900">
                          Last Score: <span className="text-[#00695C]">{Math.round(examPrep.lastAttempt.score)}%</span>
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 ml-6">
                        Attempted {examPrep.attemptCount || 0} {(examPrep.attemptCount || 0) === 1 ? 'time' : 'times'}
                        {examPrep.bestAttempt && examPrep.lastAttempt && examPrep.bestAttempt.score !== examPrep.lastAttempt.score && (
                          <span className="ml-2">
                            • Best: {Math.round(examPrep.bestAttempt.score)}%
                          </span>
                        )}
                      </div>
                      {/* Preparation Message */}
                      {(() => {
                        const prepMsg = getPreparationMessage(examPrep.lastAttempt.score);
                        return (
                          <div className={`mt-2 p-3 rounded-lg border ${prepMsg.bgColor} ${prepMsg.borderColor} ${prepMsg.color}`}>
                            <div className="flex items-start gap-2">
                              <span className="text-lg">{prepMsg.emoji}</span>
                              <p className="text-sm font-medium leading-relaxed">
                                {prepMsg.message}
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  {(examPrep.attemptCount || 0) > 0 ? (
                    <>
                      <Link
                        href={`/dashboard/exam-prep/${examPrep.id}`}
                        className="block w-full bg-[#00695C] hover:bg-[#00695C]/90 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-center flex items-center justify-center gap-2"
                      >
                        <RotateCcw size={16} />
                        Retake Exam
                      </Link>
                      {examPrep.lastAttempt && (
                        <div className="text-xs text-slate-500 text-center">
                          Last attempt: {formatDate(examPrep.lastAttempt.createdAt)}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={`/dashboard/exam-prep/${examPrep.id}`}
                      className="block w-full bg-[#00695C] hover:bg-[#00695C]/90 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-center"
                    >
                      Take Exam
                    </Link>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

