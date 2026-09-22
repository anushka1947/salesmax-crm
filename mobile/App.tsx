import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import LeadsScreen from './src/screens/LeadsScreen';
import LeadDetailScreen from './src/screens/LeadDetailScreen';
import PipelineScreen from './src/screens/PipelineScreen';
import TasksScreen from './src/screens/TasksScreen';
import MoreScreen from './src/screens/MoreScreen';
import ContactsScreen from './src/screens/ContactsScreen';
import ReportsScreen from './src/screens/ReportsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function LeadsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTitleStyle: { fontWeight: '700', color: '#0f172a' },
        headerTintColor: '#7c3aed',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="LeadsList"
        component={LeadsScreen}
        options={{ title: 'Leads Funnel' }}
      />
      <Stack.Screen
        name="LeadDetail"
        component={LeadDetailScreen}
        options={{ title: 'Customer 360' }}
      />
    </Stack.Navigator>
  );
}

function MoreStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#ffffff' },
        headerTitleStyle: { fontWeight: '700', color: '#0f172a' },
        headerTintColor: '#7c3aed',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="MoreHome"
        component={MoreScreen}
        options={{ title: 'More Operations' }}
      />
      <Stack.Screen
        name="Contacts"
        component={ContactsScreen}
        options={{ title: 'Contacts Directory' }}
      />
      <Stack.Screen
        name="Reports"
        component={ReportsScreen}
        options={{ title: 'Reports & Funnel' }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerStyle: { backgroundColor: '#ffffff' },
            headerTitleStyle: { fontWeight: '700', color: '#0f172a' },
            headerShadowVisible: false,
            tabBarActiveTintColor: '#7c3aed',
            tabBarInactiveTintColor: '#94a3b8',
            tabBarStyle: {
              backgroundColor: '#ffffff',
              borderTopColor: '#f1f5f9',
              height: 58,
              paddingBottom: 6,
              paddingTop: 6,
            },
            tabBarLabelStyle: {
              fontSize: 10,
              fontWeight: '600',
            },
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: any = 'home';
              if (route.name === 'Home') {
                iconName = focused ? 'home' : 'home-outline';
              } else if (route.name === 'Leads') {
                iconName = focused ? 'people' : 'people-outline';
              } else if (route.name === 'Pipeline') {
                iconName = focused ? 'funnel' : 'funnel-outline';
              } else if (route.name === 'Tasks') {
                iconName = focused ? 'checkbox' : 'checkbox-outline';
              } else if (route.name === 'More') {
                iconName = focused ? 'grid' : 'grid-outline';
              }
              return <Ionicons name={iconName} size={size || 22} color={color} />;
            },
          })}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Today' }}
          />
          <Tab.Screen
            name="Leads"
            component={LeadsStackNavigator}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="Pipeline"
            component={PipelineScreen}
            options={{ title: 'Pipeline' }}
          />
          <Tab.Screen
            name="Tasks"
            component={TasksScreen}
            options={{ title: 'Tasks' }}
          />
          <Tab.Screen
            name="More"
            component={MoreStackNavigator}
            options={{ headerShown: false }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
