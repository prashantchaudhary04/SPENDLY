import CategoryIcon from '../ui/CategoryIcon.jsx';

const STATUS = {
  ok: { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300', label: 'On track' },
  warning: { bar: 'bg-amber-500', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300', label: 'Almost there' },
  over: { bar: 'bg-red-500', badge: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300', label: 'Over budget' },
};

// Used on the Budgets page and the Dashboard. `actions` is optional (edit/delete buttons).
export default function BudgetBar({ budget, money, actions }) {
  const s = STATUS[budget.status];
  const width = Math.min(budget.percentUsed, 100);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <CategoryIcon name={budget.category.icon} color={budget.category.color} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{budget.category.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {money(budget.spent)} of {money(budget.limit)}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.badge}`}>{s.label}</span>
          {actions}
        </div>
      </div>

      <div
        className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
        role="progressbar"
        aria-valuenow={budget.percentUsed}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={`h-full rounded-full transition-all ${s.bar}`} style={{ width: `${width}%` }} />
      </div>

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        {budget.percentUsed}% used ·{' '}
        {budget.remaining >= 0 ? `${money(budget.remaining)} left` : `${money(Math.abs(budget.remaining))} over`}
      </p>
    </div>
  );
}
