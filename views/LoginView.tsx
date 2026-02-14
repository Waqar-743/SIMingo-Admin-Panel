
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

interface LoginViewProps {
  onLogin: () => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const tokenResult = await credential.user.getIdTokenResult(true);

      if (tokenResult.claims.admin !== true) {
        await auth.signOut();
        setError('Access denied. This account is not an admin.');
        return;
      }

      onLogin();
    } catch {
      setError('Invalid credentials or permission denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md z-10">
        <div className="glass-panel subtle-glow rounded-xl p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Secure Login</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Access the management suite with your admin credentials.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1" htmlFor="email">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-xl">mail</span>
                </div>
                <input 
                  className="w-full pl-11 pr-4 py-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161b26] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base" 
                  id="email" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">Password</label>
                <a className="text-xs font-semibold text-primary hover:underline" href="#">Forgot password?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <span className="material-symbols-outlined text-xl">lock</span>
                </div>
                <input 
                  className="w-full pl-11 pr-12 py-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161b26] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base" 
                  id="password" 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input 
                className="w-4 h-4 text-primary bg-slate-100 border-slate-300 rounded focus:ring-primary dark:focus:ring-offset-slate-900 dark:bg-slate-700 dark:border-slate-600" 
                id="remember" 
                type="checkbox" 
              />
              <label className="ml-2 text-sm text-slate-600 dark:text-slate-400" htmlFor="remember">Remember this device for 30 days</label>
            </div>

            {error && (
              <div className="text-sm text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2" 
              type="submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Access Dashboard'}
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <span className="material-symbols-outlined text-green-500 text-sm">verified_user</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">256-bit Encrypted Session</span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>© 2024 Admin Management Systems. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <a className="hover:text-primary transition-colors" href="#">Security</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
