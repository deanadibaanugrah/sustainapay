import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from "./LanguageContext";

// --- KAMUS TERJEMAHAN UNTUK RECOMMENDATIONS PAGE ---
const translations = {
  en: {
    home: "Home",
    dashboard: "Dashboard",
    transactions: "Transactions",
    carbonImpact: "Carbon Impact",
    recommendations: "Recommendations",
    rewards: "Rewards",
    profile: "Profile",
    title: "Eco-Friendly Alternatives",
    subtitle: "Discover sustainable brands and services that help reduce your carbon footprint.",
    aiTitle: "Sustaina-AI Insights",
    analyzing: "Analyzing your last 30 days emissions...",
    totalEmissions: "Your Total Emissions:",
    fetchFail: "Failed to load AI suggestions.",
    serverFail: "Failed to connect to backend server.",
    catAll: "All",
    catGroceries: "Groceries",
    catTransport: "Transport",
    catShopping: "Shopping",
    catDining: "Dining",
    catUtilities: "Utilities",
    carbonSavings: "Carbon Savings",
    viewInfo: "View Info"
  },
  id: {
    home: "Beranda",
    dashboard: "Dasbor",
    transactions: "Transaksi",
    carbonImpact: "Dampak Karbon",
    recommendations: "Rekomendasi",
    rewards: "Hadiah",
    profile: "Profil",
    title: "Alternatif Ramah Lingkungan",
    subtitle: "Temukan merek dan layanan berkelanjutan yang membantu mengurangi jejak karbon Anda.",
    aiTitle: "Saran Cerdas AI Gemini",
    analyzing: "Sedang menganalisis emisi 30 hari terakhirmu...",
    totalEmissions: "Total Emisimu:",
    fetchFail: "Gagal memuat saran dari AI.",
    serverFail: "Terjadi kesalahan jaringan ke backend server.",
    catAll: "Semua",
    catGroceries: "Belanja Harian",
    catTransport: "Transportasi",
    catShopping: "Pakaian",
    catDining: "Kuliner",
    catUtilities: "Utilitas",
    carbonSavings: "Hemat Karbon",
    viewInfo: "Lihat Info"
  }
};

