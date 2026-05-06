import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// --- Data Dummy Rekomendasi ---
const recommendationsData = [
  {
    id: 1,
    name: 'FreshFarm Organics',
    category: 'Groceries',
    description: 'Local, organic produce delivered to your door with zero-waste packaging.',
    impact: '-12 kg CO2/month',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    logo: '🥦',
  },
  {
    id: 2,
    name: 'EcoRide Transit',
    category: 'Transport',
    description: '100% electric city transit network. Cheaper and greener than driving.',
    impact: '-45 kg CO2/month',
    image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=600&q=80',
    logo: '🚌',
  },
  {
    id: 3,
    name: 'ThriftThreads',
    category: 'Shopping',
    description: 'High-quality upcycled and second-hand fashion from top brands.',
    impact: '-8 kg CO2/item',
    image: 'https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?auto=format&fit=crop&w=600&q=80',
    logo: '👕',
  },
  {
    id: 4,
    name: 'GreenBite Eatery',
    category: 'Dining',
    description: 'Delicious plant-based meals sourced from local farmers.',
    impact: '-5 kg CO2/meal',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    logo: '🥗',
  },
  {
    id: 5,
    name: 'SunPower Co.',
    category: 'Utilities',
    description: 'Switch your home electricity to 100% renewable solar energy.',
    impact: '-150 kg CO2/month',
    image: 'https://images.unsplash.com/photo-1509391366360-12009a308569?auto=format&fit=crop&w=600&q=80',
    logo: '☀️',
  },
  {
    id: 6,
    name: 'ZeroWaste Market',
    category: 'Groceries',
    description: 'Bring your own containers and shop bulk dry goods and household items.',
    impact: '-10 kg CO2/month',
    image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=600&q=80',
    logo: '🌾',
  },
];

const categories = ['All', 'Groceries', 'Transport', 'Shopping', 'Dining', 'Utilities'];

const RecommendationsPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  // Filter data berdasarkan kategori yang dipilih
  const filteredData = activeCategory === 'All' 
    ? recommendationsData 
    : recommendationsData.filter(item => item.category === activeCategory);

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
          <Link to="/recommendations" className="text-green-600 border-b-2 border-green-600 pb-1">Recommendations</Link>
          <Link to="/rewards" className="hover:text-green-600">Rewards</Link>
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
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#00A651] mb-3">
            Eco-Friendly Alternatives
          </h1>
          <p className="text-gray-500 font-medium text-lg max-w-2xl">
            Discover sustainable brands and services that help reduce your carbon footprint without compromising on quality.
          </p>
        </div>

        {/* TABS / CATEGORY FILTER */}
        <div className="flex overflow-x-auto hide-scrollbar gap-3 mb-10 pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-semibold transition-all duration-300 ${
                activeCategory === category
                  ? 'bg-[#00A651] text-white shadow-md shadow-green-200'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-[#00A651] hover:text-[#00A651]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* GRID KARTU REKOMENDASI */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredData.map((item) => (
            <div 
              key={item.id} 
              className="bg-white rounded-[2rem] overflow-hidden border border-gray-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              {/* Gambar Cover */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#00A651] shadow-sm">
                  {item.category}
                </div>
              </div>

              {/* Konten Kartu */}
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#E6FAF1] rounded-full flex items-center justify-center text-xl shadow-sm border border-[#DFF7ED]">
                    {item.logo}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                </div>
                
                <p className="text-gray-500 font-medium text-sm mb-6 flex-grow leading-relaxed">
                  {item.description}
                </p>

                {/* Footer Kartu: Impact & Button */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Carbon Savings</p>
                    <p className="text-sm font-bold text-[#00A651] bg-[#E6FAF1] inline-block px-2 py-1 rounded-md">
                      {item.impact}
                    </p>
                  </div>
                  <button className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#00A651] transition-colors shadow-sm">
                    View Info
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Jika Filter Kosong */}
        {filteredData.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🍃</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No recommendations yet</h3>
            <p className="text-gray-500">We are still looking for green alternatives in this category.</p>
          </div>
        )}

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

export default RecommendationsPage;