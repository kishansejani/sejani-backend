import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { Lock, Phone, Eye, EyeOff, ShieldCheck, User as UserIcon, HeartHandshake } from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { DismissKeyboardBar } from '../../components/DismissKeyboardBar';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const LoginScreen: React.FC = () => {
  const { login, register } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login Form State
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!loginInput.trim() || !password) {
      const msg = 'કૃપા કરીને મોબાઈલ નંબર અને પાસવર્ડ દાખલ કરો.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('ધ્યાન આપો', msg);
      return;
    }

    setLoading(true);
    Keyboard.dismiss();
    const res = await login(loginInput.trim(), password);
    setLoading(false);

    if (!res.success) {
      const msg = res.message || 'લૉગિન નિષ્ફળ: પાસવર્ડ કે નંબર ખોટો છે.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('લૉગિન નિષ્ફળ', msg);
    }
  };

  const handleRegister = async () => {
    if (!regName.trim() || !regPhone.trim() || !regPassword) {
      const msg = 'કૃપા કરીને નામ, મોબાઈલ નંબર અને પાસવર્ડ બધું દાખલ કરો.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('ધ્યાન આપો', msg);
      return;
    }

    if (regPassword.length < 6) {
      const msg = 'પાસવર્ડ ઓછામાં ઓછો ૬ અક્ષરનો હોવો જોઈએ.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('ધ્યાન આપો', msg);
      return;
    }

    setLoading(true);
    Keyboard.dismiss();
    const res = await register(regName.trim(), regPhone.trim(), regPassword);
    setLoading(false);

    if (!res.success) {
      const msg = res.message || 'રજિસ્ટ્રેશન નિષ્ફળ રહ્યું.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('રજિસ્ટ્રેશન નિષ્ફળ', msg);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Royal Blue Heritage Header */}
          <View style={styles.heroSection}>
            {/* Top Language Toggle */}
            <TouchableOpacity
              style={styles.heroLangBtn}
              onPress={toggleLanguage}
              activeOpacity={0.8}
            >
              <Text style={styles.heroLangText}>
                {language === 'gu' ? '🌐 Switch to English' : '🌐 ગુજરાતીમાં ફેરવો'}
              </Text>
            </TouchableOpacity>

            <View style={styles.logoBadge}>
              <Text style={styles.omSymbol}>卐</Text>
            </View>
            <Text style={styles.appTitle}>{t('appName', 'શ્રી સેજાણી પરિવાર')}</Text>
            <Text style={styles.appSubtitle}>{t('appSubtitle', 'ખાનગી અને સુરક્ષિત પારિવારિક એપ્લિકેશન')}</Text>
            <View style={styles.securityTag}>
              <ShieldCheck size={14} color="#FEF3C7" style={{ marginRight: 4 }} />
              <Text style={styles.securityTagText}>
                {language === 'gu' ? '૧૦૦% સુરક્ષિત ખાનગી પોર્ટલ' : '100% Secure Private Portal'}
              </Text>
            </View>
          </View>

          {/* Auth Mode Toggle Pill */}
          <View style={styles.modeToggleContainer}>
            <TouchableOpacity
              style={[styles.modeTab, authMode === 'login' && styles.modeTabActive]}
              onPress={() => setAuthMode('login')}
              activeOpacity={0.8}
            >
              <Text style={[styles.modeTabText, authMode === 'login' && styles.modeTabTextActive]}>
                {language === 'gu' ? '🔑 પ્રવેશ (Login)' : '🔑 Login'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeTab, authMode === 'register' && styles.modeTabActive]}
              onPress={() => setAuthMode('register')}
              activeOpacity={0.8}
            >
              <Text style={[styles.modeTabText, authMode === 'register' && styles.modeTabTextActive]}>
                {language === 'gu' ? '📝 નવું એકાઉન્ટ (Register)' : '📝 Register'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Main Auth Form Card */}
          <Card variant="gold" style={styles.formCard}>
            {authMode === 'login' ? (
              <>
                <Text style={styles.formHeading}>પ્રવેશ કરો (Login)</Text>
                <Text style={styles.formDesc}>તમારો રજિસ્ટર્ડ મોબાઈલ નંબર અને પાસવર્ડ દાખલ કરો</Text>

                {/* Phone Input */}
                <Text style={styles.inputLabel}>મોબાઈલ નંબર</Text>
                <View style={styles.inputWrapper}>
                  <Phone size={18} color={Colors.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputWithIcon}
                    placeholder="દા.ત. 9825000005"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="phone-pad"
                    value={loginInput}
                    onChangeText={setLoginInput}
                    autoCapitalize="none"
                    returnKeyType="next"
                  />
                </View>

                {/* Password Input with Show/Hide Toggle */}
                <Text style={styles.inputLabel}>પાસવર્ડ</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color={Colors.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputWithIcon}
                    placeholder="પાસવર્ડ દાખલ કરો"
                    placeholderTextColor={Colors.textMuted}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color={Colors.textSecondary} />
                    ) : (
                      <Eye size={18} color={Colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>

                <Button
                  title="લૉગિન કરો"
                  variant="primary"
                  loading={loading}
                  onPress={handleLogin}
                  style={styles.actionBtn}
                />
              </>
            ) : (
              <>
                <Text style={styles.formHeading}>નવું ખાતું બનાવો (Register)</Text>
                <Text style={styles.formDesc}>પરિવારના નવા સભ્ય તરીકે જોડાવા વિગત ભરો</Text>

                {/* Full Name Input */}
                <Text style={styles.inputLabel}>
                  {language === 'gu' ? 'પૂરું નામ' : 'Full Name'}
                </Text>
                <View style={styles.inputWrapper}>
                  <UserIcon size={18} color={Colors.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputWithIcon}
                    placeholder={language === 'gu' ? 'દા.ત. કિશન સેજાણી' : 'e.g. Kishan Sejani'}
                    placeholderTextColor={Colors.textMuted}
                    value={regName}
                    onChangeText={setRegName}
                    returnKeyType="next"
                  />
                </View>

                {/* Mobile Number Input */}
                <Text style={styles.inputLabel}>
                  {language === 'gu' ? 'મોબાઈલ નંબર' : 'Mobile Number'}
                </Text>
                <View style={styles.inputWrapper}>
                  <Phone size={18} color={Colors.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputWithIcon}
                    placeholder="દા.ત. 9825000005"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="phone-pad"
                    value={regPhone}
                    onChangeText={setRegPhone}
                    autoCapitalize="none"
                    returnKeyType="next"
                  />
                </View>

                {/* Password Input */}
                <Text style={styles.inputLabel}>
                  {language === 'gu' ? 'પાસવર્ડ (ઓછામાં ઓછા ૬ અક્ષર)' : 'Password (min 6 chars)'}
                </Text>
                <View style={styles.inputWrapper}>
                  <Lock size={18} color={Colors.primary} style={styles.inputIcon} />
                  <TextInput
                    style={styles.inputWithIcon}
                    placeholder={language === 'gu' ? 'નવો પાસવર્ડ બનાવો' : 'Create new password'}
                    placeholderTextColor={Colors.textMuted}
                    secureTextEntry={!showRegPassword}
                    value={regPassword}
                    onChangeText={setRegPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowRegPassword(!showRegPassword)}
                  >
                    {showRegPassword ? (
                      <EyeOff size={18} color={Colors.textSecondary} />
                    ) : (
                      <Eye size={18} color={Colors.textSecondary} />
                    )}
                  </TouchableOpacity>
                </View>

                <Button
                  title="એકાઉન્ટ બનાવો & લૉગિન થાઓ"
                  variant="success"
                  loading={loading}
                  onPress={handleRegister}
                  style={styles.actionBtn}
                />
              </>
            )}
          </Card>

          {/* Security Note Footer */}
          <View style={styles.securityFooter}>
            <Text style={styles.secFootText}>
              🔒 <Text style={{ fontWeight: 'bold' }}>સુરક્ષા ગેરંટી:</Text> આ એપમાં એન્ડ-ટુ-એન્ડ ઓથેન્ટિકેશન લાગુ છે. તમારો અંગત ડેટા પરિવારના અન્ય સભ્યો જોઈ કે બદલી શકશે નહીં.
            </Text>
          </View>
        </ScrollView>

        <DismissKeyboardBar />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingBottom: 40,
  },
  heroSection: {
    backgroundColor: Colors.primary,
    paddingTop: 50,
    paddingBottom: 45,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroLangBtn: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    marginBottom: 8,
  },
  heroLangText: {
    color: '#FEF3C7',
    fontSize: 12,
    fontWeight: '800',
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: Colors.accentDark,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  omSymbol: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '900',
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textLight,
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#BFDBFE',
    marginTop: 4,
    textAlign: 'center',
  },
  securityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  securityTagText: {
    color: '#FEF3C7',
    fontSize: 12,
    fontWeight: '700',
  },
  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    marginHorizontal: 24,
    marginTop: -20,
    padding: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  modeTabTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  formCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 22,
    borderRadius: 24,
  },
  formHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  formDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  eyeBtn: {
    padding: 8,
  },
  actionBtn: {
    marginTop: 16,
    height: 52,
    borderRadius: 14,
  },
  securityFooter: {
    marginHorizontal: 24,
    marginTop: 20,
    alignItems: 'center',
  },
  secFootText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
