import { useMemo, useState } from 'react';
import { Plus, Download, ReceiptText, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api/axios.js';
import { useFetch } from '../hooks/useFetch.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useCurrency } from '../hooks/useCurrency.js';
import PageHeader from '../components/ui/PageHeader.jsx';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import TransactionForm from '../components/transactions/TransactionForm.jsx';
import TransactionFilters from '../components/transactions/TransactionFilters.jsx';
import TransactionTable from '../components/transactions/TransactionTable.jsx';
import { getErrorMessage } from '../utils/format.js';

const EMPTY_FILTERS = { search: '', type: '', category: '', from: '', to: '', sortBy: 'date', order: 'desc', page: 1 };
const PAGE_SIZE = 10;

export default function Transactions() {
  const money = useCurrency();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [formState, setFormState] = useState({ open: false, transaction: null });
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(filters.search);

  // Any filter change sends the user back to page 1
  const updateFilters = (patch) => setFilters((f) => ({ ...f, page: 1, ...patch }));
  const clearFilters = () => setFilters(EMPTY_FILTERS);

  const hasFilters = Boolean(filters.search || filters.type || filters.category || filters.from || filters.to);

  // Only the filters that have a value are sent. The backend rejects empty strings.
  const filterParams = useMemo(() => {
    const p = {};
    if (debouncedSearch) p.search = debouncedSearch;
    if (filters.type) p.type = filters.type;
    if (filters.category) p.category = filters.category;
    if (filters.from) p.from = filters.from;
    if (filters.to) p.to = filters.to;
    return p;
  }, [debouncedSearch, filters.type, filters.category, filters.from, filters.to]);

  const listParams = useMemo(
    () => ({ ...filterParams, page: filters.page, limit: PAGE_SIZE, sortBy: filters.sortBy, order: filters.order }),
    [filterParams, filters.page, filters.sortBy, filters.order]
  );

  const categories = useFetch((signal) => api.get('/categories', { signal }).then((r) => r.data.categories), []);
  const list = useFetch((signal) => api.get('/transactions', { params: listParams, signal }).then((r) => r.data), [listParams]);

  const transactions = list.data?.transactions ?? [];
  const pagination = list.data?.pagination;

  function handleSort(field) {
    // Same column: flip direction. New column: start descending.
    setFilters((f) => ({
      ...f,
      page: 1,
      sortBy: field,
      order: f.sortBy === field && f.order === 'desc' ? 'asc' : 'desc',
    }));
  }

  function closeForm() {
    setFormState({ open: false, transaction: null });
  }

  function handleSaved() {
    closeForm();
    list.reload();
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await api.delete(`/transactions/${toDelete._id}`);
      toast.success('Transaction deleted');
      setToDelete(null);
      // Deleted the last item on this page? Step back one page.
      if (transactions.length === 1 && filters.page > 1) setFilters((f) => ({ ...f, page: f.page - 1 }));
      else list.reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  // A plain <a href> can't send our Authorization header, so we fetch the file and download the blob
  async function handleExport() {
    try {
      const res = await api.get('/transactions/export', { params: filterParams, responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Export failed'));
    }
  }

  const noCategories = categories.data && categories.data.length === 0;

  return (
    <>
      <PageHeader title="Transactions" subtitle="Everything you've earned and spent">
        <Button variant="secondary" onClick={handleExport}>
          <Download size={16} /> Export CSV
        </Button>
        <Button onClick={() => setFormState({ open: true, transaction: null })} disabled={!categories.data || noCategories}>
          <Plus size={16} /> Add transaction
        </Button>
      </PageHeader>

      <TransactionFilters
        filters={filters}
        categories={categories.data ?? []}
        onChange={updateFilters}
        onClear={clearFilters}
        hasFilters={hasFilters}
      />

      <div className="card overflow-hidden p-0">
        {list.loading && !list.data ? (
          <div className="flex justify-center py-16 text-indigo-600">
            <Spinner size="lg" />
          </div>
        ) : list.error ? (
          <div className="py-12 text-center">
            <p className="text-sm text-red-600 dark:text-red-400">{list.error}</p>
            <Button variant="secondary" onClick={list.reload} className="mt-3">
              Try again
            </Button>
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={ReceiptText}
            title={hasFilters ? 'No matching transactions' : 'No transactions yet'}
            description={hasFilters ? 'Try changing or clearing your filters.' : 'Add your first transaction to get started.'}
            action={
              hasFilters ? (
                <Button variant="secondary" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : (
                <Button onClick={() => setFormState({ open: true, transaction: null })}>
                  <Plus size={16} /> Add transaction
                </Button>
              )
            }
          />
        ) : (
          <div className={list.loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <TransactionTable
              transactions={transactions}
              filters={filters}
              onSort={handleSort}
              onEdit={(t) => setFormState({ open: true, transaction: t })}
              onDelete={setToDelete}
              money={money}
            />

            <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-400">
                Page {pagination.page} of {pagination.pages} · {pagination.total} total
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  disabled={pagination.page <= 1}
                  onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                  aria-label="Previous page"
                >
                  <ChevronLeft size={16} />
                </Button>
                <Button
                  variant="secondary"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                  aria-label="Next page"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal open={formState.open} onClose={closeForm} title={formState.transaction ? 'Edit transaction' : 'Add transaction'}>
        {/* key makes React build a fresh form each time the modal opens */}
        <TransactionForm
          key={formState.transaction?._id ?? 'new'}
          categories={categories.data ?? []}
          transaction={formState.transaction}
          onSaved={handleSaved}
          onCancel={closeForm}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete transaction?"
        message="This can't be undone."
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
