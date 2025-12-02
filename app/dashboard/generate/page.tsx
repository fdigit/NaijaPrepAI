'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import CurriculumForm from '@/components/CurriculumForm';
import { generateLessonPlan } from '@/services/geminiService';
import { SelectionState, ClassLevel } from '@/types';
import { AlertCircle, Loader2 } from 'lucide-react';

interface UserProfile {
  classLevel: ClassLevel | null;
  preferredSubjects: string[];
}

export default function GenerateLessonPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin');
    }
  }, [status]);

  // Fetch user profile for pre-population
  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const profile = await response.json();
          setUserProfile({
            classLevel: profile.classLevel,
            preferredSubjects: profile.preferredSubjects || [],
          });
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

  const handleGenerate = async (selection: SelectionState) => {
    setLoading(true);
    setError(null);

    try {
      const content = await generateLessonPlan(selection);
      
      // Save lesson to database (user is logged in)
      if (!session?.user?.id) {
        setError('You must be logged in to save lessons. Please sign in and try again.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ selection, content }),
        });
        
        const responseData = await response.json();
        
        if (response.ok) {
          // Redirect to lesson view
          router.push(`/lessons/${responseData.id}`);
        } else {
          console.error('Save error response:', responseData);
          setError(responseData.error || 'Failed to save lesson. Please try again.');
          setLoading(false);
        }
      } catch (saveError: any) {
        console.error('Error saving lesson:', saveError);
        setError(`Failed to save lesson: ${saveError.message || 'Unknown error'}. Please try again.`);
        setLoading(false);
      }
    } catch (err: any) {
      // Show more specific error messages
      let errorMessage = "Failed to generate content. Please check your connection and try again.";
      
      if (err?.message?.includes('API key') || err?.message?.includes('GEMINI_API_KEY')) {
        errorMessage = "API key is missing or invalid. Please check your .env.local file and ensure GEMINI_API_KEY is set correctly.";
      } else if (err?.message?.includes('quota')) {
        errorMessage = "API quota exceeded. Please check your Google AI Studio account limits.";
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Generate New Lesson</h1>
          <p className="text-slate-600">
            Create AI-powered lesson content aligned with the Nigerian curriculum
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <CurriculumForm
          onGenerate={handleGenerate}
          isLoading={loading}
          initialClassLevel={userProfile?.classLevel}
          initialSubject={userProfile?.preferredSubjects?.[0]}
        />
      </div>
    </DashboardLayout>
  );
}

