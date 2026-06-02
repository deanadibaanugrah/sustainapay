
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import Provider Bahasa (Path sudah diperbaiki mengarah ke folder pages)
import { LanguageProvider } from './pages/LanguageContext'; 

// Lazy load semua halaman agar tidak dimuat sekaligus (Code Splitting)
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Transactions = lazy(() => import('./pages/Transactions'));
const CarbonImpact = lazy(() => import('./pages/CarbonImpact'));
const RecommendationsPage = lazy(() => import('./pages/RecommendationsPage'));
const RewardsPage = lazy(() => import('./pages/RewardsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Komponen loading ringan yang muncul saat halaman sedang dimuat
const PageLoader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F6FCF9' }}>
    <div style={{ width: 40, height: 40, border: '4px solid #E5E7EB', borderTopColor: '#00A651', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

function App() {
  return (
    // Bungkus seluruh Router dengan LanguageProvider
    <LanguageProvider>
      <Toaster position="top-center" />
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Rute Halaman User */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/carbon-impact" element={<CarbonImpact />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/rewards" element={<RewardsPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Rute Halaman Admin */}
            <Route path="/admin" element={<AdminDashboard />} />
            
          </Routes>
        </Suspense>
      </Router>
    </LanguageProvider>
  );
}

export default App;
