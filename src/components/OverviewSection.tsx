import React, { useState } from 'react';
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckSquare,
  FileText,
  Ticket,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import {
  CampusEvent,
  CommunityPost,
  EventRegistration,
  ResourceItem,
  SectionId,
  StudentProfile,
  StudyNote,
  TaskItem,
} from '../types';
import { SEMESTER_ACTIVITY_DATA, WEEKLY_STUDY_DATA } from '../data/seedData';
import { getTaskUrgency, getTodayIso, sortTasksByUrgency } from '../utils/taskUrgency';
import { EmptyState } from './EmptyState';

interface OverviewSectionProps {
  profile: StudentProfile;
  events: CampusEvent[];
  registrations: EventRegistration[];
  tasks: TaskItem[];
  notes: StudyNote[];
  resources: ResourceItem[];
  posts: CommunityPost[];
  onNavigate: (section: SectionId) => void;
  onToggleTask: (id: number) => void;
  onOpenRegistration: (event: CampusEvent) => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  profile,
  events,
  registrations,
  tasks,
  notes,
  resources,
  posts,
  onNavigate,
  onToggleTask,
  onOpenRegistration,
}) => {
  const [chartMode, setChartMode] = useState<'weekly' | 'semester'>('weekly');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(3);
  const prefersReduced = useReducedMotion();

  const todayIso = getTodayIso();
  const firstName = (profile.name || 'Student').trim().split(/\s+/)[0];
  const completedTasks = tasks.filter((t) => t.done).length;
  const totalTasks = tasks.length;
  const completionPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const focusTasks = sortTasksByUrgency(
    tasks.filter((t) => !t.done),
    todayIso
  ).slice(0, 4);

  const pinnedNotes = notes.filter((n) => n.pinned).slice(0, 2);
  const featuredEvents = events.slice(0, 3);
  const latestPost = posts[0];
  const primaryPass = registrations[0];
  const primaryPassEvent = primaryPass ? events.find((e) => e.id === primaryPass.eventId) : undefined;

  const hasActivityData = tasks.length > 0;
  const chartData = chartMode === 'weekly' ? WEEKLY_STUDY_DATA : SEMESTER_ACTIVITY_DATA;
  const maxVal = Math.max(...chartData.map((d) => d.hours), 1);

  const chartWidth = 540;
  const chartHeight = 168;
  const padX = 24;
  const padY = 20;
  const usableW = chartWidth - padX * 2;
  const usableH = chartHeight - padY * 2;

  const points = chartData.map((d, idx) => {
    const x = padX + (idx / Math.max(chartData.length - 1, 1)) * usableW;
    const y = padY + usableH - (d.hours / maxVal) * usableH;
    return { x, y, ...d };
  });

  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const curr = pts[i];
      const next = pts[i + 1];
      const cx = (curr.x + next.x) / 2;
      d += ` C ${cx} ${curr.y}, ${cx} ${next.y}, ${next.x} ${next.y}`;
    }
    return d;
  };

  const linePath = buildSmoothPath(points);
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - padY} L ${points[0].x} ${chartHeight - padY} Z`
      : '';

  const activePoint =
    hoveredIdx !== null && points[hoveredIdx] ? points[hoveredIdx] : points[Math.min(3, points.length - 1)];

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formatShortDate = (dateStr: string) => {
    const d = new Date(`${dateStr}T12:00:00`);
    return {
      day: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
    };
  };

  return (
    <div className="space-y-8">
      {/* Welcome Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-indigo-600 dark:text-[#9c88ff]">
            Your campus, connected
          </p>
          <h1 className="mt-1.5 font-display text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-slate-900 dark:text-slate-50 text-balance leading-[1.12]">
            Welcome back, {firstName}.
          </h1>
          <p className="mt-2 text-sm sm:text-[15px] text-slate-600 dark:text-slate-400 max-w-2xl">
            Discover upcoming hackathons, keep coursework on schedule, and collaborate with peers across campus.
          </p>
        </div>

        <div className="font-mono-tabular text-xs text-slate-600 dark:text-slate-300 border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1526] rounded-xl px-4 py-2.5 self-start sm:self-auto whitespace-nowrap shadow-2xs">
          {todayFormatted}
        </div>
      </div>

      {/* Hero Banner */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl border border-indigo-200/40 dark:border-indigo-500/20 bg-gradient-to-br from-[#1b1848] via-[#22205e] to-[#0f2b42] dark:from-[#121633] dark:via-[#0e172f] dark:to-[#0c2434] p-7 sm:p-10 text-white shadow-lg"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '38px 38px',
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-24 -top-24 w-80 h-80 rounded-full bg-cyan-400/15 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="text-xs font-medium text-indigo-200 dark:text-[#b4a9ff]">
              Smart Student Hub · {profile.course} · {profile.semester}
            </div>
            <h2 className="mt-3 font-display text-3xl sm:text-[40px] font-bold tracking-tight leading-[1.12] text-balance">
              Big ideas start on campus.
            </h2>
            <p className="mt-3.5 text-sm sm:text-[15px] text-indigo-100/85 dark:text-slate-300 leading-relaxed max-w-lg">
              Reserve seats for upcoming buildathons, track semester deliverables, and organize lecture notes in one unified workspace.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('events')}
                className="inline-flex items-center gap-2 rounded-xl bg-white text-slate-900 hover:bg-indigo-50 active:scale-[0.99] dark:bg-[#6D5DF6] dark:text-white dark:hover:bg-[#7d6ef8] px-5 py-3 text-xs font-semibold transition-all whitespace-nowrap shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span>Explore events &amp; hackathons</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('tasks')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 hover:bg-white/15 active:scale-[0.99] px-5 py-3 text-xs font-semibold text-white transition-all whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span>Open task board</span>
              </button>
            </div>

            {primaryPass && primaryPassEvent && (
              <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 text-xs text-indigo-100/90">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-cyan-300 shrink-0" />
                  <span>
                    Active pass for <strong>{primaryPassEvent.title}</strong> ({primaryPass.ticketCode})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenRegistration(primaryPassEvent)}
                  className="font-semibold text-cyan-300 hover:text-cyan-200 underline-offset-4 hover:underline whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 rounded"
                >
                  View pass &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Vector Hub Diagram with subtle draw-on & gentle orbital motion */}
          <div className="hidden md:flex items-center justify-center shrink-0" aria-hidden="true">
            <svg width="248" height="190" viewBox="0 0 248 190" fill="none">
              <circle cx="124" cy="95" r="82" stroke="rgba(196, 181, 253, 0.14)" strokeDasharray="4 6" />
              <motion.ellipse
                cx="124"
                cy="95"
                rx="102"
                ry="40"
                transform="rotate(-18 124 95)"
                stroke="rgba(196, 181, 253, 0.4)"
                strokeWidth="1.25"
                initial={prefersReduced ? false : { pathLength: 0, opacity: 0.3 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              />
              <motion.ellipse
                cx="124"
                cy="95"
                rx="96"
                ry="38"
                transform="rotate(28 124 95)"
                stroke="rgba(34, 211, 238, 0.4)"
                strokeWidth="1.25"
                initial={prefersReduced ? false : { pathLength: 0, opacity: 0.3 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.05, delay: 0.1, ease: 'easeOut' }}
              />
              <circle
                cx="124"
                cy="95"
                r="46"
                fill="rgba(12, 18, 40, 0.68)"
                stroke="rgba(196, 181, 253, 0.55)"
                strokeWidth="1.5"
              />
              <text
                x="124"
                y="93"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="22"
                fontWeight="700"
                fontFamily="Bricolage Grotesque, sans-serif"
              >
                CC
              </text>
              <text
                x="124"
                y="110"
                textAnchor="middle"
                fill="#C4B5FD"
                fontSize="8.5"
                letterSpacing="2.2"
                fontFamily="JetBrains Mono, monospace"
              >
                2026
              </text>
              <motion.circle
                cx="208"
                cy="56"
                r="4.5"
                fill="#A78BFA"
                animate={prefersReduced ? undefined : { y: [-2, 3, -2] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.circle
                cx="42"
                cy="132"
                r="4.5"
                fill="#22D3EE"
                animate={prefersReduced ? undefined : { y: [2, -3, 2] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <circle cx="164" cy="158" r="3" fill="#FB7185" />
            </svg>
          </div>
        </div>
      </motion.section>

      {/* Asymmetric Bento Grid: 2-cell Study & Campus Activity Chart + 4 KPI Tiles */}
      <section
        aria-label="Campus activity and snapshot metrics"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch"
      >
        {/* 2-Cell Spanning Study & Campus Activity Chart */}
        <div className="sm:col-span-2 xl:col-span-2 xl:row-span-2 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0E1526] p-6 shadow-2xs flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
                Study &amp; Campus Activity
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Focus hours logged and completed deliverables
              </p>
            </div>

            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#070B14] border border-slate-200/80 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setChartMode('weekly');
                  setHoveredIdx(3);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  chartMode === 'weekly'
                    ? 'bg-white dark:bg-[#1a223f] text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => {
                  setChartMode('semester');
                  setHoveredIdx(2);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  chartMode === 'semester'
                    ? 'bg-white dark:bg-[#1a223f] text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Semester
              </button>
            </div>
          </div>

          {hasActivityData ? (
            <>
              {activePoint && (
                <div className="mt-4 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>
                    Period: <strong className="text-slate-900 dark:text-slate-100">{activePoint.label}</strong>
                  </span>
                  <span className="font-mono-tabular">
                    <strong className="text-indigo-700 dark:text-[#a894ff]">{activePoint.hours} hrs</strong> ·{' '}
                    {activePoint.tasks} tasks finished
                  </span>
                </div>
              )}

              <div className="mt-3 w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight + 24}`}
                  className="w-full h-44 min-w-[320px]"
                  role="img"
                  aria-label="Study and campus activity area chart"
                >
                  <defs>
                    <linearGradient id="ccChartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6D5DF6" stopOpacity="0.34" />
                      <stop offset="100%" stopColor="#6D5DF6" stopOpacity="0.01" />
                    </linearGradient>
                  </defs>

                  {[0.25, 0.5, 0.75, 1].map((ratio) => {
                    const y = padY + usableH * (1 - ratio);
                    return (
                      <line
                        key={ratio}
                        x1={padX}
                        y1={y}
                        x2={chartWidth - padX}
                        y2={y}
                        stroke="currentColor"
                        className="text-slate-200/80 dark:text-slate-800/80"
                        strokeDasharray="3 4"
                      />
                    );
                  })}

                  {activePoint && (
                    <line
                      x1={activePoint.x}
                      y1={padY}
                      x2={activePoint.x}
                      y2={chartHeight - padY}
                      stroke="#6D5DF6"
                      strokeOpacity="0.28"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  )}

                  <path d={areaPath} fill="url(#ccChartGrad)" />
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#6D5DF6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {points.map((pt, idx) => {
                    const isActive = activePoint?.label === pt.label;
                    return (
                      <g
                        key={pt.label}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredIdx(idx)}
                        onClick={() => setHoveredIdx(idx)}
                      >
                        <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isActive ? 5.5 : 3.5}
                          fill={isActive ? '#22D3EE' : '#6D5DF6'}
                          stroke="#ffffff"
                          strokeWidth={isActive ? 2 : 1.2}
                        />
                        <text
                          x={pt.x}
                          y={chartHeight + 12}
                          textAnchor="middle"
                          fontSize="11"
                          fontFamily="JetBrains Mono, monospace"
                          className={
                            isActive
                              ? 'fill-slate-900 dark:fill-white font-semibold'
                              : 'fill-slate-500 dark:fill-slate-400'
                          }
                        >
                          {pt.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </>
          ) : (
            <div className="my-auto py-8 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-[#171f3b] border border-indigo-200/70 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-[#a894ff]">
                <CheckSquare className="w-5 h-5" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                Start a task to see your week
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Logged study hours and completed milestones appear here automatically.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('tasks')}
                className="mt-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-[#6D5DF6] px-4 py-2 text-xs font-semibold text-white transition-colors"
              >
                Add your first task
              </button>
            </div>
          )}
        </div>

        {/* 4 Asymmetric KPI Bento Tiles */}
        <button
          type="button"
          onClick={() => onNavigate('events')}
          className="group text-left rounded-2xl border border-indigo-200/70 dark:border-indigo-500/20 bg-gradient-to-br from-white to-indigo-50/40 dark:from-[#0E1526] dark:to-[#121a35] p-5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-300 dark:hover:border-indigo-500/45 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
            <span>Upcoming events</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600 dark:text-[#9c88ff]" />
          </div>
          <div className="mt-3 font-display font-mono-tabular text-3xl font-bold text-slate-900 dark:text-slate-50">
            {String(events.length).padStart(2, '0')}
          </div>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-mono-tabular font-semibold text-indigo-600 dark:text-[#a894ff]">
              {registrations.length}
            </span>{' '}
            registered by you
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('tasks')}
          className="group text-left rounded-2xl border border-emerald-200/70 dark:border-emerald-500/20 bg-gradient-to-br from-white to-emerald-50/35 dark:from-[#0E1526] dark:to-[#0e1b2a] p-5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-300 dark:hover:border-emerald-500/45 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
            <span>Tasks completed</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-3 font-display font-mono-tabular text-3xl font-bold text-slate-900 dark:text-slate-50">
            {String(completedTasks).padStart(2, '0')}
            <span className="text-base font-medium text-slate-400 dark:text-slate-500">
              /{String(totalTasks).padStart(2, '0')}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-mono-tabular font-semibold text-emerald-600 dark:text-emerald-400">
              {completionPct}%
            </span>{' '}
            completion rate
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('resources')}
          className="group text-left rounded-2xl border border-cyan-200/70 dark:border-cyan-500/20 bg-gradient-to-br from-white to-cyan-50/40 dark:from-[#0E1526] dark:to-[#0d1c2e] p-5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-cyan-300 dark:hover:border-cyan-500/45 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
            <span>Notes &amp; resources</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-600 dark:text-[#22D3EE]" />
          </div>
          <div className="mt-3 font-display font-mono-tabular text-3xl font-bold text-slate-900 dark:text-slate-50">
            {String(notes.length + resources.length).padStart(2, '0')}
          </div>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            {notes.length} study notes · {resources.length} guides
          </div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('community')}
          className="group text-left rounded-2xl border border-amber-200/70 dark:border-amber-500/20 bg-gradient-to-br from-white to-amber-50/35 dark:from-[#0E1526] dark:to-[#17192b] p-5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 hover:border-amber-300 dark:hover:border-amber-500/45 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
            <span>Community board</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-amber-600 dark:text-amber-300" />
          </div>
          <div className="mt-3 font-display font-mono-tabular text-3xl font-bold text-slate-900 dark:text-slate-50">
            {String(posts.length).padStart(2, '0')}
          </div>
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            Active discussions &amp; teams
          </div>
        </button>
      </section>

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Featured Events */}
        <div className="lg:col-span-7 space-y-6">
          <section className="rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0E1526] p-6 shadow-2xs">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
              <div>
                <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Featured Events
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Upcoming hackathons and technical workshops
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('events')}
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 dark:text-[#b1a2ff] dark:hover:text-white whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
              >
                View all &rarr;
              </button>
            </div>

            {featuredEvents.length > 0 ? (
              <div className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
                {featuredEvents.map((ev) => {
                  const { day, month } = formatShortDate(ev.date);
                  const isRegistered = registrations.some((r) => r.eventId === ev.id);
                  return (
                    <div key={ev.id} className="py-4 first:pt-4 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50/70 dark:bg-[#161e3a] border border-indigo-200/60 dark:border-slate-800 flex flex-col items-center justify-center shrink-0">
                          <span className="font-mono-tabular text-sm font-bold text-indigo-700 dark:text-[#c3b4ff] leading-none">
                            {day}
                          </span>
                          <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-none">
                            {month}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {ev.title}
                          </div>
                          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">
                            {ev.category} · {ev.time} · {ev.place}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenRegistration(ev)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 whitespace-nowrap shrink-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                          isRegistered
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                            : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-[#6D5DF6] dark:hover:bg-[#7d6ef8]'
                        }`}
                      >
                        {isRegistered ? 'Registered' : 'Register'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState
                  compact
                  icon={CalendarDays}
                  headline="No upcoming events yet"
                  subline="Host a club workshop or browse campus schedules."
                  ctaLabel="Host first event"
                  onCtaClick={() => onNavigate('events')}
                />
              </div>
            )}
          </section>
        </div>

        {/* Right 5 Cols: Today's Focus + Pinned Notes + Community Highlight */}
        <div className="lg:col-span-5 space-y-6">
          <section className="rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0E1526] p-6 shadow-2xs">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Today&apos;s Focus
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Sorted by urgency and priority
                </p>
              </div>
              <span className="font-mono-tabular text-lg font-bold text-indigo-700 dark:text-[#a894ff]">
                {completionPct}%
              </span>
            </div>

            <div className="mt-3.5 h-2 w-full rounded-full bg-slate-100 dark:bg-[#171f3b] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-[#6D5DF6] dark:to-[#22D3EE] transition-all duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>

            {focusTasks.length > 0 ? (
              <div className="mt-5 divide-y divide-slate-200/80 dark:divide-slate-800/80">
                {focusTasks.map((task) => {
                  const urgency = getTaskUrgency(task, todayIso);
                  return (
                    <div key={task.id} className="py-3 flex items-start gap-3 group">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={task.done}
                        aria-label={`Complete "${task.text}"`}
                        onClick={() => onToggleTask(task.id)}
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                          task.done
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 group-hover:border-indigo-500'
                        }`}
                      >
                        {task.done && <Check className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleTask(task.id)}
                        className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">
                            {task.text}
                          </span>
                          {urgency === 'overdue' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300">
                              Overdue
                            </span>
                          )}
                          {urgency === 'today' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                              Due today
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          {task.course} · {task.priority} priority
                          {task.due ? ` · Due ${task.due}` : ''}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState
                  compact
                  icon={CheckSquare}
                  headline="All tasks caught up"
                  subline="Add a new deliverable to track your week."
                  ctaLabel="Add your first task"
                  onCtaClick={() => onNavigate('tasks')}
                />
              </div>
            )}

            <button
              type="button"
              onClick={() => onNavigate('tasks')}
              className="mt-4 inline-block text-xs font-semibold text-indigo-700 hover:text-indigo-800 dark:text-[#b1a2ff] dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
            >
              Manage all tasks &rarr;
            </button>
          </section>

          {/* Pinned Notes Preview */}
          <section className="rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0E1526] p-6 shadow-2xs">
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
                Pinned Study Notes
              </h3>
              <button
                type="button"
                onClick={() => onNavigate('resources')}
                className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 dark:text-[#b1a2ff] dark:hover:text-white whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
              >
                Open notebook &rarr;
              </button>
            </div>

            {pinnedNotes.length > 0 ? (
              <div className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
                {pinnedNotes.map((note) => (
                  <div key={note.id} className="py-3.5 last:pb-0">
                    <div className="text-xs font-medium text-indigo-600 dark:text-[#a894ff]">
                      {note.subject}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {note.title}
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <EmptyState
                  compact
                  icon={FileText}
                  headline="No pinned notes yet"
                  subline="Pin key formulas or lecture summaries here."
                  ctaLabel="Create a note"
                  onCtaClick={() => onNavigate('resources')}
                />
              </div>
            )}
          </section>

          {/* Latest Community Highlight */}
          {latestPost && (
            <section className="rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0E1526] p-6 shadow-2xs">
              <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
                <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                  Latest on Community
                </h3>
                <button
                  type="button"
                  onClick={() => onNavigate('community')}
                  className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 dark:text-[#b1a2ff] dark:hover:text-white whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                >
                  Join board &rarr;
                </button>
              </div>
              <div className="mt-3.5">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  <strong className="text-slate-900 dark:text-slate-100">{latestPost.name}</strong> ·{' '}
                  {latestPost.topic} · {latestPost.time}
                </div>
                <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3">
                  {latestPost.text}
                </p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
