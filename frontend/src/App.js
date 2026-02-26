/**
 * FormuLAW - Legal Consultation Platform
 * Main Application Router
 * 
 * This file handles all routing for the three portals:
 * 1. Client Portal (/client/*) - For users seeking legal consultation
 * 2. Advocate Portal (/advocate/*) - For lawyers providing services
 * 3. Admin Portal (/admin/*) - For platform administrators
 * 
 * @author FormuLAW Team
 * @version 1.0.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// ============================================
// CLIENT PORTAL PAGES
// Pages for users seeking legal consultation
// ============================================
import ClientLogin from './pages/client/ClientLogin';
import ClientHome from './pages/client/ClientHome';
import ClientAdvocateProfile from './pages/client/ClientAdvocateProfile';
import ClientWallet from './pages/client/ClientWallet';
import ClientCallHistory from './pages/client/ClientCallHistory';
import ClientProfile from './pages/client/ClientProfile';

// ============================================
// ADVOCATE PORTAL PAGES
// Pages for lawyers providing legal services
// ============================================
import AdvocateLogin from './pages/advocate/AdvocateLogin';
import AdvocateRegister from './pages/advocate/AdvocateRegister';
import AdvocateDashboard from './pages/advocate/AdvocateDashboard';
import AdvocateProfile from './pages/advocate/AdvocateProfile';
import AdvocateCallHistory from './pages/advocate/AdvocateCallHistory';
import AdvocateEarnings from './pages/advocate/AdvocateEarnings';

// ============================================
// ADMIN PORTAL PAGES
// Pages for platform administrators
// ============================================
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAdvocates from './pages/admin/AdminAdvocates';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCalls from './pages/admin/AdminCalls';

// ============================================
// CONTEXT PROVIDERS
// Global state management
// ============================================
import { AuthProvider } from './context/AuthContext';

/**
 * Main App Component
 * Wraps entire application with AuthProvider for authentication state
 * and BrowserRouter for client-side routing
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 
            Root Route
            Redirects to client portal by default 
          */}
          <Route path="/" element={<Navigate to="/client" replace />} />

          {/* ========== CLIENT PORTAL ROUTES ========== */}
          <Route path="/client" element={<ClientLogin />} />
          <Route path="/client/home" element={<ClientHome />} />
          <Route path="/client/advocate/:id" element={<ClientAdvocateProfile />} />
          <Route path="/client/wallet" element={<ClientWallet />} />
          <Route path="/client/call-history" element={<ClientCallHistory />} />
          <Route path="/client/profile" element={<ClientProfile />} />
          
          {/* Alias routes for user convenience */}
          <Route path="/user" element={<Navigate to="/client" replace />} />
          <Route path="/user-dashboard" element={<Navigate to="/client/home" replace />} />

          {/* ========== ADVOCATE PORTAL ROUTES ========== */}
          <Route path="/advocate" element={<AdvocateLogin />} />
          <Route path="/advocate/register" element={<AdvocateRegister />} />
          <Route path="/advocate/dashboard" element={<AdvocateDashboard />} />
          <Route path="/advocate/profile" element={<AdvocateProfile />} />
          <Route path="/advocate/call-history" element={<AdvocateCallHistory />} />
          <Route path="/advocate/earnings" element={<AdvocateEarnings />} />
          
          {/* Alias route for user convenience */}
          <Route path="/advocate-dashboard" element={<Navigate to="/advocate/dashboard" replace />} />

          {/* ========== ADMIN PORTAL ROUTES ========== */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/advocates" element={<AdminAdvocates />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/calls" element={<AdminCalls />} />
          
          {/* Alias route for user convenience */}
          <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />

          {/* 
            Catch-all Route
            Redirects unknown routes to client portal 
          */}
          <Route path="*" element={<Navigate to="/client" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
