import React from 'react';
import {
  CalendarDays,
  CheckSquare,
  Compass,
  FolderKanban,
  MessageSquare,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { CampusEvent, EventRegistration, SectionId, StudentProfile } from '../types';

interface SidebarProps {
  activeSection: SectionId;
  onNavigate: (section: SectionId) => void;
  eventsCount: number;
  openTasksCount: number;
  profile: StudentProfile;
  onOpenProfile: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  nextEvent?: CampusEvent;
  registrations: EventRegistration[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onNavigate,
  eventsCount,
  openTasksCount,
  profile,
  onOpenProfile,
  mobileOpen,
  onCloseMobile,
  nextEvent,
  registrations,
}) => {
  const navItems: { id: SectionId; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <Compass className="w-4 h-4 shrink-0" /> },
    {
      id: 'events',
      label: 'Events & Hackathons',
      icon: <CalendarDays className="w-4 h-4 shrink-0" />,
      count: eventsCount,
    },
    {
      id: 'tasks',
      label: 'Task Manager',
      icon: <CheckSquare className="w-4 h-4 shrink-0" />,
      count: openTasksCount,
    },
    { id: 'resources', label: 'Notes & Resources', icon: <FolderKanban className="w-4 h-4 shrink-0" /> },
    { id: 'community', label: 'Community', icon: <MessageSquare className="w-4 h-4 shrink-0" /> },
  ];

  const initials = (profile.name || 'S')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  const getCountdown = (dateStr?: string) => {
    if (!dateStr) return { days: '09', hours: '14', mins: '30' };
    const now = new Date('2026-11-12T10:00:00');
    const target = new Date(`${dateStr}T10:00:00`);
    const diffMs = Math.max(0, target.getTime() - now.getTime());
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diffMs / (1000 * 60)) % 60);
    return {
      days: String(days).padStart(2, '0'),
      hours: String(hours).padStart(2, '0'),
      mins: String(mins).padStart(2, '0'),
    };
  };

  const countdown = getCountdown(nextEvent?.date);
  const isRegisteredForNext = nextEvent
    ? registrations.some((r) => r.eventId === nextEvent.id)
    : false;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Workspace navigation"
        className={`fixed inset-y-0 left-0 z-40 w-[264px] flex flex-col border-r border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-[#090d1b]/95 backdrop-blur-xl px-4 py-6 transition-transform duration-200 ease-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-2 pb-7">
          <button
            type="button"
            onClick={() => {
              onNavigate('overview');
              onCloseMobile();
            }}
            className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg whitespace-nowrap shrink-0 min-h-[40px]"
          >
            <span className="grid grid-cols-2 gap-1 w-6 h-6 -rotate-6 shrink-0" aria-hidden="true">
              <span className="rounded-[4px] bg-indigo-600 dark:bg-[#8f7aff]" />
              <span className="rounded-[4px] bg-indigo-400/70 dark:bg-[#8f7aff]/50" />
              <span className="rounded-[4px] bg-cyan-500/75 dark:bg-[#38bdf8]/60" />
              <span className="rounded-[4px] bg-indigo-700 dark:bg-[#5c43da]" />
            </span>
            <span className="font-display text-[19px] font-bold tracking-tight text-slate-900 dark:text-slate-50">
              campus<span className="text-indigo-600 dark:text-[#9c88ff]">connect</span>
            </span>
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="p-2.5 min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 dark:text-slate-500">
          Workspace
        </div>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`w-full min-h-[42px] flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isActive
                    ? 'bg-indigo-600/10 text-indigo-700 dark:bg-[#6d5df6]/20 dark:text-[#d5cbff] font-semibold'
                    : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900 hover:translate-x-0.5 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </span>
                {typeof item.count === 'number' && (
                  <span className="font-mono-tabular text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {nextEvent && (
          <div className="mt-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-[#10162d] dark:to-[#131b37] p-4 shadow-2xs">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {isRegisteredForNext ? 'Registered countdown' : 'Next campus hackathon'}
            </div>
            <div className="mt-1 font-display text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
              {nextEvent.title}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-white/90 dark:bg-[#0b1022] border border-slate-200/80 dark:border-slate-800 py-1.5">
                <div className="font-mono-tabular text-sm font-semibold text-indigo-700 dark:text-[#b4a3ff]">
                  {countdown.days}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Days</div>
              </div>
              <div className="rounded-lg bg-white/90 dark:bg-[#0b1022] border border-slate-200/80 dark:border-slate-800 py-1.5">
                <div className="font-mono-tabular text-sm font-semibold text-indigo-700 dark:text-[#b4a3ff]">
                  {countdown.hours}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Hrs</div>
              </div>
              <div className="rounded-lg bg-white/90 dark:bg-[#0b1022] border border-slate-200/80 dark:border-slate-800 py-1.5">
                <div className="font-mono-tabular text-sm font-semibold text-indigo-700 dark:text-[#b4a3ff]">
                  {countdown.mins}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Min</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onNavigate('events');
                onCloseMobile();
              }}
              className="mt-3 w-full text-left text-xs font-semibold text-indigo-700 hover:text-indigo-800 dark:text-[#b4a3ff] dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
            >
              {isRegisteredForNext ? 'View pass & details' : 'Explore opportunities'} &rarr;
            </button>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-[#9b80ff] dark:to-[#4b38a8] text-white font-display text-xs font-bold grid place-items-center shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
              {profile.name || 'Student'}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {profile.course || 'Campus Explorer'}
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenProfile}
            aria-label="Edit student profile"
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
