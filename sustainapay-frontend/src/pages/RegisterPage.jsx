import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useLanguage } from "./LanguageContext";

const RegisterPage = () => {
  const contextData = useLanguage() || {};
  const tContext = contextData.t || {};
  const t = tContext.register || {};

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name, email, password, password_confirmation: password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token); 
        navigate('/dashboard'); 
      } else {
        setError(data.message || t.errUsed || 'Gagal mendaftar. Email mungkin sudah dipakai.');
      }
    } catch (err) {
      console.error(err);
      setError(t.errServer || 'Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI UNTUK LOGIN GOOGLE ---
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'}/api/auth/google`, {
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
            console.log("Google Signup/Login sukses!");
            navigate('/dashboard');
          }
        } else {
          setError(data.message || t.errGoogleFail || 'Google Sign Up gagal.');
        }
      } catch (err) {
        console.error(err);
        setError(t.errGoogleServer || 'Gagal terhubung ke server saat Google Sign Up.');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError(t.errGoogleCancel || 'Sign Up Google dibatalkan atau gagal.');
    }
  });

  return (
    <div className="min-h-screen flex font-sans text-[#00A651]">
      <div className="hidden md:flex md:w-1/2 bg-[#E6FAF1] flex-col justify-center items-center p-12 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
        <div className="z-10 text-center max-w-md">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#00A651] leading-tight">{t.heroTitle1 || 'Make Your Spending'} <br /> {t.heroTitle2 || 'Greener'}</h2>
          <p className="text-[#333] font-medium text-lg leading-relaxed mb-10">{t.heroDesc || 'Join SustainaPay and track your carbon footprint with every transaction.'}</p>
          <div className="w-64 h-64 mx-auto mb-10 bg-white/50 backdrop-blur-sm rounded-full shadow-sm flex items-center justify-center text-6xl border border-white">🌱💳</div>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col bg-white min-h-screen">
        <div className="p-8 sm:p-12 pb-0">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo" className="w-14 h-14 object-cover rounded-2xl border-2 border-green-700/40 shadow-lg ring-4 ring-white/30 shadow-sm" />
            <span className="font-bold text-xl text-[#00A651]">SustainaPay</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-2 text-[#00A651]">{t.formTitle || 'Create an Account'}</h2>
              <p className="text-[#333] font-medium">{t.formSubtitle || 'Start your sustainable journey today.'}</p>
            </div>

            {error && <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-xl text-sm font-semibold">{error}</div>}

            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#00A651] mb-2">{t.labelName || 'Full Name'}</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.namePlaceholder || "John Doe"} required className="w-full px-6 py-4 rounded-full border border-[#DFF7ED] bg-[#F8FCFA] focus:bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all font-medium text-[#333]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#00A651] mb-2">{t.labelEmail || 'Email Address'}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required className="w-full px-6 py-4 rounded-full border border-[#DFF7ED] bg-[#F8FCFA] focus:bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all font-medium text-[#333]" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#00A651] mb-2">{t.labelPass || 'Password'}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="w-full px-6 py-4 rounded-full border border-[#DFF7ED] bg-[#F8FCFA] focus:bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all font-medium text-[#333]" />
              </div>

              <div className="flex items-start gap-3 pt-2">
                <input type="checkbox" id="terms" required className="mt-1 w-4 h-4 text-[#00A651] rounded border-gray-300 focus:ring-[#00A651] cursor-pointer" />
                <label htmlFor="terms" className="text-sm text-[#00A651] font-medium cursor-pointer leading-relaxed">
                  {t.terms1 || 'I agree to the'} <a href="#" className="text-[#00A651] font-bold hover:underline">{t.termsLink1 || 'Terms of Service'}</a> {t.terms2 || 'and'} <a href="#" className="text-[#00A651] font-bold hover:underline">{t.termsLink2 || 'Privacy Policy'}</a>
                </label>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#00A651] text-white font-semibold py-4 rounded-full hover:bg-green-700 active:transform active:scale-[0.98] transition-all shadow-lg shadow-green-200 mt-4 disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? (t.btnCreating || 'Creating Account...') : (t.btnCreate || 'Create Account')}
              </button>
            </form>

            <div className="flex items-center my-8">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">{t.orContinue || 'Or continue with'}</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Tombol Google Full Width dengan aksi onClick */}
            <div className="mb-8">
              <button 
                type="button" 
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 border border-gray-300 bg-white rounded-full py-3.5 font-semibold text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all shadow-sm"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" /> 
                {t.btnGoogle || 'Sign up with Google'}
              </button>
            </div>

            <p className="text-center text-sm font-medium text-[#00A651]">
              {t.haveAccount || 'Already have an account?'} <Link to="/login" className="text-[#00A651] font-bold hover:underline ml-1">{t.login || 'Log in'}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
