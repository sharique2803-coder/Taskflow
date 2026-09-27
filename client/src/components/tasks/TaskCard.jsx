import { useState } from 'react';
import { format, isPast, isToday } from 'date-fns';
import {
  Calendar, Edit2, Trash2, Tag, CheckCircle2,
  Circle, Clock, AlertCircle, ArrowRight, Folder,
  Play, Pause, ExternalLink
} from 'lucide-react';
import { useTimer } from '../../hooks/useTimer';

const priorityConfig = {
  high:   { border: 'border-l-rose-500',    badge: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',           dot: 'bg-rose-500',    glow: 'hover:shadow-rose-100 dark:hover:shadow-rose-900/20'    },
  medium: { border: 'border-l-amber-400',   badge: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',       dot: 'bg-amber-400',   glow: 'hover:shadow-amber-100 dark:hover:shadow-amber-900/20'  },
  low:    { border: 'border-l-emerald-400', badge: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400', dot: 'bg-emerald-400', glow: 'hover:shadow-emerald-100 dark:hover:shadow-emerald-900/20' },
};

const statusConfig = {
  'todo':        { icon: Circle,       badge: 'bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400',          label: 'To Do',       next: 'in-progress', nextLabel: 'Start',    iconColor: 'text-slate-300 dark:text-slate-600 hover:text-slate-400' },
  'in-progress': { icon: Clock,        badge: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',              label: 'In Progress', next: 'completed',   nextLabel: 'Complete', iconColor: 'text-blue-400 hover:text-blue-500' },
  'completed':   { icon: CheckCircle2, badge: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',  label: 'Completed',   next: 'todo',        nextLabel: 'Reopen',   iconColor: 'text-emerald-500 hover:text-emerald-600' },
};

export default function TaskCard({ task, onEdit, onDelete, onStatusChange, onOpen }) {
  const [statusLoading, setStatusLoading] = useState(false);
  const [hovered,       setHovered]       = useState(false);

  const { running, formatted, start, pause } = useTimer(task._id, task.timerSeconds || 0);

  const pc          = priorityConfig[task.priority] || priorityConfig.medium;
  const sc          = statusConfig[task.status]     || statusConfig.todo;
  const StatusIcon  = sc.icon;
  const isCompleted = task.status === 'completed';

  const cycleStatus = async (e) => {
    e.stopPropagation();
    setStatusLoading(true);
    await onStatusChange(task._id, sc.next);
    setStatusLoading(false);
  };

  const dueInfo = () => {
    if (!task.dueDate) return null;
    const d       = new Date(task.dueDate);
    const overdue = isPast(d) && !isCompleted && !isToday(d);
    const today   = isToday(d);
    return { label: format(d, 'MMM d, yyyy'), overdue, today };
  };
  const due = dueInfo();

  return (
    <div
      className={`group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700/60 border-l-4 ${pc.border} shadow-sm hover:shadow-lg ${pc.glow} transition-all duration-300 ${isCompleted ? 'opacity-60' : ''} cursor-pointer`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpen?.(task)}
    >
      <div className="p-4">

        {/* Category pill */}
        {task.category && (
          <div className="flex items-center gap-1.5 mb-2" onClick={e => e.stopPropagation()}>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
              style={{ backgroundColor: task.category.color + '20', color: task.category.color, border: `1px solid ${task.category.color}40` }}>
              <Folder className="w-3 h-3" />{task.category.name}
            </span>
          </div>
        )}

        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Status toggle */}
          <button onClick={cycleStatus} disabled={statusLoading}
            className={`mt-0.5 shrink-0 transition-all duration-200 ${sc.iconColor} hover:scale-110`}
            title={`Mark as ${sc.nextLabel}`}>
            {statusLoading
              ? <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin block" />
              : <StatusIcon className="w-5 h-5" />}
          </button>

          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-sm leading-snug ${isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className={`flex items-center gap-1 shrink-0 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            onClick={e => e.stopPropagation()}>
            <button onClick={() => onOpen?.(task)} title="View details"
              className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-all">
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(task)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="border-t border-slate-50 dark:border-slate-700/40 mt-3 mb-3" />

        {/* Footer badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold ${sc.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${task.status === 'completed' ? 'bg-emerald-500' : task.status === 'in-progress' ? 'bg-blue-500' : 'bg-slate-400'}`} />
            {sc.label}
          </span>

          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold capitalize ${pc.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
            {task.priority}
          </span>

          {due && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${
              due.overdue ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400'
              : due.today ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400'}`}>
              {due.overdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
              {due.overdue ? 'Overdue' : due.today ? 'Today' : due.label}
            </span>
          )}

          {task.tags?.slice(0, 2).map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400">
              <Tag className="w-3 h-3" />{tag}
            </span>
          ))}
          {task.tags?.length > 2 && (
            <span className="text-xs text-slate-400 font-medium">+{task.tags.length - 2}</span>
          )}
        </div>

        {/* Timer row — always visible if elapsed > 0 or running */}
        {!isCompleted && (
          <div className="mt-3 flex items-center justify-between" onClick={e => e.stopPropagation()}>
            <div className={`flex items-center gap-1.5 text-xs font-mono font-semibold ${running ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-600'}`}>
              <Clock className="w-3 h-3" />
              {formatted}
            </div>
            <button
              onClick={running ? pause : start}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                running
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400'
              }`}>
              {running ? <><Pause className="w-3 h-3" />Pause</> : <><Play className="w-3 h-3" />Start</>}
            </button>
          </div>
        )}

        {/* Quick status action */}
        {hovered && !isCompleted && (
          <button onClick={cycleStatus}
            className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-xs font-semibold text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all border border-slate-100 dark:border-slate-700/40 hover:border-indigo-100 dark:hover:border-indigo-800/40">
            <ArrowRight className="w-3.5 h-3.5" />Mark as {sc.nextLabel}
          </button>
        )}
      </div>
    </div>
  );
}
