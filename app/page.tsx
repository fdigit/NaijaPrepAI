'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CurriculumForm from '@/components/CurriculumForm';
import { generateLessonPlan } from '@/services/geminiService';
import { SelectionState } from '@/types';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/home/HeroSection';
import ProblemSolutionSection from '@/components/home/ProblemSolutionSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import SubjectsSection from '@/components/home/SubjectsSection';
import FinalCTASection from '@/components/home/FinalCTASection';
import Footer from '@/components/home/Footer';

export default function Home() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle session loading state
  const isLoadingSession = sessionStatus === 'loading';

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (sessionStatus === 'authenticated' && session?.user) {
      router.push('/dashboard');
    }
  }, [sessionStatus, session, router]);

  const handleGenerate = async (selection: SelectionState) => {
    setLoading(true);
    setError(null);

    try {
      const content = await generateLessonPlan(selection);
      
      // Save lesson to database if user is logged in
      let lessonId = null;
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/lessons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selection, content }),
          });
          if (response.ok) {
            const savedLesson = await response.json();
            lessonId = savedLesson.id;
          }
        } catch (saveError) {
          console.error('Error saving lesson:', saveError);
          // Continue even if save fails - we'll show the lesson anyway
        }
      }

      // Store lesson in sessionStorage and redirect to lesson view
      if (lessonId) {
        // If saved, redirect to the saved lesson page
        router.push(`/lessons/${lessonId}`);
      } else {
        // If not saved (user not logged in), store temporarily and show on a temp page
        sessionStorage.setItem('tempLesson', JSON.stringify({ selection, content }));
        router.push('/lesson/preview');
      }
    } catch (err) {
      setError("Failed to generate content. Please check your connection and try again. If the topic is obscure, try being more specific.");
      setLoading(false);
    }
  };

  // Show loading state while session is being checked
  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00695C]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection />

      {/* Problem & Solution */}
      <ProblemSolutionSection />

      {/* Features Deep Dive */}
      <FeaturesSection />

      {/* Subjects Section */}
      <SubjectsSection />

      {/* Lesson Generator Section */}
      <section id="generator" className="py-16 md:py-24 bg-[#F7F8FA]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Try It Now - Generate Your First Lesson
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Select your class, subject, and topic to instantly generate a complete lesson plan.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            {/* Auth Prompt */}
            {!session && (
              <div className="bg-gradient-to-r from-[#FF9800] to-[#FFC107] rounded-xl p-4 text-center mb-6">
                <p className="text-white font-medium">
                  <Link href="/auth/signin" className="underline font-semibold">
                    Sign in
                  </Link>{' '}
                  to save your lessons and track your progress!
                </p>
              </div>
            )}

            {/* Input Section */}
            <div id="curriculum-form">
              <CurriculumForm onGenerate={handleGenerate} isLoading={loading} />
            </div>

            {/* Error State */}
            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
                <AlertCircle size={20} />
                <p>{error}</p>
              </div>
            )}

            {/* Loading State Skeleton */}
            {loading && (
              <div className="mt-6 space-y-6 animate-pulse">
                <div className="h-40 bg-slate-200 rounded-xl"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-12 bg-slate-200 rounded-lg"></div>
                  <div className="h-12 bg-slate-200 rounded-lg"></div>
                  <div className="h-12 bg-slate-200 rounded-lg"></div>
                </div>
                <div className="h-96 bg-slate-200 rounded-xl"></div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <FinalCTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
