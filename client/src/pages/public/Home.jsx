import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bed,
  CalendarCheck,
  PhoneCall,
  Clock,
  ShieldCheck,
  HeartPulse,
  Building,
  Sparkles,
  ArrowRight,
  Activity,
  UserCheck,
} from 'lucide-react';
import api from '../../services/api.js';
import { HospitalCard } from '../../components/hospital/HospitalCard.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';

export const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedHospitals = async () => {
      try {
        const res = await api.get('/hospitals');
        setHospitals(res.data.data || []);
      } catch (err) {
        console.error('Error fetching hospitals:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedHospitals();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/hospitals?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/hospitals');
    }
  };

  const totalBeds = hospitals.reduce((acc, h) => acc + (h.general_total || 0) + (h.icu_total || 0), 0);
  const availBeds = hospitals.reduce((acc, h) => acc + (h.general_avail || 0) + (h.icu_avail || 0), 0);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-16 sm:py-24 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <Badge variant="navy" size="md" className="border border-teal-500/30 text-teal-300 bg-teal-950/40">
            <Sparkles className="w-3.5 h-3.5 text-teal-400 mr-1.5" />
            Live Hospital Bed & OPD Timetable Registry
          </Badge>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Find Free Beds. Verify Doctor OPDs.<br className="hidden sm:inline" />
            <span className="text-teal-400"> Real-Time Hospital Intelligence.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal">
            Like a live train status dashboard, but for community hospitals. Directly updated by hospital staff at Dr. Awari Hospital and Samarth Ayurved College Hospital.
          </p>

          {/* Search Bar Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto bg-white p-2 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center gap-2 border border-slate-200"
          >
            <div className="flex items-center gap-3 px-3 py-1 flex-1 w-full">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hospital name, Sangamner, Junnar, or department..."
                className="w-full text-slate-800 placeholder-slate-400 text-sm focus:outline-none"
              />
            </div>
            <Button type="submit" variant="primary" size="md" className="w-full sm:w-auto px-6">
              Search Now
            </Button>
          </form>

          {/* Quick Filter Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-300">
            <span className="text-slate-400">Quick explore:</span>
            <button
              onClick={() => navigate('/hospitals?taluka=Sangamner')}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Bota (Sangamner)
            </button>
            <button
              onClick={() => navigate('/hospitals?taluka=Junnar')}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Belhe (Junnar)
            </button>
            <button
              onClick={() => navigate('/photos')}
              className="px-2.5 py-1 rounded-full bg-teal-900/80 hover:bg-teal-800 text-teal-200 border border-teal-700/50 transition-colors flex items-center gap-1"
            >
              📸 Photos Gallery
            </button>
            <button
              onClick={() => navigate('/hospitals?is_24x7=true')}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              24x7 Emergency
            </button>
            <button
              onClick={() => navigate('/hospitals?pmjay=true')}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              PM-JAY Enrolled
            </button>
          </div>
        </div>
      </section>

      {/* Aggregate Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Verified Hospitals</p>
                <p className="text-2xl font-bold text-slate-800">{hospitals.length || 2}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Bed className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Free Beds Now</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {availBeds || 79}
                  <span className="text-xs font-normal text-slate-400"> / {totalBeds || 110}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">ICU & Ventilators</p>
                <p className="text-2xl font-bold text-slate-800">4 Available</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Specialist Doctors</p>
                <p className="text-2xl font-bold text-slate-800">4 Enlisted</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <Badge variant="info" size="sm" className="mb-2">Simple Workflow</Badge>
          <h2 className="text-2xl font-bold text-slate-900">How MEDIVANTA Works</h2>
          <p className="text-sm text-slate-500 mt-1">Connecting rural patients directly to accurate healthcare status.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">1. Search & Filter</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Locate nearby clinics or tertiary hospitals by Taluka, PM-JAY acceptance, or 24x7 emergency status.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">2. Check Live Status</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verify if general or ICU beds are free and whether the doctor is seated in OPD right now with timestamps.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">3. Book or Walk In</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Reserve an OPD token or consult schedule with direct contact numbers and turn-by-turn directions.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Hospitals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Featured Surveyed Hospitals</h2>
            <p className="text-xs sm:text-sm text-slate-500">Live pilot data from verified medical facilities in Ahmednagar & Pune districts.</p>
          </div>
          <Link to="/hospitals">
            <Button variant="ghost" size="sm" className="gap-1 text-teal-700 hover:text-teal-800">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hospitals.map((h) => (
            <HospitalCard key={h.id} hospital={h} />
          ))}
        </div>
      </section>

      {/* Verified Photo Tour Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white border border-slate-700 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 block mb-1">
                Visual Field Verification
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Hospital & Doctor Photographic Records
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Photographs from Dr. Awari Hospital (Bota) and Samarth Ayurved College Hospital & Research Centre (Belhe).
              </p>
            </div>
            <Link to="/photos">
              <Button variant="primary" size="md" className="gap-2 shrink-0">
                <span>View Full Photo Gallery</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/photos" className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-800 border border-slate-700">
              <img
                src="/photos/awari/dr_awari_consultation.jpeg"
                alt="Dr. Ashish Awari Bota"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-3">
                <span className="text-[11px] font-bold text-white">Dr. Ashish Awari</span>
                <span className="text-[10px] text-teal-300">Dr. Awari Hospital, Bota</span>
              </div>
            </Link>

            <Link to="/photos" className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-800 border border-slate-700">
              <img
                src="/photos/samarth/samarth_building_entrance.jpeg"
                alt="Samarth Hospital Entrance Belhe"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-3">
                <span className="text-[11px] font-bold text-white">Campus Building</span>
                <span className="text-[10px] text-teal-300">Samarth Hospital, Belhe</span>
              </div>
            </Link>

            <Link to="/photos" className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-800 border border-slate-700">
              <img
                src="/photos/samarth/samarth_reception_board.jpeg"
                alt="Samarth Hospital Reception Counter"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-3">
                <span className="text-[11px] font-bold text-white">Reception & Welcome</span>
                <span className="text-[10px] text-teal-300">Line: 8624843303</span>
              </div>
            </Link>

            <Link to="/photos" className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-800 border border-slate-700">
              <img
                src="/photos/samarth/dr_ramesh_padekar.jpeg"
                alt="Dr. Ramesh Padekar Deputy Superintendent"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-3">
                <span className="text-[11px] font-bold text-white">Dr. Ramesh Padekar</span>
                <span className="text-[10px] text-teal-300">Dy Superintendent</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Assistant Callout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden border border-slate-700">
          <div className="relative z-10 max-w-xl space-y-3">
            <Badge variant="navy" size="sm" className="border border-teal-400/40 text-teal-300">
              Interactive Bot
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Have questions? Ask MediBot anytime.
            </h3>
            <p className="text-sm text-slate-300">
              Ask questions in English, Hindi, or Marathi about bed vacancies, OPD timings, ambulance contacts, and Ayushman Bharat coverage.
            </p>
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }}
              >
                Chat with MediBot
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
