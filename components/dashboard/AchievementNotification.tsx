'use client';

import { useEffect, useState } from 'react';
import { X, Award, Zap, TrendingUp } from 'lucide-react';

interface Achievement {
  type: 'badge' | 'level' | 'streak' | 'xp';
  title: string;
  message: string;
  icon?: string;
  xp?: number;
}

export default function AchievementNotification() {
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Listen for achievement events (can be extended with WebSocket or polling)
    const handleAchievement = (event: CustomEvent<Achievement>) => {
      setAchievement(event.detail);
      setShow(true);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setShow(false);
      }, 5000);
    };

    window.addEventListener('achievement' as any, handleAchievement as EventListener);
    return () => {
      window.removeEventListener('achievement' as any, handleAchievement as EventListener);
    };
  }, []);

  if (!show || !achievement) {
    return null;
  }

  const getIcon = () => {
    if (achievement.icon) {
      return <span className="text-4xl">{achievement.icon}</span>;
    }
    switch (achievement.type) {
      case 'badge':
        return <Award className="text-yellow-500" size={32} />;
      case 'level':
        return <TrendingUp className="text-blue-500" size={32} />;
      case 'xp':
        return <Zap className="text-orange-500" size={32} />;
      default:
        return <Award className="text-[#00695C]" size={32} />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="bg-white rounded-lg shadow-2xl border-2 border-[#00695C] p-6 max-w-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">{getIcon()}</div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-900 mb-1">{achievement.title}</h4>
            <p className="text-sm text-slate-600 mb-2">{achievement.message}</p>
            {achievement.xp && (
              <div className="flex items-center gap-1 text-orange-600 text-sm font-semibold">
                <Zap size={14} />
                +{achievement.xp} XP
              </div>
            )}
          </div>
          <button
            onClick={() => setShow(false)}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function to trigger achievement notification
export function triggerAchievement(achievement: Achievement) {
  const event = new CustomEvent('achievement', { detail: achievement });
  window.dispatchEvent(event);
}

