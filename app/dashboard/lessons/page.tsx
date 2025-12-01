'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { BookOpen, Search, Filter, X, Calendar, GraduationCap, Clock } from 'lucide-react';
import Link from 'next/link';
import { ClassLevel, Term } from '@/types';
import { AVAILABLE_SUBJECTS } from '@/constants';

interface Lesson {
  id: string;
  topicTitle: string;
  subject: string;
  classLevel: string;
  term: string;
  week: number;
  topic: string;
  createdAt: string;
}

export default function MyLessonsPage() {
  const { data: session, status } = useSession();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<string>('all');
  const [selectedWeek, setSelectedWeek] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin');
    }
  }, [status]);

  useEffect(() => {
    async function fetchLessons() {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch(`/api/lessons?userId=${session.user.id}`);
        if (response.ok) {
          const data = await response.json();
          setLessons(data);
          setFilteredLessons(data);
        }
      } catch (error) {
        console.error('Error fetching lessons:', error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.id) {
      fetchLessons();
    }
  }, [session]);

  useEffect(() => {
    let filtered = [...lessons];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (lesson) =>
          lesson.topicTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lesson.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lesson.topic.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Class filter
    if (selectedClass !== 'all') {
      filtered = filtered.filter((lesson) => lesson.classLevel === selectedClass);
    }

    // Subject filter
    if (selectedSubject !== 'all') {
      filtered = filtered.filter((lesson) => lesson.subject === selectedSubject);
    }

    // Term filter
    if (selectedTerm !== 'all') {
      filtered = filtered.filter((lesson) => lesson.term === selectedTerm);
    }

    // Week filter
    if (selectedWeek !== 'all') {
      filtered = filtered.filter((lesson) => lesson.week === parseInt(selectedWeek));
    }

    setFilteredLessons(filtered);
  }, [lessons, searchQuery, selectedClass, selectedSubject, selectedTerm, selectedWeek]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedClass('all');
    setSelectedSubject('all');
    setSelectedTerm('all');
    setSelectedWeek('all');
  };

  const activeFiltersCount = [
    selectedClass !== 'all',
    selectedSubject !== 'all',
    selectedTerm !== 'all',
    selectedWeek !== 'all',
    searchQuery !== '',
  ].filter(Boolean).length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-slate-200 rounded w-1/3"></div>
            <div className="h-16 bg-slate-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-[#00695C] p-3 rounded-lg">
                <BookOpen className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">My Lessons</h1>
                <p className="text-slate-600">
                  {filteredLessons.length} {filteredLessons.length === 1 ? 'lesson' : 'lessons'} found
                </p>
              </div>
            </div>
            <Link
              href="/"
              className="bg-[#00695C] hover:bg-[#00695C]/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Generate New Lesson
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search lessons by title, subject, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00695C] focus:border-[#00695C] outline-none"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-slate-700 hover:text-[#00695C] font-medium transition-colors"
            >
              <Filter size={20} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-[#FF9800] text-white text-xs font-bold px-2 py-1 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm transition-colors"
              >
                <X size={16} />
                Clear All
              </button>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Class Level Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <GraduationCap size={16} className="inline mr-1" />
                    Class Level
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00695C] focus:border-[#00695C] outline-none"
                  >
                    <option value="all">All Classes</option>
                    {Object.values(ClassLevel).map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <BookOpen size={16} className="inline mr-1" />
                    Subject
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00695C] focus:border-[#00695C] outline-none"
                  >
                    <option value="all">All Subjects</option>
                    {AVAILABLE_SUBJECTS.map((subject) => (
                      <option key={subject.id} value={subject.name}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Term Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Term
                  </label>
                  <select
                    value={selectedTerm}
                    onChange={(e) => setSelectedTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00695C] focus:border-[#00695C] outline-none"
                  >
                    <option value="all">All Terms</option>
                    {Object.values(Term).map((term) => (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Week Filter */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <Clock size={16} className="inline mr-1" />
                    Week
                  </label>
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00695C] focus:border-[#00695C] outline-none"
                  >
                    <option value="all">All Weeks</option>
                    {Array.from({ length: 13 }, (_, i) => i + 1).map((week) => (
                      <option key={week} value={week.toString()}>
                        Week {week}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lessons Grid */}
        {filteredLessons.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <BookOpen className="mx-auto text-slate-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {lessons.length === 0 ? 'No lessons yet' : 'No lessons match your filters'}
            </h3>
            <p className="text-slate-600 mb-6">
              {lessons.length === 0
                ? 'Start generating lessons to build your library!'
                : 'Try adjusting your filters to see more results.'}
            </p>
            {lessons.length === 0 && (
              <Link
                href="/"
                className="inline-block bg-[#00695C] hover:bg-[#00695C]/90 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Generate Your First Lesson
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/lessons/${lesson.id}`}
                className="bg-white rounded-xl p-6 border border-slate-200 hover:border-[#00695C] hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-[#00695C] transition-colors line-clamp-2">
                      {lesson.topicTitle}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 mb-3">
                      <span className="bg-[#00695C]/10 text-[#00695C] px-2 py-1 rounded font-medium">
                        {lesson.subject}
                      </span>
                      <span className="text-slate-500">{lesson.classLevel}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-slate-600 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{lesson.term} • Week {lesson.week}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>{formatDate(lesson.createdAt)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[#00695C] font-semibold text-sm group-hover:underline">
                    View Lesson →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}




