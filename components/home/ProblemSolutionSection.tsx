'use client';

import { AlertCircle, CheckCircle2, Brain, BookOpen } from 'lucide-react';

export default function ProblemSolutionSection() {
  const problems = [
    {
      icon: AlertCircle,
      title: 'Generic Materials',
      description: 'One-size-fits-all content that doesn\'t match your specific curriculum or exam format.',
      color: 'text-[#E53935]',
      bgColor: 'bg-[#E53935]/10',
    },
    {
      icon: AlertCircle,
      title: 'Confusing Schemes',
      description: 'Hard to follow weekly structure. You never know what to study next or if you\'re on track.',
      color: 'text-[#E53935]',
      bgColor: 'bg-[#E53935]/10',
    },
    {
      icon: AlertCircle,
      title: 'Lack of Practice',
      description: 'Limited access to exam-style questions that match WAEC, NECO, and JAMB formats.',
      color: 'text-[#E53935]',
      bgColor: 'bg-[#E53935]/10',
    },
  ];

  const solutions = [
    {
      icon: Brain,
      title: '100% Curriculum Alignment',
      description: 'Every lesson is generated specifically for your class level, term, and week according to NERDC standards.',
      color: 'text-[#00695C]',
      bgColor: 'bg-[#00695C]/10',
    },
    {
      icon: BookOpen,
      title: 'Weekly Structure, Not Random Topics',
      description: 'Follow a clear, organized path through your entire curriculum. Know exactly what to study each week.',
      color: 'text-[#00695C]',
      bgColor: 'bg-[#00695C]/10',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Problems Section */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-4">
            The Problem with Traditional Study Materials
          </h2>
          <p className="text-lg text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            Nigerian students face unique challenges when preparing for WAEC, NECO, and JAMB exams.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {problems.map((problem, index) => {
              const Icon = problem.icon;
              return (
                <div
                  key={index}
                  className={`${problem.bgColor} rounded-xl p-6 border-2 border-slate-100 hover:shadow-lg transition-all`}
                >
                  <div className={`${problem.color} mb-4`}>
                    <Icon size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{problem.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{problem.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Solution Section */}
        <div className="bg-gradient-to-br from-[#00695C]/5 to-[#1976D2]/5 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#00695C] rounded-full mb-4">
              <CheckCircle2 className="text-white" size={32} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#00695C] mb-4">
              The NaijaPrep AI Solution
            </h2>
            <p className="text-lg text-slate-700 max-w-2xl mx-auto">
              Powered by Google Gemini AI, we generate personalized, curriculum-aligned content that adapts to your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {solutions.map((solution, index) => {
              const Icon = solution.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-8 shadow-md border border-slate-200 hover:shadow-xl transition-all"
                >
                  <div className={`${solution.bgColor} w-16 h-16 rounded-lg flex items-center justify-center mb-6`}>
                    <Icon className={solution.color} size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{solution.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{solution.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}




