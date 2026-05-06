import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Sementara pakai data dummy sebelum connect ke Laravel
    if (email === "user@sustainapay.com" && password === "pass123") {
      navigate('/dashboard');
    } else {
      alert("Gunakan email: user@sustainapay.com / pass: pass123");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9] p-6">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-green-100 w-full max-w-md border border-gray-100 text-center">
        <div className="w-16 h-16 bg-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-3xl">🌿</div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">SustainaPay</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="Email" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-green-500" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-green-500" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-green-700">Sign In</button>
        </form>

        <p className="mt-6 text-sm text-gray-500">
          Belum punya akun? <Link to="/register" className="text-green-600 font-bold">Buat Akun Baru</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;