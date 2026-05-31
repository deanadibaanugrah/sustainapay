import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Users, Activity, Search, Bell, Menu, X, Edit, Trash, Gift, Plus, Star
} from 'lucide-react';
import { useLanguage } from "./LanguageContext";

const AdminDashboard = () => {
  const contextData = useLanguage() || {};
  const tContext = contextData.t || {};
  const t = tContext.admin || {};

  const [dashboardData, setDashboardData] = useState(null);
  const [usersData, setUsersData] = useState([]);
  const [vouchersData, setVouchersData] = useState([]);
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

  // State untuk MODAL POINTS USER
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [selectedUserForPoints, setSelectedUserForPoints] = useState(null);
  const [pointsForm, setPointsForm] = useState({
    action: 'add',
    amount: 0
  });

  // State untuk MODAL VOUCHER
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isDeleteVoucherModalOpen, setIsDeleteVoucherModalOpen] = useState(false);
  const [editingVoucherId, setEditingVoucherId] = useState(null);
  const [voucherToDelete, setVoucherToDelete] = useState(null);
  const [voucherForm, setVoucherForm] = useState({
    title: '',
    provider: '',
    icon: '',
    image: '',
    type: 'reward',
    cost: 500,
    tier_required: 'Bronze'
  });

  // Ambil semua data dari backend
  const fetchAllData = () => {
    const token = localStorage.getItem('token'); 

    const fetchDashboard = axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000')}/api/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });

    const fetchUsers = axios.get(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000')}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });

    const fetchVouchers = axios.get(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/admin/vouchers`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
    });

    Promise.all([fetchDashboard, fetchUsers, fetchVouchers])
      .then(([dashboardRes, usersRes, vouchersRes]) => {
        setDashboardData(dashboardRes.data);
        
        // Fallback multi-key agar aman jika response berwujud objek ber-key atau langsung array
        const usersList = usersRes.data?.users || usersRes.data?.data || (Array.isArray(usersRes.data) ? usersRes.data : []);
        setUsersData(usersList);

        const vouchersList = vouchersRes.data?.vouchers || vouchersRes.data?.data || [];
        setVouchersData(vouchersList);
        
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
      toast.success(t.toastEditUser || 'Data pengguna berhasil diubah!');
    } catch (error) {
      console.error(error);
      toast.error(t.toastEditUserFail || 'Gagal mengubah data pengguna. Pastikan email belum terpakai atau koneksi lancar.');
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
      
      toast.success(t.toastDelUser || 'Data pengguna berhasil dihapus!');
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchAllData(); // Refresh data tabel
    } catch (error) {
      console.error(error);
      toast.error(t.toastDelUserFail || 'Gagal menghapus data pengguna. Mungkin ada data terkait yang mencegah penghapusan.');
    }
  };

  // Handler Buka Modal Points
  const handleOpenPointsModal = (user) => {
    setSelectedUserForPoints(user);
    setPointsForm({ action: 'add', amount: 0 });
    setIsPointsModalOpen(true);
  };

  // Handler Submit Form Points
  const handleUpdatePoints = async (e) => {
    e.preventDefault();
    if (pointsForm.amount < 0) {
      toast.error(t.ptsNegativeErr || 'Jumlah tidak boleh negatif');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/admin/users/${selectedUserForPoints.id}/points`, pointsForm, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      
      toast.success(t.toastPts || 'Poin pengguna berhasil diperbarui!');
      setIsPointsModalOpen(false);
      setSelectedUserForPoints(null);
      fetchAllData();
    } catch (error) {
      console.error(error);
      toast.error(t.toastPtsFail || 'Gagal memperbarui poin pengguna.');
    }
  };

  // Handler VOUCHERS CRUD
  const handleOpenVoucherModal = (voucher = null) => {
    if (voucher) {
      setEditingVoucherId(voucher.id);
      setVoucherForm({
        title: voucher.title, provider: voucher.provider, icon: voucher.icon || '', image: voucher.image || '', imageFile: null,
        type: voucher.type, cost: voucher.cost, tier_required: voucher.tier_required
      });
    } else {
      setEditingVoucherId(null);
      setVoucherForm({
        title: '', provider: '', icon: '🎁', image: '', imageFile: null, type: 'reward', cost: 500, tier_required: 'Bronze'
      });
    }
    setIsVoucherModalOpen(true);
  };

  const handleSaveVoucher = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', voucherForm.title);
      formData.append('provider', voucherForm.provider);
      formData.append('icon', voucherForm.icon);
      formData.append('type', voucherForm.type);
      formData.append('cost', voucherForm.cost);
      formData.append('tier_required', voucherForm.tier_required);
      
      if (voucherForm.imageFile) {
        formData.append('image', voucherForm.imageFile);
      } else if (voucherForm.image) {
        formData.append('image', voucherForm.image);
      }

      if (editingVoucherId) {
        formData.append('_method', 'PUT');
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/admin/vouchers/${editingVoucherId}`, formData, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        toast.success(t.toastVchUpdate || 'Voucher diperbarui!');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/admin/vouchers`, formData, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
        });
        toast.success(t.toastVchAdd || 'Voucher ditambahkan!');
      }
      setIsVoucherModalOpen(false);
      fetchAllData();
    } catch (err) {
      toast.error(t.toastVchSaveFail || 'Gagal menyimpan voucher');
    }
  };

  const confirmDeleteVoucher = async () => {
    if (!voucherToDelete) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/admin/vouchers/${voucherToDelete.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success(t.toastVchDel || 'Voucher dihapus!');
      setIsDeleteVoucherModalOpen(false);
      fetchAllData();
    } catch (err) {
      toast.error(t.toastVchDelFail || 'Gagal menghapus voucher');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-[#00A651] font-bold">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-green-200 border-t-[#00A651] rounded-full animate-spin"></div>
          <p>{t.loading || 'Memuat Data Admin...'}</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-red-500 font-bold">
        {t.fetchFail || 'Gagal mengambil data dari server. Pastikan Backend Laravel menyala.'}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900 relative overflow-hidden">
      
      {/* SIDEBAR DESKTOP */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col shadow-sm">
        <div className="p-6">
          <h1 className="text-2xl font-black text-[#00A651]">{t.title || 'SustainaPay Admin'}</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'overview' ? 'bg-green-50 text-[#00A651]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <Activity size={20} /> {t.navOverview || 'Overview'}
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'users' ? 'bg-green-50 text-[#00A651]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <Users size={20} /> {t.navUsers || 'Manage Users'}
          </button>
          <button 
            onClick={() => setActiveTab('rewards')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'rewards' ? 'bg-green-50 text-[#00A651]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <Gift size={20} /> {t.navRewards || 'Manage Rewards'}
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
              <button 
                onClick={() => { setActiveTab('rewards'); setIsMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition ${activeTab === 'rewards' ? 'bg-green-50 text-[#00A651]' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Gift size={20} /> Manage Rewards
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
              <h2 className="text-2xl font-black text-gray-900 mb-6">{t.overviewTitle || 'Dashboard Overview'}</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title={t.statUsers || "Total Users"} value={dashboardData?.stats?.total_users ?? 0} trend="+12%" />
                <StatCard title={t.statCarbon || "Total Emisi Karbon"} value={`${dashboardData?.stats?.total_carbon_tons ?? 0}K Tons`} trend="+5.2%" />
                <StatCard title={t.statTrans || "Transaksi Aktif"} value={dashboardData?.stats?.active_transactions ?? 0} trend="-2.1%" isNegative />
                <StatCard title={t.statAI || "Active AI Requests"} value={dashboardData?.stats?.ai_requests ?? 0} trend="+14%" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white border border-gray-100 rounded-[2rem] p-6 md:p-8 shadow-xs">
                  <h3 className="text-lg font-black text-gray-900 mb-6">{t.trendsTitle || 'Emission Trends'}</h3>
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
                  <h3 className="text-lg font-black text-gray-900 mb-6">{t.recentTitle || 'Recent Activity'}</h3>
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
              <h2 className="text-2xl font-black text-gray-900 mb-6">{t.usersTitle || 'Manage Users'} ({usersData.length})</h2>

              <div className="bg-white border border-gray-100 rounded-[2rem] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">
                        <th className="py-4 px-6">{t.thID || 'ID'}</th>
                        <th className="py-4 px-6">{t.thName || 'Nama Pengguna'}</th>
                        <th className="py-4 px-6">{t.thEmail || 'Email'}</th>
                        <th className="py-4 px-6">{t.thPassword || 'Password'}</th>
                        <th className="py-4 px-6">{t.thBalance || 'Wallet Balance'}</th>
                        <th className="py-4 px-6">{t.thRole || 'Role'}</th>
                        <th className="py-4 px-6 text-center">{t.thAction || 'Aksi'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                      {usersData.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-gray-400">{t.noUsers || 'Tidak ada data pengguna ditemukan.'}</td>
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
                                  onClick={() => handleOpenPointsModal(user)}
                                  className="p-2 text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition"
                                  title="Atur Poin"
                                >
                                  <Star size={16} />
                                </button>
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

          {/* TAB: MANAGE REWARDS */}
          {activeTab === 'rewards' && (
            <div className="animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-gray-900">{t.rewardsTitle || 'Manage Rewards'} ({vouchersData.length})</h2>
                <button 
                  onClick={() => handleOpenVoucherModal()}
                  className="bg-[#00A651] hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition"
                >
                  <Plus size={18} /> {t.btnAddVoucher || 'Tambah Voucher'}
                </button>
              </div>

              <div className="bg-white border border-gray-100 rounded-[2rem] shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/70 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-400">
                        <th className="py-4 px-6">{t.thID || 'ID'}</th>
                        <th className="py-4 px-6">{t.thTitle || 'Title'}</th>
                        <th className="py-4 px-6">{t.thProvider || 'Provider'}</th>
                        <th className="py-4 px-6">{t.thType || 'Type'}</th>
                        <th className="py-4 px-6">{t.thCost || 'Cost'}</th>
                        <th className="py-4 px-6">{t.thTier || 'Required Tier'}</th>
                        <th className="py-4 px-6 text-center">{t.thAction || 'Aksi'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-sm font-medium text-gray-700">
                      {vouchersData.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-gray-400">{t.noVouchers || 'Belum ada voucher tersedia.'}</td>
                        </tr>
                      ) : (
                        vouchersData.map((voucher) => (
                          <tr key={voucher.id} className="hover:bg-gray-50/50 transition">
                            <td className="py-4 px-6 text-gray-400 font-mono text-xs">#{voucher.id}</td>
                            <td className="py-4 px-6 font-bold text-gray-900">
                              <span className="mr-2">{voucher.icon}</span> {voucher.title}
                            </td>
                            <td className="py-4 px-6 text-gray-500">{voucher.provider}</td>
                            <td className="py-4 px-6">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${voucher.type === 'reward' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                                {voucher.type}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="font-bold text-[#00A651]">{voucher.cost} pts</span>
                            </td>
                            <td className="py-4 px-6">
                              <span className="font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md text-xs">{voucher.tier_required}</span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button 
                                  onClick={() => handleOpenVoucherModal(voucher)}
                                  className="p-2 text-blue-500 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                                >
                                  <Edit size={16} />
                                </button>
                                <button 
                                  onClick={() => { setVoucherToDelete(voucher); setIsDeleteVoucherModalOpen(true); }}
                                  className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition"
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
              <h3 className="text-xl font-black text-gray-900">{t.editUser || 'Edit Data Pengguna'}</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-red-500 transition">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.editName || 'Nama Pengguna'}</label>
                <input 
                  type="text" 
                  required 
                  value={editForm.name} 
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651]" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.editEmail || 'Email'}</label>
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
                  {t.editPass || 'Password Baru'} <span className="text-gray-400 font-normal text-xs">{t.editPassHint || '(Kosongkan jika tak diubah)'}</span>
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
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.editRole || 'Role / Tier'}</label>
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
                  {t.btnCancel || 'Batal'}
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-[#00A651] text-white rounded-xl hover:bg-green-700 font-bold shadow-md transition"
                >
                  {t.btnSave || 'Simpan Perubahan'}
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
            <h3 className="text-xl font-black text-gray-900 mb-2">{t.delUser || 'Hapus Pengguna'}</h3>
            <p className="text-gray-500 mb-6 font-medium">
              {t.delUserMsg1 || 'Apakah Anda yakin ingin menghapus pengguna'} <span className="font-bold text-gray-900">"{userToDelete?.name}"</span>{t.delUserMsg2 || '? Tindakan ini tidak dapat dibatalkan dan semua data terkait akan ikut terhapus.'}
            </p>

            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-bold transition flex-1"
              >
                {t.btnCancel || 'Batal'}
              </button>
              <button 
                onClick={confirmDeleteUser} 
                className="px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 font-bold shadow-md transition flex-1"
              >
                {t.btnYesDelete || 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================ MODAL POINTS USER ================ */}
      {isPointsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-900">{t.ptsTitle || 'Atur Poin Pengguna'}</h3>
              <button onClick={() => setIsPointsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition">
                <X size={24} />
              </button>
            </div>

            <div className="mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-sm text-gray-500 font-bold mb-1">{t.ptsUser || 'Pengguna'}</p>
              <p className="text-lg font-black text-gray-900">{selectedUserForPoints?.name}</p>
            </div>

            <form onSubmit={handleUpdatePoints} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.ptsAction || 'Tindakan'}</label>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    type="button"
                    onClick={() => setPointsForm({...pointsForm, action: 'add'})}
                    className={`py-2 rounded-lg text-sm font-bold transition-all border ${pointsForm.action === 'add' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  >{t.ptsAdd || 'Tambah'}</button>
                  <button 
                    type="button"
                    onClick={() => setPointsForm({...pointsForm, action: 'subtract'})}
                    className={`py-2 rounded-lg text-sm font-bold transition-all border ${pointsForm.action === 'subtract' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  >{t.ptsSub || 'Kurangi'}</button>
                  <button 
                    type="button"
                    onClick={() => setPointsForm({...pointsForm, action: 'set'})}
                    className={`py-2 rounded-lg text-sm font-bold transition-all border ${pointsForm.action === 'set' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                  >{t.ptsSet || 'Set Tetap'}</button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">{t.ptsAmount || 'Jumlah Poin'}</label>
                <input 
                  type="number" 
                  min="0"
                  required 
                  value={pointsForm.amount} 
                  onChange={(e) => setPointsForm({...pointsForm, amount: parseInt(e.target.value) || 0})} 
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#00A651]/20 focus:border-[#00A651] text-xl font-black" 
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsPointsModalOpen(false)} 
                  className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-bold transition"
                >{t.btnCancel || 'Batal'}</button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-[#00A651] text-white rounded-xl hover:bg-green-700 font-bold shadow-md transition"
                >{t.btnSavePts || 'Simpan Poin'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================ MODAL ADD/EDIT VOUCHER ================ */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-900">{editingVoucherId ? (t.editVoucher || 'Edit Voucher') : (t.addVoucher || 'Tambah Voucher')}</h3>
              <button onClick={() => setIsVoucherModalOpen(false)} className="text-gray-400 hover:text-red-500 transition">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSaveVoucher} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t.vchTitle || 'Title'}</label>
                  <input type="text" required value={voucherForm.title} onChange={(e) => setVoucherForm({...voucherForm, title: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#00A651]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t.vchProvider || 'Provider'}</label>
                  <input type="text" required value={voucherForm.provider} onChange={(e) => setVoucherForm({...voucherForm, provider: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#00A651]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t.vchIcon || 'Icon (Emoji)'}</label>
                  <input type="text" value={voucherForm.icon} onChange={(e) => setVoucherForm({...voucherForm, icon: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#00A651]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t.vchType || 'Type'}</label>
                  <select value={voucherForm.type} onChange={(e) => setVoucherForm({...voucherForm, type: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#00A651]">
                    <option value="reward">{t.vchTypeReward || 'Reward (Diskon dll)'}</option>
                    <option value="donation">{t.vchTypeDonation || 'Donation (Tanam Pohon dll)'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Cost (Points)</label>
                  <input type="number" min="1" required value={voucherForm.cost} onChange={(e) => setVoucherForm({...voucherForm, cost: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#00A651]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Required Tier</label>
                  <select value={voucherForm.tier_required} onChange={(e) => setVoucherForm({...voucherForm, tier_required: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#00A651]">
                    <option value="Bronze">Bronze (0+ pts)</option>
                    <option value="Silver">Silver (500+ pts)</option>
                    <option value="Gold">Gold (1500+ pts)</option>
                    <option value="Platinum">Platinum (5000+ pts)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Image (Browse Device)</label>
                  <input type="file" accept="image/*" onChange={(e) => setVoucherForm({...voucherForm, imageFile: e.target.files[0]})} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#00A651]" />
                  {voucherForm.image && !voucherForm.imageFile && (
                    <p className="text-xs text-gray-500 mt-1 truncate">Current: {voucherForm.image}</p>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsVoucherModalOpen(false)} className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-bold transition">{t.btnCancel || 'Batal'}</button>
                <button type="submit" className="px-5 py-2.5 bg-[#00A651] text-white rounded-xl hover:bg-green-700 font-bold shadow-md transition">{t.btnSave || 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================ MODAL HAPUS VOUCHER ================ */}
      {isDeleteVoucherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-fadeIn text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">{t.delVoucher || 'Hapus Voucher'}</h3>
            <p className="text-gray-500 mb-6 font-medium">{t.delVoucherMsg || 'Yakin menghapus voucher'} "{voucherToDelete?.title}"?</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setIsDeleteVoucherModalOpen(false)} className="px-5 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-bold transition flex-1">{t.btnCancel || 'Batal'}</button>
              <button onClick={confirmDeleteVoucher} className="px-5 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 font-bold shadow-md transition flex-1">{t.btnYesDelete || 'Ya, Hapus'}</button>
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