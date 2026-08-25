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
  Image,
  Modal,
  Linking,
  Alert,
} from 'react-native';
import {
  Search,
  Phone,
  Droplet,
  Briefcase,
  Calendar,
  X,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import api from '../../api/client';
import { FamilyMember } from '../../types';

import { useLanguage } from '../../context/LanguageContext';

export const FamilyDirectoryScreen: React.FC = () => {
  const { language, t } = useLanguage();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [familyName, setFamilyName] = useState<string>('મારો પરિવાર');
  const [familyCode, setFamilyCode] = useState<string>('FAMILY2026');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

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
            <Text style={styles.emptyDesc}>{language === 'gu' ? 'શોધ શબ્દ બદલીને ફરી પ્રયાસ કરો.' : 'Try changing search query.'}</Text>
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
                      <Badge label={language === 'gu' ? 'એડમિન' : 'Admin'} variant="accent" style={{ marginLeft: 6 }} />
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

                {/* Call Action Button */}
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => handleCall(member.phone)}
                  activeOpacity={0.7}
                >
                  <Phone size={18} color={Colors.success} />
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>

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

                    {selectedMember.profile?.birth_date ? (
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>{language === 'gu' ? 'જન્મ તારીખ' : 'Birth Date'}</Text>
                        <Text style={styles.detailValue}>{selectedMember.profile.birth_date}</Text>
                      </View>
                    ) : null}

                    {selectedMember.profile?.occupation_gu ? (
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>{t('occupation', 'વ્યવસાય / કામગીરી')}</Text>
                        <Text style={styles.detailValue}>{selectedMember.profile.occupation_gu}</Text>
                      </View>
                    ) : null}

                    {selectedMember.profile?.bio_gu ? (
                      <View style={[styles.detailItem, { width: '100%' }]}>
                        <Text style={styles.detailLabel}>{t('bio', 'પરિચય')}</Text>
                        <Text style={styles.detailValue}>{selectedMember.profile.bio_gu}</Text>
                      </View>
                    ) : null}
                  </View>

                  <Button
                    title={`${language === 'gu' ? 'કૉલ કરો' : 'Call'} (${selectedMember.phone})`}
                    variant="primary"
                    icon={<Phone size={18} color="#FFFFFF" />}
                    onPress={() => handleCall(selectedMember.phone)}
                    style={{ marginTop: 20 }}
                  />
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
  subBar: {
    backgroundColor: Colors.surface,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  familyCodeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
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
    fontSize: 13,
    color: Colors.textPrimary,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },
  memberCard: {
    marginBottom: 10,
    padding: 12,
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
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  relationTitle: {
    fontSize: 13,
    color: Colors.primaryLight,
    fontWeight: '700',
    marginTop: 2,
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
  closeBtn: {
    padding: 6,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
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
