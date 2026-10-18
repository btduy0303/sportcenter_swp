import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import FeatureDetailModal from './components/common/FeatureDetailModal';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Dashboard
import DashboardLayout from './layouts/DashboardLayout';
import OverviewPage from './pages/dashboard/OverviewPage';
import UsersPage from './pages/dashboard/UsersPage';
import PackagesPage from './pages/dashboard/PackagesPage';
import SubscriptionsPage from './pages/dashboard/SubscriptionsPage';
import PaymentsPage from './pages/dashboard/PaymentsPage';
import AttendancePage from './pages/dashboard/AttendancePage';
import ClassesPage from './pages/dashboard/ClassesPage';
import ProfilePage from './pages/dashboard/ProfilePage';


function LandingView() {
  const [selectedFeature, setSelectedFeature] = useState(null);

  return (
    <div className="min-h-screen flex flex-col bg-[#080d1a] text-slate-100 selection:bg-emerald-500 selection:text-white">
      <Navbar />

      <main className="flex-grow">
        <HomePage
          onSelectFeature={(feat) => setSelectedFeature(feat)}
        />
      </main>

      <Footer />

      <FeatureDetailModal
        feature={selectedFeature}
        onClose={() => setSelectedFeature(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingView />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/app" element={<DashboardLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="packages" element={<PackagesPage />} />
              <Route path="subscriptions" element={<SubscriptionsPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="classes" element={<ClassesPage />} />
              <Route path="attendance" element={<AttendancePage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
