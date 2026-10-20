import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { api } from '../../api/axios.js';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';
import { getErrorMessage, monthLabel } from '../../utils/format.js';

const schema = z.object({
  category: z.string().min(1, 'Choose a category'),
  limit: z.coerce.number({ invalid_type_error: 'Enter an amount' }).min(1, 'Limit must be at least 1'),
});

export default function BudgetForm({ categories, month, budget, onSaved, onCancel }) {
  const editing = Boolean(budget);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { category: budget?.category._id ?? '', limit: budget?.limit ?? '' },
  });

  async function onSubmit(values) {
    try {
      if (editing) {
        await api.put(`/budgets/${budget.id}`, { limit: values.limit });
      } else {
        // POST is an "upsert": it creates the budget, or updates it if one already exists
        await api.post('/budgets', { category: values.category, month, limit: values.limit });
      }
      toast.success(editing ? 'Budget updated' : 'Budget saved');
      onSaved();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Budget for <span className="font-medium text-slate-900 dark:text-slate-100">{monthLabel(month, { month: 'long', year: 'numeric' })}</span>
      </p>

      <Select label="Category" error={errors.category?.message} disabled={editing} {...register('category')}>
        <option value="">Select a category</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </Select>

      <Input
        label="Monthly limit"
        type="number"
        step="1"
        min="1"
        inputMode="numeric"
        placeholder="5000"
        error={errors.limit?.message}
        {...register('limit')}
      />

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {editing ? 'Save changes' : 'Save budget'}
        </Button>
      </div>
    </form>
  );
}
