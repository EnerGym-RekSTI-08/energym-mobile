import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  ActivityIndicator, Alert, Dimensions, Image
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { supabase } from '../../services/supabase';
import { WorkoutContext } from '../../context/WorkoutContext';
import {
  startAISession,
  stopAISession,
  connectAIWebSocket,
  checkAIHealth,
  warmupAICamera,
} from '../../services/aiService';

const { width } = Dimensions.get('window');
const REST_DURATION_SEC = 30; // Durasi istirahat antar set (detik)

export default function LiveWorkoutScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const aiIp      = route.params?.aiIp   ?? '192.168.1.68';
  const aiPort    = route.params?.aiPort ?? 8000;
  const workoutId  = route.params?.workoutId;
  const exerciseId = route.params?.exerciseId;
  const stationId  = route.params?.stationId ?? 'STATION_01';

  const { addCompletedExercise } = useContext(WorkoutContext);

  // Double-buffer snapshot (menghindari blinking)
  const [bufferA, setBufferA] = useState(null);
  const [bufferB, setBufferB] = useState(null);
  const [activeBuffer, setActiveBuffer] = useState('A');
  const activeBufferRef = useRef('A');
  const pollingRef = useRef(null);
  const loadingRef = useRef(false);

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

  // State untuk set/rest management
  const [isResting, setIsResting]         = useState(false);
  const [restSeconds, setRestSeconds]     = useState(0);
  const [showSetCompleteModal, setShowSetCompleteModal] = useState(false);
  const [allSetsComplete, setAllSetsComplete] = useState(false);
  const repOffsetRef         = useRef(0);
  const totalPerfectRef      = useRef(0);
  const totalBadRef          = useRef(0);
  const lastRepCountRef      = useRef(0);   // deteksi kapan rep baru selesai
  const lastBadRepCountRef   = useRef(0);   // deteksi kapan bad rep baru selesai (dari AI)
  const hadBadFormThisRepRef = useRef(false); // apakah ada bad form di rep ini

  // State AI
  const [aiSessionId, setAiSessionId]   = useState(null);
  const [aiConnected, setAiConnected]   = useState(false);
  const [aiError, setAiError]           = useState(null);
  const [poseStatus, setPoseStatus]     = useState('Menunggu...');
  const wsRef          = useRef(null);
  const aiSummaryRef   = useRef(null);
  const stoppedRef     = useRef(false);
  const formCountsRef  = useRef({ body_sway: 0, elbow_drift: 0, too_fast: 0, grip_rotation: 0, same_side: 0, bilateral_move: 0 });

  // Refs untuk akses state terkini di callback
  const targetRepsRef = useRef(0);
  const targetSetsRef = useRef(0);
  const currentSetRef = useRef(1);
  const isRestingRef  = useRef(false);

  // Sync refs
  useEffect(() => { targetRepsRef.current = targetReps; }, [targetReps]);
  useEffect(() => { targetSetsRef.current = targetSets; }, [targetSets]);
  useEffect(() => { currentSetRef.current = currentSet; }, [currentSet]);
  useEffect(() => { isRestingRef.current = isResting; }, [isResting]);

  // Pre-warm kamera saat masuk screen (sebelum user tekan Start)
  useEffect(() => {
    warmupAICamera(aiIp, aiPort);
  }, []);

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

  // Timer utama (workout)
  useEffect(() => {
    let interval;
    if (isActive && !isResting) interval = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isActive, isResting]);

  // Timer istirahat antar set
  useEffect(() => {
    let interval;
    if (isResting) {
      interval = setInterval(() => {
        setRestSeconds(prev => {
          if (prev <= 1) {
            // Rest selesai → mulai set berikutnya
            clearInterval(interval);
            setIsResting(false);
            setShowSetCompleteModal(false);
            setPoseStatus('Set baru dimulai!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting]);

  // Cleanup saat unmount
  useEffect(() => {
    return () => {
      clearInterval(pollingRef.current);
      wsRef.current?.close();
    };
  }, []);

  // ===== Set Completion Handler =====
  const handleSetComplete = useCallback((repCountFromAI) => {
    // Simpan offset untuk set berikutnya
    repOffsetRef.current = repCountFromAI;

    const setNum = currentSetRef.current;
    const totalSetsTarget = targetSetsRef.current;

    if (setNum >= totalSetsTarget) {
      // Semua set selesai!
      setAllSetsComplete(true);
      setShowSetCompleteModal(true);
      setPoseStatus('Semua set selesai!');
    } else {
      // Masih ada set berikutnya → mulai rest
      setCurrentSet(prev => prev + 1);
      setCurrentReps(0);
      setIsResting(true);
      setRestSeconds(REST_DURATION_SEC);
      setShowSetCompleteModal(true);
      setPoseStatus('Istirahat...');
    }
  }, []);

  const startSnapshotPolling = (ip, port) => {
    clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => {
      if (loadingRef.current) return;
      loadingRef.current = true;

      const ts = Date.now();
      const newUri = `http://${ip}:${port}/stream/snapshot?t=${ts}`;

      if (activeBufferRef.current === 'A') {
        setBufferB(newUri);
      } else {
        setBufferA(newUri);
      }
    }, 250);
  };

  const handleBackBufferLoaded = () => {
    loadingRef.current = false;
    setActiveBuffer(prev => {
      const next = prev === 'A' ? 'B' : 'A';
      activeBufferRef.current = next;
      return next;
    });
  };

  const handleBufferError = () => {
    loadingRef.current = false;
  };

  const markStationBusy = async () => {
    try {
      await supabase
        .from('stations')
        .update({
          current_workout_id: workoutId,
          last_sync: new Date().toISOString(),
        })
        .eq('station_code', stationId);
    } catch { /* non-critical */ }
  };

  const markStationFree = async () => {
    try {
      await supabase
        .from('stations')
        .update({
          current_workout_id: null,
          last_sync: new Date().toISOString(),
        })
        .eq('station_code', stationId);
    } catch { /* non-critical */ }
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

      startSnapshotPolling(aiIp, aiPort);
      await new Promise(r => setTimeout(r, 500));

      const ws = connectAIWebSocket(aiIp, aiPort, sessionId, {
        onFrameUpdate: ({ repCount, badRepCount, state, isBadForm, formIssues, activeArm }) => {
          const repsInSet = repCount - repOffsetRef.current;

          if (isRestingRef.current) return;

          setCurrentReps(repsInSet);
          const armLabel = activeArm && activeArm !== 'none' ? ` (${activeArm})` : '';
          setPoseStatus(`${state}${armLabel} | reps: ${repsInSet}`);

          if (isBadForm && formIssues.length > 0) {
            const issueMap = {
              body_sway:      '⚠ Jangan ayun badan!',
              elbow_drift:    '⚠ Posisi siku salah! Jaga di samping badan!',
              too_fast:       '⚠ Perlambat gerakan!',
              grip_rotation:  '⚠ Jaga posisi grip netral!',
              same_side:      '⚠ Ganti tangan! Jangan satu sisi terus!',
              bilateral_move: '⚠ Angkat bergantian, bukan bersamaan!',
            };
            const code = formIssues[0].split('_').slice(0, 2).join('_');
            if (code in formCountsRef.current) formCountsRef.current[code] += 1;
            hadBadFormThisRepRef.current = true;
            setBadFormMessage(issueMap[code] ?? '⚠ Bad Form!');
            clearTimeout(badFormTimeout.current);
            badFormTimeout.current = setTimeout(() => setBadFormMessage(null), 2500);
          }

          // Bad rep langsung dari AI (too_fast, body_sway saat rep selesai, dll)
          // badRepCount hanya ada untuk bilateral exercises (bicep/hammer curl)
          if (badRepCount != null && badRepCount > lastBadRepCountRef.current) {
            const newBadReps = badRepCount - lastBadRepCountRef.current;
            totalBadRef.current += newBadReps;
            setBadCount(totalBadRef.current);
            lastBadRepCountRef.current = badRepCount;
            hadBadFormThisRepRef.current = false;
          }

          // Klasifikasi rep saat repCount (good reps) bertambah
          if (repCount > lastRepCountRef.current) {
            const newReps = repCount - lastRepCountRef.current;
            if (hadBadFormThisRepRef.current) {
              totalBadRef.current += newReps;
              setBadCount(totalBadRef.current);
            } else {
              totalPerfectRef.current += newReps;
              setPerfectCount(totalPerfectRef.current);
            }
            lastRepCountRef.current = repCount;
            hadBadFormThisRepRef.current = false;
          }

          // Cek apakah set selesai
          const target = targetRepsRef.current;
          if (target > 0 && repsInSet >= target) {
            handleSetComplete(repCount);
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
      markStationBusy();

    } catch (err) {
      Alert.alert('Gagal Memulai AI', err.message);
    }
  };

  const handlePauseToggle = () => {
    if (!sessionStarted || isResting) return;
    setIsActive(prev => !prev);
  };

  const handleStop = async () => {
    if (stoppedRef.current) return;
    stoppedRef.current = true;

    const wasResting = isRestingRef.current;
    const finalSets = wasResting ? Math.max(1, currentSet - 1) : currentSet;

    setIsActive(false);
    setSessionStarted(false);
    setShowStopModal(false);
    setIsResting(false);
    setShowSetCompleteModal(false);

    clearInterval(pollingRef.current);
    setBufferA(null);
    setBufferB(null);

    // Stop AI dulu via HTTP, beri waktu session_ended tiba di WebSocket,
    // baru tutup WebSocket — supaya aiSummaryRef terisi sebelum dibaca
    if (aiSessionId) {
      await stopAISession(aiIp, aiPort, aiSessionId).catch(() => {});
      await new Promise(r => setTimeout(r, 800));
    }
    wsRef.current?.close();
    markStationFree();

    const s = aiSummaryRef.current;
    // Gunakan ref (bukan state) sebagai fallback — ref update sinkron, state tidak
    const finalPerfect  = s?.validReps  ?? totalPerfectRef.current;
    const finalBad      = s?.badReps    ?? totalBadRef.current;
    const finalAccuracy = s?.accuracy   ?? null;
    const fc = formCountsRef.current;

    const exerciseSummary = {
      id: exerciseId, name: exerciseName, sets: finalSets,
      perfectReps: finalPerfect, badReps: finalBad, duration: seconds,
      aiSessionId,
      aiAccuracy:       finalAccuracy,
      bodySway:         fc.body_sway,
      elbowDrift:       fc.elbow_drift,
      tooFast:          fc.too_fast,
      gripRotation:     fc.grip_rotation,
    };

    addCompletedExercise(exerciseSummary);

    navigation.navigate('WorkoutDetail', {
      workoutId,
      workoutName: route.params?.workoutName,
    });
  };

  const handleSkipRest = () => {
    setIsResting(false);
    setRestSeconds(0);
    setShowSetCompleteModal(false);
    setPoseStatus('Set baru dimulai!');
  };

  if (loading) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#FF6500" /></View>;
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss_str = String(seconds % 60).padStart(2, '0');
  const isPaused = sessionStarted && !isActive;

  // Format rest timer
  const restMM = String(Math.floor(restSeconds / 60)).padStart(2, '0');
  const restSS = String(restSeconds % 60).padStart(2, '0');
  const repsPerSet = targetReps;

  return (
    <View style={styles.container}>

      {/* Webcam preview */}
      <View style={styles.streamContainer}>
        {(bufferA || bufferB) ? (
          <View style={styles.stream}>
            {/* Buffer A */}
            <Image
              source={bufferA ? { uri: bufferA } : undefined}
              style={[
                styles.streamImage,
                { opacity: activeBuffer === 'A' ? 1 : 0 },
              ]}
              resizeMode="cover"
              fadeDuration={0}
              onLoad={activeBuffer !== 'A' ? handleBackBufferLoaded : undefined}
              onError={activeBuffer !== 'A' ? handleBufferError : undefined}
            />
            {/* Buffer B */}
            <Image
              source={bufferB ? { uri: bufferB } : undefined}
              style={[
                styles.streamImage,
                { opacity: activeBuffer === 'B' ? 1 : 0 },
              ]}
              resizeMode="cover"
              fadeDuration={0}
              onLoad={activeBuffer !== 'B' ? handleBackBufferLoaded : undefined}
              onError={activeBuffer !== 'B' ? handleBufferError : undefined}
            />
          </View>
        ) : (
          <View style={styles.streamPlaceholder}>
            <MaterialIcons name="videocam-off" size={56} color="#555" style={{ marginBottom: 12 }} />
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

        {/* Rest overlay */}
        {isResting && (
          <View style={styles.restOverlay}>
            <MaterialCommunityIcons name="timer-sand" size={52} color="#FF6A00" style={{ marginBottom: 12 }} />
            <Text style={styles.restTitle}>Istirahat</Text>
            <Text style={styles.restTimer}>{restMM}:{restSS}</Text>
            <Text style={styles.restSubtitle}>Set berikutnya segera dimulai</Text>
            <TouchableOpacity style={styles.skipRestButton} onPress={handleSkipRest}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.skipRestText}>Lewati</Text>
                <MaterialIcons name="skip-next" size={20} color="#FFF" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Status center */}
        {isActive && !isResting && (
          <View style={styles.centerStatus}>
            <MaterialIcons name="visibility" size={18} color="#79E35F" />
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
          <Text style={styles.statLabel}>Target Reps</Text>
          <Text style={styles.statValue}>{repsPerSet}</Text>
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
            <TouchableOpacity
              style={[styles.pauseButton, isResting && { opacity: 0.5 }]}
              onPress={handlePauseToggle}
              disabled={isResting}
            >
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

      {/* Modal set complete (semua set selesai) */}
      <Modal visible={allSetsComplete && showSetCompleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <MaterialCommunityIcons name="party-popper" size={48} color="#FF6500" style={{ marginBottom: 12 }} />
            <Text style={styles.modalTitle}>Semua Set Selesai!</Text>
            <Text style={styles.modalDesc}>
              Kamu sudah menyelesaikan {targetSets} set. Hebat!
            </Text>
            <TouchableOpacity style={styles.modalConfirm} onPress={handleStop}>
              <Text style={styles.modalConfirmText}>Lihat Ringkasan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  stream: { width: '100%', height: '100%', position: 'relative' },
  streamImage: {
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
  },
  streamPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A1A' },
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

  // Rest overlay
  restOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  restTitle: { color: '#FF6A00', fontSize: 28, fontWeight: '800', marginBottom: 8 },
  restTimer: { color: '#FFF', fontSize: 64, fontWeight: '800', letterSpacing: 4 },
  restSubtitle: { color: '#AAA', fontSize: 14, marginTop: 8, marginBottom: 24 },
  skipRestButton: {
    backgroundColor: '#FF6500',
    paddingHorizontal: 32, paddingVertical: 14,
    borderRadius: 28,
  },
  skipRestText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  centerStatus: {
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
    transform: [{ translateY: -12 }],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
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