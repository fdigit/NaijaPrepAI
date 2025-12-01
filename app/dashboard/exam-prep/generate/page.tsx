'use client';

import { useSession } from 'next-auth/react';
import { redirect, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { FileText, Loader2, AlertCircle, CheckCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { ClassLevel } from '@/types';
import { AVAILABLE_SUBJECTS } from '@/constants';

export default function GenerateExamPrepPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [subject, setSubject] = useState('');
  const [classLevel, setClassLevel] = useState<ClassLevel>(ClassLevel.SSS1);
  const [examName, setExamName] = useState('');
  const [questionCount, setQuestionCount] = useState(50);
  const [preferredSubjects, setPreferredSubjects] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin');
    }
  }, [status]);

  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user?.id) return;

      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          // API returns user data directly, not nested in profile
          if (data.classLevel) {
            // Map Prisma ClassLevel enum (JSS1, JSS2, etc.) to TypeScript ClassLevel enum (JSS 1, JSS 2, etc.)
            const prismaToTsMap: Record<string, ClassLevel> = {
              'JSS1': ClassLevel.JSS1,  // JSS1 -> JSS 1
              'JSS2': ClassLevel.JSS2,  // JSS2 -> JSS 2
              'JSS3': ClassLevel.JSS3,  // JSS3 -> JSS 3
              'SSS1': ClassLevel.SSS1,  // SSS1 -> SSS 1
              'SSS2': ClassLevel.SSS2,  // SSS2 -> SSS 2
              'SSS3': ClassLevel.SSS3,  // SSS3 -> SSS 3
            };
            const mappedClassLevel = prismaToTsMap[data.classLevel] || ClassLevel.SSS1;
            setClassLevel(mappedClassLevel);
          }
          if (data.preferredSubjects && data.preferredSubjects.length > 0) {
            setPreferredSubjects(data.preferredSubjects);
            setSubject(data.preferredSubjects[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    }

    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!subject) {
      setError('Please select a subject');
      setLoading(false);
      return;
    }

    if (!classLevel) {
      setError('Class level is required. Please set your class level in Settings first.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/exam-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          classLevel,
          examName: examName || undefined,
          questionCount,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Redirect to the exam prep page after a short delay
        setTimeout(() => {
          router.push(`/dashboard/exam-prep/${data.examPrep.id}`);
        }, 1500);
      } else {
        setError(data.error || 'Failed to generate exam prep. Please try again.');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (status === 'loading' || loadingProfile) {
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

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#00695C] p-3 rounded-lg">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Generate Exam Prep</h1>
              <p className="text-slate-600">
                Create comprehensive CBT questions from all your lesson notes
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
          <form onSubmit={handleGenerate} className="space-y-6">
            {/* Subject */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00695C] focus:border-[#00695C] outline-none"
                disabled={loading}
              >
                <option value="">Select a subject</option>
                {preferredSubjects.length > 0 && (
                  <optgroup label="Your Preferred Subjects">
                    {AVAILABLE_SUBJECTS.filter((s) =>
                      preferredSubjects.includes(s.name)
                    ).map((subj) => (
                      <option key={subj.id} value={subj.name}>
                        {subj.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="All Subjects">
                  {AVAILABLE_SUBJECTS.map((subj) => (
                    <option key={subj.id} value={subj.name}>
                      {subj.name}
                    </option>
                  ))}
                </optgroup>
              </select>
              <p className="mt-1 text-sm text-slate-500">
                We'll analyze all your lessons for this subject
              </p>
            </div>

            {/* Class Level - Auto-detected from profile */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Class Level
                {classLevel && (
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    (Auto-detected from your profile)
                  </span>
                )}
              </label>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value as ClassLevel)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00695C] focus:border-[#00695C] outline-none bg-slate-50"
                disabled={loading || !classLevel}
                title={classLevel ? "Class level auto-detected from your profile. You can change it in Settings if needed." : "Please set your class level in Settings first"}
              >
                {Object.values(ClassLevel).map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              {!classLevel && (
                <p className="mt-1 text-sm text-amber-600">
                  ⚠️ Please set your class level in <Link href="/dashboard/settings" className="underline font-semibold">Settings</Link> first
                </p>
              )}
              {classLevel && (
                <p className="mt-1 text-sm text-slate-500">
                  Using your profile class level. You can change it in Settings if needed.
                </p>
              )}
            </div>

            {/* Exam Name (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Exam Name (Optional)
              </label>
              <input
                type="text"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="e.g., WAEC Prep, BECE Prep, Midterm Practice"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00695C] focus:border-[#00695C] outline-none"
                disabled={loading}
              />
            </div>

            {/* Question Count */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Number of Questions
              </label>
              <input
                type="number"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value) || 50)}
                min={20}
                max={100}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00695C] focus:border-[#00695C] outline-none"
                disabled={loading}
              />
              <p className="mt-1 text-sm text-slate-500">
                Recommended: 50 questions (20-100 allowed)
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">
                    Exam prep generated successfully! Redirecting...
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={loading || !subject}
                className="flex-1 bg-[#00695C] hover:bg-[#00695C]/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Generating Exam Questions...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Exam Prep
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

            {loading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Generating your exam prep...</strong>
                  <br />
                  This may take 30-60 seconds. We're analyzing all your lessons and creating comprehensive questions.
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

