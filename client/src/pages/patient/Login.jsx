import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Lock, Mail, Building2, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import api from '../../services/api.js';

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
    // If coming from staff link, set tab to staff
    if (location.pathname.includes('admin') || location.search.includes('staff')) {
      setTab('staff');
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
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'patient') {
        await login(email, password);
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        if (!selectedHospitalId) {
          throw new Error('Please select your hospital facility.');
        }
        await adminLogin(selectedHospitalId, email, password);
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Authentication failed. Please verify credentials.');
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
          <p className="text-xs text-slate-400">Choose your role to access personalized services</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setTab('patient');
              setError('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              tab === 'patient'
                ? 'bg-white text-slate-900 shadow-sm'
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
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              tab === 'staff'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4 text-teal-600" />
            Hospital Staff
          </button>
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
              onChange={(e) => setSelectedHospitalId(e.target.value)}
              required
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.taluka})
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
              💡 <strong>Demo Credentials:</strong><br />
              • Dr. Awari: <code>awari@medivanta.in</code> / <code>admin123</code><br />
              • Samarth Hospital: <code>samarth@medivanta.in</code> / <code>admin123</code>
            </div>
          )}

          {tab === 'patient' && (
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-500">
              💡 <strong>Demo Patient:</strong> <code>patient@demo.com</code> / <code>patient123</code>
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
