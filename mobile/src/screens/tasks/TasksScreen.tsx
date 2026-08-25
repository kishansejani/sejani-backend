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
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';
import {
  Bell,
  Plus,
  Trash2,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  Circle,
  X,
  Mic,
  Sprout,
  Zap,
  Car,
  FileText,
  AlertCircle,
  ChevronDown,
  Edit3,
} from 'lucide-react-native';
import { Colors } from '../../theme/colors';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { DismissKeyboardBar } from '../../components/DismissKeyboardBar';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { createVoiceRecognition } from '../../utils/voiceRecognition';
import { notificationService } from '../../utils/notificationService';
import api from '../../api/client';

export const TasksScreen: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Voice Recognition States
  const [isListening, setIsListening] = useState(false);

  // Add Task Form States
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'payment_collect' | 'bill_pay' | 'farming_work' | 'vehicle' | 'general'>('payment_collect');
  const [amount, setAmount] = useState('');
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskTime, setTaskTime] = useState('10:00 AM');
  const [notes, setNotes] = useState('');
  const [savingTask, setSavingTask] = useState(false);

  const categories = [
    { key: 'payment_collect', label: language === 'gu' ? '💰 પેમેન્ટ લેવાનું' : '💰 Payment Due', color: '#059669', bg: '#ECFDF5' },
    { key: 'bill_pay', label: language === 'gu' ? '⚡ બિલ ભરવાનું' : '⚡ Bill Payment', color: '#D97706', bg: '#FEF3C7' },
    { key: 'farming_work', label: language === 'gu' ? '🌾 ખેતી કામ' : '🌾 Farm Task', color: Colors.primary, bg: '#EFF6FF' },
    { key: 'vehicle', label: language === 'gu' ? '🚗 વાહન / વીમો' : '🚗 Vehicle/Insurance', color: '#8B5CF6', bg: '#F5F3FF' },
    { key: 'general', label: language === 'gu' ? '📝 સામાન્ય નોંધ' : '📝 General Task', color: Colors.textSecondary, bg: '#F1F5F9' },
  ];

  useEffect(() => {
    fetchTasks();
    initNotifications();
  }, []);

  const initNotifications = async () => {
    const granted = await notificationService.requestPermissions();
    setPermissionGranted(granted);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      if (res.data?.tasks) {
        setTasks(res.data.tasks);
      }
    } catch (err) {
      console.warn('Tasks fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks();
  };

  const startVoiceInput = () => {
    const voice = createVoiceRecognition();
    setIsListening(true);
    voice.startListening(
      (text) => {
        setTitle(text);
        setIsListening(false);
      },
      () => setIsListening(false)
    );
  };

  const handleOpenEditTask = (t: any) => {
    setEditingTaskId(t.id);
    setTitle(t.title || '');
    setCategory(t.category || 'general');
    setAmount(t.amount ? String(t.amount) : '');
    setTaskDate(t.task_date || new Date().toISOString().split('T')[0]);
    setTaskTime(t.task_time || '10:00 AM');
    setNotes(t.notes || '');
    setModalVisible(true);
  };

  const handleSaveTask = async () => {
    if (!title.trim()) {
      alert('કૃપા કરીને કામ / એલર્ટનું નામ દાખલ કરો.');
      return;
    }

    setSavingTask(true);
    try {
      const payload = {
        title: title.trim(),
        category,
        amount: amount ? parseFloat(amount) : null,
        task_date: taskDate,
        task_time: taskTime,
        notes: notes.trim() || null,
      };

      let res;
      if (editingTaskId) {
        res = await api.put(`/tasks/${editingTaskId}`, payload);
      } else {
        res = await api.post('/tasks', payload);
      }

      if (res.data?.task) {
        // Parse reminder target date and time accurately
        try {
          let hours = 10;
          let minutes = 0;
          const cleanTime = (taskTime || '10:00 AM').toUpperCase().trim();

          if (cleanTime.includes('PM') || cleanTime.includes('AM')) {
            const isPM = cleanTime.includes('PM');
            const timeDigits = cleanTime.replace('AM', '').replace('PM', '').trim();
            const parts = timeDigits.split(':');
            hours = parseInt(parts[0], 10);
            minutes = parts.length > 1 ? parseInt(parts[1], 10) : 0;
            if (isPM && hours < 12) hours += 12;
            if (!isPM && hours === 12) hours = 0;
          }

          const targetDateTime = new Date(taskDate);
          targetDateTime.setHours(hours, minutes, 0, 0);

          const bodyText = amount 
            ? `💰 રકમ: ₹${parseFloat(amount).toLocaleString('en-IN')} • સમયસર પૂર્ણ કરો.`
            : `તારીખ: ${taskDate} • સમયસર પૂર્ણ કરવાનું યાદ અપાવ્યું છે.`;

          await notificationService.scheduleTaskReminder(
            `🔔 ${title.trim()}`,
            bodyText,
            targetDateTime,
            { taskId: res.data.task.id }
          );

          // Instant feedback
          await notificationService.sendInstantNotification(
            editingTaskId ? '✅ એલર્ટ અપડેટ થયું' : '✅ નવું એલર્ટ સેટ થયું',
            `"${title.trim()}" - ${taskDate} ના રોજ નોટિફિકેશન આવશે.`
          );
        } catch (notifErr) {
          console.warn('Notification schedule error:', notifErr);
        }

        setModalVisible(false);
        setEditingTaskId(null);
        setTitle('');
        setAmount('');
        setNotes('');
        await fetchTasks();
        showToast(editingTaskId ? `✅ "${title.trim()}" અપડેટ થઈ ગયું!` : `✅ "${title.trim()}" નું એલર્ટ સેટ થઈ ગયું!`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'સેવ કરવામાં ભૂલ આવી.');
    } finally {
      setSavingTask(false);
    }
  };

  const handleToggleComplete = async (id: number) => {
    try {
      await api.patch(`/tasks/${id}/toggle`);
      fetchTasks();
    } catch (e) {
      console.warn('Toggle error:', e);
    }
  };

  const handleDeleteTask = async (id: number) => {
    const confirmed = Platform.OS === 'web'
      ? window.confirm('શું તમે આ રિમાઇન્ડર ડિલીટ કરવા માંગો છો?')
      : true;

    if (confirmed) {
      try {
        await api.delete(`/tasks/${id}`);
        fetchTasks();
        showToast('🗑️ એલર્ટ ડિલીટ કર્યું.');
      } catch (e) {
        console.warn('Delete error:', e);
      }
    }
  };

  const pendingTasks = tasks.filter((t) => !t.is_completed);
  const completedTasks = tasks.filter((t) => t.is_completed);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Header
          title={t('tabAlerts', '🔔 એલર્ટ્સ')}
          subtitle={language === 'gu' ? 'રિમાઇન્ડર, બિલ તારીખો & પેમેન્ટ લિસ્ટ' : 'Reminders, Bill Due Dates & Payments'}
        />

        {toastMessage && (
          <View style={styles.toastBanner}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.scroll}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Banner */}
          <Card variant="gold" style={styles.bannerCard}>
            <View style={styles.bannerRow}>
              <View style={styles.bannerIconCircle}>
                <Bell size={24} color={Colors.accentDark} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.bannerTitle}>
                  {language === 'gu' ? 'સમયસર એલર્ટ્સ & નોટિફિકેશન' : 'Timely Alerts & Reminders'}
                </Text>
                <Text style={styles.bannerSub}>
                  {language === 'gu' ? 'પેમેન્ટ લેવાનું, બિલ ભરવાનું કે ખેતી કામ ક્યારેય ચૂકશો નહીં.' : 'Never miss payment dues, electricity bills, or farm tasks.'}
                </Text>
              </View>
            </View>
          </Card>

          {/* Quick Add Button */}
          <Button
            title={language === 'gu' ? '+ નવું રિમાઇન્ડર / પેમેન્ટ એલર્ટ ઉમેરો' : '+ Add New Alert / Reminder'}
            variant="primary"
            icon={<Plus size={18} color="#FFFFFF" />}
            onPress={() => setModalVisible(true)}
            style={{ marginBottom: 16 }}
          />

          {/* Pending Tasks Section */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>
              {language === 'gu' ? `બાકી કામો & એલર્ટ્સ (${pendingTasks.length})` : `Pending Tasks & Alerts (${pendingTasks.length})`}
            </Text>
            <Badge label={language === 'gu' ? `${pendingTasks.length} બાકી` : `${pendingTasks.length} Pending`} variant="accent" />
          </View>

          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />
          ) : pendingTasks.length === 0 ? (
            <Card style={styles.emptyCard}>
              <CheckCircle size={36} color={Colors.success} style={{ marginBottom: 6 }} />
              <Text style={styles.emptyTitle}>
                {language === 'gu' ? 'બધા કામો પૂર્ણ થઈ ગયા છે!' : 'All Tasks Completed!'}
              </Text>
              <Text style={styles.emptyDesc}>
                {language === 'gu' ? 'નવું પેમેન્ટ લેવાનું કે બિલ ભરવાનું રિમાઇન્ડર ઉમેરવા ઉપર બટન દબાવો.' : 'Tap the button above to add a new payment or bill reminder.'}
              </Text>
            </Card>
          ) : (
            pendingTasks.map((t) => {
              const catObj = categories.find((c) => c.key === t.category) || categories[0];
              return (
                <Card key={t.id} style={styles.taskCard}>
                  <View style={styles.taskRow}>
                    <TouchableOpacity
                      style={styles.checkBtn}
                      onPress={() => handleToggleComplete(t.id)}
                    >
                      <Circle size={22} color={Colors.textMuted} />
                    </TouchableOpacity>

                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.taskTitle}>{t.title}</Text>
                      <View style={styles.taskMetaRow}>
                        <View style={[styles.catBadge, { backgroundColor: catObj.bg }]}>
                          <Text style={[styles.catBadgeText, { color: catObj.color }]}>{catObj.label}</Text>
                        </View>
                        <View style={styles.dateMeta}>
                          <Calendar size={12} color={Colors.textMuted} style={{ marginRight: 4 }} />
                          <Text style={styles.dateText}>{t.task_date} • {t.task_time}</Text>
                        </View>
                      </View>

                      {t.amount ? (
                        <Text style={styles.amountText}>રકમ: ₹{Number(t.amount).toLocaleString('en-IN')}</Text>
                      ) : null}

                      {t.notes ? (
                        <Text style={styles.notesText}>{t.notes}</Text>
                      ) : null}
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TouchableOpacity
                        style={[styles.delBtn, { marginRight: 6 }]}
                        onPress={() => handleOpenEditTask(t)}
                      >
                        <Edit3 size={16} color={Colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.delBtn}
                        onPress={() => handleDeleteTask(t.id)}
                      >
                        <Trash2 size={16} color={Colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              );
            })
          )}

          {/* Completed Tasks Section */}
          {completedTasks.length > 0 && (
            <>
              <View style={[styles.sectionHeaderRow, { marginTop: 18 }]}>
                <Text style={styles.sectionHeading}>પૂર્ણ થયેલ કામો ({completedTasks.length})</Text>
              </View>

              {completedTasks.map((t) => (
                <Card key={t.id} style={{ ...styles.taskCard, opacity: 0.7 }}>
                  <View style={styles.taskRow}>
                    <TouchableOpacity
                      style={styles.checkBtn}
                      onPress={() => handleToggleComplete(t.id)}
                    >
                      <CheckCircle size={22} color={Colors.success} />
                    </TouchableOpacity>

                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.taskTitle, { textDecorationLine: 'line-through', color: Colors.textMuted }]}>
                        {t.title}
                      </Text>
                      <Text style={styles.dateText}>📅 {t.task_date} • પૂર્ણ</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.delBtn}
                      onPress={() => handleDeleteTask(t.id)}
                    >
                      <Trash2 size={16} color={Colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
            </>
          )}

          {/* Footer */}
          <View style={styles.brandingFooter}>
            <Text style={styles.brandText}>
              {language === 'gu' ? '✨ PersonalInfo • સુરક્ષિત પોર્ટલ' : '✨ PersonalInfo • Secure Portal'}
            </Text>
            <Text style={styles.familyTagText}>
              {language === 'gu' ? '૧૦૦% સુરક્ષિત ખાનગી પોર્ટલ' : '100% Secure Private Portal'}
            </Text>
          </View>
        </ScrollView>

        {/* Global Close Keyboard Bar */}
        <DismissKeyboardBar />

        {/* ADD TASK / REMINDER MODAL WITH KEYBOARD DISMISS */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Bell size={20} color={Colors.accentDark} style={{ marginRight: 8 }} />
                  <Text style={styles.modalHeading}>નવું રિમાઇન્ડર / પેમેન્ટ એલર્ટ</Text>
                </View>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <X size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Close Keyboard Bar inside Modal */}
              <View style={styles.modalKeyboardBar}>
                <TouchableOpacity
                  style={styles.dismissKeyBtn}
                  onPress={() => Keyboard.dismiss()}
                >
                  <ChevronDown size={14} color={Colors.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.dismissKeyBtnText}>કીબોર્ડ બંધ કરો (Done ✕)</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Voice-enabled Title Input */}
                <View style={styles.labelWithMicRow}>
                  <Text style={styles.inputLabel}>૧. કામ / એલર્ટનું નામ લખો અથવા બોલો *</Text>
                  <TouchableOpacity
                    style={[styles.micBtn, isListening && styles.micBtnActive]}
                    onPress={startVoiceInput}
                  >
                    <Mic size={14} color={isListening ? '#FFFFFF' : Colors.primary} />
                    <Text style={[styles.micBtnText, isListening && { color: '#FFFFFF' }]}>
                      {isListening ? 'સાંભળે છે...' : 'બોલો 🎤'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={[styles.input, { fontWeight: 'bold' }]}
                  placeholder="દા.ત. રામભાઈ પાસેથી ₹૧૦,૦૦૦ લેવાના છે, લાઈટ બિલ..."
                  placeholderTextColor={Colors.textMuted}
                  value={title}
                  onChangeText={setTitle}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />

                {/* Category Selector */}
                <Text style={styles.inputLabel}>૨. કેટેગરી પસંદ કરો:</Text>
                <View style={styles.catGrid}>
                  {categories.map((c) => (
                    <TouchableOpacity
                      key={c.key}
                      style={[styles.catChip, category === c.key && { backgroundColor: c.color, borderColor: c.color }]}
                      onPress={() => setCategory(c.key as any)}
                    >
                      <Text style={[styles.catChipText, category === c.key && { color: '#FFFFFF', fontWeight: '800' }]}>
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Optional Amount */}
                <Text style={styles.inputLabel}>રકમ (₹ Amount - જો લાગુ પડતું હોય):</Text>
                <TextInput
                  style={styles.input}
                  placeholder="દા.ત. 10000"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />

                {/* Date and Time */}
                <View style={styles.twoInputsRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.inputLabel}>તારીખ (YYYY-MM-DD) *</Text>
                    <TextInput
                      style={styles.input}
                      value={taskDate}
                      onChangeText={setTaskDate}
                      returnKeyType="done"
                      onSubmitEditing={Keyboard.dismiss}
                    />
                  </View>

                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.inputLabel}>સમય (Time)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="દા.ત. 10:00 AM"
                      placeholderTextColor={Colors.textMuted}
                      value={taskTime}
                      onChangeText={setTaskTime}
                      returnKeyType="done"
                      onSubmitEditing={Keyboard.dismiss}
                    />
                  </View>
                </View>

                {/* Notes */}
                <Text style={styles.inputLabel}>વધારાની વિગત (Notes):</Text>
                <TextInput
                  style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                  placeholder="કોઈ વધારાની નોંધ..."
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  value={notes}
                  onChangeText={setNotes}
                />

                <View style={styles.modalFooter}>
                  <Button
                    title="રદ કરો"
                    variant="outline"
                    onPress={() => setModalVisible(false)}
                    style={{ flex: 1, marginRight: 8 }}
                  />
                  <Button
                    title="એલર્ટ સાચવો"
                    variant="primary"
                    loading={savingTask}
                    onPress={handleSaveTask}
                    style={{ flex: 2 }}
                  />
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },
  bannerCard: {
    padding: 14,
    marginBottom: 14,
    borderRadius: 16,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  bannerSub: {
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
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  taskCard: {
    padding: 12,
    marginBottom: 10,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkBtn: {
    paddingTop: 2,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  catBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  dateMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  amountText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
    marginTop: 4,
  },
  notesText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  delBtn: {
    padding: 6,
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
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalKeyboardBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dismissKeyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dismissKeyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  labelWithMicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
    marginBottom: 6,
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
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  twoInputsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    marginTop: 18,
    marginBottom: 20,
  },
});
