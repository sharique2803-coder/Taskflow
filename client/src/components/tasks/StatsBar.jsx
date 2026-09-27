import { CheckCircle2, Clock, Circle, LayoutList, TrendingUp } from 'lucide-react';

const cards = [
  {
    key: 'total',
    label: 'Total Tasks',
    icon: LayoutList,
    gradient: 'from-indigo-500 to-violet-600',
    bg: 'from-indigo-50 to-violet-50 dark:from-indigo-950/60 dark:to-violet-950/60',
    border: 'border-indigo-100 dark:border-indigo-800/40',
    text: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    key: 'todo',
    label: 'To Do',
    icon: Circle,
    gradient: 'from-slate-400 to-slate-500',
    bg: 'from-slate-50 to-gray-50 dark:from-slate-800/60 dark:to-slate-800/40',
    border: 'border-slate-100 dark:border-slate-700/40',
    text: 'text-slate-500 dark:text-slate-400',
  },
  {
    key: 'in-progress',
    label: 'In Progress',
    icon: Clock,
    gradient: 'from-amber-400 to-orange-500',
    bg: 'from-amber-50 to-orange-50 dark:from-amber-950/60 dark:to-orange-950/60',
    border: 'border-amber-100 dark:border-amber-800/40',
    text: 'text-amber-600 dark:text-amber-400',
  },
  {
    key: 'completed',
    label: 'Completed',
    icon: CheckCircle2,
    gradient: 'from-emerald-400 to-teal-500',
    bg: 'from-emerald-50 to-teal-50 dark:from-emerald-950/60 dark:to-teal-950/60',
    border: 'border-emerald-100 dark:border-emerald-800/40',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
];

export default function StatsBar({ data = {} }) {
  const total = data.total || 0;
  const completed = data.completed || 0;
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ key, label, icon: Icon, gradient, bg, border, text }) => {
          const value = data[key] ?? 0;
          const pct = key !== 'total' && total > 0 ? Math.round((value / total) * 100) : null;

          return (
            <div
              key={key}
              className={`relative bg-gradient-to-br ${bg} border ${border} rounded-2xl p-5 overflow-hidden group hover:shadow-md transition-all duration-300`}
            >
              <div className={`absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br ${gradient} opacity-10 rounded-full group-hover:opacity-20 transition-opacity`} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                  <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">{value}</p>
                  {pct !== null && (
                    <p className={`text-xs font-medium ${text} mt-1`}>{pct}% of total</p>
                  )}
                </div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              {pct !== null && (
                <div className="mt-3 h-1.5 bg-white/50 dark:bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {total > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700/60 rounded-2xl px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Overall Progress</span>
            </div>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{completionPct}%</span>
          </div>
          <div className="h-2.5 bg-slate-100 dark:bg-slate-700/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
            {completed} of {total} tasks completed
          </p>
        </div>
      )}
    </div>
  );
}
