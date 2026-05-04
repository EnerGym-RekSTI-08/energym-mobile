import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Circle, G } from 'react-native-svg';
import { supabase } from '../../services/supabase';

// IMPORT CONTEXT UNTUK CLEAR DATA
import { WorkoutContext } from '../../context/WorkoutContext';

const defaultExerciseImage = require('../../assets/images/profile picture.webp');

export default function WorkoutSummaryScreen({ route, navigation }) {
  const { workoutName, summaryData = [], workoutId } = route.params || {};
  const { clearSession } = useContext(WorkoutContext);

  // -- STATE UNTUK MODAL & LOADING --
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // -- KALKULASI DATA --
  const totalSets = summaryData.reduce((acc, curr) => acc + (curr.sets || 0), 0);
  const totalExercises = summaryData.length;
  const totalPerfect = summaryData.reduce((acc, curr) => acc + (curr.perfectReps || 0), 0);
  const totalBad = summaryData.reduce((acc, curr) => acc + (curr.badReps || 0), 0);
  const totalRepsActual = totalPerfect + totalBad;
  const perfectPercentage = totalRepsActual > 0 ? Math.round((totalPerfect / totalRepsActual) * 100) : 0;
  
  const totalDurationSeconds = summaryData.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const totalDurationMinutes = Math.max(1, Math.round(totalDurationSeconds / 60)); 
  const estimatedCalories = 450; 

  const now = new Date();
  const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
  const dateOptions = { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' };
  const dateString = now.toLocaleDateString('en-GB', dateOptions);

  // -- FUNGSI DELETE --
  const handleDeleteConfirm = () => {
    setShowDeleteModal(false);
    clearSession(); // Hapus keranjang context
    navigation.navigate('Home'); // Kembali ke halaman awal
  };

  // -- FUNGSI SAVE KE DATABASE --
  const handleSaveWorkout = async () => {
    setIsSaving(true);
    try {
      // 1. Ambil ID user yang sedang login (Sesuaikan dengan sistem Auth-mu)
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        throw new Error("User tidak ditemukan. Pastikan sudah login.");
      }

      // 2. Insert ke tabel workout_history utama
      const { data: historyData, error: historyError } = await supabase
        .from('workout_history')
        .insert([{
          user_id: userId,
          workout_id: workoutId || null, 
          total_duration: totalDurationSeconds,
          total_calories: estimatedCalories,
          completed_at: new Date().toISOString() // Simpan timestamp saat ini
        }])
        .select()
        .single();

      if (historyError) throw historyError;

      // 3. Siapkan data untuk detail per exercise
      const exercisesToInsert = summaryData.map(ex => ({
        history_id: historyData.id,
        exercise_id: ex.id,
        perfect_reps: ex.perfectReps || 0,
        bad_reps: ex.badReps || 0
      }));

      // 4. Insert ke tabel workout_history_exercises
      const { error: exercisesError } = await supabase
        .from('workout_history_exercises')
        .insert(exercisesToInsert);

      if (exercisesError) throw exercisesError;

      // 5. Berhasil! Tampilkan pop-up Thank You
      setIsSaving(false);
      setShowSaveModal(true);

    } catch (error) {
      setIsSaving(false);
      console.error("Gagal menyimpan workout:", error.message);
      alert("Terjadi kesalahan saat menyimpan data: " + error.message);
    }
  };

  const handleContinueAfterSave = () => {
    setShowSaveModal(false);
    clearSession(); 
    navigation.navigate('Home'); 
  };

  // KOMPONEN DONUT CHART
  const DonutChart = ({ percentage }) => {
    const radius = 60;
    const strokeWidth = 18;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={styles.chartContainer}>
        <Svg height="160" width="160" viewBox="0 0 160 160">
          <G rotation="-90" origin="80, 80">
            <Circle cx="80" cy="80" r={radius} stroke="#555" strokeWidth={strokeWidth} fill="transparent" />
            <Circle cx="80" cy="80" r={radius} stroke="#FF6500" strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
          </G>
        </Svg>
        <View style={styles.chartTextContainer}>
          <Text style={styles.chartTextPercentage}>{percentage}%</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Workout Summary</Text>
        <Text style={styles.dateSubtitle}>{timeString} | {dateString}</Text>

        <View style={styles.topMetricsRow}>
          <DonutChart percentage={perfectPercentage} />
          <View style={styles.repsStatsContainer}>
            <Text style={styles.totalRepsText}>Total Reps: {totalRepsActual}</Text>
            <View style={styles.repBadgePerfect}>
              <MaterialCommunityIcons name="check-circle-outline" size={20} color="white" />
              <Text style={styles.repBadgeText}><Text style={{fontFamily: 'Satoshi-Bold'}}>{totalPerfect}</Text> Perfect Reps</Text>
            </View>
            <View style={styles.repBadgeBad}>
              <MaterialCommunityIcons name="close-circle-outline" size={20} color="white" />
              <Text style={styles.repBadgeText}><Text style={{fontFamily: 'Satoshi-Bold'}}>{totalBad}</Text> Bad Reps</Text>
            </View>
          </View>
        </View>

        <View style={styles.gridStatsContainer}>
          <View style={styles.gridStatCard}>
            <View style={styles.statHeader}>
              <FontAwesome5 name="fire" size={16} color="#FF6500" />
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <Text style={styles.statValue}>{estimatedCalories} <Text style={styles.statUnit}>kcal</Text></Text>
          </View>
          <View style={styles.gridStatCard}>
            <View style={styles.statHeader}>
              <MaterialCommunityIcons name="clock-outline" size={18} color="#FF6500" />
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <Text style={styles.statValue}>{totalDurationMinutes} <Text style={styles.statUnit}>minutes</Text></Text>
          </View>
          <View style={styles.gridStatCardSmall}>
            <Text style={styles.statValueSmall}>{totalSets} <Text style={styles.statUnit}>sets</Text></Text>
            <MaterialCommunityIcons name="repeat" size={20} color="#FF6500" />
          </View>
          <View style={styles.gridStatCardSmall}>
            <Text style={styles.statValueSmall}>{totalExercises} <Text style={styles.statUnit}>exercises</Text></Text>
            <FontAwesome5 name="dumbbell" size={16} color="#FF6500" />
          </View>
        </View>

        {summaryData.map((ex, index) => {
          const exTotalReps = (ex.perfectReps || 0) + (ex.badReps || 0);
          const exPercentage = exTotalReps > 0 ? Math.round(((ex.perfectReps || 0) / exTotalReps) * 100) : 0;
          return (
            <View key={index} style={styles.exerciseCard}>
              <Image source={ex.imageUrl ? { uri: ex.imageUrl } : defaultExerciseImage} style={styles.exerciseImage} />
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{ex.name}</Text>
                <Text style={styles.exerciseSets}>{ex.sets} Sets {ex.reps} Reps</Text>
                <View style={styles.exerciseBadgesRow}>
                  <View style={styles.smallBadgePerfect}>
                    <MaterialCommunityIcons name="check-circle-outline" size={12} color="#FF6500" />
                    <Text style={styles.smallBadgeText}>Perfect Form: {ex.perfectReps || 0}</Text>
                  </View>
                  <View style={styles.smallBadgeBad}>
                    <MaterialCommunityIcons name="close-circle-outline" size={12} color="#FF6500" />
                    <Text style={styles.smallBadgeText}>Bad Form: {ex.badReps || 0}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.percentageBadge}>
                <Text style={styles.percentageText}>{exPercentage}%</Text>
              </View>
            </View>
          );
        })}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* BOTTOM BUTTONS */}
      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity style={styles.deleteButton} onPress={() => setShowDeleteModal(true)} disabled={isSaving}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveWorkout} disabled={isSaving}>
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 🛑 MODAL DELETE */}
      <Modal animationType="fade" transparent={true} visible={showDeleteModal} onRequestClose={() => setShowDeleteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.popupCard}>
            <Text style={styles.popupTitleDelete}>Are you sure you want{'\n'}to delete this?</Text>
            <MaterialCommunityIcons name="trash-can-outline" size={80} color="white" style={styles.popupIcon} />
            <Text style={styles.popupWarningText}>
              <Text style={{fontFamily: 'Satoshi-Bold'}}>Warning:</Text> This action <Text style={{fontFamily: 'Satoshi-Bold'}}>cannot be undone</Text>
            </Text>
            
            <View style={styles.popupActionRow}>
              <TouchableOpacity style={styles.popupBtnCancel} onPress={() => setShowDeleteModal(false)}>
                <Text style={styles.popupBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.popupBtnConfirm} onPress={handleDeleteConfirm}>
                <Text style={styles.popupBtnText}>Yes, delete it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ✅ MODAL SAVE SUCCESS */}
      <Modal animationType="fade" transparent={true} visible={showSaveModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.popupCard}>
            <Text style={styles.popupTitleSave}>Thank You!</Text>
            {/* Menggunakan emoticon senyum standar dari MaterialCommunityIcons */}
            <MaterialCommunityIcons name="emoticon-happy-outline" size={100} color="white" style={styles.popupIcon} />
            <Text style={styles.popupSubtitleSave}>Your workout has been saved.</Text>
            
            <TouchableOpacity style={styles.popupBtnContinue} onPress={handleContinueAfterSave}>
              <Text style={styles.popupBtnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#222222' },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 50 },
  headerTitle: { color: 'white', fontSize: 24, fontFamily: 'Satoshi-Bold' },
  dateSubtitle: { color: 'white', fontSize: 10, fontFamily: 'Satoshi-Regular', marginTop: 5, marginBottom: 30 },
  topMetricsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 },
  chartContainer: { position: 'relative', width: 160, height: 160, justifyContent: 'center', alignItems: 'center' },
  chartTextContainer: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  chartTextPercentage: { color: 'white', fontSize: 28, fontFamily: 'Satoshi-Bold' },
  repsStatsContainer: { flex: 1, marginLeft: 20 },
  totalRepsText: { color: 'white', fontSize: 12, fontFamily: 'Satoshi-Light', marginBottom: 10 },
  repBadgePerfect: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#993D00', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20, marginBottom: 10 },
  repBadgeBad: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#993D00', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
  repBadgeText: { color: 'white', fontSize: 14, marginLeft: 8, fontFamily: 'Satoshi-Regular' },
  gridStatsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  gridStatCard: { backgroundColor: '#333', width: '48%', padding: 15, borderRadius: 15, marginBottom: 15 },
  statHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  statLabel: { color: '#FFFFFF', fontSize: 14, marginLeft: 8, fontFamily: 'Satoshi-Regular' },
  statValue: { color: 'white', fontSize: 32, fontFamily: 'Satoshi-Bold' },
  statUnit: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Satoshi-Regular' },
  gridStatCardSmall: { backgroundColor: '#333', width: '48%', padding: 15, borderRadius: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  statValueSmall: { color: 'white', fontSize: 24, fontFamily: 'Satoshi-Bold' },
  exerciseCard: { backgroundColor: '#333', borderRadius: 15, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  exerciseImage: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#444' },
  exerciseInfo: { flex: 1, marginLeft: 15 },
  exerciseName: { color: '#FF6500', fontSize: 16, fontFamily: 'Satoshi-Medium', marginBottom: 4 },
  exerciseSets: { color: '#FFFFFF', fontSize: 12, fontFamily: 'Satoshi-Light', marginBottom: 8 },
  exerciseBadgesRow: { flexDirection: 'row', gap: 10 },
  smallBadgePerfect: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#75757580', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, marginRight: 5, borderWidth: 0.5, borderColor: '#993D00' },
  smallBadgeBad: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#75757580', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, borderWidth: 0.5, borderColor: '#993D00'},
  smallBadgeText: { color: '#FFFFFF', fontSize: 8, marginLeft: 4, fontFamily: 'Satoshi-Regular' },
  percentageBadge: { backgroundColor: '#993D00', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, marginLeft: 10, marginBottom: 20 },
  percentageText: { color: 'white', fontSize: 14, fontFamily: 'Satoshi-Bold' },

  bottomButtonsContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 20, backgroundColor: '#222222', borderTopWidth: 1, borderColor: '#333', justifyContent: 'space-between' },
  deleteButton: { flex: 1, backgroundColor: '#333', paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginRight: 10 },
  deleteButtonText: { color: '#FF4D4D', fontSize: 16, fontFamily: 'Satoshi-Bold' },
  saveButton: { flex: 1, backgroundColor: '#FF6500', paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginLeft: 10 },
  saveButtonText: { color: 'white', fontSize: 16, fontFamily: 'Satoshi-Bold' },

  // --- STYLES UNTUK POPUP MODALS ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  popupCard: { backgroundColor: '#FF6500', borderRadius: 30, padding: 30, alignItems: 'center', width: '100%', maxWidth: 340, elevation: 10 },
  
  popupTitleDelete: { color: 'white', fontSize: 22, fontFamily: 'Satoshi-Bold', textAlign: 'center', marginBottom: 20, lineHeight: 30 },
  popupTitleSave: { color: 'white', fontSize: 26, fontFamily: 'Satoshi-Bold', textAlign: 'center', marginBottom: 10 },
  
  popupIcon: { marginVertical: 15 },
  
  popupWarningText: { color: 'white', fontSize: 14, fontFamily: 'Satoshi-Regular', textAlign: 'center', marginBottom: 25 },
  popupSubtitleSave: { color: 'white', fontSize: 16, fontFamily: 'Satoshi-Medium', textAlign: 'center', marginBottom: 30 },
  
  popupActionRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 15 },
  popupBtnCancel: { flex: 1, backgroundColor: '#4A2A18', paddingVertical: 14, borderRadius: 15, alignItems: 'center' },
  popupBtnConfirm: { flex: 1, backgroundColor: '#333', paddingVertical: 14, borderRadius: 15, alignItems: 'center' },
  popupBtnContinue: { backgroundColor: '#333', width: '100%', paddingVertical: 16, borderRadius: 15, alignItems: 'center' },
  popupBtnText: { color: 'white', fontSize: 14, fontFamily: 'Satoshi-Bold' }
});