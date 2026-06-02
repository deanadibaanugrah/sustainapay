import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from "./LanguageContext";
import { toast } from 'react-hot-toast';

const CarbonImpact = () => {
  // 1. Ambil state lang dari Context
  const contextData = useLanguage() || {};
  const tContext = contextData.t || {};
  const t = tContext.carbon || {};

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

  useEffect(() => {
    const fetchCarbonImpact = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || (import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000')}/api/carbon-impact`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (res.ok) setBackendData(result.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCarbonImpact();
  }, []);

  const currentData = backendData ? backendData[timeFrame] : defaultDataMap[timeFrame];

  const handleShare = async () => {
    const totalCarbon = currentData?.total || 0;
    const textToShare = `Saya berhasil menjaga jejak karbon saya tetap di angka ${totalCarbon} kg bulan ini menggunakan SustainaPay! 🌱 Ayo ikut kurangi jejak karbonmu!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dampak Karbon SustainaPay',
          text: textToShare,
          url: window.location.origin,
        });
        toast.success('Berhasil dibagikan!');
      } catch (error) {
        console.log('Batal membagikan', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(textToShare);
        toast.success('Teks disalin ke clipboard! Silakan paste di medsos Anda.');
      } catch (err) {
        toast.error('Gagal menyalin teks.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F6FCF9] font-sans text-gray-900">
      
      {/* NAVBAR - GAYA LANDING PAGE (MODERN & FLOATING) */}
      <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          {/* KIRI: Logo & Nama Brand */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition group">
            <img src="/logo.jpg" alt="Logo" className="w-10 h-10 object-cover rounded-xl border border-green-700/40 shadow-md ring-2 ring-white/50 group-hover:scale-105 transition-transform" />
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

            <button 
              onClick={handleShare}
              className="bg-white border border-gray-200 text-gray-700 px-5 py-2 rounded-full text-sm font-bold shadow-sm hover:bg-gray-50 transition flex items-center gap-2"
            >
              <span>📤</span> {t.share}
            </button>
          </div>
        </div>

        {/* TOP SECTION: Main Score & Rata-rata Bulanan */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Main Visual Score */}
          <div className="bg-[#0B132B] text-white p-10 rounded-3xl shadow-lg relative overflow-hidden flex flex-col justify-center items-center text-center">
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
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 opacity-20 rounded-full -translate-y-1/2 translate-x-1/4"></div>
          </div>

          {/* Rata-rata Bulanan */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col justify-center items-center text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-xl mb-4">☁️</div>
            <p className="text-sm font-bold text-gray-400 mb-1">{t.monthlyAvg}</p>
            <h3 className="text-5xl font-black text-gray-900">{currentData.avg}</h3>
            <p className="text-sm text-green-500 font-bold mt-3">↓ 12% {t.vsLast} {timeFrame === 'Month' ? t.thisMonth.toLowerCase() : t.thisYear.toLowerCase()}</p>
          </div>
          
        </div>

        {/* MIDDLE SECTION: Breakdown & Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Emission Breakdown */}
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-50">
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
                      <span className="font-black text-gray-900 text-sm">{cat.amount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights & Actions */}
          <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-50 flex flex-col">
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

      {/* MOBILE BOTTOM NAV */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center p-3 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
        <Link to="/dashboard" className="flex flex-col items-center text-gray-500 hover:text-green-600">
          <span className="text-xl">??</span>
          <span className="text-[10px] font-bold mt-1">Dash</span>
        </Link>
        <Link to="/transactions" className="flex flex-col items-center text-gray-500 hover:text-green-600">
          <span className="text-xl">??</span>
          <span className="text-[10px] font-bold mt-1">Trans</span>
        </Link>
        <Link to="/carbon-impact" className="flex flex-col items-center text-gray-500 hover:text-green-600">
          <span className="text-xl">??</span>
          <span className="text-[10px] font-bold mt-1">Carbon</span>
        </Link>
        <Link to="/recommendations" className="flex flex-col items-center text-gray-500 hover:text-green-600">
          <span className="text-xl">?</span>
          <span className="text-[10px] font-bold mt-1">Saran</span>
        </Link>
        <Link to="/rewards" className="flex flex-col items-center text-gray-500 hover:text-green-600">
          <span className="text-xl">??</span>
          <span className="text-[10px] font-bold mt-1">Reward</span>
        </Link>
      </div>
    </div>
  );
};

export default CarbonImpact;

