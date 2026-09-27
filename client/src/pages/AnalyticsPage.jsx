import { useState, useEffect } from 'react';
import { getAnalytics } from '../api/tasks';
import {
  TrendingUp, CheckCircle2, AlertCircle, Calendar,
  BarChart3, Target, Clock, Zap
} from 'lucide-react';

/* ─── Reusable bar chart (pure SVG) ──────────────────────────────── */
function BarChart({ data = [], color = '#6366f1', height = 120 }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-1 w-full" style={{ height }}>
      {data.map((d, i) => {
        const pct = (d.count / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            {/* Tooltip */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center justify-center bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap z-10 shadow-lg">
              {d.count} task{d.count !== 1 ? 's' : ''}
            </div>
            <div
              className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer"
              style={{ height: `${Math.max(pct, 3)}%`, backgroundColor: color, minHeight: d.count > 0 ? 4 : 2, opacity: d.count === 0 ? 0.2 : 1 }}
            />
          </div>
        );
      })}
    </div>
  );
}

/* ─── X-axis labels (show every other for 14 days) ───────────────── */
function BarChartLabels({ data = [] }) {
  return (
    <div className="flex gap-1 w-full mt-1">
      {data.map((d, i) => (
        <div key={i} className="flex-1 text-center">
          {i % 2 === 0 && (
            <span className="text-xs text-slate-400 dark:text-slate-600 truncate block">{d.date}</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Donut chart (SVG) ──────────────────────────────────────────── */
function DonutChart({ segments = [], size = 120 }) {
  const r = 40, cx = size / 2, cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="16" className="text-slate-100 dark:text-slate-800" />
      {segments.map((seg, i) => {
        const dash   = (seg.value / total) * circumference;
        const gap    = circumference - dash;
        const rotate = (offset / total) * 360 - 90;
        offset += seg.value;
        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="16"
            strokeDasharray={`${dash} ${gap}`}
            strokeLinecap="round"
            transform={`rotate(${rotate} ${cx} ${cy})`}
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        );
      })}
      {/* Center label */}
      <text x={cx} y={cy - 4} textAnchor="middle" className="fill-slate-700 dark:fill-slate-200" fontSize="16" fontWeight="800">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" className="fill-slate-400" fontSize="9">tasks</text>
    </svg>
  );
}

/* ─── Stat card ──────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, sub, gradient, bg, border }) {
  return (
    <div className={`relative bg-gradient-to-br ${bg} border ${border} rounded-2xl p-5 overflow-hidden group hover:shadow-md transition-all duration-300`}>
      <div className={`absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br ${gradient} opacity-10 rounded-full group-hover:opacity-20 transition-opacity`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{value}</p>
          {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700/60" />
        ))}
      </div>
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-56 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700/60" />
      ))}
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <AlertCircle className="w-12 h-12 text-rose-400 mb-4" />
      <p className="text-slate-600 dark:text-slate-300 font-semibold">{error}</p>
    </div>
  );

  const { priorityDist, statusDist, createdPerDay, completedPerDay,
          overdue, dueToday, total, completed, completionRate } = data;

  const statusSegments = [
    { label: 'Completed',   value: statusDist.completed,    color: '#10b981' },
    { label: 'In Progress', value: statusDist['in-progress'], color: '#f59e0b' },
    { label: 'To Do',       value: statusDist.todo,          color: '#94a3b8' },
  ];

  const prioritySegments = [
    { label: 'High',   value: priorityDist.high,   color: '#f43f5e' },
    { label: 'Medium', value: priorityDist.medium, color: '#f59e0b' },
    { label: 'Low',    value: priorityDist.low,    color: '#10b981' },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Analytics</h2>
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-0.5">Your productivity overview for the last 14 days</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={BarChart3}   label="Total Tasks"      value={total}            sub="All time"
          gradient="from-indigo-500 to-violet-600" bg="from-indigo-50 to-violet-50 dark:from-indigo-950/60 dark:to-violet-950/60" border="border-indigo-100 dark:border-indigo-800/40" />
        <StatCard icon={CheckCircle2} label="Completed"       value={completed}         sub={`${completionRate}% rate`}
          gradient="from-emerald-400 to-teal-500"  bg="from-emerald-50 to-teal-50 dark:from-emerald-950/60 dark:to-teal-950/60"   border="border-emerald-100 dark:border-emerald-800/40" />
        <StatCard icon={Calendar}    label="Due Today"        value={dueToday}          sub="Pending"
          gradient="from-amber-400 to-orange-500"  bg="from-amber-50 to-orange-50 dark:from-amber-950/60 dark:to-orange-950/60"   border="border-amber-100 dark:border-amber-800/40" />
        <StatCard icon={AlertCircle} label="Overdue"          value={overdue}           sub={overdue > 0 ? 'Need attention' : 'All on track'}
          gradient="from-rose-500 to-red-600"      bg="from-rose-50 to-red-50 dark:from-rose-950/60 dark:to-red-950/60"           border="border-rose-100 dark:border-rose-800/40" />
      </div>

      {/* Completion rate banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-200" />
            <span className="font-semibold text-indigo-100">Overall Completion Rate</span>
          </div>
          <span className="text-3xl font-extrabold">{completionRate}%</span>
        </div>
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-1000"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-indigo-200 text-xs mt-2">{completed} of {total} tasks completed</p>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Tasks created per day */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700/60 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Tasks Created</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Last 14 days</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" />Created
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />Completed
              </span>
            </div>
          </div>
          <div className="relative">
            <div className="flex gap-1 items-end" style={{ height: 140 }}>
              {createdPerDay.map((d, i) => {
                const maxC = Math.max(...createdPerDay.map((x) => x.count), ...completedPerDay.map((x) => x.count), 1);
                const cpct = (d.count / maxC) * 100;
                const epct = (completedPerDay[i].count / maxC) * 100;
                return (
                  <div key={i} className="flex-1 flex items-end gap-0.5 group relative">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:flex gap-1 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap z-10 shadow-lg">
                      +{d.count} / ✓{completedPerDay[i].count}
                    </div>
                    <div className="flex-1 rounded-t-md bg-indigo-500 opacity-80 hover:opacity-100 transition-all duration-500"
                      style={{ height: `${Math.max(cpct, d.count > 0 ? 3 : 0)}%`, minHeight: d.count > 0 ? 3 : 0 }} />
                    <div className="flex-1 rounded-t-md bg-emerald-500 opacity-80 hover:opacity-100 transition-all duration-500"
                      style={{ height: `${Math.max(epct, completedPerDay[i].count > 0 ? 3 : 0)}%`, minHeight: completedPerDay[i].count > 0 ? 3 : 0 }} />
                  </div>
                );
              })}
            </div>
            <BarChartLabels data={createdPerDay} />
          </div>
        </div>

        {/* Status donut */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700/60 p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Status Breakdown</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Distribution of all tasks</p>
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <DonutChart segments={statusSegments} size={140} />
            <div className="space-y-2 w-full">
              {statusSegments.map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{label}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Priority breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Priority donut */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700/60 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">Priority Distribution</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">How your tasks are prioritized</p>
          <div className="flex items-center gap-8">
            <DonutChart segments={prioritySegments} size={120} />
            <div className="space-y-3 flex-1">
              {prioritySegments.map(({ label, value, color }) => {
                const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{value} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 content-start">
          {[
            { icon: Zap,         label: 'High Priority',  value: priorityDist.high,            color: 'text-rose-500',    bg: 'bg-rose-50 dark:bg-rose-950/40',     border: 'border-rose-100 dark:border-rose-800/40'     },
            { icon: Clock,       label: 'In Progress',    value: statusDist['in-progress'],     color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-950/40',   border: 'border-amber-100 dark:border-amber-800/40'   },
            { icon: TrendingUp,  label: 'Completion Rate',value: `${completionRate}%`,          color: 'text-indigo-500',  bg: 'bg-indigo-50 dark:bg-indigo-950/40', border: 'border-indigo-100 dark:border-indigo-800/40' },
            { icon: CheckCircle2,label: 'Done',           value: statusDist.completed,          color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40',border:'border-emerald-100 dark:border-emerald-800/40'},
          ].map(({ icon: Icon, label, value, color, bg, border }) => (
            <div key={label} className={`${bg} border ${border} rounded-2xl p-4 flex flex-col gap-2`}>
              <Icon className={`w-5 h-5 ${color}`} />
              <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{value}</p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
