import { useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  SEED_EVENTS,
  SEED_NOTES,
  SEED_POSTS,
  SEED_PROFILE,
  SEED_REGISTRATIONS,
  SEED_RESOURCES,
  createStarterTasks,
} from './data/seedData';
import { useLocalStorage } from './hooks/useLocalStorage';
import {
  CampusEvent,
  CommunityPost,
  EventRegistration,
  ResourceItem,
  SectionId,
  StudentProfile,
  StudyNote,
  TaskItem,
} from './types';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { OverviewSection } from './components/OverviewSection';
import { EventsSection } from './components/EventsSection';
import { TasksSection } from './components/TasksSection';
import { ResourcesSection } from './components/ResourcesSection';
import { CommunitySection } from './components/CommunitySection';
import { ProfileModal } from './components/ProfileModal';
import { CommandItem, CommandPalette } from './components/CommandPalette';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ConfettiBurst } from './components/ConfettiBurst';

function ensureFirstRunSeed() {
  try {
    if (window.localStorage.getItem('cc_seeded_v1')) return;
    if (!window.localStorage.getItem('cc_tasks_v2')) {
      window.localStorage.setItem('cc_tasks_v2', JSON.stringify(createStarterTasks()));
    }
    if (!window.localStorage.getItem('cc_notes_v2')) {
      window.localStorage.setItem('cc_notes_v2', JSON.stringify(SEED_NOTES));
    }
    if (!window.localStorage.getItem('cc_resources_v2')) {
      window.localStorage.setItem('cc_resources_v2', JSON.stringify(SEED_RESOURCES));
    }
    if (!window.localStorage.getItem('cc_posts_v2')) {
      window.localStorage.setItem('cc_posts_v2', JSON.stringify(SEED_POSTS));
    }
    if (!window.localStorage.getItem('cc_events_v2')) {
      window.localStorage.setItem('cc_events_v2', JSON.stringify(SEED_EVENTS));
    }
    if (!window.localStorage.getItem('cc_registrations_v2')) {
      window.localStorage.setItem('cc_registrations_v2', JSON.stringify(SEED_REGISTRATIONS));
    }
    if (!window.localStorage.getItem('cc_profile_v2')) {
      window.localStorage.setItem('cc_profile_v2', JSON.stringify(SEED_PROFILE));
    }
    window.localStorage.setItem('cc_seeded_v1', 'true');
  } catch {
    // Ignore storage unavailable errors
  }
}

ensureFirstRunSeed();

