import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, BookOpen, Copy, Edit3, FileText, Pin, Plus, Search, Trash2, X } from 'lucide-react';
import { motion } from 'motion/react';
import { ResourceItem, ResourceTopic, StudyNote } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { EmptyState } from './EmptyState';

interface ResourcesSectionProps {
  notes: StudyNote[];
  resources: ResourceItem[];
  onAddNote: (note: Omit<StudyNote, 'id' | 'updatedAt' | 'pinned'>) => void;
  onUpdateNote: (id: number, updated: Partial<StudyNote>) => void;
  onDeleteNote: (id: number) => void;
  onAddResource: (resource: Omit<ResourceItem, 'id'>) => void;
  onNotify: (msg: string) => void;
  requestedTab?: 'notes' | 'library' | null;
  highlightedId?: number | null;
}

const TOPICS: ('All' | ResourceTopic)[] = ['All', 'Development', 'AI & Data', 'Design', 'Career'];

export const ResourcesSection: React.FC<ResourcesSectionProps> = ({
  notes,
  resources,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  onAddResource,
  onNotify,
  requestedTab,
  highlightedId,
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'library'>('notes');
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState<'All' | ResourceTopic>('All');

  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteSubject, setNoteSubject] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const [addResOpen, setAddResOpen] = useState(false);
  const [resTitle, setResTitle] = useState('');
  const [resTopic, setResTopic] = useState<ResourceTopic>('Development');
  const [resFormat, setResFormat] = useState('Guide');
  const [resUrl, setResUrl] = useState('');
  const [resDesc, setResDesc] = useState('');

  const noteTitleInputRef = useRef<HTMLInputElement>(null);
  const addResModalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(addResOpen, () => setAddResOpen(false), addResModalRef);

  useEffect(() => {
    if (requestedTab) {
      setActiveTab(requestedTab);
    }
  }, [requestedTab]);

  useEffect(() => {
    if (!highlightedId) return;
    setSearch('');
    setTopicFilter('All');
    const el =
      document.getElementById(`note-card-${highlightedId}`) ||
      document.getElementById(`resource-card-${highlightedId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedId, activeTab]);

  const sortedNotes = [...notes]
    .sort((a, b) => Number(b.pinned) - Number(a.pinned))
    .filter((n) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return `${n.title} ${n.subject} ${n.content}`.toLowerCase().includes(q);
    });

  const filteredResources = resources.filter((r) => {
    if (topicFilter !== 'All' && r.topic !== topicFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${r.title} ${r.topic} ${r.description} ${r.format}`.toLowerCase().includes(q);
  });

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    if (editingNoteId !== null) {
      onUpdateNote(editingNoteId, {
        title: noteTitle.trim(),
        subject: noteSubject.trim() || 'General Notes',
        content: noteContent.trim(),
        updatedAt: 'Updated just now',
      });
      setEditingNoteId(null);
      onNotify('Study note updated.');
    } else {
      onAddNote({
        title: noteTitle.trim(),
        subject: noteSubject.trim() || 'General Notes',
        content: noteContent.trim(),
      });
      onNotify('Study note saved to your notebook.');
    }

    setNoteTitle('');
    setNoteSubject('');
    setNoteContent('');
  };

  const startEditingNote = (note: StudyNote) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteSubject(note.subject);
    setNoteContent(note.content);
    noteTitleInputRef.current?.focus();
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setNoteTitle('');
    setNoteSubject('');
    setNoteContent('');
  };

  const handleCopyNote = async (note: StudyNote) => {
    try {
      await navigator.clipboard.writeText(`${note.title}\n(${note.subject})\n\n${note.content}`);
      onNotify('Note copied to clipboard.');
    } catch {
      onNotify('Clipboard unavailable in this browser.');
    }
  };

  const handleAddResourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim() || !resUrl.trim()) return;
    onAddResource({
      title: resTitle.trim(),
      topic: resTopic,
      format: resFormat.trim() || 'Reference',
      url: resUrl.startsWith('http') ? resUrl.trim() : `https://${resUrl.trim()}`,
      description: resDesc.trim() || 'Student-curated learning resource.',
    });
    setResTitle('');
    setResUrl('');
    setResDesc('');
    setAddResOpen(false);
    onNotify('Resource added to library.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-indigo-600 dark:text-[#9c88ff]">
            Notes &amp; Resource Hub
          </p>
          <h1 className="mt-1.5 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 text-balance">
            Notes &amp; study resources.
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
            Capture lecture takeaways alongside curated engineering, AI, and design guides.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#0E1526] border border-slate-200/90 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                activeTab === 'notes'
                  ? 'bg-white dark:bg-[#1a223f] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Study Notes ({notes.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('library')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                activeTab === 'library'
                  ? 'bg-white dark:bg-[#1a223f] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Resource Library ({resources.length})
            </button>
          </div>
        </div>
      </div>

      {/* Search & Topic Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === 'notes'
                ? 'Search study notes by course or keyword...'
                : 'Search documentation, courses, or tools...'
            }
            aria-label="Search notes and resources"
            className="w-full rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1526] pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
          />
        </div>

        {activeTab === 'library' && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#0E1526] border border-slate-200/90 dark:border-slate-800">
              {TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setTopicFilter(topic)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    topicFilter === topic
                      ? 'bg-white dark:bg-[#1a223f] text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setAddResOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] dark:bg-[#6D5DF6] dark:hover:bg-[#7d6ef8] px-3.5 py-2 text-xs font-semibold text-white transition-all whitespace-nowrap shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add link</span>
            </button>
          </div>
        )}
      </div>

      {activeTab === 'notes' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Note Editor Panel */}
          <section className="lg:col-span-4 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0E1526] p-6 shadow-2xs">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
                {editingNoteId !== null ? 'Edit study note' : 'New study note'}
              </h2>
              {editingNoteId !== null && (
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Cancel
                </button>
              )}
            </div>

            <form onSubmit={handleNoteSubmit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="note-title" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Note title
                </label>
                <input
                  ref={noteTitleInputRef}
                  id="note-title"
                  type="text"
                  required
                  maxLength={80}
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Dynamic Programming Patterns"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="note-subject" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Subject / Course
                </label>
                <input
                  id="note-subject"
                  type="text"
                  maxLength={45}
                  value={noteSubject}
                  onChange={(e) => setNoteSubject(e.target.value)}
                  placeholder="e.g. CS204 · Algorithms"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="note-content" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Key takeaways
                </label>
                <textarea
                  id="note-content"
                  rows={5}
                  required
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Write concise formulas, lecture summaries, or revision points..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 leading-relaxed focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] dark:bg-[#6D5DF6] dark:hover:bg-[#7d6ef8] px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <Plus className="w-4 h-4" />
                <span>{editingNoteId !== null ? 'Update note' : 'Save note'}</span>
              </button>
            </form>
          </section>

          {/* Notes List */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedNotes.length > 0 ? (
              sortedNotes.map((note) => {
                const isHighlighted = highlightedId === note.id;
                return (
                  <article
                    id={`note-card-${note.id}`}
                    key={note.id}
                    className={`flex flex-col justify-between rounded-2xl border bg-white dark:bg-[#0E1526] p-5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 ${
                      isHighlighted
                        ? 'border-cyan-500 ring-2 ring-cyan-500/30 dark:border-[#22D3EE]'
                        : 'border-slate-200/90 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-500/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-medium text-indigo-600 dark:text-[#a894ff] truncate">
                          {note.subject}
                        </span>
                        <span className="font-mono-tabular shrink-0">{note.updatedAt}</span>
                      </div>

                      <h3 className="mt-2 font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                        {note.title}
                      </h3>

                      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
                        {note.content}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onUpdateNote(note.id, { pinned: !note.pinned })}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded ${
                          note.pinned
                            ? 'text-indigo-700 dark:text-[#b1a2ff]'
                            : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                        }`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                        <span>{note.pinned ? 'Pinned' : 'Pin'}</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleCopyNote(note)}
                          aria-label={`Copy note "${note.title}"`}
                          className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => startEditingNote(note)}
                          aria-label={`Edit note "${note.title}"`}
                          className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteNote(note.id)}
                          aria-label={`Delete note "${note.title}"`}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="md:col-span-2">
                <EmptyState
                  icon={FileText}
                  headline={notes.length === 0 ? 'Your study notebook is empty' : 'No notes match your search'}
                  subline={
                    notes.length === 0
                      ? 'Save lecture formulas, algorithm patterns, or exam review sheets.'
                      : 'Try another keyword or clear your search filter.'
                  }
                  ctaLabel={notes.length === 0 ? 'Write your first note' : 'Clear search'}
                  onCtaClick={() => {
                    if (notes.length === 0) {
                      noteTitleInputRef.current?.focus();
                    } else {
                      setSearch('');
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredResources.map((res) => {
                const isHighlighted = highlightedId === res.id;
                return (
                  <article
                    id={`resource-card-${res.id}`}
                    key={res.id}
                    className={`flex flex-col justify-between rounded-2xl border bg-white dark:bg-[#0E1526] p-6 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 ${
                      isHighlighted
                        ? 'border-cyan-500 ring-2 ring-cyan-500/30 dark:border-[#22D3EE]'
                        : 'border-slate-200/90 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-500/40'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-medium text-cyan-700 dark:text-[#22D3EE]">
                        {res.topic} · {res.format}
                      </div>
                      <h3 className="mt-2 font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {res.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        {res.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-800 dark:text-[#b8a7ff] dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                      >
                        <span>Open resource</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              headline="No learning resources match"
              subline="Reset topic filters or contribute a helpful guide for your peers."
              ctaLabel="Add a resource link"
              onCtaClick={() => setAddResOpen(true)}
            />
          )}
        </div>
      )}

      {/* Add Custom Resource Modal */}
      {addResOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-res-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setAddResOpen(false);
          }}
        >
          <motion.div
            ref={addResModalRef}
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.16 }}
            className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1526] p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-xs font-medium text-indigo-600 dark:text-[#a894ff]">Library contribution</div>
                <h2 id="add-res-title" className="mt-1 font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Add learning resource
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setAddResOpen(false)}
                aria-label="Close modal"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddResourceSubmit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="res-title" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Resource title
                </label>
                <input
                  id="res-title"
                  type="text"
                  required
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  placeholder="e.g. TypeScript Handbook"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="res-topic" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Topic
                  </label>
                  <select
                    id="res-topic"
                    value={resTopic}
                    onChange={(e) => setResTopic(e.target.value as ResourceTopic)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                  >
                    <option value="Development">Development</option>
                    <option value="AI & Data">AI &amp; Data</option>
                    <option value="Design">Design</option>
                    <option value="Career">Career</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="res-format" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Format
                  </label>
                  <input
                    id="res-format"
                    type="text"
                    value={resFormat}
                    onChange={(e) => setResFormat(e.target.value)}
                    placeholder="Documentation"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="res-url" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  URL
                </label>
                <input
                  id="res-url"
                  type="text"
                  required
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                  placeholder="https://www.typescriptlang.org/docs/"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label htmlFor="res-desc" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Short summary
                </label>
                <textarea
                  id="res-desc"
                  rows={2}
                  value={resDesc}
                  onChange={(e) => setResDesc(e.target.value)}
                  placeholder="Why this resource helps students..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddResOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 dark:bg-[#6D5DF6] text-xs font-semibold text-white"
                >
                  Add resource
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
