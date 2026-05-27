import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from "./LanguageContext";
// Mengaktifkan Recharts untuk visualisasi data emisi karbon
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

// --- KAMUS TERJEMAHAN UNTUK DASHBOARD ---
const translations = {
  en: {
    home: "Home",
    dashboard: "Dashboard",
    transactions: "Transactions",
    carbonImpact: "Carbon Impact",
    recommendations: "Recommendations",
    rewards: "Rewards",
    profile: "Profile",
    welcome: "Welcome back",
    overview: "Here's your carbon footprint overview for this month",
    totalCarbon: "Total Carbon",
    vsLastMonth: "Vs Last Month",
    thisMonth: "This Month",
    carbonSaved: "Carbon Saved",
    trendTitle: "Carbon Emission Trend",
    trendSubtitle: "Your Daily Carbon Footprint Over Time",
    week: "Week",
    month: "Month",
    year: "Year",
    currentPeriod: "Current Period",
    prevPeriod: "Previous Period",
    recentTrans: "Recent Transactions",
    viewAll: "View all →",
    quickRecs: "Quick Recommendations",
    rec1Title: "Switch to Public Transport",
    rec1Desc: "Based on your commute patterns, using public transport could reduce your carbon by 45%",
    highImpact: "High Impact",
    save15: "Save 15.2 kg / month",
    rec2Title: "Shop at local markets",
    rec2Desc: "Local produce has 60% less carbon footprint than imported goods",
    mediumImpact: "Medium Impact",
    rewardsProgram: "Rewards Program",
    ptsAway: "You're 250 points away from your next reward!",
    nextTier: "Next Tier: 2,000 Points",
    totalPoints: "Total Points",
    pointEarned: "Point Earned",
    currentTier: "Current Tier",
    rewardsClaimed: "Rewards Claimed",
    nextRewards: "Next Rewards",
    pts: "pts",
    footerDesc: "Track your carbon footprint with every transaction.",
    product: "Product",
    features: "Features",
    pricing: "Pricing",
    security: "Security",
    company: "Company",
    about: "About",
    blog: "Blog",
    careers: "Careers",
    support: "Support",
    helpCenter: "Help Center",
    contact: "Contact",
    privacy: "Privacy",
    rights: "All rights reserved.",
    fetchFail: "Failed to load data.",
    serverFail: "Failed to connect to Laravel server."
  },
  id: {
    home: "Beranda",
    dashboard: "Dasbor",
    transactions: "Transaksi",
    carbonImpact: "Dampak Karbon",
    recommendations: "Rekomendasi",
    rewards: "Hadiah",
    profile: "Profil",
    welcome: "Selamat datang kembali",
    overview: "Berikut ringkasan jejak karbon Anda bulan ini",
    totalCarbon: "Total Karbon",
    vsLastMonth: "Vs Bulan Lalu",
    thisMonth: "Bulan Ini",
    carbonSaved: "Karbon Dihemat",
    trendTitle: "Tren Emisi Karbon",
    trendSubtitle: "Jejak Karbon Harian Anda dari Waktu ke Waktu",
    week: "Minggu",
    month: "Bulan",
    year: "Tahun",
    currentPeriod: "Periode Saat Ini",
    prevPeriod: "Periode Sebelumnya",
    recentTrans: "Transaksi Terakhir",
    viewAll: "Lihat semua →",
    quickRecs: "Rekomendasi Cepat",
    rec1Title: "Beralih ke Transportasi Umum",
    rec1Desc: "Berdasarkan pola perjalanan Anda, transportasi umum dapat mengurangi karbon hingga 45%",
    highImpact: "Dampak Tinggi",
    save15: "Hemat 15.2 kg / bulan",
    rec2Title: "Belanja di pasar lokal",
    rec2Desc: "Produk lokal memiliki jejak karbon 60% lebih rendah daripada barang impor",
    mediumImpact: "Dampak Sedang",
    rewardsProgram: "Program Hadiah",
    ptsAway: "Tinggal 250 poin lagi untuk hadiah berikutnya!",
    nextTier: "Tingkat Berikutnya: 2.000 Poin",
    totalPoints: "Total Poin",
    pointEarned: "Poin Diperoleh",
    currentTier: "Tingkat Saat Ini",
    rewardsClaimed: "Hadiah Diklaim",
    nextRewards: "Hadiah Berikutnya",
    pts: "poin",
    footerDesc: "Lacak jejak karbon Anda di setiap transaksi.",
    product: "Produk",
    features: "Fitur",
    pricing: "Harga",
    security: "Keamanan",
    company: "Perusahaan",
    about: "Tentang",
    blog: "Blog",
    careers: "Karier",
    support: "Dukungan",
    helpCenter: "Pusat Bantuan",
    contact: "Kontak",
    privacy: "Privasi",
    rights: "Hak cipta dilindungi.",
    fetchFail: "Gagal memuat data.",
    serverFail: "Gagal terhubung ke server Laravel."
  }
};