const BACKUP_KEYS = [
  'cc_theme_v2',
  'cc_profile_v2',
  'cc_events_v2',
  'cc_registrations_v2',
  'cc_tasks_v2',
  'cc_notes_v2',
  'cc_resources_v2',
  'cc_posts_v2',
  'cc_likes_v2',
  'cc_seeded_v1',
] as const;

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [selectedEventForModal, setSelectedEventForModal] = useState<CampusEvent | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confettiKey, setConfettiKey] = useState(0);
  const [highlightedItem, setHighlightedItem] = useState<{ section: SectionId; id: number } | null>(
    null
  );
  const [requestedResourceTab, setRequestedResourceTab] = useState<'notes' | 'library' | null>(null);

  const [theme, setTheme] = useLocalStorage<'dark' | 'light'>('cc_theme_v2', 'dark');
  const [profile, setProfile] = useLocalStorage<StudentProfile>('cc_profile_v2', SEED_PROFILE);
  const [events, setEvents] = useLocalStorage<CampusEvent[]>('cc_events_v2', SEED_EVENTS);
  const [registrations, setRegistrations] = useLocalStorage<EventRegistration[]>(
    'cc_registrations_v2',
    SEED_REGISTRATIONS
  );
  const [tasks, setTasks] = useLocalStorage<TaskItem[]>('cc_tasks_v2', createStarterTasks());
  const [notes, setNotes] = useLocalStorage<StudyNote[]>('cc_notes_v2', SEED_NOTES);
  const [resources, setResources] = useLocalStorage<ResourceItem[]>('cc_resources_v2', SEED_RESOURCES);
  const [posts, setPosts] = useLocalStorage<CommunityPost[]>('cc_posts_v2', SEED_POSTS);
  const [likedPostIds, setLikedPostIds] = useLocalStorage<number[]>('cc_likes_v2', []);

  // Theme sync with 200ms cross-fade + data-theme + dynamic theme-color meta
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    const meta = document.getElementById('theme-color-meta');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#070B14' : '#F7F8FC');
    }
  }, [theme]);

  // Global Cmd/Ctrl + K command palette shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (!highlightedItem) return;
    const timer = window.setTimeout(() => setHighlightedItem(null), 2400);
    return () => window.clearTimeout(timer);
  }, [highlightedItem]);

  const notify = (msg: string) => {
    setToastMessage(msg);
  };

  const handleNavigate = (section: SectionId) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCommandSelect = (item: CommandItem) => {
    if (item.section === 'resources' && item.resourceTab) {
      setRequestedResourceTab(item.resourceTab);
    }
    setActiveSection(item.section);
    setHighlightedItem({ section: item.section, id: item.rawId });
  };

  const handleRegisterEvent = (reg: EventRegistration) => {
    setRegistrations((prev) => [...prev.filter((r) => r.eventId !== reg.eventId), reg]);
    setConfettiKey((k) => k + 1);
    notify(`Registered! Pass ${reg.ticketCode} is ready.`);
  };

  const handleCancelRegistration = (eventId: number) => {
    setRegistrations((prev) => prev.filter((r) => r.eventId !== eventId));
    notify('Event registration cancelled.');
  };

  const handleAddEvent = (newEvent: Omit<CampusEvent, 'id' | 'registeredCount'>) => {
    setEvents((prev) => [
      {
        ...newEvent,
        id: Date.now(),
        registeredCount: 1,
      },
      ...prev,
    ]);
    notify('New campus event published.');
  };

  const handleAddTask = (task: Omit<TaskItem, 'id' | 'done'>) => {
    setTasks((prev) => [{ ...task, id: Date.now(), done: false }, ...prev]);
    notify('Task added to your checklist.');
  };

  const handleToggleTask = (id: number) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === id);
      const markingComplete = target && !target.done;
      const otherOpenCount = prev.filter((t) => !t.done && t.id !== id).length;
      if (markingComplete && otherOpenCount === 0) {
        setConfettiKey((k) => k + 1);
        notify('All open tasks completed!');
      }
      return prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    });
  };

  const handleDeleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    notify('Task removed.');
  };

  const handleClearCompleted = () => {
    setTasks((prev) => prev.filter((t) => !t.done));
    notify('Cleared completed tasks.');
  };

  const handleAddNote = (note: Omit<StudyNote, 'id' | 'updatedAt' | 'pinned'>) => {
    setNotes((prev) => [
      {
        ...note,
        id: Date.now(),
        updatedAt: 'Just now',
        pinned: false,
      },
      ...prev,
    ]);
  };

  const handleUpdateNote = (id: number, updated: Partial<StudyNote>) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updated } : n)));
  };

  const handleDeleteNote = (id: number) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    notify('Study note deleted.');
  };

  const handleAddResource = (res: Omit<ResourceItem, 'id'>) => {
    setResources((prev) => [{ ...res, id: Date.now() }, ...prev]);
  };

  const handleAddPost = (text: string, topic: CommunityPost['topic']) => {
    setPosts((prev) => [
      {
        id: Date.now(),
        name: profile.name || 'Student',
        course: `${profile.course.split('·')[0].trim()} · ${profile.semester}`,
        topic,
        text,
        time: 'Just now',
        likes: 0,
        replies: [],
      },
      ...prev,
    ]);
    notify('Update published to campus board.');
  };

  const handleToggleLike = (postId: number) => {
    setLikedPostIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const handleAddReply = (postId: number, content: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              replies: [
                ...post.replies,
                {
                  id: Date.now(),
                  author: profile.name || 'Student',
                  content,
                  time: 'Just now',
                },
              ],
            }
          : post
      )
    );
    notify('Reply posted.');
  };

  const handleExportData = () => {
    try {
      const bundle: Record<string, unknown> = {
        exportedAt: new Date().toISOString(),
      };
      BACKUP_KEYS.forEach((key) => {
        const raw = window.localStorage.getItem(key);
        if (raw !== null) {
          try {
            bundle[key] = JSON.parse(raw);
          } catch {
            bundle[key] = raw;
          }
        }
      });

      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `campusconnect-backup-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      notify('Exported CampusConnect backup.');
    } catch {
      notify('Export failed in this browser.');
    }
  };

  const handleImportData = (payload: Record<string, unknown>) => {
    try {
      if (payload.cc_theme_v2 === 'dark' || payload.cc_theme_v2 === 'light') {
        setTheme(payload.cc_theme_v2);
      }
      if (payload.cc_profile_v2 && typeof payload.cc_profile_v2 === 'object') {
        setProfile(payload.cc_profile_v2 as StudentProfile);
      }
      if (Array.isArray(payload.cc_events_v2)) {
        setEvents(payload.cc_events_v2 as CampusEvent[]);
      }
      if (Array.isArray(payload.cc_registrations_v2)) {
        setRegistrations(payload.cc_registrations_v2 as EventRegistration[]);
      }
      if (Array.isArray(payload.cc_tasks_v2)) {
        setTasks(payload.cc_tasks_v2 as TaskItem[]);
      }
      if (Array.isArray(payload.cc_notes_v2)) {
        setNotes(payload.cc_notes_v2 as StudyNote[]);
      }
      if (Array.isArray(payload.cc_resources_v2)) {
        setResources(payload.cc_resources_v2 as ResourceItem[]);
      }
      if (Array.isArray(payload.cc_posts_v2)) {
        setPosts(payload.cc_posts_v2 as CommunityPost[]);
      }
      if (Array.isArray(payload.cc_likes_v2)) {
        setLikedPostIds(payload.cc_likes_v2 as number[]);
      }
      window.localStorage.setItem('cc_seeded_v1', 'true');
      notify('Workspace data imported successfully.');
    } catch {
      notify('Import failed: invalid data structure.');
    }
  };

  const openTasksCount = tasks.filter((t) => !t.done).length;
  const nextHackathon =
    events.find((ev) => registrations.some((r) => r.eventId === ev.id)) || events[0];

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-hidden bg-[#F7F8FC] text-slate-900 dark:bg-[#070B14] dark:text-slate-100 transition-colors duration-200 pb-20 lg:pb-0">
        <Sidebar
          activeSection={activeSection}
          onNavigate={handleNavigate}
          eventsCount={events.length}
          openTasksCount={openTasksCount}
          profile={profile}
          onOpenProfile={() => setProfileModalOpen(true)}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          nextEvent={nextHackathon}
          registrations={registrations}
        />

        <div className="lg:pl-[264px] flex flex-col min-h-screen min-w-0">
          <TopBar
            activeSection={activeSection}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            onOpenCommandPalette={() => setCommandOpen(true)}
            profile={profile}
            onOpenProfile={() => setProfileModalOpen(true)}
            theme={theme}
            onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            tasks={tasks}
            registrations={registrations}
            events={events}
            onNavigate={handleNavigate}
          />

          <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-8 py-8 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
              >
                {activeSection === 'overview' && (
                  <OverviewSection
                    profile={profile}
                    events={events}
                    registrations={registrations}
                    tasks={tasks}
                    notes={notes}
                    resources={resources}
                    posts={posts}
                    onNavigate={handleNavigate}
                    onToggleTask={handleToggleTask}
                    onOpenRegistration={(ev) => {
                      setSelectedEventForModal(ev);
                      setActiveSection('events');
                    }}
                  />
                )}

                {activeSection === 'events' && (
                  <EventsSection
                    events={events}
                    registrations={registrations}
                    profile={profile}
                    onRegisterEvent={handleRegisterEvent}
                    onCancelRegistration={handleCancelRegistration}
                    onAddEvent={handleAddEvent}
                    selectedEventForModal={selectedEventForModal}
                    onCloseRegistrationModal={() => setSelectedEventForModal(null)}
                    onOpenRegistrationModal={(ev) => setSelectedEventForModal(ev)}
                    highlightedId={highlightedItem?.section === 'events' ? highlightedItem.id : null}
                    onNotify={notify}
                  />
                )}

                {activeSection === 'tasks' && (
                  <TasksSection
                    tasks={tasks}
                    onAddTask={handleAddTask}
                    onToggleTask={handleToggleTask}
                    onDeleteTask={handleDeleteTask}
                    onClearCompleted={handleClearCompleted}
                    highlightedId={highlightedItem?.section === 'tasks' ? highlightedItem.id : null}
                  />
                )}

                {activeSection === 'resources' && (
                  <ResourcesSection
                    notes={notes}
                    resources={resources}
                    onAddNote={handleAddNote}
                    onUpdateNote={handleUpdateNote}
                    onDeleteNote={handleDeleteNote}
                    onAddResource={handleAddResource}
                    onNotify={notify}
                    requestedTab={requestedResourceTab}
                    highlightedId={highlightedItem?.section === 'resources' ? highlightedItem.id : null}
                  />
                )}

                {activeSection === 'community' && (
                  <CommunitySection
                    posts={posts}
                    likedPostIds={likedPostIds}
                    onAddPost={handleAddPost}
                    onToggleLike={handleToggleLike}
                    onAddReply={handleAddReply}
                    onNotify={notify}
                    highlightedId={highlightedItem?.section === 'community' ? highlightedItem.id : null}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          <footer className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 py-5 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-500">
            <span>&copy; 2026 CampusConnect</span>
            <span>Built for campus builders &amp; student teams</span>
          </footer>
        </div>

        <MobileBottomNav activeSection={activeSection} onNavigate={handleNavigate} />

        <CommandPalette
          open={commandOpen}
          onClose={() => setCommandOpen(false)}
          events={events}
          tasks={tasks}
          notes={notes}
          resources={resources}
          posts={posts}
          onSelectResult={handleCommandSelect}
        />

        <ProfileModal
          open={profileModalOpen}
          profile={profile}
          onClose={() => setProfileModalOpen(false)}
          onSave={(updated) => {
            setProfile(updated);
            notify('Profile updated.');
          }}
          onExportData={handleExportData}
          onImportData={handleImportData}
          onNotify={notify}
        />

        <ConfettiBurst burstKey={confettiKey} />

        <div aria-live="polite" aria-atomic="true">
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.16 }}
                role="status"
                className="fixed bottom-20 lg:bottom-5 right-5 z-50 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-900 dark:bg-[#161f3b] text-white px-4 py-3 text-xs font-medium shadow-xl"
              >
                {toastMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </MotionConfig>
  );
}
