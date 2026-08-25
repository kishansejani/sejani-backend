import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Bell, Sprout, ShieldCheck, Users, User } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

import { LoginScreen } from '../screens/auth/LoginScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { TasksScreen } from '../screens/tasks/TasksScreen';
import { FarmingScreen } from '../screens/farming/FarmingScreen';
import { PersonalRecordsScreen } from '../screens/personal/PersonalRecordsScreen';
import { FamilyDirectoryScreen } from '../screens/family/FamilyDirectoryScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

import { useLanguage } from '../context/LanguageContext';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabs = () => {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const bottomInset = insets.bottom > 0 ? insets.bottom : (Platform.OS === 'android' ? 12 : 8);
  const tabHeight = 60 + bottomInset;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.accentDark,
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: tabHeight,
          paddingBottom: Math.max(bottomInset, 8),
          paddingTop: 6,
          borderTopWidth: 1,
          elevation: 16,
          shadowColor: Colors.shadowColor,
          shadowOpacity: 0.12,
          shadowRadius: 8,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 4,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('tabHome', 'હોમ'),
          tabBarIcon: ({ color, focused }) => (
            <Home color={color} size={20} strokeWidth={focused ? 2.5 : 1.8} />
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarLabel: t('tabAlerts', '🔔 એલર્ટ્સ'),
          tabBarIcon: ({ color, focused }) => (
            <Bell color={color} size={20} strokeWidth={focused ? 2.5 : 1.8} />
          ),
        }}
      />
      <Tab.Screen
        name="Farming"
        component={FarmingScreen}
        options={{
          tabBarLabel: t('tabFarming', '🌾 ખેતીવાડી'),
          tabBarIcon: ({ color, focused }) => (
            <Sprout color={color} size={20} strokeWidth={focused ? 2.5 : 1.8} />
          ),
        }}
      />
      <Tab.Screen
        name="PersonalVault"
        component={PersonalRecordsScreen}
        options={{
          tabBarLabel: t('tabVault', 'મારી તિજોરી'),
          tabBarIcon: ({ color, focused }) => (
            <ShieldCheck color={color} size={20} strokeWidth={focused ? 2.5 : 1.8} />
          ),
        }}
      />
      <Tab.Screen
        name="FamilyDirectory"
        component={FamilyDirectoryScreen}
        options={{
          tabBarLabel: t('tabFamily', 'પરિવાર'),
          tabBarIcon: ({ color, focused }) => (
            <Users color={color} size={20} strokeWidth={focused ? 2.5 : 1.8} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('tabProfile', 'પ્રોફાઇલ'),
          tabBarIcon: ({ color, focused }) => (
            <User color={color} size={20} strokeWidth={focused ? 2.5 : 1.8} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>જય શ્રી કૃષ્ણ • તમારું સ્વાગત છે...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
