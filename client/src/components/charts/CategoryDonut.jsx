import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { tooltipStyle } from './chartStyle.js';

export default function CategoryDonut({ categories, total, money }) {
  return (
    <div>
      <div className="relative h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categories}
              dataKey="total"
              nameKey="name"
              innerRadius={62}
              outerRadius={90}
              paddingAngle={2}
              stroke="none"
            >
              {categories.map((c) => (
                <Cell key={c.categoryId} fill={c.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => money(value)}
              contentStyle={tooltipStyle}
              itemStyle={{ color: 'var(--pop-fg)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-slate-500 dark:text-slate-400">Total</span>
          <span className="text-lg font-semibold">{money(total)}</span>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {categories.map((c) => (
          <li key={c.categoryId} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="truncate">{c.name}</span>
            </span>
            <span className="shrink-0 text-slate-500 dark:text-slate-400">
              {c.percentage}% · <span className="font-medium text-slate-900 dark:text-slate-100">{money(c.total)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
