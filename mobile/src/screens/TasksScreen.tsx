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
import { Task } from '../types/crm';

export default function TasksScreen({ navigation }: any) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [channelFilter, setChannelFilter] = useState('All');

  // Add Task Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Call');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchTasks = async () => {
    try {
      const data = await api.getTasks();
      setTasks(data);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTasks();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTasks();
  }, []);

  const handleToggle = async (taskId: number) => {
    try {
      await api.toggleTask(taskId);
      fetchTasks();
    } catch (err: any) {
      Alert.alert('Error', 'Failed to toggle task status: ' + err.message);
    }
  };

  const handleDelete = (task: Task) => {
    Alert.alert('Delete Task', `Delete "${task.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteTask(task.id);
            fetchTasks();
          } catch (err: any) {
            Alert.alert('Error', 'Failed to delete task: ' + err.message);
          }
        },
      },
    ]);
  };

  const handleCreateTask = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Task title is required');
      return;
    }
    setSaving(true);
    try {
      await api.createTask({
        title: title.trim(),
        type,
        priority,
        due_date: dueDate.trim() || undefined,
        status: 'Pending',
      });
      setModalVisible(false);
      setTitle('');
      setDueDate('');
      fetchTasks();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus =
      activeTab === 'pending' ? t.status === 'Pending' : t.status === 'Completed';

    const matchesChannel =
      channelFilter === 'All' || t.type.toLowerCase() === channelFilter.toLowerCase();

    return matchesStatus && matchesChannel;
  });

  const getChannelIcon = (ch: string) => {
    switch (ch.toLowerCase()) {
      case 'call':
        return <Ionicons name="call" size={14} color="#2563eb" />;
      case 'whatsapp':
        return <Ionicons name="logo-whatsapp" size={14} color="#16a34a" />;
      case 'email':
        return <Ionicons name="mail" size={14} color="#7c3aed" />;
      case 'meeting':
        return <Ionicons name="people" size={14} color="#d97706" />;
      default:
        return <Ionicons name="checkbox" size={14} color="#64748b" />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Segmented Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'pending' && styles.tabBtnActive]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            Pending ({tasks.filter((t) => t.status === 'Pending').length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'completed' && styles.tabBtnActive]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
            Completed ({tasks.filter((t) => t.status === 'Completed').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Channel Filters */}
      <View style={styles.channelRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.channelContent}>
          {['All', 'Call', 'WhatsApp', 'Email', 'Meeting'].map((ch) => (
            <TouchableOpacity
              key={ch}
              style={[styles.channelPill, channelFilter === ch && styles.channelPillActive]}
              onPress={() => setChannelFilter(ch)}
            >
              <Text style={[styles.channelText, channelFilter === ch && styles.channelTextActive]}>
                {ch}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tasks List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7c3aed" />
        </View>
      ) : filteredTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-done-circle-outline" size={48} color="#cbd5e1" />
          <Text style={styles.emptyTitle}>
            {activeTab === 'pending' ? 'No pending tasks!' : 'No completed tasks yet.'}
          </Text>
          <Text style={styles.emptySubtitle}>Keep customer follow-ups on track with scheduled actions.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.emptyBtnText}>+ Add Task</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7c3aed']} />}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.taskCard}>
              <TouchableOpacity style={styles.checkbox} onPress={() => handleToggle(item.id)}>
                <Ionicons
                  name={item.status === 'Completed' ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={item.status === 'Completed' ? '#7c3aed' : '#94a3b8'}
                />
              </TouchableOpacity>

              <View style={styles.taskBody}>
                <Text
                  style={[
                    styles.taskTitle,
                    item.status === 'Completed' && styles.taskTitleCompleted,
                  ]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>

                <View style={styles.taskMeta}>
                  <View style={styles.channelTag}>
                    {getChannelIcon(item.type)}
                    <Text style={styles.channelLabel}>{item.type}</Text>
                  </View>

                  {item.due_date && (
                    <Text style={styles.dueDateText}>Due: {item.due_date}</Text>
                  )}
                </View>
              </View>

              <View style={styles.cardRight}>
                <View
                  style={[
                    styles.priorityBadge,
                    item.priority === 'High' && styles.priorityHigh,
                  ]}
                >
                  <Text style={styles.priorityText}>{item.priority}</Text>
                </View>

                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={15} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={26} color="#ffffff" />
      </TouchableOpacity>

      {/* Add Task Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Task / Follow-up</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <Text style={styles.label}>Task Title *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Follow up on demo feedback"
              />

              <Text style={styles.label}>Action Channel</Text>
              <View style={styles.pillsRow}>
                {['Call', 'WhatsApp', 'Email', 'Meeting'].map((ch) => (
                  <TouchableOpacity
                    key={ch}
                    style={[styles.modalPill, type === ch && styles.modalPillActive]}
                    onPress={() => setType(ch)}
                  >
                    <Text style={[styles.modalPillText, type === ch && styles.modalPillTextActive]}>
                      {ch}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Priority</Text>
              <View style={styles.pillsRow}>
                {['High', 'Medium', 'Low'].map((pr) => (
                  <TouchableOpacity
                    key={pr}
                    style={[styles.modalPill, priority === pr && styles.modalPillActive]}
                    onPress={() => setPriority(pr)}
                  >
                    <Text style={[styles.modalPillText, priority === pr && styles.modalPillTextActive]}>
                      {pr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Due Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="2026-09-25"
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateTask} disabled={saving} style={styles.saveBtn}>
                {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.saveBtnText}>Save Task</Text>}
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#f5f3ff',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#7c3aed',
    fontWeight: '700',
  },
  channelRow: {
    marginTop: 8,
    marginBottom: 4,
  },
  channelContent: {
    paddingHorizontal: 16,
    gap: 6,
  },
  channelPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  channelPillActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  channelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  channelTextActive: {
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
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    gap: 12,
  },
  checkbox: {
    padding: 2,
  },
  taskBody: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  channelTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  channelLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  dueDateText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#f1f5f9',
  },
  priorityHigh: {
    backgroundColor: '#fef2f2',
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
  },
  deleteBtn: {
    padding: 2,
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
});
