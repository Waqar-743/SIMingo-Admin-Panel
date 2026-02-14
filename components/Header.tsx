
import React from 'react';
import { useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const location = useLocation();
  
  const getTitle = () => {
    switch (location.pathname) {
      case '/analytics': return 'Analytics Overview';
      case '/users': return 'User Management';
      default: return 'Dashboard';
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 bg-[#0a0e17]/80 backdrop-blur-md z-10">
      <div>
        <h1 className="text-xl font-bold text-white">{getTitle()}</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700">
          <button className="px-4 py-1.5 text-xs font-semibold rounded-md bg-primary text-white transition-all">Last 30 Days</button>
          <button className="px-4 py-1.5 text-xs font-semibold rounded-md text-slate-400 hover:text-white transition-all">Last Year</button>
        </div>
        <button className="p-2 text-slate-400 hover:text-white border border-slate-700 rounded-lg transition-all">
          <span className="material-symbols-outlined">download</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
