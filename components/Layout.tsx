import React, { ReactNode } from 'react';
import { BookOpen, GraduationCap } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-green-600 p-2 rounded-lg text-white">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">NaijaPrep<span className="text-green-600">AI</span></h1>
              <p className="text-xs text-slate-500 hidden sm:block">SSCE & BECE Companion</p>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <a href="/" className="text-sm font-medium text-slate-600 hover:text-green-600 transition-colors">Curriculum</a>
            <a href="/dashboard" className="text-sm font-medium text-slate-600 hover:text-green-600 transition-colors">Dashboard</a>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} NaijaPrep AI. Content aligned with NERDC Curriculum.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;