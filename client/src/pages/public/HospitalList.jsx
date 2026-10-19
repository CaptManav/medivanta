import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RefreshCw, Map as MapIcon, Grid, AlertCircle } from 'lucide-react';
import api from '../../services/api.js';
import { HospitalCard } from '../../components/hospital/HospitalCard.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { useSocket } from '../../hooks/useSocket.js';

export const HospitalList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [taluka, setTaluka] = useState(searchParams.get('taluka') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [is24x7, setIs24x7] = useState(searchParams.get('is_24x7') === 'true');
  const [pmjay, setPmjay] = useState(searchParams.get('pmjay') === 'true');
  const [icuAvail, setIcuAvail] = useState(searchParams.get('icu_available') === 'true');

  const { socket } = useSocket();

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (taluka) params.taluka = taluka;
      if (type) params.type = type;
      if (is24x7) params.is_24x7 = 'true';
      if (pmjay) params.pmjay = 'true';
      if (icuAvail) params.icu_available = 'true';

      const res = await api.get('/hospitals', { params });
      setHospitals(res.data.data || []);
    } catch (err) {
      console.error('Failed to load hospitals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [taluka, type, is24x7, pmjay, icuAvail]);

  // Listen for real-time live bed changes across hospitals
  useEffect(() => {
    if (!socket) return;

    const handleBedUpdate = ({ hospitalId, beds }) => {
      setHospitals((prev) =>
        prev.map((h) =>
          h.id === hospitalId
            ? {
                ...h,
                general_avail: beds.general_avail,
                general_total: beds.general_total,
                icu_avail: beds.icu_avail,
                icu_total: beds.icu_total,
                beds_updated_at: beds.updated_at,
              }
            : h
        )
      );
    };

    socket.on('global:bed:update', handleBedUpdate);
    return () => {
      socket.off('global:bed:update', handleBedUpdate);
    };
  }, [socket]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHospitals();
  };

  const handleResetFilters = () => {
    setSearch('');
    setTaluka('');
    setType('');
    setIs24x7(false);
    setPmjay(false);
    setIcuAvail(false);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Hospital Directory & Live Status</h1>
        <p className="text-sm text-slate-500 mt-1">
          Explore registered clinics and hospitals with live bed vacancies and verified amenities.
        </p>
      </div>

      {/* Main Grid: Sidebar Filters + Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-teal-600" /> Filter Facilities
              </h3>
              <button
                onClick={handleResetFilters}
                className="text-xs text-teal-600 hover:underline font-medium"
              >
                Reset
              </button>
            </div>

            {/* Taluka */}
            <Select
              label="Taluka / Region"
              value={taluka}
              onChange={(e) => setTaluka(e.target.value)}
              options={[
                { value: '', label: 'All Regions' },
                { value: 'Sangamner', label: 'Sangamner' },
                { value: 'Junnar', label: 'Junnar' },
              ]}
            />

            {/* Type */}
            <Select
              label="Hospital Category"
              value={type}
              onChange={(e) => setType(e.target.value)}
              options={[
                { value: '', label: 'All Categories' },
                { value: 'private', label: 'Private Clinic / Hospital' },
                { value: 'college', label: 'Ayurved / Medical College' },
              ]}
            />

            {/* Checkbox Toggles */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={is24x7}
                  onChange={(e) => setIs24x7(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>24x7 Emergency Services</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pmjay}
                  onChange={(e) => setPmjay(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>PM-JAY (Ayushman Bharat)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={icuAvail}
                  onChange={(e) => setIcuAvail(e.target.checked)}
                  className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span>ICU Beds Available Now</span>
              </label>
            </div>
          </div>
        </div>

        {/* Results Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Top Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search by hospital name or address..."
                icon={Search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button type="submit" variant="primary" size="md">
              Search
            </Button>
          </form>

          {/* Results List */}
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2 bg-white rounded-2xl border border-slate-200">
              <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
              <p className="text-sm">Fetching verified hospital registry...</p>
            </div>
          ) : hospitals.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 space-y-2">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="font-semibold text-base text-slate-800">No matching hospitals found</p>
              <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
              <Button variant="secondary" size="sm" onClick={handleResetFilters}>
                Clear All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {hospitals.map((h) => (
                <HospitalCard key={h.id} hospital={h} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
