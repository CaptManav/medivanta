import React, { useState } from 'react';
import { Building2, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api.js';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';

export const SuperOnboard = () => {
  const [name, setName] = useState('');
  const [type, setType] = useState('private');
  const [address, setAddress] = useState('');
  const [taluka, setTaluka] = useState('Sangamner');
  const [district, setDistrict] = useState('Ahmednagar');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // 1. Onboard hospital
      const hRes = await api.post('/super/hospitals', {
        name,
        type,
        address,
        taluka,
        district,
        consentDemo: true,
        consentLogo: true,
      });

      const newHospital = hRes.data.data;

      // 2. Create staff admin account
      if (adminEmail && adminPassword) {
        await api.post('/super/admins', {
          hospitalId: newHospital.id,
          email: adminEmail,
          password: adminPassword,
        });
      }

      setMessage(`Hospital "${newHospital.name}" onboarded and staff account created successfully!`);
      setName('');
      setAddress('');
      setAdminEmail('');
      setAdminPassword('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Onboarding failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Onboard New Hospital Facility</h1>
        <p className="text-xs text-slate-500 mt-1">Super Admin portal: register hospital entity and provision staff admin logins.</p>
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
              label="Facility Legal Name"
              required
              placeholder="e.g. Belhe Primary Health Centre"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Select
              label="Facility Category"
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={[
                { value: 'private', label: 'Private Clinic / Hospital' },
                { value: 'college', label: 'Medical / Ayurved College Hospital' },
                { value: 'government', label: 'Government Hospital / PHC' },
                { value: 'trust', label: 'Charitable Trust Hospital' },
              ]}
            />

            <div className="w-full">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Physical Address
              </label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Village, Taluka, Pin Code"
                className="w-full rounded-lg text-sm border border-slate-300 p-3 text-slate-800 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Taluka"
                value={taluka}
                onChange={(e) => setTaluka(e.target.value)}
              />
              <Input
                label="District"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-teal-600" />
                Provision Staff Admin Credentials
              </h4>
              <Input
                label="Staff Login Email"
                type="email"
                required
                placeholder="admin@hospital.org"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
              <Input
                label="Temporary Password"
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="primary" size="md" isLoading={loading}>
                Register & Provision Hospital
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
