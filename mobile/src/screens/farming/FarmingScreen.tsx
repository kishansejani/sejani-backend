import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import {
  Sprout,
  Plus,
  FileDown,
  Trash2,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Tractor,
  Users,
  FlaskConical,
  X,
  Calculator,
  Mic,
  Check,
  User,
  CheckCircle,
  Clock,
  Printer,
  ChevronRight,
  Edit3,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { DismissKeyboardBar } from '../../components/DismissKeyboardBar';
import { useAuth } from '../../context/AuthContext';
import { createVoiceRecognition } from '../../utils/voiceRecognition';
import { exportTractorCustomerBill } from '../../utils/tractorPdfExport';
import { exportDetailedFarmingReport } from '../../utils/detailedFarmingPdfExport';
import api from '../../api/client';

interface SelectedOpConfig {
  trips: number;
  units: number;
  rate: number;
}

interface SelectedExpConfig {
  title: string;
  qty: string;
  rate: string;
  amount: string;
}

export const FarmingScreen: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [productions, setProductions] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [tractorWorks, setTractorWorks] = useState<any[]>([]);
  const [customers, setCustomers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'tractor' | 'production' | 'expense' | 'overview'>('tractor');
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Voice Recognition States
  const [isListening, setIsListening] = useState(false);
  const [activeVoiceField, setActiveVoiceField] = useState<string | null>(null);

  // 1. Crop Production Modal States
  const [prodModalVisible, setProdModalVisible] = useState(false);
  const [cropName, setCropName] = useState('મગફળી');
  const [quantity, setQuantity] = useState('20');
  const [unit, setUnit] = useState<'khandi' | 'man' | 'kg' | 'quintal' | 'ton'>('khandi');
  const [ratePerUnit, setRatePerUnit] = useState('28000');
  const [buyerName, setBuyerName] = useState('');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [savingProd, setSavingProd] = useState(false);

  // 2. Tractor Multi-Operation Modal States
  const [tractorModalVisible, setTractorModalVisible] = useState(false);
  const [tractorCategory, setTractorCategory] = useState<'customer' | 'self'>('customer');
  const [customerName, setCustomerName] = useState('રામભાઈ પટેલ');
  const [customerPhone, setCustomerPhone] = useState('');
  const [calcBasis, setCalcBasis] = useState<'vigha' | 'hours' | 'trips'>('vigha');
  const [commonVigha, setCommonVigha] = useState('10');
  const [commonRate, setCommonRate] = useState('350');
  const [tractorDate, setTractorDate] = useState(new Date().toISOString().split('T')[0]);
  const [tractorNotes, setTractorNotes] = useState('');
  const [savingTractor, setSavingTractor] = useState(false);

  const [selectedOpsMap, setSelectedOpsMap] = useState<Record<string, SelectedOpConfig>>({
    'દાંતી': { trips: 2, units: 10, rate: 350 },
    'રાંપ': { trips: 1, units: 10, rate: 300 },
  });

  // 3. Farming Multi-Expense Modal States
  const [expModalVisible, setExpModalVisible] = useState(false);
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [savingExp, setSavingExp] = useState(false);

  // Multi-selected expense map: { 'fertilizer': { title: 'DAP ખાતર', qty: '6', rate: '1350', amount: '8100' }, 'medicine': { ... } }
  const [selectedExpMap, setSelectedExpMap] = useState<Record<string, SelectedExpConfig>>({
    'fertilizer': { title: 'DAP ખાતર - ૬ થેલી', qty: '6', rate: '1350', amount: '8100' },
    'medicine': { title: 'ઇયળ દવા છંટકાવ', qty: '3', rate: '1200', amount: '3600' },
  });

  const cropSuggestions = ['મગફળી', 'કપાસ', 'જીરું', 'ઘઉં', 'ડુંગળી', 'તલ', 'સોયાબીન', 'ચણા', 'ધાણા', 'વરિયાળી', 'બાજરી', 'લસણ'];

  const tractorOperations = [
    { name: 'દાંતી', desc: 'ખેડ / દાંતી' },
    { name: 'રાંપ', desc: 'રાંપ હાંકવી' },
    { name: 'માઢ', desc: 'માઢ વાળવી' },
    { name: 'સાવડા', desc: 'સાવડા હાંકવા' },
    { name: 'માંડવી પાડવા', desc: 'ડીગર / પાળા' },
    { name: 'રોટાવેટર', desc: 'જમીન સમથળ' },
    { name: 'થ્રેસર', desc: 'પાક કાઢવો' },
    { name: 'ટ્રોલી ભાડું', desc: 'માલ પરિવહન' },
  ];

  const expenseCategories = [
    { key: 'fertilizer', label: '🌱 ખાતર (Fertilizer)', defaultTitle: 'ખાતર ખરીદી', defaultRate: '1350', defaultQty: '5' },
    { key: 'medicine', label: '🧪 દવા / સ્પ્રે (Pesticide)', defaultTitle: 'દવા છંટકાવ', defaultRate: '1200', defaultQty: '3' },
    { key: 'labour', label: '👷 મજૂરી (Labour)', defaultTitle: 'ખેતી મજૂરી', defaultRate: '400', defaultQty: '10' },
    { key: 'seeds', label: '🌾 બિયારણ (Seeds)', defaultTitle: 'બિયારણ ખરીદી', defaultRate: '800', defaultQty: '4' },
    { key: 'diesel', label: '⛽ ડીઝલ / પાણી (Diesel)', defaultTitle: 'ડીઝલ ખર્ચ', defaultRate: '95', defaultQty: '30' },
    { key: 'other', label: '📝 અન્ય ખર્ચ (Other)', defaultTitle: 'અન્ય ખેતી ખર્ચ', defaultRate: '500', defaultQty: '1' },
  ];

  useEffect(() => {
    fetchFarmingData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchFarmingData = async () => {
    try {
      const [farmRes, tractorRes] = await Promise.all([
        api.get('/farming/summary'),
        api.get('/tractor-works'),
      ]);

      if (farmRes.data) {
        setSummary(farmRes.data.summary);
        setProductions(farmRes.data.productions || []);
        setExpenses(farmRes.data.expenses || []);
      }

      if (tractorRes.data) {
        setTractorWorks(tractorRes.data.works || []);
        setCustomers(tractorRes.data.customers || []);
      }
    } catch (err) {
      console.warn('Farming fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFarmingData();
  };

  // Toggle Tractor Operation
  const toggleOperation = (opName: string) => {
    setSelectedOpsMap((prev) => {
      const updated = { ...prev };
      if (updated[opName]) {
        delete updated[opName];
      } else {
        const v = parseFloat(commonVigha) || 10;
        const r = parseFloat(commonRate) || 350;
        updated[opName] = { trips: 1, units: v, rate: r };
      }
      return updated;
    });
  };

  const updateOpField = (opName: string, field: keyof SelectedOpConfig, val: number) => {
    setSelectedOpsMap((prev) => {
      const current = prev[opName] || { trips: 1, units: 10, rate: 350 };
      return {
        ...prev,
        [opName]: {
          ...current,
          [field]: val,
        },
      };
    });
  };

  const selectedOpsKeys = Object.keys(selectedOpsMap);
  const multiTractorGrandTotal = selectedOpsKeys.reduce((sum, key) => {
    const item = selectedOpsMap[key];
    return sum + (Number(item?.trips) || 0) * (Number(item?.units) || 0) * (Number(item?.rate) || 0);
  }, 0);

  // Toggle Expense Category in Multi-Expense Modal
  const toggleExpenseCategory = (key: string) => {
    setSelectedExpMap((prev) => {
      const updated = { ...prev };
      if (updated[key]) {
        delete updated[key];
      } else {
        const cat = expenseCategories.find((c) => c.key === key);
        const q = cat?.defaultQty || '1';
        const r = cat?.defaultRate || '500';
        const amt = String(parseFloat(q) * parseFloat(r));
        updated[key] = {
          title: cat?.defaultTitle || 'ખેતી ખર્ચ',
          qty: q,
          rate: r,
          amount: amt,
        };
      }
      return updated;
    });
  };

  const updateExpenseField = (catKey: string, field: keyof SelectedExpConfig, val: string) => {
    setSelectedExpMap((prev) => {
      const current = prev[catKey] || { title: 'ખેતી ખર્ચ', qty: '1', rate: '0', amount: '0' };
      const updatedItem = { ...current, [field]: val };
      if (field === 'qty' || field === 'rate') {
        const q = parseFloat(field === 'qty' ? val : updatedItem.qty) || 0;
        const r = parseFloat(field === 'rate' ? val : updatedItem.rate) || 0;
        if (q > 0 && r > 0) {
          updatedItem.amount = String(q * r);
        }
      }
      return { ...prev, [catKey]: updatedItem };
    });
  };

  const selectedExpKeys = Object.keys(selectedExpMap);
  const multiExpGrandTotal = selectedExpKeys.reduce((sum, key) => {
    return sum + (parseFloat(selectedExpMap[key]?.amount) || 0);
  }, 0);

  // Voice Input Activator
  const startVoiceInput = (targetField: string, setter: (val: string) => void) => {
    const voice = createVoiceRecognition();
    setIsListening(true);
    setActiveVoiceField(targetField);

    voice.startListening(
      (text) => {
        setter(text);
        setIsListening(false);
        setActiveVoiceField(null);
      },
      () => {
        setIsListening(false);
        setActiveVoiceField(null);
      }
    );
  };

  // Live Auto Math for Crop Production
  const numQty = parseFloat(quantity) || 0;
  const numRate = parseFloat(ratePerUnit) || 0;
  const liveTotalCropAmount = numQty * numRate;

  let ratePerMan = 0;
  let ratePerKg = 0;
  let liveManWeight = 0;
  let liveKgWeight = 0;

  if (unit === 'khandi') {
    ratePerMan = numRate / 20;
    ratePerKg = numRate / 400;
    liveManWeight = numQty * 20;
    liveKgWeight = numQty * 400;
  } else if (unit === 'man') {
    ratePerMan = numRate;
    ratePerKg = numRate / 20;
    liveManWeight = numQty;
    liveKgWeight = numQty * 20;
  } else if (unit === 'kg') {
    ratePerKg = numRate;
    ratePerMan = numRate * 20;
    liveManWeight = numQty / 20;
    liveKgWeight = numQty;
  } else if (unit === 'quintal') {
    ratePerMan = numRate / 5;
    ratePerKg = numRate / 100;
    liveManWeight = numQty * 5;
    liveKgWeight = numQty * 100;
  }

  // Save Crop Production
  const handleSaveProduction = async () => {
    if (!cropName.trim() || !numQty || !numRate) {
      alert('કૃપા કરીને પાકનું નામ, જથ્થો અને ભાવ દાખલ કરો.');
      return;
    }

    setSavingProd(true);
    try {
      const res = await api.post('/farming/production', {
        crop_name_gu: cropName.trim(),
        quantity: numQty,
        unit: unit,
        rate_per_unit: numRate,
        buyer_name: buyerName.trim() || null,
        sale_date: saleDate,
      });

      if (res.data?.production) {
        setProdModalVisible(false);
        setActiveTab('production');
        await fetchFarmingData();
        showToast(`✅ ${cropName} નો હિસાબ ₹${liveTotalCropAmount.toLocaleString('en-IN')} સાચવી લીધો.`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'સેવ કરવામાં ભૂલ આવી.');
    } finally {
      setSavingProd(false);
    }
  };

  // Save Multiple Tractor Works in Batch
  const handleSaveTractorWork = async () => {
    if (selectedOpsKeys.length === 0) {
      alert('કૃપા કરીને ઓછામાં ઓછું ૧ કામ (દા.ત. દાંતી, રાંપ) પસંદ કરો.');
      return;
    }

    setSavingTractor(true);
    try {
      const finalCustomerName = tractorCategory === 'customer' ? (customerName.trim() || 'ગ્રાહક') : 'પોતાનું ખેતર';

      for (const opName of selectedOpsKeys) {
        const cfg = selectedOpsMap[opName];
        await api.post('/tractor-works', {
          work_category: tractorCategory,
          customer_name: finalCustomerName,
          customer_phone: customerPhone.trim() || null,
          operation_type: opName,
          trips_count: cfg.trips || 1,
          calc_basis: calcBasis || 'vigha',
          units_count: cfg.units || 10,
          rate_per_unit: cfg.rate || 350,
          work_date: tractorDate,
          notes: tractorNotes.trim() || null,
        });
      }

      setTractorModalVisible(false);
      setSelectedCustomerFilter('all');
      setActiveTab('tractor');
      await fetchFarmingData();

      showToast(`✅ ટ્રેક્ટરના ${selectedOpsKeys.length} કામો (કુલ ₹${multiTractorGrandTotal.toLocaleString('en-IN')}) લિસ્ટમાં ઉમેરાઈ ગયા!`);
    } catch (err: any) {
      console.error('Tractor save error:', err);
      alert('ભૂલ: ' + (err.response?.data?.message || 'ટ્રેક્ટર હિસાબ સેવ કરવામાં ભૂલ આવી.'));
    } finally {
      setSavingTractor(false);
    }
  };

  // Save Multiple Farming Expenses in Batch
  const handleSaveMultipleExpenses = async () => {
    if (selectedExpKeys.length === 0) {
      alert('કૃપા કરીને ઓછામાં ઓછો ૧ ખર્ચ પસંદ કરો.');
      return;
    }

    setSavingExp(true);
    try {
      for (const key of selectedExpKeys) {
        const exp = selectedExpMap[key];
        await api.post('/farming/expense', {
          expense_type: key,
          title_gu: exp.title.trim() || 'ખેતી ખર્ચ',
          amount: parseFloat(exp.amount) || 0,
          quantity_or_hours: parseFloat(exp.qty) || null,
          unit_rate: parseFloat(exp.rate) || null,
          expense_date: expDate,
        });
      }

      setExpModalVisible(false);
      setActiveTab('expense');
      await fetchFarmingData();

      showToast(`✅ ખેતીના ${selectedExpKeys.length} ખર્ચાઓ (કુલ ₹${multiExpGrandTotal.toLocaleString('en-IN')}) સેવ થઈ ગયા!`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'ખર્ચ સેવ કરવામાં ભૂલ આવી.');
    } finally {
      setSavingExp(false);
    }
  };

  // Delete Handlers
  const handleDeleteTractorWork = async (id: number) => {
    const confirmed = Platform.OS === 'web'
      ? window.confirm('શું તમે આ ટ્રેક્ટર કામ રેકોર્ડ ડિલીટ કરવા માંગો છો?')
      : true;

    if (confirmed) {
      try {
        await api.delete(`/tractor-works/${id}`);
        await fetchFarmingData();
        showToast('🗑️ ટ્રેક્ટર રેકોર્ડ ડિલીટ કર્યો.');
      } catch (e) {
        console.warn('Delete error:', e);
      }
    }
  };

  const handleDeleteExpense = async (id: number) => {
    const confirmed = Platform.OS === 'web'
      ? window.confirm('શું તમે આ ખર્ચ રેકોર્ડ ડિલીટ કરવા માંગો છો?')
      : true;

    if (confirmed) {
      try {
        await api.delete(`/farming/expense/${id}`);
        await fetchFarmingData();
        showToast('🗑️ ખર્ચ રેકોર્ડ ડિલીટ કર્યો.');
      } catch (e) {
        console.warn('Delete error:', e);
      }
    }
  };

  const filteredTractorWorks = tractorWorks.filter((tw) => {
    if (selectedCustomerFilter === 'all') return true;
    return tw.customer_name === selectedCustomerFilter;
  });

  const customerBillTotal = filteredTractorWorks.reduce((s, r) => s + Number(r.total_amount || 0), 0);

  return (
    <View style={styles.container}>
      <Header
        title="🌾 ખેતીવાડી & ટ્રેક્ટર હિસાબ"
        subtitle="પાક ઉત્પાદન, દવા, ખાતર & ગ્રાહક બિલ"
        rightAction={
          <TouchableOpacity
            style={styles.pdfHeaderBtn}
            onPress={() => exportDetailedFarmingReport(summary, productions, expenses, tractorWorks, user)}
          >
            <FileDown size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.pdfHeaderBtnText}>ખેતી PDF</Text>
          </TouchableOpacity>
        }
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <View style={styles.toastBanner}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Top 4 Navigation Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'tractor' && styles.tabBtnActive]}
          onPress={() => setActiveTab('tractor')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'tractor' && styles.tabBtnTextActive]}>
            🚜 ટ્રેક્ટર હિસાબ ({tractorWorks.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'production' && styles.tabBtnActive]}
          onPress={() => setActiveTab('production')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'production' && styles.tabBtnTextActive]}>
            🌾 પાક કેલ્ક્યુલેટર ({productions.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'expense' && styles.tabBtnActive]}
          onPress={() => setActiveTab('expense')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'expense' && styles.tabBtnTextActive]}>
            👷 ખેતી ખર્ચ ({expenses.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'overview' && styles.tabBtnActive]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'overview' && styles.tabBtnTextActive]}>
            📊 સમરી & નફો
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Net Profit Banner */}
        <Card variant="gold" style={styles.netProfitCard}>
          <View style={styles.profitHeaderRow}>
            <View>
              <Text style={styles.profitSubTitle}>ચોખ્ખો ખેતી નફો (Net Farming Profit)</Text>
              <Text style={[styles.profitMainAmt, { color: (summary?.net_profit || 0) >= 0 ? '#059669' : '#DC2626' }]}>
                ₹{((summary?.net_profit || 0)).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={[styles.profitBadge, { backgroundColor: (summary?.net_profit || 0) >= 0 ? '#ECFDF5' : '#FEF2F2' }]}>
              {(summary?.net_profit || 0) >= 0 ? (
                <TrendingUp size={24} color="#059669" />
              ) : (
                <TrendingDown size={24} color="#DC2626" />
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.statsTwoCol}>
            <View style={styles.colBox}>
              <Text style={styles.colLabel}>કુલ પાક વેચાણ આવક</Text>
              <Text style={[styles.colValue, { color: '#059669' }]}>
                + ₹{(summary?.total_revenue || 0).toLocaleString('en-IN')}
              </Text>
            </View>

            <View style={[styles.colBox, { borderLeftWidth: 1, borderLeftColor: Colors.border, paddingLeft: 12 }]}>
              <Text style={styles.colLabel}>કુલ ખેતી ખર્ચ</Text>
              <Text style={[styles.colValue, { color: '#DC2626' }]}>
                - ₹{(summary?.total_expense || 0).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </Card>

        {/* 3 Quick Action Cards */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}
            onPress={() => setTractorModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#FDE68A' }]}>
              <Tractor size={22} color={Colors.accentDark} />
            </View>
            <Text style={[styles.actionCardTitle, { color: '#92400E' }]}>+ ટ્રેક્ટર હિસાબ</Text>
            <Text style={styles.actionCardSub}>દાંતી, રાંપ, માઢ, ગ્રાહક બિલ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setProdModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#ECFDF5' }]}>
              <Calculator size={22} color="#059669" />
            </View>
            <Text style={styles.actionCardTitle}>+ પાક કેલ્ક્યુલેટર</Text>
            <Text style={styles.actionCardSub}>મગફળી, કપાસ, ખાંડી/મણ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setExpModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Users size={22} color={Colors.primary} />
            </View>
            <Text style={styles.actionCardTitle}>+ ખેતી ખર્ચ</Text>
            <Text style={styles.actionCardSub}>મજૂરી, ખાતર, દવા</Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: TRACTOR WORK */}
        {activeTab === 'tractor' && (
          <>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionHeading}>🚜 ટ્રેક્ટર કામ લિસ્ટ ({tractorWorks.length})</Text>
                <Text style={styles.sectionSub}>દાંતી, રાંપ, માઢ, સાવડા & ગ્રાહકવાઈઝ બિલ</Text>
              </View>

              <TouchableOpacity
                style={[styles.addMiniBtn, { backgroundColor: Colors.accentDark }]}
                onPress={() => setTractorModalVisible(true)}
              >
                <Plus size={14} color="#FFFFFF" style={{ marginRight: 2 }} />
                <Text style={styles.addMiniBtnText}>કામ ઉમેરો</Text>
              </TouchableOpacity>
            </View>

            {/* Customer Filter Chips + PDF Bill Button */}
            {customers.length > 0 && (
              <View style={styles.customerFilterRow}>
                <Text style={styles.filterHead}>ગ્રાહકવાર બિલ ફિલ્ટર:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                  <TouchableOpacity
                    style={[styles.filterChip, selectedCustomerFilter === 'all' && styles.filterChipActive]}
                    onPress={() => setSelectedCustomerFilter('all')}
                  >
                    <Text style={[styles.filterChipText, selectedCustomerFilter === 'all' && styles.filterChipTextActive]}>
                      બધા ({tractorWorks.length})
                    </Text>
                  </TouchableOpacity>

                  {customers.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={[styles.filterChip, selectedCustomerFilter === c && styles.filterChipActive]}
                      onPress={() => setSelectedCustomerFilter(c)}
                    >
                      <Text style={[styles.filterChipText, selectedCustomerFilter === c && styles.filterChipTextActive]}>
                        👤 {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {selectedCustomerFilter !== 'all' && (
                  <TouchableOpacity
                    style={styles.customerPdfBtn}
                    onPress={() => exportTractorCustomerBill(selectedCustomerFilter, filteredTractorWorks, user)}
                  >
                    <FileDown size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.customerPdfBtnText}>
                      {selectedCustomerFilter} નું બિલ PDF (₹{customerBillTotal.toLocaleString('en-IN')})
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {filteredTractorWorks.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Tractor size={36} color={Colors.textMuted} style={{ marginBottom: 6 }} />
                <Text style={styles.emptyTitle}>કોઈ ટ્રેક્ટર કામ નોંધાયેલ નથી</Text>
                <Text style={styles.emptyDesc}>ઉપર "+ ટ્રેક્ટર હિસાબ" બટન દબાવીને દાંતી, રાંપ કે અન્ય કામ ઉમેરો.</Text>
              </Card>
            ) : (
              filteredTractorWorks.map((tw) => (
                <Card key={tw.id} style={styles.itemCard}>
                  <View style={styles.itemTopRow}>
                    <View style={styles.cropTitleRow}>
                      <View style={[styles.cropIconBg, { backgroundColor: tw.work_category === 'customer' ? '#FEF3C7' : '#EFF6FF' }]}>
                        <Tractor size={18} color={tw.work_category === 'customer' ? Colors.accentDark : Colors.primary} />
                      </View>
                      <View>
                        <Text style={styles.cropName}>{tw.customer_name} ({tw.operation_type})</Text>
                        <Text style={styles.saleDateText}>📅 {tw.work_date} • {tw.work_category === 'customer' ? 'ગ્રાહક કામ' : 'પોતાનું ખેતર'}</Text>
                      </View>
                    </View>

                    <Text style={[styles.totalAmtBadge, { color: tw.work_category === 'customer' ? '#059669' : '#DC2626', backgroundColor: tw.work_category === 'customer' ? '#ECFDF5' : '#FEF2F2' }]}>
                      ₹{Number(tw.total_amount).toLocaleString('en-IN')}
                    </Text>
                  </View>

                  <View style={[styles.calcBox, { backgroundColor: '#F8FAFC' }]}>
                    <View style={styles.calcRow}>
                      <Text style={styles.calcLabel}>કામની વિગત:</Text>
                      <Text style={[styles.calcVal, { color: Colors.primary, fontWeight: '800' }]}>
                        {tw.trips_count} વાર {tw.operation_type}
                      </Text>
                    </View>
                    <View style={styles.calcRow}>
                      <Text style={styles.calcLabel}>ગણતરી આધાર:</Text>
                      <Text style={styles.calcVal}>
                        {tw.units_count} {tw.calc_basis === 'vigha' ? 'વીઘા' : 'કલાક'} × ₹{tw.rate_per_unit}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.itemFooter}>
                    <Text style={styles.ownerText}>🔒 Tractor Record #{tw.id}</Text>
                    <TouchableOpacity
                      style={styles.delBtn}
                      onPress={() => handleDeleteTractorWork(tw.id)}
                    >
                      <Trash2 size={14} color={Colors.danger} style={{ marginRight: 4 }} />
                      <Text style={styles.delBtnText}>ડિલીટ</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))
            )}
          </>
        )}

        {/* TAB 2: CROP PRODUCTION */}
        {activeTab === 'production' && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>પાક ઉત્પાદન & વેચાણ હિસાબ ({productions.length})</Text>
              <TouchableOpacity style={styles.addMiniBtn} onPress={() => setProdModalVisible(true)}>
                <Plus size={14} color="#FFFFFF" style={{ marginRight: 2 }} />
                <Text style={styles.addMiniBtnText}>નવો પાક</Text>
              </TouchableOpacity>
            </View>

            {productions.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Sprout size={36} color={Colors.textMuted} style={{ marginBottom: 6 }} />
                <Text style={styles.emptyTitle}>કોઈ પાક ઉત્પાદન નોંધાયેલ નથી</Text>
                <Text style={styles.emptyDesc}>દા.ત. ૨૦ ખાંડી મગફળી અથવા ૫૦ મણ કપાસનો હિસાબ ઉમેરો.</Text>
              </Card>
            ) : (
              productions.map((prod) => (
                <Card key={prod.id} variant="gold" style={styles.itemCard}>
                  <View style={styles.itemTopRow}>
                    <View style={styles.cropTitleRow}>
                      <View style={styles.cropIconBg}>
                        <Sprout size={18} color="#059669" />
                      </View>
                      <View>
                        <Text style={styles.cropName}>{prod.crop_name_gu}</Text>
                        <Text style={styles.saleDateText}>📅 {prod.sale_date} {prod.buyer_name ? `• ${prod.buyer_name}` : ''}</Text>
                      </View>
                    </View>

                    <Text style={styles.totalAmtBadge}>₹{Number(prod.total_amount).toLocaleString('en-IN')}</Text>
                  </View>

                  <View style={styles.calcBox}>
                    <View style={styles.calcRow}>
                      <Text style={styles.calcLabel}>વેચાણ જથ્થો:</Text>
                      <Text style={styles.calcVal}>{prod.quantity} {prod.unit?.toUpperCase()} @ ₹{Number(prod.rate_per_unit).toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.calcRow}>
                      <Text style={styles.calcLabel}>મણમાં વજન:</Text>
                      <Text style={[styles.calcVal, { color: Colors.accentDark, fontWeight: '800' }]}>{prod.equivalent_man || '-'} મણ</Text>
                    </View>
                    <View style={styles.calcRow}>
                      <Text style={styles.calcLabel}>કિલોમાં વજન:</Text>
                      <Text style={styles.calcVal}>{prod.equivalent_kg ? `${Number(prod.equivalent_kg).toLocaleString('en-IN')} KG` : '-'}</Text>
                    </View>
                  </View>
                </Card>
              ))
            )}
          </>
        )}

        {/* TAB 3: FARMING EXPENSES WITH DETAILED BREAKDOWN & MULTI-ENTRY */}
        {activeTab === 'expense' && (
          <>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionHeading}>👷 ખેતી ખર્ચ હિસાબ ({expenses.length})</Text>
                <Text style={styles.sectionSub}>દવા, ખાતર, મજૂરી & બિયારણના વિગતવાર ખર્ચા</Text>
              </View>

              <TouchableOpacity
                style={[styles.addMiniBtn, { backgroundColor: Colors.danger }]}
                onPress={() => setExpModalVisible(true)}
              >
                <Plus size={14} color="#FFFFFF" style={{ marginRight: 2 }} />
                <Text style={styles.addMiniBtnText}>ખર્ચ ઉમેરો</Text>
              </TouchableOpacity>
            </View>

            {expenses.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Users size={36} color={Colors.textMuted} style={{ marginBottom: 6 }} />
                <Text style={styles.emptyTitle}>કોઈ ખેતી ખર્ચ નોંધાયેલ નથી</Text>
              </Card>
            ) : (
              expenses.map((exp) => (
                <Card key={exp.id} style={styles.itemCard}>
                  <View style={styles.itemTopRow}>
                    <View style={styles.cropTitleRow}>
                      <View style={[styles.cropIconBg, { backgroundColor: '#FEE2E2' }]}>
                        <Users size={18} color={Colors.danger} />
                      </View>
                      <View>
                        <Text style={styles.cropName}>{exp.title_gu}</Text>
                        <Text style={styles.saleDateText}>📅 {exp.expense_date} • {exp.expense_type}</Text>
                      </View>
                    </View>

                    <Text style={[styles.totalAmtBadge, { color: Colors.danger, backgroundColor: '#FEF2F2' }]}>
                      ₹{Number(exp.amount).toLocaleString('en-IN')}
                    </Text>
                  </View>

                  {exp.quantity_or_hours && exp.unit_rate ? (
                    <View style={[styles.calcBox, { backgroundColor: '#F8FAFC' }]}>
                      <Text style={styles.calcLabel}>
                        ગણતરી: {exp.quantity_or_hours} × ₹{exp.unit_rate} = <Text style={{ fontWeight: 'bold', color: Colors.danger }}>₹{Number(exp.amount).toLocaleString('en-IN')}</Text>
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.itemFooter}>
                    <Text style={styles.ownerText}>🔒 Private Expense #{exp.id}</Text>
                    <TouchableOpacity
                      style={styles.delBtn}
                      onPress={() => handleDeleteExpense(exp.id)}
                    >
                      <Trash2 size={14} color={Colors.danger} style={{ marginRight: 4 }} />
                      <Text style={styles.delBtnText}>ડિલીટ</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              ))
            )}
          </>
        )}

        {/* TAB 4: OVERVIEW */}
        {activeTab === 'overview' && (
          <>
            <Text style={styles.sectionHeading}>ખેતી ખર્ચ સમરી</Text>
            <Card style={styles.breakdownCard}>
              <View style={styles.breakdownItem}>
                <View style={styles.breakRow}>
                  <Users size={16} color={Colors.primary} style={{ marginRight: 8 }} />
                  <Text style={styles.breakLabel}>મજૂરી ખર્ચ</Text>
                </View>
                <Text style={styles.breakVal}>₹{(summary?.breakdown?.labour || 0).toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.breakdownItem}>
                <View style={styles.breakRow}>
                  <Tractor size={16} color={Colors.accentDark} style={{ marginRight: 8 }} />
                  <Text style={styles.breakLabel}>ટ્રેક્ટર ખર્ચ</Text>
                </View>
                <Text style={styles.breakVal}>₹{(summary?.breakdown?.tractor || 0).toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.breakdownItem}>
                <View style={styles.breakRow}>
                  <Sprout size={16} color={Colors.success} style={{ marginRight: 8 }} />
                  <Text style={styles.breakLabel}>ખાતર ખર્ચ</Text>
                </View>
                <Text style={styles.breakVal}>₹{(summary?.breakdown?.fertilizer || 0).toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.divider} />

              <View style={styles.breakdownItem}>
                <View style={styles.breakRow}>
                  <FlaskConical size={16} color="#8B5CF6" style={{ marginRight: 8 }} />
                  <Text style={styles.breakLabel}>દવા & છંટકાવ</Text>
                </View>
                <Text style={styles.breakVal}>₹{(summary?.breakdown?.medicine || 0).toLocaleString('en-IN')}</Text>
              </View>
            </Card>
          </>
        )}

        {/* Branding Footer */}
        <View style={styles.brandingFooter}>
          <Text style={styles.brandText}>
            Made with ❤️ by <Text style={{ fontWeight: '900', color: Colors.primary }}>Kishan Sejani</Text>
          </Text>
          <Text style={styles.familyTagText}>શ્રી સેજાણી પરિવાર • ૧૦૦% સુરક્ષિત ખાનગી પોર્ટલ</Text>
        </View>
      </ScrollView>

      {/* MODAL 1: CROP PRODUCTION MODAL */}
      <Modal visible={prodModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Calculator size={20} color={Colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.modalHeading}>🌾 પાક ઉત્પાદન & કેલ્ક્યુલેટર</Text>
              </View>
              <TouchableOpacity onPress={() => setProdModalVisible(false)}>
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.labelWithMicRow}>
                <Text style={styles.inputLabel}>૧. પાકનું નામ લખો અથવા બોલો:</Text>
                <TouchableOpacity
                  style={[styles.micBtn, isListening && activeVoiceField === 'crop' && styles.micBtnActive]}
                  onPress={() => startVoiceInput('crop', setCropName)}
                >
                  <Mic size={16} color={isListening && activeVoiceField === 'crop' ? '#FFFFFF' : Colors.primary} />
                  <Text style={[styles.micBtnText, isListening && activeVoiceField === 'crop' && { color: '#FFFFFF' }]}>
                    {isListening && activeVoiceField === 'crop' ? 'સાંભળે છે...' : 'બોલો 🎤'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={[styles.input, { fontWeight: 'bold' }]}
                placeholder="દા.ત. મગફળી, કપાસ, જીરું, ઘઉં..."
                placeholderTextColor={Colors.textMuted}
                value={cropName}
                onChangeText={setCropName}
              />

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                {cropSuggestions.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.cropChip, cropName === c && styles.cropChipActive]}
                    onPress={() => setCropName(c)}
                  >
                    <Text style={[styles.cropChipText, cropName === c && styles.cropChipTextActive]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.inputLabel}>૨. એકમ પસંદ કરો (Unit):</Text>
              <View style={styles.unitPillsRow}>
                <TouchableOpacity
                  style={[styles.unitPill, unit === 'khandi' && styles.unitPillActive]}
                  onPress={() => setUnit('khandi')}
                >
                  <Text style={[styles.unitPillText, unit === 'khandi' && styles.unitPillTextActive]}>
                    ખાંડી (20 મણ = 400 KG)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.unitPill, unit === 'man' && styles.unitPillActive]}
                  onPress={() => setUnit('man')}
                >
                  <Text style={[styles.unitPillText, unit === 'man' && styles.unitPillTextActive]}>
                    મણ (20 KG)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.unitPill, unit === 'quintal' && styles.unitPillActive]}
                  onPress={() => setUnit('quintal')}
                >
                  <Text style={[styles.unitPillText, unit === 'quintal' && styles.unitPillTextActive]}>
                    ક્વિન્ટલ (100 KG)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.unitPill, unit === 'kg' && styles.unitPillActive]}
                  onPress={() => setUnit('kg')}
                >
                  <Text style={[styles.unitPillText, unit === 'kg' && styles.unitPillTextActive]}>
                    કિલો (KG)
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.twoInputsRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>જથ્થો ({unit.toUpperCase()}) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="દા.ત. 20"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                    value={quantity}
                    onChangeText={setQuantity}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.inputLabel}>ભાવ (₹ પ્રતિ {unit}) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="દા.ત. 28000"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                    value={ratePerUnit}
                    onChangeText={setRatePerUnit}
                  />
                </View>
              </View>

              <View style={styles.liveMathCard}>
                <Text style={styles.liveMathHead}>⚡ સંપૂર્ણ ઓટોમેટિક ગણતરી (Live Calculation):</Text>

                <View style={styles.mathGrid}>
                  <View style={styles.mathItem}>
                    <Text style={styles.mathItemLabel}>કુલ વેચાણ રકમ</Text>
                    <Text style={styles.mathItemValMain}>₹{liveTotalCropAmount.toLocaleString('en-IN')}</Text>
                  </View>

                  <View style={styles.mathItem}>
                    <Text style={styles.mathItemLabel}>૧ મણનો ભાવ</Text>
                    <Text style={[styles.mathItemVal, { color: Colors.accentDark }]}>₹{ratePerMan.toFixed(2)} / મણ</Text>
                  </View>

                  <View style={styles.mathItem}>
                    <Text style={styles.mathItemLabel}>૧ કિલોનો ભાવ</Text>
                    <Text style={styles.mathItemVal}>₹{ratePerKg.toFixed(2)} / KG</Text>
                  </View>

                  <View style={styles.mathItem}>
                    <Text style={styles.mathItemLabel}>કુલ વજન (મણમાં)</Text>
                    <Text style={[styles.mathItemVal, { color: Colors.primary }]}>{liveManWeight} મણ</Text>
                  </View>
                </View>
              </View>

              <View style={styles.labelWithMicRow}>
                <Text style={styles.inputLabel}>વેપારી / માર્કેટ યાર્ડનું નામ:</Text>
                <TouchableOpacity
                  style={[styles.micBtn, isListening && activeVoiceField === 'buyer' && styles.micBtnActive]}
                  onPress={() => startVoiceInput('buyer', setBuyerName)}
                >
                  <Mic size={14} color={Colors.primary} />
                  <Text style={styles.micBtnText}>બોલો 🎤</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="દા.ત. ગોંડલ યાર્ડ, ગોકુલ ટ્રેડર્સ"
                placeholderTextColor={Colors.textMuted}
                value={buyerName}
                onChangeText={setBuyerName}
              />

              <View style={styles.modalFooter}>
                <Button
                  title="રદ કરો"
                  variant="outline"
                  onPress={() => setProdModalVisible(false)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title="હિસાબ સેવ કરો"
                  variant="primary"
                  loading={savingProd}
                  onPress={handleSaveProduction}
                  style={{ flex: 2 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: TRACTOR WORK BILLING MODAL */}
      <Modal visible={tractorModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Tractor size={20} color={Colors.accentDark} style={{ marginRight: 8 }} />
                <Text style={styles.modalHeading}>🚜 ટ્રેક્ટર કામ હિસાબ (મલ્ટી-સિલેક્ટ)</Text>
              </View>
              <TouchableOpacity onPress={() => setTractorModalVisible(false)}>
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>૧. કામ કોના ખેતરનું છે?</Text>
              <View style={styles.twoInputsRow}>
                <TouchableOpacity
                  style={[styles.catPill, tractorCategory === 'customer' && styles.catPillActiveCustomer]}
                  onPress={() => setTractorCategory('customer')}
                >
                  <Text style={[styles.catPillText, tractorCategory === 'customer' && styles.catPillTextActive]}>
                    👤 બીજાનું કામ (ગ્રાહક બિલ / આવક)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.catPill, tractorCategory === 'self' && styles.catPillActiveSelf]}
                  onPress={() => setTractorCategory('self')}
                >
                  <Text style={[styles.catPillText, tractorCategory === 'self' && styles.catPillTextActive]}>
                    🏡 પોતાનું ખેતર (ખર્ચ)
                  </Text>
                </TouchableOpacity>
              </View>

              {tractorCategory === 'customer' && (
                <>
                  <View style={styles.labelWithMicRow}>
                    <Text style={styles.inputLabel}>ગ્રાહક / ખેડૂતનું નામ (Customer):</Text>
                    <TouchableOpacity
                      style={[styles.micBtn, isListening && activeVoiceField === 'cust' && styles.micBtnActive]}
                      onPress={() => startVoiceInput('cust', setCustomerName)}
                    >
                      <Mic size={14} color={Colors.primary} />
                      <Text style={styles.micBtnText}>નામ બોલો 🎤</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[styles.input, { fontWeight: 'bold' }]}
                    placeholder="દા.ત. રામભાઈ પટેલ, સુરેશભાઈ..."
                    placeholderTextColor={Colors.textMuted}
                    value={customerName}
                    onChangeText={setCustomerName}
                  />
                </>
              )}

              <View style={styles.twoInputsRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>ખેતરનું માપ (વીઘા) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="દા.ત. 10"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                    value={commonVigha}
                    onChangeText={(v) => {
                      setCommonVigha(v);
                      const numV = parseFloat(v) || 0;
                      setSelectedOpsMap((prev) => {
                        const updated: Record<string, SelectedOpConfig> = {};
                        Object.keys(prev).forEach((k) => {
                          updated[k] = { ...prev[k], units: numV };
                        });
                        return updated;
                      });
                    }}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.inputLabel}>સામાન્ય ભાવ પ્રતિ વીઘા (₹) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="દા.ત. 350"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="numeric"
                    value={commonRate}
                    onChangeText={(r) => {
                      setCommonRate(r);
                      const numR = parseFloat(r) || 0;
                      setSelectedOpsMap((prev) => {
                        const updated: Record<string, SelectedOpConfig> = {};
                        Object.keys(prev).forEach((k) => {
                          updated[k] = { ...prev[k], rate: numR };
                        });
                        return updated;
                      });
                    }}
                  />
                </View>
              </View>

              <View style={styles.labelWithBadgeRow}>
                <Text style={styles.inputLabel}>૨. જે કામ કર્યું હોય તે તમામ સિલેક્ટ કરો (એકથી વધુ પસંદ કરો):</Text>
                <Badge label={`${selectedOpsKeys.length} પસંદ`} variant="accent" />
              </View>

              <View style={styles.opsGrid}>
                {tractorOperations.map((op) => {
                  const isSelected = !!selectedOpsMap[op.name];
                  return (
                    <TouchableOpacity
                      key={op.name}
                      style={[styles.opChip, isSelected && styles.opChipActive]}
                      onPress={() => toggleOperation(op.name)}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {isSelected && (
                          <Check size={14} color="#FFFFFF" style={{ marginRight: 4 }} strokeWidth={3} />
                        )}
                        <Text style={[styles.opChipText, isSelected && styles.opChipTextActive]}>
                          {op.name}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {selectedOpsKeys.length > 0 ? (
                <View style={styles.selectedOpsContainer}>
                  <Text style={styles.configHeader}>દરેક કામના ફેરા અને ભાવ બદલો (Individual Price/Rate):</Text>

                  {selectedOpsKeys.map((opName) => {
                    const cfg = selectedOpsMap[opName] || { trips: 1, units: 10, rate: 350 };
                    const opSubtotal = (Number(cfg.trips) || 0) * (Number(cfg.units) || 0) * (Number(cfg.rate) || 0);

                    return (
                      <View key={opName} style={styles.opConfigCard}>
                        <View style={styles.opConfigHeader}>
                          <Text style={styles.opConfigTitle}>🚜 {opName}</Text>
                          <Text style={styles.opSubtotalText}>₹{opSubtotal.toLocaleString('en-IN')}</Text>
                        </View>

                        <Text style={styles.smallLabel}>કેટલી વાર હાંક્યું? (ફેરા):</Text>
                        <View style={styles.tripsRow}>
                          {[1, 2, 3, 4].map((t) => (
                            <TouchableOpacity
                              key={t}
                              style={[styles.tripBtn, cfg.trips === t && styles.tripBtnActive]}
                              onPress={() => updateOpField(opName, 'trips', t)}
                            >
                              <Text style={[styles.tripBtnText, cfg.trips === t && styles.tripBtnTextActive]}>
                                {t} વાર
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>

                        <View style={styles.twoInputsRow}>
                          <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.smallLabel}>વીઘા (માપ)</Text>
                            <TextInput
                              style={styles.miniInput}
                              keyboardType="numeric"
                              value={String(cfg.units || '')}
                              onChangeText={(v) => updateOpField(opName, 'units', parseFloat(v) || 0)}
                            />
                          </View>

                          <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.smallLabel}>{opName} નો ભાવ પ્રતિ વીઘા (₹)</Text>
                            <TextInput
                              style={[styles.miniInput, { fontWeight: 'bold', color: Colors.primary }]}
                              keyboardType="numeric"
                              value={String(cfg.rate || '')}
                              onChangeText={(r) => updateOpField(opName, 'rate', parseFloat(r) || 0)}
                            />
                          </View>
                        </View>

                        <Text style={styles.opFormulaText}>
                          {cfg.trips} વાર × {cfg.units} વીઘા × ₹{cfg.rate} = <Text style={{ fontWeight: '800', color: '#059669' }}>₹{opSubtotal.toLocaleString('en-IN')}</Text>
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ) : null}

              <View style={styles.liveMathCard}>
                <Text style={styles.liveMathHead}>⚡ કુલ ટ્રેક્ટર બિલ (Grand Total):</Text>
                <View style={styles.grandTotalRow}>
                  <Text style={styles.grandTotalLabel}>
                    કુલ {selectedOpsKeys.length} કામોનું ભેગું બિલ:
                  </Text>
                  <Text style={styles.grandTotalVal}>
                    ₹{multiTractorGrandTotal.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              <View style={styles.modalFooter}>
                <Button
                  title="રદ કરો"
                  variant="outline"
                  onPress={() => setTractorModalVisible(false)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title={`બધા સાચવો (₹${multiTractorGrandTotal.toLocaleString('en-IN')})`}
                  variant="primary"
                  loading={savingTractor}
                  onPress={handleSaveTractorWork}
                  style={{ flex: 2 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: FARMING MULTI-EXPENSE MODAL (FERTILIZER, PESTICIDES, LABOUR AT ONCE) */}
      <Modal visible={expModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Users size={20} color={Colors.danger} style={{ marginRight: 8 }} />
                <Text style={styles.modalHeading}>👷 ખેતી ખર્ચ હિસાબ (મલ્ટી-સિલેક્ટ)</Text>
              </View>
              <TouchableOpacity onPress={() => setExpModalVisible(false)}>
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.labelWithBadgeRow}>
                <Text style={styles.inputLabel}>૧. જે-જે ખર્ચ થયા હોય તે સિલેક્ટ કરો (એકથી વધુ):</Text>
                <Badge label={`${selectedExpKeys.length} ખર્ચ`} variant="danger" />
              </View>

              <View style={styles.opsGrid}>
                {expenseCategories.map((c) => {
                  const isSelected = !!selectedExpMap[c.key];
                  return (
                    <TouchableOpacity
                      key={c.key}
                      style={[styles.opChip, isSelected && { backgroundColor: Colors.danger, borderColor: Colors.danger }]}
                      onPress={() => toggleExpenseCategory(c.key)}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {isSelected && <Check size={14} color="#FFFFFF" style={{ marginRight: 4 }} strokeWidth={3} />}
                        <Text style={[styles.opChipText, isSelected && { color: '#FFFFFF', fontWeight: '800' }]}>
                          {c.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Dynamic Sub-Cards for Each Selected Expense with Voice & Custom Inputs */}
              {selectedExpKeys.length > 0 && (
                <View style={styles.selectedOpsContainer}>
                  <Text style={styles.configHeader}>પસંદ કરેલ ખર્ચાની વિગત:</Text>

                  {selectedExpKeys.map((catKey) => {
                    const item = selectedExpMap[catKey];
                    const catObj = expenseCategories.find((c) => c.key === catKey);

                    return (
                      <View key={catKey} style={styles.opConfigCard}>
                        <View style={styles.opConfigHeader}>
                          <Text style={[styles.opConfigTitle, { color: Colors.danger }]}>
                            {catObj?.label || catKey}
                          </Text>
                          <Text style={[styles.opSubtotalText, { color: Colors.danger }]}>
                            ₹{Number(item.amount || 0).toLocaleString('en-IN')}
                          </Text>
                        </View>

                        {/* Title with Voice Mic */}
                        <View style={styles.labelWithMicRow}>
                          <Text style={styles.smallLabel}>ખર્ચનું નામ / બ્રાન્ડ / વિગત:</Text>
                          <TouchableOpacity
                            style={styles.micBtn}
                            onPress={() => startVoiceInput(`exp_${catKey}`, (txt) => updateExpenseField(catKey, 'title', txt))}
                          >
                            <Mic size={12} color={Colors.primary} />
                            <Text style={styles.micBtnText}>બોલો 🎤</Text>
                          </TouchableOpacity>
                        </View>
                        <TextInput
                          style={styles.miniInput}
                          value={item.title}
                          onChangeText={(txt) => updateExpenseField(catKey, 'title', txt)}
                        />

                        {/* Qty & Rate */}
                        <View style={styles.twoInputsRow}>
                          <View style={{ flex: 1, marginRight: 6 }}>
                            <Text style={styles.smallLabel}>સંખ્યા / થેલી / મજૂર</Text>
                            <TextInput
                              style={styles.miniInput}
                              keyboardType="numeric"
                              value={item.qty}
                              onChangeText={(q) => updateExpenseField(catKey, 'qty', q)}
                            />
                          </View>

                          <View style={{ flex: 1, marginLeft: 6 }}>
                            <Text style={styles.smallLabel}>ભાવ / રોજ (₹)</Text>
                            <TextInput
                              style={styles.miniInput}
                              keyboardType="numeric"
                              value={item.rate}
                              onChangeText={(r) => updateExpenseField(catKey, 'rate', r)}
                            />
                          </View>
                        </View>

                        {/* Total Amount per line */}
                        <Text style={styles.smallLabel}>કુલ રકમ (₹):</Text>
                        <TextInput
                          style={[styles.miniInput, { fontWeight: '900', color: Colors.danger }]}
                          keyboardType="numeric"
                          value={item.amount}
                          onChangeText={(a) => updateExpenseField(catKey, 'amount', a)}
                        />
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Live Grand Total for Expenses */}
              <View style={[styles.liveMathCard, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                <Text style={[styles.liveMathHead, { color: '#991B1B' }]}>⚡ કુલ ખેતી ખર્ચ (Total Expenses):</Text>
                <View style={styles.grandTotalRow}>
                  <Text style={[styles.grandTotalLabel, { color: '#7F1D1D' }]}>
                    કુલ {selectedExpKeys.length} ખર્ચાઓનું ભેગું બિલ:
                  </Text>
                  <Text style={[styles.grandTotalVal, { color: Colors.danger }]}>
                    ₹{multiExpGrandTotal.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              <View style={styles.modalFooter}>
                <Button
                  title="રદ કરો"
                  variant="outline"
                  onPress={() => setExpModalVisible(false)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title={`બધા સાચવો (₹${multiExpGrandTotal.toLocaleString('en-IN')})`}
                  variant="danger"
                  loading={savingExp}
                  onPress={handleSaveMultipleExpenses}
                  style={{ flex: 2 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Global Close Keyboard Bar */}
      <DismissKeyboardBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  pdfHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pdfHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  toastBanner: {
    backgroundColor: '#059669',
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: Colors.accentDark,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabBtnTextActive: {
    color: Colors.accentDark,
    fontWeight: '900',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },
  netProfitCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,
  },
  profitHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profitSubTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  profitMainAmt: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: 2,
  },
  profitBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  statsTwoCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colBox: {
    flex: 1,
  },
  colLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  colValue: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 10,
    marginHorizontal: 3,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadowColor,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  actionCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  actionCardSub: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  addMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  addMiniBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  breakdownCard: {
    padding: 14,
    marginBottom: 16,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  breakRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  breakVal: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  customerFilterRow: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterHead: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    marginRight: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  customerPdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  customerPdfBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  itemCard: {
    padding: 14,
    marginBottom: 10,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cropTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cropIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cropName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  saleDateText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  totalAmtBadge: {
    fontSize: 15,
    fontWeight: '900',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  calcBox: {
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  calcLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  calcVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  ownerText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  delBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  delBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.danger,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptyDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  brandingFooter: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  brandText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  familyTagText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  labelWithMicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 6,
  },
  labelWithBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
    marginBottom: 6,
    flex: 1,
  },
  micBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  micBtnActive: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  micBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    marginLeft: 4,
  },
  input: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  miniInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 2,
  },
  chipsScroll: {
    flexDirection: 'row',
    marginTop: 6,
    marginBottom: 6,
  },
  cropChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSecondary,
    marginRight: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cropChipActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  cropChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  cropChipTextActive: {
    color: '#FFFFFF',
  },
  unitPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  unitPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  unitPillActive: {
    backgroundColor: Colors.accentDark,
    borderColor: Colors.accentDark,
  },
  unitPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  unitPillTextActive: {
    color: '#FFFFFF',
  },
  twoInputsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  liveMathCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  liveMathHead: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 8,
  },
  mathGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  mathItem: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  mathItemLabel: {
    fontSize: 10,
    color: '#78350F',
    fontWeight: '700',
  },
  mathItemVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  mathItemValMain: {
    fontSize: 16,
    fontWeight: '900',
    color: '#059669',
    marginTop: 2,
  },
  catPill: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catPillActiveCustomer: {
    backgroundColor: Colors.accentDark,
    borderColor: Colors.accentDark,
  },
  catPillActiveSelf: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  catPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  opsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  opChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  opChipActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  opChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  opChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  selectedOpsContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
  configHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  opConfigCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  opConfigHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  opConfigTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  opSubtotalText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#059669',
  },
  smallLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 2,
    marginTop: 4,
  },
  tripsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  tripBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tripBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tripBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tripBtnTextActive: {
    color: '#FFFFFF',
  },
  opFormulaText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#78350F',
    flex: 1,
  },
  grandTotalVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#92400E',
  },
  modalFooter: {
    flexDirection: 'row',
    marginTop: 18,
    marginBottom: 20,
  },
});
