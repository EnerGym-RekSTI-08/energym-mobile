import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  BackHandler, ActivityIndicator, Alert, Dimensions
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialIcons, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { supabase } from '../../services/supabase';
import { WorkoutContext } from '../../context/WorkoutContext';

import {
  startAISession,
  stopAISession,
  connectAIWebSocket,
  checkAIHealth,
} from '../../services/aiService';

const { width } = Dimensions.get('window');

export default function LiveWorkoutScreen({ navigation, route }) {
  const aiIp   = route.params?.aiIp   ?? route.params?.aiBaseUrl?.replace('http://', '').split(':')[0] ?? '192.168.1.68';
  const aiPort = route.params?.aiPort ?? 8000;
  const workoutId = route.params?.workoutId;
  const exerciseId = route.params?.exerciseId;
  const stationId = route.params?.stationId ?? 'STATION_01';

  const { addCompletedExercise, setActiveWorkoutId } = useContext(WorkoutContext);

  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(true);
  const [showStopModal, setShowStopModal] = useState(false);
  const [targetTab, setTargetTab] = useState(null);

  const [targetSets, setTargetSets] = useState(0);
  const [targetReps, setTargetReps] = useState(0);
  const [exerciseName, setExerciseName] = useState('');

  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [currentReps, setCurrentReps] = useState(0);

  const [perfectCount, setPerfectCount] = useState(0);
  const [badCount, setBadCount] = useState(0);
  const [badFormMessage, setBadFormMessage] = useState(null);
  const badFormTimeout = useRef(null);

  const [aiSessionId, setAiSessionId] = useState(null);
  const [aiConnected, setAiConnected] = useState(false);
  const [aiError, setAiError] = useState(null);
  const wsRef = useRef(null);
  const aiSummaryRef = useRef(null); // simpan summary final dari AI

  // ─── Fetch data latihan dari Supabase [TIDAK BERUBAH] ─────────────────────
  useEffect(() => {
    const fetchExerciseData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('workout_exercises')
          .select(`total_sets, total_reps, exercises (name)`)
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
      } finally {
        setLoading(false);
      }
    };
    fetchExerciseData();
  }, [workoutId, exerciseId]);

  useEffect(() => {
    let interval;
    if (isActive && !isPaused) {
      interval = setInterval(() => setSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  useEffect(() => {
    return () => {
      wsRef.current?.close();
      if (aiSessionId) stopAISession(aiSessionId).catch(() => {});
    };
  }, [aiSessionId]);

  const handleStart = async () => {
  const healthy = await checkAIHealth(aiIp, aiPort);
  
  if (!healthy) {
    Alert.alert(
      'AI Edge PC Tidak Tersambung',
      `Tidak bisa reach ${aiIp}:${aiPort}\nPastikan laptop menyala dan di WiFi yang sama.`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Lanjut Tanpa AI', onPress: () => setIsActive(true) },
      ]
    );
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { Alert.alert('Error', 'Silakan login ulang.'); return; }

  try {
    const sessionId = await startAISession({
      ip: aiIp,
      port: aiPort,
      userId: user.id,
      stationId,
      exerciseId,
      exerciseName,
      workoutId,
    });
    setAiSessionId(sessionId);

    const ws = connectAIWebSocket(aiIp, aiPort, sessionId, {
      onFrameUpdate: ({ repCount, isBadForm, formIssues }) => {
        setCurrentReps(repCount);
        if (isBadForm && formIssues.length > 0) {
          const issueMap = {
            'body_sway': 'Jangan ayun badan!',
            'elbow_drift': 'Siku jangan maju!',
            'too_fast': 'Perlambat gerakan!',
          };
          const code = formIssues[0].split('_').slice(0, 2).join('_');
          setBadFormMessage(issueMap[code] ?? 'Bad Form! Perbaiki postur!');
          setBadCount(c => c + 1);
          clearTimeout(badFormTimeout.current);
          badFormTimeout.current = setTimeout(() => setBadFormMessage(null), 2000);
        } else if (repCount > perfectCount + badCount) {
          setPerfectCount(repCount);
        }
      },
      onSessionEnded: (summary) => {
        aiSummaryRef.current = summary;
        setAiConnected(false);
      },
      onError: () => {
        setAiError('Koneksi AI terputus.');
        setAiConnected(false);
      },
    });

    wsRef.current = ws;
    setAiConnected(true);
    setIsActive(true);
  } catch (err) {
    Alert.alert('Gagal Memulai AI', err.message);
  }
};

  const handleStop = async () => {
    setIsActive(false);
    setShowStopModal(false);

    wsRef.current?.close();
    if (aiSessionId) {
      await stopAISession(aiSessionId);
    }

    const finalSummary = aiSummaryRef.current;
    const finalPerfect = finalSummary?.validReps ?? perfectCount;
    const finalBad = finalSummary?.badReps ?? badCount;

    addCompletedExercise({
      id: exerciseId,
      name: exerciseName,
      sets: currentSet,
      perfectReps: finalPerfect,
      badReps: finalBad,
      duration: seconds,
    });

    navigation.navigate('WorkoutSummary', {
      workoutId,
      workoutName: route.params?.workoutName,
      summaryData: [{
        id: exerciseId,
        name: exerciseName,
        sets: currentSet,
        perfectReps: finalPerfect,
        badReps: finalBad,
        duration: seconds,
      }],
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF6500" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera preview */}
      <CameraView style={styles.camera} facing="front">
        
        {/* Header info */}
        <View style={styles.header}>
          <Text style={styles.stationText}>{stationId}</Text>
          <Text style={styles.exerciseTitle}>{exerciseName}</Text>
          <View style={[styles.aiBadge, aiConnected ? styles.aiOnline : styles.aiOffline]}>
            <Text style={styles.aiBadgeText}>
              {aiConnected ? '● AI Aktif' : aiError ? '⚠ AI Error' : '○ AI Standby'}
            </Text>
          </View>
        </View>

        {/* Bad form alert [TIDAK BERUBAH] */}
        {badFormMessage && (
          <View style={styles.badFormBanner}>
            <MaterialIcons name="warning" size={20} color="#FFF" />
            <Text style={styles.badFormText}>{badFormMessage}</Text>
          </View>
        )}

        {/* Stats bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentReps}</Text>
            <Text style={styles.statLabel}>Reps</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{currentSet}/{targetSets}</Text>
            <Text style={styles.statLabel}>Set</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{perfectCount}</Text>
            <Text style={styles.statLabel}>Perfect</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#FF4444' }]}>{badCount}</Text>
            <Text style={styles.statLabel}>Bad</Text>
          </View>
        </View>

        {/* Tombol kontrol */}
        <View style={styles.controls}>
          {!isActive ? (
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopButton} onPress={() => setShowStopModal(true)}>
              <MaterialIcons name="stop" size={32} color="#FFF" />
              <Text style={styles.stopButtonText}>Stop</Text>
            </TouchableOpacity>
          )}
        </View>
      </CameraView>

      {/* Stop confirmation modal [TIDAK BERUBAH] */}
      <Modal visible={showStopModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Stop Sesi?</Text>
            <Text style={styles.modalDesc}>Data latihan akan disimpan.</Text>
            <TouchableOpacity style={styles.modalConfirm} onPress={handleStop}>
              <Text style={styles.modalConfirmText}>Ya, Stop</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowStopModal(false)}>
              <Text style={styles.modalCancelText}>Lanjut Latihan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Styles [TIDAK BERUBAH, tambahan badge saja]
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  header: { padding: 16, paddingTop: 48, alignItems: 'center' },
  stationText: { color: '#FF6500', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  exerciseTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  aiBadge: { marginTop: 8, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  aiOnline: { backgroundColor: 'rgba(0,200,100,0.3)' },
  aiOffline: { backgroundColor: 'rgba(100,100,100,0.3)' },
  aiBadgeText: { color: '#FFF', fontSize: 12 },
  badFormBanner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(200,0,0,0.85)',
    margin: 16, padding: 12, borderRadius: 8, gap: 8,
  },
  badFormText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  statsBar: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: 'rgba(0,0,0,0.6)', padding: 16, marginHorizontal: 16, borderRadius: 12,
  },
  statItem: { alignItems: 'center' },
  statValue: { color: '#FF6500', fontSize: 28, fontWeight: 'bold' },
  statLabel: { color: '#AAA', fontSize: 11, marginTop: 2 },
  controls: { padding: 32, alignItems: 'center' },
  startButton: {
    backgroundColor: '#FF6500', paddingHorizontal: 64, paddingVertical: 16,
    borderRadius: 32, alignItems: 'center',
  },
  startButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  stopButton: {
    backgroundColor: 'rgba(200,0,0,0.9)', flexDirection: 'row',
    alignItems: 'center', paddingHorizontal: 32, paddingVertical: 16,
    borderRadius: 32, gap: 8,
  },
  stopButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalBox: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 24, width: '80%', alignItems: 'center' },
  modalTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  modalDesc: { color: '#AAA', marginBottom: 24, textAlign: 'center' },
  modalConfirm: { backgroundColor: '#FF6500', padding: 14, borderRadius: 10, width: '100%', alignItems: 'center', marginBottom: 8 },
  modalConfirmText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  modalCancel: { padding: 14, width: '100%', alignItems: 'center' },
  modalCancelText: { color: '#AAA', fontSize: 16 },
});
