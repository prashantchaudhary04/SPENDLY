import { useState } from 'react';
import { Plus, Pencil, Trash2, Tags } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/axios.js';
import { useFetch } from '../hooks/useFetch.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import CategoryIcon from '../components/ui/CategoryIcon.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import CategoryForm from '../components/categories/CategoryForm.jsx';
import { getErrorMessage } from '../utils/format.js';

function CategoryGroup({ title, items, onEdit, onDelete }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title} <span className="font-normal">({items.length})</span>
      </h2>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">None yet.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <div key={c._id} className="card flex items-center justify-between gap-3 !p-4">
              <div className="flex min-w-0 items-center gap-3">
                <CategoryIcon name={c.icon} color={c.color} />
                <span className="truncate text-sm font-medium">{c.name}</span>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => onEdit(c)}
                  aria-label={`Edit ${c.name}`}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => onDelete(c)}
                  aria-label={`Delete ${c.name}`}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function Categories() {
  const { data: categories, loading, error, reload } = useFetch(
    (signal) => api.get('/categories', { signal }).then((r) => r.data.categories),
    []
  );
  const [formState, setFormState] = useState({ open: false, category: null });
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const closeForm = () => setFormState({ open: false, category: null });

  function handleSaved() {
    closeForm();
    reload();
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await api.delete(`/categories/${toDelete._id}`);
      toast.success('Category deleted');
      setToDelete(null);
      reload();
    } catch (err) {
      // e.g. 409 "Category is used by transactions"
      toast.error(getErrorMessage(err));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <PageHeader title="Categories" subtitle="Organize your income and expenses">
        <Button onClick={() => setFormState({ open: true, category: null })}>
          <Plus size={16} /> New category
        </Button>
      </PageHeader>

      {loading && !categories ? (
        <div className="flex justify-center py-16 text-indigo-600">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <div className="card py-10 text-center">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <Button variant="secondary" onClick={reload} className="mt-3">
            Try again
          </Button>
        </div>
      ) : categories.length === 0 ? (
        <div className="card">
          <EmptyState icon={Tags} title="No categories" description="Create a category to start adding transactions." />
        </div>
      ) : (
        <>
          <CategoryGroup
            title="Expense"
            items={categories.filter((c) => c.type === 'expense')}
            onEdit={(c) => setFormState({ open: true, category: c })}
            onDelete={setToDelete}
          />
          <CategoryGroup
            title="Income"
            items={categories.filter((c) => c.type === 'income')}
            onEdit={(c) => setFormState({ open: true, category: c })}
            onDelete={setToDelete}
          />
        </>
      )}

      <Modal open={formState.open} onClose={closeForm} title={formState.category ? 'Edit category' : 'New category'}>
        <CategoryForm
          key={formState.category?._id ?? 'new'}
          category={formState.category}
          onSaved={handleSaved}
          onCancel={closeForm}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Delete "${toDelete?.name}"?`}
        message="Categories that still have transactions can't be deleted."
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
