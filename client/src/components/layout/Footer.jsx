import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, HeartHandshake, PhoneCall } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & About */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg tracking-tight">MEDIVANTA</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time hospital bed status, live OPD doctors timetable, emergency ambulance dispatch, and streamlined appointment scheduling for Maharashtra.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Consent-verified hospital directory</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-teal-400 transition-colors">Home Dashboard</Link>
              </li>
              <li>
                <Link to="/hospitals" className="hover:text-teal-400 transition-colors">Find Hospitals</Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-teal-400 transition-colors">Doctors & OPD Schedule</Link>
              </li>
              <li>
                <Link to="/beds" className="hover:text-teal-400 transition-colors">Live Bed Availability</Link>
              </li>
              <li>
                <Link to="/emergency" className="hover:text-teal-400 transition-colors">Emergency & Ambulance</Link>
              </li>
            </ul>
          </div>

          {/* Survey Hospitals */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Surveyed Hospitals</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-slate-300 block font-medium">Dr. Awari Hospital</span>
                <span className="text-xs text-slate-500">Botal, Sangamner (10 Beds)</span>
              </li>
              <li>
                <span className="text-slate-300 block font-medium">Samarth Ayurved College Hospital</span>
                <span className="text-xs text-slate-500">Belhe, Junnar (100 Beds, 24x7)</span>
              </li>
              <li className="pt-2">
                <Link to="/admin/login" className="text-xs text-teal-400 hover:underline">
                  Hospital Staff Login →
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency Helplines */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-400 mb-3 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5" />
              Emergency Helplines
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="block text-slate-300 font-semibold">108 — Ambulance</span>
                <span className="text-slate-500">National Emergency Medical Service</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="block text-slate-300 font-semibold">112 — National Emergency</span>
                <span className="text-slate-500">Police, Fire & Medical dispatch</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} MEDIVANTA. B.Tech Engineering Project — Samarth College of Engineering & Management, Belhe.</p>
          <p className="flex items-center gap-1 text-slate-400">
            Engineered with <HeartHandshake className="w-3.5 h-3.5 text-teal-500" /> for community healthcare
          </p>
        </div>
      </div>
    </footer>
  );
};
