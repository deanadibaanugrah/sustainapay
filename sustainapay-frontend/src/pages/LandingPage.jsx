import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from "./LanguageContext";

const LandingPage = () => {
  const [isLoggedIn] = useState(() => localStorage.getItem('token') ? true : false);
  const { lang, toggleLanguage: setGlobalLang, t } = useLanguage(); 
  
  // State untuk Interaksi Tab & Accordion
  const [activeTab, setActiveTab] = useState('about'); 
  const [activeStep, setActiveStep] = useState(null); 
  
  const rightColumnRef = useRef(null);
  const text = t.landing;


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6FCF9] to-[#E8F8F0] font-sans text-gray-900 relative overflow-x-hidden flex flex-col">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-200 rounded-full mix-blend-multiply opacity-30" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-200 rounded-full mix-blend-multiply opacity-30" />
      </div>

      {/* NAVBAR */}
      <nav className="relative z-20 flex justify-between items-center py-6 px-8 max-w-7xl mx-auto w-full bg-white/80 border border-white/40 mt-4 rounded-3xl shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="Logo" className="w-10 h-10 object-cover rounded-xl border border-green-700/40 shadow-md ring-2 ring-white/50 shadow-md" />
          <span className="font-bold text-xl text-green-800 hidden sm:block">SustainaPay</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex bg-white/60 p-1 rounded-full border border-white/50 shadow-sm">
            {['id', 'en'].map((l) => (
              <button key={l} onClick={() => setGlobalLang(l)} className={`px-3 py-1 rounded-full text-xs font-bold transition-all uppercase ${lang === l ? 'bg-[#00A651] text-white shadow-md' : 'text-gray-500 hover:text-gray-800'}`}>
                {l}
              </button>
            ))}
          </div>
          {/* PERUBAHAN: Mengubah rute tujuan dari "/recommendations" menjadi "/dashboard" */}
          <Link to={isLoggedIn ? "/dashboard" : "/login"} className={`text-sm font-bold px-5 py-2.5 rounded-full shadow-md transition-all transform hover:-translate-y-0.5 ${isLoggedIn ? 'bg-white text-green-700 border border-green-50' : 'bg-[#00A651] text-white hover:bg-green-700'}`}>
            {isLoggedIn ? text.navApp : text.navLogin}
          </Link>
        </div>
      </nav>

      {/* MAIN CONTENT SECTION */}
      <section className="relative z-10 max-w-7xl w-full mx-auto px-8 pt-12 pb-12 flex flex-col lg:flex-row gap-12 flex-1">
        
        {/* Kiri - Teks Hero & Stats */}
        <div className="flex-1 space-y-8 flex flex-col justify-center lg:pr-8">
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.2] text-gray-900 tracking-tight">
              {text.heroTitle1} <br /> {text.heroTitle2} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00A651] to-emerald-400">{text.heroTitle3}</span>
            </h1>
            <p className="text-gray-600 text-base sm:text-lg font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {text.heroDesc}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              {/* PERUBAHAN: Mengubah rute tujuan dari "/recommendations" menjadi "/dashboard" */}
              <Link to={isLoggedIn ? "/dashboard" : "/login"} className="w-full sm:w-auto bg-[#00A651] text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-all transform hover:-translate-y-1 text-center">
                {isLoggedIn ? text.btnContinue : text.btnStart}
              </Link>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-green-200/50">
            {[
              { val: '50K+', label: text.statUsers, color: 'text-gray-900', labelCol: 'text-gray-500' },
              { val: '2M+', label: text.statTrans, color: 'text-gray-900', labelCol: 'text-gray-500' },
              { val: '500T', label: text.statCo2, color: 'text-[#00A651]', labelCol: 'text-green-700' }
            ].map((s, i) => (
              <div key={i} className="text-center lg:text-left">
                <h2 className={`text-2xl sm:text-3xl font-extrabold ${s.color}`}>{s.val}</h2>
                <p className={`${s.labelCol} text-[10px] sm:text-xs font-bold mt-1 uppercase tracking-wider`}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Kanan - BAGIAN INTERAKTIF */}
        <div ref={rightColumnRef} className="flex-1 flex flex-col gap-6 lg:mt-0 mt-8 scroll-mt-24 w-full max-w-lg mx-auto lg:mx-0">
          
          {/* TAB SWITCHER */}
          <div className="flex bg-white/60 backdrop-blur-md p-1.5 rounded-full shadow-inner border border-white/80 relative z-20 w-fit mx-auto lg:mx-0">
            <button 
              onClick={() => setActiveTab('about')} 
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'about' ? 'bg-[#00A651] text-white shadow-md transform scale-105' : 'text-gray-500 hover:text-green-700'}`}
            >
              🤔 {text.tabAbout}
            </button>
            <button 
              onClick={() => setActiveTab('flow')} 
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${activeTab === 'flow' ? 'bg-[#00A651] text-white shadow-md transform scale-105' : 'text-gray-500 hover:text-green-700'}`}
            >
              ⚙️ {text.tabFlow}
            </button>
          </div>

          {/* CONTENT AREA */}
          <div className="relative w-full h-full min-h-[380px]">
            
            {/* TAMPILAN 1: TENTANG KAMI */}
            <div className={`absolute inset-0 transition-all duration-500 transform ${activeTab === 'about' ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-8 pointer-events-none -z-10'}`}>
              <div className="bg-white/90 p-8 sm:p-10 rounded-[2.5rem] shadow-xl border border-white h-full flex flex-col justify-center">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="text-[#00A651]">SustainaPay.</span>
                </h2>
                <p className="text-base font-medium text-gray-700 leading-relaxed text-justify">
                  {text.aboutDesc}
                </p>
                <button onClick={() => setActiveTab('flow')} className="mt-8 text-sm font-bold text-[#00A651] flex items-center gap-2 hover:gap-3 transition-all w-fit">
                  Lihat Cara Kerjanya <span className="text-lg">→</span>
                </button>
              </div>
            </div>

            {/* TAMPILAN 2: CARA KERJA (Dengan Accordion Interaktif Toggleable) */}
            <div className={`absolute inset-0 transition-all duration-500 transform ${activeTab === 'flow' ? 'opacity-100 translate-y-0 z-10' : 'opacity-0 translate-y-8 pointer-events-none -z-10'}`}>
              <div className="bg-white/90 p-8 rounded-[2.5rem] shadow-xl border border-white h-full flex flex-col">
                <div className="mb-6">
                  <h2 className="text-2xl font-extrabold text-gray-900 mb-1">{text.flowTitle}</h2>
                  <p className="text-xs text-[#00A651] font-bold bg-green-100/50 w-fit px-3 py-1 rounded-full animate-pulse">{text.flowSub}</p>
                </div>

                <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {text.steps.map((step, index) => {
                    const isActive = activeStep === index;
                    return (
                      <div 
                        key={index} 
                        onClick={() => setActiveStep(isActive ? null : index)}
                        className={`group cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden ${isActive ? 'bg-[#F8FCFA] border-[#00A651] shadow-md' : 'bg-white border-gray-100 hover:border-green-300 hover:bg-green-50/30'}`}
                      >
                        {/* Header Step */}
                        <div className="flex items-center justify-between p-4 relative z-10">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-colors duration-300 ${isActive ? 'bg-[#00A651] text-white shadow-inner' : 'bg-green-50 text-gray-600 group-hover:bg-green-100'}`}>
                              {step.icon}
                            </div>
                            <div>
                              <span className="text-[#00A651] font-black text-[9px] uppercase tracking-widest block mb-0.5">Step 0{index + 1}</span>
                              <h3 className={`font-bold transition-colors ${isActive ? 'text-[#00A651]' : 'text-gray-800'}`}>{step.title}</h3>
                            </div>
                          </div>
                          {/* Indikator Panah */}
                          <div className={`text-gray-400 transition-transform duration-300 ${isActive ? 'rotate-180 text-[#00A651]' : 'rotate-0'}`}>
                            ▼
                          </div>
                        </div>
                        
                        {/* Deskripsi Step */}
                        <div className={`transition-all duration-500 ease-in-out ${isActive ? 'max-h-32 opacity-100 pb-4 px-4' : 'max-h-0 opacity-0 px-4'}`}>
                          <div className="w-full h-[1px] bg-green-100 mb-3"></div>
                          <p className="text-gray-600 text-xs sm:text-sm font-medium leading-relaxed">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-green-950 py-6 px-8 text-center text-green-200 mt-auto relative z-20 w-full">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo" className="w-8 h-8 object-cover rounded-lg border border-green-700/40 shadow-sm ring-1 ring-white/50" />
            <span className="font-bold text-white text-sm">SustainaPay</span>
          </div>
          <p className="text-xs font-medium opacity-80">&copy; 2026 SustainaPay. Hak Cipta Dilindungi. Data didukung oleh Jejakin.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;