import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#F6FCF9] font-sans text-gray-900">
      
      {/* NAVBAR - Menu Tengah Sudah Dihapus */}
      <nav className="flex justify-between items-center py-6 px-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 bg-green-800 p-2 rounded-md">
          {/* Logo */}
          <div className="w-10 h-10 border-2 border-white rounded-full flex items-center justify-center text-white font-bold text-xs">
            LOGO
          </div>
        </div>
        
        {/* Bagian menu tengah (Home - Profile) sudah dihapus dari sini */}
        
        {/* Jika ingin menambah tombol di pojok kanan navbar nanti, bisa di sini */}
        <div className="hidden md:block">
           <Link to="/login" className="text-sm font-bold text-green-700 hover:underline">
             Sign In
           </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-8 pt-12 pb-16 flex flex-col md:flex-row items-center gap-12">
        {/* Left Column */}
        <div className="flex-1 space-y-8">
          <h1 className="text-6xl font-extrabold leading-tight text-gray-900">
            Your Digital Wallet <br />
            for a <br />
            <span className="text-[#00A651]">Sustainable Future</span>
          </h1>
          
          <div className="flex gap-4">
            <Link to="/login" className="bg-[#00A651] text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-green-700 transition inline-block text-center">
              Get Started
            </Link>
            <button className="bg-gray-200 text-gray-700 px-8 py-3 rounded-full font-bold shadow-sm hover:bg-gray-300 transition">
              Learn More
            </button>
          </div>

          <div className="flex gap-12 pt-8">
            <div>
              <h2 className="text-4xl font-extrabold text-gray-900">50K+</h2>
              <p className="text-gray-500 text-sm font-medium mt-1">Active Users</p>
            </div>
            <div>
              <h2 className="text-4xl font-extrabold text-gray-900">2M+</h2>
              <p className="text-gray-500 text-sm font-medium mt-1">Transactions</p>
            </div>
            <div>
              <h2 className="text-4xl font-extrabold text-gray-900">500T</h2>
              <p className="text-gray-500 text-sm font-medium mt-1">CO2 Tracked</p>
            </div>
          </div>
        </div>

        {/* Right Column - Hero Card Mockup */}
        <div className="flex-1 w-full flex justify-end">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className="p-6 bg-[#00A651] text-white">
              <p className="text-sm font-medium opacity-90">Total Carbon Footprint</p>
              <h3 className="text-3xl font-bold mt-1">124.5 kg</h3>
              <p className="text-xs opacity-80 mt-1">20% from last month</p>
            </div>
            <div className="p-6">
              <p className="text-sm font-bold text-gray-800 mb-4">Emission Trend</p>
              {/* Mock Chart */}
              <div className="flex items-end gap-2 h-24 mb-6">
                {[40, 60, 45, 80, 50, 65, 90, 70].map((h, i) => (
                  <div key={i} className="flex-1 bg-green-200 rounded-t-sm" style={{ height: `${h}%` }}></div>
                ))}
              </div>
              {/* Mock Transactions */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">☕</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Coffee Shop</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold">2.5 kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">🛒</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Grocery Store</p>
                      <p className="text-xs text-gray-500">5 hours ago</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold">7 kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bagian lainnya (Features, How it works, Footer) tetap sama seperti sebelumnya... */}
      {/* (Saya persingkat agar tidak terlalu panjang, tapi pastikan bagian bawahnya tetap ada di file Anda) */}

    </div>
  );
};

export default LandingPage;