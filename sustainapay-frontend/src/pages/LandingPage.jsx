import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from "./LanguageContext";

const LandingPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Memanggil state 'lang' dan fungsi 'toggleLanguage' dari Context Global
  const { lang, toggleLanguage: setGlobalLang } = useLanguage(); 

  // State untuk efek Typewriter (Mesin Tik)
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Referensi untuk auto-scroll
  const aboutRef = useRef(null);
  const flowRef = useRef(null);

  useEffect(() => {
    // Cek status login
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // KUMPULAN TEKS TRANSLASI (DICTIONARY)
  const t = {
    en: {
      navLogin: 'Sign In',
      navApp: 'Dashboard',
      heroTitle1: 'Your Digital Wallet',
      heroTitle2: 'for a',
      heroTitle3: 'Sustainable Future',
      heroDesc: 'Join SustainaPay to track your carbon footprint with every transaction. Make a positive impact on the environment while managing your finances effortlessly.',
      btnStart: 'Get Started',
      btnContinue: 'Continue to App',
      btnLearn: 'Learn More',
      statUsers: 'Active Users',
      statTrans: 'Transactions',
      statCo2: 'CO2 Tracked',
      cardTitle: 'Total Carbon Footprint',
      cardSub: '20% lower than last month',
      cardTrend: 'Emission Trend',
      coffee: 'Coffee Shop',
      grocery: 'Grocery Store',
      hoursAgo: 'hours ago',
      aboutTitle: 'What is SustainaPay?',
      aboutDesc: "SustainaPay is an e-wallet web platform that functions not only as a digital transaction tool but also features carbon footprint calculation for every transaction. Our primary goal is to increase user awareness of the environmental impact of daily activities, particularly transportation. We have chosen highly accurate emission data by referencing Jejakin—a trusted platform in carbon calculation.",
      flowTitle: 'How It Works',
      flowSub: 'A simple journey from transaction to ecological impact',
      steps: [
        { title: 'Transact', desc: 'Use SustainaPay for your daily expenses, especially transportation.' },
        { title: 'Calculate', desc: 'The system automatically calculates your carbon footprint via Jejakin.' },
        { title: 'Monitor', desc: 'Track your emission history and set green targets on your interactive dashboard.' },
        { title: 'Earn Rewards', desc: 'Reduce emissions to earn eco-points and redeem them for ecological rewards.' }
      ]
    },
    id: {
      navLogin: 'Masuk',
      navApp: 'Dasbor',
      heroTitle1: 'Dompet Digital Anda',
      heroTitle2: 'untuk',
      heroTitle3: 'Masa Depan Berkelanjutan',
      heroDesc: 'Bergabunglah dengan SustainaPay untuk melacak jejak karbon dari setiap transaksi. Berikan dampak positif pada lingkungan sambil mengelola keuangan Anda dengan presisi tinggi.',
      btnStart: 'Mulai Sekarang',
      btnContinue: 'Lanjut ke Aplikasi',
      btnLearn: 'Pelajari Lanjut',
      statUsers: 'Pengguna Aktif',
      statTrans: 'Transaksi',
      statCo2: 'CO2 Terlacak',
      cardTitle: 'Total Jejak Karbon',
      cardSub: 'Turun 20% dari bulan lalu',
      cardTrend: 'Tren Emisi',
      coffee: 'Kedai Kopi',
      grocery: 'Toko Swalayan',
      hoursAgo: 'jam lalu',
      aboutTitle: 'Apa itu SustainaPay?',
      aboutDesc: "SustainaPay merupakan pengembangan web e-wallet yang tidak hanya berfungsi sebagai alat transaksi digital, tetapi juga memiliki fitur perhitungan jejak karbon dari setiap transaksi pengguna. Tujuan utama platform ini adalah meningkatkan kesadaran pengguna terhadap dampak lingkungan yang dihasilkan dari aktivitas sehari-hari (khususnya penggunaan transportasi). Data emisi karbon yang kami gunakan didasarkan pada perhitungan dari sumber terpercaya, Jejakin.",
      flowTitle: 'Cara Kerja',
      flowSub: 'Perjalanan mudah dari transaksi menuju dampak ekologis',
      steps: [
        { title: 'Transaksi', desc: 'Gunakan SustainaPay untuk pembayaran harian, terutama transportasi.' },
        { title: 'Kalkulasi', desc: 'Sistem otomatis menghitung jejak karbon berdasarkan basis data Jejakin.' },
        { title: 'Pantau', desc: 'Lacak riwayat emisi Anda dan pasang target hijau di dasbor interaktif.' },
        { title: 'Dapat Reward', desc: 'Raih poin ekologis dari emisi yang ditekan untuk ditukar dengan donasi pohon.' }
      ]
    }
  };

  // PERBAIKAN: Menggunakan fallback t[lang] || t['id'] agar tidak undefined saat awal load
  const text = t[lang] || t['id'];

  // Fungsi khusus untuk Landing Page agar bisa handle teks yg sedang ditampilkan
  const handleLanguageToggle = (selectedLang) => {
    setGlobalLang(selectedLang); // Mengubah bahasa secara global
    
    // Jika tidak sedang mengetik, langsung ganti teks di about section sesuai bahasa baru
    if (!isTyping && displayedText.length > 0) {
      const selectedDictionary = t[selectedLang] || t['id'];
      setDisplayedText(selectedDictionary.aboutDesc);
    }
  };

  // Fungsi saat tombol Learn More ditekan (dengan Smooth Scroll)
  const handleLearnMore = () => {
    aboutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setIsTyping(true);
    setDisplayedText('');
  };

  // Logika efek mengetik (Typewriter)
  useEffect(() => {
    if (!isTyping) return;

    const fullText = text?.aboutDesc || '';
    let index = 0;
    
    const interval = setInterval(() => {
      setDisplayedText(fullText.slice(0, index + 1));
      index++;
      
      if (index >= fullText.length) {
        clearInterval(interval);
        setIsTyping(false);
        
        // Setelah selesai mengetik, tunggu 2 detik lalu scroll ke Flow (Cara Kerja)
        setTimeout(() => {
          flowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 2000);
      }
    }, 30); // Kecepatan mengetik dalam milidetik

    return () => clearInterval(interval);
  }, [isTyping, text?.aboutDesc]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6FCF9] to-[#E8F8F0] font-sans text-gray-900 relative overflow-x-hidden">
      
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40"></div>

      {/* NAVBAR */}
      <nav className="relative z-20 flex justify-between items-center py-6 px-8 max-w-7xl mx-auto backdrop-blur-md bg-white/30 border border-white/40 mt-4 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-800 rounded-xl flex items-center justify-center text-white font-black text-[8px] shadow-md">
            LOGO
          </div>
          <span className="font-bold text-xl text-green-800 hidden sm:block">SustainaPay</span>
        </div>
        
        <div className="flex items-center gap-6">
          {/* LANGUAGE TOGGLE */}
          <div className="flex bg-white/60 p-1 rounded-full border border-white/50 shadow-sm">
            <button 
              onClick={() => handleLanguageToggle('id')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'id' ? 'bg-[#00A651] text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
            >
              ID
            </button>
            <button 
              onClick={() => handleLanguageToggle('en')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'en' ? 'bg-[#00A651] text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}
            >
              EN
            </button>
          </div>

          {/* LOGIN / DASHBOARD BUTTON */}
          {isLoggedIn ? (
            <Link to="/recommendations" className="text-sm font-bold bg-white text-green-700 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all border border-green-50">
              {text.navApp}
            </Link>
          ) : (
            <Link to="/login" className="text-sm font-bold bg-[#00A651] text-white px-5 py-2.5 rounded-full shadow-md hover:bg-green-700 transition-all transform hover:-translate-y-0.5">
              {text.navLogin}
            </Link>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-24 flex flex-col lg:flex-row items-center gap-16 min-h-[80vh]">
        
        {/* Kiri - Teks Hero */}
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] text-gray-900 tracking-tight">
            {text.heroTitle1} <br />
            {text.heroTitle2} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A651] to-emerald-400">
              {text.heroTitle3}
            </span>
          </h1>
          
          <p className="text-gray-600 text-lg sm:text-xl font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
            {text.heroDesc}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <Link 
              to={isLoggedIn ? "/recommendations" : "/login"} 
              className="w-full sm:w-auto bg-[#00A651] text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-green-200 hover:bg-green-700 hover:shadow-xl transition-all transform hover:-translate-y-1 text-center"
            >
              {isLoggedIn ? text.btnContinue : text.btnStart}
            </Link>
            <button 
              onClick={handleLearnMore}
              className="w-full sm:w-auto bg-white/70 backdrop-blur-sm border border-white text-[#00A651] px-8 py-4 rounded-full font-bold shadow-sm hover:bg-white hover:shadow-md transition-all"
            >
              {text.btnLearn}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-10 border-t border-green-200/50 mt-10">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">50K+</h2>
              <p className="text-gray-500 text-xs sm:text-sm font-bold mt-1 uppercase tracking-wider">{text.statUsers}</p>
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">2M+</h2>
              <p className="text-gray-500 text-xs sm:text-sm font-bold mt-1 uppercase tracking-wider">{text.statTrans}</p>
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#00A651]">500T</h2>
              <p className="text-green-700 text-xs sm:text-sm font-bold mt-1 uppercase tracking-wider">{text.statCo2}</p>
            </div>
          </div>
        </div>

        {/* Kanan - UI Mockup */}
        <div className="flex-1 w-full flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[420px]">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-300 rounded-[2.5rem] blur-lg opacity-40 animate-pulse"></div>
            
            <div className="relative bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white">
              <div className="p-8 bg-gradient-to-br from-[#00A651] to-green-700 text-white relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] text-8xl opacity-10">🌱</div>
                <p className="text-sm font-semibold opacity-90 uppercase tracking-wider mb-1">{text.cardTitle}</p>
                <h3 className="text-5xl font-black">124.5 <span className="text-2xl font-bold opacity-80">kg</span></h3>
                <div className="inline-flex items-center gap-1 mt-3 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
                  <span>📉</span> {text.cardSub}
                </div>
              </div>
              
              <div className="p-8">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">{text.cardTrend}</p>
                
                <div className="flex items-end gap-2 h-28 mb-8 border-b border-gray-100 pb-2">
                  {[40, 60, 45, 80, 50, 65, 90, 70].map((h, i) => (
                    <div key={i} className="group flex-1 relative flex justify-center">
                      <div className="w-full bg-green-100 group-hover:bg-green-400 rounded-t-md transition-all duration-300" style={{ height: `${h}%` }}></div>
                    </div>
                  ))}
                </div>

                <div className="space-y-5">
                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-2xl transition cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-12 h-12 flex-shrink-0 bg-orange-50 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-orange-100">☕</div>
                      <div className="flex-1 ml-4 pr-4">
                        <p className="text-sm font-bold text-gray-900">{text.coffee}</p>
                        <p className="text-xs font-semibold text-gray-400">2 {text.hoursAgo}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-black text-gray-900 block">2.5 kg</span>
                      <span className="w-2 h-2 bg-green-500 rounded-full inline-block mt-1"></span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-2xl transition cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-12 h-12 flex-shrink-0 bg-blue-50 rounded-2xl flex items-center justify-center text-xl shadow-sm border border-blue-100">🛒</div>
                      <div className="flex-1 ml-4 pr-4">
                        <p className="text-sm font-bold text-gray-900">{text.grocery}</p>
                        <p className="text-xs font-semibold text-gray-400">5 {text.hoursAgo}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-black text-gray-900 block">7.0 kg</span>
                      <span className="w-2 h-2 bg-yellow-500 rounded-full inline-block mt-1"></span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION (Typewriter Effect) */}
      <section ref={aboutRef} className="py-24 px-8 max-w-5xl mx-auto text-center relative z-10 scroll-mt-24">
        <h2 className="text-4xl font-extrabold text-[#00A651] mb-8">{text.aboutTitle}</h2>
        <div className="bg-white/60 backdrop-blur-xl p-10 md:p-14 rounded-3xl shadow-lg border border-white min-h-[300px] flex items-center justify-center">
          <p className="text-xl md:text-2xl font-medium text-gray-700 leading-relaxed text-center md:text-justify inline-block">
            {displayedText || (
              <span className="text-gray-400 italic">
                {lang === 'id' ? 'Klik "Pelajari Lanjut" di atas untuk memuat deskripsi...' : 'Click "Learn More" above to load description...'}
              </span>
            )}
            {/* Kursor berkedip saat mengetik */}
            {isTyping && <span className="animate-pulse bg-[#00A651] w-2 h-6 md:h-8 inline-block ml-2 align-middle"></span>}
          </p>
        </div>
      </section>

      {/* FLOW SECTION (How it Works) */}
      <section ref={flowRef} className="py-24 px-8 bg-white/80 backdrop-blur-sm border-t border-green-100 scroll-mt-24 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">{text.flowTitle}</h2>
          <p className="text-lg text-gray-500 font-medium mb-16">{text.flowSub}</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Garis penghubung background (hanya Desktop) */}
            <div className="hidden md:block absolute top-[40px] left-10 right-10 h-1 bg-gradient-to-r from-green-100 via-green-400 to-green-100 z-0"></div>

            {text.steps.map((step, index) => {
              const icons = ["💳", "⚙️", "📊", "🌳"];
              return (
                <div key={index} className="relative z-10 flex flex-col items-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl shadow-xl border-4 border-[#00A651] mb-8 transform hover:scale-110 transition duration-300">
                    {icons[index]}
                  </div>
                  <div className="bg-[#F8FCFA] border border-green-100 p-8 rounded-3xl shadow-sm hover:shadow-lg transition-all text-center w-full h-full">
                    <span className="text-[#00A651] font-black text-sm mb-3 block uppercase tracking-widest">Step 0{index + 1}</span>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-gray-600 text-sm font-medium leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-green-950 py-10 px-8 text-center text-green-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-800 rounded-lg flex items-center justify-center text-white font-black text-[8px]">LOGO</div>
            <span className="font-bold text-white">SustainaPay</span>
          </div>
          <p className="text-sm font-medium opacity-80">&copy; 2026 SustainaPay. Hak Cipta Dilindungi. Data didukung oleh Jejakin.</p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;