'use client';

import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function FinalCTASection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-[#00695C] to-[#1976D2] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Stop Cramming.{' '}
          <span className="text-[#FF9800]">Start Mastering.</span>
        </h2>
        <p className="text-xl text-green-50 mb-8 max-w-2xl mx-auto leading-relaxed">
          Join thousands of Nigerian students who are using AI-powered learning to excel in their exams. 
          Start your free trial today and experience the difference.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signin"
            className="inline-flex items-center justify-center gap-2 bg-[#FF9800] hover:bg-[#FF9800]/90 text-white font-bold px-10 py-5 rounded-lg text-lg shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
          >
            <Sparkles size={24} />
            Start Now - It's Free
            <ArrowRight size={20} />
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-green-50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#4CAF50] rounded-full"></div>
            <span>No Credit Card Required</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#4CAF50] rounded-full"></div>
            <span>Instant Access</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#4CAF50] rounded-full"></div>
            <span>Cancel Anytime</span>
          </div>
        </div>
      </div>
    </section>
  );
}




