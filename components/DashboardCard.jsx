export default function DashboardCard({ title, value, icon: Icon, color }) {
  let colorClasses = '';

  switch (color) {
    case 'success':
      colorClasses = 'bg-emerald-50 text-emerald-600 border-emerald-100';
      break;
    case 'warning':
      colorClasses = 'bg-amber-50 text-amber-600 border-amber-100';
      break;
    case 'danger':
      colorClasses = 'bg-rose-50 text-rose-600 border-rose-100';
      break;
    case 'primary':
    default:
      colorClasses = 'bg-primary-50 text-primary-600 border-primary-100';
      break;
  }

  return (
    <div className="bg-white border border-card-border rounded-2xl p-6 shadow-sm flex items-center justify-between gap-4 hover:shadow-md transition-shadow">
      <div className="space-y-1">
        <span className="text-xs font-semibold text-text-body uppercase tracking-wider block">{title}</span>
        <span className="text-3xl font-extrabold font-display text-text-title block">{value}</span>
      </div>
      <div className={`p-4 rounded-xl border shrink-0 ${colorClasses}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
