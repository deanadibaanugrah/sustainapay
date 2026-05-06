import React from 'react';
import { Link } from 'react-router-dom';

const CarbonImpact = () => {
  // Data dummy untuk breakdown emisi
  const categories = [
    { name: 'Transportation', icon: '🚗', value: 45, color: 'bg-blue-500', amount: '560 kg' },
    { name: 'Food & Drinks', icon: '🍔', value: 30, color: 'bg-orange-500', amount: '373 kg' },
    { name: 'Shopping', icon: '🛍️', value: 15, color: 'bg-purple-500', amount: '186 kg' },
    { name: 'Utilities', icon: '💡', value: 10, color: 'bg-yellow-500', amount: '126 kg' },
  ];

  return (
    <div className="min-h-screen bg-[#F6FCF9] font-sans text-gray-900">
      
      {/* NAVBAR */}
      <nav className="flex justify-between items-center py-4 px-8 max-w-7xl mx-auto bg-white border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-green-800 flex items-center justify-center rounded-lg">
             <span className="text-white font-bold text-xs">LOGO</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-400">
          <Link to="/" className="hover:text-green-600">Home</Link>
          <Link to="/dashboard" className="hover:text-green-600">Dashboard</Link>
          <Link to="/transactions" className="hover:text-green-600">Transactions</Link>
          
          {/* Menu ini sekarang aktif */}
          <Link to="/carbon-impact" className="text-green-600 border-b-2 border-green-600 pb-1">Carbon Impact</Link>
          
          <Link to="/recommendations" className="hover:text-green-600">Recommendations</Link>
          <Link to="/rewards" className="hover:text-green-600">Rewards</Link>
          <Link to="/profile" className="hover:text-green-600">Profile</Link>
        </div>

        <div className="flex items-center gap-3">
          <button className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-200 transition">🔔</button>
          {/* Foto profil juga diubah menjadi Link */}
          <Link to="/profile" className="w-10 h-10 bg-green-600 rounded-full border-2 border-white shadow-sm overflow-hidden cursor-pointer block">
            <img src="https://ui-avatars.com/api/?name=Alex+Chen&background=00A651&color=fff" alt="User" />
          </Link>
        </div>
      </nav>

      {/* CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-8 py-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Your Carbon Impact</h1>
            <p className="text-gray-500 font-medium mt-1">Understand and reduce your environmental footprint</p>
          </div>
          <button className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-full text-sm font-bold shadow-sm hover:bg-gray-50 transition flex items-center gap-2">
            <span>📤</span> Share Impact
          </button>
        </div>

        {/* TOP SECTION: Main Score & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Main Visual Score */}
          <div className="lg:col-span-1 bg-[#0B132B] text-white p-10 rounded-[3rem] shadow-xl relative overflow-hidden flex flex-col justify-center items-center text-center">
            <div className="relative z-10">
              <span className="bg-green-500/20 text-green-400 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">Great Progress</span>
              <h2 className="text-6xl font-black mb-2 mt-2">1,245<span className="text-2xl text-gray-400 ml-1">kg</span></h2>
              <p className="text-gray-400 font-bold text-sm mb-6">CO2e emitted this year</p>
              
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
                <span className="text-xl">🏆</span>
                <span className="text-sm font-bold text-white">Top 15% of eco-savers</span>
              </div>
            </div>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 opacity-20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4"></div>
          </div>

          {/* 3 Quick Stats Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col justify-center">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-xl mb-4">☁️</div>
              <p className="text-sm font-bold text-gray-400 mb-1">Monthly Avg</p>
              <h3 className="text-3xl font-black text-gray-900">103 <span className="text-sm text-gray-400">kg</span></h3>
              <p className="text-xs text-green-500 font-bold mt-2">↓ 12% vs last year</p>
            </div>
            
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col justify-center">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-xl mb-4">🌳</div>
              <p className="text-sm font-bold text-gray-400 mb-1">Trees Equivalent</p>
              <h3 className="text-3xl font-black text-gray-900">52 <span className="text-sm text-gray-400">trees</span></h3>
              <p className="text-xs text-gray-400 font-bold mt-2">Needed to offset emissions</p>
            </div>

            <div className="bg-[#00A651] p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-center text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-xl mb-4">🌱</div>
                <p className="text-sm font-bold text-white/80 mb-1">Offset Progress</p>
                <h3 className="text-3xl font-black text-white">30%</h3>
                <div className="w-full bg-white/30 h-2 rounded-full mt-3">
                  <div className="bg-white h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: Breakdown & Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Emission Breakdown */}
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50">
            <h3 className="text-xl font-black text-gray-900 mb-8">Emissions Breakdown</h3>
            
            <div className="space-y-6">
              {categories.map((cat, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{cat.icon}</span>
                      <span className="font-bold text-gray-800 text-sm">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-gray-900">{cat.value}%</span>
                      <span className="text-xs text-gray-400 font-bold ml-2">({cat.amount})</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div className={`${cat.color} h-full rounded-full`} style={{ width: `${cat.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights & Actions */}
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50">
            <h3 className="text-xl font-black text-gray-900 mb-6">Personalized Insights</h3>
            <div className="space-y-4">
              
              <div className="flex gap-4 p-5 bg-red-50 rounded-[2rem] border border-red-100 items-start">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-xl shrink-0">⚠️</div>
                <div>
                  <h4 className="font-black text-red-800 mb-1">High Transport Emissions</h4>
                  <p className="text-xs text-red-600/80 font-bold leading-relaxed mb-3">Your car trips accounted for 45% of your footprint this month. Consider carpooling or public transit.</p>
                  <button className="text-xs font-black text-red-700 bg-red-200/50 px-4 py-2 rounded-full hover:bg-red-200 transition">View Alternatives</button>
                </div>
              </div>

              <div className="flex gap-4 p-5 bg-green-50 rounded-[2rem] border border-green-100 items-start">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl shrink-0">⭐</div>
                <div>
                  <h4 className="font-black text-green-800 mb-1">Great job on Utilities!</h4>
                  <p className="text-xs text-green-600/80 font-bold leading-relaxed">Your electricity usage dropped by 15% compared to last month. Keep up the good work!</p>
                </div>
              </div>

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
              Track your carbon footprint with every transactions.
            </p>
          </div>
          <div>
            <h5 className="font-black text-sm mb-6">Product</h5>
            <ul className="text-xs text-gray-400 space-y-4 font-bold">
              <li className="hover:text-white cursor-pointer transition">Features</li>
              <li className="hover:text-white cursor-pointer transition">Pricing</li>
              <li className="hover:text-white cursor-pointer transition">Security</li>
            </ul>
          </div>
          <div>
            <h5 className="font-black text-sm mb-6">Company</h5>
            <ul className="text-xs text-gray-400 space-y-4 font-bold">
              <li className="hover:text-white cursor-pointer transition">About</li>
              <li className="hover:text-white cursor-pointer transition">Blog</li>
              <li className="hover:text-white cursor-pointer transition">Careers</li>
            </ul>
          </div>
          <div>
            <h5 className="font-black text-sm mb-6">Support</h5>
            <ul className="text-xs text-gray-400 space-y-4 font-bold">
              <li className="hover:text-white cursor-pointer transition">Help Center</li>
              <li className="hover:text-white cursor-pointer transition">Contact</li>
              <li className="hover:text-white cursor-pointer transition">Privacy</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 mt-16 pt-8 border-t border-gray-800 text-center text-[10px] text-gray-500 font-bold">
          © 2026 SustainaPay. All rights reserved.
        </div>
      </footer>

    </div>
  );
};

export default CarbonImpact;