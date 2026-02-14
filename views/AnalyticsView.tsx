
import React from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const chartData = [
  { name: 'JAN', value: 80, returns: 40 },
  { name: 'FEB', value: 60, returns: 35 },
  { name: 'MAR', value: 70, returns: 50 },
  { name: 'APR', value: 45, returns: 30 },
  { name: 'MAY', value: 85, returns: 45 },
  { name: 'JUN', value: 75, returns: 40 },
];

const securityLogs = [
  { action: 'Permissions Updated', target: 'user-492@example.com', time: '2 mins ago', status: 'SUCCESS' },
  { action: '2FA Disabled', target: 'm.stone@corporate.io', time: '14 mins ago', status: 'WARNING' },
  { action: 'SSH Login Attempt', target: 'api-gate-01', time: '45 mins ago', status: 'SUCCESS' },
];

const AnalyticsView: React.FC = () => {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel subtle-glow p-6 rounded-xl flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="size-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">payments</span>
            </div>
            <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              +12.5%
            </span>
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Total Revenue</p>
            <h2 className="text-3xl font-bold text-white mt-1">$128,430.00</h2>
          </div>
        </div>
        <div className="glass-panel subtle-glow p-6 rounded-xl flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="size-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
              <span className="material-symbols-outlined text-2xl">person_add</span>
            </div>
            <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              +8.2%
            </span>
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">New Sign-ups</p>
            <h2 className="text-3xl font-bold text-white mt-1">2,842</h2>
          </div>
        </div>
        <div className="glass-panel subtle-glow p-6 rounded-xl flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="size-12 rounded-lg bg-blue-400/10 border border-blue-400/20 flex items-center justify-center text-blue-400">
              <span className="material-symbols-outlined text-2xl">bolt</span>
            </div>
            <span className="text-rose-400 text-xs font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">trending_down</span>
              -2.4%
            </span>
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Active Sessions</p>
            <h2 className="text-3xl font-bold text-white mt-1">1,120</h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">User Growth Over Time</h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="size-2 rounded-full bg-primary"></span>
                New Users
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="size-2 rounded-full bg-slate-600"></span>
                Returns
              </div>
            </div>
          </div>
          <div className="h-64 relative w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2b6cee" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2b6cee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} dy={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="value" stroke="#2b6cee" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscription Split */}
        <div className="glass-panel p-6 rounded-xl space-y-6">
          <h3 className="text-lg font-bold text-white">Subscription Split</h3>
          <div className="flex-1 flex flex-col justify-end space-y-8 py-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Active (Pro)</span>
                <span className="text-white font-bold">64%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '64%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">No Plan (Free)</span>
                <span className="text-white font-bold">28%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-slate-500 rounded-full transition-all duration-1000" style={{ width: '28%' }}></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Trialing</span>
                <span className="text-white font-bold">8%</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full transition-all duration-1000" style={{ width: '8%' }}></div>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">Total Subscribers: 4,129</span>
            <button className="text-xs font-bold text-primary hover:underline">Details</button>
          </div>
        </div>
      </div>

      {/* Security Logs Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-white">Security Log Highlights</h3>
          <button className="text-xs font-bold text-primary hover:underline">View Full Audit Log</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900/30 text-slate-400 text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Admin Action</th>
                <th className="px-6 py-4">Target Account</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {securityLogs.map((log, i) => (
                <tr key={i} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4 text-white">{log.action}</td>
                  <td className="px-6 py-4 text-slate-400">{log.target}</td>
                  <td className="px-6 py-4 text-slate-500">{log.time}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${
                      log.status === 'SUCCESS' 
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
