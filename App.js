import React, { useState, useContext } from 'react';
import { useFonts } from 'expo-font';
import { ActivityIndicator, View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/Home/HomeScreen';
import WelcomeScreen from './src/screens/Intro/WelcomeScreen.js';
import SignUpScreen from './src/screens/Intro/SignUpScreen.js';
import SignInScreen from './src/screens/Intro/SignInScreen.js';
import WorkoutScreen from './src/screens/Workout/WorkoutScreen';
import WorkoutDetailScreen from './src/screens/Workout/WorkoutDetailScreen.js';
import ExerciseDetailScreen from './src/screens/Workout/ExerciseDetailScreen.js';
import ScanQRScreen from './src/screens/QR/ScanQRScreen';
import LiveWorkoutScreen from './src/screens/Workout/LiveWorkoutScreen.js';
import WorkoutSummaryScreen from './src/screens/Workout/WorkoutSummaryScreen.js';
import WorkoutHistoryScreen from './src/screens/History/WorkoutHistoryScreen';
import WorkoutHistoryDetailScreen from './src/screens/History/WorkoutHistoryDetailScreen.js';
import ProfileScreen from './src/screens/Profile/ProfileScreen';
import EditProfileScreen from './src/screens/Profile/EditProfileScreen.js';
import PhysicalDataScreen from './src/screens/Profile/PhysicalDataScreen';

import styles from './src/styles/globalStyles';
import { WorkoutProvider, WorkoutContext } from './src/context/WorkoutContext';

// Pindahkan semua logika ke dalam MainApp agar bisa memakai WorkoutContext
function MainApp() {
  const [currentTab, setCurrentTab] = useState('welcome');
  const [navigationStack, setNavigationStack] = useState({ home: ['welcome'] });
  
  const [isAiConnected, setIsAiConnected] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  // Baca keranjang latihan untuk mengunci Navbar
  const { completedExercises, clearSession } = useContext(WorkoutContext);

  const [fontsLoaded] = useFonts({
    'Satoshi-Regular': require('./src/assets/fonts/Satoshi-Regular.ttf'),
    'Satoshi-Medium': require('./src/assets/fonts/Satoshi-Medium.ttf'),
    'Satoshi-Bold': require('./src/assets/fonts/Satoshi-Bold.ttf'),
    'Satoshi-Black': require('./src/assets/fonts/Satoshi-Black.ttf'),
    'Satoshi-Light': require('./src/assets/fonts/Satoshi-Light.ttf'),  
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#E65100" />
      </View>
    );
  }

  const navigate = (screen, params) => {
    let targetTab = currentTab;
    if (['home', 'workout', 'scan', 'history', 'profile'].includes(screen)) {
      setCurrentTab(screen);
      targetTab = screen;
    }

    setNavigationStack(prev => {
      const stack = prev[targetTab] || [targetTab];

      // SOLUSI BUG 1 & 3: Cegah Tumpukan Layar WorkoutDetail!
      // Jika kembali ke WorkoutDetail, hapus semua layar di atasnya (LiveWorkout dsb)
      // dan perbarui halamannya dengan data terbaru.
      if (screen === 'WorkoutDetail') {
        const existingIndex = stack.findIndex(s => (typeof s === 'string' ? s : s.screen) === 'WorkoutDetail');
        if (existingIndex !== -1) {
          return {
            ...prev,
            [targetTab]: [...stack.slice(0, existingIndex), { screen, params }]
          };
        }
      }

      return {
        ...prev,
        [targetTab]: [...stack, { screen, params }],
      };
    });
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

  const activeScreenName = typeof currentScreen === 'string' ? currentScreen : currentScreen.screen;
  const activeParams = typeof currentScreen === 'string' ? {} : currentScreen.params;
  
  const navigationObj = { navigate, goBack, isAiConnected, setIsAiConnected };

  // SOLUSI BUG 2: Cegat penekanan Navbar saat Workout sedang berjalan
  const handleTabPress = (targetTabName) => {
    // Jika user berada di WorkoutDetail DAN sudah ada gerakan yang diselesaikan
    if (activeScreenName === 'WorkoutDetail' && completedExercises.length > 0) {
      Alert.alert(
        "Batalkan Sesi Latihan?",
        "Kamu memiliki progres latihan yang belum disimpan. Pindah menu akan menghapus data ini.",
        [
          { text: "Lanjutkan Latihan", style: "cancel" },
          { 
            text: "Ya, Keluar", 
            style: "destructive",
            onPress: () => {
              clearSession(); 
              setCurrentTab(targetTabName); 
              setNavigationStack(prev => ({ ...prev, [targetTabName]: [targetTabName] }));
            }
          }
        ]
      );
    } else {
      // Jika aman, langsung pindah tab
      setCurrentTab(targetTabName); 
      setNavigationStack(prev => ({ ...prev, [targetTabName]: [targetTabName] }));
    }
  };

  const renderScreen = () => {
    switch (activeScreenName) {
      case 'welcome': return <WelcomeScreen navigation={navigationObj} />;
      case 'signup': return <SignUpScreen navigation={navigationObj} />;
      case 'signin': return <SignInScreen navigation={navigationObj} />;
      case 'home': return <HomeScreen navigation={navigationObj} />;
      case 'history': return <WorkoutHistoryScreen navigation={navigationObj} />;
      case 'WorkoutHistoryDetail': return <WorkoutHistoryDetailScreen route={{ params: activeParams }} navigation={navigationObj} />;
      case 'workout': return <WorkoutScreen navigation={navigationObj} />;
      case 'WorkoutDetail': return <WorkoutDetailScreen route={{ params: activeParams }} navigation={navigationObj} />;
      case 'ExerciseDetail': return <ExerciseDetailScreen route={{ params: activeParams }} navigation={navigationObj} />;
      case 'scan': return <ScanQRScreen navigation={navigationObj} route={{ params: activeParams }} />;
      case 'LiveWorkout': return <LiveWorkoutScreen navigation={navigationObj} route={{ params: activeParams }} />;
      case 'WorkoutSummary': return <WorkoutSummaryScreen route={{ params: activeParams }} navigation={navigationObj} />;
      case 'profile': return <ProfileScreen navigation={navigationObj} />;
      case 'EditProfile': return <EditProfileScreen navigation={navigationObj} />;
      case 'PhysicalData': return <PhysicalDataScreen navigation={navigationObj} />;
      default: return <HomeScreen navigation={navigationObj} />;
    }
  };

  const handleDisconnect = () => {
    setIsAiConnected(false);
    setShowDisconnectModal(false);
  };

  return (
    <View style={styles.appContainer}>
      {renderScreen()}

      <Modal
        animationType="fade"
        transparent={true}
        visible={showDisconnectModal}
        onRequestClose={() => setShowDisconnectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialIcons name="link-off" size={60} color="#FFCEAD" style={{ marginBottom: 20 }} />
            <Text style={styles.modalTitle}>Disconnect AI Camera?</Text>
            <Text style={styles.modalSubtitle}>
              Sesi pencatatan otomatis kamu akan berakhir. Kamu tetap bisa melanjutkan latihan secara manual.
            </Text>
            <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect}>
              <Text style={styles.disconnectButtonText}>Yes, Disconnect</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowDisconnectModal(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CONDITIONAL RENDERING BOTTOM TAB */}
      {activeScreenName !== 'welcome' && activeScreenName !== 'signup' && activeScreenName !== 'signin' && activeScreenName !== 'LiveWorkout'  && activeScreenName !== 'WorkoutSummary' && (
        <View style={styles.bottomTab}>
          
          <TouchableOpacity
            style={[styles.tabButton, currentTab === 'home' && styles.tabButtonActive]}
            onPress={() => handleTabPress('home')}
          >
            <Ionicons name={currentTab === 'home' ? 'home' : 'home-outline'} size={24} color={currentTab === 'home' ? '#E65100' : '#888'} />
            <Text style={[styles.tabLabel, currentTab === 'home' && styles.tabLabelActive]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, currentTab === 'workout' && styles.tabButtonActive]}
            onPress={() => handleTabPress('workout')}
          >
            <FontAwesome5 name="dumbbell" size={20} color={currentTab === 'workout' ? '#E65100' : '#888'} />
            <Text style={[styles.tabLabel, currentTab === 'workout' && styles.tabLabelActive]}>Workout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, styles.scanQRButton, currentTab === 'scan' && styles.scanQRButtonActive]}
            onPress={() => {
              if (isAiConnected) {
                setShowDisconnectModal(true);
              } else {
                handleTabPress('scan');
              }
            }}
          >
            <View style={[
              styles.scanQRIconContainer, 
              isAiConnected && { backgroundColor: '#4CAF50' } 
            ]}>
              <MaterialIcons name="qr-code-2" size={32} color="white" />
            </View>
            <Text style={[
              styles.scanQRLabel, 
              currentTab === 'scan' && styles.scanQRLabelActive,
              isAiConnected && { color: '#4CAF50', fontFamily: 'Satoshi-Bold' } 
            ]}>
              {isAiConnected ? 'Connected' : 'Scan QR'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, currentTab === 'history' && styles.tabButtonActive]}
            onPress={() => handleTabPress('history')}
          >
            <Ionicons name={currentTab === 'history' ? 'stats-chart' : 'stats-chart-outline'} size={24} color={currentTab === 'history' ? '#E65100' : '#888'} />
            <Text style={[styles.tabLabel, currentTab === 'history' && styles.tabLabelActive]}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, currentTab === 'profile' && styles.tabButtonActive]}
            onPress={() => handleTabPress('profile')}
          >
            <Ionicons name={currentTab === 'profile' ? 'person' : 'person-outline'} size={24} color={currentTab === 'profile' ? '#E65100' : '#888'} />
            <Text style={[styles.tabLabel, currentTab === 'profile' && styles.tabLabelActive]}>Profile</Text>
          </TouchableOpacity>

        </View>
      )}
    </View>
  );
}

// Komponen Pembungkus Utama
export default function App() {
  return (
    <SafeAreaProvider>
      <WorkoutProvider>
        <MainApp />
      </WorkoutProvider>
    </SafeAreaProvider>
  );
}