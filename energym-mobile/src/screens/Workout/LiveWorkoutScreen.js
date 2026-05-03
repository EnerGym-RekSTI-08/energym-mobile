import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  ActivityIndicator, Alert, Dimensions, Image
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const aiIp      = route.params?.aiIp   ?? '192.168.1.68';
  const aiPort    = route.params?.aiPort ?? 8000;
  const workoutId  = route.params?.workoutId;
  const exerciseId = route.params?.exerciseId;
  const stationId  = route.params?.stationId ?? 'STATION_01';

  const { addCompletedExercise } = useContext(WorkoutContext);

  // Snapshot polling
  const [frameUri, setFrameUri] = useState(null);
  const [frameKey, setFrameKey] = useState(0);
  const pollingRef = useRef(null);

  // State umum
  const [loading, setLoading]             = useState(true);
  const [showStopModal, setShowStopModal] = useState(false);
  const [targetSets, setTargetSets]       = useState(0);
  const [targetReps, setTargetReps]       = useState(0);
  const [exerciseName, setExerciseName]   = useState('');

  // State workout
  const [isActive, setIsActive]         = useState(false);
  const [seconds, setSeconds]           = useState(0);
  const [currentSet, setCurrentSet]     = useState(1);
  const [currentReps, setCurrentReps]   = useState(0);
  const [perfectCount, setPerfectCount] = useState(0);
  const [badCount, setBadCount]         = useState(0);
  const [badFormMessage, setBadFormMessage] = useState(null);
  const badFormTimeout = useRef(null);
  const [sessionStarted, setSessionStarted] = useState(false);

  // State AI
  const [aiSessionId, setAiSessionId]   = useState(null);
  const [aiConnected, setAiConnected]   = useState(false);
  const [aiError, setAiError]           = useState(null);
  const [poseStatus, setPoseStatus]     = useState('Menunggu...');
  const wsRef        = useRef(null);
  const aiSummaryRef = useRef(null);
  const stoppedRef   = useRef(false);

  // Fetch data latihan
  useEffect(() => {
    const fetchExerciseData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('workout_exercises')
          .select('total_sets, total_reps, exercises (name)')
          .eq('workout_id', workoutId)
          .eq('exercise_id', exerciseId)
          .single();
        if (error) throw error;
        if (data) {
          const name = Array.isArray(data.exercises)
            ? data.exercises[0]?.name : data.exercises?.name;
          setExerciseName(name || 'Unknown Exercise');
          setTargetSets(data.total_sets);
          setTargetReps(data.total_reps);
        }
      } catch (err) {
        console.error('Fetch exercise error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExerciseData();
  }, [workoutId, exerciseId]);

  // Timer
  useEffect(() => {
    let interval;
    if (isActive) interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isActive]);

  // Cleanup saat unmount — TIDAK panggil stop lagi
  useEffect(() => {
    return () => {
      clearInterval(pollingRef.current);
      wsRef.current?.close();
    };
  }, []);

  const startSnapshotPolling = (ip, port) => {
    clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => {
      const ts = Date.now();
      setFrameUri(`http://${ip}:${port}/stream/snapshot?t=${ts}`);
      setFrameKey(ts);  // key berubah → Image re-mount → tidak cache
    }, 200);
  };

  const handleStart = async () => {
    stoppedRef.current = false;

    const healthy = await checkAIHealth(aiIp, aiPort);
    if (!healthy) {
      Alert.alert(
        'AI Edge PC Tidak Tersambung',
        `Tidak bisa reach ${aiIp}:${aiPort}`,
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Lanjut Tanpa AI', onPress: () => {
            startSnapshotPolling(aiIp, aiPort);
            setSessionStarted(true);
            setIsActive(true);
          }},
        ]
      );
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { Alert.alert('Error', 'Silakan login ulang.'); return; }

    try {
      const sessionId = await startAISession({
        ip: aiIp, port: aiPort,
        userId: user.id, stationId,
        exerciseId, exerciseName, workoutId,
      });
      setAiSessionId(sessionId);

      // Mulai snapshot polling langsung
      startSnapshotPolling(aiIp, aiPort);

      // Tunggu pipeline server siap
      await new Promise(r => setTimeout(r, 500));

      // Sambungkan WebSocket untuk data real-time
      const ws = connectAIWebSocket(aiIp, aiPort, sessionId, {
        onFrameUpdate: ({ repCount, state, isBadForm, formIssues }) => {
          setCurrentReps(repCount);
          setPoseStatus(`${state} | reps: ${repCount}`);

          if (isBadForm && formIssues.length > 0) {
            const issueMap = {
              body_sway:   '⚠ Jangan ayun badan!',
              elbow_drift: '⚠ Siku jangan maju!',
              too_fast:    '⚠ Perlambat gerakan!',
            };
            const code = formIssues[0].split('_').slice(0, 2).join('_');
            setBadFormMessage(issueMap[code] ?? '⚠ Bad Form!');
            setBadCount(c => c + 1);
            clearTimeout(badFormTimeout.current);
            badFormTimeout.current = setTimeout(() => setBadFormMessage(null), 2500);
          } else {
            setPerfectCount(prev => repCount > prev ? repCount : prev);
          }
        },
        onSessionEnded: (summary) => {
          aiSummaryRef.current = summary;
          setAiConnected(false);
          setPoseStatus('Sesi selesai');
        },
        onError: () => {
          setAiError('Koneksi AI terputus.');
          setAiConnected(false);
        },
      });

      wsRef.current = ws;
      setAiConnected(true);
      setSessionStarted(true);
      setIsActive(true);

    } catch (err) {
      Alert.alert('Gagal Memulai AI', err.message);
    }
  };

  const handlePauseToggle = () => {
    if (!sessionStarted) return;
    setIsActive(prev => !prev);
  };

  const handleStop = async () => {
    if (stoppedRef.current) return;  // cegah double-stop
    stoppedRef.current = true;

    setIsActive(false);
    setSessionStarted(false);
    setShowStopModal(false);

    clearInterval(pollingRef.current);
    setFrameUri(null);
    wsRef.current?.close();

    if (aiSessionId) {
      await stopAISession(aiIp, aiPort, aiSessionId).catch(() => {});
    }

    const s = aiSummaryRef.current;
    const finalPerfect = s?.validReps ?? perfectCount;
    const finalBad     = s?.badReps   ?? badCount;

    addCompletedExercise({
      id: exerciseId, name: exerciseName, sets: currentSet,
      perfectReps: finalPerfect, badReps: finalBad, duration: seconds,
    });

    navigation.navigate('WorkoutSummary', {
      workoutId, workoutName: route.params?.workoutName,
      summaryData: [{
        id: exerciseId, name: exerciseName, sets: currentSet,
        perfectReps: finalPerfect, badReps: finalBad, duration: seconds,
      }],
    });
  };

  if (loading) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#FF6500" /></View>;
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss_str = String(seconds % 60).padStart(2, '0');
  const isPaused = sessionStarted && !isActive;

  return (
    <View style={styles.container}>

      {/* Webcam preview */}
      <View style={styles.streamContainer}>
        {frameUri ? (
          <Image
            key={frameKey}
            source={{ uri: frameUri }}
            style={styles.stream}
            resizeMode="cover"
            fadeDuration={0}
          />
        ) : (
          <View style={styles.streamPlaceholder}>
            <Text style={styles.placeholderIcon}>📷</Text>
            <Text style={styles.placeholderText}>Webcam belum aktif</Text>
            <Text style={styles.placeholderSub}>Tekan Start untuk mulai</Text>
          </View>
        )}

        {/* Header overlay */}
        <View style={[styles.header, { paddingTop: 12 + insets.top }]}>
          <Text style={styles.stationText}>{stationId}</Text>
          <Text style={styles.headerTitle}>Live Workout</Text>
          <Text style={styles.timerText}>• {mm}:{ss_str}</Text>
        </View>

        {/* Status center */}
        {isActive && (
          <View style={styles.centerStatus}>
            <Text style={styles.centerStatusIcon}>🔍</Text>
            <Text style={styles.centerStatusText}>{poseStatus}</Text>
          </View>
        )}

        {/* Bad form banner */}
        {badFormMessage && (
          <View style={styles.badFormBanner}>
            <MaterialIcons name="warning" size={18} color="#FFF" />
            <Text style={styles.badFormText}>{badFormMessage}</Text>
          </View>
        )}
      </View>

      {/* Stats bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Set</Text>
          <Text style={styles.statValue}>{currentSet}/{targetSets}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total Reps</Text>
          <Text style={styles.statValue}>{targetReps}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Reps</Text>
          <Text style={styles.statValue}>{currentReps}</Text>
        </View>
      </View>

      {/* Kontrol */}
      <View style={styles.controls}>
        {!sessionStarted ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.controlsBar}>
            <TouchableOpacity style={styles.pauseButton} onPress={handlePauseToggle}>
              <MaterialIcons name={isPaused ? 'play-arrow' : 'pause'} size={22} color="#FFF" />
              <Text style={styles.pauseButtonText}>{isPaused ? 'Resume' : 'Pause'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.stopButton} onPress={() => setShowStopModal(true)}>
              <MaterialIcons name="stop" size={22} color="#FFF" />
              <Text style={styles.stopButtonText}>Stop</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Modal stop */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  streamContainer: { height: '62%', backgroundColor: '#000', position: 'relative', overflow: 'hidden' },
  stream: { width: '100%', height: '100%' },
  streamPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A1A' },
  placeholderIcon: { fontSize: 48, marginBottom: 12 },
  placeholderText: { color: '#555', fontSize: 16, marginBottom: 6 },
  placeholderSub:  { color: '#444', fontSize: 12 },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0,
    paddingTop: 12, paddingBottom: 12, paddingHorizontal: 18,
    backgroundColor: '#FF6A00',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  stationText:{ color: '#FFF', fontSize: 14, fontWeight: '700', letterSpacing: 0.8 },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  timerText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  
  centerStatus: {
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
    transform: [{ translateY: -12 }],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  centerStatusIcon: { color: '#79E35F', fontSize: 16 },
  centerStatusText: { color: '#79E35F', fontSize: 14, fontWeight: '600' },
  badFormBanner: {
    position: 'absolute', top: 126, left: 16, right: 16,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(150,0,0,0.86)',
    paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, gap: 8,
  },
  badFormText: { color: '#FFF', fontWeight: '600', fontSize: 13, flex: 1 },
  statsBar: {
    marginTop: -24,
    marginHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    gap: 12,
  },
  statItem:{
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#8B4A12',
    paddingVertical: 10,
    borderRadius: 14,
  },
  statValue:{ color: '#FFF', fontSize: 18, fontWeight: '700', marginTop: 2 },
  statLabel:{ color: '#F6E7DA', fontSize: 11 },
  controls:{ flex: 1, justifyContent: 'center', alignItems: 'center' },
  controlsBar:{
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1E1E1E', padding: 12, borderRadius: 28, width: width - 40,
  },
  startButton: { backgroundColor: '#FF6500', paddingHorizontal: 72, paddingVertical: 18, borderRadius: 36 },
  startButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  pauseButton:{
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FF7A1A', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 22,
  },
  pauseButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  stopButton: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FF7A1A', paddingHorizontal: 22, paddingVertical: 12, borderRadius: 22,
  },
  stopButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalBox: { backgroundColor: '#1A1A1A', borderRadius: 16, padding: 24, width: '80%', alignItems: 'center' },
  modalTitle:{ color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  modalDesc:{ color: '#AAA', marginBottom: 24, textAlign: 'center' },
  modalConfirm: { backgroundColor: '#FF6500', padding: 14, borderRadius: 10, width: '100%', alignItems: 'center', marginBottom: 8 },
  modalConfirmText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  modalCancel:{ padding: 14, width: '100%', alignItems: 'center' },
  modalCancelText:{ color: '#AAA', fontSize: 16 },
});