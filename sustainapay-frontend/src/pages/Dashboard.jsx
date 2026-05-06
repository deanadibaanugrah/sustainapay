import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // 1. STATE UNTUK TOMBOL (Mengingat tombol mana yang sedang aktif)
  const [activeTab, setActiveTab] = useState('Week');

  // 2. DATA GRAFIK (Akan berubah sesuai tombol yang dipencet)
  const chartData = {
    Week: [40, 70, 45, 90, 65, 80, 55],
    Month: [40, 70, 45, 90, 65, 80, 55, 95, 70, 85, 60, 75, 50, 90, 100],
    Year: [60, 80, 50, 90, 70, 85, 65, 95, 75, 85, 60, 80]
  };

  const currentData = chartData[activeTab];

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
          <Link to="/dashboard" className="text-green-600 border-b-2 border-green-600 pb-1">Dashboard</Link>
          <Link to="/transactions" className="hover:text-green-600">Transactions</Link>
          <Link to="/carbon-impact" className="hover:text-green-600">Carbon Impact</Link>
          <Link to="/recommendations" className="hover:text-green-600">Recommendations</Link>
          {/* MENU REWARDS & PROFILE SUDAH DIPERBAIKI MENGGUNAKAN <Link> ↓ */}
          <Link to="/rewards" className="hover:text-green-600">Rewards</Link>
          <Link to="/profile" className="hover:text-green-600">Profile</Link>
        </div>

        <div className="flex items-center gap-3">
          <button className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-200 transition">🔔</button>
          <div className="w-10 h-10 bg-green-600 rounded-full border-2 border-white shadow-sm overflow-hidden cursor-pointer">
            <img src="https://ui-avatars.com/api/?name=Alex+Chen&background=00A651&color=fff" alt="User" />
          </div>
        </div>
      </nav>

      {/* CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-8 py-10">
        
        {/* GREETING */}
        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900">Welcome back, Alex!</h1>
          <p className="text-gray-500 font-medium">Here's your carbon footprint overview for this month</p>
        </div>

        {/* TOP SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Carbon */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-bold text-gray-400">Total Carbon</p>
              <span className="bg-green-100 text-green-600 text-xs font-bold px-3 py-1 rounded-full">↑ 23%</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900">557,4 <span className="text-lg font-bold text-gray-400">kg</span></h2>
            <p className="text-xs text-gray-400 mt-1 font-bold">Vs Last Month</p>
          </div>

          {/* This Month */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-bold text-gray-400">This Month</p>
              <span className="bg-pink-100 text-pink-500 text-xs font-bold px-3 py-1 rounded-full">↑ 5%</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900">124,5 <span className="text-lg font-bold text-gray-400">kg</span></h2>
            <p className="text-xs text-gray-400 mt-1 font-bold">Vs Last Month</p>
          </div>

          {/* Carbon Saved */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm font-bold text-gray-400">Carbon Saved</p>
              <span className="bg-green-100 text-green-600 text-xs font-bold px-3 py-1 rounded-full">↑ 23%</span>
            </div>
            <h2 className="text-4xl font-black text-gray-900">124,5 <span className="text-lg font-bold text-gray-400">kg</span></h2>
            <p className="text-xs text-gray-400 mt-1 font-bold">Vs Last Month</p>
          </div>
        </div>

        {/* CHART SECTION: Carbon Emission Trend */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-50 mb-8">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black text-gray-900">Carbon Emission Trend</h3>
              <p className="text-sm text-gray-400 font-medium mt-1">Your Daily Carbon Footprint Over Time</p>
            </div>
            
            {/* TOMBOL FILTER INTERAKTIF */}
            <div className="flex bg-gray-100 p-1 rounded-full">
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
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          {/* BAR CHART INTERAKTIF */}
          <div className="flex items-end justify-between gap-2 h-64 w-full mt-4">
            {currentData.map((h, i) => (
              <div key={i} className="flex-1 h-full flex flex-col justify-end gap-1 group">
                <div 
                  className="w-full bg-[#00A651] rounded-t-md transition-all duration-500 ease-out group-hover:opacity-80" 
                  style={{ height: `${h}%` }}
                ></div>
                <div 
                  className="w-full bg-green-100 rounded-b-sm transition-all duration-500 ease-out" 
                  style={{ height: `${h/2}%` }}
                ></div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-8 mt-8">
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-[#00A651] rounded-full"></div>
               <span className="text-xs font-bold text-gray-500">Current Period</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-green-100 rounded-full"></div>
               <span className="text-xs font-bold text-gray-500">Previous Period</span>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: Transactions & Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* Recent Transactions */}
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-900">Recent Transactions</h3>
              <a href="#" className="text-green-600 font-bold text-sm hover:underline">View all →</a>
            </div>
            <div className="space-y-5">
              {[
                { icon: '🚌', name: 'Bus', time: '2 hours ago', val: '0.5 kg' },
                { icon: '🚗', name: 'Car', time: '2 hours ago', val: '2 kg' },
                { icon: '🏍️', name: 'Motorcycle', time: '2 hours ago', val: '12.1 kg' },
                { icon: '🚆', name: 'Public Transport', time: '2 hours ago', val: '12.1 kg' },
                { icon: '🚕', name: 'Taxi', time: '2 hours ago', val: '12.1 kg' },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center pb-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 p-2 rounded-xl transition cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-xl shadow-sm">{item.icon}</div>
                    <div>
                      <p className="font-bold text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-400 font-bold">{item.time}</p>
                    </div>
                  </div>
                  <span className="font-black text-gray-800">{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-50">
            <h3 className="text-xl font-black text-gray-900 mb-6">AI Recommendations</h3>
            <div className="space-y-6">
              <div className="p-5 bg-green-50 rounded-[2rem] border border-green-100 hover:shadow-md transition cursor-pointer">
                <p className="font-black text-gray-800 mb-1">Switch to Public Transport</p>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">Based on your commute patterns, using public transport could reduce your carbon by 45%</p>
                <div className="flex justify-between items-center">
                   <span className="bg-green-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">High Impact</span>
                   <a href="#" className="text-[10px] font-black text-green-600 underline">Save 15.2 kg / month</a>
                </div>
              </div>
              <div className="p-5 bg-purple-50 rounded-[2rem] border border-purple-100 hover:shadow-md transition cursor-pointer">
                <p className="font-black text-gray-800 mb-1">Shop at local markets</p>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">Local produce has 60% less carbon footprint than imported goods</p>
                <div className="flex justify-between items-center">
                   <span className="bg-purple-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">Medium Impact</span>
                   <a href="#" className="text-[10px] font-black text-purple-600 underline">Save 15.2 kg / month</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Point Reward Banner */}
        <div className="bg-[#FFB800] p-10 rounded-[3rem] shadow-xl text-white relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
            <div className="flex-1 w-full">
              <h3 className="text-2xl font-black mb-2">Rewards Program</h3>
              <p className="font-bold opacity-90 mb-6">You're 250 points away from your next reward!</p>
              
              <div className="w-full bg-white/30 h-4 rounded-full mb-2">
                <div className="bg-white h-4 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <div className="flex justify-between text-xs font-black">
                <span>1,750</span>
                <span>Next Tier: 2,000 Points</span>
              </div>
            </div>
            
            <div className="text-center md:text-right">
               <p className="text-xs font-black opacity-80 uppercase tracking-widest">Total Points</p>
               <h2 className="text-6xl font-black">1,750</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 pt-8 border-t border-white/20 relative z-10">
            <div className="text-center">
              <p className="text-[10px] font-black opacity-70 uppercase mb-1">Point Earned</p>
              <p className="font-black text-xl">1,750</p>
            </div>
            <div className="text-center border-l border-white/10">
              <p className="text-[10px] font-black opacity-70 uppercase mb-1">Current Tier</p>
              <p className="font-black text-xl">Gold</p>
            </div>
            <div className="text-center border-l border-white/10">
              <p className="text-[10px] font-black opacity-70 uppercase mb-1">Rewards Claimed</p>
              <p className="font-black text-xl">12</p>
            </div>
            <div className="text-center border-l border-white/10">
              <p className="text-[10px] font-black opacity-70 uppercase mb-1">Next Rewards</p>
              <p className="font-black text-xl">250 pts</p>
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

export default Dashboard;