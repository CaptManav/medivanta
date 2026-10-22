import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api.js';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('medivanta_token'));
  const [role, setRole] = useState(localStorage.getItem('medivanta_role'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('medivanta_token');
      const storedRole = localStorage.getItem('medivanta_role');
      const storedUser = localStorage.getItem('medivanta_user');

      if (storedToken && storedUser) {
        const parsed = JSON.parse(storedUser);
        setToken(storedToken);
        setRole(storedRole);
        if (storedRole === 'hospital_admin') {
          setAdmin(parsed);
        } else {
          setUser(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to parse cached auth state:', err);
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, accessToken } = res.data.data;
    setUser(userData);
    setAdmin(null);
    setToken(accessToken);
    setRole(userData.role);

    localStorage.setItem('medivanta_token', accessToken);
    localStorage.setItem('medivanta_role', userData.role);
    localStorage.setItem('medivanta_user', JSON.stringify(userData));
    return userData;
  };

  const adminLogin = async (hospitalId, email, password) => {
    const res = await api.post('/auth/admin/login', { hospitalId, email, password });
    const { admin: adminData, accessToken } = res.data.data;
    setAdmin(adminData);
    setUser(null);
    setToken(accessToken);
    setRole('hospital_admin');

    localStorage.setItem('medivanta_token', accessToken);
    localStorage.setItem('medivanta_role', 'hospital_admin');
    localStorage.setItem('medivanta_user', JSON.stringify(adminData));
    return adminData;
  };

  const signup = async (payload) => {
    const res = await api.post('/auth/signup', payload);
    const { user: userData, accessToken } = res.data.data;
    setUser(userData);
    setAdmin(null);
    setToken(accessToken);
    setRole(userData.role);

    localStorage.setItem('medivanta_token', accessToken);
    localStorage.setItem('medivanta_role', userData.role);
    localStorage.setItem('medivanta_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    setAdmin(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem('medivanta_token');
    localStorage.removeItem('medivanta_role');
    localStorage.removeItem('medivanta_user');
  };

  const switchHospital = (hospitalId) => {
    const isAwari = hospitalId === 'a1b2c3d4-e5f6-7890-abcd-111111111111';
    const newAdmin = {
      ...(admin || {}),
      hospitalId,
      hospitalName: isAwari ? 'Dr. Awari Hospital' : 'Samarth Ayurved College Hospital & Research Centre',
      email: isAwari ? 'awari@medivanta.in' : 'samarth@medivanta.in',
      role: 'hospital_admin',
    };
    setAdmin(newAdmin);
    setRole('hospital_admin');
    localStorage.setItem('medivanta_role', 'hospital_admin');
    localStorage.setItem('medivanta_user', JSON.stringify(newAdmin));
    return newAdmin;
  };

  const value = {
    user,
    admin,
    token,
    role,
    loading,
    isAuthenticated: !!token,
    login,
    adminLogin,
    signup,
    logout,
    switchHospital,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
