import React from 'react';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  // Data dummy user
  const user = {
    name: 'Gibran ',
    email: 'Gibran.FufuFafa.com',
    location: 'Jakarta, Indonesia',
    joinDate: 'January 2024',
    points: 2450,
    carbonSaved: '1,245 kg',
    impactRank: 'Top 15%',
    avatar: 'https://ui-avatars.com/api/?name=Gibran+FufuFafa&background=00A651&color=fff&size=128'
  };

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
          <Link to="/rewards" className="hover:text-green-600">Rewards</Link>
          
          {/* Menu Profile sekarang AKTIF */}
          <Link to="/profile" className="text-green-600 border-b-2 border-green-600 pb-1">Profile</Link>
        </div>

        <div className="flex items-center gap-3">
          <button className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-200 transition">🔔</button>
          <div className="w-10 h-10 bg-green-600 rounded-full border-2 border-white shadow-sm overflow-hidden cursor-pointer">
            <img src={user.avatar} alt="User" />
          </div>
        </div>
      </nav>

      {/* CONTENT AREA */}
      <main className="max-w-4xl mx-auto px-8 py-12">
        
        {/* HEADER / COVER AREA */}
        <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-green-600 to-[#0B132B]"></div>
          <div className="px-10 pb-10">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 mb-6">
              <div className="w-32 h-32 rounded-[2.5rem] border-4 border-white overflow-hidden shadow-lg bg-white">
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <div className="text-center md:text-left flex-grow">
                <h1 className="text-3xl font-black text-gray-900">{user.name}</h1>
                <p className="text-gray-500 font-bold">{user.email}</p>
              </div>
              <button className="bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-[#00A651] transition shadow-md">
                Edit Profile
              </button>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-50">
              <div className="text-center p-4 bg-[#F6FCF9] rounded-[2rem]">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Points</p>
                <p className="text-2xl font-black text-[#00A651]">{user.points} pts</p>
              </div>
              <div className="text-center p-4 bg-[#F6FCF9] rounded-[2rem]">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">CO2 Reduced</p>
                <p className="text-2xl font-black text-gray-900">{user.carbonSaved}</p>
              </div>
              <div className="text-center p-4 bg-[#F6FCF9] rounded-[2rem]">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Impact Rank</p>
                <p className="text-2xl font-black text-blue-600">{user.impactRank}</p>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Account Information */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <span className="p-2 bg-green-50 rounded-lg text-lg">👤</span> Personal Info
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                <p className="font-bold text-gray-800 border-b border-gray-50 pb-2">{user.name}</p>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</label>
                <p className="font-bold text-gray-800 border-b border-gray-50 pb-2">{user.location}</p>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined Since</label>
                <p className="font-bold text-gray-800 border-b border-gray-50 pb-2">{user.joinDate}</p>
              </div>
            </div>
          </div>

          {/* Preferences / Settings */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <span className="p-2 bg-blue-50 rounded-lg text-lg">⚙️</span> Settings
            </h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-green-50 transition-colors group">
                <span className="font-bold text-gray-700 group-hover:text-green-600">Notification Settings</span>
                <span className="text-gray-400">›</span>
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-green-50 transition-colors group">
                <span className="font-bold text-gray-700 group-hover:text-green-600">Privacy & Security</span>
                <span className="text-gray-400">›</span>
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-red-50 transition-colors group">
                <span className="font-bold text-red-600">Logout</span>
                <span className="text-red-400">🚪</span>
              </button>
            </div>
          </div>

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
            </ul>
          </div>
          <div>
            <h5 className="font-black text-sm mb-6">Company</h5>
            <ul className="text-xs text-gray-400 space-y-4 font-bold">
              <li className="hover:text-white cursor-pointer transition">About</li>
              <li className="hover:text-white cursor-pointer transition">Blog</li>
            </ul>
          </div>
          <div>
            <h5 className="font-black text-sm mb-6">Support</h5>
            <ul className="text-xs text-gray-400 space-y-4 font-bold">
              <li className="hover:text-white cursor-pointer transition">Help Center</li>
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

export default ProfilePage;