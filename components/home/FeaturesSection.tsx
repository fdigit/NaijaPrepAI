'use client';

import { BookText, ClipboardCheck, Lightbulb } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      icon: BookText,
      title: 'Detailed Lesson Notes',
      description: 'Custom-generated, 800-1000 word notes in simple, clear language. Never miss a concept. Each lesson is tailored to your specific class level and topic.',
      color: 'text-[#00695C]',
      bgColor: 'bg-[#00695C]/10',
      borderColor: 'border-[#00695C]/20',
    },
    {
      icon: ClipboardCheck,
      title: 'Exam-Ready Quizzes',
      description: '5 MCQs and 1 Theory Question per topic, matching the exact format and difficulty of WAEC/JAMB. Practice with questions designed to mirror real exam conditions.',
      color: 'text-[#FF9800]',
      bgColor: 'bg-[#FF9800]/10',
      borderColor: 'border-[#FF9800]/20',
    },
    {
      icon: Lightbulb,
      title: 'Quick Revision Summary',
      description: '3-5 Key Points for last-minute review. Master complex topics in minutes. Perfect for quick revision before exams or class tests.',
      color: 'text-[#4CAF50]',
      bgColor: 'bg-[#4CAF50]/10',
      borderColor: 'border-[#4CAF50]/20',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-[#F7F8FA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Everything You Need in One Lesson
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Each generated lesson includes comprehensive content designed to help you master the topic completely.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`bg-white rounded-xl p-8 shadow-sm border-2 ${feature.borderColor} hover:shadow-xl transition-all transform hover:-translate-y-2`}
              >
                <div className={`${feature.bgColor} w-16 h-16 rounded-lg flex items-center justify-center mb-6`}>
                  <Icon className={feature.color} size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Additional Feature Highlight */}
        <div className="mt-16 bg-gradient-to-r from-[#00695C] to-[#1976D2] rounded-2xl p-8 md:p-12 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">
                Track Your Progress, Build Your Confidence
              </h3>
              <p className="text-green-50 text-lg mb-6 leading-relaxed">
                Our intelligent dashboard shows you exactly where you are in your curriculum journey. 
                Track your study streak, monitor your quiz performance, and see your overall progress at a glance.
              </p>
              <ul className="space-y-3 text-green-50">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#4CAF50] rounded-full"></div>
                  <span>Visual progress tracking by subject and term</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#4CAF50] rounded-full"></div>
                  <span>Study streak counter to maintain consistency</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#4CAF50] rounded-full"></div>
                  <span>Performance analytics to identify strengths and weaknesses</span>
                </li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              {/* Mock Progress Visualization */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Mathematics</span>
                    <span className="font-bold">85%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div className="bg-[#4CAF50] h-3 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Physics</span>
                    <span className="font-bold">72%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div className="bg-[#4CAF50] h-3 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Chemistry</span>
                    <span className="font-bold">68%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3">
                    <div className="bg-[#4CAF50] h-3 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Study Streak</span>
                    <span className="text-2xl font-bold text-[#FF9800]">🔥 7 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}




