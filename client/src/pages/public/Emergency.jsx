import React, { useState, useEffect } from 'react';
import { PhoneCall, ShieldAlert, Ambulance as AmbulanceIcon, Building2, MapPin, AlertTriangle, ArrowRight } from 'lucide-react';
import api from '../../services/api.js';
import { Card, CardHeader, CardBody, CardTitle } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';

export const Emergency = () => {
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    const fetch24x7 = async () => {
      try {
        const res = await api.get('/hospitals', { params: { is_24x7: 'true' } });
        setHospitals(res.data.data || []);
      } catch (err) {
        console.error('Failed to load emergency facilities:', err);
      }
    };
    fetch24x7();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Critical Alert Warning */}
      <div className="bg-rose-50 border-2 border-rose-500/80 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 text-rose-700">
          <ShieldAlert className="w-8 h-8 shrink-0 animate-pulse" />
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Life-Threatening Medical Emergency?
          </h1>
        </div>
        <p className="text-sm sm:text-base text-rose-900 leading-relaxed max-w-3xl">
          If someone is unconscious, experiencing acute chest pain, major bleeding, severe breathing difficulty, or in a road accident, <strong>immediately call 108 or 112</strong>. Do not wait for online appointment verification.
        </p>

        {/* Big Quick Dial Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <a href="tel:108" className="w-full">
            <button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center gap-3 text-lg transition-transform hover:scale-[1.02]">
              <PhoneCall className="w-6 h-6 animate-bounce" />
              <span>Dial 108 (Ambulance)</span>
            </button>
          </a>

          <a href="tel:112" className="w-full">
            <button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center gap-3 text-lg transition-transform hover:scale-[1.02]">
              <PhoneCall className="w-6 h-6" />
              <span>Dial 112 (All Emergency)</span>
            </button>
          </a>

          <a href="tel:102" className="w-full">
            <button className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center gap-3 text-lg transition-transform hover:scale-[1.02]">
              <PhoneCall className="w-6 h-6" />
              <span>Dial 102 (Maternal / Infant)</span>
            </button>
          </a>
        </div>
      </div>

      {/* 24x7 Operational Facilities */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" />
            24x7 Emergency Hospital Units in Network
          </h2>
          <p className="text-xs text-slate-500">Facilities equipped with around-the-clock emergency casualty and admissions.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {hospitals.map((h) => (
            <Card key={h.id} className="border-slate-200">
              <CardBody className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-800">{h.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{h.address}</span>
                    </p>
                  </div>
                  <Badge variant="success" size="sm" dot>24x7 Casualty</Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block font-medium">Free ICU Beds</span>
                    <span className="font-bold text-slate-800 text-sm">{h.icu_avail ?? 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Free General Beds</span>
                    <span className="font-bold text-slate-800 text-sm">{h.general_avail ?? 0}</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  {h.phone ? (
                    <a href={`tel:${h.phone}`} className="flex-1">
                      <Button variant="danger" size="sm" className="w-full">
                        <PhoneCall className="w-4 h-4 mr-1.5" /> Call Desk: {h.phone}
                      </Button>
                    </a>
                  ) : (
                    <Button variant="secondary" size="sm" className="w-full" disabled>
                      Desk Direct Line On Admission
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Ambulance Dispatch Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AmbulanceIcon className="w-5 h-5 text-teal-600" />
            Ambulance Classification & Guidelines
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <h4 className="font-semibold text-slate-800 mb-1">Basic Life Support (BLS)</h4>
              <p className="text-xs text-slate-500">
                Equipped with emergency oxygen, stretcher, vitals monitoring, and first responder kit for stable patient transport. Available at Samarth Ayurved College Hospital.
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <h4 className="font-semibold text-slate-800 mb-1">Advanced Life Support (ALS)</h4>
              <p className="text-xs text-slate-500">
                Equipped with ventilator, defibrillator, emergency cardiac medication, and paramedic for critical transfer. Dispatched on dialing 108.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
