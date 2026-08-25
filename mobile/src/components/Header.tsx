import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showProfile?: boolean;
  onProfilePress?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showProfile = true,
  onProfilePress,
  rightAction,
}) => {
  const { user } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <Text style={styles.badgeText}>✨ PersonalInfo • {t('securePortal', 'સુરક્ષિત પોર્ટલ')}</Text>
          <Text style={styles.mainTitle}>{title || (user?.name || user?.profile?.full_name_gu ? `${t('greeting', 'જય શ્રી કૃષ્ણ')}, ${(user?.profile?.full_name_gu || user?.name || '').split(' ')[0]}` : 'PersonalInfo ડેશબોર્ડ')}</Text>
          {subtitle ? <Text style={styles.subTitle}>{subtitle}</Text> : null}
        </View>

        <View style={styles.rightGroup}>
          <TouchableOpacity
            style={styles.langBadge}
            onPress={toggleLanguage}
            activeOpacity={0.8}
          >
            <Text style={styles.langBadgeText}>
              {language === 'gu' ? '🇬🇧 EN' : '🇬🇯 GU'}
            </Text>
          </TouchableOpacity>

          {rightAction ? (
            rightAction
          ) : showProfile && user ? (
            <TouchableOpacity style={styles.avatarButton} onPress={onProfilePress} activeOpacity={0.8}>
              <View style={styles.avatarRing}>
                <Image
                  source={{ uri: user.profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563EB&color=fff` }}
                  style={styles.avatar}
                />
              </View>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleContainer: {
    flex: 1,
    paddingRight: 10,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  langBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    marginRight: 10,
  },
  langBadgeText: {
    color: '#FEF3C7',
    fontSize: 12,
    fontWeight: '800',
  },
  badgeText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  mainTitle: {
    color: Colors.textLight,
    fontSize: 22,
    fontWeight: '800',
  },
  subTitle: {
    color: '#93C5FD',
    fontSize: 13,
    marginTop: 2,
  },
  avatarButton: {
    marginLeft: 12,
  },
  avatarRing: {
    padding: 2,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
});
