import { createContext, useState, useContext } from 'react';
import idLocale from '../locales/id.json';
import enLocale from '../locales/en.json';

// Buat dictionary yang menampung terjemahan json
const translations = {
  id: idLocale,
  en: enLocale
};

// 1. Buat Context
export const LanguageContext = createContext();

// 2. Buat Provider untuk membungkus aplikasi
export const LanguageProvider = ({ children }) => {
  const storedLang = localStorage.getItem('sustainapay_lang') || 'id';
  const initialLang = String(storedLang).toLowerCase() === 'en' ? 'en' : 'id';
  const [lang, setLang] = useState(initialLang);

  // Fungsi untuk mengubah bahasa dan menyimpannya
  const toggleLanguage = (selectedLang) => {
    const normalized = String(selectedLang).toLowerCase() === 'en' ? 'en' : 'id';
    setLang(normalized);
    localStorage.setItem('sustainapay_lang', normalized);
  };

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 3. Buat custom hook biar gampang dipanggil di halaman lain
// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
  return useContext(LanguageContext);
};
