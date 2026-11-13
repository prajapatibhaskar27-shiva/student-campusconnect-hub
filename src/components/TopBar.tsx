import React, { useState, useRef, useEffect } from 'react';
import { Bell, Menu, Moon, Search, Sun, CalendarCheck, CheckCircle2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { CampusEvent, EventRegistration, SectionId, StudentProfile, TaskItem } from '../types';

interface TopBarProps {
  activeSection: SectionId;
  onOpenMobileMenu: () => void;
  onOpenCommandPalette: () => void;
  profile: StudentProfile;
  onOpenProfile: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  tasks: TaskItem[];
  registrations: EventRegistration[];
  events: CampusEvent[];
  onNavigate: (section: SectionId) => void;
}

const SECTION_LABELS: Record<SectionId, string> = {
  overview: 'Overview',
  events: 'Events & Hackathons',
  tasks: 'Task Manager',
  resources: 'Notes & Resources',
  community: 'Community',
};

export const TopBar: React.FC<TopBarProps> = ({
  activeSection,
  onOpenMobileMenu,
  onOpenCommandPalette,
  profile,
  onOpenProfile,
  theme,
  onToggleTheme,
  tasks,
  registrations,
  events,
  onNavigate,
}) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const initials = (profile.name || 'S')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  const openHighTasks = tasks.filter((t) => !t.done && t.priority === 'High');
  const registeredEvents = events.filter((ev) => registrations.some((r) => r.eventId === ev.id));
  const alertCount = openHighTasks.length + registeredEvents.length;

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-slate-200/80 dark:border-slate-800/80 bg-[#F7F8FC]/90 dark:bg-[#070B14]/90 backdrop-blur-lg px-4 sm:px-8 flex items-center justify-between gap-4 transition-colors duration-200">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="p-2.5 -ml-1 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
          <span>Workspace</span>
          <span aria-hidden="true">/</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {SECTION_LABELS[activeSection]}
          </span>
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          aria-label="Open global search (Cmd+K or Ctrl+K)"
          className="flex items-center gap-2 px-3 py-2 min-h-[38px] rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1526] text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-2xs"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">Search</span>
          <kbd className="hidden sm:inline-block font-mono-tabular text-[10px] text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 leading-none">
            ⌘K
          </kbd>
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          className="flex items-center gap-2 px-3 py-2 min-h-[38px] rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1526] text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-2xs"
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        <div className="relative" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((prev) => !prev)}
            aria-label="View upcoming reminders"
            aria-expanded={notifOpen}
            className="relative p-2.5 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1526] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shadow-2xs"
          >
            <Bell className="w-4 h-4" />
            {alertCount > 0 && (
              <span className="sr-only">{alertCount} active reminders</span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1526] shadow-xl p-4 z-50"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Upcoming Reminders
                  </h3>
                  <span className="font-mono-tabular text-xs text-slate-500 dark:text-slate-400">
                    {alertCount} active
                  </span>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-slate-800/80 max-h-72 overflow-y-auto">
                  {registeredEvents.map((ev) => (
                    <button
                      key={`ev-${ev.id}`}
                      type="button"
                      onClick={() => {
                        onNavigate('events');
                        setNotifOpen(false);
                      }}
                      className="w-full py-3 flex items-start gap-2.5 text-left hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
                    >
                      <CalendarCheck className="w-4 h-4 text-indigo-600 dark:text-[#9c88ff] shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          Registered: {ev.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {ev.date} · {ev.time} · {ev.place}
                        </div>
                      </div>
                    </button>
                  ))}

                  {openHighTasks.map((task) => (
                    <button
                      key={`task-${task.id}`}
                      type="button"
                      onClick={() => {
                        onNavigate('tasks');
                        setNotifOpen(false);
                      }}
                      className="w-full py-3 flex items-start gap-2.5 text-left hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
                    >
                      <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          High priority: {task.text}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {task.course} {task.due ? `· Due ${task.due}` : ''}
                        </div>
                      </div>
                    </button>
                  ))}

                  {alertCount === 0 && (
                    <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                      All caught up. No urgent tasks or upcoming passes.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={onOpenProfile}
          aria-label="Open profile settings"
          className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-600 to-violet-700 dark:from-[#9b80ff] dark:to-[#4b38a8] text-white font-display text-xs font-bold grid place-items-center hover:brightness-110 active:scale-95 transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {initials}
        </button>
      </div>
    </header>
  );
};
