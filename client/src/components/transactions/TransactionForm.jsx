import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { api } from '../../api/axios.js';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';
import { getErrorMessage, todayInput, toInputDate } from '../../utils/format.js';

const schema = z.object({
  type: z.enum(['expense', 'income']),
  amount: z.coerce.number({ invalid_type_error: 'Enter an amount' }).positive('Amount must be greater than 0'),
  category: z.string().min(1, 'Choose a category'),
  date: z.string().min(1, 'Pick a date'),
  note: z.string().trim().max(200, 'Max 200 characters'),
  recurrence: z.enum(['', 'daily', 'weekly', 'monthly']),
});

export default function TransactionForm({ categories, transaction, onSaved, onCancel }) {
  const editing = Boolean(transaction);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: transaction
      ? {
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category._id,
          date: toInputDate(transaction.date),
          note: transaction.note ?? '',
          recurrence: transaction.recurrence?.frequency ?? '',
        }
      : { type: 'expense', amount: '', category: '', date: todayInput(), note: '', recurrence: '' },
  });

  const type = watch('type');

  // Only show categories that match the chosen type (expense or income)
  const options = useMemo(() => categories.filter((c) => c.type === type), [categories, type]);

  // If the user switches type, clear a category that no longer fits
  useEffect(() => {
    const current = getValues('category');
    if (current && !options.some((c) => c._id === current)) setValue('category', '');
  }, [options, getValues, setValue]);

  async function onSubmit(values) {
    const payload = { ...values, recurrence: values.recurrence || null };
    try {
      if (editing) await api.put(`/transactions/${transaction._id}`, payload);
      else await api.post('/transactions', payload);
      toast.success(editing ? 'Transaction updated' : 'Transaction added');
      onSaved();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
        {['expense', 'income'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setValue('type', t)}
            className={`rounded-md py-1.5 text-sm font-medium capitalize transition ${
              type === t
                ? t === 'expense'
                  ? 'bg-white text-red-600 shadow-sm dark:bg-slate-900 dark:text-red-400'
                  : 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Amount"
          type="number"
          step="0.01"
          min="0"
          inputMode="decimal"
          placeholder="0.00"
          error={errors.amount?.message}
          {...register('amount')}
        />
        <Input label="Date" type="date" error={errors.date?.message} {...register('date')} />
      </div>

      <Select label="Category" error={errors.category?.message} {...register('category')}>
        <option value="">Select a category</option>
        {options.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </Select>

      <Input label="Note (optional)" placeholder="What was this for?" error={errors.note?.message} {...register('note')} />

      <Select
        label="Repeat"
        error={errors.recurrence?.message}
        {...register('recurrence')}
      >
        <option value="">Does not repeat</option>
        <option value="daily">Every day</option>
        <option value="weekly">Every week</option>
        <option value="monthly">Every month</option>
      </Select>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {editing ? 'Save changes' : 'Add transaction'}
        </Button>
      </div>
    </form>
  );
}
