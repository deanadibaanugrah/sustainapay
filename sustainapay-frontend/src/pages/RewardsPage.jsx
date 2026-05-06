import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// --- Data Dummy Rewards ---
const rewardsData = [
  {
    id: 1,
    title: '50% Off Zero-Waste Kit',
    provider: 'GreenLife',
    cost: 1000,
    image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=600&q=80',
    icon: '♻️',
  },
  {
    id: 2,
    title: 'Free City Transit Pass',
    provider: 'EcoRide',
    cost: 800,
    image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=600&q=80',
    icon: '🚌',
  },
  {
    id: 3,
    title: '15% Off Organic Groceries',
    provider: 'FreshFarm',
    cost: 500,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    icon: '🥦',
  },
  {
    id: 4,
    title: 'Donate to Reforestation',
    provider: 'Plant 5 Trees',
    cost: 1500,
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80',
    icon: '🌳',
  },
];

const tabs = ['Redeem Rewards', 'My Vouchers', 'Impact Donations'];

const RewardsPage = () => {
  const [activeTab, setActiveTab] = useState('Redeem Rewards');

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
          <Link to="/carbon-impact" className="hover:text-green-600">Carbon Impact</Link>
          <Link to="/recommendations" className="hover:text-green-600">Recommendations</Link>
          <Link to="/rewards" className="text-green-600 border-b-2 border-green-600 pb-1">Rewards</Link>
          
          {/* Menu Profile Update */}
          <Link to="/profile" className="hover:text-green-600">Profile</Link>
        </div>

        <div className="flex items-center gap-3">
          <button className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-200 transition">🔔</button>
          
          {/* Foto Profil Update: Menjadi Link */}
          <Link to="/profile" className="w-10 h-10 bg-green-600 rounded-full border-2 border-white shadow-sm overflow-hidden cursor-pointer block">
            <img src="https://ui-avatars.com/api/?name=Alex+Chen&background=00A651&color=fff" alt="User" className="w-full h-full object-cover" />
          </Link>
        </div>
      </nav>

      {/* CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-8 py-10">
        
        {/* HEADER SECTION */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#00A651] mb-3">
            Your Eco-Rewards
          </h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl">
            Earn points for sustainable choices and redeem them for exclusive discounts or donate to green causes.
          </p>
        </div>

        {/* POINTS BANNER */}
        <div className="bg-[#0B132B] text-white rounded-[2.5rem] p-8 md:p-10 mb-10 shadow-xl flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 opacity-10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4"></div>

          <div className="relative z-10 text-center md:text-left">
            <p className="text-gray-400 font-bold uppercase tracking-wider text-sm mb-2">Points Balance</p>
            <h2 className="text-5xl md:text-6xl font-black text-white flex items-baseline justify-center md:justify-start gap-2">
              2,450 <span className="text-xl text-[#00A651]">pts</span>
            </h2>
          </div>

          <div className="relative z-10 w-full md:w-1/2 bg-white/10 p-6 rounded-[2rem] border border-white/10 backdrop-blur-sm">
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="font-bold text-white mb-1">Platinum Tier</p>
                <p className="text-xs text-gray-400 font-medium">You're 550 points away from Platinum Tier!</p>
              </div>
              <span className="text-xl">👑</span>
            </div>
            <div className="w-full bg-black/30 h-3 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-[#00A651] to-green-300 h-full rounded-full" style={{ width: '80%' }}></div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex overflow-x-auto hide-scrollbar gap-3 mb-8 pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                activeTab === tab
                  ? 'bg-[#00A651] text-white shadow-md shadow-green-200'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-[#00A651] hover:text-[#00A651]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* REWARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {rewardsData.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
            >
              {/* Gambar Cover */}
              <div className="relative h-40 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-gray-900 shadow-sm flex items-center gap-1">
                  <span>{item.icon}</span> {item.provider}
                </div>
              </div>

              {/* Konten Kartu */}
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-gray-900 mb-4 leading-snug">
                  {item.title}
                </h3>
                
                <div className="mt-auto">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-gray-400 uppercase">Cost</span>
                    <span className="font-black text-[#00A651] bg-[#E6FAF1] px-3 py-1 rounded-lg text-sm">
                      {item.cost} pts
                    </span>
                  </div>
                  <button className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-[#00A651] transition-colors shadow-sm">
                    Redeem
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-[#0B132B] text-white py-16 mt-16">
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

export default RewardsPage;