import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import {
  User,
  ShieldCheck,
  Key,
  LogOut,
  Edit3,
  Phone,
  Droplet,
  Briefcase,
  Lock,
  X,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react-native';
import api from '../../api/client';

export const ProfileScreen: React.FC = () => {
  const { user, logout, updateProfileState, refreshUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  // Edit Profile States
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [fullNameGu, setFullNameGu] = useState(user?.profile?.full_name_gu || user?.name || '');
  const [bloodGroup, setBloodGroup] = useState(user?.profile?.blood_group || '');
  const [occupationGu, setOccupationGu] = useState(user?.profile?.occupation_gu || '');
  const [emergencyContact, setEmergencyContact] = useState(user?.profile?.emergency_contact || '');
  const [bioGu, setBioGu] = useState(user?.profile?.bio_gu || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password States
  const [pwdModalVisible, setPwdModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPwd, setSavingPwd] = useState(false);

  const handleUpdateProfile = async () => {
    if (!fullNameGu.trim()) {
      Alert.alert('ધ્યાન આપો', 'કૃપા કરીને પૂરું નામ દાખલ કરો.');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await api.post('/profile', {
        full_name_gu: fullNameGu.trim(),
        blood_group: bloodGroup.trim(),
        occupation_gu: occupationGu.trim(),
        emergency_contact: emergencyContact.trim(),
        bio_gu: bioGu.trim(),
      });

      if (res.data?.user) {
        updateProfileState(res.data.user);
        Alert.alert('સફળ', 'તમારી પ્રોફાઇલ સફળતાપૂર્વક અપડેટ થઈ.');
        setEditModalVisible(false);
      }
    } catch (err: any) {
      Alert.alert('ભૂલ', err.response?.data?.message || 'પ્રોફાઇલ અપડેટ કરવામાં ભૂલ આવી.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('ધ્યાન આપો', 'બધા ફીલ્ડ્સ ભરવા જરૂરી છે.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('ધ્યાન આપો', 'નવો પાસવર્ડ અને કન્ફર્મ પાસવર્ડ સરખા નથી.');
      return;
    }

    setSavingPwd(true);
    try {
      const res = await api.post('/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      Alert.alert('સફળ', res.data?.message || 'પાસવર્ડ બદલાઈ ગયો છે.');
      setPwdModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      Alert.alert('ભૂલ', err.response?.data?.message || 'પાસવર્ડ બદલવામાં ભૂલ આવી.');
    } finally {
      setSavingPwd(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'લૉગ આઉટ',
      'શું તમે ખરેખર લૉગ આઉટ કરવા માંગો છો?',
      [
        { text: 'ના (Cancel)', style: 'cancel' },
        {
          text: 'હા, લૉગ આઉટ',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="મારી પ્રોફાઇલ & સેટિંગ્સ"
        subtitle="સુરક્ષિત એકાઉન્ટ માહિતી"
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <Card variant="gold" style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <Image
              source={{
                uri:
                  user?.profile?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=1E3A8A&color=F59E0B&size=160`,
              }}
              style={styles.avatar}
            />
            <View style={styles.avatarInfo}>
              <Text style={styles.userName}>{user?.profile?.full_name_gu || user?.name}</Text>
              <Text style={styles.userPhone}>📱 {user?.phone}</Text>
              <View style={styles.badgeRow}>
                <Badge
                  label={user?.family?.relation_title_gu || 'સભ્ય'}
                  variant="primary"
                  style={{ marginRight: 6 }}
                />
                {user?.role === 'head' || user?.role === 'admin' ? (
                  <Badge label="પરિવાર એડમિન" variant="accent" />
                ) : null}
              </View>
            </View>
          </View>

          <Button
            title={t('editProfile', 'પ્રોફાઇલ વિગતો સુધારો')}
            variant="outline"
            icon={<Edit3 size={16} color={Colors.primary} />}
            onPress={() => {
              setFullNameGu(user?.profile?.full_name_gu || user?.name || '');
              setBloodGroup(user?.profile?.blood_group || '');
              setOccupationGu(user?.profile?.occupation_gu || '');
              setEmergencyContact(user?.profile?.emergency_contact || '');
              setBioGu(user?.profile?.bio_gu || '');
              setEditModalVisible(true);
            }}
            style={{ marginTop: 14, height: 44 }}
          />
        </Card>

        {/* Language Selection Card */}
        <Text style={styles.sectionHeader}>{t('selectLanguage', 'ભાષા પસંદ કરો (Language)')}</Text>
        <Card style={styles.langCard}>
          <View style={styles.langRow}>
            <TouchableOpacity
              style={[styles.langChip, language === 'gu' && styles.langChipActive]}
              onPress={() => setLanguage('gu')}
              activeOpacity={0.8}
            >
              <Text style={[styles.langChipText, language === 'gu' && styles.langChipTextActive]}>
                🇬🇯 ગુજરાતી {language === 'gu' ? '✓' : ''}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.langChip, language === 'en' && styles.langChipActive]}
              onPress={() => setLanguage('en')}
              activeOpacity={0.8}
            >
              <Text style={[styles.langChipText, language === 'en' && styles.langChipTextActive]}>
                🇬🇧 English {language === 'en' ? '✓' : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Detailed Info Section */}
        <Text style={styles.sectionHeader}>{t('personalDetails', 'પર્સનલ વિગતો')}</Text>
        <Card style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconLabel}>
              <Droplet size={16} color={Colors.danger} style={{ marginRight: 8 }} />
              <Text style={styles.infoLabel}>બ્લડ ગ્રૂપ</Text>
            </View>
            <Text style={[styles.infoValue, { color: Colors.danger }]}>
              {user?.profile?.blood_group || 'ઉમેરેલ નથી'}
            </Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconLabel}>
              <Briefcase size={16} color={Colors.textSecondary} style={{ marginRight: 8 }} />
              <Text style={styles.infoLabel}>વ્યવસાય / કામગીરી</Text>
            </View>
            <Text style={styles.infoValue}>
              {user?.profile?.occupation_gu || 'ઉમેરેલ નથી'}
            </Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIconLabel}>
              <Phone size={16} color={Colors.primaryLight} style={{ marginRight: 8 }} />
              <Text style={styles.infoLabel}>ઇમરજન્સી સંપર્ક</Text>
            </View>
            <Text style={styles.infoValue}>
              {user?.profile?.emergency_contact || '9825000001'}
            </Text>
          </View>
        </Card>

        {/* Security & System Information */}
        <Text style={styles.sectionHeader}>સુરક્ષા & ડેટા પ્રાઈવસી (Architecture Status)</Text>
        <Card variant="dark" style={styles.securityCard}>
          <View style={styles.secItem}>
            <ShieldCheck size={24} color={Colors.accent} style={{ marginRight: 10, marginTop: 2 }} />
            <View style={styles.secInfo}>
              <Text style={styles.secTitle}>Laravel Sanctum Token Encryption</Text>
              <Text style={styles.secDesc}>તમારું ટોકન મોબાઈલના હાર્ડવેર સ્ટોરેજમાં સિક્યોર છે.</Text>
            </View>
          </View>

          <View style={styles.secItem}>
            <Lock size={22} color="#93C5FD" style={{ marginRight: 10, marginTop: 2 }} />
            <View style={styles.secInfo}>
              <Text style={styles.secTitle}>Strict 403 Forbidden Authorization</Text>
              <Text style={styles.secDesc}>User ID: {user?.id} સિવાય કોઈ અન્ય સભ્યનો ડેટા એક્સેસ થઈ શકતો નથી.</Text>
            </View>
          </View>

          <Button
            title="પાસવર્ડ બદલો (Change Password)"
            variant="accent"
            icon={<Key size={16} color="#FFFFFF" />}
            onPress={() => setPwdModalVisible(true)}
            style={{ marginTop: 8 }}
          />
        </Card>

        {/* Logout Button */}
        <Button
          title="લૉગ આઉટ (Sign Out)"
          variant="danger"
          icon={<LogOut size={18} color="#FFFFFF" />}
          onPress={handleLogout}
          style={styles.logoutBtn}
        />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>પ્રોફાઇલ વિગતો સુધારો</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>પૂરું નામ (ગુજરાતીમાં) *</Text>
              <TextInput
                style={styles.input}
                value={fullNameGu}
                onChangeText={setFullNameGu}
              />

              <Text style={styles.inputLabel}>બ્લડ ગ્રૂપ (Blood Group)</Text>
              <TextInput
                style={styles.input}
                placeholder="દા.ત. B+, O+, AB+"
                placeholderTextColor={Colors.textMuted}
                value={bloodGroup}
                onChangeText={setBloodGroup}
              />

              <Text style={styles.inputLabel}>વ્યવસાય / કામગીરી</Text>
              <TextInput
                style={styles.input}
                placeholder="દા.ત. સોફ્ટવેર એન્જિનિયર, બિઝનેસ..."
                placeholderTextColor={Colors.textMuted}
                value={occupationGu}
                onChangeText={setOccupationGu}
              />

              <Text style={styles.inputLabel}>ઇમરજન્સી સંપર્ક નંબર</Text>
              <TextInput
                style={styles.input}
                placeholder="મોબાઈલ નંબર"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
                value={emergencyContact}
                onChangeText={setEmergencyContact}
              />

              <Text style={styles.inputLabel}>પરિચય (Bio)</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                placeholder="તમારા વિશે થોડી માહિતી..."
                placeholderTextColor={Colors.textMuted}
                multiline
                value={bioGu}
                onChangeText={setBioGu}
              />

              <View style={styles.modalFooter}>
                <Button
                  title="રદ કરો"
                  variant="outline"
                  onPress={() => setEditModalVisible(false)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title="સાચવો"
                  variant="primary"
                  loading={savingProfile}
                  onPress={handleUpdateProfile}
                  style={{ flex: 2 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal visible={pwdModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>પાસવર્ડ બદલો</Text>
              <TouchableOpacity onPress={() => setPwdModalVisible(false)}>
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>હાલનો પાસવર્ડ (Current Password) *</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholder="હાલનો પાસવર્ડ દાખલ કરો"
                placeholderTextColor={Colors.textMuted}
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />

              <Text style={styles.inputLabel}>નવો પાસવર્ડ (New Password) *</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholder="ઓછામાં ઓછો ૬ અક્ષરનો પાસવર્ડ"
                placeholderTextColor={Colors.textMuted}
                value={newPassword}
                onChangeText={setNewPassword}
              />

              <Text style={styles.inputLabel}>નવો પાસવર્ડ ફરી દાખલ કરો (Confirm) *</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholder="નવો પાસવર્ડ કન્ફર્મ કરો"
                placeholderTextColor={Colors.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              <View style={styles.modalFooter}>
                <Button
                  title="રદ કરો"
                  variant="outline"
                  onPress={() => setPwdModalVisible(false)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title="પાસવર્ડ બદલો"
                  variant="primary"
                  loading={savingPwd}
                  onPress={handleChangePassword}
                  style={{ flex: 2 }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  profileCard: {
    padding: 18,
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  avatarInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  userPhone: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  langCard: {
    marginHorizontal: 20,
    padding: 12,
  },
  langRow: {
    flexDirection: 'row',
    gap: 10,
  },
  langChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
    elevation: 3,
    shadowColor: Colors.shadowColor,
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  langChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  langChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  infoCard: {
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoIconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  securityCard: {
    padding: 16,
    marginBottom: 18,
  },
  secItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  secInfo: {
    flex: 1,
  },
  secTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  secDesc: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  logoutBtn: {
    marginTop: 8,
    height: 52,
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
    maxHeight: '85%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalFooter: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 20,
  },
});
