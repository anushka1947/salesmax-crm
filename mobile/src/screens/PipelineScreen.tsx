import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { Deal } from '../types/crm';

const STAGES = ['New', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

export default function PipelineScreen({ navigation }: any) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStage, setSelectedStage] = useState('All');

  // Add Deal Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [stage, setStage] = useState('New');
  const [expectedClose, setExpectedClose] = useState('');
  const [saving, setSaving] = useState(false);

  // Stage change picker modal
  const [changeStageDeal, setChangeStageDeal] = useState<Deal | null>(null);

  const fetchDeals = async () => {
    try {
      const data = await api.getDeals();
      setDeals(data);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to load deals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDeals();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchDeals();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDeals();
  }, []);

  const handleCreateDeal = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Deal title is required');
      return;
    }
    setSaving(true);
    try {
      await api.createDeal({
        title: title.trim(),
        value: parseFloat(value) || 0,
        stage,
        expected_close_date: expectedClose.trim() || undefined,
      });
      setModalVisible(false);
      setTitle('');
      setValue('');
      setExpectedClose('');
      fetchDeals();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save deal');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStage = async (newStage: string) => {
    if (!changeStageDeal) return;
    try {
      await api.updateDealStage(changeStageDeal.id, newStage);
      setChangeStageDeal(null);
      fetchDeals();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update stage');
    }
  };

  const handleDeleteDeal = (deal: Deal) => {
    Alert.alert('Delete Deal', `Delete opportunity "${deal.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteDeal(deal.id);
            fetchDeals();
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete deal');
          }
        },
      },
    ]);
  };

  const filteredDeals = deals.filter((d) => {
    if (selectedStage === 'All') return true;
    return d.stage.toLowerCase() === selectedStage.toLowerCase();
  });

  const totalFilteredValue = filteredDeals.reduce((sum, d) => sum + d.value, 0);

  const getStageColor = (st: string) => {
    switch (st.toLowerCase()) {
      case 'new':
        return { bg: '#eff6ff', text: '#2563eb' };
      case 'qualified':
        return { bg: '#f5f3ff', text: '#7c3aed' };
      case 'proposal':
        return { bg: '#fffbeb', text: '#d97706' };
      case 'negotiation':
        return { bg: '#eef2ff', text: '#4f46e5' };
      case 'won':
        return { bg: '#ecfdf5', text: '#059669' };
      default:
        return { bg: '#f1f5f9', text: '#64748b' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Summary Banner */}
      <View style={styles.summaryBar}>
        <View>
          <Text style={styles.summaryLabel}>
            {selectedStage === 'All' ? 'Total Pipeline Value' : `${selectedStage} Deals`}
          </Text>
          <Text style={styles.summaryValue}>₹{totalFilteredValue.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.dealCountBadge}>
          <Text style={styles.dealCountText}>{filteredDeals.length} deals</Text>
        </View>
      </View>

      {/* Stage Selector Pills */}
      <View style={styles.stagePillsRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stagePillsContent}>
          {['All', ...STAGES].map((st) => (
            <TouchableOpacity
              key={st}
              style={[styles.stagePill, selectedStage === st && styles.stagePillActive]}
              onPress={() => setSelectedStage(st)}
            >
              <Text style={[styles.stagePillText, selectedStage === st && styles.stagePillTextActive]}>
                {st}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Deals List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7c3aed" />
        </View>
      ) : filteredDeals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="funnel-outline" size={48} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>No deals in this stage</Text>
          <Text style={styles.emptySubtitle}>Add opportunities or move existing deals into this stage.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.emptyBtnText}>+ Create Deal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredDeals}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7c3aed']} />}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const colors = getStageColor(item.stage);
            return (
              <View style={styles.dealCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.dealTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <TouchableOpacity onPress={() => handleDeleteDeal(item)} style={styles.trashBtn}>
                    <Ionicons name="trash-outline" size={15} color="#94a3b8" />
                  </TouchableOpacity>
                </View>

                <View style={styles.cardMiddle}>
                  <Text style={styles.dealValue}>₹{item.value.toLocaleString('en-IN')}</Text>

                  {item.expected_close_date ? (
                    <View style={styles.dateBox}>
                      <Ionicons name="calendar-outline" size={12} color="#64748b" />
                      <Text style={styles.dateText}>{item.expected_close_date}</Text>
                    </View>
                  ) : null}
                </View>

                {/* Stage Advancement Row */}
                <View style={styles.cardFooter}>
                  <View style={[styles.stageBadge, { backgroundColor: colors.bg }]}>
                    <Text style={[styles.stageBadgeText, { color: colors.text }]}>{item.stage}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.changeStageBtn}
                    onPress={() => setChangeStageDeal(item)}
                  >
                    <Text style={styles.changeStageBtnText}>Move Stage</Text>
                    <Ionicons name="chevron-forward" size={12} color="#7c3aed" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={26} color="#ffffff" />
      </TouchableOpacity>

      {/* Stage Change Modal */}
      <Modal visible={!!changeStageDeal} transparent animationType="fade" onRequestClose={() => setChangeStageDeal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.stageModalBox}>
            <Text style={styles.modalTitle}>Update Pipeline Stage</Text>
            <Text style={styles.stageModalSub}>{changeStageDeal?.title}</Text>

            <View style={styles.stageOptionsList}>
              {STAGES.map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[
                    styles.stageOptionBtn,
                    changeStageDeal?.stage === st && styles.stageOptionBtnActive,
                  ]}
                  onPress={() => handleUpdateStage(st)}
                >
                  <Text
                    style={[
                      styles.stageOptionText,
                      changeStageDeal?.stage === st && styles.stageOptionTextActive,
                    ]}
                  >
                    {st}
                  </Text>
                  {changeStageDeal?.stage === st && <Ionicons name="checkmark" size={16} color="#7c3aed" />}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity onPress={() => setChangeStageDeal(null)} style={styles.stageCloseBtn}>
              <Text style={styles.stageCloseBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Deal Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Deal Opportunity</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <Text style={styles.label}>Opportunity Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Annual Cloud Enterprise"
              />

              <Text style={styles.label}>Deal Value (₹ INR) *</Text>
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={setValue}
                placeholder="250000"
                keyboardType="numeric"
              />

              <Text style={styles.label}>Expected Close Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={expectedClose}
                onChangeText={setExpectedClose}
                placeholder="2026-10-15"
              />

              <Text style={styles.label}>Stage</Text>
              <View style={styles.pillsRow}>
                {STAGES.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.modalPill, stage === s && styles.modalPillActive]}
                    onPress={() => setStage(s)}
                  >
                    <Text style={[styles.modalPillText, stage === s && styles.modalPillTextActive]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateDeal} disabled={saving} style={styles.saveBtn}>
                {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Save Deal</Text>}
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
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  dealCountBadge: {
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  dealCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7c3aed',
  },
  stagePillsRow: {
    marginTop: 10,
    marginBottom: 4,
  },
  stagePillsContent: {
    paddingHorizontal: 16,
    gap: 6,
  },
  stagePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  stagePillActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  stagePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  stagePillTextActive: {
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
  dealCard: {
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  dealTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  trashBtn: {
    padding: 2,
  },
  cardMiddle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  dealValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#7c3aed',
  },
  dateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#64748b',
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
  stageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stageBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  changeStageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  changeStageBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7c3aed',
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
  },
  modalPillTextActive: {
    color: '#ffffff',
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
  stageModalBox: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  stageModalSub: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 14,
  },
  stageOptionsList: {
    gap: 6,
    marginBottom: 16,
  },
  stageOptionBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
  },
  stageOptionBtnActive: {
    backgroundColor: '#f5f3ff',
    borderWidth: 1,
    borderColor: '#ede9fe',
  },
  stageOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  stageOptionTextActive: {
    color: '#7c3aed',
    fontWeight: '700',
  },
  stageCloseBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  stageCloseBtnText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
});
