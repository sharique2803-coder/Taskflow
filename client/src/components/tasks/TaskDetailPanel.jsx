import { useEffect, useState } from 'react';
import { format, isPast, isToday } from 'date-fns';
import {
  X, Edit2, Trash2, Calendar, Tag, Folder, Flag,
  CheckCircle2, Circle, Clock, AlertCircle,
  Play, Pause, RotateCcw, Timer
} from 'lucide-react';
import { useTimer } from '../../hooks/useTimer';

const priorityConfig = {
  high:   { badge: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',     dot: 'bg-rose-500',    label: 'High'   },
  medium: { badge: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400', dot: 'bg-amber-400',  label: 'Medium' },
  low:    { badge: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400', dot: 'bg-emerald-400', label: 'Low' },
};
const statusConfig = {
  'todo':        { icon: Circle,       label: 'To Do',       badge: 'bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400'           },
  'in-progress': { icon: Clock,        label: 'In Progress', badge: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'               },
  'completed':   { icon: CheckCircle2, label: 'Completed',   badge: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400'   },
};

function TimerWidget({ taskId, initialSeconds }) {
  const { elapsed, running, formatted, start, pause, reset } = useTimer(taskId, initialSeconds);

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 border border-indigo-100 dark:border-indigo-800/40 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Timer className="w-4 h-4 text-indigo-500" />
        <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Task Timer</span>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-3xl font-mono font-extrabold tracking-tight ${running ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>
          {formatted}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={reset} title="Reset"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all">
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={running ? pause : start}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-all hover:-translate-y-0.5 ${
              running
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200 dark:shadow-amber-900/30'
                : 'bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white shadow-indigo-200 dark:shadow-indigo-900/30'
            }`}>
            {running ? <><Pause className="w-3.5 h-3.5" />Pause</> : <><Play className="w-3.5 h-3.5" />Start</>}
          </button>
        </div>
      </div>
      {elapsed > 0 && (
        <p className="text-xs text-indigo-500/70 dark:text-indigo-400/60 mt-2">
          {running ? '⏱ Timer running...' : '⏸ Timer paused'}
        </p>
      )}
    </div>
  );
}

export default function TaskDetailPanel({ task, onClose, onEdit, onDelete, onStatusChange }) {
  const [statusLoading, setStatusLoading] = useState(false);

  // Close on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  if (!task) return null;

  const pc          = priorityConfig[task.priority] || priorityConfig.medium;
  const sc          = statusConfig[task.status]     || statusConfig.todo;
  const StatusIcon  = sc.icon;
  const isCompleted = task.status === 'completed';

  const dueInfo = () => {
    if (!task.dueDate) return null;
    const d       = new Date(task.dueDate);
    const overdue = isPast(d) && !isCompleted && !isToday(d);
    const today   = isToday(d);
    return { label: format(d, 'EEEE, MMMM d, yyyy'), overdue, today };
  };
  const due = dueInfo();

  const cycleStatus = async () => {
    const next = { todo: 'in-progress', 'in-progress': 'completed', completed: 'todo' };
    setStatusLoading(true);
    await onStatusChange(task._id, next[task.status]);
    setStatusLoading(false);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-slate-900/30 dark:bg-slate-950/50 backdrop-blur-[2px]" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 flex flex-col bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-700/60 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700/60 shrink-0">
          <div className="flex items-center gap-2">
            <button onClick={cycleStatus} disabled={statusLoading}
              className={`${sc.badge} flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer hover:opacity-80 transition-all`}>
              {statusLoading
                ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                : <StatusIcon className="w-3.5 h-3.5" />}
              {sc.label}
            </button>
            <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${pc.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${pc.dot}`} />
              {pc.label}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => onEdit(task)} title="Edit"
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all">
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={() => { onDelete(task); onClose(); }} title="Delete"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all">
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
            <button onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {/* Title */}
          <div>
            <h2 className={`text-xl font-extrabold leading-snug tracking-tight ${
              isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'
            }`}>{task.title}</h2>
            {task.category && (
              <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-lg text-xs font-semibold"
                style={{ backgroundColor: task.category.color + '20', color: task.category.color, border: `1px solid ${task.category.color}40` }}>
                <Folder className="w-3 h-3" />{task.category.name}
              </span>
            )}
          </div>

          {/* Description */}
          {task.description ? (
            <div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{task.description}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-300 dark:text-slate-600 italic">No description provided.</p>
          )}

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            {due && (
              <div className={`p-3 rounded-xl border ${
                due.overdue ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40'
                  : due.today ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/40'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  {due.overdue ? <AlertCircle className="w-3.5 h-3.5 text-rose-500" /> : <Calendar className="w-3.5 h-3.5 text-slate-400" />}
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Due Date</span>
                </div>
                <p className={`text-sm font-semibold ${
                  due.overdue ? 'text-rose-600 dark:text-rose-400' : due.today ? 'text-orange-600 dark:text-orange-400' : 'text-slate-700 dark:text-slate-200'}`}>
                  {due.overdue ? 'Overdue · ' : due.today ? 'Today · ' : ''}{due.label}
                </p>
              </div>
            )}
            <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5 mb-1">
                <Flag className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</span>
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 capitalize">{task.priority}</p>
            </div>
          </div>

          {/* Tags */}
          {task.tags?.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/40">
                    <Tag className="w-3 h-3" />{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Timer */}
          <TimerWidget taskId={task._id} initialSeconds={task.timerSeconds || 0} />

          {/* Created/Updated */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/60">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Created</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {task.createdAt ? format(new Date(task.createdAt), 'MMM d, yyyy') : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Updated</p>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {task.updatedAt ? format(new Date(task.updatedAt), 'MMM d, yyyy') : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
