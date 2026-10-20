// All dates are handled in UTC so results are the same on every server.

export const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export function currentMonth() {
  return new Date().toISOString().slice(0, 7); // "2026-10"
}

// "2026-10" -> { start: 1 Oct 00:00, end: 1 Nov 00:00 }  (end is exclusive)
export function monthRange(month) {
  const [year, m] = month.split('-').map(Number);
  return {
    start: new Date(Date.UTC(year, m - 1, 1)),
    end: new Date(Date.UTC(year, m, 1)),
  };
}

// Used by recurring transactions to find the next occurrence
export function addInterval(date, frequency) {
  const d = new Date(date);

  if (frequency === 'daily') {
    d.setUTCDate(d.getUTCDate() + 1);
  } else if (frequency === 'weekly') {
    d.setUTCDate(d.getUTCDate() + 7);
  } else {
    // monthly: Jan 31 + 1 month -> Feb 28 (clamped to the last day of the month)
    const day = d.getUTCDate();
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() + 1);
    const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
    d.setUTCDate(Math.min(day, lastDay));
  }
  return d;
}

export const round2 = (n) => Math.round(n * 100) / 100;
