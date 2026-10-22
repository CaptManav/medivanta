import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Lock, Mail, Building2, User, AlertCircle, Zap, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import api from '../../services/api.js';
import { AWARI_ID, SAMARTH_ID } from '../../services/mockData.js';

export const Login = () => {
  const [tab, setTab] = useState('patient'); // 'patient' | 'staff'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, adminLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If coming from staff link or query params
    const params = new URLSearchParams(location.search);
    if (location.pathname.includes('admin') || params.get('tab') === 'staff') {
      setTab('staff');
    } else if (params.get('tab') === 'patient') {
      setTab('patient');
    }

    // Fetch hospitals for staff dropdown
    const fetchHospitals = async () => {
      try {
        const res = await api.get('/hospitals');
        const list = res.data.data || [];
        setHospitals(list);
        if (list.length > 0) {
          setSelectedHospitalId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load hospital list for staff login:', err);
      }
    };
    fetchHospitals();
  }, [location]);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'patient') {
        const mailToUse = email.trim() || 'patient@demo.com';
        const passToUse = password || 'patient123';
        await login(mailToUse, passToUse);
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        const hospId = selectedHospitalId || AWARI_ID;
        const mailToUse = email.trim() || (hospId === AWARI_ID ? 'awari@medivanta.in' : 'samarth@medivanta.in');
        const passToUse = password || 'admin123';
        await adminLogin(hospId, mailToUse, passToUse);
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemo = async (roleType) => {
    setError('');
    setLoading(true);
    try {
      if (roleType === 'awari') {
        setTab('staff');
        setSelectedHospitalId(AWARI_ID);
        setEmail('awari@medivanta.in');
        setPassword('admin123');
        await adminLogin(AWARI_ID, 'awari@medivanta.in', 'admin123');
        navigate('/admin/dashboard');
      } else if (roleType === 'samarth') {
        setTab('staff');
        setSelectedHospitalId(SAMARTH_ID);
        setEmail('samarth@medivanta.in');
        setPassword('admin123');
        await adminLogin(SAMARTH_ID, 'samarth@medivanta.in', 'admin123');
        navigate('/admin/dashboard');
      } else {
        setTab('patient');
        setEmail('patient@demo.com');
        setPassword('patient123');
        await login('patient@demo.com', 'patient123');
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Instant demo login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
        {/* Brand Header */}
        <div className="bg-slate-900 text-white p-6 text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center mx-auto text-white shadow-md">
            <Activity className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Sign In to MEDIVANTA</h2>
          <p className="text-xs text-slate-400">Choose your role to access live hospital services</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setTab('patient');
              setError('');
              if (email === 'awari@medivanta.in' || email === 'samarth@medivanta.in') setEmail('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              tab === 'patient'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4 text-teal-600" />
            I'm a Patient
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('staff');
              setError('');
              if (!email || email === 'patient@demo.com') {
                setEmail('awari@medivanta.in');
                setPassword('admin123');
              }
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              tab === 'staff'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4 text-teal-600" />
            Hospital Staff / Admin
          </button>
        </div>

        {/* 1-Click Fast Access Box for Demos */}
        <div className="bg-teal-50/60 border-b border-teal-100 p-3 text-xs text-teal-900 space-y-1.5">
          <div className="flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1 text-teal-800">
              <Zap className="w-3.5 h-3.5 text-teal-600" /> Instant 1-Click Demo Login:
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => handleInstantDemo('awari')}
              className="py-1.5 px-2 bg-white hover:bg-teal-100/70 border border-teal-200 rounded-lg text-[11px] font-medium text-slate-800 text-center transition-colors shadow-2xs"
            >
              Dr. Awari (Bota)
            </button>
            <button
              type="button"
              onClick={() => handleInstantDemo('samarth')}
              className="py-1.5 px-2 bg-white hover:bg-teal-100/70 border border-teal-200 rounded-lg text-[11px] font-medium text-slate-800 text-center transition-colors shadow-2xs"
            >
              Samarth (Belhe)
            </button>
            <button
              type="button"
              onClick={() => handleInstantDemo('patient')}
              className="py-1.5 px-2 bg-white hover:bg-teal-100/70 border border-teal-200 rounded-lg text-[11px] font-medium text-slate-800 text-center transition-colors shadow-2xs"
            >
              Demo Patient
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {tab === 'staff' && (
            <Select
              label="Select Your Hospital Facility"
              value={selectedHospitalId}
              onChange={(e) => {
                setSelectedHospitalId(e.target.value);
                if (e.target.value === AWARI_ID) {
                  setEmail('awari@medivanta.in');
                } else {
                  setEmail('samarth@medivanta.in');
                }
                setPassword('admin123');
              }}
              required
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} — {h.taluka}
                </option>
              ))}
            </Select>
          )}

          <Input
            label="Email Address"
            type="email"
            required
            placeholder={tab === 'patient' ? 'patient@demo.com' : 'awari@medivanta.in'}
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            required
            placeholder="••••••••"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {tab === 'staff' && (
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-500">
              💡 <strong>Demo Hospital Staff Accounts:</strong><br />
              • Dr. Awari (Bota): <code>awari@medivanta.in</code> / <code>admin123</code><br />
              • Samarth Hospital (Belhe): <code>samarth@medivanta.in</code> / <code>admin123</code>
            </div>
          )}

          {tab === 'patient' && (
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-500">
              💡 <strong>Demo Patient Account:</strong> <code>patient@demo.com</code> / <code>patient123</code>
            </div>
          )}

          <Button type="submit" variant="primary" size="md" className="w-full mt-2" isLoading={loading}>
            {tab === 'patient' ? 'Sign In as Patient' : 'Log In to Hospital Admin'}
          </Button>

          {tab === 'patient' && (
            <p className="text-center text-xs text-slate-500 pt-2">
              Don't have a patient account?{' '}
              <Link to="/signup" className="text-teal-600 font-semibold hover:underline">
                Register here
              </Link>
            </p>
          )}
        </form>
      </div>
    </div>
  );
};
