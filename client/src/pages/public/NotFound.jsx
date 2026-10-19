import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';

export const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
        <Activity className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900">404</h1>
      <h2 className="text-lg font-semibold text-slate-700">Page Not Found</h2>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
        The medical dashboard route you requested could not be located or has moved.
      </p>
      <Link to="/">
        <Button variant="primary" size="md">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Home Dashboard
        </Button>
      </Link>
    </div>
  );
};
