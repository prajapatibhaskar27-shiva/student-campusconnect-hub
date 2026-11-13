import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  headline: string;
  subline: string;
  ctaLabel?: string;
  onCtaClick?: () => void;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  headline,
  subline,
  ctaLabel,
  onCtaClick,
  compact = false,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0b1020]/60 ${
        compact ? 'px-4 py-7' : 'px-6 py-12'
      }`}
    >
      <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-[#171f3b] border border-indigo-200/70 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-[#a894ff]">
        <Icon className="w-5 h-5" />
      </div>
      <h4 className="mt-3 font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
        {headline}
      </h4>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
        {subline}
      </p>
      {ctaLabel && onCtaClick && (
        <button
          type="button"
          onClick={onCtaClick}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] dark:bg-[#6d5df6] dark:hover:bg-[#7d6ef8] px-4 py-2 text-xs font-semibold text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 whitespace-nowrap"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
};
