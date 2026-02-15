import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AuthCallback } from './pages/AuthCallback';
import { Home } from './pages/Home';
import { Summary } from './pages/Summary';
import { Controls } from './pages/Controls';
import { Policies } from './pages/Policies';
import { PolicyDetail } from './pages/PolicyDetail';
import { Vendors } from './pages/Vendors';
import { Users } from './pages/Users';
import { Frameworks } from './pages/Frameworks';
import { Settings } from './pages/Settings';
import { Risk } from './pages/Risk';
import { Report } from './pages/Report';
import { Evidence } from './pages/Evidence';
import { AIAssessment } from './pages/AIAssessment';
import { AuditorHome } from './pages/AuditorHome';
import { AuditorAssignment } from './pages/AuditorAssignment';
import { SubcontrolDetail } from './pages/SubcontrolDetail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="summary" element={<Summary />} />
            <Route path="controls" element={<Controls />} />
            <Route path="controls/subcontrol/:id" element={<SubcontrolDetail />} />
            <Route path="policies" element={<Policies />} />
            <Route path="policies/:id" element={<PolicyDetail />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="users" element={<Users />} />
            <Route path="frameworks" element={<Frameworks />} />
            <Route path="settings" element={<Settings />} />
            <Route path="risk" element={<Risk />} />
            <Route path="report" element={<Report />} />
            <Route path="evidence" element={<Evidence />} />
            <Route path="ai-assessment" element={<AIAssessment />} />
            <Route path="auditor" element={<AuditorHome />} />
            <Route path="auditor/assignments/:organizationFrameworkId" element={<AuditorAssignment />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
