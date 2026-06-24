export default function StatusBadge({ status }) {
  let colorClasses = '';

  switch (status) {
    case 'Completed':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'In Progress':
      colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case 'Pending':
    default:
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'Completed' ? 'bg-emerald-500' :
        status === 'In Progress' ? 'bg-amber-500' : 'bg-rose-500'
      }`} />
      {status}
    </span>
  );
}
