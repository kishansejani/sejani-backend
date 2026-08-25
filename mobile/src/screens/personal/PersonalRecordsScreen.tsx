import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  ShieldCheck,
  Plus,
  Search,
  FileDown,
  Edit3,
  Trash2,
  Lock,
  FileText,
  DollarSign,
  Calendar,
  X,
  BookOpen,
  Bell,
  Wallet,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { AddRecordModal } from '../../components/AddRecordModal';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { exportRecordToPdf, exportAllRecordsToPdf } from '../../utils/pdfExport';
import api from '../../api/client';
import { PersonalRecord } from '../../types';

export const PersonalRecordsScreen: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PersonalRecord | null>(null);

  useEffect(() => {
    fetchRecords();
  }, [activeTab]);

  const fetchRecords = async () => {
    try {
      let url = '/personal-records';
      const params = new URLSearchParams();
      if (activeTab !== 'all') {
        params.append('type', activeTab);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const res = await api.get(url);
      if (res.data?.data) {
        setRecords(res.data.data);
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        Alert.alert('સુરક્ષા એલર્ટ (403)', err.response?.data?.message || 'તમને આ ડેટા જોવાની પરવાનગી નથી.');
      } else {
        console.warn('Fetch records error:', err);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecords();
  };

  const handleSaveRecord = async (data: Partial<PersonalRecord>) => {
    try {
      if (editingRecord) {
        const res = await api.put(`/personal-records/${editingRecord.id}`, data);
        if (res.data?.record) {
          Alert.alert('સફળ', 'નોંધ સફળતાપૂર્વક અપડેટ થઈ.');
          fetchRecords();
          setEditingRecord(null);
          return true;
        }
      } else {
        const res = await api.post('/personal-records', data);
        if (res.data?.record) {
          Alert.alert('સફળ', 'તમારી નવી અંગત નોંધ ઉમેરાઈ ગઈ.');
          fetchRecords();
          return true;
        }
      }
      return false;
    } catch (err: any) {
      if (err.response?.status === 403) {
        Alert.alert('સુરક્ષા એલર્ટ (403)', 'અન્ય યુઝરનો ડેટા એડિટ કરવાની પરવાનગી નથી.');
      } else {
        Alert.alert('ભૂલ', err.response?.data?.message || 'સેવ કરવામાં ભૂલ આવી.');
      }
      return false;
    }
  };

  const handleDeleteRecord = (id: number) => {
    Alert.alert(
      'રેકોર્ડ ડિલીટ કરવો છે?',
      'આ અંગત નોંધ કાયમ માટે ડિલીટ થઈ જશે.',
      [
        { text: 'ના (Cancel)', style: 'cancel' },
        {
          text: 'હા, ડિલીટ કરો',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/personal-records/${id}`);
              Alert.alert('સફળ', 'રેકોર્ડ ડિલીટ થઈ ગયો.');
              fetchRecords();
            } catch (err: any) {
              if (err.response?.status === 403) {
                Alert.alert('સુરક્ષા એલર્ટ (403 Forbidden)', 'તમે અન્ય સભ્યનો રેકોર્ડ ડિલીટ કરી શકતા નથી.');
              } else {
                Alert.alert('ભૂલ', 'ડિલીટ કરવામાં ભૂલ આવી.');
              }
            }
          },
        },
      ]
    );
  };

  const totalExpense = records
    .filter((r) => r.record_type === 'expense' && r.amount)
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  const tabs = [
    { key: 'all', label: language === 'gu' ? 'બધા' : 'All' },
    { key: 'note', label: language === 'gu' ? 'નોંધ' : 'Notes' },
    { key: 'expense', label: language === 'gu' ? 'ખર્ચ/હિસાબ' : 'Expenses' },
    { key: 'document', label: language === 'gu' ? 'દસ્તાવેજ' : 'Docs' },
    { key: 'reminder', label: language === 'gu' ? 'રિમાઇન્ડર' : 'Reminders' },
    { key: 'diary', label: language === 'gu' ? 'ડાયરી' : 'Diary' },
  ];

  const getRecordIcon = (type: string) => {
    switch (type) {
      case 'expense':
        return <DollarSign size={18} color={Colors.accentDark} />;
      case 'document':
        return <FileText size={18} color={Colors.info} />;
      case 'reminder':
        return <Bell size={18} color={Colors.warning} />;
      case 'diary':
        return <BookOpen size={18} color="#8B5CF6" />;
      default:
        return <FileText size={18} color={Colors.primary} />;
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('tabVault', 'મારી તિજોરી')}
        subtitle={language === 'gu' ? '૧૦૦% ખાનગી • ફક્ત તમારો અંગત ડેટા' : '100% Private • Isolated Data'}
        rightAction={
          <TouchableOpacity
            style={styles.addTopBtn}
            onPress={() => {
              setEditingRecord(null);
              setModalVisible(true);
            }}
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 4 }} />
            <Text style={styles.addTopBtnText}>{language === 'gu' ? 'નવી નોંધ' : 'Add Note'}</Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.subBar}>
        {/* Search Input */}
        <View style={styles.searchBox}>
          <Search size={18} color={Colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={language === 'gu' ? 'શીર્ષક અથવા નોંધમાં શોધો...' : 'Search in titles or notes...'}
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={(txt) => {
              setSearchQuery(txt);
              if (txt.length === 0) fetchRecords();
            }}
            onSubmitEditing={fetchRecords}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                fetchRecords();
              }}
            >
              <X size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Category Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabItem,
                activeTab === tab.key && styles.tabItemActive,
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Expense Summary Card + Global PDF Export */}
        <Card variant="gold" style={styles.expenseSummaryCard}>
          <View style={styles.expenseRow}>
            <View>
              <Text style={styles.expenseLabel}>કુલ અંગત ખર્ચ / હિસાબ</Text>
              <Text style={styles.expenseValue}>₹{totalExpense.toLocaleString('en-IN')}</Text>
            </View>

            <TouchableOpacity
              style={styles.pdfExportBtn}
              onPress={() => exportAllRecordsToPdf(records, user)}
              activeOpacity={0.8}
            >
              <FileDown size={18} color={Colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.pdfExportText}>તમામ PDF</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Records List */}
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginVertical: 30 }} />
        ) : records.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Lock size={40} color={Colors.textMuted} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>આ કેટેગરીમાં કોઈ રેકોર્ડ નથી</Text>
            <Text style={styles.emptyDesc}>
              તમારો કોઈપણ ડેટા બીજા સભ્યો સાથે શેર થતો નથી. નવી નોંધ ઉમેરવા નીચે ક્લિક કરો.
            </Text>
            <Button
              title="+ નવી ખાનગી નોંધ ઉમેરો"
              variant="primary"
              onPress={() => {
                setEditingRecord(null);
                setModalVisible(true);
              }}
              style={{ marginTop: 14 }}
            />
          </Card>
        ) : (
          records.map((item) => (
            <Card key={item.id} variant="default" style={styles.recordCard}>
              <View style={styles.cardHeader}>
                <View style={styles.titleArea}>
                  <View style={styles.titleRow}>
                    <View style={styles.iconCircle}>{getRecordIcon(item.record_type)}</View>
                    <Text style={styles.recordTitle}>{item.title}</Text>
                  </View>
                  <View style={styles.dateRow}>
                    <Calendar size={13} color={Colors.textMuted} style={{ marginRight: 4 }} />
                    <Text style={styles.recordDate}>{item.record_date}</Text>
                  </View>
                </View>

                {item.amount ? (
                  <Badge label={`₹${Number(item.amount).toLocaleString('en-IN')}`} variant="accent" />
                ) : (
                  <Badge label={item.record_type} variant="info" />
                )}
              </View>

              {item.content ? (
                <Text style={styles.recordContent}>{item.content}</Text>
              ) : null}

              <View style={styles.cardActions}>
                <View style={styles.securityTag}>
                  <Lock size={12} color={Colors.accentDark} style={{ marginRight: 4 }} />
                  <Text style={styles.securityTagText}>Owner: You (ID: {item.user_id})</Text>
                </View>

                <View style={styles.actionBtnsRow}>
                  {/* PDF Download Button per record */}
                  <TouchableOpacity
                    style={[styles.actionIconBtn, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1 }]}
                    onPress={() => exportRecordToPdf(item, user)}
                  >
                    <FileDown size={14} color={Colors.primary} style={{ marginRight: 4 }} />
                    <Text style={[styles.actionBtnText, { color: Colors.primary }]}>PDF</Text>
                  </TouchableOpacity>

                  {/* Edit */}
                  <TouchableOpacity
                    style={[styles.actionIconBtn, { marginLeft: 6 }]}
                    onPress={() => {
                      setEditingRecord(item);
                      setModalVisible(true);
                    }}
                  >
                    <Edit3 size={14} color={Colors.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={styles.actionBtnText}>એડિટ</Text>
                  </TouchableOpacity>

                  {/* Delete */}
                  <TouchableOpacity
                    style={[styles.actionIconBtn, { marginLeft: 6 }]}
                    onPress={() => handleDeleteRecord(item.id)}
                  >
                    <Trash2 size={14} color={Colors.danger} style={{ marginRight: 4 }} />
                    <Text style={[styles.actionBtnText, { color: Colors.danger }]}>ડિલીટ</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Add / Edit Modal */}
      <AddRecordModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingRecord(null);
        }}
        onSubmit={handleSaveRecord}
        editingRecord={editingRecord}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  addTopBtn: {
    backgroundColor: Colors.accentDark,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.accentDark,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  addTopBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  subBar: {
    backgroundColor: Colors.surface,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  tabScroll: {
    marginTop: 10,
    paddingHorizontal: 16,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: Colors.surfaceSecondary,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabItemActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.textLight,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },
  expenseSummaryCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 14,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expenseLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  expenseValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.accentDark,
    marginTop: 2,
  },
  pdfExportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  pdfExportText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  recordCard: {
    marginBottom: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleArea: {
    flex: 1,
    marginRight: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 40,
  },
  recordDate: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  recordContent: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 10,
    lineHeight: 20,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  securityTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityTagText: {
    fontSize: 11,
    color: Colors.accentDark,
    fontWeight: '700',
  },
  actionBtnsRow: {
    flexDirection: 'row',
  },
  actionIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 28,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
});
