'use client';

import { useSession } from 'next-auth/react';
import { redirect, useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { FileText, Loader2, CheckCircle, XCircle, AlertCircle, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';
import { ExamQuestion } from '@/types';

interface ExamPrep {
  id: string;
  subject: string;
  classLevel: string;
  examName: string | null;
  totalQuestions: number;
  topicsCovered: string[];
  questions: ExamQuestion[];
}

interface ExamResult {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  results: Array<{
    questionIndex: number;
    isCorrect: boolean;
    selectedOption: number;
    correctOption: number;
    explanation: string;
    question: string;
  }>;
}

export default function TakeExamPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [examPrep, setExamPrep] = useState<ExamPrep | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ExamResult | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin');
    }
  }, [status]);

  useEffect(() => {
    async function fetchExamPrep() {
      if (!session?.user?.id || !examId) return;

      try {
        const response = await fetch(`/api/exam-prep/${examId}`);
        if (response.ok) {
          const data = await response.json();
          setExamPrep(data.examPrep);
        } else {
          setError('Failed to load exam prep');
        }
      } catch (error) {
        console.error('Error fetching exam prep:', error);
        setError('Failed to load exam prep');
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.id && examId) {
      fetchExamPrep();
    }
  }, [session, examId]);

  // Timer
  useEffect(() => {
    if (!results && examPrep) {
      const interval = setInterval(() => {
        setTimeSpent((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [results, examPrep]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    if (!examPrep) return;

    const answeredCount = Object.keys(answers).length;
    if (answeredCount < examPrep.totalQuestions) {
      if (
        !confirm(
          `You have only answered ${answeredCount} out of ${examPrep.totalQuestions} questions. Do you want to submit anyway?`
        )
      ) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const answersArray = Object.entries(answers).map(([qIndex, option]) => ({
        questionIndex: parseInt(qIndex),
        selectedOption: option,
      }));

      const response = await fetch(`/api/exam-prep/${examId}/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          answers: answersArray,
          timeSpent: timeSpent 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit exam');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-[#00695C]" size={48} />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !examPrep) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="mx-auto text-red-600 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-red-900 mb-2">Error</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Link
              href="/dashboard/exam-prep"
              className="inline-block bg-[#00695C] hover:bg-[#00695C]/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Back to Exam Prep
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!examPrep) return null;

  const currentQuestion = examPrep.questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / examPrep.totalQuestions) * 100;

  // Results View
  if (results) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link
              href="/dashboard/exam-prep"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-[#00695C] mb-4"
            >
              <ArrowLeft size={18} />
              Back to Exam Prep
            </Link>
          </div>

          {/* Results Summary */}
          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm mb-6">
            <div className="text-center mb-6">
              <div
                className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-4 ${
                  results.score >= 70
                    ? 'bg-green-100 text-green-600'
                    : results.score >= 50
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                <span className="text-3xl font-bold">{Math.round(results.score)}%</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Exam Results</h2>
              <p className="text-slate-600">
                You scored {results.correctAnswers} out of {results.totalQuestions} questions
              </p>
              <p className="text-sm text-slate-500 mt-2">Time spent: {formatTime(timeSpent)}</p>
            </div>

            {/* Performance Breakdown */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{results.correctAnswers}</div>
                <div className="text-sm text-slate-600">Correct</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {results.totalQuestions - results.correctAnswers}
                </div>
                <div className="text-sm text-slate-600">Incorrect</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{results.totalQuestions}</div>
                <div className="text-sm text-slate-600">Total</div>
              </div>
            </div>
          </div>

          {/* Question Review */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Question Review</h3>
            {results.results.map((result, index) => {
              const question = examPrep.questions[index];
              return (
                <div
                  key={index}
                  className={`bg-white rounded-xl p-6 border-2 ${
                    result.isCorrect ? 'border-green-200' : 'border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">Question {index + 1}</span>
                      {result.isCorrect ? (
                        <CheckCircle className="text-green-600" size={20} />
                      ) : (
                        <XCircle className="text-red-600" size={20} />
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        question.difficulty === 'easy'
                          ? 'bg-green-100 text-green-700'
                          : question.difficulty === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {question.difficulty}
                    </span>
                  </div>

                  <p className="text-slate-900 font-medium mb-4">{result.question}</p>

                  <div className="space-y-2 mb-4">
                    {question.options.map((option, optIndex) => {
                      const isSelected = result.selectedOption === optIndex;
                      const isCorrect = result.correctOption === optIndex;
                      let bgColor = 'bg-slate-50';
                      if (isCorrect) bgColor = 'bg-green-50 border-green-300';
                      else if (isSelected && !isCorrect) bgColor = 'bg-red-50 border-red-300';

                      return (
                        <div
                          key={optIndex}
                          className={`p-3 rounded-lg border-2 ${bgColor} ${
                            isCorrect ? 'border-green-300' : isSelected ? 'border-red-300' : 'border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-700">
                              {String.fromCharCode(65 + optIndex)}.
                            </span>
                            <span className={isCorrect ? 'font-semibold text-green-800' : 'text-slate-700'}>
                              {option}
                            </span>
                            {isCorrect && <CheckCircle className="text-green-600 ml-auto" size={18} />}
                            {isSelected && !isCorrect && <XCircle className="text-red-600 ml-auto" size={18} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-1">Explanation:</p>
                    <p className="text-sm text-blue-800">{result.explanation}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex gap-4">
            <Link
              href="/dashboard/exam-prep"
              className="flex-1 bg-[#00695C] hover:bg-[#00695C]/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors text-center"
            >
              Back to Exam Prep
            </Link>
            <button
              onClick={() => {
                setResults(null);
                setAnswers({});
                setCurrentQuestionIndex(0);
                setTimeSpent(0);
              }}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Retake Exam
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Exam Taking View
  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard/exam-prep"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-[#00695C] mb-4"
          >
            <ArrowLeft size={18} />
            Back to Exam Prep
          </Link>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {examPrep.examName || `${examPrep.subject} Exam Prep`}
                </h1>
                <p className="text-slate-600">
                  {examPrep.subject} • {examPrep.classLevel}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <Clock size={18} />
                  <span className="font-mono">{formatTime(timeSpent)}</span>
                </div>
                <div className="text-sm text-slate-500">
                  {answeredCount} / {examPrep.totalQuestions} answered
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
              <div
                className="bg-[#00695C] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-sm text-slate-600">{Math.round(progress)}% Complete</div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-4 flex justify-end">
          <div className="bg-white rounded-lg p-1 border border-slate-200 inline-flex">
            <button
              onClick={() => setViewMode('single')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                viewMode === 'single'
                  ? 'bg-[#00695C] text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Single View
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                viewMode === 'all'
                  ? 'bg-[#00695C] text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Questions
            </button>
          </div>
        </div>

        {/* Questions */}
        {viewMode === 'single' ? (
          <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-600">
                  Question {currentQuestionIndex + 1} of {examPrep.totalQuestions}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    currentQuestion.difficulty === 'easy'
                      ? 'bg-green-100 text-green-700'
                      : currentQuestion.difficulty === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {currentQuestion.difficulty}
                </span>
              </div>
              <p className="text-lg font-semibold text-slate-900 mb-6">{currentQuestion.question}</p>
            </div>

            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, optIndex) => {
                const isSelected = answers[currentQuestionIndex] === optIndex;
                return (
                  <button
                    key={optIndex}
                    onClick={() => handleAnswerSelect(currentQuestionIndex, optIndex)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-[#00695C] bg-[#00695C]/5'
                        : 'border-slate-200 hover:border-[#00695C]/50 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-semibold ${
                          isSelected ? 'text-[#00695C]' : 'text-slate-600'
                        }`}
                      >
                        {String.fromCharCode(65 + optIndex)}.
                      </span>
                      <span className={isSelected ? 'text-[#00695C] font-medium' : 'text-slate-700'}>
                        {option}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <div className="flex gap-2">
                {examPrep.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-8 h-8 rounded text-sm ${
                      index === currentQuestionIndex
                        ? 'bg-[#00695C] text-white'
                        : answers[index] !== undefined
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() =>
                  setCurrentQuestionIndex(Math.min(examPrep.totalQuestions - 1, currentQuestionIndex + 1))
                }
                disabled={currentQuestionIndex === examPrep.totalQuestions - 1}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {examPrep.questions.map((question, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-slate-700">Question {index + 1}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      question.difficulty === 'easy'
                        ? 'bg-green-100 text-green-700'
                        : question.difficulty === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {question.difficulty}
                  </span>
                </div>
                <p className="text-slate-900 font-medium mb-4">{question.question}</p>
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => {
                    const isSelected = answers[index] === optIndex;
                    return (
                      <button
                        key={optIndex}
                        onClick={() => handleAnswerSelect(index, optIndex)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-[#00695C] bg-[#00695C]/5'
                            : 'border-slate-200 hover:border-[#00695C]/50 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`font-semibold ${
                              isSelected ? 'text-[#00695C]' : 'text-slate-600'
                            }`}
                          >
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <span className={isSelected ? 'text-[#00695C] font-medium' : 'text-slate-700'}>
                            {option}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-6 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-[#00695C] hover:bg-[#00695C]/90 text-white font-semibold px-6 py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Submitting...
              </>
            ) : (
              <>
                <FileText size={20} />
                Submit Exam
              </>
            )}
          </button>
          <p className="text-sm text-slate-500 text-center mt-3">
            You can review and change your answers before submitting
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

