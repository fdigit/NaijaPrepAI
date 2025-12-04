import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { LessonContent } from '../types';
import { BookText, ListChecks, BrainCircuit, CheckCircle2, XCircle, ChevronDown, ChevronUp, FileText, FileDown, Loader2, Clock, ImageIcon } from 'lucide-react';
import { exportToWord, exportToPDF } from '@/utils/exportUtils';

interface LessonViewProps {
  content: LessonContent;
  metadata?: {
    classLevel?: string;
    subject?: string;
    term?: string;
    week?: number;
    topic?: string;
  };
}

interface LessonViewProps {
  content: LessonContent;
  metadata?: {
    classLevel?: string;
    subject?: string;
    term?: string;
    week?: number;
    topic?: string;
  };
  lessonId?: string; // Add lessonId for saving quiz attempts
}

const LessonView: React.FC<LessonViewProps> = ({ content, metadata, lessonId }) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'summary' | 'practice'>('notes');
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(content.practiceQuestions.length).fill(-1));
  const [showTheoryAnswer, setShowTheoryAnswer] = useState(false);
  const [exporting, setExporting] = useState<'word' | 'pdf' | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizTime, setQuizTime] = useState(0); // Time in seconds
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<{
    score: number;
    correctAnswers: number;
    totalQuestions: number;
  } | null>(null);
  const [savingAttempt, setSavingAttempt] = useState(false);

  const handleExportWord = async () => {
    try {
      setExporting('word');
      await exportToWord(content, metadata);
    } catch (error) {
      console.error('Error exporting to Word:', error);
      alert('Failed to export to Word. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting('pdf');
      await exportToPDF(content, metadata);
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      alert('Failed to export to PDF. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  // Track quiz time
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeTab === 'practice' && !quizSubmitted) {
      if (!quizStarted) {
        setQuizStarted(true);
      }
      interval = setInterval(() => {
        setQuizTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, quizSubmitted, quizStarted]);

  const handleOptionSelect = (qIndex: number, optionIndex: number) => {
    if (quizSubmitted) return; // Don't allow changes after submission
    const newSelected = [...selectedAnswers];
    newSelected[qIndex] = optionIndex;
    setSelectedAnswers(newSelected);
  };

  const handleSubmitQuiz = async () => {
    if (!lessonId) {
      alert('Lesson ID is required to save quiz results.');
      return;
    }

    const answeredCount = selectedAnswers.filter((a) => a !== -1).length;
    if (answeredCount < content.practiceQuestions.length) {
      const confirm = window.confirm(
        `You have only answered ${answeredCount} out of ${content.practiceQuestions.length} questions. Do you want to submit anyway?`
      );
      if (!confirm) return;
    }

    // Calculate score (only count answered questions)
    let correctCount = 0;
    const answers = content.practiceQuestions
      .map((q, qIdx) => {
        const selected = selectedAnswers[qIdx];
        // Skip unanswered questions (-1)
        if (selected === -1) return null;
        const isCorrect = selected === q.correctOptionIndex;
        if (isCorrect) correctCount++;
        return {
          questionIndex: qIdx,
          selectedOption: selected,
          isCorrect,
        };
      })
      .filter((a) => a !== null) as Array<{
        questionIndex: number;
        selectedOption: number;
        isCorrect: boolean;
      }>;

    // Calculate score based on answered questions only
    const answeredQuestionsCount = answers.length;
    const score = answeredQuestionsCount > 0 ? (correctCount / answeredQuestionsCount) * 100 : 0;
    const result = {
      score: Math.round(score * 100) / 100,
      correctAnswers: correctCount,
      totalQuestions: content.practiceQuestions.length, // Use total questions for consistency
    };

    setQuizResult(result);
    setQuizSubmitted(true);

    // Save quiz attempt
    try {
      setSavingAttempt(true);
      const response = await fetch('/api/quiz/attempt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
          answers,
          timeSpent: quizTime,
          totalQuestions: content.practiceQuestions.length, // Send total questions count
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || 'Failed to save quiz attempt');
      }

      const data = await response.json();
      console.log('Quiz attempt saved:', data);
    } catch (error: any) {
      console.error('Error saving quiz attempt:', error);
      const errorMessage = error?.message || 'Failed to save quiz attempt';
      console.error('Full error:', error);
      alert(`Quiz completed! Your score: ${result.score}%\n\nHowever, there was an issue saving your results: ${errorMessage}\n\nPlease check the console for more details.`);
    } finally {
      setSavingAttempt(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{content.topicTitle}</h2>
            <p className="text-slate-600">{content.introduction}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportWord}
              disabled={exporting !== null}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#00695C] text-white rounded-lg hover:bg-[#005a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              title="Export as Word Document"
            >
              {exporting === 'word' ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Exporting...
                </>
              ) : (
                <>
                  <FileText size={16} />
                  Export Word
                </>
              )}
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exporting !== null}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              title="Export as PDF Document"
            >
              {exporting === 'pdf' ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Exporting...
                </>
              ) : (
                <>
                  <FileDown size={16} />
                  Export PDF
                </>
              )}
            </button>
          </div>
        </div>
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
          <div className="max-w-none">
            {/* Display generated image if available */}
            {content.generatedImage && (
              <div className="mb-8 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
                <div className="w-full h-auto max-h-[400px] flex items-center justify-center bg-slate-100 overflow-hidden relative group">
                  <img 
                    src={content.generatedImage} 
                    alt={`Illustration for ${content.topicTitle}`} 
                    className="w-full h-full object-contain" 
                    onError={(e) => {
                      // Hide image if it fails to load
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-medium flex items-center gap-2">
                      <ImageIcon size={16} />
                      AI Generated Educational Illustration
                    </p>
                  </div>
                </div>
                <div className="px-4 py-2 bg-slate-50 text-xs text-slate-500 text-center border-t border-slate-200">
                  Figure 1: Visual aid for {content.topicTitle}
                </div>
              </div>
            )}
            <div className="prose prose-slate prose-lg max-w-none prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-green-600 prose-img:rounded-xl prose-img:shadow-sm">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {content.mainContent}
              </ReactMarkdown>
            </div>
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
                  <div className="prose prose-sm prose-slate max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {point}
                    </ReactMarkdown>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'practice' && (
          <div className="max-w-3xl mx-auto space-y-12">
            {/* Quiz Header with Timer and Submit */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Practice Quiz</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span>
                      {selectedAnswers.filter((a) => a !== -1).length} / {content.practiceQuestions.length} Answered
                    </span>
                    {quizStarted && (
                      <span className="flex items-center gap-1">
                        <Clock size={16} />
                        Time: {formatTime(quizTime)}
                      </span>
                    )}
                  </div>
                </div>
                {!quizSubmitted && (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={savingAttempt}
                    className="px-6 py-2 bg-[#00695C] text-white rounded-lg hover:bg-[#005a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {savingAttempt ? 'Saving...' : 'Submit Quiz'}
                  </button>
                )}
                {quizSubmitted && quizResult && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#00695C]">
                      {quizResult.score}%
                    </div>
                    <div className="text-sm text-slate-600">
                      {quizResult.correctAnswers} / {quizResult.totalQuestions} Correct
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* MCQs */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Multiple Choice Questions</h3>
              </div>
              
              {content.practiceQuestions.map((q, qIdx) => {
                const isAnswered = selectedAnswers[qIdx] !== -1;
                const isCorrect = isAnswered && selectedAnswers[qIdx] === q.correctOptionIndex;
                
                return (
                  <div key={qIdx} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <div className="font-medium text-slate-900 mb-4 prose prose-p:my-0">
                      <span className="font-bold mr-1">{qIdx + 1}.</span>
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={{ p: React.Fragment }}
                      >
                        {q.question}
                      </ReactMarkdown>
                    </div>
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
                            disabled={isAnswered || quizSubmitted}
                            onClick={() => handleOptionSelect(qIdx, optIdx)}
                            className={btnClass}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold min-w-[1.5rem]">{String.fromCharCode(65 + optIdx)}.</span>
                                <span className="prose prose-sm prose-p:my-0">
                                  <ReactMarkdown
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                    components={{ p: React.Fragment }}
                                  >
                                    {opt}
                                  </ReactMarkdown>
                                </span>
                              </div>
                              {isAnswered && optIdx === q.correctOptionIndex && <CheckCircle2 size={16} className="text-green-600 flex-shrink-0" />}
                              {isAnswered && selectedAnswers[qIdx] === optIdx && optIdx !== q.correctOptionIndex && <XCircle size={16} className="text-red-500 flex-shrink-0" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {isAnswered && (
                      <div className={`mt-4 p-3 rounded-lg text-sm ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-slate-100 text-slate-700'}`}>
                        <span className="font-bold block mb-1">Explanation:</span>
                        <div className="prose prose-sm prose-p:my-0">
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                          >
                            {q.explanation}
                          </ReactMarkdown>
                        </div>
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
                  <div className="font-medium text-slate-900 prose prose-p:my-0">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {content.theoryQuestion.question}
                    </ReactMarkdown>
                  </div>
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
                    <div className="mt-4 prose prose-sm prose-slate bg-green-50/50 p-4 rounded-lg border border-green-100 max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {content.theoryQuestion.answer}
                      </ReactMarkdown>
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