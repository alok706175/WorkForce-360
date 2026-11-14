import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Lock, Mail, User, Briefcase, Building, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const AuthPage = () => {
  const { login, register, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [fullName, setFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [department, setDepartment] = useState('Engineering');
  const [designation, setDesignation] = useState('Software Engineer');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(loginEmail, loginPassword);
    if (!result.success) {
      setError(result.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    const result = await register({
      fullName,
      email: registerEmail,
      password: registerPassword,
      role,
      department,
      designation,
    });
    if (!result.success) {
      setError(result.message);
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-200/20">
        
        {/* Left Side: Brand & Value Highlights */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-600 via-brand-600 to-purple-700 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center text-white shadow-inner">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-2xl tracking-tight">WorkForce</span>
                <span className="text-indigo-200 font-black text-2xl ml-1">360</span>
              </div>
            </div>

            <h1 className="mt-8 text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              Enterprise Leave Management & Attendance Tracker
            </h1>
            <p className="mt-3 text-indigo-100/90 text-sm leading-relaxed">
              Streamline employee check-ins, automated leave accrual, instant manager approval workflows, and centralized attendance analytics.
            </p>

            <div className="mt-8 space-y-3.5">
              <div className="flex items-center gap-3 text-sm text-indigo-50">
                <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                <span>Automated leave balance deduction on approval</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-indigo-50">
                <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                <span>Duplicate-proof daily attendance logs</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-indigo-50">
                <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                <span>Spring Security 6 + Stateless JWT Auth</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-indigo-50">
                <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                <span>Role-based access: Manager & Employee portals</span>
              </div>
            </div>
          </div>

          {/* Secure Platform Badge */}
          <div className="mt-10 pt-6 border-t border-white/15 relative z-10 flex items-center justify-between text-xs text-indigo-200">
            <span>Enterprise Edition v1.0</span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              System Operational
            </span>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
          
          {/* Header Title based on active mode */}
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {isLogin ? 'Sign In to Your Account' : 'Register New User'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isLogin 
                ? 'Enter your work credentials to access your dashboard' 
                : 'Create a new account for Employee or Manager access'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
              <div>
                <p className="font-semibold">Authentication Error</p>
                <p className="text-xs text-rose-600 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {isLogin ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. manager@workforce360.com"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-slate-900 transition"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-200 transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Option to open Register window */}
              <div className="text-center pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsLogin(false); setError(''); setFieldErrors({}); }}
                    className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition"
                  >
                    Register New User
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Miller"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                    />
                  </div>
                  {fieldErrors.fullName && <p className="text-xs text-rose-500 mt-1">{fieldErrors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Role
                  </label>
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900 bg-white"
                    >
                      <option value="EMPLOYEE">Employee (ROLE_EMPLOYEE)</option>
                      <option value="MANAGER">Manager / Admin (ROLE_MANAGER)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="john.miller@workforce360.com"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                  />
                </div>
                {fieldErrors.email && <p className="text-xs text-rose-500 mt-1">{fieldErrors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                  />
                </div>
                {fieldErrors.password && <p className="text-xs text-rose-500 mt-1">{fieldErrors.password}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Department
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Engineering"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Designation
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Frontend Dev"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-200 transition flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? 'Registering...' : 'Create Account & Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Option to return to Sign In window */}
              <div className="text-center pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setIsLogin(true); setError(''); setFieldErrors({}); }}
                    className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition"
                  >
                    Sign In to Your Account
                  </button>
                </p>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};

