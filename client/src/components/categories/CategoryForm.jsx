import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { api } from '../../api/axios.js';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import { ICONS } from '../ui/CategoryIcon.jsx';
import { getErrorMessage } from '../../utils/format.js';

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(40, 'Max 40 characters'),
  type: z.enum(['expense', 'income']),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Pick a color'),
  icon: z.string().min(1),
});

export default function CategoryForm({ category, onSaved, onCancel }) {
  const editing = Boolean(category);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: category?.name ?? '',
      type: category?.type ?? 'expense',
      color: category?.color ?? '#6366f1',
      icon: category?.icon ?? 'tag',
    },
  });

  const type = watch('type');
  const icon = watch('icon');

  async function onSubmit(values) {
    try {
      if (editing) {
        // The backend doesn't allow changing the type, so we only send the editable fields
        const { name, color, icon } = values;
        await api.put(`/categories/${category._id}`, { name, color, icon });
      } else {
        await api.post('/categories', values);
      }
      toast.success(editing ? 'Category updated' : 'Category created');
      onSaved();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Input label="Name" placeholder="e.g. Groceries" error={errors.name?.message} {...register('name')} />

      <div>
        <span className="field-label">Type</span>
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {['expense', 'income'].map((t) => (
            <button
              key={t}
              type="button"
              disabled={editing}
              onClick={() => setValue('type', t)}
              className={`rounded-md py-1.5 text-sm font-medium capitalize transition disabled:cursor-not-allowed ${
                type === t
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {editing && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Type can't be changed after creation.</p>}
      </div>

      <div>
        <label htmlFor="cat-color" className="field-label">
          Color
        </label>
        <input
          id="cat-color"
          type="color"
          className="h-10 w-20 cursor-pointer rounded-lg border border-slate-300 bg-white p-1 dark:border-slate-700 dark:bg-slate-900"
          {...register('color')}
        />
      </div>

      <div>
        <span className="field-label">Icon</span>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
          {Object.entries(ICONS).map(([name, Icon]) => (
            <button
              key={name}
              type="button"
              aria-label={name}
              aria-pressed={icon === name}
              onClick={() => setValue('icon', name)}
              className={`flex h-10 items-center justify-center rounded-lg border transition ${
                icon === name
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {editing ? 'Save changes' : 'Create category'}
        </Button>
      </div>
    </form>
  );
}
