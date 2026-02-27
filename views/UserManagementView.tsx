
import React, { useEffect, useMemo, useState } from 'react';
import { AdminUser, SubscriptionStatus } from '../types';
import { banUser, deleteUserDoc, subscribeUsers, unbanUser } from '../services/adminService';

const UserManagementView: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionUserId, setActionUserId] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    const unsubscribe = subscribeUsers(
      (rows) => {
        setUsers(rows);
        setLoading(false);
      },
      () => {
        setError('Failed to load users. Check Firebase rules and admin claim.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.email.toLowerCase().includes(search.toLowerCase()) ||
          user.rawStatus.toLowerCase().includes(search.toLowerCase())
      ),
    [users, search]
  );

  const activePlans = useMemo(
    () => users.filter((u) => u.paymentStatus === 'active').length,
    [users]
  );

  const bannedAccounts = useMemo(
    () => users.filter((u) => u.status === SubscriptionStatus.BANNED).length,
    [users]
  );

  const toggleBan = async (user: AdminUser) => {
    setActionUserId(user.id);
    setError('');

    try {
      if (user.status === SubscriptionStatus.BANNED) {
        await unbanUser(user.id);
      } else {
        await banUser(user.id);
      }
    } catch {
      setError('Failed to update user status.');
    } finally {
      setActionUserId('');
    }
  };

  const deleteUser = async (user: AdminUser) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setActionUserId(user.id);
      setError('');

      try {
        await deleteUserDoc(user.id);
      } catch {
        setError('Delete failed. Firestore rules may block this action.');
      } finally {
        setActionUserId('');
      }
    }
  };

  const getStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case SubscriptionStatus.ACTIVE:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Active
          </span>
        );
      case SubscriptionStatus.BANNED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
            Banned
          </span>
        );
      case SubscriptionStatus.TRIALING:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
            Trialing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
            No Plan
          </span>
        );
    }
  };

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8 animate-in slide-in-from-bottom-2 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">User Management</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-base">Manage your global user base, control access levels, and monitor subscription health from a centralized control plane.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-6 rounded-xl flex items-center gap-5 glass-panel">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">group</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Users</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{users.length}</p>
          </div>
          <div className="ml-auto flex items-center gap-1 text-emerald-500 font-bold text-sm">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            5.2%
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-6 rounded-xl flex items-center gap-5 glass-panel">
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <span className="material-symbols-outlined">payments</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Plans</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{activePlans}</p>
          </div>
          <div className="ml-auto flex items-center gap-1 text-emerald-500 font-bold text-sm">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            1.4%
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-6 rounded-xl flex items-center gap-5 glass-panel">
          <div className="h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
            <span className="material-symbols-outlined">block</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Banned Accounts</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{bannedAccounts}</p>
          </div>
          <div className="ml-auto flex items-center gap-1 text-rose-500 font-bold text-sm">
            <span className="material-symbols-outlined text-sm">trending_down</span>
            0.8%
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input 
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none" 
            placeholder="Search users by name, email, or status..." 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-lg">filter_list</span>
            Filter
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <span className="material-symbols-outlined text-lg">download</span>
            Export
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm glass-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">User Info</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Subscription Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Payment</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Balance</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Current Virtual Number</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {!loading && filteredUsers.length === 0 && (
                <tr>
                  <td className="px-6 py-8 text-center text-slate-400" colSpan={6}>
                    No users found.
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td className="px-6 py-8 text-center text-slate-400" colSpan={6}>
                    Loading users...
                  </td>
                </tr>
              )}

              {filteredUsers.map((user) => (
                <tr 
                  key={user.id} 
                  className={`transition-colors group ${user.status === SubscriptionStatus.BANNED ? 'opacity-50 grayscale-[0.5] bg-slate-100/10' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20">
                        {user.avatar ? (
                          <img alt={user.name} className="h-full w-full object-cover" src={user.avatar} />
                        ) : (
                          <span className="material-symbols-outlined">person</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                      user.paymentStatus === 'active'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                    }`}>
                      {user.paymentStatus === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                    {user.balance}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300 font-mono">
                    {user.currentNumber || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3">
                      <button 
                        onClick={() => deleteUser(user)}
                        disabled={actionUserId === user.id}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all" 
                        title="Delete User"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                      <button 
                        onClick={() => toggleBan(user)}
                        disabled={actionUserId === user.id}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all border ${
                          user.status === SubscriptionStatus.BANNED 
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white border-transparent'
                          : 'text-primary hover:bg-primary/10 border-primary/20'
                        }`}
                      >
                        {user.status === SubscriptionStatus.BANNED ? 'Unban' : 'Ban User'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Showing 1 to {filteredUsers.length} of {users.length} results</p>
          <div className="flex items-center gap-2">
            <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-all disabled:opacity-30" disabled>
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <div className="flex items-center">
              <button className="px-3 py-1 rounded-md bg-primary text-white text-xs font-bold">1</button>
            </div>
            <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-all">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
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

export default UserManagementView;
