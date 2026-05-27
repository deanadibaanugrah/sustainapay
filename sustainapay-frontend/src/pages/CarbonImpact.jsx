import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from "./LanguageContext";

// --- KAMUS TERJEMAHAN UNTUK CARBON IMPACT PAGE ---
const translations = {
  en: {
    home: "Home",
    dashboard: "Dashboard",
    transactions: "Transactions",
    carbonImpact: "Carbon Impact",
    recommendations: "Recommendations",
    rewards: "Rewards",
    profile: "Profile",
    title: "Your Carbon Impact",
    subtitle: "Understand and reduce your environmental footprint",
    thisMonth: "This Month",
    thisYear: "This Year",
    share: "Share",
    greatProgress: "Great Progress",
    emittedText: "CO2e emitted this",
    top15: "Top 15% of eco-savers",
    monthlyAvg: "Monthly Avg",
    vsLast: "vs last",
    treesEq: "Trees Equivalent",
    trees: "trees",
    neededToOffset: "Needed to offset emissions",
    offsetProgress: "Offset Progress",
    breakdownTitle: "Emissions Breakdown",
    transportation: "Transportation",
    motorcycle: "Motorcycle",
    car: "Car",
    publicTransport: "Public Transport",
    insightsTitle: "Personalized Insights",
    askAI: "Ask AI",
    aiAnalysisTitle: "Sustaina-AI Analysis",
    aiText1: "I see that",
    aiText2: "takes up",
    aiText3: "of your total emissions this",
    aiText4: "If you replace 2 car trips per week with public transport, you can reduce up to",
    aiText5: "next month!",
    aiBtn: "View Public Transport Routes 🚆",
    warningTitle: "High Transport Emissions",
    warningText1: "Your car trips accounted for",
    warningText2: "of your footprint this",
    warningText3: "Consider carpooling or public transit.",
    viewAlt: "View Alternatives",
    footerDesc: "Track your carbon footprint with every transactions.",
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
    rights: "All rights reserved."
  },
  id: {
    home: "Beranda",
    dashboard: "Dasbor",
    transactions: "Transaksi",
    carbonImpact: "Dampak Karbon",
    recommendations: "Rekomendasi",
    rewards: "Hadiah",
    profile: "Profil",
    title: "Dampak Karbon Anda",
    subtitle: "Pahami dan kurangi jejak lingkungan Anda",
    thisMonth: "Bulan Ini",
    thisYear: "Tahun Ini",
    share: "Bagikan",
    greatProgress: "Kemajuan Bagus",
    emittedText: "CO2e dihasilkan",
    top15: "15% Teratas penyelamat bumi",
    monthlyAvg: "Rata-rata Bulanan",
    vsLast: "vs",
    treesEq: "Setara Pohon",
    trees: "pohon",
    neededToOffset: "Dibutuhkan untuk menebus emisi",
    offsetProgress: "Progres Penebusan",
    breakdownTitle: "Rincian Emisi",
    transportation: "Transportasi",
    motorcycle: "Sepeda Motor",
    car: "Mobil",
    publicTransport: "Transportasi Umum",
    insightsTitle: "Wawasan Personal",
    askAI: "Tanya AI",
    aiAnalysisTitle: "Analisis Sustaina-AI",
    aiText1: "Saya melihat",
    aiText2: "memakan",
    aiText3: "dari total emisi kamu",
    aiText4: "Jika kamu mengganti 2 perjalanan mobil per minggu dengan transportasi umum, kamu bisa mengurangi hingga",
    aiText5: "bulan depan!",
    aiBtn: "Lihat Rute Transportasi Umum 🚆",
    warningTitle: "Emisi Transportasi Tinggi",
    warningText1: "Perjalanan mobil Anda menyumbang",
    warningText2: "dari jejak Anda",
    warningText3: "Pertimbangkan carpooling atau transportasi umum.",
    viewAlt: "Lihat Alternatif",
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
    rights: "Hak cipta dilindungi."
  }
};

