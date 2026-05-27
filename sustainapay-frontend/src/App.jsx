
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import Provider Bahasa (Path sudah diperbaiki mengarah ke folder pages)
import { LanguageProvider } from './pages/LanguageContext'; 

// Import semua halaman
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import CarbonImpact from './pages/CarbonImpact'; 
import RecommendationsPage from './pages/RecommendationsPage';
import RewardsPage from './pages/RewardsPage';
import ProfilePage from './pages/ProfilePage';

// ---> 1. IMPORT HALAMAN ADMIN DI SINI <---
import AdminDashboard from './pages/AdminDashboard'; 

function App() {
  return (
    // Bungkus seluruh Router dengan LanguageProvider
    <LanguageProvider>
      <Toaster position="top-center" />
      <Router>
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

          {/* ---> 2. RUTE HALAMAN ADMIN <--- */}
          <Route path="/admin" element={<AdminDashboard />} />
          
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;