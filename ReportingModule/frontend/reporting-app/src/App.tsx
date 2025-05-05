//Frontend Routes

import './App.css'
import { Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectDetailsPage from "./pages/ProjectOverviewPage";
import TestDetailPage from "./pages/TestDetailPage";
import AllTestsPage from "./pages/AllTestsPage";
import ErrorMetrics from './pages/ErrorMetricsPage';
import AdminProjectsPage from "./pages/AdminProjectsPage";
import ManageUsersPage from "./pages/ManageUsersPage";
import ManageTestSuitesPage from './pages/ManageTestSuitesPage';
import AuditLogsPage from './pages/AuditLogsPage';

function App() {

  return (
    <>
      <div>
      {/* Routes */}
        <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/project/:projectId" element={<ProjectDetailsPage />} />
        <Route path="/project/:projectId/all-tests" element={<AllTestsPage />} />
        <Route path="/project/:projectId/test/:testId" element={<TestDetailPage />} />
        <Route path="/project/:projectId/error-type/:projectId" element={<ErrorMetrics />} />

        {/* Admin only routes */}
          <Route path="/admin-projects" element={<AdminProjectsPage />} />
          <Route path="/admin-users" element={<ManageUsersPage />} />
          <Route path="/admin-testsuites" element={<ManageTestSuitesPage />} />
          <Route path="/admin-logs" element={<AuditLogsPage />} />
      </Routes>
    </div>
    </>
  )
}

export default App