const DEFAULT_CHART_DATA = {
  Week: [40, 70, 45, 90, 65, 80, 55],
  Month: [40, 70, 45, 90, 65, 80, 55, 95, 70, 85, 60, 75, 50, 90, 100],
  Year: [60, 80, 50, 90, 70, 85, 65, 95, 75, 85, 60, 80]
};

const DEFAULT_TRANSACTIONS = [
  { icon: '🚌', name: 'Bus', time: '2 hours ago', val: '0.5 kg' },
  { icon: '🚗', name: 'Car', time: '2 hours ago', val: '2.0 kg' },
  { icon: '🏍️', name: 'Motorcycle', time: '2 hours ago', val: '12.1 kg' },
  { icon: '🚆', name: 'Public Transport', time: '2 hours ago', val: '1.2 kg' },
  { icon: '🚕', name: 'Taxi', time: '2 hours ago', val: '5.5 kg' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  
  // 1. TANGKAP BAHASA DENGAN AMAN (ANTI-CRASH)
  const contextData = useLanguage() || {};
  const activeLang = contextData.language || contextData.lang || 'ID'; 
  const safeLang = String(activeLang).toUpperCase() === 'EN' ? 'en' : 'id'; 
  
  const t = useMemo(() => translations[safeLang] || translations.id, [safeLang]);

  const [activeTab, setActiveTab] = useState('Week');
  const [navUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const getInitials = (name) => {
          if (!name) return 'U';
          const words = name.split(' ');
          if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
          return name.substring(0, 2).toUpperCase();
        };
        const initials = getInitials(parsedUser?.name);
        const userAvatar = localStorage.getItem('user_avatar') || parsedUser?.avatar || `https://ui-avatars.com/api/?name=${initials}&background=00A651&color=fff`;
        return { name: parsedUser?.name, avatar: userAvatar, initials };
      } catch (err) {
        console.error(err);
        return { name: 'User', avatar: null, initials: 'U' };
      }
    }
    return { avatar: '', initials: 'U' };
  });
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_avatar');
    navigate('/login');
  }, [navigate]);

  // Fetch data dari endpoint dashboard Laravel
  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000')}/api/dashboard`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        const result = await response.json();

        if (response.ok) {
          setDashboardData(result.data || result);
        } else {
          setError(result.message || t.fetchFail);
          if (response.status === 401) {
            handleLogout();
          }
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setError(t.serverFail);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate, t, handleLogout]);

  // Format Chart Data & Proteksi Terhadap Data yang Bukan Array
  const formattedChartData = useMemo(() => {
    const rawData = dashboardData?.chart?.[activeTab] || DEFAULT_CHART_DATA[activeTab];
    const safeData = Array.isArray(rawData) ? rawData : [];
    
    return safeData.map((item, index) => {
      const currentVal = typeof item === 'object' ? (item.value || item.carbon || 0) : item;
      const label = typeof item === 'object' ? (item.label || item.day || item.name || `${index + 1}`) : `${index + 1}`;
      
      return {
        name: activeTab === 'Week' ? `Day ${label}` : label,
        current: currentVal,
        previous: currentVal * 0.75 // Simulasi pembanding data periode sebelumnya
      };
    });
  }, [dashboardData, activeTab]);

  // Pengaman Data Transaksi Terakhir
  const transactionsList = useMemo(() => {
    const list = dashboardData?.transactions || DEFAULT_TRANSACTIONS;
    return Array.isArray(list) ? list : DEFAULT_TRANSACTIONS;
  }, [dashboardData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6FCF9]">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6FCF9] font-sans text-gray-900">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00A651] to-green-700 flex items-center justify-center rounded-xl shadow-lg shadow-green-200 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-[10px] tracking-widest">LOGO</span>
            </div>
            <span className="font-black text-xl tracking-tight text-gray-900 hidden md:block">
              Sustaina<span className="text-[#00A651]">Pay</span>
            </span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-1 bg-gray-50/80 border border-gray-100 p-1.5 rounded-full shadow-inner">
            <Link to="/" className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">
              {t.home}
            </Link>
            <Link to="/dashboard" className="px-5 py-2 text-sm font-black text-white bg-[#00A651] shadow-md shadow-green-200 rounded-full transition-all">
              {t.dashboard}
            </Link>
            <Link to="/transactions" className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">
              {t.transactions}
            </Link>
            <Link to="/carbon-impact" className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">
              {t.carbonImpact}
            </Link>
            <Link to="/recommendations" className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">
              {t.recommendations}
            </Link>
            <Link to="/rewards" className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">
              {t.rewards}
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative w-10 h-10 bg-white border border-gray-100 text-gray-600 rounded-full flex items-center justify-center shadow-sm hover:bg-green-50 hover:text-green-600 transition-all hover:scale-105">
              🔔
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <Link to="/profile" className="flex items-center gap-3 p-1.5 pr-4 bg-white border border-gray-100 rounded-full shadow-sm hover:bg-green-50 transition-all hover:shadow-md group">
              <div className="w-8 h-8 bg-[#00A651] rounded-full overflow-hidden border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm group-hover:scale-105 transition-transform">
                {navUser?.avatar ? (
                  <img src={navUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  navUser?.initials || 'U'
                )}
              </div>
              <span className="text-sm font-bold text-gray-700 hidden sm:block group-hover:text-green-700">{t.profile}</span>
            </Link>
          </div>

        </div>
      </nav>

      {/* CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-8 py-10">
        {error && (
           <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl font-medium border border-red-100">
             {error}
           </div>
        )}

        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900">
            {t.welcome}, {dashboardData?.user?.name || 'User'}!
          </h1>
          <p className="text-gray-500 font-medium">{t.overview}</p>
        </div>

        {/* TOP SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-bold text-gray-400">{t.totalCarbon}</p>
              <span className="bg-green-100 text-green-600 text-xs font-bold px-3 py-1 rounded-full">↑ 23%</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900">
              {dashboardData?.summary?.total_carbon ?? '557.4'} <span className="text-lg font-bold text-gray-400">kg</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1 font-bold">{t.vsLastMonth}</p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-bold text-gray-400">{t.thisMonth}</p>
              <span className="bg-pink-100 text-pink-500 text-xs font-bold px-3 py-1 rounded-full">↑ 5%</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900">
              {dashboardData?.summary?.this_month ?? '124.5'} <span className="text-lg font-bold text-gray-400">kg</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1 font-bold">{t.vsLastMonth}</p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-bold text-gray-400">{t.carbonSaved}</p>
              <span className="bg-green-100 text-green-600 text-xs font-bold px-3 py-1 rounded-full">↑ 23%</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900">
              {dashboardData?.summary?.carbon_saved ?? '124.5'} <span className="text-lg font-bold text-gray-400">kg</span>
            </h2>
            <p className="text-xs text-gray-400 mt-1 font-bold">{t.vsLastMonth}</p>
          </div>
        </div>

        {/* CHART SECTION (RECHARTS IMPLEMENTATION) */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h3 className="text-xl font-black text-gray-900">{t.trendTitle}</h3>
              <p className="text-sm text-gray-400 font-medium mt-1">{t.trendSubtitle}</p>
            </div>
            
            <div className="flex bg-gray-100 p-1 rounded-full self-end sm:self-auto">
              {['Week', 'Month', 'Year'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                    activeTab === tab 
                      ? 'bg-green-500 text-white shadow-md' 
                      : 'text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {t[tab.toLowerCase()]}
                </button>
              ))}
            </div>
          </div>
          
          {/* IMPLEMENTASI RENDER UTAMA RECHARTS */}
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#F9FAFB' }} contentStyle={{ borderRadius: '1rem', border: '1px solid #E5E7EB' }} />
                <Bar dataKey="current" fill="#00A651" radius={[6, 6, 0, 0]} maxBarSize={activeTab === 'Month' ? 12 : 32} name={t.currentPeriod} />
                <Bar dataKey="previous" fill="#DCFCE7" radius={[6, 6, 0, 0]} maxBarSize={activeTab === 'Month' ? 12 : 32} name={t.prevPeriod} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-8 mt-6">
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-[#00A651] rounded-full"></div>
               <span className="text-xs font-bold text-gray-500">{t.currentPeriod}</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-green-100 rounded-full"></div>
               <span className="text-xs font-bold text-gray-500">{t.prevPeriod}</span>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Recent Transactions */}
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-900">{t.recentTrans}</h3>
              <Link to="/transactions" className="text-green-600 font-bold text-sm hover:underline">{t.viewAll}</Link>
            </div>
            <div className="space-y-5">
              {transactionsList.map((item, i) => (
                <div key={i} className="flex justify-between items-center pb-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 p-2 rounded-xl transition cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-xl shadow-sm">
                      {item.icon || '📝'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{item.name || item.category || item.description || 'Transaction'}</p>
                      <p className="text-xs text-gray-400 font-bold">{item.date || item.time || item.created_at || 'Just now'}</p>
                    </div>
                  </div>
                  <span className="font-black text-gray-800">
                    {item.carbon || item.val || `${item.carbon_emitted || 0} kg`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-50">
            <h3 className="text-xl font-black text-gray-900 mb-6">{t.quickRecs}</h3>
            <div className="space-y-6">
              {dashboardData?.quick_recommendations && dashboardData.quick_recommendations.length > 0 ? (
                dashboardData.quick_recommendations.map((rec, idx) => (
                  <div key={idx} className={`p-5 rounded-[2rem] border hover:shadow-md transition cursor-pointer ${idx % 2 === 0 ? 'bg-green-50 border-green-100' : 'bg-purple-50 border-purple-100'}`}>
                    <p className="font-black text-gray-800 mb-1">{rec.title || 'Saran AI'}</p>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3">{rec.description}</p>
                    <div className="flex justify-between items-center">
                       <span className={`text-white text-[10px] font-black px-3 py-1 rounded-full uppercase ${idx % 2 === 0 ? 'bg-green-600' : 'bg-purple-600'}`}>{rec.impact || 'Dampak Sedang'}</span>
                       {rec.savings && <span className={`text-[10px] font-black underline ${idx % 2 === 0 ? 'text-green-600' : 'text-purple-600'}`}>Hemat {rec.savings}</span>}
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="p-5 bg-green-50 rounded-[2rem] border border-green-100 hover:shadow-md transition cursor-pointer">
                    <p className="font-black text-gray-800 mb-1">{t.rec1Title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3">{t.rec1Desc}</p>
                    <div className="flex justify-between items-center">
                       <span className="bg-green-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">{t.highImpact}</span>
                       <span className="text-[10px] font-black text-green-600 underline">{t.save15}</span>
                    </div>
                  </div>
                  <div className="p-5 bg-purple-50 rounded-[2rem] border border-purple-100 hover:shadow-md transition cursor-pointer">
                    <p className="font-black text-gray-800 mb-1">{t.rec2Title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3">{t.rec2Desc}</p>
                    <div className="flex justify-between items-center">
                       <span className="bg-purple-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">{t.mediumImpact}</span>
                       <span className="text-[10px] font-black text-purple-600 underline">{t.save15}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="bg-[#FFB800] p-10 rounded-[3rem] shadow-xl text-white relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
            <div className="flex-1 w-full">
              <h3 className="text-2xl font-black mb-2">{t.rewardsProgram}</h3>
              <p className="font-bold opacity-90 mb-6">{t.ptsAway}</p>
              
              <div className="w-full bg-white/30 h-4 rounded-full mb-2">
                <div className="bg-white h-4 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <div className="flex justify-between text-xs font-black">
                <span>{dashboardData?.rewards?.points || '1,750'}</span>
                <span>{t.nextTier}</span>
              </div>
            </div>
            
            <div className="text-center md:text-right">
               <p className="text-xs font-black opacity-80 uppercase tracking-widest">{t.totalPoints}</p>
               <h2 className="text-6xl font-black">{dashboardData?.rewards?.points || '1,750'}</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-white/20 relative z-10">
            <div className="text-center">
              <p className="text-[10px] font-black opacity-70 uppercase mb-1">{t.pointEarned}</p>
              <p className="font-black text-xl">{dashboardData?.rewards?.points || '1,750'}</p>
            </div>
            <div className="text-center border-l border-white/10">
              <p className="text-[10px] font-black opacity-70 uppercase mb-1">{t.currentTier}</p>
              <p className="font-black text-xl">{dashboardData?.rewards?.tier || 'Gold'}</p>
            </div>
            <div className="text-center border-l border-white/10">
              <p className="text-[10px] font-black opacity-70 uppercase mb-1">{t.rewardsClaimed}</p>
              <p className="font-black text-xl">{dashboardData?.rewards?.claimed || '12'}</p>
            </div>
            <div className="text-center border-l border-white/10">
              <p className="text-[10px] font-black opacity-70 uppercase mb-1">{t.nextRewards}</p>
              <p className="font-black text-xl">250 {t.pts}</p>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full translate-x-20 -translate-y-20"></div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-[#0B132B] text-white py-16 mt-12">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="w-16 h-10 bg-green-800 border-2 border-white mb-6 flex items-center justify-center text-[8px] font-bold">LOGO</div>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              {t.footerDesc}
            </p>
          </div>
          <div>
            <h5 className="font-black text-sm mb-6">{t.product}</h5>
            <ul className="text-xs text-gray-400 space-y-4 font-bold">
              <li className="hover:text-white cursor-pointer transition">{t.features}</li>
              <li className="hover:text-white cursor-pointer transition">{t.pricing}</li>
              <li className="hover:text-white cursor-pointer transition">{t.security}</li>
            </ul>
          </div>
          <div>
            <h5 className="font-black text-sm mb-6">{t.company}</h5>
            <ul className="text-xs text-gray-400 space-y-4 font-bold">
              <li className="hover:text-white cursor-pointer transition">{t.about}</li>
              <li className="hover:text-white cursor-pointer transition">{t.blog}</li>
              <li className="hover:text-white cursor-pointer transition">{t.careers}</li>
            </ul>
          </div>
          <div>
            <h5 className="font-black text-sm mb-6">{t.support}</h5>
            <ul className="text-xs text-gray-400 space-y-4 font-bold">
              <li className="hover:text-white cursor-pointer transition">{t.helpCenter}</li>
              <li className="hover:text-white cursor-pointer transition">{t.contact}</li>
              <li className="hover:text-white cursor-pointer transition">{t.privacy}</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 mt-16 pt-8 border-t border-gray-800 text-center text-[10px] text-gray-500 font-bold">
          © 2026 SustainaPay. {t.rights}
        </div>
      </footer>

    </div>
  );
};

export default Dashboard;