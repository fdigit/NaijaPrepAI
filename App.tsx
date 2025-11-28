import React, { useState } from 'react';
import Layout from './components/Layout';
import CurriculumForm from './components/CurriculumForm';
import LessonView from './components/LessonView';
import { generateLessonPlan } from './services/geminiService';
import { LessonContent, SelectionState } from './types';
import { AlertCircle, BookOpen } from 'lucide-react';

const App: React.FC = () => {
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSelection, setLastSelection] = useState<SelectionState | null>(null);

  const handleGenerate = async (selection: SelectionState) => {
    setLoading(true);
    setError(null);
    setLessonContent(null);
    setLastSelection(selection);

    try {
      const content = await generateLessonPlan(selection);
      setLessonContent(content);
    } catch (err) {
      setError("Failed to generate content. Please check your connection and try again. If the topic is obscure, try being more specific.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Intro Banner */}
        {!lessonContent && !loading && (
          <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 md:p-12 text-white text-center shadow-lg">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">Master Your WAEC & JAMB Topics</h1>
            <p className="text-lg md:text-xl text-green-50 max-w-2xl mx-auto mb-8">
              Select your class and subject to instantly generate high-quality lesson notes, summaries, and practice questions aligned with the Nigerian curriculum.
            </p>
          </div>
        )}

        {/* Input Section */}
        <div id="curriculum-form">
          <CurriculumForm onGenerate={handleGenerate} isLoading={loading} />
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* Loading State Skeleton */}
        {loading && (
          <div className="space-y-6 animate-pulse">
            <div className="h-40 bg-slate-200 rounded-xl"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-12 bg-slate-200 rounded-lg"></div>
              <div className="h-12 bg-slate-200 rounded-lg"></div>
              <div className="h-12 bg-slate-200 rounded-lg"></div>
            </div>
            <div className="h-96 bg-slate-200 rounded-xl"></div>
          </div>
        )}

        {/* Content Display */}
        {lessonContent && lastSelection && (
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <BookOpen size={16} />
                <span>Current Lesson: <span className="font-semibold text-slate-700">{lastSelection.classLevel} &bull; {lastSelection.subject} &bull; Week {lastSelection.week}</span></span>
             </div>
             <LessonView content={lessonContent} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;