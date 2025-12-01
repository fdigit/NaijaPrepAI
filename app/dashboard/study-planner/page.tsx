'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Calendar, Sparkles, BookOpen, Clock, AlertCircle, Plus, Loader2 } from 'lucide-react';
import ExamTimetableForm from '@/components/study-planner/ExamTimetableForm';
import WeeklyTimetable from '@/components/study-planner/WeeklyTimetable';
import { WeeklyTimetable as WeeklyTimetableType } from '@/services/studyPlannerService';

interface ExamTimetable {
  id: string;
  examName: string;
  examDate: string;
  endDate?: string;
  subjectExams: any[];
  isActive: boolean;
}

export default function StudyPlannerPage() {
  const { data: session, status } = useSession();
  const [examTimetables, setExamTimetables] = useState<ExamTimetable[]>([]);
  const [activeTimetable, setActiveTimetable] = useState<ExamTimetable | null>(null);
  const [showTimetableForm, setShowTimetableForm] = useState(false);
  const [generatedPlans, setGeneratedPlans] = useState<WeeklyTimetableType[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [planName, setPlanName] = useState('');
  const [daysUntilExam, setDaysUntilExam] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchExamTimetables();
    }
  }, [status]);

  const fetchExamTimetables = async () => {
    try {
      const response = await fetch('/api/study-planner/exam-timetable?activeOnly=false');
      if (response.ok) {
        const data = await response.json();
        setExamTimetables(data);
        const active = data.find((t: ExamTimetable) => t.isActive);
        if (active) {
          setActiveTimetable(active);
          // Calculate days until exam
          const examDate = new Date(active.examDate);
          const now = new Date();
          const days = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          setDaysUntilExam(days > 0 ? days : null);
        }
      }
    } catch (error) {
      console.error('Error fetching exam timetables:', error);
    }
  };

  const handleTimetableSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/study-planner/exam-timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, isActive: true }),
      });

      if (response.ok) {
        await fetchExamTimetables();
        setShowTimetableForm(false);
      } else {
        alert('Failed to save exam timetable');
      }
    } catch (error) {
      console.error('Error saving exam timetable:', error);
      alert('Failed to save exam timetable');
    }
  };

  const handleGeneratePlan = async () => {
    if (!activeTimetable && !daysUntilExam) {
      alert('Please set an exam timetable or specify days until exam');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/study-planner/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examTimetableId: activeTimetable?.id,
          daysUntilExam: daysUntilExam,
          save: false, // Preview first
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedPlans(data.timetables);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to generate study plan');
      }
    } catch (error) {
      console.error('Error generating study plan:', error);
      alert('Failed to generate study plan');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePlan = async () => {
    if (!planName.trim()) {
      alert('Please enter a plan name');
      return;
    }

    try {
      const response = await fetch('/api/study-planner/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName,
          timetables: generatedPlans,
          examTimetableId: activeTimetable?.id,
        }),
      });

      if (response.ok) {
        alert('Study plan saved successfully!');
        setPlanName('');
        setGeneratedPlans([]);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save study plan');
      }
    } catch (error) {
      console.error('Error saving study plan:', error);
      alert('Failed to save study plan');
    }
  };

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Calendar className="text-[#00695C]" size={32} />
                Study Planner & Timetable
              </h1>
              <p className="text-slate-600 mt-2">
                AI-powered study plans based on your weak subjects and exam schedule
              </p>
            </div>
          </div>

          {/* Exam Timetable Section */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Exam Timetable</h2>
              {!showTimetableForm && (
                <button
                  onClick={() => setShowTimetableForm(true)}
                  className="flex items-center gap-2 bg-[#00695C] text-white px-4 py-2 rounded-lg hover:bg-[#004D40] transition-colors"
                >
                  <Plus size={18} />
                  {activeTimetable ? 'Update Timetable' : 'Create Timetable'}
                </button>
              )}
            </div>

            {showTimetableForm ? (
              <ExamTimetableForm
                onSubmit={handleTimetableSubmit}
                onCancel={() => setShowTimetableForm(false)}
                initialData={activeTimetable || undefined}
              />
            ) : (
              <div>
                {activeTimetable ? (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">{activeTimetable.examName}</h3>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      Exam Date: {new Date(activeTimetable.examDate).toLocaleDateString()}
                    </p>
                    {daysUntilExam !== null && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="text-[#00695C]" size={16} />
                        <span className="font-medium text-slate-900">
                          {daysUntilExam} days until exam
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-500">
                    <AlertCircle className="mx-auto mb-2 text-slate-400" size={32} />
                    <p>No exam timetable set. Create one to generate personalized study plans.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Generate Study Plan Section */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="text-[#00695C]" size={24} />
              Generate Study Plan
            </h2>

            {!activeTimetable && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  No exam timetable set. You can still generate a plan by specifying days until exam.
                </p>
                <div className="mt-2">
                  <input
                    type="number"
                    value={daysUntilExam || ''}
                    onChange={(e) => setDaysUntilExam(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Days until exam"
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00695C]"
                    min="1"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating || (!activeTimetable && !daysUntilExam)}
              className="flex items-center gap-2 bg-[#00695C] text-white px-6 py-3 rounded-lg hover:bg-[#004D40] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Generating Plan...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate AI Study Plan
                </>
              )}
            </button>

            {generatedPlans.length > 0 && (
              <div className="mt-6">
                <div className="mb-4 flex items-center gap-3">
                  <input
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="Enter plan name (e.g., 'Weekly Plan - Week 1')"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00695C]"
                  />
                  <button
                    onClick={handleSavePlan}
                    className="flex items-center gap-2 bg-[#00695C] text-white px-4 py-2 rounded-lg hover:bg-[#004D40] transition-colors font-medium"
                  >
                    <BookOpen size={18} />
                    Save Plan
                  </button>
                </div>

                <div className="space-y-4">
                  {generatedPlans.map((timetable, idx) => (
                    <WeeklyTimetable key={idx} timetable={timetable} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <AlertCircle size={18} />
              How It Works
            </h3>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Analyzes your quiz performance to identify weak subjects</li>
              <li>Prioritizes subjects with earlier exam dates</li>
              <li>Allocates more study time to subjects you struggle with</li>
              <li>Creates a balanced weekly schedule with appropriate breaks</li>
              <li>Generates specific topics to focus on each day</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

