'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { AVAILABLE_SUBJECTS } from '@/constants';
import { ClassLevel } from '@/types';
import { Loader2, Save, Check } from 'lucide-react';

interface UserProfile {
  classLevel: ClassLevel | null;
  preferredSubjects: string[];
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    classLevel: null,
    preferredSubjects: [],
  });
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/auth/signin');
    }
  }, [status]);

  // Fetch user profile
  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user?.id) return;
      
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setProfile({
            classLevel: data.classLevel,
            preferredSubjects: data.preferredSubjects || [],
          });
          setSelectedSubjects(data.preferredSubjects || []);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session]);

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classLevel: profile.classLevel,
          preferredSubjects: selectedSubjects,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setProfile((prev) => ({
          ...prev,
          preferredSubjects: selectedSubjects,
        }));
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save preferences');
      }
    } catch (err) {
      setError('An error occurred while saving');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-[#00695C]" size={48} />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600">
            Manage your profile and study preferences
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <Check size={20} />
            <p>Preferences saved successfully!</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={session?.user?.name || ''}
                  disabled
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600"
                />
                <p className="text-xs text-slate-500 mt-1">Name cannot be changed</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={session?.user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600"
                />
                <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
              </div>
            </div>
          </div>

          {/* Study Preferences */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Study Preferences</h2>
            
            {/* Class Level */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Class Level
              </label>
              <select
                value={profile.classLevel || ''}
                onChange={(e) =>
                  setProfile((prev) => ({
                    ...prev,
                    classLevel: (e.target.value as ClassLevel) || null,
                  }))
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#00695C] focus:border-[#00695C] outline-none"
              >
                <option value="">Select your class level</option>
                {Object.values(ClassLevel).map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            {/* Preferred Subjects */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Preferred Subjects
              </label>
              <p className="text-sm text-slate-600 mb-4">
                Select the subjects you want to focus on. These will be used to pre-fill the lesson generation form.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                {AVAILABLE_SUBJECTS.map((subject) => {
                  const isSelected = selectedSubjects.includes(subject.id);
                  return (
                    <button
                      key={subject.id}
                      type="button"
                      onClick={() => handleSubjectToggle(subject.id)}
                      className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-[#00695C] text-white border-[#00695C]'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-[#00695C] hover:text-[#00695C]'
                      }`}
                    >
                      {subject.name}
                    </button>
                  );
                })}
              </div>

              {selectedSubjects.length > 0 && (
                <p className="text-sm text-slate-600 mb-4">
                  {selectedSubjects.length} subject{selectedSubjects.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#00695C] hover:bg-[#00695C]/90 text-white font-semibold px-6 py-3 rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}




