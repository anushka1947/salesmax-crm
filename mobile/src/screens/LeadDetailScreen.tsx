import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { Lead, Activity } from '../types/crm';

export default function LeadDetailScreen({ route, navigation }: any) {
  const { leadId } = route.params;
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Note Modal
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDesc, setNoteDesc] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [converting, setConverting] = useState(false);

  const fetchLeadData = async () => {
    try {
      setLoading(true);
      const [leadData, actsData] = await Promise.all([
        api.getLead(leadId),
        api.getActivities({ lead_id: leadId, limit: 20 }),
      ]);
      setLead(leadData);
      setActivities(actsData);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to load lead details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadData();
  }, [leadId]);

  const handleCall = () => {
    if (!lead?.phone) {
      Alert.alert('No Phone', 'This lead does not have a phone number.');
      return;
    }
    const cleanPhone = lead.phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Alert.alert('Error', 'Unable to initiate phone call on this device.');
    });
  };

  const handleWhatsApp = () => {
    if (!lead?.phone) {
      Alert.alert('No Phone', 'This lead does not have a phone number.');
      return;
    }
    const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hello ${lead.name}, thank you for contacting SalesMax!`);
    const waUrl = `https://wa.me/${cleanPhone}?text=${message}`;
    Linking.openURL(waUrl).catch(() => {
      Alert.alert('Error', 'WhatsApp is not installed or URL cannot be opened.');
    });
  };

  const handleEmail = () => {
    if (!lead?.email) {
      Alert.alert('No Email', 'This lead does not have an email address.');
      return;
    }
    Linking.openURL(`mailto:${lead.email}`).catch(() => {
      Alert.alert('Error', 'Unable to open mail client.');
    });
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim()) {
      Alert.alert('Validation Error', 'Note title is required');
      return;
    }
    setSavingNote(true);
    try {
      await api.createActivity({
        type: 'note',
        title: noteTitle.trim(),
        description: noteDesc.trim() || undefined,
        lead_id: leadId,
      });
      setNoteModalVisible(false);
      setNoteTitle('');
      setNoteDesc('');
      fetchLeadData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  const handleConvertToContact = async () => {
    if (!lead) return;
    setConverting(true);
    try {
      const parts = lead.name.trim().split(' ');
      const firstName = parts[0] || lead.name;
      const lastName = parts.slice(1).join(' ') || undefined;

      await api.createContact({
        first_name: firstName,
        last_name: lastName,
        email: lead.email,
        phone: lead.phone,
        company_name: lead.company,
        lead_id: lead.id,
      });

      await api.updateLead(lead.id, { status: 'converted' });
      await api.createActivity({
        type: 'status_change',
        title: 'Lead Converted to Contact',
        description: `${lead.name} was promoted to an account contact.`,
        lead_id: lead.id,
      });

      Alert.alert('Success', 'Lead successfully converted to Contact!');
      fetchLeadData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to convert lead');
    } finally {
      setConverting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (!lead) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: '#64748b' }}>Lead not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.largeAvatar}>
              <Text style={styles.largeAvatarLetter}>{lead.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.leadName}>{lead.name}</Text>
              {lead.company ? <Text style={styles.companyName}>{lead.company}</Text> : null}
              <View style={styles.badgesRow}>
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>{lead.status}</Text>
                </View>
                <View style={styles.sourcePill}>
                  <Text style={styles.sourcePillText}>{lead.source}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Action Dialers */}
          <View style={styles.actionsBar}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleCall}>
              <View style={[styles.actionIconCircle, { backgroundColor: '#eff6ff' }]}>
                <Ionicons name="call" size={18} color="#2563eb" />
              </View>
              <Text style={styles.actionLabel}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleWhatsApp}>
              <View style={[styles.actionIconCircle, { backgroundColor: '#ecfdf5' }]}>
                <Ionicons name="logo-whatsapp" size={18} color="#16a34a" />
              </View>
              <Text style={styles.actionLabel}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={handleEmail}>
              <View style={[styles.actionIconCircle, { backgroundColor: '#f5f3ff' }]}>
                <Ionicons name="mail" size={18} color="#7c3aed" />
              </View>
              <Text style={styles.actionLabel}>Email</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => setNoteModalVisible(true)}>
              <View style={[styles.actionIconCircle, { backgroundColor: '#fffbeb' }]}>
                <Ionicons name="create" size={18} color="#d97706" />
              </View>
              <Text style={styles.actionLabel}>Add Note</Text>
            </TouchableOpacity>
          </View>

          {/* Convert Lead Action */}
          {lead.status !== 'converted' && (
            <TouchableOpacity
              style={styles.convertBtn}
              onPress={handleConvertToContact}
              disabled={converting}
            >
              {converting ? (
                <ActivityIndicator size="small" color="#7c3aed" />
              ) : (
                <>
                  <Ionicons name="person-add" size={16} color="#7c3aed" />
                  <Text style={styles.convertBtnText}>Convert to Contact Account</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Contact Info Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionHeading}>Contact Details</Text>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Phone</Text>
            <Text style={styles.detailValue}>{lead.phone || '—'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{lead.email || '—'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Company</Text>
            <Text style={styles.detailValue}>{lead.company || '—'}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Acquisition Source</Text>
            <Text style={styles.detailValue}>{lead.source}</Text>
          </View>
        </View>

        {/* Activity Timeline */}
        <View style={styles.detailsCard}>
          <View style={styles.timelineHeader}>
            <Text style={styles.sectionHeading}>Customer Timeline</Text>
            <TouchableOpacity onPress={() => setNoteModalVisible(true)}>
              <Text style={styles.addNoteLink}>+ Log Note</Text>
            </TouchableOpacity>
          </View>

          {activities.length === 0 ? (
            <Text style={styles.emptyTimeline}>No activities logged yet.</Text>
          ) : (
            activities.map((act) => (
              <View key={act.id} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineBody}>
                  <Text style={styles.actTitle}>{act.title}</Text>
                  {act.description ? <Text style={styles.actDesc}>{act.description}</Text> : null}
                  <Text style={styles.actTime}>
                    {new Date(act.created_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Note Modal */}
      <Modal visible={noteModalVisible} animationType="slide" transparent onRequestClose={() => setNoteModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Customer Note</Text>
              <TouchableOpacity onPress={() => setNoteModalVisible(false)}>
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <Text style={styles.label}>Note Subject *</Text>
              <TextInput
                style={styles.input}
                value={noteTitle}
                onChangeText={setNoteTitle}
                placeholder="e.g. Discussed pricing & payment terms"
              />

              <Text style={styles.label}>Detailed Notes</Text>
              <TextInput
                style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
                value={noteDesc}
                onChangeText={setNoteDesc}
                placeholder="Key takeaways, prospect objections, next steps..."
                multiline
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => setNoteModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveNote} disabled={savingNote} style={styles.saveBtn}>
                {savingNote ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Save Note</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  largeAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  largeAvatarLetter: {
    fontSize: 22,
    fontWeight: '800',
    color: '#7c3aed',
  },
  profileInfo: {
    flex: 1,
  },
  leadName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  companyName: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  statusPill: {
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7c3aed',
    textTransform: 'capitalize',
  },
  sourcePill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sourcePillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'capitalize',
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  actionBtn: {
    alignItems: 'center',
    gap: 6,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  convertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 10,
    backgroundColor: '#f5f3ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ede9fe',
  },
  convertBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c3aed',
  },
  detailsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addNoteLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7c3aed',
  },
  emptyTimeline: {
    fontSize: 12,
    color: '#94a3b8',
    paddingVertical: 12,
    textAlign: 'center',
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7c3aed',
    marginTop: 4,
  },
  timelineBody: {
    flex: 1,
  },
  actTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  actDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
  },
  actTime: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalForm: {
    gap: 10,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#7c3aed',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
});
