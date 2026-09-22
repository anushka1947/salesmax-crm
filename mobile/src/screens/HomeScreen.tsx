import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { DashboardStats, Task, Activity } from '../types/crm';
import { QuickAddModal } from '../components/QuickAddModal';

export default function HomeScreen({ navigation }: any) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setError(null);
    try {
      const [statsData, tasksData] = await Promise.all([
        api.getDashboardStats(),
        api.getTasks('Pending'),
      ]);
      setStats(statsData);
      setTasks(tasksData.slice(0, 5));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboard();
  }, []);

  const handleToggleTask = async (taskId: number) => {
    try {
      await api.toggleTask(taskId);
      loadDashboard();
    } catch (err: any) {
      Alert.alert('Error', 'Failed to update task: ' + err.message);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'call':
        return <Ionicons name="call" size={14} color="#2563eb" />;
      case 'whatsapp':
        return <Ionicons name="logo-whatsapp" size={14} color="#16a34a" />;
      case 'stage_change':
        return <Ionicons name="trending-up" size={14} color="#7c3aed" />;
      default:
        return <Ionicons name="document-text" size={14} color="#64748b" />;
    }
  };

  if (loading && !stats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Connecting to SalesMax API...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7c3aed']} />}
      >
        {/* Error Banner */}
        {error && (
          <TouchableOpacity onPress={loadDashboard} style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color="#dc2626" />
            <Text style={styles.errorText} numberOfLines={3}>
              {error}
            </Text>
            <Ionicons name="refresh" size={16} color="#dc2626" />
          </TouchableOpacity>
        )}

        {/* Sales Greeting Header */}
        <View style={styles.greetingHeader}>
          <View>
            <Text style={styles.greetingSub}>Sales Operating System</Text>
            <Text style={styles.greetingTitle}>Hello, Alex Sharma 👋</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveText}>FastAPI</Text>
          </View>
        </View>

        {/* KPI Metrics Grid */}
        <View style={styles.metricsGrid}>
          {/* Total Leads */}
          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => navigation.navigate('Leads')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.metricLabel}>Total Leads</Text>
              <View style={[styles.iconBox, { backgroundColor: '#f5f3ff' }]}>
                <Ionicons name="people" size={16} color="#7c3aed" />
              </View>
            </View>
            <Text style={styles.metricVal}>{stats?.total_leads ?? 0}</Text>
            <Text style={styles.metricHint}>In sales funnel &rarr;</Text>
          </TouchableOpacity>

          {/* Active Pipeline Value */}
          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => navigation.navigate('Pipeline')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.metricLabel}>Active Pipeline</Text>
              <View style={[styles.iconBox, { backgroundColor: '#ecfdf5' }]}>
                <Ionicons name="cash" size={16} color="#059669" />
              </View>
            </View>
            <Text style={styles.metricVal}>
              ₹{((stats?.pipeline_value ?? 0) / 1000).toFixed(0)}k
            </Text>
            <Text style={[styles.metricHint, { color: '#059669' }]}>
              {stats?.active_deals ?? 0} active deals
            </Text>
          </TouchableOpacity>

          {/* Closed Revenue */}
          <View style={styles.metricCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.metricLabel}>Closed Revenue</Text>
              <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}>
                <Ionicons name="trophy" size={16} color="#2563eb" />
              </View>
            </View>
            <Text style={styles.metricVal}>
              ₹{((stats?.won_value ?? 0) / 1000).toFixed(0)}k
            </Text>
            <Text style={[styles.metricHint, { color: '#2563eb' }]}>
              {stats?.won_deals ?? 0} deals won ({stats?.conversion_rate ?? 0}%)
            </Text>
          </View>

          {/* Follow-ups Due */}
          <TouchableOpacity
            style={styles.metricCard}
            onPress={() => navigation.navigate('Tasks')}
            activeOpacity={0.8}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.metricLabel}>Tasks Due</Text>
              <View style={[styles.iconBox, { backgroundColor: '#fffbeb' }]}>
                <Ionicons name="time" size={16} color="#d97706" />
              </View>
            </View>
            <Text style={styles.metricVal}>{stats?.tasks_due_today ?? 0}</Text>
            <Text style={[styles.metricHint, { color: '#d97706' }]}>Action items &rarr;</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Follow-ups Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Follow-ups</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {tasks.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="checkmark-done-circle" size={28} color="#10b981" />
              <Text style={styles.emptyText}>All follow-ups for today completed!</Text>
            </View>
          ) : (
            tasks.map((task) => (
              <View key={task.id} style={styles.taskCard}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => handleToggleTask(task.id)}
                >
                  <Ionicons name="square-outline" size={20} color="#94a3b8" />
                </TouchableOpacity>
                <View style={styles.taskInfo}>
                  <Text style={styles.taskTitle} numberOfLines={1}>
                    {task.title}
                  </Text>
                  <View style={styles.taskMeta}>
                    <Text style={styles.channelBadge}>{task.type}</Text>
                    {task.due_date && <Text style={styles.dueText}>Due: {task.due_date}</Text>}
                  </View>
                </View>
                <View style={[styles.priorityBadge, task.priority === 'High' && styles.highPriority]}>
                  <Text style={styles.priorityText}>{task.priority}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Recent Activities Feed */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live Activity Stream</Text>
          </View>

          {!stats?.recent_activities || stats.recent_activities.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No recent activity yet.</Text>
            </View>
          ) : (
            stats.recent_activities.slice(0, 5).map((act) => (
              <View key={act.id} style={styles.activityCard}>
                <View style={styles.activityIcon}>{getActivityIcon(act.type)}</View>
                <View style={styles.activityBody}>
                  <Text style={styles.activityTitle} numberOfLines={1}>
                    {act.title}
                  </Text>
                  {act.description ? (
                    <Text style={styles.activityDesc} numberOfLines={2}>
                      {act.description}
                    </Text>
                  ) : null}
                  <Text style={styles.activityTime}>
                    {new Date(act.created_at).toLocaleTimeString([], {
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

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setQuickAddVisible(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>

      {/* Quick Add Modal */}
      <QuickAddModal
        visible={quickAddVisible}
        onClose={() => setQuickAddVisible(false)}
        onSuccess={loadDashboard}
      />
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
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 80,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 11,
    color: '#b91c1c',
    lineHeight: 16,
  },
  greetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingSub: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ede9fe',
    gap: 6,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7c3aed',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
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
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 8,
  },
  metricHint: {
    fontSize: 10,
    color: '#7c3aed',
    fontWeight: '600',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  viewAllText: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 6,
  },
  emptyText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 8,
    gap: 10,
  },
  checkbox: {
    padding: 2,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  channelBadge: {
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  dueText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  priorityBadge: {
    backgroundColor: '#f8fafc',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  highPriority: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    marginBottom: 8,
    gap: 10,
  },
  activityIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  activityBody: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  activityDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
  },
  activityTime: {
    fontSize: 9,
    color: '#94a3b8',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#7c3aed',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7c3aed',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
});
