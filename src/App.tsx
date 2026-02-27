import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';
import AdminLayout from '@/layouts/AdminLayout';
import LoginPage from '@/pages/LoginPage';
import OverviewPage from '@/pages/OverviewPage';
import PatientsPage from '@/pages/PatientsPage';
import PatientDetailPage from '@/pages/PatientDetailPage';
import AlertsPage from '@/pages/AlertsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import TriageTestPage from '@/pages/TriageTestPage';
import PatientTriagePage from '@/pages/PatientTriagePage';

// Admin Pages
import AdminOverviewPage from '@/pages/admin/AdminOverviewPage';
import DoctorManagementPage from '@/pages/admin/DoctorManagementPage';
import AdminPatientManagementPage from '@/pages/admin/AdminPatientManagementPage';
import AdminAlertManagementPage from '@/pages/admin/AdminAlertManagementPage';
import ConfigurationPage from '@/pages/admin/ConfigurationPage';

// Context
import { AdminProvider } from '@/context/AdminContext';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        
        {/* Doctor Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="patients/:id" element={<PatientDetailPage />} />
          <Route path="patients/:id/triage" element={<PatientTriagePage />} />
          <Route path="alerts" element={<AlertsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="triage-test" element={<TriageTestPage />} />
        </Route>

        {/* Admin Dashboard Routes */}
        <Route path="/admin" element={
          <AdminProvider>
            <AdminLayout />
          </AdminProvider>
        }>
          <Route index element={<AdminOverviewPage />} />
          <Route path="doctors" element={<DoctorManagementPage />} />
          <Route path="patients" element={<AdminPatientManagementPage />} />
          <Route path="alerts" element={<AdminAlertManagementPage />} />
          <Route path="analytics" element={<AnalyticsPage />} /> {/* Reusing Analytics for now */}
          <Route path="configuration" element={<ConfigurationPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<div className="p-8 text-center text-slate-500">Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
