import { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ReceiptText, ChartPie } from 'lucide-react';
import { api } from '../api/axios.js';
import { useFetch } from '../hooks/useFetch.js';
import { useCurrency } from '../hooks/useCurrency.js';
import { useAuth } from '../context/AuthContext.jsx';
import PageHeader from '../components/ui/PageHeader.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import CategoryDonut from '../components/charts/CategoryDonut.jsx';
import TrendChart from '../components/charts/TrendChart.jsx';
import BudgetBar from '../components/budgets/BudgetBar.jsx';
import { currentMonth, formatDate, monthLabel } from '../utils/format.js';

function StatCard({ label, value, icon: Icon, tone, loading }) {
  const tones = {
    green: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  };
  return (
    <div className="card flex items-center gap-4">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon size={20} />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="truncate text-xl font-semibold">{loading ? '…' : value}</p>
      </div>
    </div>
  );
}

function CardSection({ title, action, loading, error, children }) {
  return (
    <section className="card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        {action}
      </div>
      {loading ? (
        <div className="flex justify-center py-12 text-indigo-600">
          <Spinner />
        </div>
      ) : error ? (
        <p className="py-8 text-center text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : (
        children
      )}
    </section>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const money = useCurrency();
  const [month, setMonth] = useState(currentMonth());

  // Each call runs independently, so one slow request doesn't block the others
  const summary = useFetch((signal) => api.get('/analytics/summary', { params: { month }, signal }).then((r) => r.data), [month]);
  const byCategory = useFetch(
    (signal) => api.get('/analytics/by-category', { params: { month, type: 'expense' }, signal }).then((r) => r.data),
    [month]
  );
  const trend = useFetch((signal) => api.get('/analytics/trend', { params: { months: 6 }, signal }).then((r) => r.data), []);
  const budgets = useFetch((signal) => api.get('/budgets', { params: { month }, signal }).then((r) => r.data), [month]);
  const recent = useFetch((signal) => api.get('/transactions', { params: { limit: 5 }, signal }).then((r) => r.data), []);

  const s = summary.data;
  const hasTrendData = trend.data?.trend.some((m) => m.income > 0 || m.expense > 0);

  return (
    <>
      <PageHeader title={`Hi, ${user.name.split(' ')[0]}`} subtitle={`Overview for ${monthLabel(month, { month: 'long', year: 'numeric' })}`}>
        <input
          type="month"
          value={month}
          onChange={(e) => e.target.value && setMonth(e.target.value)}
          aria-label="Month"
          className="field-input !w-auto"
        />
      </PageHeader>

      {summary.error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{summary.error}</p>}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Income" value={money(s?.income)} icon={TrendingUp} tone="green" loading={summary.loading && !s} />
        <StatCard label="Expenses" value={money(s?.expense)} icon={TrendingDown} tone="red" loading={summary.loading && !s} />
        <StatCard label="Balance (month)" value={money(s?.balance)} icon={Wallet} tone="indigo" loading={summary.loading && !s} />
        <StatCard label="Total savings" value={money(s?.allTimeBalance)} icon={PiggyBank} tone="slate" loading={summary.loading && !s} />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <CardSection title="Spending by category" loading={byCategory.loading && !byCategory.data} error={byCategory.error}>
            {byCategory.data?.categories.length ? (
              <CategoryDonut categories={byCategory.data.categories} total={byCategory.data.total} money={money} />
            ) : (
              <EmptyState icon={ChartPie} title="No expenses this month" description="Add a transaction to see your spending breakdown." />
            )}
          </CardSection>
        </div>
        <div className="lg:col-span-3">
          <CardSection title="Last 6 months" loading={trend.loading && !trend.data} error={trend.error}>
            {hasTrendData ? (
              <TrendChart data={trend.data.trend} money={money} />
            ) : (
              <EmptyState icon={TrendingUp} title="No data yet" description="Your income and expenses will be charted here." />
            )}
          </CardSection>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CardSection
          title="Budgets"
          loading={budgets.loading && !budgets.data}
          error={budgets.error}
          action={
            <Link to="/budgets" className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              Manage
            </Link>
          }
        >
          {budgets.data?.budgets.length ? (
            <div className="space-y-5">
              {budgets.data.budgets.slice(0, 4).map((b) => (
                <BudgetBar key={b.id} budget={b} money={money} />
              ))}
            </div>
          ) : (
            <EmptyState icon={PiggyBank} title="No budgets set" description="Set a monthly limit to get over-budget warnings." />
          )}
        </CardSection>

        <CardSection
          title="Recent transactions"
          loading={recent.loading && !recent.data}
          error={recent.error}
          action={
            <Link to="/transactions" className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              View all
            </Link>
          }
        >
          {recent.data?.transactions.length ? (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {recent.data.transactions.map((t) => (
                <li key={t._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: t.category?.color }} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{t.note || t.category?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t.category?.name} · {formatDate(t.date)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-sm font-medium ${
                      t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {t.type === 'income' ? '+' : '−'}
                    {money(t.amount)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={ReceiptText} title="No transactions yet" description="Your latest activity will appear here." />
          )}
        </CardSection>
      </div>
    </>
  );
}
