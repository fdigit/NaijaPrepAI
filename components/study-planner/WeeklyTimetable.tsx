'use client';

import { Calendar, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { WeeklyTimetable as WeeklyTimetableType } from '@/services/studyPlannerService';

interface WeeklyTimetableProps {
  timetable: WeeklyTimetableType;
}

export default function WeeklyTimetable({ timetable }: WeeklyTimetableProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="text-[#00695C]" size={20} />
          <h3 className="text-lg font-semibold text-slate-900">
            Week {timetable.week}
          </h3>
        </div>
        <div className="text-sm text-slate-500">
          {new Date(timetable.startDate).toLocaleDateString()} - {new Date(timetable.endDate).toLocaleDateString()}
        </div>
      </div>

      <div className="space-y-4">
        {timetable.sessions.map((session, idx) => (
          <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="text-[#00695C]" size={16} />
              <span className="font-medium text-slate-900">{formatDate(session.date)}</span>
            </div>

            <div className="space-y-2">
              {session.subjects.map((subject, subIdx) => (
                <div
                  key={subIdx}
                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                >
                  <BookOpen className="text-[#00695C] mt-0.5" size={16} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-900">{subject.subject}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded border ${getPriorityColor(subject.priority)}`}>
                          {subject.priority}
                        </span>
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Clock size={14} />
                          <span>{subject.duration} min</span>
                        </div>
                      </div>
                    </div>
                    {subject.topics.length > 0 && (
                      <div className="mt-1">
                        <p className="text-xs text-slate-600 mb-1">Topics to cover:</p>
                        <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5">
                          {subject.topics.map((topic, topicIdx) => (
                            <li key={topicIdx}>{topic}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

