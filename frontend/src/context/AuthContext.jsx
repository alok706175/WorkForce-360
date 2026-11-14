import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);

  // Keep local storage synchronized
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const authData = response.data.data;
      
      setToken(authData.token);
      const userData = {
        id: authData.id,
        fullName: authData.fullName,
        email: authData.email,
        role: authData.role,
        department: authData.department,
        designation: authData.designation,
        availableLeaveDays: authData.availableLeaveDays,
      };
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/register', formData);
      const authData = response.data.data;

      setToken(authData.token);
      const userData = {
        id: authData.id,
        fullName: authData.fullName,
        email: authData.email,
        role: authData.role,
        department: authData.department,
        designation: authData.designation,
        availableLeaveDays: authData.availableLeaveDays,
      };
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      const fieldErrors = err.response?.data?.fieldErrors || null;
      return { success: false, message, fieldErrors };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const response = await api.get('/api/employees/me');
      const updated = response.data.data;
      setUser(prev => ({
        ...prev,
        fullName: updated.fullName,
        department: updated.department,
        designation: updated.designation,
        availableLeaveDays: updated.availableLeaveDays,
      }));
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const updateLeaveBalance = (newBalance) => {
    setUser(prev => prev ? { ...prev, availableLeaveDays: newBalance } : prev);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      refreshProfile,
      updateLeaveBalance,
      isAuthenticated: !!token && !!user,
      isManager: user?.role === 'MANAGER',
      isEmployee: user?.role === 'EMPLOYEE'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

