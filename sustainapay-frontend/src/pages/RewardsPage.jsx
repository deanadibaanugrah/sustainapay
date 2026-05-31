import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from "./LanguageContext";

// Dummy images fallback
const defaultImages = {
  reward: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=600&q=80',
  donation: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80'
};

// Internal keys untuk state Tabs (jangan diterjemahkan agar logic tidak rusak)
const tabKeys = ['Redeem Rewards', 'My Vouchers'];

const RewardsPage = () => {
  // 1. Ambil state lang dari Context
  const contextData = useLanguage() || {};
  const tContext = contextData.t || {};
  const t = tContext.rewards || {};

  const [activeTab, setActiveTab] = useState('Redeem Rewards');
  const [userPoints, setUserPoints] = useState(0);
  const [myVouchers, setMyVouchers] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
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
        return { avatar: userAvatar, initials };
      } catch (err) {
        console.error(err);
        return { avatar: '', initials: 'U' };
      }
    }
    return { avatar: '', initials: 'U' };
  });

  // Mapping label tab sesuai bahasa
  const tabLabels = {
    'Redeem Rewards': t.tabRedeem,
    'My Vouchers': t.tabVouchers,
    'Impact Donations': t.tabDonations
  };

  // Ambil data poin & riwayat voucher dari backend
  useEffect(() => {
    const fetchRewardsData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/rewards`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        
        if (res.ok && result.success) {
          setUserPoints(result.data.points || 0);
          setMyVouchers(result.data.vouchers || []);
          setCatalog(result.data.catalog || []);
        }
      } catch (err) {
        console.error("Error fetching rewards:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRewardsData();
  }, []);

  // Helper check tier based on POINTS
  const getTierInfo = (points) => {
    if (points >= 5000) return { current: 'Platinum', next: 'Max Tier', nextReq: 5000, progress: 100, icon: '👑' };
    if (points >= 1500) return { current: 'Gold', next: 'Platinum', nextReq: 5000, progress: (points/5000)*100, icon: '🥇' };
    if (points >= 500) return { current: 'Silver', next: 'Gold', nextReq: 1500, progress: (points/1500)*100, icon: '🥈' };
    return { current: 'Bronze', next: 'Silver', nextReq: 500, progress: (points/500)*100, icon: '🥉' };
  };
  const tierInfo = getTierInfo(userPoints);

  const tierWeight = { 'Bronze': 1, 'Silver': 2, 'Gold': 3, 'Platinum': 4 };
  const checkTier = (required) => {
    const requiredWeight = tierWeight[required] || 1; 
    const currentWeight = tierWeight[tierInfo.current];
    return currentWeight >= requiredWeight;
  };

  // Fungsi untuk redeem reward/donation ke backend
  const handleRedeem = async (item) => {
    if (userPoints >= item.cost && checkTier(item.tier_required)) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/rewards/redeem`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            voucher_id: item.id
          })
        });
        
        const result = await res.json();
        
        if (res.ok && result.success) {
          setUserPoints(result.data.points);
          setMyVouchers(prev => [result.data.voucher, ...prev]);
          
          setToastMessage(`${t.toastSuccess} ${item.title}!`);
          setTimeout(() => setToastMessage(''), 3000);
        } else {
          setToastMessage(result.message || t.toastFail);
          setTimeout(() => setToastMessage(''), 3000);
        }
      } catch (err) {
        console.error("Error redeeming:", err);
        setToastMessage("Server error!");
        setTimeout(() => setToastMessage(''), 3000);
      }
    } else {
      setToastMessage(t.toastFail);
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6FCF9]">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6FCF9] font-sans text-gray-900 relative">
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm animate-[fadeIn_0.3s_ease-out]">
          {toastMessage}
        </div>
      )}

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
            <Link to="/carbon-impact" className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">
              {t.carbonImpact}
            </Link>
            <Link to="/recommendations" className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">
              {t.recommendations}
            </Link>
            {/* Navigasi Aktif (Rewards) */}
            <Link to="/rewards" className="px-5 py-2 text-sm font-black text-white bg-[#00A651] shadow-md shadow-green-200 rounded-full transition-all">
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
        
        {/* HEADER SECTION */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#00A651] mb-3">
            {t.title}
          </h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl">
            {t.subtitle}
          </p>
        </div>

        {/* POINTS BANNER */}
        <div className="bg-[#0B132B] text-white rounded-3xl p-8 md:p-10 mb-10 shadow-lg flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 opacity-10 rounded-full -translate-y-1/2 translate-x-1/4"></div>

          <div className="relative z-10 text-center md:text-left">
            <p className="text-gray-400 font-bold uppercase tracking-wider text-sm mb-2">{t.ptsBalance}</p>
            <h2 className="text-5xl md:text-6xl font-black text-white flex items-baseline justify-center md:justify-start gap-2">
              {userPoints.toLocaleString()} <span className="text-xl text-[#00A651]">{t.pts}</span>
            </h2>
          </div>

          <div className="relative z-10 w-full md:w-1/2 bg-white/10 p-6 rounded-[2rem] border border-white/10 backdrop-blur-sm">
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="font-bold text-white mb-1">Tingkat {tierInfo.current}</p>
                <p className="text-xs text-gray-400 font-medium">
                  {tierInfo.nextReq > userPoints ? `${tierInfo.nextReq - userPoints} poin lagi menuju Tingkat ${tierInfo.next}!` : 'Tingkat Maksimal!'}
                </p>
              </div>
              <span className="text-xl">{tierInfo.icon}</span>
            </div>
            <div className="w-full bg-black/30 h-3 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-[#00A651] to-green-300 h-full rounded-full transition-all duration-1000" style={{ width: `${tierInfo.progress}%` }}></div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex overflow-x-auto hide-scrollbar gap-3 mb-8 pb-2">
          {tabKeys.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-[#00A651] text-white shadow-md shadow-green-200'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-[#00A651] hover:text-[#00A651]'
              }`}
            >
              {tabLabels[tab]} {tab === 'My Vouchers' && myVouchers.length > 0 && `(${myVouchers.length})`}
            </button>
          ))}
        </div>

        {/* TAB CONTENT: Redeem Rewards */}
        {activeTab === 'Redeem Rewards' && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            {/* AI Recommendation Banner */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-[2rem] p-6 mb-8 flex items-center gap-6">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl shrink-0">✨</div>
              <div>
                <h4 className="font-black text-indigo-900 mb-1 flex items-center gap-2">
                  {t.aiSuggestTitle}
                </h4>
                <p className="text-sm text-indigo-800/80 font-medium">
                  {t.aiSuggestDesc}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {catalog.filter(v => v.type === 'reward').map((item) => (
                <div key={item.id} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                  <div className="relative h-40 overflow-hidden">
                    <img src={item.image || defaultImages.reward} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-gray-900 shadow-sm flex items-center gap-1">
                      <span>{item.icon}</span> {item.provider}
                    </div>
                    {item.tier_required && item.tier_required !== 'Bronze' && (
                       <div className="absolute top-3 right-3 bg-indigo-500 text-white px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                         {item.tier_required}
                       </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 leading-snug">{item.title}</h3>
                    <div className="mt-auto">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-gray-400 uppercase">{t.cost}</span>
                        <span className={`font-black px-3 py-1 rounded-lg text-sm ${userPoints >= item.cost ? 'text-[#00A651] bg-[#E6FAF1]' : 'text-red-500 bg-red-50'}`}>
                          {item.cost} {t.pts}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleRedeem(item)}
                        disabled={userPoints < item.cost || !checkTier(item.tier_required)}
                        className={`w-full py-3 rounded-xl text-sm font-bold transition-colors shadow-sm ${
                          (userPoints >= item.cost && checkTier(item.tier_required))
                            ? 'bg-gray-900 text-white hover:bg-[#00A651]' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {!checkTier(item.tier_required) 
                          ? `Requires ${item.tier_required}` 
                          : userPoints >= item.cost ? t.redeemNow : t.notEnough}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB CONTENT: My Vouchers */}
        {activeTab === 'My Vouchers' && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            {myVouchers.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-gray-200">
                <span className="text-4xl mb-4 block">🎟️</span>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t.noVouchersTitle}</h3>
                <p className="text-gray-500 font-medium">{t.noVouchersDesc}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {myVouchers.map((item, index) => (
                  <div key={index} className="bg-[#0B132B] text-white rounded-[2rem] overflow-hidden shadow-sm flex flex-col relative">
                    <div className="p-5 border-b border-white/10 border-dashed relative">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-2xl mb-3">{item.icon}</div>
                      <h3 className="text-lg font-bold mb-1 leading-snug">{item.title}</h3>
                      <p className="text-xs text-gray-400 font-medium">{t.by} {item.provider}</p>
                      
                      {/* Stylistic Ticket Cutouts */}
                      <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-[#F6FCF9] rounded-full"></div>
                      <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-[#F6FCF9] rounded-full"></div>
                    </div>
                    <div className="p-5 bg-white/5 flex-grow flex flex-col justify-center items-center">
                      <p className="text-xs text-gray-400 mb-2">{t.scanToUse}</p>
                      <div className="w-full h-16 bg-white/20 rounded-lg flex items-center justify-center tracking-[0.5em] font-mono font-bold text-lg opacity-80">
                        {item.voucherCode}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-4">{t.redeemedOn} {item.redeemedDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}



      </main>

      {/* FOOTER */}

    </div>
  );
};

export default RewardsPage;