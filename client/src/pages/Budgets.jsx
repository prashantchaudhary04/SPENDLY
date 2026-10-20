import { useState } from 'react';
import { Plus, Pencil, Trash2, PiggyBank, TriangleAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/axios.js';
import { useFetch } from '../hooks/useFetch.js';
import { useCurrency } from '../hooks/useCurrency.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import BudgetBar from '../components/budgets/BudgetBar.jsx';
import BudgetForm from '../components/budgets/BudgetForm.jsx';
import { currentMonth, getErrorMessage, monthLabel } from '../utils/format.js';

export default function Budgets() {
  const money = useCurrency();
  const [month, setMonth] = useState(currentMonth());
  const [formState, setFormState] = useState({ open: false, budget: null });
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const budgets = useFetch((signal) => api.get('/budgets', { params: { month }, signal }).then((r) => r.data.budgets), [month]);
  const categories = useFetch((signal) => api.get('/categories', { signal }).then((r) => r.data.categories), []);

  const expenseCategories = (categories.data ?? []).filter((c) => c.type === 'expense');
  const overBudget = (budgets.data ?? []).filter((b) => b.status === 'over');

  const closeForm = () => setFormState({ open: false, budget: null });

  function handleSaved() {
    closeForm();
    budgets.reload();
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await api.delete(`/budgets/${toDelete.id}`);
      toast.success('Budget removed');
      setToDelete(null);
      budgets.reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader title="Budgets" subtitle={`Monthly limits for ${monthLabel(month, { month: 'long', year: 'numeric' })}`}>
        <input
          type="month"
          value={month}
          onChange={(e) => e.target.value && setMonth(e.target.value)}
          aria-label="Month"
          className="field-input !w-auto"
        />
        <Button onClick={() => setFormState({ open: true, budget: null })} disabled={!categories.data}>
          <Plus size={16} /> Set budget
        </Button>
      </PageHeader>

      {overBudget.length > 0 && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <TriangleAlert size={18} className="mt-0.5 shrink-0" />
          <p>
            You're over budget on <strong>{overBudget.map((b) => b.category.name).join(', ')}</strong>.
          </p>
        </div>
      )}

      <div className="card">
        {budgets.loading && !budgets.data ? (
          <div className="flex justify-center py-16 text-indigo-600">
            <Spinner size="lg" />
          </div>
        ) : budgets.error ? (
          <div className="py-10 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">{budgets.error}</p>
            <Button variant="secondary" onClick={budgets.reload} className="mt-3">
              Try again
            </Button>
          </div>
        ) : budgets.data.length === 0 ? (
          <EmptyState
            icon={PiggyBank}
            title="No budgets for this month"
            description="Set a limit on a category and we'll warn you before you overspend."
            action={
              <Button onClick={() => setFormState({ open: true, budget: null })}>
                <Plus size={16} /> Set budget
              </Button>
            }
          />
        ) : (
          <div className="space-y-6">
            {budgets.data.map((b) => (
              <BudgetBar
                key={b.id}
                budget={b}
                money={money}
                actions={
                  <>
                    <button
                      onClick={() => setFormState({ open: true, budget: b })}
                      aria-label={`Edit ${b.category.name} budget`}
                      className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setToDelete(b)}
                      aria-label={`Delete ${b.category.name} budget`}
                      className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                }
              />
            ))}
          </div>
        )}
      </div>

      <Modal open={formState.open} onClose={closeForm} title={formState.budget ? 'Edit budget' : 'Set budget'}>
        <BudgetForm
          key={formState.budget?.id ?? 'new'}
          categories={expenseCategories}
          month={month}
          budget={formState.budget}
          onSaved={handleSaved}
          onCancel={closeForm}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Remove this budget?"
        message="Your transactions won't be affected."
        confirmLabel="Remove"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
