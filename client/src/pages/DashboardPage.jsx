import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import {
  Plus, Search, SlidersHorizontal, X, ClipboardList,
  Sparkles, ChevronDown, LayoutGrid, List, AlertTriangle,
  Calendar, CheckCircle2, Folder, Kanban
} from 'lucide-react';
import {
  getTasks, getTaskStats, createTask,
  updateTask, deleteTask, updateTaskStatus
} from '../api/tasks';
import { getCategories }    from '../api/categories';
import TaskCard             from '../components/tasks/TaskCard';
import StatsBar             from '../components/tasks/StatsBar';
import TaskForm             from '../components/tasks/TaskForm';
import KanbanBoard          from '../components/tasks/KanbanBoard';
import TaskDetailPanel      from '../components/tasks/TaskDetailPanel';
import Modal                from '../components/ui/Modal';
import ConfirmDialog        from '../components/ui/ConfirmDialog';
import { useAuth }          from '../context/AuthContext';

const STATUS_TABS = [
  { value: 'all',         label: 'All Tasks',   dot: 'bg-slate-400'   },
  { value: 'todo',        label: 'To Do',       dot: 'bg-slate-400'   },
  { value: 'in-progress', label: 'In Progress', dot: 'bg-amber-400'   },
  { value: 'completed',   label: 'Completed',   dot: 'bg-emerald-400' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ── Today's Focus ───────────────────────────────────── */
function FocusCard({ task, onStatusChange }) {
  const [loading, setLoading] = useState(false);
  const handleComplete = async () => {
    setLoading(true);
    await onStatusChange(task._id || task.id, 'completed');
    setLoading(false);
  };
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 hover:shadow-sm transition-all group">
      <button onClick={handleComplete} disabled={loading}
        className="shrink-0 w-5 h-5 rounded-full border-2 border-amber-400 hover:bg-amber-400 flex items-center justify-center transition-all">
        {loading
          ? <span className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          : <CheckCircle2 className="w-3 h-3 text-transparent group-hover:text-white transition-all" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{task.title}</p>
        <p className="text-xs text-amber-500 font-medium mt-0.5 flex items-center gap-1">
          <Calendar className="w-3 h-3" />Due today
        </p>
      </div>
      {task.priority === 'high' && (
        <span className="shrink-0 text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-lg border border-rose-100 dark:border-rose-800/40">High</span>
      )}
    </div>
  );
}

function TodaysFocus({ onStatusChange }) {
  const [focusTasks, setFocusTasks] = useState([]);
  const [loading,    setLoading]    = useState(true);

  const load = useCallback(async () => {
    try { const d = await getTasks({ dueToday: 'true' }); setFocusTasks(d); }
    catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = async (id, status) => {
    await onStatusChange(id, status);
    setFocusTasks(prev => prev.filter(t => (t._id || t.id) !== id));
  };

  if (loading) return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-100 dark:border-amber-800/40 rounded-2xl p-5 animate-pulse">
      <div className="h-4 w-32 bg-amber-200 dark:bg-amber-800/40 rounded mb-3" />
      {[1,2].map(i => <div key={i} className="h-12 bg-amber-100 dark:bg-amber-900/20 rounded-xl mb-2" />)}
    </div>
  );

  if (focusTasks.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-100 dark:border-amber-800/40 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">Today's Focus</h3>
            <p className="text-xs text-amber-600 dark:text-amber-400">{focusTasks.length} task{focusTasks.length !== 1 ? 's' : ''} due today</p>
          </div>
        </div>
        <span className="text-xs font-bold bg-amber-400 text-white px-2.5 py-1 rounded-lg shadow-sm">{focusTasks.length}</span>
      </div>
      <div className="space-y-2">
        {focusTasks.map(task => (
          <FocusCard key={task._id || task.id} task={{ ...task, _id: task._id || task.id }} onStatusChange={handleStatusChange} />
        ))}
      </div>
      {focusTasks.some(t => t.priority === 'high') && (
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-3 py-2 rounded-xl">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          You have high priority tasks due today. Stay focused!
        </div>
      )}
    </div>
  );
}

/* ── Main Dashboard ──────────────────────────────────── */
export default function DashboardPage() {
  const { user } = useAuth();

  const [tasks,        setTasks]        = useState([]);
  const [stats,        setStats]        = useState({});
  const [categories,   setCategories]   = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Filters
  const [activeStatus, setActiveStatus] = useState('all');
  const [priority,     setPriority]     = useState('all');
  const [categoryId,   setCategoryId]   = useState('all');
  const [search,       setSearch]       = useState('');
  const [sortBy,       setSortBy]       = useState('createdAt');
  const [order,        setOrder]        = useState('desc');
  const [showFilters,  setShowFilters]  = useState(false);

  // View: 'grid' | 'list' | 'kanban'
  const [viewMode,     setViewMode]     = useState('grid');

  // Modals
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editingTask,  setEditingTask]  = useState(null);
  const [formLoading,  setFormLoading]  = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [defaultStatus,setDefaultStatus]= useState('todo');

  // Detail panel
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => { getCategories().then(setCategories).catch(() => {}); }, []);

  const fetchTasks = useCallback(async () => {
    setLoadingTasks(true);
    try {
      const params = { sortBy, order };
      if (activeStatus !== 'all') params.status     = activeStatus;
      if (priority     !== 'all') params.priority   = priority;
      if (categoryId   !== 'all') params.categoryId = categoryId;
      if (search.trim())          params.search     = search.trim();
      const [taskData, statsData] = await Promise.all([getTasks(params), getTaskStats()]);
      setTasks(taskData);
      setStats(statsData);
    } catch { toast.error('Failed to load tasks'); }
    finally  { setLoadingTasks(false); }
  }, [activeStatus, priority, categoryId, search, sortBy, order]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => {
    const t = setTimeout(fetchTasks, 400);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line

  /* ── CRUD ──────────────────────────────────────────── */
  const handleFormSubmit = async (payload) => {
    setFormLoading(true);
    try {
      if (editingTask) {
        const updated = await updateTask(editingTask._id, payload);
        setTasks(prev => prev.map(t => t._id === updated._id ? updated : t));
        // Sync detail panel if open
        if (selectedTask?._id === updated._id) setSelectedTask(updated);
        toast.success('Task updated!');
      } else {
        const created = await createTask({ ...payload, status: payload.status || defaultStatus });
        setTasks(prev => [created, ...prev]);
        setStats(prev => ({ ...prev, [created.status]: (prev[created.status] || 0) + 1, total: (prev.total || 0) + 1 }));
        toast.success('Task created!');
      }
      closeModal();
    } catch (err) { toast.error(err.response?.data?.message || 'Something went wrong'); }
    finally      { setFormLoading(false); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await updateTaskStatus(id, newStatus);
      setTasks(prev => prev.map(t => (t._id || t.id) === (updated._id || updated.id) ? updated : t));
      if (selectedTask && (selectedTask._id === id || selectedTask.id === id)) {
        setSelectedTask(prev => ({ ...prev, status: newStatus }));
      }
      getTaskStats().then(setStats);
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTask(deleteTarget._id);
      setTasks(prev => prev.filter(t => t._id !== deleteTarget._id));
      setStats(prev => ({
        ...prev,
        [deleteTarget.status]: Math.max(0, (prev[deleteTarget.status] || 1) - 1),
        total: Math.max(0, (prev.total || 1) - 1),
      }));
      if (selectedTask?._id === deleteTarget._id) setSelectedTask(null);
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete task'); }
    finally  { setDeleteTarget(null); }
  };

  const openCreate   = (status = 'todo') => { setDefaultStatus(status); setEditingTask(null); setModalOpen(true); };
  const openEdit     = (t) => { setEditingTask(t); setModalOpen(true); };
  const closeModal   = () => { setModalOpen(false); setEditingTask(null); };
  const clearFilters = () => { setPriority('all'); setCategoryId('all'); setSearch(''); setSortBy('createdAt'); setOrder('desc'); };
  const hasActiveFilters = priority !== 'all' || categoryId !== 'all' || search || sortBy !== 'createdAt' || order !== 'desc';

  const emojis = ['👋','✨','🚀','💪','🎯'];
  const emoji  = emojis[new Date().getDay() % emojis.length];

  const viewModes = [
    { id: 'grid',   Icon: LayoutGrid, label: 'Grid'   },
    { id: 'list',   Icon: List,       label: 'List'   },
    { id: 'kanban', Icon: Kanban,     label: 'Kanban' },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{emoji}</span>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              {getGreeting()},{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {user?.name?.split(' ')[0]}
              </span>
            </h2>
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-sm">
            You have{' '}
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {(stats.todo || 0) + (stats['in-progress'] || 0)} tasks
            </span>{' '}
            remaining today.
          </p>
        </div>
        <button
          onClick={() => openCreate()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 hover:-translate-y-0.5 transition-all duration-200">
          <Plus className="w-4 h-4" />New Task
        </button>
      </div>

      {/* Stats */}
      <StatsBar data={stats} />

      {/* Today's Focus */}
      <TodaysFocus onStatusChange={handleStatusChange} />

      {/* Category pills */}
      {categories.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Folder className="w-3.5 h-3.5" />Categories
          </span>
          <button onClick={() => setCategoryId('all')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
              categoryId === 'all'
                ? 'bg-slate-700 dark:bg-slate-200 text-white dark:text-slate-800 border-slate-700 dark:border-slate-200'
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}>All</button>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setCategoryId(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${categoryId === cat.id ? 'ring-2 ring-offset-1' : 'opacity-70 hover:opacity-100'}`}
              style={{ backgroundColor: cat.color + '20', color: cat.color, borderColor: cat.color + '60' }}>
              <Folder className="w-3 h-3" />{cat.name}
              {cat._count?.tasks > 0 && <span className="ml-0.5 opacity-70">{cat._count.tasks}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Toolbar card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-2xl shadow-sm overflow-hidden">

        {/* Status tabs */}
        <div className="flex items-center gap-1 px-4 pt-4 border-b border-slate-100 dark:border-slate-700/60 overflow-x-auto">
          {STATUS_TABS.map(tab => {
            const count = tab.value === 'all' ? stats.total : stats[tab.value];
            return (
              <button key={tab.value} onClick={() => setActiveStatus(tab.value)}
                className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all duration-200 whitespace-nowrap ${
                  activeStatus === tab.value
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}>
                <span className={`w-2 h-2 rounded-full ${tab.dot}`} />
                {tab.label}
                {count !== undefined && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold ${
                    activeStatus === tab.value
                      ? 'bg-indigo-100 dark:bg-indigo-800/60 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-100 dark:bg-slate-700/60 text-slate-400 dark:text-slate-500'
                  }`}>{count}</span>
                )}
                {activeStatus === tab.value && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Search + controls */}
        <div className="flex flex-col sm:flex-row gap-3 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-600" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white dark:focus:bg-slate-800 transition-all" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 hover:text-slate-500 transition">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                hasActiveFilters
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700/60 text-indigo-600 dark:text-indigo-400'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}>
              <SlidersHorizontal className="w-4 h-4" />Filters
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* View toggle — grid / list / kanban */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1">
              {viewModes.map(({ id, Icon, label }) => (
                <button key={id} onClick={() => setViewMode(id)} title={label}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === id ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}>
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="px-4 pb-4 border-t border-slate-50 dark:border-slate-700/40 pt-3 flex flex-wrap gap-3 items-end bg-slate-50/50 dark:bg-slate-800/30">
            {[
              { label: 'Priority', value: priority, onChange: setPriority, options: [
                { value: 'all', label: 'All Priorities' }, { value: 'high', label: '🔴 High' },
                { value: 'medium', label: '🟡 Medium' }, { value: 'low', label: '🟢 Low' },
              ]},
              { label: 'Sort By', value: sortBy, onChange: setSortBy, options: [
                { value: 'createdAt', label: 'Date Created' }, { value: 'dueDate', label: 'Due Date' },
                { value: 'priority', label: 'Priority' }, { value: 'title', label: 'Title (A–Z)' },
              ]},
              { label: 'Order', value: order, onChange: setOrder, options: [
                { value: 'desc', label: 'Newest First' }, { value: 'asc', label: 'Oldest First' },
              ]},
            ].map(({ label, value, onChange, options }) => (
              <div key={label} className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</label>
                <select value={value} onChange={e => onChange(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm">
                  {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ))}
            {hasActiveFilters && (
              <button onClick={clearFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition font-semibold border border-rose-100 dark:border-rose-800/40">
                <X className="w-3.5 h-3.5" />Clear All
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Task list / Kanban ─────────────────────────── */}
      {loadingTasks ? (
        <div className={viewMode === 'kanban' ? 'grid grid-cols-3 gap-4' : viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'flex flex-col gap-3'}>
          {[...Array(viewMode === 'kanban' ? 3 : 6)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700/60 p-5 animate-pulse space-y-3 h-40">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg flex-1" />
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-lg w-4/5" />
              <div className="flex gap-2"><div className="h-5 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg" /><div className="h-5 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg" /></div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/60 dark:to-violet-950/60 rounded-3xl flex items-center justify-center border border-indigo-100 dark:border-indigo-800/40">
              <ClipboardList className="w-12 h-12 text-indigo-300 dark:text-indigo-600" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">
            {hasActiveFilters || search ? 'No matching tasks' : 'No tasks yet'}
          </h3>
          <p className="text-slate-400 dark:text-slate-500 text-sm mb-8 max-w-xs">
            {hasActiveFilters || search ? 'Try clearing your filters.' : 'Create your first task to get started!'}
          </p>
          {!hasActiveFilters && !search && (
            <button onClick={() => openCreate()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 hover:-translate-y-0.5 transition-all duration-200">
              <Plus className="w-4 h-4" />Create your first task
            </button>
          )}
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          tasks={tasks}
          onEdit={openEdit}
          onDelete={setDeleteTarget}
          onOpen={setSelectedTask}
          onStatusChange={handleStatusChange}
          onAddTask={(status) => openCreate(status)}
        />
      ) : (
        <>
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'flex flex-col gap-3'}>
            {tasks.map(task => (
              <TaskCard
                key={task._id || task.id}
                task={{ ...task, _id: task._id || task.id }}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                onStatusChange={handleStatusChange}
                onOpen={setSelectedTask}
              />
            ))}
          </div>
          <p className="text-center text-xs text-slate-300 dark:text-slate-600 pb-4">
            Showing {tasks.length} task{tasks.length !== 1 ? 's' : ''}{hasActiveFilters || search ? ' (filtered)' : ''}
          </p>
        </>
      )}

      {/* Create / Edit modal */}
      <Modal isOpen={modalOpen} onClose={closeModal} title={editingTask ? 'Edit Task' : 'Create New Task'}>
        <TaskForm
          initialData={editingTask || (defaultStatus !== 'todo' ? { status: defaultStatus } : null)}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
          loading={formLoading}
        />
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Task" message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
      />

      {/* Task detail panel */}
      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEdit={(t) => { setSelectedTask(null); openEdit(t); }}
          onDelete={(t) => { setSelectedTask(null); setDeleteTarget(t); }}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
