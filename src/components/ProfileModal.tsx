import React, { useState, useEffect, useRef } from 'react';
import { Download, Smartphone, Upload, X } from 'lucide-react';
import { motion } from 'motion/react';
import { StudentProfile } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface ProfileModalProps {
  open: boolean;
  profile: StudentProfile;
  onClose: () => void;
  onSave: (updated: StudentProfile) => void;
  onExportData: () => void;
  onImportData: (payload: Record<string, unknown>) => void;
  onNotify: (msg: string) => void;
}

const EXPECTED_CC_KEYS = [
  'cc_profile_v2',
  'cc_events_v2',
  'cc_registrations_v2',
  'cc_tasks_v2',
  'cc_notes_v2',
  'cc_resources_v2',
  'cc_posts_v2',
  'cc_likes_v2',
  'cc_theme_v2',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  open,
  profile,
  onClose,
  onSave,
  onExportData,
  onImportData,
  onNotify,
}) => {
  const [name, setName] = useState(profile.name);
  const [course, setCourse] = useState(profile.course);
  const [semester, setSemester] = useState(profile.semester);
  const [email, setEmail] = useState(profile.email);
  const [pendingImport, setPendingImport] = useState<Record<string, unknown> | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useFocusTrap(open, onClose, modalRef);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(standalone);

    const handlePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setName(profile.name);
      setCourse(profile.course);
      setSemester(profile.semester);
      setEmail(profile.email);
      setPendingImport(null);
    }
  }, [open, profile]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim() || 'Student',
      course: course.trim() || 'Computer Science',
      semester: semester.trim() || 'Semester 1',
      email: email.trim() || 'student@campus.edu',
    });
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || ''));
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          onNotify('Import failed: invalid backup file format.');
          return;
        }
        const record = parsed as Record<string, unknown>;
        const hasKnownKey = EXPECTED_CC_KEYS.some((k) => k in record);
        if (!hasKnownKey) {
          onNotify('Import failed: no CampusConnect data found in file.');
          return;
        }
        setPendingImport(record);
      } catch {
        onNotify('Import failed: could not parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (!pendingImport) return;
    onImportData(pendingImport);
    setPendingImport(null);
    onClose();
  };

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.16 }}
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1526] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-xs font-medium text-indigo-600 dark:text-[#9c88ff]">Student profile</div>
            <h2
              id="profile-modal-title"
              className="mt-1 font-display text-xl font-semibold text-slate-900 dark:text-slate-100"
            >
              Personalize your hub
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="profile-name" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Display name
            </label>
            <input
              id="profile-name"
              type="text"
              maxLength={40}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label htmlFor="profile-email" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Campus email
            </label>
            <input
              id="profile-email"
              type="email"
              maxLength={60}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@campus.edu"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="profile-course" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Major / Track
              </label>
              <input
                id="profile-course"
                type="text"
                maxLength={45}
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. CSE · AI"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label htmlFor="profile-semester" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Current term
              </label>
              <input
                id="profile-semester"
                type="text"
                maxLength={24}
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="e.g. Semester 5"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-[#6D5DF6] dark:hover:bg-[#7d6ef8] text-xs font-semibold text-white transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Save profile
            </button>
          </div>
        </form>

        {/* Data Backup & PWA Install */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div>
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Data backup &amp; device sync
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              Export all events, passes, tasks, notes, and posts as a JSON backup.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Choose backup JSON file"
          />

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onExportData}
              className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-[#070B14] dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export data</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-[#070B14] dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 whitespace-nowrap"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import data</span>
            </button>
          </div>

          {pendingImport && (
            <div className="rounded-xl border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 p-3.5 text-xs">
              <div className="font-semibold text-amber-900 dark:text-amber-200">
                Overwrite current workspace data?
              </div>
              <p className="mt-1 text-[11px] text-amber-800 dark:text-amber-300/90">
                Importing this backup will replace your current tasks, notes, passes, and posts.
              </p>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPendingImport(null)}
                  className="px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-500/40 text-amber-900 dark:text-amber-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmImport}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                >
                  Confirm overwrite
                </button>
              </div>
            </div>
          )}

          {!isInstalled && deferredPrompt && (
            <button
              type="button"
              onClick={handleInstallApp}
              className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-xs font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Install CampusConnect app</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
