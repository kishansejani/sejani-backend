import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Button } from './Button';
import { PersonalRecord } from '../types';

interface AddRecordModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<PersonalRecord>) => Promise<boolean>;
  editingRecord?: PersonalRecord | null;
}

export const AddRecordModal: React.FC<AddRecordModalProps> = ({
  visible,
  onClose,
  onSubmit,
  editingRecord,
}) => {
  const [recordType, setRecordType] = useState<'note' | 'expense' | 'document' | 'reminder' | 'diary'>('note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('general');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingRecord) {
      setRecordType(editingRecord.record_type);
      setTitle(editingRecord.title);
      setContent(editingRecord.content || '');
      setAmount(editingRecord.amount ? String(editingRecord.amount) : '');
      setCategory(editingRecord.category || 'general');
      setRecordDate(editingRecord.record_date);
    } else {
      resetForm();
    }
  }, [editingRecord, visible]);

  const resetForm = () => {
    setRecordType('note');
    setTitle('');
    setContent('');
    setAmount('');
    setCategory('general');
    setRecordDate(new Date().toISOString().split('T')[0]);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('ધ્યાન આપો', 'કૃપા કરીને શીર્ષક દાખલ કરો.');
      return;
    }

    setLoading(true);
    const payload: Partial<PersonalRecord> = {
      record_type: recordType,
      title: title.trim(),
      content: content.trim(),
      category,
      record_date: recordDate,
    };

    if (recordType === 'expense' && amount) {
      payload.amount = parseFloat(amount);
    }

    const success = await onSubmit(payload);
    setLoading(false);
    if (success) {
      resetForm();
      onClose();
    }
  };

  const typeOptions: { key: typeof recordType; label: string }[] = [
    { key: 'note', label: '📝 અંગત નોંધ' },
    { key: 'expense', label: '💰 ખર્ચ/હિસાબ' },
    { key: 'document', label: '📑 દસ્તાવેજ' },
    { key: 'reminder', label: '⏰ રિમાઇન્ડર' },
    { key: 'diary', label: '📖 ડાયરી' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {editingRecord ? '✏️ નોંધ સુધારો' : '✨ નવી અંગત નોંધ ઉમેરો'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Record Type Selector */}
            <Text style={styles.label}>પ્રકાર પસંદ કરો:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow}>
              {typeOptions.map((item) => (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.typeChip,
                    recordType === item.key && styles.typeChipActive,
                  ]}
                  onPress={() => setRecordType(item.key)}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      recordType === item.key && styles.typeChipTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Title */}
            <Text style={styles.label}>શીર્ષક (Title) *</Text>
            <TextInput
              style={styles.input}
              placeholder="દા.ત. જમીનના કાગળો, સોનું ખરીદી..."
              placeholderTextColor={Colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            {/* Amount if Expense */}
            {recordType === 'expense' ? (
              <>
                <Text style={styles.label}>રકમ (₹ Amount)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="દા.ત. 15000"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />
              </>
            ) : null}

            {/* Content / Details */}
            <Text style={styles.label}>વિગતવાર નોંધ (Private Content)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="અહીં તમારી ખાનગી વિગતો લખો. આ માત્ર તમે જ જોઈ શકશો."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={4}
              value={content}
              onChangeText={setContent}
            />

            {/* Date */}
            <Text style={styles.label}>તારીખ (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2026-08-24"
              placeholderTextColor={Colors.textMuted}
              value={recordDate}
              onChangeText={setRecordDate}
            />

            <View style={styles.privacyNote}>
              <Text style={styles.privacyText}>
                🔒 <Text style={{ fontWeight: 'bold' }}>સુરક્ષા ખાતરી:</Text> આ રેકોર્ડ તમારા આઈડી સાથે જોડાયેલો છે. પરિવારના અન્ય કોઈ સભ્ય આ જોઈ શકશે નહીં.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="રદ કરો"
              variant="outline"
              onPress={onClose}
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title={editingRecord ? 'અપડેટ કરો' : 'સાચવો'}
              variant="primary"
              loading={loading}
              onPress={handleSave}
              style={{ flex: 2 }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: 6,
  },
  closeTxt: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 12,
    marginBottom: 6,
  },
  typeRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  typeChipTextActive: {
    color: Colors.textLight,
    fontWeight: '700',
  },
  input: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  privacyNote: {
    backgroundColor: Colors.primarySoft,
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  privacyText: {
    fontSize: 12,
    color: Colors.primaryDark,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
