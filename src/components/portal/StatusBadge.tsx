const colors: Record<string, string> = {
  pending: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
  approved: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  rejected: 'border-red-400/20 bg-red-400/10 text-red-200',
  cancelled: 'border-slate-400/20 bg-slate-400/10 text-slate-300',
  open: 'border-blue-400/20 bg-blue-400/10 text-blue-200',
  in_progress: 'border-blue-400/20 bg-blue-400/10 text-blue-200',
  waiting: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
  resolved: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  active: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
  inactive: 'border-slate-400/20 bg-slate-400/10 text-slate-300',
  closed: 'border-slate-400/20 bg-slate-400/10 text-slate-300',
};

export function StatusBadge({ value, label }: { value: string; label?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold leading-none ${colors[value] ?? colors.closed}`}
    >
      {label ?? value}
    </span>
  );
}
