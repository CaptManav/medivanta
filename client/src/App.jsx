import React from 'react';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/layout/Navbar.jsx';
import { Footer } from './components/layout/Footer.jsx';
import { ChatWidget } from './components/chatbot/ChatWidget.jsx';
import { AppRouter } from './routes/AppRouter.jsx';

export const App = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Toaster position="top-right" />

      {/* Hide public Navbar & Footer inside admin dashboard layout */}
      {!isAdminPath && <Navbar />}

      <main className="flex-1">
        <AppRouter />
      </main>

      {!isAdminPath && <Footer />}

      {/* Floating MediBot live assistant */}
      {!isAdminPath && <ChatWidget />}
    </div>
  );
};

export default App;
