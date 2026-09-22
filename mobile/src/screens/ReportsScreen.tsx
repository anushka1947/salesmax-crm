import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';
import { DashboardStats, Lead, Deal } from '../types/crm';

export default function ReportsScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [statsData, leadsData, dealsData] = await Promise.all([
        api.getDashboardStats(),
        api.getLeads(),
        api.getDeals(),
      ]);
      setStats(statsData);
      setLeads(leadsData);
      setDeals(dealsData);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Channel breakdown
  const sourceMap: Record<string, number> = {};
  leads.forEach((l) => {
    const s = l.source || 'other';
    sourceMap[s] = (sourceMap[s] || 0) + 1;
  });

  if (loading && !stats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#7c3aed']} />}
    >
      {/* Top Cards */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Pipeline Value</Text>
          <Text style={styles.kpiValue}>
            ₹{((stats?.pipeline_value ?? 0) / 1000).toFixed(0)}k
          </Text>
          <Text style={styles.kpiSub}>{stats?.active_deals ?? 0} active deals</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiLabel}>Closed Revenue</Text>
          <Text style={styles.kpiValue}>
            ₹{((stats?.won_value ?? 0) / 1000).toFixed(0)}k
          </Text>
          <Text style={[styles.kpiSub, { color: '#059669' }]}>
            {stats?.conversion_rate ?? 0}% win rate
          </Text>
        </View>
      </View>

      {/* Pipeline Stage Valuation */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pipeline Stages Valuation</Text>
        <Text style={styles.cardSub}>Deal volume and value per stage</Text>

        <View style={styles.stageList}>
          {stats?.deals_by_stage?.map((st) => (
            <View key={st.stage} style={styles.stageItem}>
              <View>
                <Text style={styles.stageName}>{st.stage}</Text>
                <Text style={styles.stageDealsCount}>{st.count} opportunities</Text>
              </View>
              <Text style={styles.stageValue}>₹{st.total_value.toLocaleString('en-IN')}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Lead Acquisition Sources */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Lead Acquisition Channels</Text>
        <Text style={styles.cardSub}>Volume by inbound marketing source</Text>

        <View style={styles.channelList}>
          {Object.entries(sourceMap).map(([src, count]) => {
            const pct = leads.length > 0 ? Math.round((count / leads.length) * 100) : 0;
            return (
              <View key={src} style={styles.channelItem}>
                <View style={styles.channelHeader}>
                  <Text style={styles.channelName}>{src.replace('_', ' ')}</Text>
                  <Text style={styles.channelCount}>
                    {count} leads ({pct}%)
                  </Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${Math.max(pct, 5)}%` }]} />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Conversion Funnel */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sales Conversion Funnel</Text>
        <Text style={styles.cardSub}>Capture &rarr; Qualification &rarr; Deal Won</Text>

        <View style={styles.funnelSteps}>
          <View style={styles.funnelStep}>
            <Text style={styles.stepNumber}>1</Text>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>Leads Ingested</Text>
              <Text style={styles.stepValue}>{leads.length}</Text>
            </View>
          </View>

          <View style={styles.funnelStep}>
            <Text style={[styles.stepNumber, { backgroundColor: '#f5f3ff', color: '#7c3aed' }]}>2</Text>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>Qualified Prospects</Text>
              <Text style={styles.stepValue}>
                {leads.filter((l) => l.status === 'qualified' || l.status === 'converted').length}
              </Text>
            </View>
          </View>

          <View style={styles.funnelStep}>
            <Text style={[styles.stepNumber, { backgroundColor: '#eff6ff', color: '#2563eb' }]}>3</Text>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>Deals Opened</Text>
              <Text style={styles.stepValue}>{deals.length}</Text>
            </View>
          </View>

          <View style={styles.funnelStep}>
            <Text style={[styles.stepNumber, { backgroundColor: '#ecfdf5', color: '#059669' }]}>4</Text>
            <View style={styles.stepInfo}>
              <Text style={styles.stepTitle}>Closed Won Contracts</Text>
              <Text style={styles.stepValue}>{stats?.won_deals ?? 0}</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
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
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  kpiLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '600',
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 4,
  },
  kpiSub: {
    fontSize: 10,
    fontWeight: '600',
    color: '#7c3aed',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 12,
  },
  stageList: {
    gap: 8,
  },
  stageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 10,
  },
  stageName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  stageDealsCount: {
    fontSize: 10,
    color: '#64748b',
  },
  stageValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7c3aed',
  },
  channelList: {
    gap: 10,
  },
  channelItem: {
    gap: 4,
  },
  channelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  channelName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
    textTransform: 'capitalize',
  },
  channelCount: {
    fontSize: 11,
    color: '#64748b',
  },
  barTrack: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 3,
  },
  funnelSteps: {
    gap: 10,
  },
  funnelStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  stepInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
  },
  stepValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
});
