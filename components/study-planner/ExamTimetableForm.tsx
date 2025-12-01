'use client';

import { useState } from 'react';
import { Calendar, Plus, X, Save } from 'lucide-react';
import { AVAILABLE_SUBJECTS } from '@/constants';

interface ExamSubject {
  subject: string;
  date: string;
  time?: string;
}

interface ExamTimetableFormProps {
  onSubmit: (data: {
    examName: string;
    examDate: string;
    endDate?: string;
    subjectExams: ExamSubject[];
  }) => void;
  onCancel?: () => void;
  initialData?: {
    examName?: string;
    examDate?: string;
    endDate?: string;
    subjectExams?: ExamSubject[];
  };
}

export default function ExamTimetableForm({
  onSubmit,
  onCancel,
  initialData,
}: ExamTimetableFormProps) {
  const [examName, setExamName] = useState(initialData?.examName || '');
  const [examDate, setExamDate] = useState(initialData?.examDate || '');
  const [endDate, setEndDate] = useState(initialData?.endDate || '');
  const [subjectExams, setSubjectExams] = useState<ExamSubject[]>(
    initialData?.subjectExams || []
  );

  const addSubjectExam = () => {
    setSubjectExams([...subjectExams, { subject: '', date: '', time: '' }]);
  };

  const removeSubjectExam = (index: number) => {
    setSubjectExams(subjectExams.filter((_, i) => i !== index));
  };

  const updateSubjectExam = (index: number, field: keyof ExamSubject, value: string) => {
    const updated = [...subjectExams];
    updated[index] = { ...updated[index], [field]: value };
    setSubjectExams(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examName || !examDate) {
      alert('Please fill in exam name and date');
      return;
    }
    onSubmit({
      examName,
      examDate,
      endDate: endDate || undefined,
      subjectExams: subjectExams.filter(s => s.subject && s.date),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <Calendar className="text-[#00695C]" size={20} />
        {initialData ? 'Edit Exam Timetable' : 'Create Exam Timetable'}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Exam Name *
          </label>
          <input
            type="text"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            placeholder="e.g., WAEC 2024, BECE 2024"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00695C]"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Exam Start Date *
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00695C]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Exam End Date (Optional)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00695C]"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-slate-700">
              Subject Exam Dates
            </label>
            <button
              type="button"
              onClick={addSubjectExam}
              className="flex items-center gap-1 text-sm text-[#00695C] hover:text-[#004D40] font-medium"
            >
              <Plus size={16} />
              Add Subject
            </button>
          </div>

          <div className="space-y-2">
            {subjectExams.map((subjectExam, index) => (
              <div key={index} className="flex gap-2 items-start p-3 bg-slate-50 rounded-lg">
                <select
                  value={subjectExam.subject}
                  onChange={(e) => updateSubjectExam(index, 'subject', e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00695C]"
                >
                  <option value="">Select subject</option>
                  {AVAILABLE_SUBJECTS.map((subj) => (
                    <option key={subj.id} value={subj.name}>
                      {subj.name}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={subjectExam.date}
                  onChange={(e) => updateSubjectExam(index, 'date', e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00695C]"
                  placeholder="Date"
                />
                <input
                  type="time"
                  value={subjectExam.time || ''}
                  onChange={(e) => updateSubjectExam(index, 'time', e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00695C]"
                  placeholder="Time"
                />
                <button
                  type="button"
                  onClick={() => removeSubjectExam(index)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center gap-2 bg-[#00695C] text-white px-4 py-2 rounded-lg hover:bg-[#004D40] transition-colors font-medium"
          >
            <Save size={18} />
            Save Timetable
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

