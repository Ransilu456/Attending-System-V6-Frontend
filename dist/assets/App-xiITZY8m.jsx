import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { lazy, Suspense } from 'react';

// Layout
import MainLayout from './layouts/MainLayout';

// Create a loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

// Lazy load pages
// Auth Pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));

// Home Page
const HomePage = lazy(() => import('./pages/home/HomePage'));

// Main Dashboard Pages
const DashboardPage = lazy(() => import('./pages/main/DashboardPage'));
const StudentsPage = lazy(() => import('./pages/main/StudentsPage'));
const AttendanceByDatePage = lazy(() => import('./pages/main/AttendanceByDatePage'));
const QRScannerPage = lazy(() => import('./pages/main/QRScannerPage'));
const ReportsPage = lazy(() => import('./pages/main/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/main/SettingsPage'));
const StudentRegistrationPage = lazy(() => import('./pages/main/StudentRegistrationPage'));
const ProfilePage = lazy(() => import('./pages/main/ProfilePage'));
const AttendanceHistoryPage = lazy(() => import('./pages/main/AttendanceHistoryPage'));
const WhatsAppManagementPage = lazy(() => import('./pages/main/WhatsAppManagementPage'));

// Error Pages
const NotFound = lazy(() => import('./pages/errors/NotFound'));

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const ThemedToaster = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName="z-50"
      containerStyle={{
        top: 20,
        right: 20,
      }}
      toastOptions={{
        duration: 5000,
        style: {
          background: isDark ? '#1e293b' : '#ffffff',
          color: isDark ? '#f1f5f9' : '#334155',
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          padding: '12px 16px',
          boxShadow: isDark ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
          fontSize: '14px',
          maxWidth: '350px',
        },
        success: {
          iconTheme: {
            primary: isDark ? '#4ade80' : '#10b981',
            secondary: isDark ? '#0f172a' : '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: isDark ? '#f87171' : '#ef4444',
            secondary: isDark ? '#0f172a' : '#ffffff',
          },
        },
        loading: {
          iconTheme: {
            primary: isDark ? '#60a5fa' : '#3b82f6',
            secondary: isDark ? '#0f172a' : '#ffffff',
          },
        },
      }}
    />
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
            <ThemedToaster />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                
                {/* Redirect routes for direct navigation convenience */}
                <Route path="/students" element={<Navigate to="/dashboard/students" replace />} />
                <Route path="/scanner" element={<Navigate to="/dashboard/scanner" replace />} />
                <Route path="/attendance" element={<Navigate to="/dashboard/attendance" replace />} />
                <Route path="/reports" element={<Navigate to="/dashboard/reports" replace />} />
                <Route path="/settings" element={<Navigate to="/dashboard/settings" replace />} />
                <Route path="/profile" element={<Navigate to="/dashboard/profile" replace />} />
                <Route path="/whatsapp" element={<Navigate to="/dashboard/whatsapp" replace />} />
                
                {/* Dashboard Routes - Protected */}
                <Route path="/dashboard" element={
                  <ProtectedRoute adminOnly={true}>
                    <MainLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={
                    <ProtectedRoute adminOnly>
                      <DashboardPage />
                    </ProtectedRoute>
                  } />
                  <Route path="students" element={
                    <ProtectedRoute adminOnly>
                      <StudentsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="students/register" element={
                    <ProtectedRoute adminOnly>
                      <StudentRegistrationPage />
                    </ProtectedRoute>
                  } />
                  <Route path="attendance" element={
                    <ProtectedRoute adminOnly>
                      <AttendanceByDatePage />
                    </ProtectedRoute>
                  } />
                  <Route path="attendance/history/:studentId" element={
                    <ProtectedRoute adminOnly>
                      <AttendanceHistoryPage />
                    </ProtectedRoute>
                  } />
                  <Route path="scanner" element={<QRScannerPage />} />
                  <Route path="reports" element={
                    <ProtectedRoute adminOnly>
                      <ReportsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="settings" element={
                    <ProtectedRoute adminOnly>
                      <SettingsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="profile" element={
                    <ProtectedRoute adminOnly>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route
                    path="whatsapp"
                    element={
                      <ProtectedRoute adminOnly>
                        <WhatsAppManagementPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
