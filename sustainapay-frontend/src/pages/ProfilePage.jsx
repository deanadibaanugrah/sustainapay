import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from "./LanguageContext";
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // 1. Ambil state bahasa dari Context secara aman
  const contextData = useLanguage() || {};
  const tContext = contextData.t || {};
  const t = tContext.profile || {};
  const rawLang = contextData.language || contextData.lang || 'id';
  const safeLang = String(rawLang).toLowerCase() === 'en' ? 'en' : 'id';

  // State utama untuk menampilkan data user
  const [user, setUser] = useState({
    name: 'Loading...',
    email: 'Loading...',
    location: '',
    joinDate: '',
    points: 0,
    carbonSaved: '0 kg',
    impactRank: 'Calculating...',
    avatar: ''
  });

  // State untuk mode Edit
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', location: '', avatar: '' });
  const [isLocating, setIsLocating] = useState(false); 

  // Mengambil data user dari Backend saat halaman pertama kali dimuat
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    fetch(`${import.meta.env.VITE_BACKEND_URL || (import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000')}/api/user`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      // Data yang diambil dari DB bisa dibungkus 'user' atau ditaruh langsung di 'data'
      const userData = data.user || data; 
      localStorage.setItem('user', JSON.stringify(userData));

      const getInitials = (name) => {
        if (!name) return 'U';
        const words = name.split(' ');
        if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
        return name.substring(0, 2).toUpperCase();
      };

      const dateString = userData.created_at 
        ? new Date(userData.created_at).toLocaleDateString(safeLang === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' })
        : new Date().toLocaleDateString(safeLang === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' });

      setUser({
        name: userData.name || 'User',
        email: userData.email || '',
        location: userData.location || localStorage.getItem('user_location') || '', 
        joinDate: dateString,
        avatar: userData.avatar || localStorage.getItem('user_avatar') || `https://ui-avatars.com/api/?name=${getInitials(userData.name)}&background=00A651&color=fff&size=128`,
        points: data.points ?? 0, 
        carbonSaved: `${data.carbonSaved ?? 0} kg`,
        impactRank: data.impactRank ?? 'Top 50%',
      });
    })
    .catch(err => {
      console.error("Gagal mengambil data user:", err);
      if(err.message && err.message.includes('401')) {
          localStorage.removeItem('token');
          navigate('/login');
      }
    });

  }, [navigate, safeLang]);

  const handleEditClick = () => {
    setEditForm({
      name: user.name === 'Loading...' ? '' : user.name,
      email: user.email === 'Loading...' ? '' : user.email,
      location: user.location,
      avatar: user.avatar
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('token');

    try {
      // Mengubah method jadi POST sesuai dengan route api.php milikmu
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || (import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000')}/api/user/update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          location: editForm.location,
          avatar: editForm.avatar
        })
      });

      if (response.ok) {
        setUser(prev => ({
          ...prev,
          name: editForm.name,
          email: editForm.email,
          location: editForm.location,
          avatar: editForm.avatar
        }));

        localStorage.setItem('user_location', editForm.location);
        localStorage.setItem('user_avatar', editForm.avatar);

        setIsEditing(false);
      } else {
        toast.error(t.alertSaveFail);
      }
    } catch (err) {
      console.error("Error update profile:", err);
      toast.error(t.alertNetError);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error(t.alertNoGps);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          
          const city = data.address.city || data.address.town || data.address.state || 'Unknown City';
          const country = data.address.country || 'Unknown Country';
          
          setEditForm(prev => ({ ...prev, location: `${city}, ${country}` }));
        } catch (error) {
          console.error(error);
          setEditForm(prev => ({ ...prev, location: `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}` }));
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error(error);
        toast.error(t.alertGpsFail);
        setIsLocating(false);
      }
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_avatar');
    localStorage.removeItem('user_location');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F6FCF9] font-sans text-gray-900 relative">
      
      {/* MODAL EDIT PROFIL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-[fadeIn_0.2s_ease-out]">
            <h2 className="text-2xl font-black text-gray-900 mb-6">{t.editProfile}</h2>
            
            {/* Ganti Foto */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-green-50 overflow-hidden mb-3 relative group">
                <img src={editForm.avatar} alt="Edit Avatar" className="w-full h-full object-cover" />
                <div 
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                  onClick={() => fileInputRef.current.click()}
                >
                  <span className="text-white text-xs font-bold">{t.changeAvatar}</span>
                </div>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleImageUpload} 
              />
              <button 
                onClick={() => fileInputRef.current.click()}
                className="text-xs font-bold text-green-600 hover:text-green-800"
              >
                {t.uploadGallery}
              </button>
            </div>

            {/* Form Input */}
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">{t.fullName}</label>
                <input 
                  type="text" 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Email</label>
                <input 
                  type="email" 
                  value={editForm.email} 
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">{t.location}</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={editForm.location} 
                    onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                    placeholder={t.enterLoc}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 font-medium"
                  />
                  <button 
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="px-4 bg-green-100 text-green-700 rounded-xl font-bold hover:bg-green-200 transition disabled:opacity-50 flex-shrink-0"
                    title="Get Current Location"
                  >
                    {isLocating ? '...' : '📍 GPS'}
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button 
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition"
              >
                {t.cancel}
              </button>
              <button 
                onClick={handleSaveProfile}
                className="flex-1 py-3 rounded-xl text-sm font-bold text-white bg-[#00A651] hover:bg-green-700 transition shadow-md shadow-green-200"
              >
                {t.saveChanges}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition group">
            <img src="/logo.jpg" alt="Logo" className="w-10 h-10 object-cover rounded-xl border border-green-700/40 shadow-md ring-2 ring-white/50 group-hover:scale-105 transition-transform" />
            <span className="font-black text-xl tracking-tight text-gray-900 hidden md:block">
              Sustaina<span className="text-[#00A651]">Pay</span>
            </span>
          </Link>
          
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
            <Link to="/rewards" className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">
              {t.rewards}
            </Link>
            <Link to="/profile" className="px-5 py-2 text-sm font-black text-white bg-[#00A651] shadow-md shadow-green-200 rounded-full transition-all">
              {t.profile}
            </Link>
          </div>

          <div className="flex items-center gap-4">
            
            
            <div className="flex items-center gap-3 p-1.5 pr-4 bg-white border border-gray-100 rounded-full shadow-sm">
              <div className="w-8 h-8 bg-[#00A651] rounded-full overflow-hidden border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {user.avatar && <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />}
              </div>
              <span className="text-sm font-bold text-gray-700 hidden sm:block">{t.profile}</span>
            </div>
          </div>

        </div>
      </nav>

      {/* CONTENT AREA */}
      <main className="max-w-4xl mx-auto px-8 py-12">
        
        {/* HEADER / COVER AREA */}
        <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden mb-8 relative">
          <div className="h-32 bg-gradient-to-r from-green-600 to-[#0B132B]"></div>
          <div className="px-10 pb-10">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 mb-6">
              <div className="w-32 h-32 rounded-[2.5rem] border-4 border-white overflow-hidden shadow-lg bg-white shrink-0">
                {user.avatar && <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />}
              </div>
              <div className="text-center md:text-left flex-grow">
                <h1 className="text-3xl font-black text-gray-900">
                  {user.name === 'Loading...' ? t.loading : user.name}
                </h1>
                <p className="text-gray-500 font-bold">
                  {user.email === 'Loading...' ? t.loading : user.email}
                </p>
              </div>
              <button 
                onClick={handleEditClick}
                className="bg-gray-900 text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-[#00A651] transition shadow-md"
              >
                {t.editProfile}
              </button>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-50">
              <div className="text-center p-4 bg-[#F6FCF9] rounded-[2rem]">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t.totalPoints}</p>
                <p className="text-2xl font-black text-[#00A651]">{user.points} pts</p>
              </div>
              <div className="text-center p-4 bg-[#F6FCF9] rounded-[2rem]">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t.co2Reduced}</p>
                <p className="text-2xl font-black text-gray-900">{user.carbonSaved}</p>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Account Information */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <span className="p-2 bg-green-50 rounded-lg text-lg">👤</span> {t.personalInfo}
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.fullName}</label>
                <p className="font-bold text-gray-800 border-b border-gray-50 pb-2">
                  {user.name === 'Loading...' ? t.loading : user.name}
                </p>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.location}</label>
                <p className="font-bold text-gray-800 border-b border-gray-50 pb-2">
                  {user.location ? user.location : <span className="text-gray-400 italic">{t.locNotSet}</span>}
                </p>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.joinedSince}</label>
                <p className="font-bold text-gray-800 border-b border-gray-50 pb-2">{user.joinDate}</p>
              </div>
            </div>
          </div>

          {/* Preferences / Settings */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <span className="p-2 bg-blue-50 rounded-lg text-lg">⚙️</span> {t.settings}
            </h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-green-50 transition-colors group">
                <span className="font-bold text-gray-700 group-hover:text-green-600">{t.notifSettings}</span>
                <span className="text-gray-400">›</span>
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-green-50 transition-colors group">
                <span className="font-bold text-gray-700 group-hover:text-green-600">{t.privacySecurity}</span>
                <span className="text-gray-400">›</span>
              </button>
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-red-50 transition-colors group"
              >
                <span className="font-bold text-red-600">{t.logout}</span>
                <span className="text-red-400">🚪</span>
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* FOOTER */}

      {/* MOBILE BOTTOM NAV */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center p-3 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pb-safe">
        <Link to="/dashboard" className="flex flex-col items-center text-gray-500 hover:text-green-600">
          <span className="text-xl">??</span>
          <span className="text-[10px] font-bold mt-1">Dash</span>
        </Link>
        <Link to="/transactions" className="flex flex-col items-center text-gray-500 hover:text-green-600">
          <span className="text-xl">??</span>
          <span className="text-[10px] font-bold mt-1">Trans</span>
        </Link>
        <Link to="/carbon-impact" className="flex flex-col items-center text-gray-500 hover:text-green-600">
          <span className="text-xl">??</span>
          <span className="text-[10px] font-bold mt-1">Carbon</span>
        </Link>
        <Link to="/recommendations" className="flex flex-col items-center text-gray-500 hover:text-green-600">
          <span className="text-xl">?</span>
          <span className="text-[10px] font-bold mt-1">Saran</span>
        </Link>
        <Link to="/rewards" className="flex flex-col items-center text-gray-500 hover:text-green-600">
          <span className="text-xl">??</span>
          <span className="text-[10px] font-bold mt-1">Reward</span>
        </Link>
      </div>
    </div>
  );
};

export default ProfilePage;

