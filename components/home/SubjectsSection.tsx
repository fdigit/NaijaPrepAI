'use client';

import { AVAILABLE_SUBJECTS } from '@/constants';
import { BookOpen } from 'lucide-react';

export default function SubjectsSection() {
  const categories = {
    science: AVAILABLE_SUBJECTS.filter((s) => s.categories.includes('science')),
    art: AVAILABLE_SUBJECTS.filter((s) => s.categories.includes('art')),
    commercial: AVAILABLE_SUBJECTS.filter((s) => s.categories.includes('commercial')),
    general: AVAILABLE_SUBJECTS.filter((s) => s.categories.includes('general')),
  };

  return (
    <section id="subjects" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            All Subjects Covered
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            From JSS to SSS, we support all major subjects across Science, Arts, Commercial, and General categories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(categories).map(([category, subjects]) => (
            <div
              key={category}
              className="bg-[#F7F8FA] rounded-xl p-6 border border-slate-200"
            >
              <h3 className="text-lg font-bold text-slate-900 mb-4 capitalize">
                {category === 'art' ? 'Arts' : category.charAt(0).toUpperCase() + category.slice(1)}
              </h3>
              <ul className="space-y-2">
                {subjects.map((subject) => (
                  <li
                    key={subject.id}
                    className="flex items-center gap-2 text-slate-700 hover:text-[#00695C] transition-colors"
                  >
                    <BookOpen size={16} className="text-[#00695C]" />
                    <span>{subject.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-600 mb-4">
            <span className="font-bold text-slate-900">{AVAILABLE_SUBJECTS.length}+</span> subjects available
          </p>
          <p className="text-sm text-slate-500">
            All content is generated fresh for each lesson, ensuring relevance and accuracy.
          </p>
        </div>
      </div>
    </section>
  );
}




