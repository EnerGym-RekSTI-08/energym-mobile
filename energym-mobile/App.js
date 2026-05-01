import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

// Import Screen yang sudah dipisah
import HomeScreen from './src/screens/Home/HomeScreen';
import WorkoutScreen from './src/screens/Workout/WorkoutScreen';
import ScanQRScreen from './src/screens/QR/ScanQRScreen';
import WorkoutHistoryScreen from './src/screens/History/WorkoutHistoryScreen';
import ProfileScreen from './src/screens/Profile/ProfileScreen';
import EditProfileScreen from './src/screens/Profile/EditProfileScreen.js';
import PhysicalDataScreen from './src/screens/Profile/PhysicalDataScreen';

// Opsional: Import styles untuk tab bawah
import styles from './src/styles/globalStyles';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [navigationStack, setNavigationStack] = useState({ home: ['home'] });

  const navigate = (screen, params) => {
    setNavigationStack(prev => ({
      ...prev,
      [currentTab]: [...(prev[currentTab] || [currentTab]), { screen, params }],
    }));
  };

  const goBack = () => {
    setNavigationStack(prev => ({
      ...prev,
      [currentTab]: (prev[currentTab] || []).slice(0, -1),
    }));
  };

  const currentScreenObj = navigationStack[currentTab];
  const currentScreen = currentScreenObj && currentScreenObj.length > 0
      ? currentScreenObj[currentScreenObj.length - 1]
      : currentTab;

  const renderScreen = () => {
    const screenName = typeof currentScreen === 'string' ? currentScreen : currentScreen.screen;
    const params = typeof currentScreen === 'string' ? {} : currentScreen.params;
    const navigationObj = { navigate, goBack };

    switch (screenName) {
      case 'home': return <HomeScreen navigation={navigationObj} />;
      case 'history': return <WorkoutHistoryScreen navigation={navigationObj} />;
      case 'workout': return <WorkoutScreen navigation={navigationObj} />;
      case 'scan': return <ScanQRScreen />;
      case 'profile': return <ProfileScreen navigation={navigationObj} />;
      case 'EditProfile': return <EditProfileScreen navigation={navigationObj} />;
      case 'PhysicalData': return <PhysicalDataScreen navigation={navigationObj} />;
      default: return <HomeScreen navigation={navigationObj} />;
    }
  };

  return (
    <View style={styles.appContainer}>
      {renderScreen()}

      {/* BOTTOM NAVIGATION TABS */}
      <View style={styles.bottomTab}>
        {/* Tombol Home */}
        <TouchableOpacity
          style={[styles.tabButton, currentTab === 'home' && styles.tabButtonActive]}
          onPress={() => { setCurrentTab('home'); setNavigationStack(prev => ({ ...prev, home: ['home'] })); }}
        >
          <Ionicons name={currentTab === 'home' ? 'home' : 'home-outline'} size={24} color={currentTab === 'home' ? '#E65100' : '#888'} />
          <Text style={[styles.tabLabel, currentTab === 'home' && styles.tabLabelActive]}>Home</Text>
        </TouchableOpacity>

        {/* Tombol Workout */}
        <TouchableOpacity
          style={[styles.tabButton, currentTab === 'workout' && styles.tabButtonActive]}
          onPress={() => { setCurrentTab('workout'); setNavigationStack(prev => ({ ...prev, workout: ['workout'] })); }}
        >
          <FontAwesome5 name="dumbbell" size={20} color={currentTab === 'workout' ? '#E65100' : '#888'} />
          <Text style={[styles.tabLabel, currentTab === 'workout' && styles.tabLabelActive]}>Workout</Text>
        </TouchableOpacity>

        {/* Tombol QR */}
        <TouchableOpacity
          style={[styles.tabButton, styles.scanQRButton, currentTab === 'scan' && styles.scanQRButtonActive]}
          onPress={() => { setCurrentTab('scan'); setNavigationStack(prev => ({ ...prev, scan: ['scan'] })); }}
        >
          <View style={styles.scanQRIconContainer}>
            <MaterialIcons name="qr-code-2" size={32} color="white" />
          </View>
          <Text style={[styles.scanQRLabel, currentTab === 'scan' && styles.scanQRLabelActive]}>Scan QR</Text>
        </TouchableOpacity>

        {/* Tombol History */}
        <TouchableOpacity
          style={[styles.tabButton, currentTab === 'history' && styles.tabButtonActive]}
          onPress={() => { setCurrentTab('history'); setNavigationStack(prev => ({ ...prev, history: ['history'] })); }}
        >
          <Ionicons name={currentTab === 'history' ? 'stats-chart' : 'stats-chart-outline'} size={24} color={currentTab === 'history' ? '#E65100' : '#888'} />
          <Text style={[styles.tabLabel, currentTab === 'history' && styles.tabLabelActive]}>History</Text>
        </TouchableOpacity>

        {/* Tombol Profile */}
        <TouchableOpacity
          style={[styles.tabButton, currentTab === 'profile' && styles.tabButtonActive]}
          onPress={() => { setCurrentTab('profile'); setNavigationStack(prev => ({ ...prev, profile: ['profile'] })); }}
        >
          <Ionicons name={currentTab === 'profile' ? 'person' : 'person-outline'} size={24} color={currentTab === 'profile' ? '#E65100' : '#888'} />
          <Text style={[styles.tabLabel, currentTab === 'profile' && styles.tabLabelActive]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}