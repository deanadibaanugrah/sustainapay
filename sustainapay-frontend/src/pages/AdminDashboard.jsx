import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Users, Activity, Zap, FileText, Settings, Search, Bell, Menu, X, Edit, Trash
} from 'lucide-react';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk navigasi sidebar
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // State untuk MODAL EDIT USER
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    password: '', 
    role: 'User'
  });

  // State untuk MODAL HAPUS USER
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Ambil semua data dari backend
  const fetchAllData = () => {
    const token = localStorage.getItem('token'); 

    const fetchDashboard = axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000')}/api/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });

    const fetchUsers = axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000')}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });

    Promise.all([fetchDashboard, fetchUsers])
      .then(([dashboardRes, usersRes]) => {
        setDashboardData(dashboardRes.data);
        
        // Fallback multi-key agar aman jika response berwujud objek ber-key atau langsung array
        const usersList = usersRes.data?.users || usersRes.data?.data || (Array.isArray(usersRes.data) ? usersRes.data : []);
        setUsersData(usersList);
        
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handler Buka Modal Edit
  const handleEditClick = (user) => {
    setEditingUserId(user.id);
    setEditForm({
      name: user.name,
      email: user.email,
      password: '', // Selalu kosongkan diawal demi keamanan
      role: user.role || 'User'
    });
    setIsEditModalOpen(true);
  };

  // Handler Submit Form Edit User
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000')}/api/admin/users/${editingUserId}`, editForm, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      
      setIsEditModalOpen(false); // Tutup Modal
      fetchAllData(); // Refresh data tabel
      toast.success('Data pengguna berhasil diubah!');
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengubah data pengguna. Pastikan email belum terpakai atau koneksi lancar.');
    }
  };

  // Handler Hapus User (Buka Modal)
  const handleDeleteUser = (userId, userName) => {
    setUserToDelete({ id: userId, name: userName });
    setIsDeleteModalOpen(true);
  };

  // Eksekusi Hapus User
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/admin/users/${userToDelete.id}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      
      toast.success('Data pengguna berhasil dihapus!');
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchAllData(); // Refresh data tabel
    } catch (error) {
      console.error(error);
      toast.error('Gagal menghapus data pengguna. Mungkin ada data terkait yang mencegah penghapusan.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-[#00A651] font-bold">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-200 border-t-[#00A651] rounded-full animate-spin"></div>
          <p>Memuat Data Admin...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-red-500 font-bold">
        Gagal mengambil data dari server. Pastikan Backend Laravel menyala.
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 relative overflow-hidden">
      
      {/* SIDEBAR DESKTOP */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col shadow-sm">
        <div className="p-6">
          <h1 className="text-2xl font-black text-[#00A651]">SustainaPay Admin</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'overview' ? 'bg-green-50 text-[#00A651]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <Activity size={20} /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'users' ? 'bg-green-50 text-[#00A651]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <Users size={20} /> Manage Users
          </button>
          <button className="w-full flex items-center gap-3 text-gray-400 opacity-50 px-4 py-3 rounded-xl font-medium cursor-not-allowed text-left">
            <Zap size={20} /> Emission Factors
          </button>
          <button className="w-full flex items-center gap-3 text-gray-400 opacity-50 px-4 py-3 rounded-xl font-medium cursor-not-allowed text-left">
            <FileText size={20} /> Reports & Analytics
          </button>
          <button className="w-full flex items-center gap-3 text-gray-400 opacity-50 px-4 py-3 rounded-xl font-medium mt-auto cursor-not-allowed text-left">
            <Settings size={20} /> Settings
          </button>
        </nav>
      </aside>

      {/* SIDEBAR MOBILE OVERLAY & DRAWER */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop gelap */}
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsMobileOpen(false)}></div>
          
          {/* Menu Drawer */}
          <aside className="relative w-64 bg-white h-full flex flex-col p-6 shadow-2xl z-50 animate-slideIn">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-black text-[#00A651]">SustainaPay</h1>
              <button onClick={() => setIsMobileOpen(false)} className="text-gray-400 hover:text-red-500 transition">
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 space-y-2">
              <button 
                onClick={() => { setActiveTab('overview'); setIsMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'overview' ? 'bg-green-50 text-[#00A651]' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Activity size={20} /> Overview
              </button>
              <button 
                onClick={() => { setActiveTab('users'); setIsMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'users' ? 'bg-green-50 text-[#00A651]' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Users size={20} /> Manage Users
              </button>
            </nav>
          </aside>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        {/* HEADER */}
        <header className="bg-white border-b border-gray-100 px-6 md:px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-xs">
          <div className="flex items-center gap-4 w-1/2">
            <Menu className="md:hidden text-gray-500 cursor-pointer hover:text-[#00A651]" onClick={() => setIsMobileOpen(true)} />
            <div className="relative w-full max-w-md hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00A651] font-medium"
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative cursor-pointer">
              <Bell className="text-gray-500 hover:text-[#00A651] transition" size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 w-2.5 h-2.5 rounded-full border-2 border-white"></span>
            </div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-800 group-hover:text-[#00A651] transition">Admin User</p>
                <p className="text-xs text-gray-500 font-medium">Super Admin</p>
              </div>
              <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                AU
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="p-6 md:p-8">
          
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Dashboard Overview</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Users" value={dashboardData?.stats?.total_users ?? 0} trend="+12%" />
                <StatCard title="Total Emisi Karbon" value={`${dashboardData?.stats?.total_carbon_tons ?? 0}K Tons`} trend="+5.2%" />
                <StatCard title="Transaksi Aktif" value={dashboardData?.stats?.active_transactions ?? 0} trend="-2.1%" isNegative />
                <StatCard title="Active AI Requests" value={dashboardData?.stats?.ai_requests ?? 0} trend="+14%" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[2rem] p-6 md:p-8 shadow-xs">
                  <h3 className="text-lg font-black text-gray-900 mb-6">Emission Trends</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData?.chart_data || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} dx={-10} />
                        <Tooltip cursor={{fill: '#F9FAFB'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                        <Bar dataKey="emissions" fill="#00A651" radius={[6, 6, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-[2rem] p-6 md:p-8 shadow-xs">
                  <h3 className="text-lg font-black text-gray-900 mb-6">Recent Activity</h3>
                  <div className="space-y-6">
                    {(dashboardData?.recent_activity || []).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-green-50 text-[#00A651] rounded-full flex items-center justify-center flex-shrink-0 font-bold border border-green-100">
                          {activity.user?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-gray-900">{activity.user} <span className="font-medium text-gray-500">{activity.action}</span></p>
                          <p className="text-xs text-gray-400 mt-1 font-medium">{activity.date}</p>
                        </div>
                        <div>
                          <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider ${activity.status === 'Completed' || activity.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MANAGE USERS */}
          {activeTab === 'users' && (
            <div className="animate-fadeIn">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Manage Users ({usersData.length})</h2>

              <div className="bg-white border border-gray-100 rounded-[2rem] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">
                        <th className="py-4 px-6">ID</th>
                        <th className="py-4 px-6">Nama Pengguna</th>
                        <th className="py-4 px-6">Email</th>
                        <th className="py-4 px-6">Password</th>
                        <th className="py-4 px-6">Wallet Balance</th>
                        <th className="py-4 px-6">Role</th>
                        <th className="py-4 px-6 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                      {usersData.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-gray-400">Tidak ada data pengguna ditemukan.</td>
                        </tr>
                      ) : (
                        usersData.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50/50 transition">
                            <td className="py-4 px-6 text-gray-400 font-mono text-xs">#{user.id}</td>
                            <td className="py-4 px-6 font-bold text-gray-900">{user.name}</td>
                            <td className="py-4 px-6 text-gray-500">{user.email}</td>
                            <td className="py-4 px-6">
                              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded font-mono break-all">
                                {user.password || '-'}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-xl">
                                {/* Diubah dari user.balance ke database key asli user.wallet_balance */}
                                Rp {Number(user.wallet_balance ?? user.balance ?? 0).toLocaleString('id-ID')}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${user.role?.toLowerCase() === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                {user.role || 'User'}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => handleEditClick(user)}
                                  className="p-2 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                                  title="Edit Pengguna"
                                >
                                  <Edit size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteUser(user.id, user.name)}
                                  className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition"
                                  title="Hapus Pengguna"
                                >
                                  <Trash size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ================ MODAL EDIT USER ================ */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-900">Edit Data Pengguna</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-red-500 transition">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nama Pengguna</label>
                <input 
                  type="text" 
                  required 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651]" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  required 
                  value={editForm.email} 
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})} 
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651]" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Password Baru <span className="text-gray-400 font-normal text-xs">(Kosongkan jika tak diubah)</span>
                </label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={editForm.password} 
                  onChange={(e) => setEditForm({...editForm, password: e.target.value})} 
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651]" 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Role / Tier</label>
                <select 
                  value={editForm.role} 
                  onChange={(e) => setEditForm({...editForm, role: e.target.value})} 
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651]"
                >
                  <option value="User">User (Biasa)</option>
                  <option value="Admin">Admin</option>
                  <option value="Freshman">Freshman</option>
                  <option value="Sophomore">Sophomore</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)} 
                  className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-bold transition"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-[#00A651] text-white rounded-xl hover:bg-green-700 font-bold shadow-md transition"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================ MODAL HAPUS USER ================ */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-fadeIn text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Hapus Pengguna</h3>
            <p className="text-gray-500 mb-6 font-medium">
              Apakah Anda yakin ingin menghapus pengguna <span className="font-bold text-gray-900">"{userToDelete?.name}"</span>? Tindakan ini tidak dapat dibatalkan dan semua data terkait akan ikut terhapus.
            </p>

            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-bold transition flex-1"
              >
                Batal
              </button>
              <button 
                onClick={confirmDeleteUser} 
                className="px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 font-bold shadow-md transition flex-1"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

const StatCard = ({ title, value, trend, isNegative }) => (
  <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-xs relative overflow-hidden group hover:border-[#00A651] transition-colors duration-300">
    <div className="absolute -right-6 -top-6 w-24 h-24 bg-gray-50 rounded-full group-hover:bg-green-50 transition-colors duration-300 z-0"></div>
    <div className="relative z-10">
      <h3 className="text-gray-500 text-sm font-bold mb-2 uppercase tracking-wider">{title}</h3>
      <div className="flex items-end justify-between mt-4">
        <p className="text-3xl md:text-4xl font-black text-gray-900">{value}</p>
        <span className={`text-sm font-black px-2 py-1 rounded-md ${isNegative ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {trend}
        </span>
      </div>
    </div>
  </div>
);

export default AdminDashboard;