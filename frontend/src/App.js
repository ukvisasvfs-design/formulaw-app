import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import '@/App.css';

// Client Portal Pages
import ClientLogin from '@/pages/client/ClientLogin';
import ClientHome from '@/pages/client/ClientHome';
import ClientAdvocateProfile from '@/pages/client/ClientAdvocateProfile';
import ClientWallet from '@/pages/client/ClientWallet';
import ClientCallHistory from '@/pages/client/ClientCallHistory';

// Advocate Portal Pages
import AdvocateLogin from '@/pages/advocate/AdvocateLogin';
import AdvocateRegister from '@/pages/advocate/AdvocateRegister';
import AdvocateDashboard from '@/pages/advocate/AdvocateDashboard';
import AdvocateProfile from '@/pages/advocate/AdvocateProfile';
import AdvocateCallHistory from '@/pages/advocate/AdvocateCallHistory';
import AdvocateEarnings from '@/pages/advocate/AdvocateEarnings';

// Admin Portal Pages
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminAdvocates from '@/pages/admin/AdminAdvocates';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminCalls from '@/pages/admin/AdminCalls';

// Context
import { AuthProvider } from '@/context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/client" replace />} />

          {/* Client Portal Routes */}
          <Route path="/client" element={<ClientLogin />} />
          <Route path="/client/home" element={<ClientHome />} />
          <Route path="/client/advocate/:id" element={<ClientAdvocateProfile />} />
          <Route path="/client/wallet" element={<ClientWallet />} />
          <Route path="/client/call-history" element={<ClientCallHistory />} />

          {/* Advocate Portal Routes */}
          <Route path="/advocate" element={<AdvocateLogin />} />
          <Route path="/advocate/register" element={<AdvocateRegister />} />
          <Route path="/advocate/dashboard" element={<AdvocateDashboard />} />
          <Route path="/advocate/profile" element={<AdvocateProfile />} />
          <Route path="/advocate/call-history" element={<AdvocateCallHistory />} />
          <Route path="/advocate/earnings" element={<AdvocateEarnings />} />

          {/* Admin Portal Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/advocates" element={<AdminAdvocates />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/calls" element={<AdminCalls />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
