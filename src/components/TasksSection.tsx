import React, { useEffect, useRef, useState } from 'react';
import { Check, CheckSquare, Plus, Trash2 } from 'lucide-react';
import { TaskItem, TaskPriority } from '../types';
import { getTaskUrgency, getTodayIso, sortTasksByUrgency } from '../utils/taskUrgency';
import { EmptyState } from './EmptyState';

interface TasksSectionProps {
  tasks: TaskItem[];
  onAddTask: (task: Omit<TaskItem, 'id' | 'done'>) => void;
  onToggleTask: (id: number) => void;
  onDeleteTask: (id: number) => void;
  onClearCompleted: () => void;
  highlightedId?: number | null;
}

export const TasksSection: React.FC<TasksSectionProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onClearCompleted,
  highlightedId,
}) => {
  const [text, setText] = useState('');
  const [course, setCourse] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [due, setDue] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'done'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | TaskPriority>('all');

  const taskInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!highlightedId) return;
    setStatusFilter('all');
    setPriorityFilter('all');
    const el = document.getElementById(`task-row-${highlightedId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAddTask({
      text: text.trim(),
      course: course.trim() || 'General',
      priority,
      due,
    });
    setText('');
    setCourse('');
    setPriority('Medium');
    setDue('');
  };

  const todayIso = getTodayIso();

  const filteredTasks = sortTasksByUrgency(
    tasks.filter((t) => {
      if (statusFilter === 'active' && t.done) return false;
      if (statusFilter === 'done' && !t.done) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      return true;
    }),
    todayIso
  );

  const completedCount = tasks.filter((t) => t.done).length;
  const overdueCount = tasks.filter((t) => getTaskUrgency(t, todayIso) === 'overdue').length;
  const openHigh = tasks.filter((t) => !t.done && t.priority === 'High').length;
  const openMedium = tasks.filter((t) => !t.done && t.priority === 'Medium').length;
  const openLow = tasks.filter((t) => !t.done && t.priority === 'Low').length;
  const pct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const getPriorityTextColor = (p: TaskPriority) => {
    if (p === 'High') return 'text-rose-700 dark:text-rose-300';
    if (p === 'Medium') return 'text-amber-700 dark:text-amber-300';
    return 'text-emerald-700 dark:text-emerald-300';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-wide text-indigo-600 dark:text-[#9c88ff]">
            Interactive Task Manager
          </p>
          <h1 className="mt-1.5 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 text-balance">
            Your study &amp; project tasks.
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
            Break semester goals into clear deliverables with priorities and due dates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-mono-tabular border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0E1526] rounded-xl px-4 py-2.5 self-start sm:self-auto shadow-2xs">
          <span>
            Overdue: <strong className={overdueCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}>{overdueCount}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>High: <strong className="text-rose-600 dark:text-rose-300">{openHigh}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Med: <strong className="text-amber-600 dark:text-amber-300">{openMedium}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Low: <strong className="text-emerald-600 dark:text-emerald-300">{openLow}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Add Task Form */}
        <section className="lg:col-span-4 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0E1526] p-6 shadow-2xs">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
            Add new task
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Synced automatically with your Overview focus widget
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="task-title" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Task description
              </label>
              <input
                ref={taskInputRef}
                id="task-title"
                type="text"
                maxLength={100}
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. Finish database normalization lab"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label htmlFor="task-course" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Course or project tag
              </label>
              <input
                id="task-course"
                type="text"
                maxLength={35}
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. CS301 or Buildathon"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="task-priority" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Priority
                </label>
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label htmlFor="task-due" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Due date
                </label>
                <input
                  id="task-due"
                  type="date"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] dark:bg-[#6D5DF6] dark:hover:bg-[#7d6ef8] px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <Plus className="w-4 h-4" />
              <span>Add to task list</span>
            </button>
          </form>
        </section>

        {/* Right: Task Checklist */}
        <section className="lg:col-span-8 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0E1526] p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Checklist
                </h2>
                <span className="font-mono-tabular text-xs text-slate-500 dark:text-slate-400">
                  {completedCount}/{tasks.length} done ({pct}%)
                </span>
              </div>
              <div className="mt-2 h-1.5 w-44 rounded-full bg-slate-100 dark:bg-[#171f3b] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-cyan-500 transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#070B14] border border-slate-200 dark:border-slate-800">
                {(['all', 'active', 'done'] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatusFilter(status)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      statusFilter === status
                        ? 'bg-white dark:bg-[#1a223f] text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {status === 'all' ? 'All' : status === 'active' ? 'To do' : 'Completed'}
                  </button>
                ))}
              </div>

              <select
                aria-label="Filter by priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as 'all' | TaskPriority)}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070B14] px-2.5 py-2 text-xs text-slate-700 dark:text-slate-300"
              >
                <option value="all">All priorities</option>
                <option value="High">High priority</option>
                <option value="Medium">Medium priority</option>
                <option value="Low">Low priority</option>
              </select>

              {completedCount > 0 && (
                <button
                  type="button"
                  onClick={onClearCompleted}
                  className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                >
                  Clear done
                </button>
              )}
            </div>
          </div>

          {filteredTasks.length > 0 ? (
            <div className="divide-y divide-slate-200/80 dark:divide-slate-800/80">
              {filteredTasks.map((task) => {
                const urgency = getTaskUrgency(task, todayIso);
                const isHighlighted = highlightedId === task.id;
                return (
                  <div
                    id={`task-row-${task.id}`}
                    key={task.id}
                    className={`py-3.5 flex items-center justify-between gap-4 -mx-2 px-2 rounded-xl transition-colors ${
                      isHighlighted
                        ? 'bg-cyan-50/70 dark:bg-cyan-500/10 ring-1 ring-cyan-500/40'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/20'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={task.done}
                        aria-label={`Mark "${task.text}" as ${task.done ? 'incomplete' : 'complete'}`}
                        onClick={() => onToggleTask(task.id)}
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                          task.done
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                        }`}
                      >
                        {task.done && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-sm font-medium ${
                              task.done
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {task.text}
                          </span>
                          {urgency === 'overdue' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300">
                              Overdue
                            </span>
                          )}
                          {urgency === 'today' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300">
                              Due today
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span>{task.course}</span>
                          <span aria-hidden="true">·</span>
                          <span className={`font-medium ${getPriorityTextColor(task.priority)}`}>
                            {task.priority} priority
                          </span>
                          {task.due && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono-tabular">Due {task.due}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteTask(task.id)}
                      aria-label={`Delete task "${task.text}"`}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-500/10 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                icon={CheckSquare}
                headline={
                  statusFilter === 'done'
                    ? 'No completed tasks yet'
                    : tasks.length === 0
                    ? 'Your checklist is clear'
                    : 'No tasks match this filter'
                }
                subline={
                  tasks.length === 0
                    ? 'Add your first assignment, lab, or hackathon deliverable.'
                    : 'Reset filters or add a new task to stay on track.'
                }
                ctaLabel={tasks.length === 0 ? 'Add your first task' : 'Show all tasks'}
                onCtaClick={() => {
                  if (tasks.length === 0) {
                    taskInputRef.current?.focus();
                  } else {
                    setStatusFilter('all');
                    setPriorityFilter('all');
                  }
                }}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
