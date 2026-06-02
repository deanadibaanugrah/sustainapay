import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from "./LanguageContext";

const RecommendationsPage = () => {
  const contextData = useLanguage() || {};
  const tContext = contextData.t || {};
  const t = tContext.recommendations || {};

  const [navUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const fullName = parsedUser.name || 'User';
        const words = fullName.trim().split(' ');
        const initials = words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : fullName.substring(0, 2).toUpperCase();
        const userAvatar = localStorage.getItem('user_avatar') || parsedUser.profile_picture || parsedUser.avatar || null; 
        return { name: fullName, avatar: userAvatar, initials };
      } catch (error) { 
        console.error("Gagal parse data user:", error); 
        return { name: '', avatar: null, initials: 'U' };
      }
    }
    return { name: '', avatar: null, initials: 'U' };
  });
  const [aiHistory, setAiHistory] = useState([]);
  const [loadingAi, setLoadingAi] = useState(true);
  const [aiError, setAiError] = useState('');
  const navigate = useNavigate();

  // FETCH KE URL AI RECOMMENDATIONS
  useEffect(() => {
    const fetchAiHistory = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }

      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || (import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000')}/api/ai/recommendations`, { 
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });

        const result = await response.json();

        if (response.ok && result.success) {
          const dataToSet = Array.isArray(result.data) ? result.data : [];
          setAiHistory(dataToSet);
        } else {
          setAiError(result.message || t.fetchFail);
          setAiHistory([]);
        }
      } catch (err) {
        console.error(err);
        setAiError(t.serverFail);
        setAiHistory([]);
      } finally {
        setLoadingAi(false);
      }
    };

    fetchAiHistory();
  }, [navigate, t.fetchFail, t.serverFail]);

  return (
    <div className="min-h-screen bg-[#F6FCF9] font-sans text-gray-900">
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition group">
            <img src="/logo.jpg" alt="Logo" className="w-10 h-10 object-cover rounded-xl border border-green-700/40 shadow-md ring-2 ring-white/50 group-hover:scale-105 transition-transform" />
            <span className="font-black text-xl tracking-tight text-gray-900 hidden md:block">Sustaina<span className="text-[#00A651]">Pay</span></span>
          </Link>
          
          <div className="hidden lg:flex items-center gap-1 bg-gray-50/80 border border-gray-100 p-1.5 rounded-full shadow-inner">
            <Link to="/" className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">{t.home}</Link>
            <Link to="/dashboard" className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">{t.dashboard}</Link>
            <Link to="/transactions" className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">{t.transactions}</Link>
            <Link to="/carbon-impact" className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">{t.carbonImpact}</Link>
            <Link to="/recommendations" className="px-5 py-2 text-sm font-black text-white bg-[#00A651] shadow-md shadow-green-200 rounded-full transition-all">{t.recommendations}</Link>
            <Link to="/rewards" className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">{t.rewards}</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/profile" className="flex items-center gap-3 p-1.5 pr-4 bg-white border border-gray-100 rounded-full shadow-sm hover:bg-green-50 transition-all hover:shadow-md group">
              <div className="w-8 h-8 bg-[#00A651] rounded-full overflow-hidden border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm group-hover:scale-105 transition-transform">
                {navUser?.avatar ? <img src={navUser.avatar} alt="Profile" className="w-full h-full object-cover" /> : navUser?.initials || 'U'}
              </div>
              <span className="text-sm font-bold text-gray-700 hidden sm:block group-hover:text-green-700">{t.profile}</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-10">
        
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#00A651] mb-3 flex items-center gap-3">
            <span>✨</span> {t.title}
          </h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl">{t.subtitle}</p>
        </div>

        {/* --- RIWAYAT AI --- */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mt-8">
          {loadingAi ? (
            <div className="flex items-center justify-center gap-3 text-green-600 font-semibold animate-pulse bg-white p-10 rounded-[2rem] border border-[#DFF7ED] shadow-sm">
              <div className="w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div> {t.analyzing}
            </div>
          ) : aiError ? (
            <div className="bg-red-50 text-red-600 p-6 rounded-[2rem] font-medium border border-red-100 text-center">
              {aiError}
            </div>
          ) : !Array.isArray(aiHistory) || aiHistory.length === 0 ? (
            <div className="bg-white border border-gray-100 text-gray-500 p-12 rounded-[2rem] text-center font-medium shadow-sm flex flex-col items-center justify-center gap-4">
               <span className="text-5xl opacity-50">🤖</span>
               {t.noHistory}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {aiHistory.map((item, index) => (
                <div key={item.id || index} className="bg-white border border-[#DFF7ED] rounded-3xl p-8 shadow-sm hover:shadow-md transition relative overflow-hidden flex flex-col gap-4">
                  <div className="absolute -top-4 -right-4 p-4 opacity-5 text-8xl">✨</div>
                  
                  {/* Bagian Header Tiap Riwayat (Tanggal & Emisi) */}
                  <div className="flex justify-between items-start z-10 border-b border-gray-100 pb-4">
                    <div>
                      <span className="text-xs font-bold text-gray-400 block mb-1">TANGGAL TRANSAKSI</span>
                      <span className="font-bold text-gray-800">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Baru saja'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-gray-400 block mb-1 uppercase">{t.totalEmissions}</span>
                      <span className="inline-block bg-[#E6FAF1] text-green-800 font-black px-3 py-1 rounded-full text-sm">
                        {item.total_emisi ? parseFloat(item.total_emisi).toFixed(2) : "0.00"} kg
                      </span>
                    </div>
                  </div>
                  
                  {/* Teks Rekomendasi AI */}
                  <div className="z-10 bg-gray-50/50 p-4 rounded-2xl border border-gray-50 h-full">
                      <div className="text-gray-700 font-medium text-sm leading-relaxed whitespace-pre-wrap">
                        {(() => {
                          const text = item.ai_analysis || "Tidak ada detail analisis yang tersimpan.";
                          if (text.startsWith('⚠️')) {
                            const dotIndex = text.indexOf('. ', text.indexOf('sekitar'));
                            if (dotIndex !== -1) {
                              const warningPart = text.substring(0, dotIndex + 2);
                              const normalPart = text.substring(dotIndex + 2);
                              return (
                                <>
                                  <span className="text-orange-600 font-bold block mb-2">{warningPart.trim()}</span>
                                  <span>{normalPart}</span>
                                </>
                              );
                            }
                          }
                          return <p>{text}</p>;
                        })()}
                      </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
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

export default RecommendationsPage;

