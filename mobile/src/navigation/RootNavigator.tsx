import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform, ImageBackground, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Bell, Sprout, ShieldCheck, User } from 'lucide-react-native';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

import { LoginScreen } from '../screens/auth/LoginScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { TasksScreen } from '../screens/tasks/TasksScreen';
import { FarmingScreen } from '../screens/farming/FarmingScreen';
import { PersonalRecordsScreen } from '../screens/personal/PersonalRecordsScreen';
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
          backgroundColor: '#FFFFFF',
          borderTopColor: 'rgba(226, 232, 240, 0.8)',
          height: tabHeight,
          paddingBottom: Math.max(bottomInset, 8),
          paddingTop: 8,
          borderTopWidth: 1,
          elevation: 20,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 2,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 3,
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
            <View style={focused ? styles.activeTabPill : styles.inactiveTabPill}>
              <Home color={color} size={focused ? 21 : 19} strokeWidth={focused ? 2.5 : 1.8} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarLabel: t('tabAlerts', 'સૂચના'),
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeTabPill : styles.inactiveTabPill}>
              <Bell color={color} size={focused ? 21 : 19} strokeWidth={focused ? 2.5 : 1.8} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Farming"
        component={FarmingScreen}
        options={{
          tabBarLabel: t('tabFarming', 'ખેતીવાડી'),
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeTabPill : styles.inactiveTabPill}>
              <Sprout color={color} size={focused ? 21 : 19} strokeWidth={focused ? 2.5 : 1.8} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="PersonalVault"
        component={PersonalRecordsScreen}
        options={{
          tabBarLabel: t('tabVault', 'અંગત નોંધ'),
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeTabPill : styles.inactiveTabPill}>
              <ShieldCheck color={color} size={focused ? 21 : 19} strokeWidth={focused ? 2.5 : 1.8} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: t('tabProfile', 'પ્રોફાઇલ'),
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeTabPill : styles.inactiveTabPill}>
              <User color={color} size={focused ? 21 : 19} strokeWidth={focused ? 2.5 : 1.8} />
            </View>
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
      <ImageBackground
        source={require('../../assets/farm_nature_bg.jpg')}
        style={styles.loadingContainer}
        resizeMode="cover"
      >
        <View style={styles.loadingOverlay}>
          <Image
            source={require('../../assets/splash_farmer_logo.png')}
            style={styles.splashEmblem}
            resizeMode="contain"
          />
          <ActivityIndicator size="large" color="#FEF3C7" style={{ marginTop: 14 }} />
          <Text style={styles.loadingText}>જય શ્રી કૃષ્ણ • સ્વાગત છે...</Text>
          <Text style={styles.loadingSub}>PersonalInfo • ખેતી & ખાનગી પોર્ટલ</Text>
        </View>
      </ImageBackground>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 28,
    paddingVertical: 24,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  splashEmblem: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  loadingSub: {
    marginTop: 4,
    fontSize: 12,
    color: '#94A3B8',
  },
  activeTabPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inactiveTabPill: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
