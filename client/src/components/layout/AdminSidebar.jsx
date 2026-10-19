import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BedDouble,
  Users,
  CalendarCheck,
  Building2,
  FileText,
  LogOut,
  Activity,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

export const AdminSidebar = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Live Bed & Status', path: '/admin/dashboard', icon: BedDouble },
    { label: 'Manage Doctors & OPD', path: '/admin/doctors', icon: Users },
    { label: 'Appointment Queue', path: '/admin/appointments', icon: CalendarCheck },
    { label: 'Hospital Profile', path: '/admin/profile', icon: Building2 },
    { label: 'Activity Log', path: '/admin/audit-log', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-white flex flex-col min-h-screen shrink-0">
      {/* Brand & Hospital Banner */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight leading-tight">MEDIVANTA</h1>
            <span className="text-[10px] text-teal-400 font-medium uppercase tracking-wider">Hospital Staff Portal</span>
          </div>
        </div>
        <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
          <p className="text-xs text-slate-400">Managing Facility</p>
          <p className="text-sm font-semibold text-white truncate">{admin?.hospitalName || 'Hospital Admin'}</p>
          <p className="text-[11px] text-teal-400 truncate">{admin?.email}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Public Site
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out of Staff Portal
        </button>
      </div>
    </aside>
  );
};
