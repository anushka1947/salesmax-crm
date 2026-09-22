import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api';

export default function MoreScreen({ navigation }: any) {
  const [apiUrl, setApiUrl] = useState(api.getBaseUrl());
  const [testing, setTesting] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const handleSaveApiUrl = () => {
    if (!apiUrl.trim()) {
      Alert.alert('Error', 'API base URL cannot be empty');
      return;
    }
    api.setBaseUrl(apiUrl.trim());
    Alert.alert('Saved', 'API base URL updated to: ' + apiUrl.trim());
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      api.setBaseUrl(apiUrl.trim());
      const stats = await api.getDashboardStats();
      Alert.alert(
        'Connection Successful! 🎉',
        `Connected to FastAPI backend.\nTotal Leads in DB: ${stats.total_leads}\nActive Pipeline: ₹${stats.pipeline_value.toLocaleString('en-IN')}`
      );
    } catch (err: any) {
      Alert.alert('Connection Failed', err.message);
    } finally {
      setTesting(false);
    }
  };

  const handleSimulateInboundLead = async (channel: string) => {
    setSimulating(true);
    try {
      const sample = {
        name: channel === 'Meta' ? 'Deepak Chopra' : 'Rohit Singhania',
        phone: '+91-9899887766',
        email: channel === 'Meta' ? 'deepak@chopra-enterprises.com' : 'rohit@singhania-logistics.in',
        company: channel === 'Meta' ? 'Chopra Enterprises' : 'Singhania Logistics',
        source: channel === 'Meta' ? 'facebook' : 'indiamart',
        status: 'new',
      };

      const created = await api.createLead(sample);
      await api.createActivity({
        type: 'lead_created',
        title: `Inbound Lead Ingested from ${channel}`,
        description: `Captured prospect: ${created.name} (${created.company}). Status: new.`,
        lead_id: created.id,
      });

      Alert.alert(
        'Lead Ingested! 🚀',
        `Successfully captured "${created.name}" into PostgreSQL database via ${channel} inbound hook! Refresh Leads tab to view.`
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to simulate lead');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Navigation Section */}
      <View style={styles.card}>
        <Text style={styles.sectionHeading}>CRM Modules</Text>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Contacts')}
        >
          <View style={[styles.navIconBox, { backgroundColor: '#ecfdf5' }]}>
            <Ionicons name="person-circle" size={20} color="#059669" />
          </View>
          <View style={styles.navTextContainer}>
            <Text style={styles.navTitle}>Contacts Registry</Text>
            <Text style={styles.navSub}>Verified accounts & converted stakeholders</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Reports')}
        >
          <View style={[styles.navIconBox, { backgroundColor: '#f5f3ff' }]}>
            <Ionicons name="bar-chart" size={20} color="#7c3aed" />
          </View>
          <View style={styles.navTextContainer}>
            <Text style={styles.navTitle}>Reports & Intelligence</Text>
            <Text style={styles.navSub}>Funnel conversion and source breakdown</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* Integrations Hub */}
      <View style={styles.card}>
        <Text style={styles.sectionHeading}>Integrations & Lead Hooks</Text>
        <Text style={styles.cardSub}>
          Demo-ready marketing capture channels. Test live webhook ingestion directly!
        </Text>

        {/* Meta Ads Card */}
        <View style={styles.integrationItem}>
          <View style={[styles.integrationIcon, { backgroundColor: '#eff6ff' }]}>
            <Ionicons name="logo-facebook" size={20} color="#2563eb" />
          </View>
          <View style={styles.integrationInfo}>
            <Text style={styles.integrationTitle}>Meta Lead Ads</Text>
            <Text style={styles.integrationStatus}>Active (Instant Webhook)</Text>
          </View>
          <TouchableOpacity
            style={styles.simulateBtn}
            onPress={() => handleSimulateInboundLead('Meta')}
            disabled={simulating}
          >
            <Text style={styles.simulateBtnText}>Simulate</Text>
          </TouchableOpacity>
        </View>

        {/* IndiaMART Card */}
        <View style={styles.integrationItem}>
          <View style={[styles.integrationIcon, { backgroundColor: '#fffbeb' }]}>
            <Ionicons name="globe-outline" size={20} color="#d97706" />
          </View>
          <View style={styles.integrationInfo}>
            <Text style={styles.integrationTitle}>IndiaMART Marketplace</Text>
            <Text style={styles.integrationStatus}>Active (Buyer Inquiries)</Text>
          </View>
          <TouchableOpacity
            style={styles.simulateBtn}
            onPress={() => handleSimulateInboundLead('IndiaMART')}
            disabled={simulating}
          >
            <Text style={styles.simulateBtnText}>Simulate</Text>
          </TouchableOpacity>
        </View>

        {/* WhatsApp Business Card */}
        <View style={styles.integrationItem}>
          <View style={[styles.integrationIcon, { backgroundColor: '#ecfdf5' }]}>
            <Ionicons name="logo-whatsapp" size={20} color="#16a34a" />
          </View>
          <View style={styles.integrationInfo}>
            <Text style={styles.integrationTitle}>WhatsApp Business API</Text>
            <Text style={styles.integrationStatus}>Ready (Template Outreach)</Text>
          </View>
        </View>

        {/* JustDial Card */}
        <View style={styles.integrationItem}>
          <View style={[styles.integrationIcon, { backgroundColor: '#fef2f2' }]}>
            <Ionicons name="call-outline" size={20} color="#dc2626" />
          </View>
          <View style={styles.integrationInfo}>
            <Text style={styles.integrationTitle}>JustDial Directory</Text>
            <Text style={styles.integrationStatus}>Active (Telecalling)</Text>
          </View>
        </View>
      </View>

      {/* API Configuration Card */}
      <View style={styles.card}>
        <Text style={styles.sectionHeading}>FastAPI Server Configuration</Text>
        <Text style={styles.cardSub}>
          Connect mobile to your computer. For Android emulator use http://10.0.2.2:8000. For physical phone use your PC LAN IPv4 (e.g. http://192.168.x.x:8000).
        </Text>

        <TextInput
          style={styles.apiInput}
          value={apiUrl}
          onChangeText={setApiUrl}
          placeholder="http://10.0.2.2:8000"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.apiActions}>
          <TouchableOpacity style={styles.saveUrlBtn} onPress={handleSaveApiUrl}>
            <Text style={styles.saveUrlText}>Save URL</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testBtn}
            onPress={handleTestConnection}
            disabled={testing}
          >
            {testing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.testBtnText}>Test Connection</Text>
            )}
          </TouchableOpacity>
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
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 14,
    lineHeight: 16,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    gap: 12,
  },
  navIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTextContainer: {
    flex: 1,
  },
  navTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  navSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  integrationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    gap: 12,
  },
  integrationIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  integrationInfo: {
    flex: 1,
  },
  integrationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  integrationStatus: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
    marginTop: 1,
  },
  simulateBtn: {
    backgroundColor: '#f5f3ff',
    borderWidth: 1,
    borderColor: '#ede9fe',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  simulateBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7c3aed',
  },
  apiInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: 'monospace',
    color: '#0f172a',
    marginBottom: 12,
  },
  apiActions: {
    flexDirection: 'row',
    gap: 10,
  },
  saveUrlBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    alignItems: 'center',
  },
  saveUrlText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  testBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#7c3aed',
    borderRadius: 10,
    alignItems: 'center',
  },
  testBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
});
