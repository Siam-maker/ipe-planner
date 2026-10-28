import React, { useState } from 'react';
import { BookOpen, CheckCircle2, ArrowRight, ArrowLeft, Layers, Sparkles, X } from 'lucide-react';
import { Course } from '../types';
import ipeLogo from '../assets/ipe-logo.png';

interface WelcomeModalProps {
  level: number;
  term: number;
  courses: Course[];
  totalCredits: number;
  onSelectLevel: (lvl: number) => void;
  onSelectTerm: (t: number) => void;
  onComplete: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  level,
  term,
  courses,
  totalCredits,
  onSelectLevel,
  onSelectTerm,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
    >
      <div className="bg-white w-full sm:max-w-[540px] rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Mobile grab handle */}
        <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Modal Top Bar */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={ipeLogo}
              alt="BUET IPE Logo"
              referrerPolicy="no-referrer"
              className="w-10 h-10 object-contain rounded-xl border border-slate-200 p-1 bg-white"
            />
            <div>
              <span className="text-xs font-semibold text-blue-600">
                Step {step} of 3
              </span>
              <h2 id="welcome-modal-title" className="text-lg font-bold text-slate-900 leading-snug">
                {step === 1 && 'Welcome to IPE Study Planner'}
                {step === 2 && `Your Level ${level} Term ${term === 1 ? 'I' : 'II'} Courses`}
                {step === 3 && 'Everything Stays on Your Device'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onComplete}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <span>Skip Intro</span>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5">
          <div
            className="bg-blue-600 h-full transition-all duration-200"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {step === 1 && (
            <div className="space-y-5">
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Built for BUET Industrial &amp; Production Engineering students. First, pick your current academic <strong>Level</strong> and <strong>Term</strong> so we load the right syllabus and calculators.
              </p>

              {/* Level Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  1. Select Your Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[1, 2, 3, 4].map((l) => {
                    const active = level === l;
                    return (
                      <button
                        key={l}
                        type="button"
                        onClick={() => onSelectLevel(l)}
                        className={`min-h-[48px] px-4 py-2.5 rounded-xl font-semibold text-sm border transition-all cursor-pointer ${
                          active
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Level {l}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Term Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  2. Select Your Term
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[1, 2].map((t) => {
                    const active = term === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => onSelectTerm(t)}
                        className={`min-h-[48px] px-4 py-2.5 rounded-xl font-semibold text-sm border transition-all cursor-pointer ${
                          active
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        Term {t === 1 ? 'I' : 'II'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs sm:text-sm text-slate-600">
                <span>Selected Term: <strong className="text-slate-900">Level {level}, Term {term === 1 ? 'I' : 'II'}</strong></span>
                <span className="font-mono font-semibold text-blue-600">
                  {courses.length} courses · {totalCredits} cr
                </span>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                Here are the official BUET IPE courses for <strong>Level {level}, Term {term === 1 ? 'I' : 'II'}</strong> ({totalCredits} total credits). You can switch terms anytime from the top bar.
              </p>

              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-60 overflow-y-auto bg-slate-50/50">
                {courses.map((c) => (
                  <div key={c.code} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{c.code}</span>
                        <span className="text-xs text-slate-500">
                          · {c.type === 'T' ? 'Theory' : 'Sessional'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 truncate">{c.name}</p>
                    </div>
                    <span className="font-mono text-xs font-semibold text-slate-700 shrink-0">
                      {c.credits} cr
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                How to get the most out of your planner in three simple steps:
              </p>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">1. Check Off Syllabus Topics</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Track what you have studied for each course and watch your term progress bar grow.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <Layers className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">2. Log CTs &amp; Attendance</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      We automatically pick your best N CTs and show the exact marks needed in the Term Final for A+, A, or A-.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">3. Auto-Saved Locally</h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      No login needed. Your progress is saved automatically in your browser, and you can export a backup file anytime in Settings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3)}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => (prev + 1) as 1 | 2 | 3)}
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onComplete}
              className="inline-flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Tracking</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
