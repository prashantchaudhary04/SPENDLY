import { Search, X } from 'lucide-react';
import Input from '../ui/Input.jsx';
import Select from '../ui/Select.jsx';
import Button from '../ui/Button.jsx';

export default function TransactionFilters({ filters, categories, onChange, onClear, hasFilters }) {
  return (
    <div className="card mb-4 p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative sm:col-span-2 lg:col-span-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-[34px] text-slate-400" />
          <Input
            label="Search notes"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="[&_input]:pl-9"
          />
        </div>

        <Select label="Type" value={filters.type} onChange={(e) => onChange({ type: e.target.value })}>
          <option value="">All</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </Select>

        <Select label="Category" value={filters.category} onChange={(e) => onChange({ category: e.target.value })}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </Select>

        <Input label="From" type="date" value={filters.from} onChange={(e) => onChange({ from: e.target.value })} />
        <Input label="To" type="date" value={filters.to} onChange={(e) => onChange({ to: e.target.value })} />
      </div>

      {hasFilters && (
        <div className="mt-3">
          <Button variant="ghost" onClick={onClear} className="!px-2 !py-1 text-xs">
            <X size={14} /> Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
