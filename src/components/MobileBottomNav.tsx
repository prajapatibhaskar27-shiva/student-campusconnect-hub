import React from 'react';
import {
  CalendarDays,
  CheckSquare,
  Compass,
  FolderKanban,
  MessageSquare,
} from 'lucide-react';
import { SectionId } from '../types';

interface MobileBottomNavProps {
  activeSection: SectionId;
  onNavigate: (section: SectionId) => void;
}

const ITEMS: { id: SectionId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'overview', label: 'Overview', icon: Compass },
  { id: 'events', label: 'Events', icon: CalendarDays },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'resources', label: 'Notes', icon: FolderKanban },
  { id: 'community', label: 'Community', icon: MessageSquare },
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeSection, onNavigate }) => {
  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="fixed bottom-0 inset-x-0 z-30 lg:hidden border-t border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-[#070B14]/95 backdrop-blur-lg px-1 py-1"
    >
      <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                active
                  ? 'text-indigo-700 bg-indigo-600/10 dark:text-[#b8a7ff] dark:bg-[#6D5DF6]/20 font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate max-w-full">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
