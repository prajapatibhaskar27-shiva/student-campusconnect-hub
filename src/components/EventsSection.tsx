import React, { useEffect, useRef, useState } from 'react';
import {
  Calendar,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  MapPin,
  Plus,
  Search,
  Ticket,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { CampusEvent, EventCategory, EventRegistration, StudentProfile } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { downloadEventIcs } from '../utils/calendarExport';
import { QrCodeCanvas } from './QrCodeCanvas';
import { EmptyState } from './EmptyState';

interface EventsSectionProps {
  events: CampusEvent[];
  registrations: EventRegistration[];
  profile: StudentProfile;
  onRegisterEvent: (registration: EventRegistration) => void;
  onCancelRegistration: (eventId: number) => void;
  onAddEvent: (event: Omit<CampusEvent, 'id' | 'registeredCount'>) => void;
  selectedEventForModal: CampusEvent | null;
  onCloseRegistrationModal: () => void;
  onOpenRegistrationModal: (event: CampusEvent) => void;
  highlightedId?: number | null;
  onNotify: (msg: string) => void;
}

const CATEGORIES: ('All' | EventCategory | 'Registered')[] = [
  'All',
  'Hackathon',
  'Workshop',
  'Talk',
  'Community',
  'Registered',
];

export const EventsSection: React.FC<EventsSectionProps> = ({
  events,
  registrations,
  profile,
  onRegisterEvent,
  onCancelRegistration,
  onAddEvent,
  selectedEventForModal,
  onCloseRegistrationModal,
  onOpenRegistrationModal,
  highlightedId,
  onNotify,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | EventCategory | 'Registered'>('All');
  const [hostModalOpen, setHostModalOpen] = useState(false);

  const [regName, setRegName] = useState(profile.name);
  const [regEmail, setRegEmail] = useState(profile.email);
  const [regMode, setRegMode] = useState<'Solo' | 'Team'>('Solo');
  const [regTeam, setRegTeam] = useState('');
  const [regTrack, setRegTrack] = useState('General Participant');

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<EventCategory>('Workshop');
  const [newDate, setNewDate] = useState('2026-12-15');
  const [newTime, setNewTime] = useState('03:00 PM');
  const [newPlace, setNewPlace] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCapacity, setNewCapacity] = useState(60);

  const regModalRef = useRef<HTMLDivElement>(null);
  const hostModalRef = useRef<HTMLDivElement>(null);

  useFocusTrap(!!selectedEventForModal, onCloseRegistrationModal, regModalRef);
  useFocusTrap(hostModalOpen, () => setHostModalOpen(false), hostModalRef);

  useEffect(() => {
    if (!highlightedId) return;
    setFilter('All');
    setSearch('');
    const el = document.getElementById(`event-card-${highlightedId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedId]);

  const openModalWithDefaults = (ev: CampusEvent) => {
    const existing = registrations.find((r) => r.eventId === ev.id);
    if (existing) {
      setRegName(existing.attendeeName);
      setRegEmail(existing.email);
      setRegMode(existing.mode);
      setRegTeam(existing.teamName);
      setRegTrack(existing.track);
    } else {
      setRegName(profile.name || '');
      setRegEmail(profile.email || '');
      setRegMode(ev.category === 'Hackathon' ? 'Team' : 'Solo');
      setRegTeam('');
      setRegTrack(ev.prizeOrTrack ? ev.prizeOrTrack.split('·')[0].trim() : 'General Participant');
    }
    onOpenRegistrationModal(ev);
  };

  const filteredEvents = events.filter((ev) => {
    const isReg = registrations.some((r) => r.eventId === ev.id);
    if (filter === 'Registered' && !isReg) return false;
    if (filter !== 'All' && filter !== 'Registered' && ev.category !== filter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${ev.title} ${ev.category} ${ev.place} ${ev.description}`.toLowerCase().includes(q);
  });

  const handleRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventForModal) return;
    const code = `CC-26-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    onRegisterEvent({
      eventId: selectedEventForModal.id,
      attendeeName: regName.trim() || profile.name,
      email: regEmail.trim() || profile.email,
      mode: regMode,
      teamName: regMode === 'Team' ? regTeam.trim() || 'Campus Builders' : '',
      track: regTrack.trim() || 'General',
      registeredAt: new Date().toISOString().slice(0, 10),
      ticketCode: code,
    });
    onCloseRegistrationModal();
  };

  const handleHostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPlace.trim() || !newDesc.trim()) return;
    onAddEvent({
      title: newTitle.trim(),
      category: newCategory,
      date: newDate,
      time: newTime.trim() || '04:00 PM',
      place: newPlace.trim(),
      description: newDesc.trim(),
      spotsLabel: `${newCapacity} seats open`,
      capacity: Number(newCapacity) || 50,
      prizeOrTrack: 'Student Organized',
    });
    setNewTitle('');
    setNewPlace('');
    setNewDesc('');
    setHostModalOpen(false);
  };

  const handleCalendarDownload = (ev: CampusEvent) => {
    downloadEventIcs(ev);
    onNotify(`Downloaded calendar invite for ${ev.title}.`);
  };

  const formatDateLabel = (dateStr: string) =>
    new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const existingModalReg = selectedEventForModal
    ? registrations.find((r) => r.eventId === selectedEventForModal.id)
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-indigo-600 dark:text-[#9c88ff]">
            Events &amp; Hackathon Directory
          </p>
          <h1 className="mt-1.5 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 text-balance">
            Discover campus events.
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
            Register for upcoming hackathons, workshops, and peer talks or publish your club event.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setHostModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] dark:bg-[#6D5DF6] dark:hover:bg-[#7d6ef8] px-4 py-2.5 text-xs font-semibold text-white transition-all self-start sm:self-auto whitespace-nowrap shrink-0 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <Plus className="w-4 h-4" />
          <span>Host event</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hackathons, venues, or topics..."
            aria-label="Search campus events"
            className="w-full rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1526] pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#0E1526] border border-slate-200/90 dark:border-slate-800">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                filter === cat
                  ? 'bg-white dark:bg-[#1a223f] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat === 'Registered' ? `My Passes (${registrations.length})` : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Event Cards Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredEvents.map((ev) => {
            const registration = registrations.find((r) => r.eventId === ev.id);
            const countDisplay = Math.min(ev.capacity, ev.registeredCount + (registration ? 1 : 0));
            const seatPct = Math.round((countDisplay / Math.max(ev.capacity, 1)) * 100);
            const isHighlighted = highlightedId === ev.id;
            return (
              <article
                id={`event-card-${ev.id}`}
                key={ev.id}
                className={`flex flex-col justify-between rounded-2xl border bg-white dark:bg-[#0E1526] p-6 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 ${
                  isHighlighted
                    ? 'border-cyan-500 ring-2 ring-cyan-500/30 dark:border-[#22D3EE]'
                    : 'border-slate-200/90 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-500/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-xs font-medium text-indigo-600 dark:text-[#a894ff]">
                      {ev.category} · {ev.spotsLabel}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCalendarDownload(ev)}
                      aria-label={`Add ${ev.title} to calendar`}
                      title="Add to calendar (.ics)"
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-[#b1a2ff] dark:hover:bg-slate-800/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 whitespace-nowrap"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      <span>.ics</span>
                    </button>
                  </div>

                  <h2 className="mt-2 font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {ev.title}
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {ev.description}
                  </p>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono-tabular">
                        {formatDateLabel(ev.date)} · {ev.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{ev.place}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono-tabular">
                      <span>{countDisplay}/{ev.capacity} joined</span>
                      <span>{seatPct}% filled</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 dark:bg-[#171f3b] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-600/80 dark:bg-[#6D5DF6]"
                        style={{ width: `${seatPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {ev.prizeOrTrack || 'Open track'}
                    </span>

                    {registration ? (
                      <button
                        type="button"
                        onClick={() => openModalWithDefaults(ev)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:hover:bg-emerald-500/25 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>View pass</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openModalWithDefaults(ev)}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.98] dark:bg-[#6D5DF6] dark:hover:bg-[#7d6ef8] text-xs font-semibold text-white transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        Register
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={CalendarDays}
          headline={
            filter === 'Registered' ? 'No registered passes yet' : 'No matching campus events'
          }
          subline={
            filter === 'Registered'
              ? 'Register for a hackathon or workshop to unlock your QR pass.'
              : 'Clear your filters or publish a new campus event.'
          }
          ctaLabel={filter === 'Registered' ? 'Browse all events' : 'Reset filters'}
          onCtaClick={() => {
            setSearch('');
            setFilter('All');
          }}
        />
      )}

      {/* Event Registration / Pass Modal */}
      {selectedEventForModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reg-modal-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onCloseRegistrationModal();
          }}
        >
          <motion.div
            ref={regModalRef}
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.16 }}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1526] p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-xs font-medium text-indigo-600 dark:text-[#a894ff]">
                  {selectedEventForModal.category} · {formatDateLabel(selectedEventForModal.date)}
                </div>
                <h2
                  id="reg-modal-title"
                  className="mt-1 font-display text-xl font-semibold text-slate-900 dark:text-slate-100"
                >
                  {selectedEventForModal.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onCloseRegistrationModal}
                aria-label="Close registration dialog"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {existingModalReg ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-500/10 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Registration Confirmed</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCalendarDownload(selectedEventForModal)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/70 dark:border-emerald-500/40 bg-white/80 dark:bg-[#070B14]/60 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-200 hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 whitespace-nowrap"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" />
                      <span>Add to calendar</span>
                    </button>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="grid grid-cols-2 gap-3 text-xs flex-1">
                      <div>
                        <div className="text-slate-500 dark:text-slate-400">Pass Code</div>
                        <div className="mt-0.5 font-mono-tabular font-semibold text-slate-900 dark:text-white">
                          {existingModalReg.ticketCode}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 dark:text-slate-400">Participation</div>
                        <div className="mt-0.5 font-semibold text-slate-900 dark:text-white">
                          {existingModalReg.mode}
                          {existingModalReg.teamName ? ` · ${existingModalReg.teamName}` : ''}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 dark:text-slate-400">Attendee</div>
                        <div className="mt-0.5 font-medium text-slate-900 dark:text-white">
                          {existingModalReg.attendeeName}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500 dark:text-slate-400">Track</div>
                        <div className="mt-0.5 font-medium text-slate-900 dark:text-white">
                          {existingModalReg.track}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center shrink-0">
                      <QrCodeCanvas
                        value={`${existingModalReg.ticketCode}|${selectedEventForModal.title}|${existingModalReg.attendeeName}`}
                        size={96}
                      />
                      <span className="mt-1 font-mono-tabular text-[10px] text-slate-600 dark:text-slate-300">
                        {existingModalReg.ticketCode}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onCancelRegistration(selectedEventForModal.id);
                      onCloseRegistrationModal();
                    }}
                    className="px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-500/30 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                  >
                    Cancel registration
                  </button>
                  <button
                    type="button"
                    onClick={onCloseRegistrationModal}
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-[#6D5DF6] text-xs font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegistrationSubmit} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="reg-name" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Student name
                    </label>
                    <input
                      id="reg-name"
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="reg-email" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Campus email
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Entry mode
                    </label>
                    <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#070B14] border border-slate-200 dark:border-slate-800">
                      {(['Solo', 'Team'] as const).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setRegMode(m)}
                          className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            regMode === m
                              ? 'bg-white dark:bg-[#1a223f] text-slate-900 dark:text-white shadow-2xs'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="reg-track" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Track / Interest
                    </label>
                    <input
                      id="reg-track"
                      type="text"
                      value={regTrack}
                      onChange={(e) => setRegTrack(e.target.value)}
                      placeholder="e.g. AI Tools"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                {regMode === 'Team' && (
                  <div>
                    <label htmlFor="reg-team" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Team name
                    </label>
                    <input
                      id="reg-team"
                      type="text"
                      required
                      value={regTeam}
                      onChange={(e) => setRegTeam(e.target.value)}
                      placeholder="e.g. Campus Builders"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={onCloseRegistrationModal}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-[#6D5DF6] dark:hover:bg-[#7d6ef8] text-xs font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    Confirm registration
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* Host New Event Modal */}
      {hostModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="host-modal-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setHostModalOpen(false);
          }}
        >
          <motion.div
            ref={hostModalRef}
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.16 }}
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1526] p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-xs font-medium text-indigo-600 dark:text-[#a894ff]">Publish listing</div>
                <h2
                  id="host-modal-title"
                  className="mt-1 font-display text-xl font-semibold text-slate-900 dark:text-slate-100"
                >
                  Add campus event
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setHostModalOpen(false)}
                aria-label="Close dialog"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleHostSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="host-title" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Event title
                </label>
                <input
                  id="host-title"
                  type="text"
                  required
                  maxLength={70}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Systems Programming Study Jam"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label htmlFor="host-cat" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    id="host-cat"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as EventCategory)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                  >
                    <option value="Hackathon">Hackathon</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Talk">Talk</option>
                    <option value="Community">Community</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="host-date" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Date
                  </label>
                  <input
                    id="host-date"
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label htmlFor="host-time" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Time
                  </label>
                  <input
                    id="host-time"
                    type="text"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="03:00 PM"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="host-place" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Venue
                  </label>
                  <input
                    id="host-place"
                    type="text"
                    required
                    value={newPlace}
                    onChange={(e) => setNewPlace(e.target.value)}
                    placeholder="e.g. Auditorium B"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label htmlFor="host-cap" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Seat capacity
                  </label>
                  <input
                    id="host-cap"
                    type="number"
                    min={5}
                    max={1000}
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="host-desc" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  id="host-desc"
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Share what students will learn or build..."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setHostModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-[#6D5DF6] text-xs font-semibold text-white"
                >
                  Publish event
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
