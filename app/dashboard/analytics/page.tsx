'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import SubjectQuizPerformance from '@/components/dashboard/SubjectQuizPerformance';
import PerformanceAnalytics from '@/components/dashboard/PerformanceAnalytics';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00695C]"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BarChart3 size={32} className="text-[#00695C]" />
            Analytics & Performance
          </h1>
          <p className="text-slate-600 mt-2">
            Track your quiz performance and progress across all subjects
          </p>
        </div>

        <div className="space-y-6">
          {/* Subject-wise Performance */}
          <SubjectQuizPerformance userId={session?.user?.id || ''} />

          {/* Overall Performance Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceAnalytics userId={session?.user?.id || ''} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

