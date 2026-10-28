import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface InfoTooltipProps {
  title: string;
  children: React.ReactNode;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`More info about ${title}`}
        aria-expanded={open}
        className="inline-flex items-center gap-1 px-2 py-1 min-h-[32px] rounded-lg text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
      >
        <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span>What is this?</span>
      </button>

      {open && (
        <>
          {/* Mobile backdrop for bottom sheet feel on small screens */}
          <div
            className="fixed inset-0 bg-slate-900/30 z-40 sm:hidden"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-label={title}
            className="fixed bottom-0 left-0 right-0 z-50 sm:absolute sm:bottom-auto sm:top-full sm:left-0 sm:right-auto sm:mt-2 w-full sm:w-80 bg-white border border-slate-200 rounded-t-3xl sm:rounded-2xl p-5 sm:p-4 shadow-xl text-left"
          >
            <div className="w-10 h-1.5 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden" />
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="text-sm font-bold text-slate-900">{title}</h4>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close explanation"
                className="p-1.5 min-h-[32px] min-w-[32px] inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-1.5 font-sans">
              {children}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
