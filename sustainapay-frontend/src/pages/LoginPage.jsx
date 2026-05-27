import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // PERBAIKAN: Cari token di berbagai format kembalian standar Laravel
        const validToken = data.token || data.access_token || (data.data && data.data.token);
        
        if (validToken) {
            // Simpan token ke LocalStorage
            localStorage.setItem('token', validToken);
            console.log("Login sukses! Token disimpan:", validToken);
            // Arahkan ke halaman rekomendasi setelah berhasil login
            navigate('/dashboard');
        } else {
            setError('Login berhasil, tapi format token dari backend tidak ditemukan.');
            console.error("Cek response backend kamu:", data);
        }
      } else {
        setError(data.message || 'Login gagal. Cek email & password kamu.');
      }
    } catch (err) {
      console.error(err);
      setError('Gagal terhubung ke server. Pastikan backend Laravel menyala.');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ token: tokenResponse.access_token })
        });
        
        const data = await res.json();
        
        if (res.ok) {
          const validToken = data.token || data.access_token || (data.data && data.data.token);
          if (validToken) {
            localStorage.setItem('token', validToken);
            console.log("Google Login sukses!");
            navigate('/dashboard');
          }
        } else {
          setError(data.message || 'Google Login gagal.');
        }
      } catch (err) {
        console.error(err);
        setError('Gagal terhubung ke server saat Google Login.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Login Google dibatalkan atau gagal.');
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9] p-6">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-green-100 w-full max-w-md border border-gray-100 text-center">
        <div className="w-16 h-16 bg-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-3xl">🌿</div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">SustainaPay</h2>
        
        {/* Pesan Error */}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-xl text-sm font-semibold">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-green-500" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-green-500" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-green-700 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Menghubungkan...' : 'Sign In'}
          </button>
        </form>

        <div className="my-6 flex items-center justify-center">
          <span className="w-full border-t border-gray-200"></span>
          <span className="px-3 text-sm text-gray-400 bg-white">OR</span>
          <span className="w-full border-t border-gray-200"></span>
        </div>

        <button 
          onClick={() => loginWithGoogle()}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 py-3 rounded-2xl font-bold shadow-sm hover:bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed transition"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </button>

        <p className="mt-6 text-sm text-gray-500">
          Belum punya akun? <Link to="/register" className="text-green-600 font-bold">Buat Akun Baru</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;