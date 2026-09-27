import { useState } from 'react';
import { format, isPast, isToday } from 'date-fns';
import {
  Circle, Clock, CheckCircle2, Plus,
  Calendar, Tag, Folder, AlertCircle, Edit2, Trash2
} from 'lucide-react';

const COLUMNS = [
  {
    id: 'todo',
    label: 'To Do',
    icon: Circle,
    color: 'text-slate-500',
    bg: 'bg-slate-50 dark:bg-slate-800/40',
    border: 'border-slate-200 dark:border-slate-700/60',
    headerBg: 'bg-slate-100 dark:bg-slate-800',
    dot: 'bg-slate-400',
    accent: 'border-t-slate-400',
  },
  {
    id: 'in-progress',
    label: 'In Progress',
    icon: Clock,
    color: 'text-amber-500',
    bg: 'bg-amber-50/50 dark:bg-amber-950/20',
    border: 'border-amber-200 dark:border-amber-800/40',
    headerBg: 'bg-amber-50 dark:bg-amber-950/30',
    dot: 'bg-amber-400',
    accent: 'border-t-amber-400',
  },
  {
    id: 'completed',
    label: 'Completed',
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    border: 'border-emerald-200 dark:border-emerald-800/40',
    headerBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    dot: 'bg-emerald-400',
    accent: 'border-t-emerald-400',
  },
];

const priorityDot = {
  high:   'bg-rose-500',
  medium: 'bg-amber-400',
  low:    'bg-emerald-400',
};

function KanbanCard({ task, onEdit, onDelete, onOpen, onStatusChange, isDragOver }) {
  const [dragging, setDragging] = useState(false);
  const isCompleted = task.status === 'completed';

  const due = (() => {
    if (!task.dueDate) return null;
    const d = new Date(task.dueDate);
    const overdue = isPast(d) && !isCompleted && !isToday(d);
    const today = isToday(d);
    return { label: format(d, 'MMM d'), overdue, today };
  })();

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('taskId', task._id || task.id);
        setDragging(true);
      }}
      onDragEnd={() => setDragging(false)}
      onClick={() => onOpen(task)}
      className={`
        bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700/60
        shadow-sm hover:shadow-md cursor-pointer select-none
        transition-all duration-200 group
        ${dragging ? 'opacity-40 scale-95' : 'opacity-100 scale-100'}
        ${isDragOver ? 'ring-2 ring-indigo-400' : ''}
      `}
    >
      <div className="p-3">
        {/* Category */}
        {task.category && (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-semibold mb-2"
            style={{ backgroundColor: task.category.color + '20', color: task.category.color }}>
            <Folder className="w-2.5 h-2.5" />{task.category.name}
          </span>
        )}

        {/* Title */}
        <p className={`text-sm font-semibold leading-snug mb-2 ${isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
          {task.title}
        </p>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed mb-2">
            {task.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 mt-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Priority dot */}
            <span className={`w-2 h-2 rounded-full ${priorityDot[task.priority] || priorityDot.medium}`} title={task.priority} />

            {/* Due date */}
            {due && (
              <span className={`text-xs font-medium flex items-center gap-0.5 ${
                due.overdue ? 'text-rose-500' : due.today ? 'text-orange-500' : 'text-slate-400 dark:text-slate-500'
              }`}>
                {due.overdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                {due.label}
              </span>
            )}

            {/* Tags */}
            {task.tags?.slice(0, 1).map(tag => (
              <span key={tag} className="text-xs text-indigo-400 dark:text-indigo-500 flex items-center gap-0.5">
                <Tag className="w-2.5 h-2.5" />{tag}
              </span>
            ))}
          </div>

          {/* Action buttons — visible on hover */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            onClick={e => e.stopPropagation()}>
            <button onClick={() => onEdit(task)}
              className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all">
              <Edit2 className="w-3 h-3" />
            </button>
            <button onClick={() => onDelete(task)}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-all">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({ column, tasks, onEdit, onDelete, onOpen, onStatusChange, onAddTask }) {
  const [dragOver, setDragOver] = useState(false);
  const Icon = column.icon;

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) onStatusChange(taskId, column.id);
  };

  return (
    <div className="flex flex-col min-w-0 flex-1">
      {/* Column header */}
      <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl mb-3 ${column.headerBg} border ${column.border}`}>
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${column.color}`} />
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{column.label}</span>
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${column.headerBg} ${column.color} border ${column.border}`}>
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className={`p-1 rounded-lg ${column.color} hover:bg-white dark:hover:bg-slate-800 transition-all`}
          title={`Add to ${column.label}`}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          flex-1 min-h-[200px] rounded-2xl p-2 space-y-2
          border-2 border-dashed transition-all duration-200
          ${dragOver
            ? 'border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10 scale-[1.01]'
            : `border-transparent ${column.bg}`}
        `}
      >
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <Icon className={`w-8 h-8 ${column.color} opacity-30 mb-2`} />
            <p className="text-xs text-slate-400 dark:text-slate-600">
              {dragOver ? 'Drop here' : 'No tasks'}
            </p>
          </div>
        ) : (
          tasks.map(task => (
            <KanbanCard
              key={task._id || task.id}
              task={{ ...task, _id: task._id || task.id }}
              onEdit={onEdit}
              onDelete={onDelete}
              onOpen={onOpen}
              onStatusChange={onStatusChange}
            />
          ))
        )}

        {/* Empty drop indicator */}
        {dragOver && tasks.length > 0 && (
          <div className="h-16 rounded-xl border-2 border-dashed border-indigo-300 dark:border-indigo-700 flex items-center justify-center">
            <p className="text-xs text-indigo-400 font-medium">Drop here</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function KanbanBoard({ tasks, onEdit, onDelete, onOpen, onStatusChange, onAddTask }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
      {COLUMNS.map(col => (
        <KanbanColumn
          key={col.id}
          column={col}
          tasks={tasks.filter(t => t.status === col.id)}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpen={onOpen}
          onStatusChange={onStatusChange}
          onAddTask={(status) => onAddTask(status)}
        />
      ))}
    </div>
  );
}
