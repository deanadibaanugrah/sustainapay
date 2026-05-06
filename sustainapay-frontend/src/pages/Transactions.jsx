import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Transactions = () => {
  const [activeFilter, setActiveFilter] = useState('All');

  // Data dummy transaksi yang SUDAH DIUBAH menjadi jenis kendaraan
  const transactionsData = [
    { id: 1, icon: '🚌', name: 'City Bus', category: 'Bus', date: 'Today, 08:30 AM', amount: '-$2.50', carbon: '0.5 kg', impact: 'low' },
    { id: 2, icon: '🚗', name: 'Taxi / Ride Hailing', category: 'Car', date: 'Today, 07:15 AM', amount: '-$14.20', carbon: '4.2 kg', impact: 'medium' },
    { id: 3, icon: '🏍️', name: 'Ojek Online', category: 'Motorcycle', date: 'Yesterday, 18:45 PM', amount: '-$5.50', carbon: '1.4 kg', impact: 'low' },
    { id: 4, icon: '🚗', name: 'Personal Car', category: 'Car', date: 'Yesterday, 14:20 PM', amount: '-$10.00', carbon: '8.0 kg', impact: 'high' },
    { id: 5, icon: '🚆', name: 'Commuter Train', category: 'Public Transport', date: 'May 12, 10:00 AM', amount: '-$3.00', carbon: '0.2 kg', impact: 'low' },
    { id: 6, icon: '🚆', name: 'Subway / MRT', category: 'Public Transport', date: 'May 10, 09:00 AM', amount: '-$4.00', carbon: '0.1 kg', impact: 'low' },
    { id: 7, icon: '🏍️', name: 'Delivery Bike', category: 'Motorcycle', date: 'May 09, 20:30 PM', amount: '-$8.50', carbon: '2.8 kg', impact: 'medium' },
    { id: 8, icon: '🚌', name: 'Intercity Bus', category: 'Bus', date: 'May 08, 15:10 PM', amount: '-$25.00', carbon: '15.0 kg', impact: 'high' },
  ];

  // FILTER YANG SUDAH DIUBAH
  const filters = ['All', 'Motorcycle', 'Car', 'Bus', 'Public Transport'];

  // Filter logika
  const filteredTransactions = activeFilter === 'All' 
    ? transactionsData 
    : transactionsData.filter(t => t.category === activeFilter);

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
          <Link to="/transactions" className="text-green-600 border-b-2 border-green-600 pb-1">Transactions</Link>
          
          {/* SEMUA LINK SUDAH DIPERBAIKI */}
          <Link to="/carbon-impact" className="hover:text-green-600">Carbon Impact</Link>
          <Link to="/recommendations" className="hover:text-green-600">Recommendations</Link>
          <Link to="/rewards" className="hover:text-green-600">Rewards</Link>
          <Link to="/profile" className="hover:text-green-600">Profile</Link>
        </div>

        <div className="flex items-center gap-3">
          <button className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-200 transition">🔔</button>
          {/* Foto profil juga diubah menjadi Link agar bisa diklik ke halaman profile */}
          <Link to="/profile" className="w-10 h-10 bg-green-600 rounded-full border-2 border-white shadow-sm overflow-hidden cursor-pointer block">
            <img src="https://ui-avatars.com/api/?name=Alex+Chen&background=00A651&color=fff" alt="User" />
          </Link>
        </div>
      </nav>

      {/* CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-8 py-10">
        
        {/* HEADER & SEARCH */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Transaction History</h1>
            <p className="text-gray-500 font-medium mt-1">Track your spending and its environmental impact</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input 
                type="text" 
                placeholder="Search transactions..." 
                className="w-full bg-white border border-gray-200 rounded-full py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
              />
            </div>
            <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-full text-sm font-bold shadow-sm hover:bg-gray-50 transition flex items-center gap-2">
              <span>⬇️</span> Export
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <div className="flex overflow-x-auto pb-4 mb-6 gap-3 hide-scrollbar">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                activeFilter === filter
                  ? 'bg-[#00A651] text-white shadow-md'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* TRANSACTION LIST */}
        <div className="bg-white rounded-[3rem] shadow-sm border border-gray-50 overflow-hidden">
          <div className="p-8">
            <div className="space-y-2">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((item) => (
                  <div key={item.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 hover:bg-gray-50 rounded-2xl transition cursor-pointer border border-transparent hover:border-gray-100 gap-4">
                    
                    {/* Left: Icon & Details */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-base">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">{item.category}</span>
                          <span className="text-xs font-bold text-gray-400">•</span>
                          <span className="text-xs font-bold text-gray-400">{item.date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Amounts & Impact Badge */}
                    <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-6 md:gap-8 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 mt-2 md:mt-0">
                      <div className="text-left md:text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Amount</p>
                        <p className="font-black text-gray-900">{item.amount}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Carbon</p>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-gray-900">{item.carbon}</p>
                          {/* Impact Indicator Indicator */}
                          <span className={`w-2 h-2 rounded-full ${
                            item.impact === 'low' ? 'bg-green-500' : 
                            item.impact === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></span>
                        </div>
                      </div>
                    </div>

                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📭</div>
                  <h3 className="text-lg font-black text-gray-900">No transactions found</h3>
                  <p className="text-sm text-gray-500 mt-1">Try changing your filters or check back later.</p>
                </div>
              )}
            </div>
            
            {/* PAGINATION */}
            {filteredTransactions.length > 0 && (
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                <p className="text-sm font-bold text-gray-400">Showing {filteredTransactions.length} results</p>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition font-bold">{'<'}</button>
                  <button className="w-8 h-8 rounded-full bg-[#00A651] text-white flex items-center justify-center shadow-md font-bold">1</button>
                  <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition font-bold">2</button>
                  <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition font-bold">3</button>
                  <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition font-bold">{'>'}</button>
                </div>
              </div>
            )}
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

export default Transactions;