import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useLanguage } from "./LanguageContext";
import { toast } from 'react-hot-toast';

const Transactions = () => {
  const contextData = useLanguage() || {};
  const tContext = contextData.t || {};
  const t = tContext.transactions || {};

  const filters = ['All', 'Motorcycle', 'Car', 'Bus', 'Public Transport', 'Top Up'];
  const [activeFilter, setActiveFilter] = useState('All');
  const [navUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const fullName = parsedUser.name || 'User';
        const getInitials = (name) => {
          if (!name) return 'U';
          const words = name.trim().split(' ');
          return words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
        };
        const userAvatar = localStorage.getItem('user_avatar') || parsedUser.profile_picture || parsedUser.avatar || null; 
        return { avatar: userAvatar, initials: getInitials(fullName) };
      } catch (error) { 
        console.error("Gagal parse data user:", error); 
        return { avatar: null, initials: 'U' };
      }
    }
    return { avatar: null, initials: 'U' };
  });
  const [balance, setBalance] = useState(0); 
  const [topupAmount, setTopupAmount] = useState('');
  const [topupMethod, setTopupMethod] = useState('BCA');
  const [modalStep, setModalStep] = useState('NONE');
  const [isScanning, setIsScanning] = useState(false); 
  const [isTopupLoading, setIsTopupLoading] = useState(false);
  const [scanProvider, setScanProvider] = useState('Gojek');
  const [scanCategory, setScanCategory] = useState('Motorcycle');
  const [scanRecipient, setScanRecipient] = useState('');
  const [scanDistance, setScanDistance] = useState('');
  const [scanCost, setScanCost] = useState('');
  const [scannedData, setScannedData] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [transactions, setTransactions] = useState([]);

  const filteredTransactions = activeFilter === 'All' ? transactions : transactions.filter(t => t.category === activeFilter);

  const fetchUserBalance = async () => {
    try {
      const userResponse = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000')}/api/user`, {
        method: 'GET', 
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (userResponse.ok) {
        const userData = await userResponse.json();
        let finalBalance = 0;
        
        if (userData.wallet_balance !== undefined && userData.wallet_balance !== null) {
           finalBalance = typeof userData.wallet_balance === 'object' ? (userData.wallet_balance.balance || userData.wallet_balance.amount || 0) : userData.wallet_balance;
        } else if (userData.balance !== undefined && userData.balance !== null) {
           finalBalance = userData.balance;
        } else if (userData.data && userData.data.wallet_balance !== undefined) {
           const db = userData.data.wallet_balance;
           finalBalance = typeof db === 'object' ? (db.balance || db.amount || 0) : db;
        } else if (userData.data && userData.data.balance !== undefined) {
           finalBalance = userData.data.balance;
        }
        setBalance(Number(finalBalance) || 0);
      }
    } catch (error) { console.error("Gagal mengambil update saldo terbaru:", error); }
  };

  const fetchTransactions = async () => {
    try {
      const historyResponse = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000')}/api/transactions/history`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        const rawTransactions = historyData.data || []; 
        const formattedTransactions = rawTransactions.map(item => {
          const isIncome = item.category === 'Top Up' || item.type === 'income' || item.type === 'topup';
          let finalAmount = item.amount;
          if (typeof item.amount === 'number' || (typeof item.amount === 'string' && !item.amount.includes('Rp'))) {
            finalAmount = isIncome ? `+Rp ${parseInt(item.amount || 0).toLocaleString('id-ID')}` : `-Rp ${parseInt(item.amount || 0).toLocaleString('id-ID')}`;
          }
          return {
            ...item, amount: finalAmount, icon: item.icon || (item.category === 'Car' ? '🚗' : item.category === 'Bus' ? '🚌' : item.category === 'Top Up' ? '➕' : '🏍️')
          };
        });
        setTransactions(formattedTransactions); 
      }
    } catch (error) { console.error("Gagal mengambil riwayat transaksi:", error); }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchUserBalance();
      await fetchTransactions();
    };
    fetchInitialData();
  }, []);

  const handleScanSukses = async (text) => {
    if (!text) return;
    setIsScanning(false); setModalStep('LOADING_AI'); 
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000')}/api/process-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}`},
        body: JSON.stringify({ qr_payload: text }) 
      });
      if (!response.ok) throw new Error('Gagal memproses QR di Backend');
      const backendData = await response.json();
      
      // Ambil data AI dengan lebih teliti (mendukung struktur nested 'data')
      const aiInsight = backendData.recommendation || backendData.data?.recommendation || backendData.ai_analysis || `Perjalanan ini menghasilkan emisi. Kurangi jejak karbon Anda dengan transportasi umum.`;
      const carbonValue = parseFloat(backendData.carbon || backendData.data?.carbon) || (parseFloat(backendData.distance) || 5) * 0.15;

      setScannedData({
        id: backendData.id || new Date().getTime(),
        icon: backendData.category === 'Car' ? '🚗' : backendData.category === 'Bus' ? '🚌' : '🏍️',
        name: backendData.provider_name || 'QR Payment',
        category: backendData.category || 'Public Transport',
        date: 'Baru saja',
        distance: backendData.distance,
        cost: backendData.cost, 
        amount: `-Rp ${parseInt(backendData.cost).toLocaleString('id-ID')}`,
        carbon: carbonValue.toFixed(2),
        impact: backendData.impact || 'low',
        recommendation: aiInsight
      });
      setModalStep('PAYMENT'); 
    } catch (error) { console.error(error); toast.error("Terjadi kesalahan saat memproses QR Code ini ke server."); closeModal(); }
  };

  const handleProcessScan = async () => {
    if (!scanRecipient || !scanDistance || !scanCost) { toast.error("Harap isi penerima, jarak tempuh, dan biaya!"); return; }
    setModalStep('LOADING_AI'); 
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000')}/api/ai/recommendations/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ provider: scanProvider, category: scanCategory, distance: parseFloat(scanDistance), cost: parseFloat(scanCost) })
      });
      if (!response.ok) throw new Error('API Backend Gagal');
      const aiData = await response.json();
      
      // Ambil data AI dengan lebih teliti (mendukung struktur nested 'data')
      const aiInsight = aiData.recommendation || aiData.data?.recommendation || aiData.ai_analysis || `Berdasarkan jarak ${scanDistance} km, emisi Anda tercatat. Pertimbangkan eco-driving atau transportasi publik untuk perjalanan selanjutnya.`;
      const carbonValue = parseFloat(aiData.carbon || aiData.data?.carbon || aiData.total_emisi) || (parseFloat(scanDistance) || 0) * 0.15;

      setScannedData({
        id: new Date().getTime(),
        icon: scanCategory === 'Car' ? '🚗' : scanCategory === 'Bus' ? '🚌' : '🏍️',
        name: `${scanProvider} ${scanCategory}`,
        category: scanCategory,
        recipient: scanRecipient,
        date: 'Baru saja',
        distance: scanDistance,
        cost: scanCost,
        amount: `-Rp ${parseInt(scanCost).toLocaleString('id-ID')}`,
        carbon: carbonValue.toFixed(2),
        impact: scanCategory === 'Car' ? 'medium' : 'low',
        recommendation: aiInsight
      });
      setModalStep('PAYMENT'); 
    } catch (error) { console.error(error); toast.error("Gagal terhubung ke AI Backend. Pastikan server nyala."); closeModal(); }
  };

  const handleProcessPayment = async () => {
    if (passwordInput !== '123456') { 
      setPasswordError('Sandi salah! Transaksi ditolak.');
      setPasswordInput(''); return;
    }
    const costInt = parseInt(scannedData.cost);
    if (balance < costInt) { toast.error('Saldo SustainaPay tidak mencukupi! Silakan Top Up.'); return; }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000')}/api/transactions/payment`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          amount: costInt, 
          transaction_id: scannedData.id,
          category: scannedData.category,
          description: `Pembayaran Trip ${scannedData.name}`,
          total_emisi: parseFloat(scannedData.carbon) || 0,
          distance_km: parseFloat(scannedData.distance) || 0,
          ai_analysis: scannedData.recommendation,
          pin: passwordInput 
        })
      });

      if (!response.ok) throw new Error('Pembayaran gagal di backend');
      
      const payResult = await response.json();

      // Jika backend mengembalikan ai_text, update scannedData
      if (payResult.ai_text) {
        setScannedData(prev => ({ ...prev, recommendation: payResult.ai_text }));
      }

      setPasswordError('');
      await fetchUserBalance(); 
      await fetchTransactions(); 
      setModalStep('SUCCESS'); 
    } catch (error) {
      console.error(error);
      toast.error("Gagal melakukan pembayaran ke server.");
    }
  };

  const handleFinishTransaction = () => { closeModal(); };

  const handleTopupSubmit = async () => {
    if (isTopupLoading) return; 
    if (!topupAmount || parseInt(topupAmount) < 10000) { toast.error("Minimal top up Rp 10.000"); return; }
    
    setIsTopupLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000')}/api/transactions/topup`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ amount: parseInt(topupAmount) })
      });
      const data = await response.json();
      
      if (data.token) {
        window.snap.pay(data.token, {
          onSuccess: async function() { 
            try {
              await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000')}/api/transactions/direct-topup`, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json', 
                  'Accept': 'application/json', 
                  'Authorization': `Bearer ${localStorage.getItem('token')}` 
                },
                body: JSON.stringify({ amount: parseInt(topupAmount) })
              });
            } catch (err) {
              console.error("Gagal sinkronisasi saldo ke backend:", err);
            }

            toast.success("Pembayaran Berhasil! Saldo kamu bertambah.");
            await fetchUserBalance(); 
            await fetchTransactions(); 
            closeModal(); 
          },
          onPending: function() { 
            toast("Menunggu pembayaran kamu...", { icon: '⏳' });
            closeModal(); 
          },
          onError: function() { 
            toast.error("Pembayaran gagal atau dibatalkan!");
            closeModal(); 
          },
          onClose: function() { 
            setIsTopupLoading(false);
            console.log("User menutup pop-up sebelum menyelesaikan pembayaran."); 
          }
        });
      } else {
        toast.error("Gagal mendapatkan Token Pembayaran dari server.");
        setIsTopupLoading(false);
      }
    } catch (error) { 
      console.error("Terjadi kesalahan saat topup:", error);
      toast.error("Gagal melakukan topup. Pastikan server nyala.");
      setIsTopupLoading(false);
    }
  };

  const closeModal = () => {
    setModalStep('NONE'); setPasswordInput(''); setPasswordError(''); setScannedData(null); setScanRecipient(''); setScanDistance(''); setScanCost(''); setIsScanning(false); setIsTopupLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F6FCF9] font-sans text-gray-900 relative">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition group">
            <img src="/logo.jpg" alt="Logo" className="w-10 h-10 object-cover rounded-xl border border-green-700/40 shadow-md ring-2 ring-white/50 group-hover:scale-105 transition-transform" />
            <span className="font-black text-xl tracking-tight text-gray-900 hidden md:block">Sustaina<span className="text-[#00A651]">Pay</span></span>
          </Link>
          <div className="hidden lg:flex items-center gap-1 bg-gray-50/80 border border-gray-100 p-1.5 rounded-full shadow-inner">
            <Link to="/" className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">{t.navHome}</Link>
            <Link to="/dashboard" className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">{t.navDashboard}</Link>
            <Link to="/transactions" className="px-5 py-2 text-sm font-black text-white bg-[#00A651] shadow-md shadow-green-200 rounded-full transition-all">{t.navTransactions}</Link>
            <Link to="/carbon-impact" className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">{t.navCarbon}</Link>
            <Link to="/recommendations" className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">{t.navRec}</Link>
            <Link to="/rewards" className="px-5 py-2 text-sm font-bold text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-all">{t.navRewards}</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/profile" className="flex items-center gap-3 p-1.5 pr-4 bg-white border border-gray-100 rounded-full shadow-sm hover:bg-green-50 transition-all group">
              <div className="w-8 h-8 bg-[#00A651] rounded-full overflow-hidden border-2 border-white flex items-center justify-center text-white text-xs font-bold group-hover:scale-105 transition-transform">
                {navUser?.avatar ? <img src={navUser.avatar} alt="Profile" className="w-full h-full object-cover" /> : navUser?.initials || 'U'}
              </div>
              <span className="text-sm font-bold text-gray-700 hidden sm:block group-hover:text-green-700">{t.navProfile}</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-8 py-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div><h1 className="text-3xl font-black text-gray-900">{t.title}</h1><p className="text-gray-500 font-medium mt-1">{t.subtitle}</p></div>
          <button onClick={() => setModalStep('SCANNER')} className="bg-[#00A651] border border-green-600 text-white px-6 py-3 rounded-full text-sm font-bold shadow-md hover:bg-green-700 transition flex items-center gap-2">
            <span>📷</span> {t.scanBtn}
          </button>
        </div>

        {/* BALANCE CARD */}
        <div className="bg-[#0B132B] rounded-3xl p-6 md:p-8 text-white mb-8 flex flex-col md:flex-row justify-between items-center shadow-lg gap-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 opacity-10"><span className="text-9xl">💳</span></div>
          <div className="z-10 text-center md:text-left">
            <p className="text-gray-400 text-sm font-bold mb-1">{t.balanceTitle}</p>
            <h2 className="text-4xl font-black text-[#00A651]">Rp {Number(balance).toLocaleString('id-ID')}</h2>
          </div>
          <button onClick={() => setModalStep('TOPUP')} className="z-10 bg-white text-[#0B132B] px-6 py-3 rounded-xl font-black text-sm hover:bg-gray-100 transition shadow-md flex items-center gap-2">
            <span>➕</span> {t.topupBtn}
          </button>
        </div>

        {/* FILTERS */}
        <div className="flex overflow-x-auto pb-4 mb-6 gap-3 hide-scrollbar">
          {filters.map(filter => (
            <button key={filter} onClick={() => setActiveFilter(filter)} className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeFilter === filter ? 'bg-[#00A651] text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}>
              {t.filters[filter] || filter}
            </button>
          ))}
        </div>

        {/* LIST TRANSAKSI */}
        <div className="bg-white rounded-[3rem] shadow-sm border border-gray-50 overflow-hidden">
          <div className="p-8">
            <div className="space-y-2">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((item) => (
                  <div key={item.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 hover:bg-gray-50 rounded-2xl transition cursor-pointer border border-transparent hover:border-gray-100 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0">{item.icon}</div>
                      <div>
                        <p className="font-black text-gray-900 text-base">{item.name || item.description || 'Transaksi'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">{t.filters[item.category] || item.category}</span>
                          <span className="text-xs font-bold text-gray-400">•</span>
                          <span className="text-xs font-bold text-gray-400">{item.date || t.latestLabel}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-6 md:gap-8 border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 mt-2 md:mt-0">
                      <div className="text-left md:text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">{t.amountLabel}</p>
                        <p className={`font-black ${String(item.amount).includes('+') ? 'text-green-500' : 'text-gray-900'}`}>{item.amount}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">{t.carbonLabel}</p>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-gray-900">
                            {(() => {
                              const carbonText = item.carbon || (item.calculated_carbon_kg ? `${item.calculated_carbon_kg} kg` : '-');
                              return carbonText === '0 kg' || carbonText === '0.0 kg' ? '-' : carbonText;
                            })()}
                          </p>
                          <span className={`w-2 h-2 rounded-full ${item.impact === 'low' ? 'bg-green-500' : item.impact === 'medium' ? 'bg-yellow-500' : item.impact === 'high' ? 'bg-red-500' : 'bg-gray-300'}`}></span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📭</div><h3 className="text-lg font-black text-gray-900">{t.noTransactionsTitle}</h3><p className="text-sm text-gray-500 mt-1">{t.noTransactionsDesc}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* --- MODAL BOX SYSTEM --- */}
      {modalStep !== 'NONE' && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md relative shadow-2xl animate-[fadeIn_0.3s_ease-out] max-h-[90vh] overflow-y-auto">
            <button onClick={closeModal} className="absolute top-6 right-6 w-8 h-8 bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500 rounded-full flex items-center justify-center font-bold transition z-50">✕</button>

            {modalStep === 'TOPUP' && (
              <>
                <h2 className="text-2xl font-black text-gray-900 mb-2 mt-2">{t.topupHeader}</h2><p className="text-sm text-gray-500 font-medium mb-6">{t.topupSub}</p>
                <div className="space-y-4 mb-6 text-left">
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">{t.paymentMethod}</label>
                    <select value={topupMethod} onChange={(e) => setTopupMethod(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 font-bold outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500">
                      <option value="BCA">Bank BCA</option><option value="Mandiri">Bank Mandiri</option><option value="GoPay">GoPay</option><option value="OVO">OVO</option><option value="Dana">DANA</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 mb-1 block">{t.topupNominal}</label>
                    <input type="number" value={topupAmount} onChange={(e) => setTopupAmount(e.target.value)} placeholder="Contoh: 50000" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 font-bold outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" />
                  </div>
                </div>
                <button 
                  onClick={handleTopupSubmit} 
                  disabled={isTopupLoading}
                  className={`w-full text-white py-3.5 rounded-2xl font-black text-sm transition shadow-md ${isTopupLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#00A651] hover:bg-green-700'}`}
                >
                  {isTopupLoading ? "Memproses Token..." : t.confirmTopup}
                </button>
              </>
            )}

            {modalStep === 'SCANNER' && (
              <>
                <h2 className="text-2xl font-black text-gray-900 mb-2 mt-2">{t.scanHeader}</h2><p className="text-sm text-gray-500 font-medium mb-6">{t.scanSub}</p>
                {isScanning ? (
                  <div className="mb-6 bg-gray-100 p-2 rounded-2xl text-center">
                    <Scanner onResult={(text) => handleScanSukses(text)} onError={(error) => console.log(error?.message)} />
                    <button onClick={() => setIsScanning(false)} className="w-full mt-4 bg-red-50 text-red-500 py-2.5 rounded-xl font-bold hover:bg-red-100 transition">{t.cancelScan}</button>
                  </div>
                ) : (
                  <button onClick={() => setIsScanning(true)} className="w-full mb-6 bg-[#00A651] text-white py-4 rounded-2xl font-black text-base hover:bg-green-700 transition shadow-md flex items-center justify-center gap-2">
                    <span className="text-xl">📷</span> {t.openCamera}
                  </button>
                )}
                <div className="relative flex items-center py-2 mb-4">
                  <div className="flex-grow border-t border-gray-200"></div><span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] font-black tracking-widest">{t.orManual}</span><div className="flex-grow border-t border-gray-200"></div>
                </div>
                <div className="space-y-4 text-left">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">{t.provider}</label>
                      <select value={scanProvider} onChange={(e) => setScanProvider(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 font-bold text-sm outline-none">
                        <option value="Gojek">Gojek</option><option value="Grab">Grab</option><option value="Maxim">Maxim</option><option value="Indrive">Indrive</option><option value="TransJakarta">TransJakarta</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">{t.category}</label>
                      <select value={scanCategory} onChange={(e) => setScanCategory(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 font-bold text-sm outline-none">
                        <option value="Motorcycle">Motorcycle</option><option value="Car">Car</option><option value="Bus">Bus</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">{t.recipientLabel}</label>
                    <input type="text" value={scanRecipient} onChange={(e) => setScanRecipient(e.target.value)} placeholder="Contoh: Budi (Gojek Driver) / 0812..." className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 font-bold text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">{t.distanceLabel}</label>
                    <input type="number" value={scanDistance} onChange={(e) => setScanDistance(e.target.value)} placeholder="Contoh: 5.5" step="0.1" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 font-bold text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">{t.costLabel}</label>
                    <input type="number" value={scanCost} onChange={(e) => setScanCost(e.target.value)} placeholder="Contoh: 15000" className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-3 font-bold text-sm outline-none" />
                  </div>
                </div>
                <button onClick={handleProcessScan} className="w-full mt-6 bg-[#0B132B] text-white py-3.5 rounded-2xl font-black text-sm hover:bg-black transition shadow-sm flex items-center justify-center gap-2">
                  <span>✨</span> {t.btnAnalyze}
                </button>
              </>
            )}

            {modalStep === 'LOADING_AI' && (
              <div className="text-center py-10">
                <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-6"></div><h2 className="text-xl font-black text-gray-900">{t.loadingHeader}</h2><p className="text-sm text-gray-500 mt-2">{t.loadingSub}</p>
              </div>
            )}

            {modalStep === 'PAYMENT' && scannedData && (
              <>
                <h2 className="text-2xl font-black text-gray-900 mb-2 mt-2">{t.payHeader}</h2><p className="text-sm text-gray-500 font-medium mb-6">{t.paySub}</p>
                <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-3 mb-6">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                    <span className="text-xs font-bold text-gray-400 uppercase">{t.service}</span>
                    <span className="font-black text-gray-900 flex items-center gap-1.5">{scannedData.icon} {scannedData.name}</span>
                  </div>
                  {scannedData.recipient && (
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                      <span className="text-xs font-bold text-gray-400 uppercase">Tujuan / Penerima</span>
                      <span className="font-black text-blue-600">{scannedData.recipient}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                    <span className="text-xs font-bold text-gray-400 uppercase">{t.distance}</span>
                    <span className="font-black text-gray-900">{scannedData.distance} km</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                    <span className="text-xs font-bold text-gray-400 uppercase">{t.carbonLabel}</span>
                    <span className="font-black text-red-500">{scannedData.carbon} kg CO2</span>
                  </div>
                  {Math.floor(parseInt(scannedData.cost) / 10000) > 0 && (
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200/60">
                      <span className="text-xs font-bold text-gray-400 uppercase">{t.pointsEarned}</span>
                      <span className="font-black text-yellow-500 flex items-center gap-1">
                        <span>✨</span> +{Math.floor(parseInt(scannedData.cost) / 10000)} Reward Points
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-400 uppercase">{t.deductBalance}</span>
                    <span className="font-black text-[#00A651]">Rp {parseInt(scannedData.cost).toLocaleString('id-ID')}</span>
                  </div>
                </div>
                
                <div className="text-left mb-6">
                  <label className="text-xs font-bold text-gray-500 mb-2 block">{t.pinLabel}</label>
                  <input 
                    type="password" 
                    value={passwordInput} 
                    onChange={(e) => setPasswordInput(e.target.value)} 
                    placeholder="••••••" 
                    maxLength="6"
                    className={`w-full bg-white border ${passwordError ? 'border-red-500' : 'border-gray-200'} rounded-xl py-3 px-4 text-center tracking-[0.5em] font-black text-lg outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition`} 
                  />
                  {passwordError && <p className="text-red-500 text-xs mt-2 font-bold text-center">{passwordError}</p>}
                </div>

                <button onClick={handleProcessPayment} className="w-full bg-[#00A651] text-white py-3.5 rounded-2xl font-black text-sm hover:bg-green-700 transition shadow-md">
                  {t.btnPay}
                </button>
              </>
            )}

            {modalStep === 'SUCCESS' && (
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-green-100 text-[#00A651] rounded-full flex items-center justify-center text-4xl mx-auto mb-4 animate-bounce">
                  ✅
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">{t.successHeader}</h2>
                <p className="text-sm text-gray-500 font-bold mb-4">
                  {t.remainingBalance}: <span className="text-gray-900">Rp {Number(balance).toLocaleString('id-ID')}</span>
                </p>
                {scannedData?.cost && Math.floor(parseInt(scannedData.cost) / 10000) > 0 && (
                  <div className="bg-yellow-50 text-yellow-600 font-bold text-sm rounded-xl p-3 mb-6 flex justify-center items-center gap-2">
                    <span>✨</span> Selamat! Kamu mendapatkan +{Math.floor(parseInt(scannedData.cost) / 10000)} Reward Points!
                  </div>
                )}

                {scannedData?.recommendation && (
                  <div className="bg-[#F6FCF9] border border-green-100 rounded-2xl p-4 text-left mb-6 relative overflow-hidden">
                    <div className="absolute -right-2 -bottom-2 opacity-20 text-5xl">🌱</div>
                    <h4 className="text-xs font-black text-green-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span>✨</span> {t.aiInsights}
                    </h4>
                    <div className="text-sm font-bold text-gray-700 relative z-10 leading-relaxed">
                      {(() => {
                        const text = scannedData.recommendation || "";
                        if (text.startsWith('⚠️')) {
                          const dotIndex = text.indexOf('. ', text.indexOf('sekitar'));
                          if (dotIndex !== -1) {
                            const warningPart = text.substring(0, dotIndex + 2);
                            const normalPart = text.substring(dotIndex + 2);
                            return (
                              <>
                                <span className="text-orange-600 block mb-2">{warningPart.trim()}</span>
                                <span>{normalPart}</span>
                              </>
                            );
                          }
                        }
                        return <p>{text}</p>;
                      })()}
                    </div>
                  </div>
                )}

                <button onClick={handleFinishTransaction} className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-2xl font-black text-sm hover:bg-gray-200 transition shadow-sm">
                  {t.btnFinish}
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;