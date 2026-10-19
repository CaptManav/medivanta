import React, { useState, useEffect } from 'react';
import { Building2, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../hooks/useAuth.js';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';

export const Profile = () => {
  const { admin } = useAuth();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [is24x7, setIs24x7] = useState(false);
  const [pmjay, setPmjay] = useState(false);
  const [cashless, setCashless] = useState(false);

  useEffect(() => {
    const fetchHospital = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/hospitals/${admin?.hospitalId}`);
        const data = res.data.data;
        setHospital(data);
        setName(data.name || '');
        setAddress(data.address || '');
        setPhone(data.phone || '');
        setAltPhone(data.alt_phone || '');
        setEmail(data.email || '');
        setWebsite(data.website || '');
        setIs24x7(data.is_24x7 || false);
        setPmjay(data.pmjay || false);
        setCashless(data.cashless || false);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (admin?.hospitalId) {
      fetchHospital();
    }
  }, [admin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await api.put('/admin/profile', {
        name,
        address,
        phone,
        altPhone,
        email,
        website,
        is24x7,
        pmjay,
        cashless,
      });
      setMessage('Hospital facility profile successfully updated and recorded in audit log.');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading facility profile...</div>;
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hospital Facility Profile</h1>
        <p className="text-xs text-slate-500 mt-1">Configure public address, direct telephone lines, and government scheme affiliations.</p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <Card>
        <CardBody className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Hospital Legal Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="w-full">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Full Physical Address
              </label>
              <textarea
                rows={3}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-lg text-sm border border-slate-300 p-3 text-slate-800 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Direct Desk Telephone"
                placeholder="e.g. 02425-XXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Input
                label="Alternative Emergency Line"
                placeholder="e.g. 98XXXXXXXX"
                value={altPhone}
                onChange={(e) => setAltPhone(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Public Inquiries Email"
                type="email"
                placeholder="contact@hospital.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Official Website URL (Optional)"
                type="url"
                placeholder="https://..."
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            {/* Checkbox settings */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={is24x7}
                  onChange={(e) => setIs24x7(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>24x7 Emergency Casualty & Admissions Open</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pmjay}
                  onChange={(e) => setPmjay(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>PM-JAY (Ayushman Bharat) Scheme Enrolled</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cashless}
                  onChange={(e) => setCashless(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>Cashless TPA / Mediclaim Insurance Facility</span>
              </label>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="primary" size="md" isLoading={saving}>
                <Save className="w-4 h-4 mr-1.5" /> Save Changes
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
