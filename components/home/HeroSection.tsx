'use client';

import { Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-[#00695C] via-[#1976D2] to-[#00695C] text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Master{' '}
              <span className="text-[#FF9800]">WAEC</span>,{' '}
              <span className="text-[#FF9800]">NECO</span> &{' '}
              <span className="text-[#FF9800]">JAMB</span>:
              <br />
              Your Curriculum, Powered by{' '}
              <span className="text-[#FF9800]">AI</span>.
            </h1>
            
            <p className="text-lg md:text-xl text-green-50 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Structured weekly lessons, custom notes, and exam-style practice questions for JSS & SSS students, 100% aligned with the NERDC scheme.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center gap-2 bg-[#FF9800] hover:bg-[#FF9800]/90 text-white font-bold px-8 py-4 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <Sparkles size={24} />
                Start Your Free Trial Today
              </Link>
              
              <Link
                href="#subjects"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-lg text-lg border-2 border-white/30 transition-all"
              >
                <BookOpen size={20} />
                Explore Subjects
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-green-50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#4CAF50] rounded-full"></div>
                <span>100% NERDC Aligned</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#4CAF50] rounded-full"></div>
                <span>AI-Powered Content</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#4CAF50] rounded-full"></div>
                <span>Free to Start</span>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative hidden lg:block">
            <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
              {/* Mock Dashboard Preview */}
              <div className="space-y-4">
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="h-4 bg-white/30 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-white/30 rounded w-1/2"></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white/20 rounded-lg p-3">
                      <div className="h-8 bg-white/30 rounded mb-2"></div>
                      <div className="h-3 bg-white/30 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="h-32 bg-white/30 rounded"></div>
                </div>
              </div>
            </div>
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-[#FF9800] rounded-full opacity-20 blur-2xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#4CAF50] rounded-full opacity-20 blur-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}




