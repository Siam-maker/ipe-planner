import React from 'react';
import { BookOpen, Award, CheckCircle, ShieldCheck } from 'lucide-react';
import { GRADES } from '../data/curriculum';
import { Footer } from './Footer';

export const AcademicResourcesView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2B2622] dark:text-[#EDE8E1] flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-[#C65D3B]" />
          <span>BUET Academic Regulations &amp; Policy</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#6E655F] dark:text-[#A8A199] mt-1">
          Department of Industrial &amp; Production Engineering · Academic Ordinance
        </p>
      </div>

      {/* BUET Grading System Table */}
      <div className="bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E8E2D9] dark:border-[#2E2924] rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#2B2622] dark:text-[#EDE8E1] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#C65D3B]" />
              BUET Letter Grading System
            </h3>
            <p className="text-xs text-[#6E655F] dark:text-[#A8A199] mt-0.5">
              Numerical mark cutoffs and corresponding Grade Points per credit.
            </p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#C65D3B]/10 dark:bg-[#C65D3B]/20 text-[#A64525] dark:text-[#E28364] border border-[#C65D3B]/20">
            Standard Scale
          </span>
        </div>

        <div className="overflow-x-auto -mx-5 sm:mx-0">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-[#E8E2D9] dark:border-[#2E2924] text-[#6E655F] dark:text-[#A8A199] text-xs uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-4">Marks Range</th>
                <th className="py-2.5 px-4">Letter Grade</th>
                <th className="py-2.5 px-4">Grade Point</th>
                <th className="py-2.5 px-4">Performance Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE9DF] dark:divide-[#2E2924] font-mono">
              {GRADES.map(([letter, point, minMark]) => {
                let remark = 'Outstanding';
                if (point >= 4.0) remark = 'Outstanding';
                else if (point >= 3.75) remark = 'Excellent';
                else if (point >= 3.5) remark = 'Very Good';
                else if (point >= 3.0) remark = 'Good';
                else if (point >= 2.5) remark = 'Satisfactory';
                else if (point >= 2.0) remark = 'Pass';
                else remark = 'Fail';

                return (
                  <tr key={letter} className="hover:bg-[#F2EEE6]/60 dark:hover:bg-[#282420]/60 transition-colors">
                    <td className="py-2.5 px-4 text-[#2B2622] dark:text-[#EDE8E1]">
                      {minMark}% and above {point === 4.0 ? '(80–100%)' : ''}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-[#2B2622] dark:text-[#EDE8E1]">
                      {letter}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-[#C65D3B] dark:text-[#E28364]">
                      {point.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 font-sans text-xs text-[#6E655F] dark:text-[#A8A199]">
                      {remark}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assessment Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Theory Course Assessment Formula */}
        <div className="bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E8E2D9] dark:border-[#2E2924] rounded-2xl p-5 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-[#2B2622] dark:text-[#EDE8E1] flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#5B6B4E]" />
            Theory Course Assessment (100 Marks/Credit)
          </h3>
          <p className="text-xs text-[#6E655F] dark:text-[#A8A199] leading-relaxed">
            Every 3-credit theory course has a total of 300 marks divided as follows:
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#F2EEE6] dark:bg-[#1C1A18] border border-[#E8E2D9] dark:border-[#2E2924] flex items-center justify-between">
              <span className="font-semibold text-[#2B2622] dark:text-[#EDE8E1]">Class Attendance (10%)</span>
              <span className="font-mono font-bold text-[#C65D3B] dark:text-[#E28364]">10 marks / credit</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F2EEE6] dark:bg-[#1C1A18] border border-[#E8E2D9] dark:border-[#2E2924] flex items-center justify-between">
              <span className="font-semibold text-[#2B2622] dark:text-[#EDE8E1]">Class Tests - CT (20%)</span>
              <span className="font-mono font-bold text-[#C65D3B] dark:text-[#E28364]">20 marks / credit (Best N)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#F2EEE6] dark:bg-[#1C1A18] border border-[#E8E2D9] dark:border-[#2E2924] flex items-center justify-between">
              <span className="font-semibold text-[#2B2622] dark:text-[#EDE8E1]">Term Final Written Exam (70%)</span>
              <span className="font-mono font-bold text-[#C65D3B] dark:text-[#E28364]">70 marks / credit (Sec A &amp; B)</span>
            </div>
          </div>
        </div>

        {/* Honors & Attendance Rules */}
        <div className="bg-[#FAF6F0] dark:bg-[#221F1C] border border-[#E8E2D9] dark:border-[#2E2924] rounded-2xl p-5 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-[#2B2622] dark:text-[#EDE8E1] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#5B6B4E]" />
            Degree Honors &amp; Attendance Standing
          </h3>

          <div className="space-y-2.5 text-xs text-[#6E655F] dark:text-[#A8A199]">
            <div className="p-3 rounded-xl bg-[#5B6B4E]/10 dark:bg-[#5B6B4E]/15 border border-[#5B6B4E]/25 text-[#2B2622] dark:text-[#EDE8E1]">
              <span className="font-bold text-[#5B6B4E] dark:text-[#8FA67C] block mb-0.5">
                First Class with Honors:
              </span>
              Achieving a CGPA of <strong>3.75 or above</strong> without any F grade across all academic terms.
            </div>

            <div className="p-3 rounded-xl bg-[#E8B04A]/15 dark:bg-[#E8B04A]/15 border border-[#E8B04A]/30 text-[#2B2622] dark:text-[#EDE8E1]">
              <span className="font-bold text-[#A67114] dark:text-[#E8B04A] block mb-0.5">
                Attendance Requirement:
              </span>
              Minimum <strong>60% attendance</strong> is mandatory to sit for final examinations. Attendance below 60% leads to Non-Collegiate status.
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};
