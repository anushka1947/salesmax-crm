import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';

interface QuickAddModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialTab?: 'lead' | 'deal' | 'task' | 'note';
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  visible,
  onClose,
  onSuccess,
  initialTab = 'lead',
}) => {
  const [tab, setTab] = useState<'lead' | 'deal' | 'task' | 'note'>(initialTab);
  const [loading, setLoading] = useState(false);

  // Lead fields
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [leadSource, setLeadSource] = useState('web_form');

  // Deal fields
  const [dealTitle, setDealTitle] = useState('');
  const [dealValue, setDealValue] = useState('');
  const [dealStage, setDealStage] = useState('New');

  // Task fields
  const [taskTitle, setTaskTitle] = useState('');
  const [taskType, setTaskType] = useState('Call');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskDueDate, setTaskDueDate] = useState('');

  // Note fields
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDesc, setNoteDesc] = useState('');

  const resetForms = () => {
    setLeadName('');
    setLeadPhone('');
    setLeadEmail('');
    setLeadCompany('');
    setDealTitle('');
    setDealValue('');
    setTaskTitle('');
    setTaskDueDate('');
    setNoteTitle('');
    setNoteDesc('');
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (tab === 'lead') {
        if (!leadName.trim()) {
          Alert.alert('Validation Error', 'Lead name is required');
          setLoading(false);
          return;
        }
        await api.createLead({
          name: leadName.trim(),
          phone: leadPhone.trim() || undefined,
          email: leadEmail.trim() || undefined,
          company: leadCompany.trim() || undefined,
          source: leadSource,
          status: 'new',
        });
      } else if (tab === 'deal') {
        if (!dealTitle.trim()) {
          Alert.alert('Validation Error', 'Deal title is required');
          setLoading(false);
          return;
        }
        await api.createDeal({
          title: dealTitle.trim(),
          value: parseFloat(dealValue) || 0,
          stage: dealStage,
        });
      } else if (tab === 'task') {
        if (!taskTitle.trim()) {
          Alert.alert('Validation Error', 'Task title is required');
          setLoading(false);
          return;
        }
        await api.createTask({
          title: taskTitle.trim(),
          type: taskType,
          priority: taskPriority,
          due_date: taskDueDate.trim() || undefined,
          status: 'Pending',
        });
      } else if (tab === 'note') {
        if (!noteTitle.trim()) {
          Alert.alert('Validation Error', 'Note title is required');
          setLoading(false);
          return;
        }
        await api.createActivity({
          type: 'note',
          title: noteTitle.trim(),
          description: noteDesc.trim() || undefined,
        });
      }

      resetForms();
      onSuccess();
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Quick Add Record</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Tab Selector */}
          <View style={styles.tabBar}>
            {(['lead', 'deal', 'task', 'note'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
                onPress={() => setTab(t)}
              >
                <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>
                  {t === 'lead' ? 'Lead' : t === 'deal' ? 'Deal' : t === 'task' ? 'Task' : 'Note'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Form Body */}
          <ScrollView style={styles.formBody} showsVerticalScrollIndicator={false}>
            {tab === 'lead' && (
              <View style={styles.fieldsContainer}>
                <Text style={styles.label}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Ramesh Patel"
                  value={leadName}
                  onChangeText={setLeadName}
                />

                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+91-9876543210"
                  keyboardType="phone-pad"
                  value={leadPhone}
                  onChangeText={setLeadPhone}
                />

                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="ramesh@patel.in"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={leadEmail}
                  onChangeText={setLeadEmail}
                />

                <Text style={styles.label}>Company</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Patel Logistics"
                  value={leadCompany}
                  onChangeText={setLeadCompany}
                />

                <Text style={styles.label}>Source Channel</Text>
                <View style={styles.pillsRow}>
                  {['web_form', 'facebook', 'google', 'manual', 'indiamart'].map((src) => (
                    <TouchableOpacity
                      key={src}
                      style={[styles.pill, leadSource === src && styles.pillActive]}
                      onPress={() => setLeadSource(src)}
                    >
                      <Text style={[styles.pillText, leadSource === src && styles.pillTextActive]}>
                        {src.replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {tab === 'deal' && (
              <View style={styles.fieldsContainer}>
                <Text style={styles.label}>Opportunity Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Enterprise CRM Package"
                  value={dealTitle}
                  onChangeText={setDealTitle}
                />

                <Text style={styles.label}>Deal Value (₹ INR) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="150000"
                  keyboardType="numeric"
                  value={dealValue}
                  onChangeText={setDealValue}
                />

                <Text style={styles.label}>Initial Pipeline Stage</Text>
                <View style={styles.pillsRow}>
                  {['New', 'Qualified', 'Proposal', 'Negotiation', 'Won'].map((st) => (
                    <TouchableOpacity
                      key={st}
                      style={[styles.pill, dealStage === st && styles.pillActive]}
                      onPress={() => setDealStage(st)}
                    >
                      <Text style={[styles.pillText, dealStage === st && styles.pillTextActive]}>
                        {st}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {tab === 'task' && (
              <View style={styles.fieldsContainer}>
                <Text style={styles.label}>Task Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Send WhatsApp quote breakdown"
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                />

                <Text style={styles.label}>Action Channel</Text>
                <View style={styles.pillsRow}>
                  {['Call', 'WhatsApp', 'Email', 'Meeting'].map((tp) => (
                    <TouchableOpacity
                      key={tp}
                      style={[styles.pill, taskType === tp && styles.pillActive]}
                      onPress={() => setTaskType(tp)}
                    >
                      <Text style={[styles.pillText, taskType === tp && styles.pillTextActive]}>
                        {tp}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Priority</Text>
                <View style={styles.pillsRow}>
                  {['High', 'Medium', 'Low'].map((pr) => (
                    <TouchableOpacity
                      key={pr}
                      style={[styles.pill, taskPriority === pr && styles.pillActive]}
                      onPress={() => setTaskPriority(pr)}
                    >
                      <Text style={[styles.pillText, taskPriority === pr && styles.pillTextActive]}>
                        {pr}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Due Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2026-09-25"
                  value={taskDueDate}
                  onChangeText={setTaskDueDate}
                />
              </View>
            )}

            {tab === 'note' && (
              <View style={styles.fieldsContainer}>
                <Text style={styles.label}>Note Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Meeting summary"
                  value={noteTitle}
                  onChangeText={setNoteTitle}
                />

                <Text style={styles.label}>Details</Text>
                <TextInput
                  style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                  placeholder="Enter details, feedback, or next steps..."
                  multiline
                  value={noteDesc}
                  onChangeText={setNoteDesc}
                />
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={loading}
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.submitBtnText}>Save Record</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeBtn: {
    padding: 4,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 4,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  tabBtnTextActive: {
    color: '#7c3aed',
    fontWeight: '700',
  },
  formBody: {
    paddingHorizontal: 20,
    paddingTop: 12,
    maxHeight: 360,
  },
  fieldsContainer: {
    paddingBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginTop: 10,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0f172a',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  pillActive: {
    backgroundColor: '#7c3aed',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textTransform: 'capitalize',
  },
  pillTextActive: {
    color: '#ffffff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  submitBtn: {
    backgroundColor: '#7c3aed',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
