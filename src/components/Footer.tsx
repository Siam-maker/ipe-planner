import React from 'react';
import { Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-8 pt-6 pb-20 md:pb-8 border-t border-slate-200/80 text-center">
      <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
        <span>Created by</span>
        <span className="font-semibold text-slate-800 tracking-tight">Samiun Atif Siam</span>
        <Sparkles className="w-3 h-3 text-indigo-500 ml-0.5" />
      </div>
      <p className="text-[11px] text-slate-400 mt-1">
        Department of Industrial &amp; Production Engineering · BUET
      </p>
    </footer>
  );
};
