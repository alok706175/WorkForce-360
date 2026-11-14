import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, LogOut, Shield, User, Briefcase, Calendar } from 'lucide-react';

export const Navbar = ({ activeTab, onTabChange }) => {
  const { user, logout, isManager } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-brand-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">WorkForce</span>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-extrabold text-lg">360</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium -mt-1 hidden sm:block">
                Leave & Attendance Management System
              </p>
            </div>
          </div>

          {/* Manager View Switcher Tabs (if Manager) */}
          {isManager && onTabChange && (
            <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => onTabChange('manager')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'manager'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Manager Portal
              </button>
              <button
                onClick={() => onTabChange('personal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'personal'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                My Leaves & Attendance
              </button>
            </div>
          )}

          {/* User Profile Pill & Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-800 leading-tight">
                {user?.fullName}
              </span>
              <div className="flex items-center justify-end gap-1.5 text-xs text-slate-500">
                <Briefcase className="w-3 h-3 text-slate-400" />
                <span>{user?.designation || user?.department || 'Employee'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border ${
                isManager
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}>
                {user?.role}
              </span>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};

