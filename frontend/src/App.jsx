import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ConsultationPage from './pages/ConsultationPage.jsx';
import ProviderPortalPage from './pages/ProviderPortalPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import './styles/index.css';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}><div className="skeleton" style={{ width:120, height:32 }} /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/services" element={<ServicesPage />} />

      <Route path="/dashboard" element={
        <PrivateRoute roles={['OWNER']}>
          <DashboardPage />
        </PrivateRoute>
      } />
      <Route path="/consultations/:id" element={
        <PrivateRoute roles={['OWNER', 'VET']}>
          <ConsultationPage />
        </PrivateRoute>
      } />
      <Route path="/provider" element={
        <PrivateRoute roles={['PROVIDER']}>
          <ProviderPortalPage />
        </PrivateRoute>
      } />
      <Route path="/admin" element={
        <PrivateRoute roles={['ADMIN']}>
          <AdminPage />
        </PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: { borderRadius: '999px', background: '#fff', color: '#191c1e', fontFamily: 'Manrope, sans-serif', fontWeight: 600, fontSize: '0.875rem', boxShadow: '0 8px 24px rgba(0,94,154,0.12)' },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
