import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Wallet } from 'lucide-react';
import Sidebar from './Sidebar.jsx';

export default function AppLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:pl-64">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* Top bar, mobile only */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-900/90">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Menu size={22} />
        </button>
        <span className="flex items-center gap-2 font-semibold">
          <Wallet size={18} className="text-indigo-600" /> Spendly
        </span>
      </header>

      <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
