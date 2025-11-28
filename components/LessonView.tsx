import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { LessonContent } from '../types';
import { BookText, ListChecks, BrainCircuit, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface LessonViewProps {
  content: LessonContent;
}

const LessonView: React.FC<LessonViewProps> = ({ content }) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'summary' | 'practice'>('notes');
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(content.practiceQuestions.length).fill(-1));
  const [showTheoryAnswer, setShowTheoryAnswer] = useState(false);

  const handleOptionSelect = (qIndex: number, optionIndex: number) => {
    const newSelected = [...selectedAnswers];
    newSelected[qIndex] = optionIndex;
    setSelectedAnswers(newSelected);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{content.topicTitle}</h2>
        <p className="text-slate-600">{content.introduction}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'notes'
              ? 'border-b-2 border-green-600 text-green-700 bg-green-50/30'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <BookText size={18} />
          Lesson Notes
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'summary'
              ? 'border-b-2 border-green-600 text-green-700 bg-green-50/30'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <ListChecks size={18} />
          Key Points
        </button>
        <button
          onClick={() => setActiveTab('practice')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'practice'
              ? 'border-b-2 border-green-600 text-green-700 bg-green-50/30'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <BrainCircuit size={18} />
          Practice Quiz
        </button>
      </div>

      <div className="p-6 md:p-8 min-h-[500px]">
        {activeTab === 'notes' && (
          <div className="prose prose-slate prose-lg max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-green-600">
            <ReactMarkdown>{content.mainContent}</ReactMarkdown>
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="max-w-3xl mx-auto">
            <h3 className="text-lg font-semibold text-slate-900 mb-6">Quick Revision Summary</h3>
            <ul className="space-y-4">
              {content.summaryPoints.map((point, idx) => (
                <li key={idx} className="flex gap-4 p-4 rounded-lg bg-yellow-50 border border-yellow-100 text-slate-700">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-200 text-yellow-700 flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="max-w-3xl mx-auto space-y-12">
            {/* MCQs */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Multiple Choice Questions</h3>
                <span className="text-sm bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                  {selectedAnswers.filter(a => a !== -1).length} / {content.practiceQuestions.length} Answered
                </span>
              </div>
              
              {content.practiceQuestions.map((q, qIdx) => {
                const isAnswered = selectedAnswers[qIdx] !== -1;
                const isCorrect = isAnswered && selectedAnswers[qIdx] === q.correctOptionIndex;
                
                return (
                  <div key={qIdx} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <p className="font-medium text-slate-900 mb-4">{qIdx + 1}. {q.question}</p>
                    <div className="space-y-3">
                      {q.options.map((opt, optIdx) => {
                        let btnClass = "w-full text-left p-3 rounded-lg border text-sm transition-all ";
                        
                        if (isAnswered) {
                           if (optIdx === q.correctOptionIndex) {
                             btnClass += "bg-green-100 border-green-500 text-green-900";
                           } else if (selectedAnswers[qIdx] === optIdx) {
                             btnClass += "bg-red-50 border-red-300 text-red-900";
                           } else {
                             btnClass += "bg-white border-slate-200 text-slate-400";
                           }
                        } else {
                           btnClass += "bg-white border-slate-200 hover:border-green-400 hover:bg-green-50 text-slate-700";
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={isAnswered}
                            onClick={() => handleOptionSelect(qIdx, optIdx)}
                            className={btnClass}
                          >
                            <div className="flex items-center justify-between">
                              <span><span className="font-semibold mr-2">{String.fromCharCode(65 + optIdx)}.</span> {opt}</span>
                              {isAnswered && optIdx === q.correctOptionIndex && <CheckCircle2 size={16} className="text-green-600" />}
                              {isAnswered && selectedAnswers[qIdx] === optIdx && optIdx !== q.correctOptionIndex && <XCircle size={16} className="text-red-500" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {isAnswered && (
                      <div className={`mt-4 p-3 rounded-lg text-sm ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-slate-100 text-slate-700'}`}>
                        <span className="font-bold">Explanation:</span> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Theory */}
            <div className="border-t border-slate-200 pt-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Theory Question</h3>
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-6 bg-slate-50 border-b border-slate-200">
                  <p className="font-medium text-slate-900">{content.theoryQuestion.question}</p>
                </div>
                <div className="p-4">
                  <button 
                    onClick={() => setShowTheoryAnswer(!showTheoryAnswer)}
                    className="flex items-center gap-2 text-green-600 font-medium text-sm hover:text-green-700"
                  >
                    {showTheoryAnswer ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {showTheoryAnswer ? 'Hide Model Answer' : 'Show Model Answer'}
                  </button>
                  {showTheoryAnswer && (
                    <div className="mt-4 prose prose-sm prose-slate bg-green-50/50 p-4 rounded-lg border border-green-100">
                      <ReactMarkdown>{content.theoryQuestion.answer}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonView;