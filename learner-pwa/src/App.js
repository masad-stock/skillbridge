import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './i18n';
import './styles/themes.css';
import './styles/fonts.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import SkillsAssessment from './pages/SkillsAssessment';
import LearningPath from './pages/LearningPath';
import BusinessTools from './pages/BusinessTools';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AssessmentInfo from './pages/AssessmentInfo';
import LearningInfo from './pages/LearningInfo';
import BusinessToolsInfo from './pages/BusinessToolsInfo';
import AdminLayout from './components/AdminLayout';
import OfflineIndicator from './components/OfflineIndicator';
import ErrorBoundary from './components/ErrorBoundary';
import VersionInfo from './components/VersionInfo';
import ChatWidget from './components/ChatWidget';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { UserProvider } from './context/UserContext';
import { OfflineProvider } from './context/OfflineContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { CourseProvider } from './context/CourseContext';
import { preventClickjacking, setCSRFToken } from './utils/security';
import { measureWebVitals } from './utils/performance';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import './App.css';

// Lazy load pages for code splitting
const SearchResults = lazy(() => import('./pages/SearchResults'));
const PaymentHistory = lazy(() => import('./pages/PaymentHistory'));
const Certificates = lazy(() => import('./pages/Certificates'));
const CertificateView = lazy(() => import('./pages/CertificateView'));
const VerifyCertificate = lazy(() => import('./pages/VerifyCertificate'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const Contact = lazy(() => import('./pages/Contact'));
const FAQ = lazy(() => import('./pages/FAQ'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const ModuleManagement = lazy(() => import('./pages/admin/EnhancedModuleManagement'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const ContentDeliveryDashboard = lazy(() => import('./components/admin/ContentDeliveryDashboard'));
const EconomicSurvey = lazy(() => import('./pages/EconomicSurvey'));
const CompetencyDashboard = lazy(() => import('./pages/CompetencyDashboard'));

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Security setup
    preventClickjacking();
    setCSRFToken();

    // Performance monitoring (only in production)
    if (process.env.NODE_ENV === 'production') {
      measureWebVitals((metric) => {
        // Log to analytics service
        console.log(metric);
      });
    }

    // Register Service Worker for offline-first functionality
    serviceWorkerRegistration.register({
      onSuccess: () => {
        console.log('SkillBridge is ready for offline use!');
      },
      onUpdate: (registration) => {
        console.log('New version available! Please refresh to update.');
        // Optionally show update notification to user
        if (window.confirm('A new version is available. Refresh to update?')) {
          registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      }
    });

    // Online/offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <ToastProvider>
            <UserProvider>
              <CourseProvider>
                <OfflineProvider value={isOnline}>
                  <Router>
                    <div className="App">
                      <Header />
                      <OfflineIndicator isOnline={isOnline} />
                      <main className="main">
                        <Suspense fallback={
                          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                            <div className="spinner-border text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        }>
                          <Routes>
                            {/* Public Routes - Only accessible when NOT authenticated */}
                            <Route path="/" element={<PublicRoute><Home /></PublicRoute>} />

                            {/* Info Pages - Accessible to all */}
                            <Route path="/about" element={<About />} />
                            <Route path="/assessment-info" element={<AssessmentInfo />} />
                            <Route path="/learning-info" element={<LearningInfo />} />
                            <Route path="/business-tools-info" element={<BusinessToolsInfo />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/faq" element={<FAQ />} />
                            <Route path="/privacy" element={<Privacy />} />
                            <Route path="/terms" element={<Terms />} />
                            <Route path="/verify/:code" element={<VerifyCertificate />} />

                            {/* Auth Routes - Accessible to all */}
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/reset-password/:token" element={<ResetPassword />} />

                            {/* Protected Routes - Only accessible when authenticated */}
                            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                            <Route path="/assessment" element={<ProtectedRoute><SkillsAssessment /></ProtectedRoute>} />
                            <Route path="/learning" element={<ProtectedRoute><LearningPath /></ProtectedRoute>} />
                            <Route path="/business-tools" element={<ProtectedRoute><BusinessTools /></ProtectedRoute>} />
                            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                            <Route path="/certificates" element={<ProtectedRoute><Certificates /></ProtectedRoute>} />
                            <Route path="/certificates/:id" element={<ProtectedRoute><CertificateView /></ProtectedRoute>} />
                            <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
                            <Route path="/search" element={<ProtectedRoute><SearchResults /></ProtectedRoute>} />
                            <Route path="/payments" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
                            <Route path="/economic-survey" element={<ProtectedRoute><EconomicSurvey /></ProtectedRoute>} />
                            <Route path="/competency" element={<ProtectedRoute><CompetencyDashboard /></ProtectedRoute>} />

                            {/* Admin Routes - Protected */}
                            <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                              <Route index element={<AdminDashboard />} />
                              <Route path="users" element={<UserManagement />} />
                              <Route path="modules" element={<ModuleManagement />} />
                              <Route path="content-delivery" element={<ContentDeliveryDashboard />} />
                              <Route path="analytics" element={<Analytics />} />
                              <Route path="settings" element={<Settings />} />
                            </Route>

                            {/* 404 - Catch all */}
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </Suspense>
                      </main>
                      <Footer />
                      <ChatWidget />
                      <VersionInfo />
                    </div>
                  </Router>
                </OfflineProvider>
              </CourseProvider>
            </UserProvider>
          </ToastProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary >
  );
}

export default App;