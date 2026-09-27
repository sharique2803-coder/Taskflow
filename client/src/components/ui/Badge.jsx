const priorityStyles = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};

const statusStyles = {
  todo: 'bg-gray-100 text-gray-600',
  'in-progress': 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
};

const statusLabels = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  completed: 'Completed',
};

export function PriorityBadge({ priority }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${priorityStyles[priority] || priorityStyles.medium}`}>
      {priority}
    </span>
  );
}

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.todo}`}>
      {statusLabels[status] || status}
    </span>
  );
}
