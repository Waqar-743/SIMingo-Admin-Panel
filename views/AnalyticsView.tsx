import React, { useEffect, useMemo, useState } from 'react';
import { AdminTransaction, AdminUser } from '../types';
import { subscribeTransactions, subscribeUsers } from '../services/adminService';

const AnalyticsView: React.FC = () => {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    const unsubUsers = subscribeUsers(
      (rows) => setUsers(rows),
      () => setError('Failed to load users for transaction mapping.')
    );

    const unsubTransactions = subscribeTransactions(
      (rows) => {
        setTransactions(rows);
        setLoading(false);
      },
      () => {
        setError('Failed to load transactions list.');
        setLoading(false);
      }
    );

    return () => {
      unsubUsers();
      unsubTransactions();
    };
  }, []);

  const userEmailMap = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach((u) => {
      map.set(u.id, u.email);
      map.set(u.uid, u.email);
    });
    return map;
  }, [users]);

  const enrichedTransactions = useMemo(() => {
    return transactions.map((row) => ({
      ...row,
      userEmail: row.userEmail || userEmailMap.get(row.userId) || row.userId || '-',
    }));
  }, [transactions, userEmailMap]);

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return enrichedTransactions;

    return enrichedTransactions.filter((row) =>
      row.userEmail.toLowerCase().includes(query) ||
      row.amountSpent.toLowerCase().includes(query) ||
      String(row.tokensAdded).includes(query) ||
      row.date.toLowerCase().includes(query)
    );
  }, [enrichedTransactions, search]);

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 animate-in slide-in-from-bottom-2 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Payment & Transaction Status</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-base">
          Live list view from Firestore purchase records. This panel shows user email, amount spent, tokens added, and transaction date.
        </p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none"
            placeholder="Search by user email, amount, tokens, or date..."
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm glass-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">User Email</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Amount Spent</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tokens Added</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Date</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {!loading && filteredRows.length === 0 && (
                <tr>
                  <td className="px-6 py-8 text-center text-slate-400" colSpan={5}>
                    No transactions found.
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td className="px-6 py-8 text-center text-slate-400" colSpan={5}>
                    Loading transactions...
                  </td>
                </tr>
              )}

              {filteredRows.map((row) => (
                <tr key={`${row.source}-${row.id}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">{row.userEmail}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-200">{row.amountSpent}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400">{row.tokensAdded}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{row.date}</td>
                  <td className="px-6 py-4 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">{row.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {error && (
        <div className="mt-4 text-sm text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}
    </main>
  );
};

export default AnalyticsView;
