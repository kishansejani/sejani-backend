import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Linking,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Search,
  Phone,
  Droplet,
  Briefcase,
  MapPin,
  X,
  Users,
  Shield,
  Calendar,
  Plus,
  Lock,
  Trash2,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import api from '../../api/client';
import { FamilyMember } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export const FamilyDirectoryScreen: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [familyName, setFamilyName] = useState<string>('મારો પરિવાર');
  const [familyCode, setFamilyCode] = useState<string>('FAMILY2026');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  // Add Member State
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberPassword, setNewMemberPassword] = useState('123456');
  const [newMemberRelation, setNewMemberRelation] = useState('સભ્ય');
  const [savingMember, setSavingMember] = useState(false);

  const rolePresets = [
    { key: 'સભ્ય', label: 'સભ્ય (Member)' },
    { key: 'પિતા', label: 'પિતા (Father)' },
    { key: 'માતા', label: 'માતા (Mother)' },
    { key: 'પુત્ર', label: 'પુત્ર (Son)' },
    { key: 'પુત્રી', label: 'પુત્રી (Daughter)' },
    { key: 'કાકા', label: 'કાકા (Uncle)' },
    { key: 'કાકી', label: 'કાકી (Aunt)' },
    { key: 'ભાઈ', label: 'ભાઈ (Brother)' },
    { key: 'બહેન', label: 'બહેન (Sister)' },
    { key: 'દાદા', label: 'દાદા (Grandfather)' },
    { key: 'દાદી', label: 'દાદી (Grandmother)' },
  ];

  useEffect(() => {
    fetchFamily();
  }, []);

  const fetchFamily = async () => {
    try {
      const res = await api.get('/family');
      if (res.data?.family) {
        setFamilyName(res.data.family.name_gu);
        setFamilyCode(res.data.family.family_code);
      }
      if (res.data?.members) {
        setMembers(res.data.members);
      }
    } catch (err: any) {
      console.warn('Family fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFamily();
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert(language === 'gu' ? 'કૉલ' : 'Call', `${language === 'gu' ? 'મોબાઈલ નંબર' : 'Phone'}: ${phone}`);
    });
  };

  const handleAddMember = async () => {
    if (!newMemberName.trim() || !newMemberPhone.trim()) {
      Alert.alert(
        t('attention', 'ધ્યાન આપો'),
        language === 'gu' ? 'કૃપા કરીને સભ્યનું નામ અને ૧૦ આંકડાનો મોબાઈલ નંબર દાખલ કરો.' : 'Please enter member name and 10-digit mobile number.'
      );
      return;
    }

    setSavingMember(true);
    try {
      const res = await api.post('/family/add-member', {
        name: newMemberName.trim(),
        phone: newMemberPhone.trim(),
        password: newMemberPassword.trim() || '123456',
        relation_title_gu: newMemberRelation.trim() || 'સભ્ય',
      });
      Alert.alert(t('success', 'સફળ'), res.data?.message || (language === 'gu' ? 'નવા સભ્ય પરિવારમાં ઉમેરાઈ ગયા!' : 'Member added to family!'));
      setAddModalVisible(false);
      setNewMemberName('');
      setNewMemberPhone('');
      setNewMemberPassword('123456');
      setNewMemberRelation('સભ્ય');
      fetchFamily();
    } catch (err: any) {
      Alert.alert(t('error', 'ભૂલ'), err.response?.data?.message || (language === 'gu' ? 'સભ્ય ઉમેરવામાં ભૂલ આવી.' : 'Failed to add member.'));
    } finally {
      setSavingMember(false);
    }
  };

  const handleDeleteMember = async (memberId: number, memberName: string) => {
    const title = language === 'gu' ? 'સભ્ય રદ કરો' : 'Remove Member';
    const message = language === 'gu'
      ? `શું તમે ખરેખર ${memberName} ને પરિવારમાંથી દૂર કરવા માંગો છો?`
      : `Are you sure you want to remove ${memberName} from the family?`;

    const executeDelete = async () => {
      try {
        const res = await api.delete(`/family/members/${memberId}`);
        fetchFamily();
        Alert.alert(t('success', 'સફળ'), res.data?.message || (language === 'gu' ? 'સભ્ય પરિવારમાંથી રદ થયો.' : 'Member removed from family.'));
      } catch (err: any) {
        Alert.alert(t('error', 'ભૂલ'), err.response?.data?.message || (language === 'gu' ? 'ડિલીટ કરવામાં ભૂલ આવી.' : 'Failed to delete member.'));
      }
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(message)) {
        executeDelete();
      }
    } else {
      Alert.alert(
        title,
        message,
        [
          { text: language === 'gu' ? 'ના / રદ કરો' : 'Cancel', style: 'cancel' },
          { text: language === 'gu' ? 'હા, દૂર કરો' : 'Remove', style: 'destructive', onPress: executeDelete },
        ]
      );
    }
  };

  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase();
    const name = (m.profile?.full_name_gu || m.name || '').toLowerCase();
    const relation = (m.relation_title_gu || '').toLowerCase();
    const blood = (m.profile?.blood_group || '').toLowerCase();
    return name.includes(q) || relation.includes(q) || blood.includes(q);
  });

  return (
    <View style={styles.container}>
      <Header
        title={t('familyDirectory', 'પરિવાર ડિરેક્ટરી')}
        subtitle={`${familyName} • ${members.length} ${language === 'gu' ? 'સભ્યો' : 'Members'}`}
        rightAction={
          <TouchableOpacity
            style={styles.addMemberHeaderBtn}
            onPress={() => setAddModalVisible(true)}
            activeOpacity={0.8}
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={2.5} style={{ marginRight: 4 }} />
            <Text style={styles.addMemberHeaderBtnText}>
              {language === 'gu' ? '+ સભ્ય ઉમેરો' : '+ Add Member'}
            </Text>
          </TouchableOpacity>
        }
      />

      {/* Search & Stats Bar */}
      <View style={styles.subBar}>
        <View style={styles.familyCodeBanner}>
          <Text style={styles.codeText}>{t('familyCode', 'ફેમિલી કોડ:')} <Text style={{ fontWeight: '900', color: Colors.accentDark }}>{familyCode}</Text></Text>
          <Badge label={`${t('totalMembers', 'કુલ સભ્યો')}: ${members.length}`} variant="accent" />
        </View>

        <View style={styles.searchBox}>
          <Search size={18} color={Colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchFamilyPlaceholder', 'નામ, સંબંધ કે બ્લડ ગ્રૂપથી શોધો...')}
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginVertical: 30 }} />
        ) : filteredMembers.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Users size={40} color={Colors.textMuted} style={{ marginBottom: 8 }} />
            <Text style={styles.emptyTitle}>{language === 'gu' ? 'કોઈ સભ્ય મળ્યા નહીં' : 'No members found'}</Text>
            <Text style={styles.emptyDesc}>
              {language === 'gu' ? 'ઉપર "+ સભ્ય ઉમેરો" બટન દબાવીને તમારા પરિવારના સભ્યોને ઉમેરો.' : 'Tap "+ Add Member" above to invite family members.'}
            </Text>
          </Card>
        ) : (
          filteredMembers.map((member) => (
            <Card
              key={member.id}
              variant="default"
              style={styles.memberCard}
              onPress={() => setSelectedMember(member)}
            >
              <View style={styles.cardRow}>
                {/* Avatar */}
                <Image
                  source={{
                    uri:
                      member.profile?.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=1E3A8A&color=F59E0B`,
                  }}
                  style={styles.avatar}
                />

                {/* Member Details */}
                <View style={styles.memberInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.memberName}>
                      {member.profile?.full_name_gu || member.name}
                    </Text>
                    {member.is_admin ? (
                      <Badge label={language === 'gu' ? 'મોભી' : 'Admin'} variant="accent" style={{ marginLeft: 6 }} />
                    ) : null}
                  </View>

                  <Text style={styles.relationTitle}>
                    {member.relation_title_gu || t('roleMember', 'સભ્ય')}
                  </Text>

                  <View style={styles.metaRow}>
                    {member.profile?.blood_group ? (
                      <View style={styles.bloodChip}>
                        <Droplet size={11} color={Colors.danger} style={{ marginRight: 2 }} />
                        <Text style={styles.bloodText}>{member.profile.blood_group}</Text>
                      </View>
                    ) : null}
                    {member.profile?.occupation_gu ? (
                      <View style={styles.occRow}>
                        <Briefcase size={12} color={Colors.textSecondary} style={{ marginRight: 4 }} />
                        <Text style={styles.occupationText} numberOfLines={1}>
                          {member.profile.occupation_gu}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                {/* Actions: Call & Delete */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    style={styles.callBtn}
                    onPress={() => handleCall(member.phone)}
                    activeOpacity={0.7}
                  >
                    <Phone size={18} color={Colors.success} />
                  </TouchableOpacity>

                  {member.user_id !== user?.id && (
                    <TouchableOpacity
                      style={[styles.callBtn, { backgroundColor: '#FEF2F2', borderColor: '#FECACA', borderWidth: 1, marginLeft: 8 }]}
                      onPress={() => handleDeleteMember(member.id, member.profile?.full_name_gu || member.name)}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={16} color={Colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* ADD MEMBER MODAL */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeading}>
                {language === 'gu' ? '👨‍👩‍👧‍👦 પરિવારનો નવો સભ્ય ઉમેરો' : '👨‍👩‍👧‍👦 Add Family Member'}
              </Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>
                {language === 'gu' ? 'સભ્યનું પૂરું નામ *' : 'Full Name *'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={language === 'gu' ? 'દા.ત. રમેશભાઈ પટેલ' : 'e.g. Ramesh Patel'}
                placeholderTextColor={Colors.textMuted}
                value={newMemberName}
                onChangeText={setNewMemberName}
              />

              <Text style={styles.inputLabel}>
                {language === 'gu' ? 'સંબંધ / રોલ પસંદ કરો:' : 'Select Relation/Role:'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {rolePresets.map((r) => {
                  const isSelected = newMemberRelation === r.key;
                  return (
                    <TouchableOpacity
                      key={r.key}
                      style={[styles.roleChip, isSelected && styles.roleChipActive]}
                      onPress={() => setNewMemberRelation(r.key)}
                    >
                      <Text style={[styles.roleChipText, isSelected && styles.roleChipTextActive]}>
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.inputLabel}>
                {language === 'gu' ? 'મોબાઈલ નંબર (લૉગિન માટે) *' : 'Mobile Number (For Login) *'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="9876543210"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
                value={newMemberPhone}
                onChangeText={setNewMemberPhone}
              />

              <Text style={styles.inputLabel}>
                {language === 'gu' ? 'લૉગિન પાસવર્ડ (Default: 123456)' : 'Login Password (Default: 123456)'}
              </Text>
              <TextInput
                style={styles.input}
                placeholder="123456"
                placeholderTextColor={Colors.textMuted}
                value={newMemberPassword}
                onChangeText={setNewMemberPassword}
              />

              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  💡 {language === 'gu' ? 'આ સભ્ય ઉમેર્યા પછી, તેઓ પોતાના ફોનમાં આ મોબાઈલ નંબર અને પાસવર્ડ વડે સીધા જ લૉગિન કરી શકશે.' : 'Once added, this member can immediately log in from their own phone using this mobile number & password.'}
                </Text>
              </View>

              <View style={styles.modalFooter}>
                <Button
                  title={t('cancel', 'રદ કરો')}
                  variant="outline"
                  onPress={() => setAddModalVisible(false)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title={language === 'gu' ? 'સભ્ય ઉમેરો' : 'Add Member'}
                  variant="primary"
                  loading={savingMember}
                  onPress={handleAddMember}
                  style={{ flex: 2 }}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Member Details Modal */}
      <Modal
        visible={!!selectedMember}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedMember(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedMember && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalHeading}>{t('memberDetailModalTitle', 'સભ્યની સંપૂર્ણ વિગત')}</Text>
                  <TouchableOpacity
                    onPress={() => setSelectedMember(null)}
                    style={styles.closeBtn}
                  >
                    <X size={20} color={Colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                  <View style={styles.modalAvatarSection}>
                    <Image
                      source={{
                        uri:
                          selectedMember.profile?.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMember.name)}&background=1E3A8A&color=F59E0B&size=180`,
                      }}
                      style={styles.modalAvatar}
                    />
                    <Text style={styles.modalName}>
                      {selectedMember.profile?.full_name_gu || selectedMember.name}
                    </Text>
                    <Badge
                      label={selectedMember.relation_title_gu || t('roleMember', 'સભ્ય')}
                      variant="primary"
                      style={{ marginTop: 6 }}
                    />
                  </View>

                  <View style={styles.detailsGrid}>
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>{t('mobileNumber', 'મોબાઈલ નંબર')}</Text>
                      <Text style={styles.detailValue}>{selectedMember.phone}</Text>
                    </View>

                    {selectedMember.profile?.blood_group ? (
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>{t('bloodGroup', 'બ્લડ ગ્રૂપ')}</Text>
                        <Text style={[styles.detailValue, { color: Colors.danger, fontWeight: '800' }]}>
                          🩸 {selectedMember.profile.blood_group}
                        </Text>
                      </View>
                    ) : null}

                    {selectedMember.profile?.occupation_gu ? (
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>{t('occupation', 'વ્યવસાય')}</Text>
                        <Text style={styles.detailValue}>{selectedMember.profile.occupation_gu}</Text>
                      </View>
                    ) : null}

                    {selectedMember.profile?.current_city_gu ? (
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>{t('city', 'શહેર')}</Text>
                        <Text style={styles.detailValue}>{selectedMember.profile.current_city_gu}</Text>
                      </View>
                    ) : null}

                    {selectedMember.profile?.native_village_gu ? (
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>{t('nativeVillage', 'વતન ગામ')}</Text>
                        <Text style={styles.detailValue}>{selectedMember.profile.native_village_gu}</Text>
                      </View>
                    ) : null}

                    {selectedMember.profile?.birth_date ? (
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>{t('birthDate', 'જન્મ તારીખ')}</Text>
                        <Text style={styles.detailValue}>{selectedMember.profile.birth_date}</Text>
                      </View>
                    ) : null}
                  </View>

                  <Button
                    title={`${language === 'gu' ? 'કૉલ કરો' : 'Call'} (${selectedMember.phone})`}
                    variant="primary"
                    onPress={() => handleCall(selectedMember.phone)}
                    style={{ marginTop: 14 }}
                  />

                  {selectedMember.user_id !== user?.id && (
                    <Button
                      title={language === 'gu' ? '🗑️ પરિવારમાંથી રદ કરો' : '🗑️ Remove from Family'}
                      variant="danger"
                      onPress={() => {
                        const targetId = selectedMember.id;
                        const targetName = selectedMember.profile?.full_name_gu || selectedMember.name;
                        setSelectedMember(null);
                        handleDeleteMember(targetId, targetName);
                      }}
                      style={{ marginTop: 10 }}
                    />
                  )}
                </ScrollView>
              </>
            )}
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
  addMemberHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addMemberHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  subBar: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  familyCodeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  scroll: {
    padding: 16,
    paddingBottom: 100,
  },
  memberCard: {
    marginBottom: 10,
    padding: 14,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: Colors.accent,
    marginRight: 14,
  },
  memberInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  relationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  bloodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dangerLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
  },
  bloodText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.danger,
  },
  occRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  occupationText: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
  },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  emptyCard: {
    alignItems: 'center',
    padding: 28,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
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
    maxHeight: '88%',
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
  closeBtn: {
    padding: 6,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
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
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  roleChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  roleChipTextActive: {
    color: '#FFFFFF',
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  infoText: {
    fontSize: 12,
    color: Colors.primaryDark,
    lineHeight: 18,
  },
  modalFooter: {
    flexDirection: 'row',
    marginTop: 16,
    paddingBottom: 16,
  },
  modalAvatarSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.accent,
    marginBottom: 10,
  },
  modalName: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    backgroundColor: Colors.surfaceSecondary,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
