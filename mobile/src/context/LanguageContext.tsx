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
  dashboard: {
    gu: 'ડેશબોર્ડ',
    en: 'Dashboard',
  },

  // Common Actions & States
  save: {
    gu: 'સાચવો',
    en: 'Save',
  },
  cancel: {
    gu: 'રદ કરો',
    en: 'Cancel',
  },
  delete: {
    gu: 'ડિલીટ કરો',
    en: 'Delete',
  },
  edit: {
    gu: 'સુધારો',
    en: 'Edit',
  },
  close: {
    gu: 'બંધ કરો',
    en: 'Close',
  },
  success: {
    gu: 'સફળ',
    en: 'Success',
  },
  error: {
    gu: 'ભૂલ',
    en: 'Error',
  },
  attention: {
    gu: 'ધ્યાન આપો',
    en: 'Attention',
  },
  loading: {
    gu: 'લોડ થઈ રહ્યું છે...',
    en: 'Loading...',
  },
  search: {
    gu: 'શોધો...',
    en: 'Search...',
  },
  notAdded: {
    gu: 'ઉમેરેલ નથી',
    en: 'Not Added',
  },

  // Tabs
  tabHome: {
    gu: 'હોમ',
    en: 'Home',
  },
  tabAlerts: {
    gu: 'સૂચના',
    en: 'Alerts',
  },
  tabFarming: {
    gu: 'ખેતીવાડી',
    en: 'Farming',
  },
  tabVault: {
    gu: 'અંગત નોંધ',
    en: 'Personal',
  },
  tabFamily: {
    gu: 'પરિવાર',
    en: 'Family',
  },
  tabProfile: {
    gu: 'પ્રોફાઇલ',
    en: 'Profile',
  },

  // Farming & Tractor Extra Translations
  filterByCustomer: {
    gu: 'ગ્રાહકવાર બિલ ફિલ્ટર:',
    en: 'Filter by Customer:',
  },
  allFilter: {
    gu: 'બધા',
    en: 'All',
  },
  customerWorkLabel: {
    gu: 'ગ્રાહક કામ',
    en: 'Customer Work',
  },
  selfWorkLabel: {
    gu: 'પોતાનું ખેતર',
    en: 'Own Farm',
  },
  operationDetailsLabel: {
    gu: 'કામની વિગત:',
    en: 'Operation Details:',
  },
  calcBasisLabel: {
    gu: 'ગણતરી આધાર:',
    en: 'Calculation Basis:',
  },
  vighaUnit: {
    gu: 'વીઘા',
    en: 'Vigha',
  },
  timesUnit: {
    gu: 'વાર',
    en: 'times',
  },
  hoursUnit: {
    gu: 'કલાક',
    en: 'Hours',
  },
  farmExpenseSummaryTitle: {
    gu: 'ખેતી ખર્ચ સમરી',
    en: 'Farm Expense Summary',
  },
  labourExpenseLabel: {
    gu: 'મજૂરી ખર્ચ',
    en: 'Labour Expense',
  },
  tractorExpenseLabel: {
    gu: 'ટ્રેક્ટર ખર્ચ',
    en: 'Tractor Expense',
  },
  fertilizerExpenseLabel: {
    gu: 'ખાતર ખર્ચ',
    en: 'Fertilizer Expense',
  },
  pesticideSprayLabel: {
    gu: 'દવા & છંટકાવ',
    en: 'Pesticides & Spray',
  },
  cropProdAndSalesTitle: {
    gu: 'પાક ઉત્પાદન & વેચાણ હિસાબ',
    en: 'Crop Production & Sales',
  },
  addNewCropBtn: {
    gu: '+ નવો પાક',
    en: '+ New Crop',
  },
  saleQtyLabel: {
    gu: 'વેચાણ જથ્થો:',
    en: 'Sale Quantity:',
  },
  weightInManLabel: {
    gu: 'મણમાં વજન:',
    en: 'Weight in Man:',
  },
  weightInKgLabel: {
    gu: 'કિલોમાં વજન:',
    en: 'Weight in KG:',
  },
  manUnit: {
    gu: 'મણ',
    en: 'Man',
  },
  farmExpenseHeading: {
    gu: 'ખેતી ખર્ચ હિસાબ',
    en: 'Farm Expenses',
  },
  farmExpenseSubtitle: {
    gu: 'દવા, ખાતર, મજૂરી & બિયારણના વિગતવાર ખર્ચા',
    en: 'Detailed expenses for medicine, fertilizer & seeds',
  },
  addExpenseBtn: {
    gu: '+ ખર્ચ ઉમેરો',
    en: '+ Add Expense',
  },
  calculationLabel: {
    gu: 'ગણતરી:',
    en: 'Calculation:',
  },
  tractorWorkListHeading: {
    gu: 'ટ્રેક્ટર કામ લિસ્ટ',
    en: 'Tractor Work List',
  },
  tractorWorkSubtitle: {
    gu: 'દાંતી, રાંપ, માઢ, સાવડા & ગ્રાહકવાઇઝ બિલ',
    en: 'Tillage, Ploughing, Bed Making & Customer Bills',
  },
  addWorkBtn: {
    gu: '+ કામ ઉમેરો',
    en: '+ Add Work',
  },
  combinedCustomerBill: {
    gu: 'કુલ ગ્રાહક બિલ',
    en: 'Customer Combined Bill',
  },
  totalOperationsCount: {
    gu: 'કુલ કામ',
    en: 'Total Operations',
  },
  customerPdfBtn: {
    gu: 'ગ્રાહક બિલ PDF',
    en: 'Customer Bill PDF',
  },

  // Login & Register Screen
  loginTab: {
    gu: '🔑 લૉગિન (Login)',
    en: '🔑 Login',
  },
  registerTab: {
    gu: '📝 નવું રજિસ્ટ્રેશન (Register)',
    en: '📝 Register',
  },
  loginHeading: {
    gu: 'પરિવાર પોર્ટલમાં પ્રવેશ',
    en: 'Sign in to Family Portal',
  },
  registerHeading: {
    gu: 'પરિવારમાં નવું ખાતું બનાવો',
    en: 'Create Family Account',
  },
  loginDesc: {
    gu: 'તમારો રજિસ્ટર્ડ મોબાઈલ નંબર અને પાસવર્ડ દાખલ કરો',
    en: 'Enter your registered mobile number & password',
  },
  registerDesc: {
    gu: 'પરિવારના સભ્ય તરીકે જોડાવા વિગત ભરો',
    en: 'Fill in details to join as a family member',
  },
  mobileNumber: {
    gu: 'મોબાઈલ નંબર *',
    en: 'Mobile Number *',
  },
  mobilePlaceholder: {
    gu: '૧૦ આંકડાનો મોબાઈલ નંબર દાખલ કરો',
    en: 'Enter 10-digit mobile number',
  },
  fullName: {
    gu: 'પૂરું નામ *',
    en: 'Full Name *',
  },
  namePlaceholder: {
    gu: 'તમારું પૂરું નામ દાખલ કરો',
    en: 'Enter your full name',
  },
  relationshipRole: {
    gu: 'પરિવારમાં સંબંધ / હોદ્દો (પસંદગી મુજબ)',
    en: 'Role / Relationship in Family (Optional)',
  },
  password: {
    gu: 'પાસવર્ડ *',
    en: 'Password *',
  },
  passwordPlaceholder: {
    gu: 'તમારો પાસવર્ડ દાખલ કરો',
    en: 'Enter your password',
  },
  regPasswordPlaceholder: {
    gu: 'ઓછામાં ઓછો ૬ અક્ષરનો સુરક્ષિત પાસવર્ડ',
    en: 'Minimum 6 characters secure password',
  },
  loginBtn: {
    gu: 'લૉગિન કરો',
    en: 'Login Now',
  },
  createAccountBtn: {
    gu: 'એકાઉન્ટ બનાવો & લૉગિન થાઓ',
    en: 'Create Account & Login',
  },
  switchToRegister: {
    gu: 'હજી સુધી ખાતું નથી? નવું રજિસ્ટ્રેશન કરો ➔',
    en: "Don't have an account? Register now ➔",
  },
  switchToLogin: {
    gu: 'પહેલેથી એકાઉન્ટ છે? લૉગિન કરો ➔',
    en: 'Already have an account? Login ➔',
  },

  // Family Roles & Relationships
  roleMember: {
    gu: 'સભ્ય',
    en: 'Member',
  },
  roleFather: {
    gu: 'પિતા',
    en: 'Father',
  },
  roleMother: {
    gu: 'માતા',
    en: 'Mother',
  },
  roleSon: {
    gu: 'પુત્ર',
    en: 'Son',
  },
  roleDaughter: {
    gu: 'પુત્રી',
    en: 'Daughter',
  },
  roleGrandfather: {
    gu: 'દાદા / મોભી',
    en: 'Grandfather / Head',
  },
  roleGrandmother: {
    gu: 'દાદી',
    en: 'Grandmother',
  },
  roleUncle: {
    gu: 'કાકા',
    en: 'Uncle',
  },
  roleAunt: {
    gu: 'કાકી',
    en: 'Aunt',
  },
  roleBrother: {
    gu: 'ભાઈ',
    en: 'Brother',
  },
  roleSister: {
    gu: 'બહેન',
    en: 'Sister',
  },
  roleFamilyHead: {
    gu: 'પરિવાર મોભી',
    en: 'Family Head',
  },

  // Profile Screen
  myProfileTitle: {
    gu: 'મારી પ્રોફાઇલ & સેટિંગ્સ',
    en: 'My Profile & Settings',
  },
  myProfileSubtitle: {
    gu: 'સુરક્ષિત એકાઉન્ટ માહિતી',
    en: 'Secure Account Information',
  },
  editProfile: {
    gu: 'પ્રોફાઇલ વિગતો સુધારો',
    en: 'Edit Profile Details',
  },
  selectLanguage: {
    gu: 'ભાષા પસંદ કરો (Language)',
    en: 'Select Language',
  },
  personalDetails: {
    gu: 'પર્સનલ વિગતો',
    en: 'Personal Details',
  },
  bloodGroup: {
    gu: 'બ્લડ ગ્રૂપ (Blood Group)',
    en: 'Blood Group',
  },
  bloodPlaceholder: {
    gu: 'દા.ત. B+, O+, AB+',
    en: 'e.g. B+, O+, AB+',
  },
  occupation: {
    gu: 'વ્યવસાય / કામગીરી',
    en: 'Occupation / Work',
  },
  occupationPlaceholder: {
    gu: 'દા.ત. બિઝનેસ, નોકરી, ખેતી...',
    en: 'e.g. Business, Job, Farming...',
  },
  emergencyContact: {
    gu: 'ઇમરજન્સી સંપર્ક નંબર',
    en: 'Emergency Contact',
  },
  emergencyPlaceholder: {
    gu: 'મોબાઈલ નંબર',
    en: 'Mobile Number',
  },
  bio: {
    gu: 'પરિચય (Bio)',
    en: 'Bio / Notes',
  },
  bioPlaceholder: {
    gu: 'તમારા વિશે થોડી માહિતી...',
    en: 'A few words about you...',
  },
  securityPrivacy: {
    gu: 'સુરક્ષા & ડેટા પ્રાઈવસી',
    en: 'Security & Data Privacy',
  },
  tokenSecTitle: {
    gu: 'Laravel Sanctum Token Encryption',
    en: 'Laravel Sanctum Token Encryption',
  },
  tokenSecDesc: {
    gu: 'તમારું ટોકન મોબાઈલના હાર્ડવેર સ્ટોરેજમાં સિક્યોર છે.',
    en: 'Your token is encrypted in device hardware storage.',
  },
  authSecTitle: {
    gu: 'Strict 403 Forbidden Authorization',
    en: 'Strict 403 Forbidden Authorization',
  },
  authSecDesc: {
    gu: 'કોઈ અન્ય વ્યક્તિ તમારો ડેટા એક્સેસ કરી શકતી નથી.',
    en: 'Strict authorization ensures only you can access your data.',
  },
  changePassword: {
    gu: 'પાસવર્ડ બદલો (Change Password)',
    en: 'Change Password',
  },
  currentPassword: {
    gu: 'હાલનો પાસવર્ડ (Current Password) *',
    en: 'Current Password *',
  },
  newPassword: {
    gu: 'નવો પાસવર્ડ (New Password) *',
    en: 'New Password *',
  },
  confirmPassword: {
    gu: 'નવો પાસવર્ડ ફરી દાખલ કરો (Confirm) *',
    en: 'Confirm New Password *',
  },
  currentPwdPlaceholder: {
    gu: 'હાલનો પાસવર્ડ દાખલ કરો',
    en: 'Enter current password',
  },
  newPwdPlaceholder: {
    gu: 'ઓછામાં ઓછો ૬ અક્ષરનો પાસવર્ડ',
    en: 'Minimum 6 characters password',
  },
  confirmPwdPlaceholder: {
    gu: 'નવો પાસવર્ડ કન્ફર્મ કરો',
    en: 'Confirm new password',
  },
  logout: {
    gu: 'લૉગ આઉટ (Sign Out)',
    en: 'Sign Out (Logout)',
  },
  logoutConfirmTitle: {
    gu: 'લૉગ આઉટ',
    en: 'Sign Out',
  },
  logoutConfirmMsg: {
    gu: 'શું તમે ખરેખર લૉગ આઉટ કરવા માંગો છો?',
    en: 'Are you sure you want to sign out?',
  },

  // Family Directory Screen
  familyDirectory: {
    gu: 'પરિવાર ડિરેક્ટરી',
    en: 'Family Directory',
  },
  familyCode: {
    gu: 'ફેમિલી કોડ:',
    en: 'Family Code:',
  },
  totalMembers: {
    gu: 'કુલ સભ્યો',
    en: 'Total Members',
  },
  searchFamilyPlaceholder: {
    gu: 'નામ, સંબંધ કે બ્લડ ગ્રૂપથી શોધો...',
    en: 'Search by name, relation or blood group...',
  },
  memberDetailModalTitle: {
    gu: 'સભ્યની સંપૂર્ણ વિગત',
    en: 'Member Full Profile',
  },

  // Farming Screen
  farmingTitle: {
    gu: 'ખેતીવાડી અને પાક હિસાબ',
    en: 'Farming & Crop Ledger',
  },
  farmingSubtitle: {
    gu: 'સ્માર્ટ ખેતી વહીખાતું અને હિસાબ',
    en: 'Smart Farm Accounting & Records',
  },
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
  cropTab: {
    gu: '🌾 પાક & વેચાણ',
    en: '🌾 Crops & Sales',
  },
  expenseTab: {
    gu: '💸 ખર્ચ વિગત',
    en: '💸 Farm Expenses',
  },
  tractorTab: {
    gu: '🚜 ટ્રેક્ટર હિસાબ',
    en: '🚜 Tractor Ledger',
  },

  // Alerts Screen
  alertsTitle: {
    gu: 'એલર્ટ્સ & રિમાઇન્ડર',
    en: 'Alerts & Reminders',
  },
  alertsSubtitle: {
    gu: 'સમયસર નોટિફિકેશન અને એલાર્મ',
    en: 'Timely Notifications & Alarms',
  },
  addAlert: {
    gu: '+ નવો એલર્ટ',
    en: '+ New Alert',
  },
  pendingAlerts: {
    gu: 'બાકી એલર્ટ્સ',
    en: 'Pending Alerts',
  },
  completedAlerts: {
    gu: 'પૂર્ણ થયેલ',
    en: 'Completed',
  },

  // Vault / Personal Records
  vaultTitle: {
    gu: 'મારી ડિજિટલ તિજોરી',
    en: 'My Digital Vault',
  },
  vaultSubtitle: {
    gu: 'સુરક્ષિત અંગત દસ્તાવેજો & નોંધ',
    en: 'Encrypted Personal Documents & Notes',
  },
  addRecord: {
    gu: '+ નવી નોંધ ઉમેરો',
    en: '+ Add New Record',
  },
  filterAll: {
    gu: 'બધા',
    en: 'All',
  },
  filterExpense: {
    gu: 'આર્થિક/ખર્ચ',
    en: 'Financial/Expense',
  },
  filterDoc: {
    gu: 'દસ્તાવેજ',
    en: 'Documents',
  },
  filterMedical: {
    gu: 'તબીબી/મેડિકલ',
    en: 'Medical',
  },
  filterNotes: {
    gu: 'નોંધ/ડાયરી',
    en: 'Notes/Diary',
  },

  // Keyboard Dismiss
  dismissKeyboard: {
    gu: '⬇️ કીબોર્ડ બંધ કરો (Done ✕)',
    en: '⬇️ Dismiss Keyboard (Done ✕)',
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
