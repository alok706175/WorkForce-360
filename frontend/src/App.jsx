import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AuthPage } from './pages/AuthPage';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { ManagerDashboard } from './pages/ManagerDashboard';

export const App = () => {
  const { isAuthenticated, isManager } = useAuth();
  const [managerTab, setManagerTab] = useState('manager'); // 'manager' | 'personal'

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation */}
      <Navbar activeTab={managerTab} onTabChange={setManagerTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isManager ? (
          managerTab === 'manager' ? (
            <ManagerDashboard />
          ) : (
            <EmployeeDashboard />
          )
        ) : (
          <EmployeeDashboard />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} WorkForce 360 Inc. All rights reserved.</p>
          <p className="text-slate-400">
            Engineered with Spring Boot 3.x, Hibernate, MySQL & React (Vite + Tailwind CSS)
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;

