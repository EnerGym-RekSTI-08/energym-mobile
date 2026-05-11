import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Modal, BackHandler, ActivityIndicator, Alert, Dimensions 
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialIcons, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { supabase } from '../../services/supabase'; 
// 1. IMPORT WORKOUT CONTEXT (Sesuaikan path-nya ya!)
import { WorkoutContext } from '../../context/WorkoutContext';

const { width } = Dimensions.get('window');

export default function LiveWorkoutScreen({ navigation, route }) {
  const workoutId = route.params?.workoutId;
  const exerciseId = route.params?.exerciseId;

  // 2. PANGGIL FUNGSI DARI CONTEXT
  const { addCompletedExercise, setActiveWorkoutId } = useContext(WorkoutContext);

  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(true);
  const [showStopModal, setShowStopModal] = useState(false);
  const [targetTab, setTargetTab] = useState(null);
  
  // --- STATE DARI DATABASE ---
  const [targetSets, setTargetSets] = useState(0);
  const [targetReps, setTargetReps] = useState(0);
  const [exerciseName, setExerciseName] = useState('');

  // --- STATE WORKOUT & TIMER ---
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentReps, setCurrentReps] = useState(0);

  // --- STATE DATA TEMPORER ---
  const [perfectCount, setPerfectCount] = useState(0);
  const [badCount, setBadCount] = useState(0);
  const [badFormMessage, setBadFormMessage] = useState(null);
  const badFormTimeout = useRef(null);

  const channel = useRef(null);
  useEffect(() => {
      // Membuka jalur komunikasi ke Supabase
      channel.current = supabase.channel('station-alerts');
      channel.current.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Koneksi IoT Aktif!');
        }
      });

      return () => {
        if (channel.current) {
          supabase.removeChannel(channel.current);
        }
      };
    }, []);
  // FETCH DATA DARI SUPABASE
  useEffect(() => {
    const fetchExerciseData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('workout_exercises')
          .select(`
            total_sets,
            total_reps,
            exercises (
              name
            )
          `)
          .eq('workout_id', workoutId)
          .eq('exercise_id', exerciseId)
          .single();

        if (error) throw error;

        if (data) {
          const name = Array.isArray(data.exercises) ? data.exercises[0]?.name : data.exercises?.name;
          setExerciseName(name || 'Unknown Exercise');
          setTargetSets(data.total_sets);
          setTargetReps(data.total_reps);
        }
      } catch (error) {
        console.error('Error fetching exercise:', error.message);
        Alert.alert("Gagal Memuat Data", "Periksa koneksi atau ID latihan yang diberikan.");
      } finally {
        setLoading(false);
      }
    };

    if (workoutId && exerciseId) {
      fetchExerciseData();
    }
    requestPermission();
  }, [workoutId, exerciseId]);

  // LOGIKA STOPWATCH & BACK BUTTON
  useEffect(() => {
    let interval = null;
    if (isActive && !isPaused) {
      interval = setInterval(() => setSeconds(prev => prev + 1), 1000);
    } else {
      clearInterval(interval);
    }

    const backAction = () => {
      if (isActive) {
        handleInterrupt(null);
        return true; 
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => {
      backHandler.remove();
      clearInterval(interval);
      if (badFormTimeout.current) clearTimeout(badFormTimeout.current);
    };
  }, [isActive, isPaused]);

  // Fungsi untuk menembak sinyal ke Supabase Realtime (Broadcast)
const triggerHardwareAlert = async () => {
  // Gunakan RPC atau update biasa untuk tambah +1
  const { data } = await supabase.rpc('increment_bad_reps', { row_id: 1 });
  
  // Kalau belum buat RPC, pakai cara manual ini:
  const { data: currentData } = await supabase.from('device_commands').select('bad_count').eq('id', 1).single();
  await supabase
    .from('device_commands')
    .update({ bad_count: (currentData.bad_count + 1) })
    .eq('id', 1);
    
  console.log("Bad Count di Database bertambah!");
};
  // LOGIKA PERHITUNGAN REPS & SETS
  const handleAddRep = (isPerfect) => {
    if (!isActive || isPaused) return;

    let newReps = currentReps + 1;
    let currentPerfect = perfectCount;
    let currentBad = badCount;

    if (isPerfect) {
      currentPerfect += 1;
      setPerfectCount(currentPerfect);
      setBadFormMessage(null);
    } else {
      currentBad += 1;
      setBadCount(currentBad);
      setBadFormMessage("Bad Form! Keep elbow still.");
      triggerHardwareAlert();
      if (badFormTimeout.current) clearTimeout(badFormTimeout.current);
      badFormTimeout.current = setTimeout(() => setBadFormMessage(null), 3000);
    }

    if (newReps >= targetReps) {
      if (currentSet >= targetSets) {
        setCurrentReps(targetReps);
        finishWorkout(currentPerfect, currentBad);
      } else {
        setCurrentSet(prev => prev + 1);
        setCurrentReps(0);
      }
    } else {
      setCurrentReps(newReps);
    }
  };

  // 3. UPDATE FUNGSI FINISH WORKOUT
  const finishWorkout = async (finalPerfect, finalBad) => {
    setIsPaused(true);

    // Simpan hasil latihan ini ke dalam Context (Keranjang Sementara)
    addCompletedExercise({
      exerciseId: exerciseId,
      perfectCount: finalPerfect,
      badCount: finalBad,
      duration: seconds
    });

    // Tandai bahwa sesi workout ini sedang aktif (agar tidak tercampur workout lain)
    setActiveWorkoutId(workoutId);

    // Ubah navigasi ke WorkoutDetail, bukan ke Home
    Alert.alert(
      "Workout Finished!!",
      `Don't forget to take a quick rest.`,
      [{ text: "Back to Workout Details", onPress: () => navigation.navigate('WorkoutDetail', { workoutId: workoutId }) }]
    );
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // NAVIGASI NAVBAR PALSU & MODAL STOP
  const handleInterrupt = (tabName) => {
    setIsPaused(true);
    setTargetTab(tabName);
    setShowStopModal(true);
  };

  const confirmStop = () => {
    setShowStopModal(false);
    if (targetTab) {
      navigation.navigate(targetTab);
    } else {
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color="#FF6500" />
        <Text style={{color: 'white', marginTop: 10, fontFamily: 'Satoshi-Medium'}}>Memuat data latihan...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.stationCode}>ST-01</Text>
        <Text style={styles.headerTitle}>{exerciseName || 'Live Workout'}</Text>
        <View style={styles.timerContainer}>
          <View style={[styles.redDot, isPaused && { backgroundColor: '#888' }]} />
          <Text style={styles.timerText}>{formatTime(seconds)}</Text>
        </View>
      </View>

      {/* WARNING BANNER */}
      {badFormMessage && (
        <View style={styles.warningBanner}>
          <Ionicons name="warning" size={20} color="white" />
          <Text style={styles.warningText}>{badFormMessage}</Text>
        </View>
      )}

      {/* MAIN CONTENT AREA */}
      <View style={styles.content}>
        {permission?.granted ? (
          <CameraView style={StyleSheet.absoluteFillObject} facing="front" />
        ) : (
          <View style={styles.cameraPlaceholder} />
        )}
        
        {!isActive ? (
          <View style={styles.cameraOverlay}>
            <TouchableOpacity style={styles.bigStartButton} onPress={() => setIsActive(true)}>
              <Text style={styles.bigStartText}>Start</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.liveOverlay}>
            
            {/* DUMMY CV BUTTONS */}
            <View style={styles.dummyCVContainer}>
              <TouchableOpacity 
                style={[styles.dummyCVBtnPerfect, isPaused && { opacity: 0.4 }]} 
                onPress={() => handleAddRep(true)}
                disabled={isPaused}
              >
                <Text style={styles.dummyCVText}>+1 Perfect</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.dummyCVBtnBad, isPaused && { opacity: 0.4 }]} 
                onPress={() => handleAddRep(false)}
                disabled={isPaused}
              >
                <Text style={styles.dummyCVText}>+1 Bad</Text>
              </TouchableOpacity>
            </View>

            {/* HUD BOXES */}
            <View style={styles.hudContainer}>
              <View style={styles.hudSmallBox}>
                <Text style={styles.hudLabel}>Set: <Text style={styles.hudValue}>{currentSet}/{targetSets}</Text></Text>
              </View>
              <View style={styles.hudCenterBox}>
                <Text style={styles.hudCenterLabel}>Total Reps:</Text>
                <Text style={styles.hudCenterValue}>{targetReps}</Text>
              </View>
              <View style={styles.hudSmallBox}>
                <Text style={styles.hudLabel}>Reps: <Text style={styles.hudValue}>{currentReps}</Text></Text>
              </View>
            </View>

            {/* CONTROLS */}
            <View style={styles.controlsContainer}>
              <TouchableOpacity 
                style={[styles.controlButton, isPaused && { backgroundColor: '#4CAF50' }]} 
                onPress={() => setIsPaused(!isPaused)}
              >
                <Ionicons name={isPaused ? "play" : "pause"} size={20} color="white" />
                <Text style={styles.controlText}>{isPaused ? "Resume" : "Pause"}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton} onPress={() => handleInterrupt(null)}>
                <Ionicons name="square" size={16} color="white" style={{marginRight: 4}} />
                <Text style={styles.controlText}>Stop</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* FAKE NAVBAR */}
      <View style={styles.fakeBottomTab}>
        <TouchableOpacity style={styles.tabButton} onPress={() => handleInterrupt('home')}>
          <Ionicons name="home-outline" size={24} color="#888" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={() => handleInterrupt('workout')}>
          <FontAwesome5 name="dumbbell" size={20} color="#888" />
          <Text style={styles.tabLabel}>Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.scanQRButton} onPress={() => handleInterrupt('scan')}>
          <View style={[styles.scanQRIconContainer, { backgroundColor: '#4CAF50' }]}>
            <MaterialIcons name="qr-code-2" size={32} color="white" />
          </View>
          <Text style={[styles.scanQRLabel, { color: '#4CAF50', fontFamily: 'Satoshi-Bold' }]}>Connected</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={() => handleInterrupt('history')}>
          <Ionicons name="stats-chart-outline" size={24} color="#888" />
          <Text style={styles.tabLabel}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabButton} onPress={() => handleInterrupt('profile')}>
          <Ionicons name="person-outline" size={24} color="#888" />
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL STOP WORKOUT */}
      <Modal animationType="fade" transparent={true} visible={showStopModal} onRequestClose={() => setShowStopModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MaterialCommunityIcons name="alert-circle-outline" size={60} color="#FFCEAD" style={{ marginBottom: 15 }} />
            <Text style={styles.modalTitle}>Stop Workout?</Text>
            <Text style={styles.modalSubtitle}>The training session is in progress. If you stop now, your progress will not be saved.</Text>
            
            <TouchableOpacity style={styles.stopButton} onPress={confirmStop}>
              <Text style={styles.stopButtonText}>Yes, Stop</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.resumeButton} onPress={() => { setShowStopModal(false); setIsPaused(false); }}>
              <Text style={styles.resumeButtonText}>Resume Workout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: {
    backgroundColor: '#FF6500', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20, zIndex: 10
  },
  stationCode: { color: 'white', fontFamily: 'Satoshi-Bold', fontSize: 12 },
  headerTitle: { color: 'white', fontFamily: 'Satoshi-Medium', fontSize: 16 },
  timerContainer: { flexDirection: 'row', alignItems: 'center' },
  redDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF0000', marginRight: 6 },
  timerText: { color: 'white', fontFamily: 'Satoshi-Regular', fontSize: 10 },

  warningBanner: {
    position: 'absolute', top: 100, left: 20, right: 20, backgroundColor: '#990000',
    flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, zIndex: 20,
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: {height: 2, width: 0}
  },
  warningText: { color: 'white', fontFamily: 'Satoshi-Medium', fontSize: 14, marginLeft: 10 },

  content: { flex: 1, position: 'relative', backgroundColor: '#000' },
  cameraPlaceholder: { ...StyleSheet.absoluteFillObject, backgroundColor: '#111' },
  cameraOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  liveOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', paddingBottom: 20 },

  bigStartButton: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: '#FF6500', justifyContent: 'center', alignItems: 'center',
    elevation: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.5, shadowRadius: 10,
  },
  bigStartText: { color: 'white', fontSize: 24, fontFamily: 'Satoshi-Bold' },

  dummyCVContainer: { position: 'absolute', top: 20, right: 20, gap: 10 },
  dummyCVBtnPerfect: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 8, elevation: 3 },
  dummyCVBtnBad: { backgroundColor: '#FF5252', padding: 10, borderRadius: 8, elevation: 3 },
  dummyCVText: { color: 'white', fontFamily: 'Satoshi-Bold', fontSize: 12 },

  hudContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', marginBottom: 20, gap: 15 },
  hudSmallBox: { backgroundColor: '#993D00', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 15, marginBottom: 5 },
  hudLabel: { color: '#FFFFFF', fontFamily: 'Satoshi-Light', fontSize: 14 },
  hudValue: { color: 'white', fontFamily: 'Satoshi-Bold', fontSize: 14 },
  hudCenterBox: { backgroundColor: '#993D00', paddingVertical: 15, paddingHorizontal: 25, borderRadius: 20, alignItems: 'center' },
  hudCenterLabel: { color: '#FFFFFF', fontFamily: 'Satoshi-Light', fontSize: 14, marginBottom: 4 },
  hudCenterValue: { color: 'white', fontFamily: 'Satoshi-Bold', fontSize: 20, lineHeight: 32 },

  controlsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 10 },
  controlButton: { 
    backgroundColor: '#FF6500', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    width: 130, paddingVertical: 12, borderRadius: 12 
  },
  controlText: { color: 'white', fontFamily: 'Satoshi-Regular', fontSize: 16, marginLeft: 6 },

  fakeBottomTab: {
    flexDirection: 'row', height: 80, backgroundColor: '#1E1E1E', borderTopWidth: 1, borderTopColor: '#333',
    justifyContent: 'space-around', alignItems: 'center', paddingBottom: 15,
  },
  tabButton: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  tabLabel: { color: '#888', fontSize: 9, marginTop: 4, fontFamily: 'Satoshi-Regular' },
  scanQRButton: { alignItems: 'center', justifyContent: 'center', flex: 1, marginTop: -20 },
  scanQRIconContainer: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 4, elevation: 4 },
  scanQRLabel: { fontSize: 9, marginTop: 2 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  modalContent: { backgroundColor: '#FF6500', borderRadius: 30, padding: 30, alignItems: 'center', width: '100%' },
  modalTitle: { color: 'white', fontSize: 16, fontFamily: 'Satoshi-Bold', marginBottom: 10 },
  modalSubtitle: { color: '#FFFFFF', fontSize: 10, fontFamily: 'Satoshi-Regular', textAlign: 'center', lineHeight: 20, marginBottom: 30 },
  stopButton: { backgroundColor: '#3B3838', width: '100%', paddingVertical: 15, borderRadius: 15, alignItems: 'center', marginBottom: 15 },
  stopButtonText: { color: 'white', fontSize: 16, fontFamily: 'Satoshi-Bold' },
  resumeButton: { paddingVertical: 10 },
  resumeButtonText: { color: 'white', fontSize: 12, fontFamily: 'Satoshi-Bold' },
});