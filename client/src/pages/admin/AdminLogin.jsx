import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Lock, Mail, Building2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import api from '../../services/api.js';

export const AdminLogin = () => {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await api.get('/hospitals');
        const list = res.data.data || [];
        setHospitals(list);
        if (list.length > 0) {
          setSelectedHospitalId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load hospitals:', err);
      }
    };
    fetchHospitals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!selectedHospitalId) {
        throw new Error('Please select your hospital.');
      }
      await adminLogin(selectedHospitalId, email, password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Staff authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center mx-auto text-white shadow-lg shadow-teal-950">
            <Activity className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Hospital Staff Administration</h1>
          <p className="text-xs text-slate-400">Secure portal for updating live beds, doctors, and consults</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Select Hospital Facility"
            value={selectedHospitalId}
            onChange={(e) => setSelectedHospitalId(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white"
            required
          >
            {hospitals.map((h) => (
              <option key={h.id} value={h.id} className="bg-slate-800 text-white">
                {h.name} ({h.taluka})
              </option>
            ))}
          </Select>

          <Input
            label="Staff Email"
            type="email"
            required
            placeholder="awari@medivanta.in"
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
          />

          <Input
            label="Staff Password"
            type="password"
            required
            placeholder="••••••••"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
          />

          <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400">
            🔒 <strong>Staff Accounts:</strong><br />
            • <code>awari@medivanta.in</code> (Dr. Awari Hospital)<br />
            • <code>samarth@medivanta.in</code> (Samarth Ayurved College)<br />
            Password for both: <code>admin123</code>
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full" isLoading={loading}>
            Sign In to Staff Dashboard
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800">
          <Link to="/" className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Public Portal
          </Link>
        </div>
      </div>
    </div>
  );
};
