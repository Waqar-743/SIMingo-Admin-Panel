
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import LoginView from './views/LoginView';
import AnalyticsView from './views/AnalyticsView';
import UserManagementView from './views/UserManagementView';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { auth } from './services/firebase';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAdminUser(null);
        setIsAuthenticated(false);
        setIsCheckingAuth(false);
        return;
      }

      try {
        const tokenResult = await user.getIdTokenResult(true);
        const hasAdminClaim = tokenResult.claims.admin === true;

        if (!hasAdminClaim) {
          await auth.signOut();
          setAdminUser(null);
          setIsAuthenticated(false);
          setIsCheckingAuth(false);
          return;
        }

        setAdminUser(user);
        setIsAuthenticated(true);
      } catch {
        await auth.signOut();
        setAdminUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate('/analytics');
  };

  const handleLogout = async () => {
    await auth.signOut();
    setAdminUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background-dark text-slate-100 flex items-center justify-center">
        <div className="text-sm text-slate-400">Checking secure admin session...</div>
      </div>
    );
  }

  if (!isAuthenticated && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  if (isAuthenticated && location.pathname === '/login') {
    return <Navigate to="/analytics" replace />;
  }

  return (
    <div className="min-h-screen bg-background-dark text-slate-100 flex font-sans overflow-hidden">
      {isAuthenticated && <Sidebar onLogout={handleLogout} currentUser={adminUser} />}
      
      <div className="flex-1 flex flex-col overflow-y-auto bg-[#0a0e17] relative">
        {isAuthenticated && <Header />}
        
        <Routes>
          <Route path="/login" element={<LoginView onLogin={handleLogin} />} />
          <Route path="/analytics" element={<AnalyticsView />} />
          <Route path="/users" element={<UserManagementView />} />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/analytics" : "/login"} replace />} />
        </Routes>

        {isAuthenticated && (
          <>
            <div className="fixed top-0 right-0 -mt-24 -mr-24 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="fixed bottom-0 left-64 -mb-24 -ml-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
