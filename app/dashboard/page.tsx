'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import WelcomeCard from '@/components/dashboard/WelcomeCard';
import StatsCards from '@/components/dashboard/StatsCards';
import WeeklyProgress from '@/components/dashboard/WeeklyProgress';
import RecentLessons from '@/components/dashboard/RecentLessons';
import PerformanceAnalytics from '@/components/dashboard/PerformanceAnalytics';
import SubjectQuizPerformance from '@/components/dashboard/SubjectQuizPerformance';
import GamificationStats from '@/components/dashboard/GamificationStats';
import AchievementNotification from '@/components/dashboard/AchievementNotification';

export default function DashboardPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#F7F8FA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00695C]"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    redirect('/auth/signin');
  }

  return (
    <DashboardLayout>
      <AchievementNotification />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Welcome Card */}
          <WelcomeCard userName={session?.user?.name || 'Student'} />

          {/* Stats Cards */}
          <StatsCards userId={session?.user?.id || ''} />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              <WeeklyProgress userId={session?.user?.id || ''} />
              <RecentLessons userId={session?.user?.id || ''} />
            </div>

            {/* Right Column - 1/3 width */}
            <div className="lg:col-span-1 space-y-6">
              <GamificationStats userId={session?.user?.id || ''} />
              <PerformanceAnalytics userId={session?.user?.id || ''} />
            </div>
          </div>

          {/* Subject Quiz Performance - Full Width */}
          <div className="mt-6">
            <SubjectQuizPerformance userId={session?.user?.id || ''} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