// --- Data Dummy Rekomendasi ---
const recommendationsData = [
  { id: 1, name: 'FreshFarm Organics', category: 'Groceries', description: 'Local, organic produce delivered to your door with zero-waste packaging.', impact: '-12 kg CO2/month', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80', logo: '🥦' },
  { id: 2, name: 'EcoRide Transit', category: 'Transport', description: '100% electric city transit network. Cheaper and greener than driving.', impact: '-45 kg CO2/month', image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=600&q=80', logo: '🚌' },
  { id: 3, name: 'ThriftThreads', category: 'Shopping', description: 'High-quality upcycled and second-hand fashion from top brands.', impact: '-8 kg CO2/item', image: 'https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?auto=format&fit=crop&w=600&q=80', logo: '👕' },
  { id: 4, name: 'GreenBite Eatery', category: 'Dining', description: 'Delicious plant-based meals sourced from local farmers.', impact: '-5 kg CO2/meal', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80', logo: '🥗' },
  { id: 5, name: 'SunPower Co.', category: 'Utilities', description: 'Switch your home electricity to 100% renewable solar energy.', impact: '-150 kg CO2/month', image: 'https://images.unsplash.com/photo-1509391366360-12009a308569?auto=format&fit=crop&w=600&q=80', logo: '☀️' },
  { id: 6, name: 'ZeroWaste Market', category: 'Groceries', description: 'Bring your own containers and shop bulk dry goods and household items.', impact: '-10 kg CO2/month', image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=600&q=80', logo: '🌾' },
];

// Kategori Internal (jangan diubah agar fungsi filter tidak rusak)
const categories = ['All', 'Groceries', 'Transport', 'Shopping', 'Dining', 'Utilities'];

const RecommendationsPage = () => {
  // 1. Ambil state lang dari Context
  const { lang } = useLanguage();
  const t = translations[lang];

  const [activeCategory, setActiveCategory] = useState('All');
  
  // --- STATE UNTUK AVATAR NAVBAR DINAMIS ---
  const [navUser, setNavUser] = useState({ name: '', avatar: null, initials: 'U' });

  // State untuk API AI
  const [aiData, setAiData] = useState(null);
  const [loadingAi, setLoadingAi] = useState(true);
  const [aiError, setAiError] = useState('');
  const navigate = useNavigate();

  // Mapping label kategori sesuai bahasa
  const categoryLabels = {
    'All': t.catAll,
    'Groceries': t.catGroceries,
    'Transport': t.catTransport,
    'Shopping': t.catShopping,
    'Dining': t.catDining,
    'Utilities': t.catUtilities
  };

  // --- MENGAMBIL DATA AVATAR DARI LOCALSTORAGE ---
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // 1. Ambil nama
        const fullName = parsedUser.name || 'User';

        // 2. Bikin inisial (2 huruf depan)
        const getInitials = (name) => {
          if (!name) return 'U';
          const words = name.trim().split(' ');
          if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
          return name.substring(0, 2).toUpperCase();
        };
        const initials = getInitials(fullName);

        // 3. Cari foto profil
        const userAvatar = localStorage.getItem('user_avatar') 
                        || parsedUser.profile_picture 
                        || parsedUser.avatar 
                        || null; 
        
        setNavUser({ name: fullName, avatar: userAvatar, initials });
      } catch (error) {
        console.error("Gagal parse data user:", error);
      }
    }
  }, []);

  // Memanggil API AI saat halaman pertama kali diload
  useEffect(() => {
    const fetchAiData = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/api/ai/recommendations/generate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setAiData(result.data);
        } else {
          setAiError(result.message || result.error || t.fetchFail);
        }
      } catch (err) {
        console.error("Fetch Error: ", err);
        setAiError(t.serverFail);
      } finally {
        setLoadingAi(false);
      }
    };

    fetchAiData();
  }, [navigate, t.fetchFail, t.serverFail]);

  const filteredData = activeCategory === 'All' 
    ? recommendationsData 
    : recommendationsData.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#F6FCF9] font-sans text-gray-900">
      
      {/* NAVBAR - GAYA LANDING PAGE (MODERN & FLOATING) */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          {/* KIRI: Logo & Nama Brand */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00A651] to-green-700 flex items-center justify-center rounded-xl shadow-lg shadow-green-200 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-[10px] tracking-widest">LOGO</span>
            </div>
            <span className="font-black text-xl tracking-tight text-gray-900 hidden md:block">
              Sustaina<span className="text-[#00A651]">Pay</span>
            </span>
          </Link>
          
          {/* TENGAH: Menu Navigasi (Pill Style) */}
          <div className="hidden lg:flex items-center gap-1 bg-gray-50/80 border border-gray-100 p-1.5 rounded-full shadow-inner">
            <Link to="/" className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">
              {t.home}
            </Link>
            <Link to="/dashboard" className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">
              {t.dashboard}
            </Link>
            <Link to="/transactions" className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">
              {t.transactions}
            </Link>
            <Link to="/carbon-impact" className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">
              {t.carbonImpact}
            </Link>
            {/* Navigasi Aktif (Recommendations) */}
            <Link to="/recommendations" className="px-5 py-2 text-sm font-black text-white bg-[#00A651] shadow-md shadow-green-200 rounded-full transition-all">
              {t.recommendations}
            </Link>
            <Link to="/rewards" className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">
              {t.rewards}
            </Link>
          </div>

          {/* KANAN: Notifikasi & Profil (Interaktif) */}
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
      {/* AKHIR NAVBAR */}

      {/* CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-8 py-10">
        
        {/* HEADER SECTION */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-[#00A651] mb-3">
            {t.title}
          </h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl">
            {t.subtitle}
          </p>
        </div>

        {/* --- AI GEMINI RECOMMENDATION BANNER --- */}
        <div className="mb-10 bg-white border border-[#DFF7ED] rounded-[2rem] p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">✨</div>
          <h2 className="text-2xl font-bold text-[#00A651] flex items-center gap-2 mb-4">
            <span>✨</span> {t.aiTitle}
          </h2>

          {loadingAi ? (
            <div className="flex items-center gap-3 text-green-600 font-semibold animate-pulse">
              <div className="w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              {t.analyzing}
            </div>
          ) : aiError ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl font-medium border border-red-100">
              {aiError}
            </div>
          ) : (
            <div>
              <p className="inline-block bg-[#E6FAF1] text-green-800 font-bold px-3 py-1 rounded-full text-sm mb-4">
                {t.totalEmissions} {aiData?.total_emisi}
              </p>
              <p className="text-gray-700 font-medium leading-relaxed whitespace-pre-wrap">
                {aiData?.ai_analysis}
              </p>
            </div>
          )}
        </div>
        {/* --- END AI BANNER --- */}

        {/* TABS / CATEGORY FILTER */}
        <div className="flex overflow-x-auto hide-scrollbar gap-3 mb-10 pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-semibold transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-[#00A651] text-white shadow-md shadow-green-200'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-[#00A651] hover:text-[#00A651]'
              }`}
            >
              {categoryLabels[category]}
            </button>
          ))}
        </div>

        {/* GRID KARTU REKOMENDASI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredData.map((item) => (
            <div key={item.id} className="bg-white rounded-[2rem] overflow-hidden border border-gray-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#00A651] shadow-sm">
                  {categoryLabels[item.category] || item.category}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#E6FAF1] rounded-full flex items-center justify-center text-xl shadow-sm border border-[#DFF7ED]">
                    {item.logo}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                </div>
                <p className="text-gray-500 font-medium text-sm mb-6 flex-grow leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t.carbonSavings}</p>
                    <p className="text-sm font-bold text-[#00A651] bg-[#E6FAF1] inline-block px-2 py-1 rounded-md">
                      {item.impact}
                    </p>
                  </div>
                  <button className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#00A651] transition-colors shadow-sm">
                    {t.viewInfo}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
};

export default RecommendationsPage;