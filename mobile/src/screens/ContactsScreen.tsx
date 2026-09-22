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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { Contact } from '../types/crm';

export default function ContactsScreen({ navigation }: any) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Add Contact Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [designation, setDesignation] = useState('');
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchContacts = async () => {
    try {
      const data = await api.getContacts();
      setContacts(data);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchContacts();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchContacts();
  }, []);

  const handleCreateContact = async () => {
    if (!firstName.trim()) {
      Alert.alert('Validation Error', 'First name is required');
      return;
    }
    setSaving(true);
    try {
      await api.createContact({
        first_name: firstName.trim(),
        last_name: lastName.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        company_name: company.trim() || undefined,
        designation: designation.trim() || undefined,
        city: city.trim() || undefined,
      });
      setModalVisible(false);
      setFirstName('');
      setLastName('');
      setPhone('');
      setEmail('');
      setCompany('');
      setDesignation('');
      setCity('');
      fetchContacts();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save contact');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContact = (c: Contact) => {
    Alert.alert('Delete Contact', `Delete ${c.first_name} ${c.last_name || ''}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteContact(c.id);
            fetchContacts();
          } catch (err: any) {
            Alert.alert('Error', 'Failed to delete contact: ' + err.message);
          }
        },
      },
    ]);
  };

  const filteredContacts = contacts.filter((c) => {
    const q = search.toLowerCase();
    const fullName = `${c.first_name} ${c.last_name || ''}`.toLowerCase();
    return (
      fullName.includes(q) ||
      (c.company_name && c.company_name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.designation && c.designation.toLowerCase().includes(q))
    );
  });

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color="#94a3b8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts..."
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Contacts List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7c3aed" />
        </View>
      ) : filteredContacts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="person-circle-outline" size={48} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No contacts found</Text>
          <Text style={styles.emptySubtitle}>Convert leads or add new customer account contacts.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.emptyBtnText}>+ Add Contact</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7c3aed']} />}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.contactCard}>
              <View style={styles.cardHeader}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarLetter}>{item.first_name.charAt(0).toUpperCase()}</Text>
                </View>

                <View style={styles.contactMain}>
                  <Text style={styles.contactName}>
                    {item.first_name} {item.last_name || ''}
                  </Text>
                  {item.designation ? (
                    <Text style={styles.designationText}>{item.designation}</Text>
                  ) : null}
                  {item.company_name ? (
                    <Text style={styles.companyText}>{item.company_name}</Text>
                  ) : null}
                </View>

                <TouchableOpacity onPress={() => handleDeleteContact(item)} style={styles.trashBtn}>
                  <Ionicons name="trash-outline" size={15} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              {/* Action Buttons & Details */}
              <View style={styles.cardFooter}>
                <View style={styles.infoRow}>
                  {item.city && (
                    <View style={styles.infoItem}>
                      <Ionicons name="location-outline" size={12} color="#64748b" />
                      <Text style={styles.infoText}>{item.city}</Text>
                    </View>
                  )}
                  {item.lead_id && (
                    <View style={styles.leadTag}>
                      <Text style={styles.leadTagText}>From Lead #{item.lead_id}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.quickDialRow}>
                  {item.phone && (
                    <TouchableOpacity
                      style={styles.dialBtn}
                      onPress={() => Linking.openURL(`tel:${item.phone}`)}
                    >
                      <Ionicons name="call" size={13} color="#2563eb" />
                    </TouchableOpacity>
                  )}
                  {item.phone && (
                    <TouchableOpacity
                      style={styles.dialBtn}
                      onPress={() =>
                        Linking.openURL(
                          `https://wa.me/${item.phone?.replace(/[^0-9]/g, '')}`
                        )
                      }
                    >
                      <Ionicons name="logo-whatsapp" size={13} color="#16a34a" />
                    </TouchableOpacity>
                  )}
                  {item.email && (
                    <TouchableOpacity
                      style={styles.dialBtn}
                      onPress={() => Linking.openURL(`mailto:${item.email}`)}
                    >
                      <Ionicons name="mail" size={13} color="#7c3aed" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={26} color="#ffffff" />
      </TouchableOpacity>

      {/* Add Contact Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Contact Account</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
              <View style={styles.nameRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>First Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="e.g. Priya"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Sharma"
                  />
                </View>
              </View>

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
                placeholder="priya@company.in"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Company</Text>
              <TextInput
                style={styles.input}
                value={company}
                onChangeText={setCompany}
                placeholder="Apex Technologies"
              />

              <Text style={styles.label}>Designation / Role</Text>
              <TextInput
                style={styles.input}
                value={designation}
                onChangeText={setDesignation}
                placeholder="Procurement Head"
              />

              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={setCity}
                placeholder="Bengaluru"
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateContact} disabled={saving} style={styles.saveBtn}>
                {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Save Contact</Text>}
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
  },
  emptyBtn: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: '#7c3aed',
    borderRadius: 8,
  },
  emptyBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
    gap: 10,
  },
  contactCard: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
  },
  contactMain: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  designationText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7c3aed',
    marginTop: 1,
  },
  companyText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  trashBtn: {
    padding: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  infoText: {
    fontSize: 11,
    color: '#64748b',
  },
  leadTag: {
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  leadTagText: {
    fontSize: 9,
    color: '#7c3aed',
    fontWeight: '700',
  },
  quickDialRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dialBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
    maxHeight: 360,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 10,
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
