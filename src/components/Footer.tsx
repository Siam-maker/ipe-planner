import React from 'react';
import { Mail, GraduationCap, IdCard } from 'lucide-react';
import ipeLogo from '../assets/ipe-logo.png';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 pt-8 pb-32 md:pb-36 border-t border-[#E2DACF] dark:border-[#3E3732] text-center">
      {/* Centered at bottom middle */}
      <div className="max-w-md mx-auto px-4">
        {/* Creator Section Headline */}
        <div className="text-[11px] font-bold uppercase tracking-widest text-[#8C827A] dark:text-[#A8A098] font-mono mb-2.5 text-center">
          CREATED BY
        </div>

        {/* Creator Info Card */}
        <div className="bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E2DACF] dark:border-[#38312B] rounded-2xl p-4 sm:p-5 shadow-2xs text-left transition-all hover:border-[#C65D3B]/40">
          <div className="flex items-start gap-3.5">
            {/* Logo / Badge */}
            <div className="w-11 h-11 rounded-xl bg-[#EBE4D8] dark:bg-[#2C2723] p-1.5 flex items-center justify-center shrink-0 border border-[#DCD3C5] dark:border-[#423A33] shadow-2xs">
              <img
                src={ipeLogo}
                alt="BUET IPE Logo"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>

            {/* Core Details */}
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h4 className="font-bold text-sm sm:text-base text-[#2B2622] dark:text-[#EDE8E1] tracking-tight">
                  Samiun Atif Siam
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#5B6B4E]/15 text-[#44513A] dark:text-[#A7BF95] border border-[#5B6B4E]/30 font-mono">
                  IPE &apos;25
                </span>
              </div>

              <p className="text-xs text-[#6E655F] dark:text-[#A8A199] flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#C65D3B] shrink-0" />
                <span>Department of IPE, BUET</span>
              </p>

              {/* ID & Email Metadata Grid */}
              <div className="pt-2 border-t border-[#EFE9DF] dark:border-[#2E2824] space-y-1 text-xs">
                <div className="flex items-center gap-2 text-[#6E655F] dark:text-[#A8A199]">
                  <IdCard className="w-3.5 h-3.5 text-[#8C827A] shrink-0" />
                  <span className="font-medium">Student ID:</span>
                  <span className="font-mono font-bold text-[#2B2622] dark:text-[#EDE8E1]">
                    2508019 (IPE &apos;25)
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[#6E655F] dark:text-[#A8A199]">
                  <Mail className="w-3.5 h-3.5 text-[#C65D3B] shrink-0" />
                  <span className="font-medium">Email:</span>
                  <a
                    href="mailto:atifsamiun534@gmail.com"
                    className="font-mono font-semibold text-[#C65D3B] dark:text-[#E28364] hover:underline truncate"
                  >
                    atifsamiun534@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
