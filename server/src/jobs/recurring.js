import cron from 'node-cron';
import { Transaction } from '../models/Transaction.js';
import { addInterval } from '../utils/dates.js';

// Finds recurring templates that are due and creates a real transaction for each missed date.
// If the server was off for 3 days, a daily template produces 3 copies when it comes back.
export async function processRecurring(now = new Date()) {
  const templates = await Transaction.find({
    isRecurring: true,
    'recurrence.nextDate': { $lte: now },
  });

  let created = 0;

  for (const template of templates) {
    const copies = [];
    let next = template.recurrence.nextDate;
    let guard = 0; // safety net so a bad date can never loop forever

    while (next <= now && guard++ < 366) {
      copies.push({
        user: template.user,
        category: template.category,
        type: template.type,
        amount: template.amount,
        note: template.note,
        date: next,
        recurringSource: template._id,
      });
      next = addInterval(next, template.recurrence.frequency);
    }

    if (copies.length) await Transaction.insertMany(copies);

    template.recurrence.nextDate = next;
    await template.save();
    created += copies.length;
  }

  return created;
}

async function run() {
  try {
    const count = await processRecurring();
    console.log(`Recurring job: created ${count} transaction(s)`);
  } catch (err) {
    console.error('Recurring job failed:', err);
  }
}

export function startRecurringJob() {
  run(); // catch up immediately on startup
  cron.schedule('5 0 * * *', run); // then every day at 00:05
}
