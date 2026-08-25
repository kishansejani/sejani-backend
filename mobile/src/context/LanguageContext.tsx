import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export type Language = 'gu' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultText?: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // App & Family Branding
  appName: {
    gu: 'PersonalInfo',
    en: 'PersonalInfo',
  },
  appSubtitle: {
    gu: 'પર્સનલ અને ફેમિલી ડેશબોર્ડ • સુરક્ષિત પોર્ટલ',
    en: 'Personal & Family Dashboard • Secure Portal',
  },
  ganeshMantra: {
    gu: '✨ PersonalInfo • સુરક્ષિત પોર્ટલ',
    en: '✨ PersonalInfo • Secure Portal',
  },
  securePortal: {
    gu: 'સુરક્ષિત પોર્ટલ',
    en: 'Secure Portal',
  },
  greeting: {
    gu: 'જય શ્રી કૃષ્ણ',
    en: 'Jai Shree Krishna',
  },

  // Tabs
  tabHome: {
    gu: 'હોમ',
    en: 'Home',
  },
  tabAlerts: {
    gu: '🔔 એલર્ટ્સ',
    en: '🔔 Alerts',
  },
  tabFarming: {
    gu: '🌾 ખેતીવાડી',
    en: '🌾 Farming',
  },
  tabVault: {
    gu: 'મારી તિજોરી',
    en: 'My Vault',
  },
  tabFamily: {
    gu: 'પરિવાર',
    en: 'Family',
  },
  tabProfile: {
    gu: 'પ્રોફાઇલ',
    en: 'Profile',
  },

  // Login & Register
  login: {
    gu: 'પ્રવેશ કરો (Login)',
    en: 'Login',
  },
  register: {
    gu: 'નવું ખાતું બનાવો (Register)',
    en: 'Create Account (Register)',
  },
  loginDesc: {
    gu: 'તમારો રજિસ્ટર્ડ મોબાઈલ નંબર અને પાસવર્ડ દાખલ કરો',
    en: 'Enter your registered mobile number & password',
  },
  registerDesc: {
    gu: 'પરિવારના નવા સભ્ય તરીકે જોડાવા વિગત ભરો',
    en: 'Fill in details to join as a family member',
  },
  mobileNumber: {
    gu: 'મોબાઈલ નંબર',
    en: 'Mobile Number',
  },
  fullName: {
    gu: 'પૂરું નામ',
    en: 'Full Name',
  },
  relationshipRole: {
    gu: 'સંબંધ / રોલ',
    en: 'Relationship / Role',
  },
  password: {
    gu: 'પાસવર્ડ',
    en: 'Password',
  },
  loginBtn: {
    gu: 'લૉગિન કરો',
    en: 'Login Now',
  },
  createAccountBtn: {
    gu: 'એકાઉન્ટ બનાવો & લૉગિન થાઓ',
    en: 'Create Account & Login',
  },
  logout: {
    gu: 'લૉગ આઉટ',
    en: 'Logout',
  },

  // Farming & Finance
  totalRevenue: {
    gu: 'કુલ પાક આવક',
    en: 'Total Crop Revenue',
  },
  totalExpense: {
    gu: 'કુલ ખર્ચ',
    en: 'Total Expenses',
  },
  netProfit: {
    gu: 'ચોખ્ખો નફો',
    en: 'Net Farming Profit',
  },
  addCropSale: {
    gu: '+ પાક વેચાણ',
    en: '+ Crop Sale',
  },
  addExpense: {
    gu: '+ ખર્ચ ઉમેરો',
    en: '+ Add Expense',
  },
  addTractorWork: {
    gu: '+ ટ્રેક્ટર કામ',
    en: '+ Tractor Work',
  },
  downloadPdf: {
    gu: '📄 ખેતી PDF',
    en: '📄 Farming PDF',
  },

  // Tasks & Alarms
  paymentCollection: {
    gu: '💰 પેમેન્ટ લેવાનું',
    en: '💰 Payment Due',
  },
  billPayment: {
    gu: '⚡ બિલ ભરવાનું',
    en: '⚡ Bill Payment',
  },
  farmingWork: {
    gu: '🌾 ખેતી કામ',
    en: '🌾 Farm Task',
  },
  vehicleInsurance: {
    gu: '🚗 વાહન/વીમો',
    en: '🚗 Vehicle/Insurance',
  },

  // Language Switch
  languageToggle: {
    gu: 'English',
    en: 'ગુજરાતી',
  },
  selectLanguage: {
    gu: 'ભાષા પસંદ કરો (Language)',
    en: 'Select Language',
  },
};

const LANG_STORAGE_KEY = 'app_language_preference';

const LanguageContext = createContext<LanguageContextType>({} as LanguageContextType);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('gu');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(LANG_STORAGE_KEY);
        if (saved === 'en' || saved === 'gu') setLanguageState(saved);
      } else {
        const saved = await SecureStore.getItemAsync(LANG_STORAGE_KEY);
        if (saved === 'en' || saved === 'gu') setLanguageState(saved);
      }
    } catch (e) {
      // fallback to gu
    }
  };

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
        localStorage.setItem(LANG_STORAGE_KEY, lang);
      } else {
        await SecureStore.setItemAsync(LANG_STORAGE_KEY, lang);
      }
    } catch (e) {
      // ignore
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'gu' ? 'en' : 'gu';
    setLanguage(nextLang);
  };

  const t = (key: string, defaultText?: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
