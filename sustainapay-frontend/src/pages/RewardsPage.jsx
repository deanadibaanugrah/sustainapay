import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from "./LanguageContext";

// --- KAMUS TERJEMAHAN UNTUK REWARDS PAGE ---
const translations = {
  en: {
    home: "Home",
    dashboard: "Dashboard",
    transactions: "Transactions",
    carbonImpact: "Carbon Impact",
    recommendations: "Recommendations",
    rewards: "Rewards",
    profile: "Profile",
    title: "Your Eco-Rewards",
    subtitle: "Earn points for sustainable choices and redeem them for exclusive discounts or donate to green causes.",
    ptsBalance: "Points Balance",
    pts: "pts",
    platinumTier: "Platinum Tier",
    ptsAway: "points away from Platinum Tier!",
    tabRedeem: "Redeem Rewards",
    tabVouchers: "My Vouchers",
    tabDonations: "Impact Donations",
    aiSuggestTitle: "Sustaina-AI Suggestion",
    aiSuggestDesc: "We noticed you have high transport emissions this month. Redeeming the Free City Transit Pass could help lower your carbon footprint by up to 20% next month!",
    cost: "Cost",
    redeemNow: "Redeem Now",
    notEnough: "Not Enough Points",
    noVouchersTitle: "No Vouchers Yet",
    noVouchersDesc: "You haven't redeemed any rewards. Go explore the catalog!",
    by: "By",
    scanToUse: "Scan to Use",
    redeemedOn: "Redeemed on",
    ngoPartner: "NGO Partner",
    donation: "Donation",
    donatePoints: "Donate Points",
    toastSuccess: "Successfully redeemed:",
    toastFail: "Not enough points!",
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
    title: "Eco-Rewards Anda",
    subtitle: "Kumpulkan poin dari pilihan berkelanjutan Anda dan tukarkan dengan diskon eksklusif atau donasi hijau.",
    ptsBalance: "Saldo Poin",
    pts: "poin",
    platinumTier: "Tingkat Platinum",
    ptsAway: "poin lagi menuju Tingkat Platinum!",
    tabRedeem: "Tukar Hadiah",
    tabVouchers: "Voucher Saya",
    tabDonations: "Donasi Dampak",
    aiSuggestTitle: "Saran Sustaina-AI",
    aiSuggestDesc: "Kami perhatikan emisi transportasi Anda tinggi bulan ini. Menukarkan Tiket Transit Kota Gratis dapat membantu menurunkan jejak karbon hingga 20% bulan depan!",
    cost: "Biaya",
    redeemNow: "Tukar Sekarang",
    notEnough: "Poin Tidak Cukup",
    noVouchersTitle: "Belum Ada Voucher",
    noVouchersDesc: "Anda belum menukarkan hadiah apa pun. Ayo jelajahi katalog!",
    by: "Oleh",
    scanToUse: "Pindai untuk Menggunakan",
    redeemedOn: "Ditukarkan pada",
    ngoPartner: "Mitra LSM",
    donation: "Donasi",
    donatePoints: "Donasikan Poin",
    toastSuccess: "Berhasil menukarkan:",
    toastFail: "Poin tidak cukup!",
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

// --- Data Dummy ---
const initialRewards = [
  {
    id: 1,
    title: '50% Off Zero-Waste Kit',
    provider: 'GreenLife',
    cost: 1000,
    image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=600&q=80',
    icon: '♻️',
    type: 'reward'
  },
  {
    id: 2,
    title: 'Free City Transit Pass',
    provider: 'EcoRide',
    cost: 800,
    image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=600&q=80',
    icon: '🚌',
    type: 'reward'
  },
  {
    id: 3,
    title: '15% Off Organic Groceries',
    provider: 'FreshFarm',
    cost: 500,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    icon: '🥦',
    type: 'reward'
  }
];

const donationsData = [
  {
    id: 4,
    title: 'Donate to Reforestation',
    provider: 'Plant 5 Trees',
    cost: 1500,
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    icon: '🌳',
    type: 'donation'
  },
  {
    id: 5,
    title: 'Ocean Cleanup Drive',
    provider: 'SeaSavers',
    cost: 1200,
    image: 'https://images.unsplash.com/photo-1621451537084-482c73073e0f?auto=format&fit=crop&w=600&q=80',
    icon: '🌊',
    type: 'donation'
  }
];

// Internal keys untuk state Tabs (jangan diterjemahkan agar logic tidak rusak)
const tabKeys = ['Redeem Rewards', 'My Vouchers', 'Impact Donations'];

const RewardsPage = () => {
  // 1. Ambil state lang dari Context
  const { lang } = useLanguage(); 
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState('Redeem Rewards');
  const [userPoints, setUserPoints] = useState(2450);
  const [myVouchers, setMyVouchers] = useState([]);
  const [toastMessage, setToastMessage] = useState('');
  
  // --- STATE UNTUK AVATAR NAVBAR ---
  const [navUser, setNavUser] = useState({ avatar: '', initials: 'U' });

  // Mapping label tab sesuai bahasa
  const tabLabels = {
    'Redeem Rewards': t.tabRedeem,
    'My Vouchers': t.tabVouchers,
    'Impact Donations': t.tabDonations
  };

  // --- MENGAMBIL DATA AVATAR DARI LOCALSTORAGE ---
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      
      const getInitials = (name) => {
        if (!name) return 'U';
        const words = name.split(' ');
        if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
      };

      const initials = getInitials(parsedUser.name);
      const userAvatar = localStorage.getItem('user_avatar') 
                        || parsedUser.avatar 
                        || `https://ui-avatars.com/api/?name=${initials}&background=00A651&color=fff`;
      
      setNavUser({ avatar: userAvatar, initials });
    }
  }, []);

  // Fungsi untuk redeem reward/donation
  const handleRedeem = (item) => {
    if (userPoints >= item.cost) {
      setUserPoints(prev => prev - item.cost);
      setMyVouchers(prev => [...prev, { ...item, redeemedDate: new Date().toLocaleDateString() }]);
      
      // Tampilkan toast berhasil
      setToastMessage(`${t.toastSuccess} ${item.title}!`);
      setTimeout(() => setToastMessage(''), 3000);
    } else {
      // Tampilkan toast gagal
      setToastMessage(t.toastFail);
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6FCF9] font-sans text-gray-900 relative">
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm animate-[fadeIn_0.3s_ease-out]">
          {toastMessage}
        </div>
      )}

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
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#00A651] mb-3">
            {t.title}
          </h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl">
            {t.subtitle}
          </p>
        </div>

        {/* POINTS BANNER */}
        <div className="bg-[#0B132B] text-white rounded-[2.5rem] p-8 md:p-10 mb-10 shadow-xl flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden transition-all duration-300">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 opacity-10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4"></div>

          <div className="relative z-10 text-center md:text-left">
            <p className="text-gray-400 font-bold uppercase tracking-wider text-sm mb-2">{t.ptsBalance}</p>
            <h2 className="text-5xl md:text-6xl font-black text-white flex items-baseline justify-center md:justify-start gap-2">
              {userPoints.toLocaleString()} <span className="text-xl text-[#00A651]">{t.pts}</span>
            </h2>
          </div>

          <div className="relative z-10 w-full md:w-1/2 bg-white/10 p-6 rounded-[2rem] border border-white/10 backdrop-blur-sm">
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="font-bold text-white mb-1">{t.platinumTier}</p>
                <p className="text-xs text-gray-400 font-medium">
                  {3000 - userPoints > 0 ? 3000 - userPoints : 0} {t.ptsAway}
                </p>
              </div>
              <span className="text-xl">👑</span>
            </div>
            <div className="w-full bg-black/30 h-3 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-[#00A651] to-green-300 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((userPoints / 3000) * 100, 100)}%` }}></div>
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
              {initialRewards.map((item) => (
                <div key={item.id} className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                  <div className="relative h-40 overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-gray-900 shadow-sm flex items-center gap-1">
                      <span>{item.icon}</span> {item.provider}
                    </div>
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
                        disabled={userPoints < item.cost}
                        className={`w-full py-3 rounded-xl text-sm font-bold transition-colors shadow-sm ${
                          userPoints >= item.cost 
                            ? 'bg-gray-900 text-white hover:bg-[#00A651]' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {userPoints >= item.cost ? t.redeemNow : t.notEnough}
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
                        {Math.random().toString(36).substring(2, 10).toUpperCase()}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-4">{t.redeemedOn} {item.redeemedDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: Impact Donations */}
        {activeTab === 'Impact Donations' && (
          <div className="animate-[fadeIn_0.3s_ease-out]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {donationsData.map((item) => (
                <div key={item.id} className="bg-white rounded-[2rem] overflow-hidden border border-green-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                  <div className="relative h-40 overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 bg-[#00A651] text-white px-3 py-1 rounded-full text-xs font-black shadow-sm flex items-center gap-1">
                      <span>{item.icon}</span> {t.ngoPartner}
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 leading-snug">{item.title}</h3>
                    <div className="mt-auto">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-bold text-gray-400 uppercase">{t.donation}</span>
                        <span className={`font-black px-3 py-1 rounded-lg text-sm ${userPoints >= item.cost ? 'text-[#00A651] bg-[#E6FAF1]' : 'text-red-500 bg-red-50'}`}>
                          {item.cost} {t.pts}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleRedeem(item)}
                        disabled={userPoints < item.cost}
                        className={`w-full py-3 rounded-xl text-sm font-bold transition-colors shadow-sm ${
                          userPoints >= item.cost 
                            ? 'bg-[#00A651] text-white hover:bg-green-700' 
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {userPoints >= item.cost ? t.donatePoints : t.notEnough}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-[#0B132B] text-white py-16 mt-16">
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

export default RewardsPage;