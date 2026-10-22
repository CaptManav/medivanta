import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Activity,
  Phone,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  ShieldAlert,
  LayoutDashboard,
  Camera,
  Building2,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { Button } from '../ui/Button.jsx';
import { AWARI_ID, SAMARTH_ID } from '../../services/mockData.js';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [signInDropdownOpen, setSignInDropdownOpen] = useState(false);
  const { user, admin, role, isAuthenticated, logout, login, adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const handleQuickLogin = async (targetRole, hospitalId = null) => {
    try {
      setSignInDropdownOpen(false);
      setMobileMenuOpen(false);
      if (targetRole === 'awari') {
        await adminLogin(AWARI_ID, 'awari@medivanta.in', 'admin123');
        navigate('/admin/dashboard');
      } else if (targetRole === 'samarth') {
        await adminLogin(SAMARTH_ID, 'samarth@medivanta.in', 'admin123');
        navigate('/admin/dashboard');
      } else {
        await login('patient@demo.com', 'patient123');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Quick login failed:', err);
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Find Hospital', path: '/hospitals' },
    { label: 'Doctors & OPD', path: '/doctors' },
    { label: 'Live Beds', path: '/beds' },
    { label: 'Photos & Gallery', path: '/photos' },
    { label: 'Emergency', path: '/emergency' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Emergency Strip on Top */}
      <div className="bg-rose-700 px-4 py-1.5 text-xs text-white font-medium flex items-center justify-between">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 animate-pulse text-rose-200" />
            <span>
              Emergency Ambulance & Police Helpline: <strong>108</strong> / <strong>112</strong>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="tel:108"
              className="inline-flex items-center gap-1.5 bg-rose-800 hover:bg-rose-900 text-white px-2.5 py-0.5 rounded text-xs transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span>Call 108</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-900/40 group-hover:bg-teal-500 transition-colors">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">MEDIVANTA</span>
              <span className="hidden sm:inline-block ml-2 text-xs text-teal-400 font-medium px-1.5 py-0.5 rounded bg-teal-950/60 border border-teal-800/40">
                LIVE
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-teal-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Action / Auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {role === 'hospital_admin' && (
                  <Link to="/admin/dashboard">
                    <Button variant="primary" size="sm" className="bg-teal-600 hover:bg-teal-500">
                      <LayoutDashboard className="w-3.5 h-3.5 mr-1.5" /> Admin Panel
                    </Button>
                  </Link>
                )}

                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800 transition-colors border border-slate-700"
                  >
                    <User className="w-4 h-4 text-teal-400" />
                    <span className="max-w-[130px] truncate">
                      {admin ? admin.hospitalName || 'Admin' : user?.name || 'Account'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 rounded-xl bg-white text-slate-800 shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm font-semibold truncate text-slate-700">
                          {user?.email || admin?.email}
                        </p>
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                          {role === 'hospital_admin' ? 'Hospital Staff Admin' : 'Patient'}
                        </span>
                      </div>

                      {role === 'hospital_admin' ? (
                        <>
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <LayoutDashboard className="w-4 h-4 text-teal-600" />
                            Live Bed & OPD Control
                          </Link>
                          <Link
                            to="/admin/doctors"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <User className="w-4 h-4 text-teal-600" />
                            Manage Doctors
                          </Link>
                          <Link
                            to="/admin/profile"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Building2 className="w-4 h-4 text-teal-600" />
                            Hospital Profile
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/dashboard"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <User className="w-4 h-4 text-teal-600" />
                            Patient Dashboard
                          </Link>
                          <Link
                            to="/book-appointment"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Activity className="w-4 h-4 text-teal-600" />
                            Book Appointment
                          </Link>
                        </>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 border-t border-slate-100 mt-1"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Sign In As Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setSignInDropdownOpen(!signInDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-slate-800 text-teal-300 hover:bg-slate-700 hover:text-teal-200 transition-colors border border-slate-700"
                  >
                    <span>Sign In As...</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {signInDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-64 rounded-xl bg-white text-slate-800 shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95"
                      onClick={() => setSignInDropdownOpen(false)}
                    >
                      <div className="px-3.5 py-1.5 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          Select Access Portal
                        </p>
                      </div>

                      <Link
                        to="/login?tab=patient"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-900 transition-colors"
                      >
                        <User className="w-4 h-4 text-teal-600" />
                        <div>
                          <div className="font-semibold text-slate-800">I'm a Patient</div>
                          <div className="text-[11px] text-slate-500">Book appointments & check status</div>
                        </div>
                      </Link>

                      <Link
                        to="/login?tab=staff"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-900 transition-colors"
                      >
                        <Building2 className="w-4 h-4 text-teal-600" />
                        <div>
                          <div className="font-semibold text-slate-800">Hospital Staff / Admin</div>
                          <div className="text-[11px] text-slate-500">Update live beds & doctor OPD</div>
                        </div>
                      </Link>

                      <div className="px-3.5 pt-2 pb-1 border-t border-slate-100 mt-1">
                        <p className="text-[11px] font-bold text-teal-700 flex items-center gap-1">
                          <Zap className="w-3 h-3" /> Quick 1-Click Access for Demo:
                        </p>
                      </div>

                      <button
                        onClick={() => handleQuickLogin('awari')}
                        className="w-full text-left px-4 py-1.5 text-xs text-slate-600 hover:bg-teal-50 hover:text-teal-900 flex items-center justify-between"
                      >
                        <span>Dr. Awari Admin (Bota)</span>
                        <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-mono">
                          Instant
                        </span>
                      </button>

                      <button
                        onClick={() => handleQuickLogin('samarth')}
                        className="w-full text-left px-4 py-1.5 text-xs text-slate-600 hover:bg-teal-50 hover:text-teal-900 flex items-center justify-between"
                      >
                        <span>Samarth Hospital Admin</span>
                        <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-mono">
                          Instant
                        </span>
                      </button>

                      <button
                        onClick={() => handleQuickLogin('patient')}
                        className="w-full text-left px-4 py-1.5 text-xs text-slate-600 hover:bg-teal-50 hover:text-teal-900 flex items-center justify-between"
                      >
                        <span>Demo Patient Account</span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                          Instant
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                <Link to="/signup">
                  <Button variant="primary" size="sm">
                    Patient Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800 hover:text-teal-400"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={role === 'hospital_admin' ? '/admin/dashboard' : '/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-base font-medium text-teal-400 bg-slate-800 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  {role === 'hospital_admin' ? 'Admin Portal' : 'Patient Dashboard'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-left px-3 py-2 text-base font-medium text-rose-400 hover:bg-slate-800 rounded-lg flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login?tab=patient" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="secondary" size="md" className="w-full">
                      Patient Login
                    </Button>
                  </Link>
                  <Link to="/login?tab=staff" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="md" className="w-full">
                      Staff Admin
                    </Button>
                  </Link>
                </div>
                <div className="pt-2 border-t border-slate-800 flex flex-col gap-1.5">
                  <span className="text-[11px] text-teal-400 font-semibold uppercase">1-Click Quick Demo:</span>
                  <button
                    onClick={() => handleQuickLogin('awari')}
                    className="text-left px-3 py-1.5 bg-slate-800 rounded-lg text-xs text-slate-200 hover:bg-slate-700"
                  >
                    ⚡ Dr. Awari Admin (Bota)
                  </button>
                  <button
                    onClick={() => handleQuickLogin('samarth')}
                    className="text-left px-3 py-1.5 bg-slate-800 rounded-lg text-xs text-slate-200 hover:bg-slate-700"
                  >
                    ⚡ Samarth Hospital Admin (Belhe)
                  </button>
                  <button
                    onClick={() => handleQuickLogin('patient')}
                    className="text-left px-3 py-1.5 bg-slate-800 rounded-lg text-xs text-slate-200 hover:bg-slate-700"
                  >
                    ⚡ Demo Patient Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
