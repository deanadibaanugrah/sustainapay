import { createContext, useState, useContext } from 'react';

// 1. Buat Context
const LanguageContext = createContext();

// 2. Buat Provider untuk membungkus aplikasi
export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    const savedLang = localStorage.getItem('sustainapay_lang');
    if (savedLang) {
      return String(savedLang).toLowerCase();
    }
    return 'id';
  });

  // Fungsi untuk mengubah bahasa dan menyimpannya
  const toggleLanguage = (selectedLang) => {
    // MASTER FIX: Antisipasi kalau ada halaman (seperti Transactions) yang ngirim huruf besar 'ID' / 'EN'
    const normalized = String(selectedLang || 'id').toLowerCase();
    setLang(normalized);
    localStorage.setItem('sustainapay_lang', normalized);
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 3. Buat custom hook biar gampang dipanggil di halaman lain
// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
  return useContext(LanguageContext);
};