const CarbonImpact = () => {
  // 1. Ambil state lang dari Context
  const { lang } = useLanguage(); 
  const t = translations[lang];

  const [timeFrame, setTimeFrame] = useState('Month'); 
  const [showAITips, setShowAITips] = useState(false); 

  // --- STATE UNTUK AVATAR NAVBAR ---
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
        const initials = getInitials(parsedUser.name);
        const userAvatar = localStorage.getItem('user_avatar') || parsedUser.avatar || `https://ui-avatars.com/api/?name=${initials}&background=00A651&color=fff`;
        return { name: parsedUser.name, avatar: userAvatar, initials: initials };
      } catch (err) {
        console.error(err);
        return { name: '', avatar: null, initials: 'U' };
      }
    }
    return { avatar: '', initials: 'U' };
  });

  const defaultDataMap = {
    Month: {
      total: '0', unit: 'kg', avg: '0 kg', trees: '0', offset: 0,
      categories: [
        { name: 'Motorcycle', icon: '🏍️', value: 0, color: 'bg-green-500', amount: '0 kg' },
        { name: 'Car', icon: '🚗', value: 0, color: 'bg-blue-500', amount: '0 kg' },
        { name: 'Public Transport', icon: '🚆', value: 0, color: 'bg-purple-500', amount: '0 kg' }
      ]
    },
    Year: {
      total: '0', unit: 'kg', avg: '0 kg', trees: '0', offset: 0,
      categories: [
        { name: 'Motorcycle', icon: '🏍️', value: 0, color: 'bg-green-500', amount: '0 kg' },
        { name: 'Car', icon: '🚗', value: 0, color: 'bg-blue-500', amount: '0 kg' },
        { name: 'Public Transport', icon: '🚆', value: 0, color: 'bg-purple-500', amount: '0 kg' }
      ]
    }
  };

  const [backendData, setBackendData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCarbonImpact = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000')}/api/carbon-impact`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (res.ok) setBackendData(result.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCarbonImpact();
  }, []);

  const currentData = backendData ? backendData[timeFrame] : defaultDataMap[timeFrame];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6FCF9]">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
            {/* Navigasi Aktif (Carbon Impact) */}
            <Link to="/carbon-impact" className="px-5 py-2 text-sm font-black text-white bg-[#00A651] shadow-md shadow-green-200 rounded-full transition-all">
              {t.carbonImpact}
            </Link>
            <Link to="/recommendations" className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">
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
        
        {/* HEADER & FILTER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900">{t.title}</h1>
            <p className="text-gray-500 font-medium mt-1">{t.subtitle}</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Filter Waktu */}
            <div className="bg-white p-1 rounded-full border border-gray-200 flex">
              <button 
                onClick={() => setTimeFrame('Month')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${timeFrame === 'Month' ? 'bg-[#00A651] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {t.thisMonth}
              </button>
              <button 
                onClick={() => setTimeFrame('Year')}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${timeFrame === 'Year' ? 'bg-[#00A651] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {t.thisYear}
              </button>
            </div>

            <button className="bg-white border border-gray-200 text-gray-700 px-5 py-2 rounded-full text-sm font-bold shadow-sm hover:bg-gray-50 transition flex items-center gap-2">
              <span>📤</span> {t.share}
            </button>
          </div>
        </div>

        {/* TOP SECTION: Main Score & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Main Visual Score */}
          <div className="lg:col-span-1 bg-[#0B132B] text-white p-10 rounded-[3rem] shadow-xl relative overflow-hidden flex flex-col justify-center items-center text-center transition-all duration-300">
            <div className="relative z-10">
              <span className="bg-green-500/20 text-green-400 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">{t.greatProgress}</span>
              <h2 className="text-6xl font-black mb-2 mt-2">{currentData.total}<span className="text-2xl text-gray-400 ml-1">{currentData.unit}</span></h2>
              <p className="text-gray-400 font-bold text-sm mb-6">{t.emittedText} {timeFrame === 'Month' ? t.thisMonth.toLowerCase() : t.thisYear.toLowerCase()}</p>
              
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                <span className="text-xl">🏆</span>
                <span className="text-sm font-bold text-white">{t.top15}</span>
              </div>
            </div>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 opacity-20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4"></div>
          </div>

          {/* 3 Quick Stats Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col justify-center">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-xl mb-4">☁️</div>
              <p className="text-sm font-bold text-gray-400 mb-1">{t.monthlyAvg}</p>
              <h3 className="text-3xl font-black text-gray-900">{currentData.avg}</h3>
              <p className="text-xs text-green-500 font-bold mt-2">↓ 12% {t.vsLast} {timeFrame === 'Month' ? t.thisMonth.toLowerCase() : t.thisYear.toLowerCase()}</p>
            </div>
            
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col justify-center">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-xl mb-4">🌳</div>
              <p className="text-sm font-bold text-gray-400 mb-1">{t.treesEq}</p>
              <h3 className="text-3xl font-black text-gray-900">{currentData.trees} <span className="text-sm text-gray-400">{t.trees}</span></h3>
              <p className="text-xs text-gray-400 font-bold mt-2">{t.neededToOffset}</p>
            </div>

            <div className="bg-[#00A651] p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-center text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-xl mb-4">🌱</div>
                <p className="text-sm font-bold text-white/80 mb-1">{t.offsetProgress}</p>
                <h3 className="text-3xl font-black text-white">{currentData.offset}%</h3>
                <div className="w-full bg-white/30 h-2 rounded-full mt-3">
                  <div className="bg-white h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${currentData.offset}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: Breakdown & Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Emission Breakdown */}
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50">
            <h3 className="text-xl font-black text-gray-900 mb-8">{t.breakdownTitle}</h3>
            
            <div className="space-y-6">
              {currentData.categories.map((cat, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{cat.icon}</span>
                      <span className="font-bold text-gray-800 text-sm">
                        {cat.name === 'Transportation' ? t.transportation : 
                         cat.name === 'Motorcycle' ? t.motorcycle :
                         cat.name === 'Car' ? t.car :
                         cat.name === 'Public Transport' ? t.publicTransport :
                         cat.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-gray-900">{cat.value}%</span>
                      <span className="text-xs text-gray-400 font-bold ml-2">({cat.amount})</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div className={`${cat.color} h-full rounded-full transition-all duration-700 ease-in-out`} style={{ width: `${cat.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights & Actions */}
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-900">{t.insightsTitle}</h3>
              <button 
                onClick={() => setShowAITips(!showAITips)}
                className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full font-bold hover:bg-indigo-100 transition flex items-center gap-1"
              >
                ✨ {t.askAI}
              </button>
            </div>
            
            <div className="space-y-4 flex-grow">
              {showAITips ? (
                // Tampilan AI Insight saat tombol "Ask AI" diklik
                <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[2rem] border border-indigo-100 animate-[fadeIn_0.3s_ease-out]">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🤖</span>
                    <h4 className="font-black text-indigo-800">{t.aiAnalysisTitle}</h4>
                  </div>
                  <p className="text-sm text-indigo-900/80 font-medium leading-relaxed mb-4">
                    {t.aiText1} <strong>{t.transportation}</strong> {t.aiText2} {currentData.categories[0].value}% {t.aiText3} {timeFrame === 'Month' ? t.thisMonth.toLowerCase() : t.thisYear.toLowerCase()}. 
                    {t.aiText4} <strong>35 kg CO2</strong> {t.aiText5}
                  </p>
                  <button className="w-full bg-indigo-600 text-white font-bold text-sm py-2.5 rounded-xl hover:bg-indigo-700 transition">
                    {t.aiBtn}
                  </button>
                </div>
              ) : (
                // Tampilan Default Insight (Hanya Transportasi)
                <>
                  <div className="flex gap-4 p-5 bg-red-50 rounded-[2rem] border border-red-100 items-start">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-xl shrink-0">⚠️</div>
                    <div>
                      <h4 className="font-black text-red-800 mb-1">{t.warningTitle}</h4>
                      <p className="text-xs text-red-600/80 font-bold leading-relaxed mb-3">
                        {t.warningText1} {currentData.categories[0].value}% {t.warningText2} {timeFrame === 'Month' ? t.thisMonth.toLowerCase() : t.thisYear.toLowerCase()}. {t.warningText3}
                      </p>
                      <button className="text-xs font-black text-red-700 bg-red-200/50 px-4 py-2 rounded-full hover:bg-red-200 transition">
                        {t.viewAlt}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

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

export default CarbonImpact;