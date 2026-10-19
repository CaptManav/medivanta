import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Public Pages
import { Home } from '../pages/public/Home.jsx';
import { HospitalList } from '../pages/public/HospitalList.jsx';
import { HospitalDetail } from '../pages/public/HospitalDetail.jsx';
import { DoctorsOPD } from '../pages/public/DoctorsOPD.jsx';
import { BedAvailability } from '../pages/public/BedAvailability.jsx';
import { Emergency } from '../pages/public/Emergency.jsx';
import { NotFound } from '../pages/public/NotFound.jsx';

// Patient Pages
import { Login } from '../pages/patient/Login.jsx';
import { Signup } from '../pages/patient/Signup.jsx';
import { Dashboard } from '../pages/patient/Dashboard.jsx';
import { BookAppointment } from '../pages/patient/BookAppointment.jsx';

// Admin Pages
import { AdminLogin } from '../pages/admin/AdminLogin.jsx';
import { AdminLayout } from '../components/layout/AdminLayout.jsx';
import { QuickUpdate } from '../pages/admin/QuickUpdate.jsx';
import { ManageDoctors } from '../pages/admin/ManageDoctors.jsx';
import { AppointmentQueue } from '../pages/admin/AppointmentQueue.jsx';
import { Profile } from '../pages/admin/Profile.jsx';
import { AuditLog } from '../pages/admin/AuditLog.jsx';
import { SuperOnboard } from '../pages/admin/SuperOnboard.jsx';

// Route Guard
import { ProtectedRoute } from './ProtectedRoute.jsx';

export const AppRouter = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/hospitals" element={<HospitalList />} />
      <Route path="/hospitals/:id" element={<HospitalDetail />} />
      <Route path="/doctors" element={<DoctorsOPD />} />
      <Route path="/beds" element={<BedAvailability />} />
      <Route path="/emergency" element={<Emergency />} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Patient Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/book-appointment"
        element={
          <ProtectedRoute allowedRoles={['patient']}>
            <BookAppointment />
          </ProtectedRoute>
        }
      />

      {/* Hospital Admin Protected (Wrapped in AdminLayout with Sidebar) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['hospital_admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<QuickUpdate />} />
        <Route path="doctors" element={<ManageDoctors />} />
        <Route path="appointments" element={<AppointmentQueue />} />
        <Route path="profile" element={<Profile />} />
        <Route path="audit-log" element={<AuditLog />} />
      </Route>

      {/* Super Admin */}
      <Route
        path="/super/onboard"
        element={
          <ProtectedRoute allowedRoles={['super_admin']}>
            <SuperOnboard />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
