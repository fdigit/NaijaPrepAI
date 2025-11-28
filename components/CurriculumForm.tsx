import React, { useState } from 'react';
import { AVAILABLE_SUBJECTS, WEEKS, DEFAULT_TOPIC_PLACEHOLDERS } from '../constants';
import { ClassLevel, Term, SelectionState } from '../types';
import { Sparkles, Loader2 } from 'lucide-react';

interface CurriculumFormProps {
  onGenerate: (selection: SelectionState) => void;
  isLoading: boolean;
}

const CurriculumForm: React.FC<CurriculumFormProps> = ({ onGenerate, isLoading }) => {
  const [classLevel, setClassLevel] = useState<ClassLevel>(ClassLevel.SSS1);
  const [subject, setSubject] = useState<string>(AVAILABLE_SUBJECTS[0].id);
  const [term, setTerm] = useState<Term>(Term.FIRST);
  const [week, setWeek] = useState<number>(1);
  const [topic, setTopic] = useState<string>('');

  // Helper to find subject name for placeholder logic
  const selectedSubjectObj = AVAILABLE_SUBJECTS.find(s => s.id === subject);
  const placeholder = selectedSubjectObj 
    ? DEFAULT_TOPIC_PLACEHOLDERS[selectedSubjectObj.id] || DEFAULT_TOPIC_PLACEHOLDERS['default']
    : DEFAULT_TOPIC_PLACEHOLDERS['default'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subName = AVAILABLE_SUBJECTS.find(s => s.id === subject)?.name || subject;
    onGenerate({
      classLevel,
      subject: subName,
      term,
      week,
      topic: topic.trim() || `Week ${week} Topic`, // Fallback if user leaves empty
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">Curriculum Selector</h2>
        <p className="text-slate-500 text-sm">Choose your class and topic to generate a lesson plan.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Class Level</label>
          <div className="relative">
            <select
              className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-3"
              value={classLevel}
              onChange={(e) => setClassLevel(e.target.value as ClassLevel)}
            >
              {Object.values(ClassLevel).map((lvl) => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subject</label>
          <select
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-3"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            {AVAILABLE_SUBJECTS.map((sub) => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Term</label>
          <select
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-3"
            value={term}
            onChange={(e) => setTerm(e.target.value as Term)}
          >
            {Object.values(Term).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Week</label>
          <select
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-3"
            value={week}
            onChange={(e) => setWeek(Number(e.target.value))}
          >
            {WEEKS.map((w) => (
              <option key={w} value={w}>Week {w}</option>
            ))}
          </select>
        </div>

        {/* Specific Topic Input - Spans full width on mobile, 2 cols on desktop */}
        <div className="md:col-span-2 lg:col-span-3 space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Topic (Optional but Recommended)</label>
          <input
            type="text"
            placeholder={placeholder}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-3 placeholder-slate-400"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-1 flex items-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-3 focus:outline-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Generate Lesson</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CurriculumForm;