import React from 'react';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex font-sans text-[#00A651]">
      
      {/* KIRI - Bagian Ilustrasi & Branding (Akan sembunyi di layar HP) */}
      <div className="hidden md:flex md:w-1/2 bg-[#E6FAF1] flex-col justify-center items-center p-12 relative overflow-hidden">
        
        {/* Dekorasi Lingkaran Latar Belakang (Opsional) */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>

        <div className="z-10 text-center max-w-md">
          {/* Teks Utama */}
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#00A651] leading-tight">
            Make Your Spending <br />
            Greener
          </h2>
          {/* Teks Sekunder */}
          <p className="text-[#333] font-medium text-lg leading-relaxed mb-10">
            Join SustainaPay and track your carbon footprint with every transaction.
          </p>

          {/* Tempat untuk Ilustrasi (Placeholder 3D) */}
          <div className="w-64 h-64 mx-auto mb-10 bg-white/50 backdrop-blur-sm rounded-full shadow-sm flex items-center justify-center text-6xl border border-white">
            🌱💳
          </div>
          
        </div>
      </div>

      {/* KANAN - Bagian Formulir */}
      <div className="w-full md:w-1/2 flex flex-col bg-white min-h-screen">
        
        {/* Logo di Kiri Atas (Sekarang posisinya relatif terhadap container, tidak akan nabrak) */}
        <div className="p-8 sm:p-12 pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-800 flex items-center justify-center rounded-xl shadow-sm">
              <span className="text-white font-bold text-[10px]">LOGOTYPE</span>
            </div>
            <span className="font-bold text-xl text-[#00A651]">SustainaPay</span>
          </div>
        </div>

        {/* Container Form (Di tengah) */}
        <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2 text-[#00A651]">Create an Account</h2>
              <p className="text-[#333] font-medium">Start your sustainable journey today.</p>
            </div>

            <form className="space-y-5">
              {/* Input Full Name */}
              <div>
                <label className="block text-sm font-semibold text-[#00A651] mb-2">Full Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  className="w-full px-6 py-4 rounded-full border border-[#DFF7ED] bg-[#F8FCFA] focus:bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all font-medium text-[#333]" 
                />
              </div>

              {/* Input Email Address */}
              <div>
                <label className="block text-sm font-semibold text-[#00A651] mb-2">Email Address</label>
                <input 
                  type="email" 
                  placeholder="john@example.com" 
                  className="w-full px-6 py-4 rounded-full border border-[#DFF7ED] bg-[#F8FCFA] focus:bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all font-medium text-[#333]" 
                />
              </div>

              {/* Input Password */}
              <div>
                <label className="block text-sm font-semibold text-[#00A651] mb-2">Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full px-6 py-4 rounded-full border border-[#DFF7ED] bg-[#F8FCFA] focus:bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all font-medium text-[#333]" 
                />
              </div>

              {/* Checkbox Terms */}
              <div className="flex items-start gap-3 pt-2">
                <input 
                  type="checkbox" 
                  id="terms"
                  className="mt-1 w-4 h-4 text-[#00A651] rounded border-gray-300 focus:ring-[#00A651] cursor-pointer" 
                />
                <label htmlFor="terms" className="text-sm text-[#00A651] font-medium cursor-pointer leading-relaxed">
                  I agree to the <a href="#" className="text-[#00A651] font-bold hover:underline">Terms of Service</a> and <a href="#" className="text-[#00A651] font-bold hover:underline">Privacy Policy</a>
                </label>
              </div>

              {/* Tombol Submit */}
              <button 
                type="button" 
                className="w-full bg-[#00A651] text-white font-semibold py-4 rounded-full hover:bg-green-700 active:transform active:scale-[0.98] transition-all shadow-lg shadow-green-200 mt-4"
              >
                Create Account
              </button>
            </form>

            {/* Garis Pemisah (Divider) */}
            <div className="flex items-center my-8">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Or sign up with</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Tombol Login Sosial */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button className="flex items-center justify-center gap-3 border border-[#DFF7ED] bg-white rounded-full py-3 font-semibold text-[#00A651] hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                Google
              </button>
              <button className="flex items-center justify-center gap-3 border border-[#DFF7ED] bg-white rounded-full py-3 font-semibold text-[#00A651] hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                <img src="https://www.svgrepo.com/show/512008/apple-173.svg" alt="Apple" className="w-5 h-5" />
                Apple
              </button>
            </div>

            {/* Link ke Login */}
            <p className="text-center text-sm font-medium text-[#00A651]">
              Already have an account? <Link to="/login" className="text-[#00A651] font-bold hover:underline ml-1">Log in</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;