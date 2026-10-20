import { Pencil, Trash2, Repeat, ArrowUp, ArrowDown } from 'lucide-react';
import { formatDate } from '../../utils/format.js';

function SortButton({ field, label, filters, onSort, align = 'left' }) {
  const active = filters.sortBy === field;
  return (
    <button
      onClick={() => onSort(field)}
      className={`inline-flex items-center gap-1 font-medium hover:text-slate-900 dark:hover:text-slate-100 ${
        align === 'right' ? 'flex-row-reverse' : ''
      }`}
    >
      {label}
      {active && (filters.order === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />)}
    </button>
  );
}

export default function TransactionTable({ transactions, filters, onSort, onEdit, onDelete, money }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <th className="px-4 py-3">
              <SortButton field="date" label="Date" filters={filters} onSort={onSort} />
            </th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Note</th>
            <th className="px-4 py-3 text-right">
              <SortButton field="amount" label="Amount" filters={filters} onSort={onSort} align="right" />
            </th>
            <th className="w-24 px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {transactions.map((t) => (
            <tr key={t._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="whitespace-nowrap px-4 py-3 text-slate-600 dark:text-slate-400">{formatDate(t.date)}</td>
              <td className="px-4 py-3">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: t.category?.color }} />
                  {t.category?.name ?? 'Unknown'}
                </span>
              </td>
              <td className="max-w-[220px] px-4 py-3 text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="truncate">{t.note || '—'}</span>
                  {(t.isRecurring || t.recurringSource) && (
                    <Repeat size={13} className="shrink-0 text-indigo-500" aria-label="Recurring" />
                  )}
                </span>
              </td>
              <td
                className={`whitespace-nowrap px-4 py-3 text-right font-medium ${
                  t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {t.type === 'income' ? '+' : '−'}
                {money(t.amount)}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => onEdit(t)}
                    aria-label="Edit"
                    className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => onDelete(t)}
                    aria-label="Delete"
                    className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
