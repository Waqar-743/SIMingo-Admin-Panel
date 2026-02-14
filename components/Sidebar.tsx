
import React from 'react';
import { NavLink } from 'react-router-dom';
import { User } from 'firebase/auth';

interface SidebarProps {
  onLogout: () => void;
  currentUser: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, currentUser }) => {
  const navItems = [
    { label: 'Users', path: '/users', icon: 'group' },
    { label: 'Analytics', path: '/analytics', icon: 'analytics' },
    { label: 'Access Control', path: '/access', icon: 'security' },
    { label: 'Settings', path: '/settings', icon: 'settings' },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-background-dark flex flex-col z-20 shrink-0 h-screen">
      <div className="p-6 flex items-center gap-3 text-primary">
        <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20">
          <span className="material-symbols-outlined text-primary text-2xl">shield_person</span>
        </div>
        <span className="text-xl font-bold tracking-tight text-white">SIMingo Admin</span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-2 bg-slate-900/50 rounded-xl border border-slate-800">
          <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">account_circle</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{currentUser?.displayName ?? 'Super Admin'}</p>
            <p className="text-xs text-slate-500 truncate">{currentUser?.email ?? 'admin@simingo.io'}</p>
          </div>
          <button 
            onClick={onLogout}
            className="text-slate-500 hover:text-red-400 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
