import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { tooltipStyle } from './chartStyle.js';
import { formatCompact, monthLabel } from '../../utils/format.js';

export default function TrendChart({ data, money }) {
  const chartData = data.map((d) => ({ ...d, label: monthLabel(d.month, { month: 'short' }) }));

  return (
    // text-slate-500 sets "currentColor", which the axis labels below use
    <div className="h-72 text-slate-500 dark:text-slate-400">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.2} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: 'currentColor', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            tickFormatter={formatCompact}
            tick={{ fill: 'currentColor', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => money(value)}
            contentStyle={tooltipStyle}
            itemStyle={{ color: 'var(--pop-fg)' }}
            cursor={{ fill: 'currentColor', opacity: 0.08 }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
