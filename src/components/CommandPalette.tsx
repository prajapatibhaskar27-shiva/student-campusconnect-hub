import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  BookOpen,
  CalendarDays,
  CheckSquare,
  CornerDownLeft,
  FileText,
  MessageSquare,
  Search,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CampusEvent,
  CommunityPost,
  ResourceItem,
  SectionId,
  StudyNote,
  TaskItem,
} from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';

export interface CommandItem {
  id: string;
  rawId: number;
  section: SectionId;
  category: 'Event' | 'Task' | 'Note' | 'Resource' | 'Community';
  title: string;
  subtitle: string;
  searchBlob: string;
  resourceTab?: 'notes' | 'library';
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  events: CampusEvent[];
  tasks: TaskItem[];
  notes: StudyNote[];
  resources: ResourceItem[];
  posts: CommunityPost[];
  onSelectResult: (item: CommandItem) => void;
}

function fuzzyScore(query: string, target: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 1;
  const t = target.toLowerCase();
  if (t.includes(q)) return 100 - t.indexOf(q) * 0.1;

  // Subsequence fuzzy match
  let qi = 0;
  let score = 0;
  let consecutive = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      qi++;
      consecutive++;
      score += 2 + consecutive;
    } else {
      consecutive = 0;
    }
  }
  return qi === q.length ? score : 0;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onClose,
  events,
  tasks,
  notes,
  resources,
  posts,
  onSelectResult,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useFocusTrap(open, onClose, dialogRef);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      window.requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [open]);

  const allItems = useMemo<CommandItem[]>(() => {
    const items: CommandItem[] = [];

    events.forEach((ev) => {
      items.push({
        id: `event-${ev.id}`,
        rawId: ev.id,
        section: 'events',
        category: 'Event',
        title: ev.title,
        subtitle: `${ev.category} · ${ev.date} · ${ev.place}`,
        searchBlob: `${ev.title} ${ev.category} ${ev.place} ${ev.description}`,
      });
    });

    tasks.forEach((t) => {
      items.push({
        id: `task-${t.id}`,
        rawId: t.id,
        section: 'tasks',
        category: 'Task',
        title: t.text,
        subtitle: `${t.course} · ${t.priority} priority${t.due ? ` · Due ${t.due}` : ''}`,
        searchBlob: `${t.text} ${t.course} ${t.priority}`,
      });
    });

    notes.forEach((n) => {
      items.push({
        id: `note-${n.id}`,
        rawId: n.id,
        section: 'resources',
        resourceTab: 'notes',
        category: 'Note',
        title: n.title,
        subtitle: `${n.subject} · ${n.updatedAt}`,
        searchBlob: `${n.title} ${n.subject} ${n.content}`,
      });
    });

    resources.forEach((r) => {
      items.push({
        id: `resource-${r.id}`,
        rawId: r.id,
        section: 'resources',
        resourceTab: 'library',
        category: 'Resource',
        title: r.title,
        subtitle: `${r.topic} · ${r.format}`,
        searchBlob: `${r.title} ${r.topic} ${r.format} ${r.description}`,
      });
    });

    posts.forEach((p) => {
      items.push({
        id: `post-${p.id}`,
        rawId: p.id,
        section: 'community',
        category: 'Community',
        title: `${p.name}: ${p.text.slice(0, 64)}${p.text.length > 64 ? '…' : ''}`,
        subtitle: `${p.topic} · ${p.time}`,
        searchBlob: `${p.name} ${p.topic} ${p.text}`,
      });
    });

    return items;
  }, [events, tasks, notes, resources, posts]);

  const results = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 10);
    return allItems
      .map((item) => ({ item, score: fuzzyScore(query, item.searchBlob) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((entry) => entry.item);
  }, [allItems, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        results.length > 0 ? (prev - 1 + results.length) % results.length : 0
      );
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      onSelectResult(results[selectedIndex]);
      onClose();
    }
  };

  const renderIcon = (category: CommandItem['category']) => {
    switch (category) {
      case 'Event':
        return <CalendarDays className="w-4 h-4 text-indigo-600 dark:text-[#9c88ff] shrink-0" />;
      case 'Task':
        return <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case 'Note':
        return <FileText className="w-4 h-4 text-amber-600 dark:text-amber-300 shrink-0" />;
      case 'Resource':
        return <BookOpen className="w-4 h-4 text-cyan-600 dark:text-[#22D3EE] shrink-0" />;
      case 'Community':
        return <MessageSquare className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] bg-slate-950/60 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Global workspace search"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            ref={dialogRef}
            onKeyDown={handleKeyDown}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-xl rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-white/95 dark:bg-[#0E1526]/95 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200/80 dark:border-slate-800">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search events, tasks, notes, resources, or community..."
                aria-label="Search across CampusConnect"
                className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close command palette"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2" role="listbox" aria-label="Search results">
              {results.length > 0 ? (
                results.map((item, idx) => {
                  const active = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={() => {
                        onSelectResult(item);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                        active
                          ? 'bg-indigo-600/10 text-slate-900 dark:bg-[#6D5DF6]/20 dark:text-white'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {renderIcon(item.category)}
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate">{item.title}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {item.category} · {item.subtitle}
                          </div>
                        </div>
                      </div>
                      {active && (
                        <CornerDownLeft className="w-3.5 h-3.5 text-indigo-600 dark:text-[#9c88ff] shrink-0" />
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400">
                  No matches found for &ldquo;{query}&rdquo;.
                </div>
              )}
            </div>

            <div className="px-4 py-2.5 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono-tabular">
              <span>↑↓ Navigate · ↵ Open</span>
              <span>Esc Close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
