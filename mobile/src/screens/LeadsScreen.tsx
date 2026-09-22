import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { Lead } from '../types/crm';

export default function LeadsScreen({ navigation }: any) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Add/Edit Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [source, setSource] = useState('web_form');
  const [status, setStatus] = useState('new');
  const [saving, setSaving] = useState(false);

  const fetchLeads = async () => {
    try {
      const data = await api.getLeads();
      setLeads(data);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to load leads');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchLeads();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLeads();
  }, []);

  const openCreateModal = () => {
    setEditingLead(null);
    setName('');
    setPhone('');
    setEmail('');
    setCompany('');
    setSource('web_form');
    setStatus('new');
    setModalVisible(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setName(lead.name);
    setPhone(lead.phone || '');
    setEmail(lead.email || '');
    setCompany(lead.company || '');
    setSource(lead.source);
    setStatus(lead.status);
    setModalVisible(true);
  };

  const handleSaveLead = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Lead name is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        company: company.trim() || undefined,
        source,
        status,
      };

      if (editingLead) {
        await api.updateLead(editingLead.id, payload);
      } else {
        await api.createLead(payload);
      }

      setModalVisible(false);
      fetchLeads();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save lead');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLead = (lead: Lead) => {
    Alert.alert('Delete Lead', `Are you sure you want to delete ${lead.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteLead(lead.id);
            fetchLeads();
          } catch (err: any) {
            Alert.alert('Error', 'Failed to delete lead: ' + err.message);
          }
        },
      },
    ]);
  };

  const filteredLeads = leads.filter((l) => {
    const q = search.toLowerCase();
    const matchesSearch =
      l.name.toLowerCase().includes(q) ||
      (l.company && l.company.toLowerCase().includes(q)) ||
      (l.phone && l.phone.includes(q)) ||
      (l.email && l.email.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === 'all' || l.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (st: string) => {
    switch (st.toLowerCase()) {
      case 'new':
        return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
      case 'contacted':
        return { bg: '#fffbeb', text: '#d97706', border: '#fde68a' };
      case 'qualified':
        return { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' };
      case 'converted':
        return { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' };
      default:
        return { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, company, phone..."
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Pills */}
      <View style={styles.filterRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterPills}>
          {['all', 'new', 'contacted', 'qualified', 'converted', 'lost'].map((st) => (
            <TouchableOpacity
              key={st}
              style={[styles.filterPill, statusFilter === st && styles.filterPillActive]}
              onPress={() => setStatusFilter(st)}
            >
              <Text style={[styles.filterPillText, statusFilter === st && styles.filterPillTextActive]}>
                {st}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Leads List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7c3aed" />
        </View>
      ) : filteredLeads.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No leads found</Text>
          <Text style={styles.emptySubtitle}>Try adjusting your search or add a new lead.</Text>
          <TouchableOpacity style={styles.emptyAddBtn} onPress={openCreateModal}>
            <Text style={styles.emptyAddBtnText}>+ Add New Lead</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredLeads}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7c3aed']} />}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const colors = getStatusColor(item.status);
            return (
              <TouchableOpacity
                style={styles.leadCard}
                onPress={() => navigation.navigate('LeadDetail', { leadId: item.id })}
                activeOpacity={0.8}
              >
                <View style={styles.cardTop}>
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarLetter}>{item.name.charAt(0).toUpperCase()}</Text>
                  </View>

                  <View style={styles.leadMain}>
                    <View style={styles.titleRow}>
                      <Text style={styles.leadName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: colors.bg, borderColor: colors.border },
                        ]}
                      >
                        <Text style={[styles.statusText, { color: colors.text }]}>{item.status}</Text>
                      </View>
                    </View>

                    {item.company ? (
                      <Text style={styles.companyText} numberOfLines={1}>
                        {item.company}
                      </Text>
                    ) : null}
                  </View>
                </View>

                {/* Card Details Row */}
                <View style={styles.cardBottom}>
                  <View style={styles.metaRow}>
                    {item.phone ? (
                      <View style={styles.metaItem}>
                        <Ionicons name="call-outline" size={12} color="#64748b" />
                        <Text style={styles.metaText}>{item.phone}</Text>
                      </View>
                    ) : null}
                    <View style={styles.metaItem}>
                      <Ionicons name="globe-outline" size={12} color="#64748b" />
                      <Text style={styles.metaText}>{item.source}</Text>
                    </View>
                  </View>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionBtn}>
                      <Ionicons name="pencil-outline" size={14} color="#64748b" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteLead(item)} style={styles.actionBtn}>
                      <Ionicons name="trash-outline" size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={openCreateModal} activeOpacity={0.85}>
        <Ionicons name="add" size={26} color="#ffffff" />
      </TouchableOpacity>

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingLead ? 'Edit Lead' : 'Create New Lead'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ramesh Patel" />

              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+91-9876543210"
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="ramesh@company.in"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Company</Text>
              <TextInput style={styles.input} value={company} onChangeText={setCompany} placeholder="Patel Corp" />

              <Text style={styles.label}>Source</Text>
              <View style={styles.pillsRow}>
                {['web_form', 'facebook', 'google', 'manual', 'indiamart'].map((src) => (
                  <TouchableOpacity
                    key={src}
                    style={[styles.modalPill, source === src && styles.modalPillActive]}
                    onPress={() => setSource(src)}
                  >
                    <Text style={[styles.modalPillText, source === src && styles.modalPillTextActive]}>
                      {src.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Status</Text>
              <View style={styles.pillsRow}>
                {['new', 'contacted', 'qualified', 'converted', 'lost'].map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.modalPill, status === st && styles.modalPillActive]}
                    onPress={() => setStatus(st)}
                  >
                    <Text style={[styles.modalPillText, status === st && styles.modalPillTextActive]}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveLead} disabled={saving} style={styles.saveBtn}>
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Lead</Text>
                )}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0f172a',
  },
  filterRow: {
    marginBottom: 8,
  },
  filterPills: {
    paddingHorizontal: 16,
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterPillActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'capitalize',
  },
  filterPillTextActive: {
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  emptyAddBtn: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: '#7c3aed',
    borderRadius: 8,
  },
  emptyAddBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
    gap: 10,
  },
  leadCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: 16,
    fontWeight: '800',
    color: '#7c3aed',
  },
  leadMain: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leadName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  companyText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: '#64748b',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
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
    maxHeight: '85%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalForm: {
    padding: 18,
    maxHeight: 380,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginTop: 10,
    marginBottom: 4,
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
    color: '#0f172a',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  modalPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  modalPillActive: {
    backgroundColor: '#7c3aed',
  },
  modalPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textTransform: 'capitalize',
  },
  modalPillTextActive: {
    color: '#ffffff',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
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
