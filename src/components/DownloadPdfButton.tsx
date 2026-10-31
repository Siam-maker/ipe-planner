import React, { useState } from 'react';
import { FileDown, Loader2, Check } from 'lucide-react';

interface DownloadPdfButtonProps {
  onDownload: () => Promise<void>;
  label?: string;
  className?: string;
}

export const DownloadPdfButton: React.FC<DownloadPdfButtonProps> = ({
  onDownload,
  label = 'Download PDF Report',
  className = '',
}) => {
  const [status, setStatus] = useState<'idle' | 'generating' | 'success'>('idle');

  const handleClick = async () => {
    if (status === 'generating') return;
    setStatus('generating');
    try {
      await onDownload();
      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
      }, 2500);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      setStatus('idle');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === 'generating'}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs active:scale-95 no-print ${
        status === 'success'
          ? 'bg-[#5B6B4E] text-white'
          : status === 'generating'
          ? 'bg-[#EBE4D8] dark:bg-[#352F2B] text-[#8C827A] cursor-not-allowed'
          : 'bg-[#C65D3B] hover:bg-[#B34E2D] active:bg-[#9E4122] text-white shadow-[#C65D3B]/20'
      } ${className}`}
      title="Download full page report as an official PDF document"
    >
      {status === 'generating' ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Generating PDF...</span>
        </>
      ) : status === 'success' ? (
        <>
          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Downloaded!</span>
        </>
      ) : (
        <>
          <FileDown className="w-3.5 h-3.5" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};
