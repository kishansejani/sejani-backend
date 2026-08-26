import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  ShieldCheck,
  Users,
  Plus,
  FileText,
  DollarSign,
  Calendar,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Clock,
  BookOpen,
  Bell,
  Sprout,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { AddRecordModal } from '../../components/AddRecordModal';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api/client';
import { PersonalRecord } from '../../types';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [familyCount, setFamilyCount] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [recordsRes, familyRes] = await Promise.all([
        api.get('/personal-records?per_page=5'),
        api.get('/family'),
      ]);

      if (recordsRes.data?.data) {
        setRecords(recordsRes.data.data);
      }
      if (familyRes.data?.family?.total_members) {
        setFamilyCount(familyRes.data.family.total_members);
      } else if (familyRes.data?.members?.length) {
        setFamilyCount(familyRes.data.members.length);
      }
    } catch (err: any) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddRecord = async (data: Partial<PersonalRecord>) => {
    try {
      const res = await api.post('/personal-records', data);
      if (res.data?.record) {
        Alert.alert('સફળ', 'તમારી અંગત નોંધ સુરક્ષિત રીતે ઉમેરાઈ ગઈ.');
        fetchDashboardData();
        return true;
      }
      return false;
    } catch (err: any) {
      Alert.alert('ભૂલ', err.response?.data?.message || 'નોંધ સેવ કરવામાં ભૂલ આવી.');
      return false;
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

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
        title={`${t('greeting', 'જય શ્રી કૃષ્ણ')}, ${(user?.profile?.full_name_gu || user?.name || (language === 'gu' ? 'સભ્ય' : 'Member')).split(' ')[0]}`}
        subtitle={language === 'gu' ? 'PersonalInfo • સુરક્ષિત પારિવારિક પોર્ટલ' : 'PersonalInfo • Secure Family Portal'}
        onProfilePress={() => navigation.navigate('Profile')}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Royal Panchang & Tithi Banner */}
        <Card variant="dark" style={styles.panchangCard}>
          <View style={styles.panchangRow}>
            <View style={styles.panchangLeft}>
              <View style={styles.panchangHeaderRow}>
                <Sparkles size={16} color={Colors.accent} style={{ marginRight: 6 }} />
                <Text style={styles.panchangTitle}>
                  {language === 'gu' ? 'વિક્રમ સંવત ૨૦૮૨ • ભાદરવો' : 'Vikram Samvat 2082 • Daily Panchang'}
                </Text>
              </View>
              <Text style={styles.panchangSub}>
                {language === 'gu' ? 'શુભ ચોઘડિયું • અમૃત / શુભ વેળા' : 'Auspicious Time • Amrit / Shubh Bela'}
              </Text>
            </View>
            <View style={styles.goldBadge}>
              <Text style={styles.goldBadgeText}>{language === 'gu' ? 'શ્રી રામ' : 'Shree Ram'}</Text>
            </View>
          </View>
        </Card>

        {/* Quick Stats Grid */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statBox}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('PersonalVault')}
          >
            <View style={[styles.statIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <ShieldCheck size={20} color={Colors.primary} />
            </View>
            <Text style={styles.statNumber}>{records.length}</Text>
            <Text style={styles.statLabel}>{language === 'gu' ? 'મારી ખાનગી નોંધો' : 'My Private Vault'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statBox}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('FamilyDirectory')}
          >
            <View style={[styles.statIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Users size={20} color={Colors.accentDark} />
            </View>
            <Text style={styles.statNumber}>{familyCount}</Text>
            <Text style={styles.statLabel}>{language === 'gu' ? 'પરિવાર સભ્યો' : 'Family Members'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statBox}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('PersonalVault')}
          >
            <View style={[styles.statIconCircle, { backgroundColor: '#ECFDF5' }]}>
              <TrendingUp size={20} color={Colors.success} />
            </View>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>{language === 'gu' ? 'પ્રાઈવેટ સિક્યોર' : 'Private Secure'}</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Action Bar */}
        <View style={styles.actionHeader}>
          <Text style={styles.sectionTitle}>{language === 'gu' ? 'ઝડપી સેવાઓ (Quick Actions)' : 'Quick Actions'}</Text>
        </View>

        <View style={styles.quickActionGrid}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Farming')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBg, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
              <Sprout size={24} color="#059669" />
            </View>
            <Text style={[styles.actionLabel, { color: '#065F46', fontWeight: '800' }]}>
              {language === 'gu' ? 'ખેતી & કેલ્ક્યુલેટર' : 'Farming & Calc'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBg, { backgroundColor: Colors.primarySoft }]}>
              <Plus size={22} color={Colors.primary} strokeWidth={2.5} />
            </View>
            <Text style={styles.actionLabel}>{language === 'gu' ? 'નવી નોંધ' : 'Add Note'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('FamilyDirectory')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBg, { backgroundColor: '#FEF3C7' }]}>
              <Users size={22} color={Colors.accentDark} />
            </View>
            <Text style={styles.actionLabel}>{language === 'gu' ? 'ડિરેક્ટરી' : 'Directory'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('PersonalVault')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconBg, { backgroundColor: '#EFF6FF' }]}>
              <DollarSign size={22} color={Colors.primaryLight} />
            </View>
            <Text style={styles.actionLabel}>{language === 'gu' ? 'ખર્ચ હિસાબ' : 'Expenses'}</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Private Records Section */}
        <View style={styles.recentHeader}>
          <View>
            <Text style={styles.sectionTitle}>{language === 'gu' ? 'મારી તાજી અંગત નોંધો' : 'Recent Private Vault'}</Text>
            <Text style={styles.sectionSub}>
              {language === 'gu' ? 'ફક્ત તમારા માટે જ સુરક્ષિત (Isolated)' : 'Strictly isolated for your eyes only'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.viewAllBtn}
            onPress={() => navigation.navigate('PersonalVault')}
          >
            <Text style={styles.viewAllText}>{language === 'gu' ? 'બધું જુઓ' : 'View All'}</Text>
            <ChevronRight size={16} color={Colors.primaryLight} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginVertical: 30 }} />
        ) : records.length === 0 ? (
          <Card style={styles.emptyCard}>
            <FileText size={40} color={Colors.textMuted} style={{ marginBottom: 8 }} />
            <Text style={styles.emptyTitle}>{language === 'gu' ? 'હજી કોઈ અંગત નોંધ નથી' : 'No vault records yet'}</Text>
            <Text style={styles.emptyDesc}>{language === 'gu' ? 'તમારી પ્રથમ ખાનગી નોંધ અથવા હિસાબ ઉમેરવા નીચે બટન દબાવો.' : 'Press the button below to add your first private record.'}</Text>
            <Button
              title={t('addRecord', '+ નવી નોંધ ઉમેરો')}
              variant="primary"
              onPress={() => setModalVisible(true)}
              style={{ marginTop: 12 }}
            />
          </Card>
        ) : (
          records.map((item) => (
            <Card
              key={item.id}
              variant="gold"
              style={styles.recordCard}
              onPress={() => navigation.navigate('PersonalVault')}
            >
              <View style={styles.recordTop}>
                <View style={styles.recordTitleRow}>
                  <View style={styles.iconCircle}>{getRecordIcon(item.record_type)}</View>
                  <Text style={styles.recordTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                </View>
                {item.amount ? (
                  <Badge label={`₹${Number(item.amount).toLocaleString('en-IN')}`} variant="accent" />
                ) : (
                  <Badge label={item.category || 'નોંધ'} variant="primary" />
                )}
              </View>

              {item.content ? (
                <Text style={styles.recordContent} numberOfLines={2}>
                  {item.content}
                </Text>
              ) : null}

              <View style={styles.recordFooter}>
                <View style={styles.dateRow}>
                  <Clock size={12} color={Colors.textMuted} style={{ marginRight: 4 }} />
                  <Text style={styles.recordDate}>{item.record_date}</Text>
                </View>
                <Text style={styles.ownershipBadge}>🔒 My Private Record</Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Add Record Modal */}
      <AddRecordModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddRecord}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  panchangCard: {
    backgroundColor: Colors.darkSurface,
    padding: 16,
    borderRadius: 18,
    marginBottom: 16,
    borderColor: '#334155',
  },
  panchangRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panchangLeft: {
    flex: 1,
    marginRight: 10,
    flexShrink: 1,
  },
  panchangHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  panchangTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
  },
  panchangSub: {
    color: Colors.accent,
    fontSize: 12,
    marginTop: 3,
    fontWeight: '600',
  },
  goldBadge: {
    backgroundColor: Colors.accentDark,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  goldBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
    fontWeight: '600',
  },
  actionHeader: {
    marginTop: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  quickActionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  actionIconBg: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: Colors.primaryLight,
    fontSize: 13,
    fontWeight: '700',
    marginRight: 2,
  },
  recordCard: {
    padding: 14,
    marginBottom: 10,
  },
  recordTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  recordTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    flex: 1,
  },
  recordContent: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
    marginLeft: 38,
    lineHeight: 18,
  },
  recordFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordDate: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  ownershipBadge: {
    fontSize: 11,
    color: Colors.accentDark,
    fontWeight: '700',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
