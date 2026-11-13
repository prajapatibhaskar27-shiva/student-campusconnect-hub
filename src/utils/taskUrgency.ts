import { TaskItem, TaskPriority } from '../types';

export function getTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getOffsetDateIso(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export type TaskUrgency = 'overdue' | 'today' | 'upcoming' | 'none';

export function getTaskUrgency(task: TaskItem, todayIso: string = getTodayIso()): TaskUrgency {
  if (task.done || !task.due) return 'none';
  if (task.due < todayIso) return 'overdue';
  if (task.due === todayIso) return 'today';
  return 'upcoming';
}

const PRIORITY_RANK: Record<TaskPriority, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

const URGENCY_RANK: Record<TaskUrgency, number> = {
  overdue: 0,
  today: 1,
  upcoming: 2,
  none: 3,
};

export function sortTasksByUrgency(tasks: TaskItem[], todayIso: string = getTodayIso()): TaskItem[] {
  return [...tasks].sort((a, b) => {
    const uA = URGENCY_RANK[getTaskUrgency(a, todayIso)];
    const uB = URGENCY_RANK[getTaskUrgency(b, todayIso)];
    if (uA !== uB) return uA - uB;

    const pA = PRIORITY_RANK[a.priority];
    const pB = PRIORITY_RANK[b.priority];
    if (pA !== pB) return pA - pB;

    if (a.due && b.due && a.due !== b.due) {
      return a.due.localeCompare(b.due);
    }
    if (a.due && !b.due) return -1;
    if (!a.due && b.due) return 1;
    return a.id - b.id;
  });
}
