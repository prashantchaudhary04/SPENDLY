export function formatCurrency(amount, currency = 'INR') {
  return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount ?? 0);
}

export function formatCompact(n) {
  return new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

// Dates are stored in UTC, so we display them in UTC too (no off-by-one-day surprises)
export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export const toInputDate = (d) => new Date(d).toISOString().slice(0, 10); // for <input type="date">
export const todayInput = () => new Date().toISOString().slice(0, 10);
export const currentMonth = () => new Date().toISOString().slice(0, 7); // "2026-10"

export function monthLabel(month, options = { month: 'short', year: 'numeric' }) {
  const [y, m] = month.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString('en-US', { ...options, timeZone: 'UTC' });
}

// Turns an Axios error into a message we can show the user
export function getErrorMessage(err, fallback = 'Something went wrong') {
  const data = err?.response?.data;
  if (data?.errors?.length) return data.errors.map((e) => e.message).join('. ');
  if (data?.message) return data.message;
  if (err?.request && !err.response) return 'Cannot reach the server';
  return fallback;
}
