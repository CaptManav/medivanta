import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarCheck, Building2, User, Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api.js';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';

export const BookAppointment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState(searchParams.get('hospitalId') || '');
  const [selectedDoctorId, setSelectedDoctorId] = useState(searchParams.get('doctorId') || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [slot, setSlot] = useState('Morning OPD (10:00 - 13:00)');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 1. Fetch all hospitals
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const res = await api.get('/hospitals');
        const list = res.data.data || [];
        setHospitals(list);
        if (!selectedHospitalId && list.length > 0) {
          setSelectedHospitalId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load hospitals:', err);
      }
    };
    fetchHospitals();
  }, []);

  // 2. Fetch doctors for selected hospital
  useEffect(() => {
    if (!selectedHospitalId) return;

    const fetchDoctors = async () => {
      try {
        const res = await api.get(`/hospitals/${selectedHospitalId}/doctors`);
        const docList = res.data.data || [];
        setDoctors(docList);
        if (docList.length > 0) {
          const match = docList.find((d) => d.id === selectedDoctorId);
          setSelectedDoctorId(match ? match.id : docList[0].id);
        } else {
          setSelectedDoctorId('');
        }
      } catch (err) {
        console.error('Failed to load doctors:', err);
      }
    };
    fetchDoctors();
  }, [selectedHospitalId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedHospitalId || !selectedDoctorId || !date) {
      return setError('Please fill in all mandatory fields.');
    }

    setLoading(true);
    try {
      await api.post('/appointments', {
        hospitalId: selectedHospitalId,
        doctorId: selectedDoctorId,
        date,
        slotOrToken: slot,
        notes,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Appointment Booked!</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Your consultation request has been submitted to the hospital desk. Please arrive on your scheduled date.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Button variant="primary" size="md" onClick={() => navigate('/dashboard')}>
            View in Dashboard
          </Button>
          <Button variant="secondary" size="md" onClick={() => setSuccess(false)}>
            Book Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <Card className="border-slate-200">
        <CardHeader className="bg-slate-900 text-white p-5">
          <CardTitle className="text-white flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-teal-400" />
            Book Doctor Consultation / OPD Token
          </CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Hospital Select */}
          <Select
            label="1. Select Hospital Facility"
            value={selectedHospitalId}
            onChange={(e) => setSelectedHospitalId(e.target.value)}
            required
          >
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} — {h.taluka}
              </option>
            ))}
          </Select>

          {/* Doctor Select */}
          <Select
            label="2. Select Doctor / Specialist"
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            required
            disabled={doctors.length === 0}
          >
            {doctors.length === 0 ? (
              <option value="">No doctors listed for this facility</option>
            ) : (
              doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.qualification || 'Specialist'}) — {d.specialization || 'General'}
                </option>
              ))
            )}
          </Select>

          {/* Date */}
          <Input
            label="3. Preferred Date"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          {/* Time Slot / Token */}
          <Select
            label="4. Consultation Window / Token Type"
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            options={[
              { value: 'Morning OPD (10:00 - 13:00)', label: 'Morning OPD (10:00 - 13:00)' },
              { value: 'Evening OPD (16:00 - 19:00)', label: 'Evening OPD (16:00 - 19:00)' },
              { value: 'Walk-in OPD Token', label: 'Walk-in First-Come First-Served Token' },
            ]}
          />

          {/* Notes */}
          <div className="w-full">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              Reason for Visit / Patient Symptoms (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Mild fever since 2 days, general health checkup..."
              className="w-full rounded-lg text-sm border border-slate-300 p-3 text-slate-800 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-2"
            isLoading={loading}
            disabled={doctors.length === 0}
          >
            Confirm Appointment Booking
          </Button>
        </form>
      </Card>
    </div>
  );
};
