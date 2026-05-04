import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle, G } from 'react-native-svg';
import { supabase } from '../../services/supabase';
import { format, parseISO } from 'date-fns';

const defaultExerciseImage = require('../../assets/images/profile picture.webp');

export default function WorkoutHistoryDetailScreen({ route, navigation }) {
  const { historyId } = route.params || {};
  
  const [loading, setLoading] = useState(true);
  const [historyDetails, setHistoryDetails] = useState(null);

  useEffect(() => {
    if (historyId) {
      fetchHistoryDetails();
    }
  }, [historyId]);

  const fetchHistoryDetails = async () => {
    try {
      setLoading(true);

      // Fetch data history utama, nama workout, dan detail exercise sekaligus
      const { data, error } = await supabase
        .from('workout_history')
        .select(`
          id,
          total_duration,
          total_calories,
          completed_at,
          workout_id,
          workouts ( name ),
          workout_history_exercises (
            perfect_reps,
            bad_reps,
            exercise_id,
            exercises ( name, image_url_path )
          )
        `)
        .eq('id', historyId)
        .single();

      if (error) throw error;

      if (data) {
        // Fetch target sets & reps dari tabel workout_exercises untuk perbandingan di list
        const { data: targetData } = await supabase
          .from('workout_exercises')
          .select('exercise_id, total_sets, total_reps')
          .eq('workout_id', data.workout_id);

        // Gabungkan data target ke dalam array exercises
        const formattedExercises = data.workout_history_exercises.map(item => {
          const target = targetData?.find(t => t.exercise_id === item.exercise_id);
          
          // Generate Public URL untuk gambar
          let publicImgUrl = null;
          if (item.exercises?.image_url_path) {
            const { data: { publicUrl } } = supabase.storage
              .from('exercises')
              .getPublicUrl(item.exercises.image_url_path);
            publicImgUrl = publicUrl;
          }

          return {
            ...item,
            name: item.exercises?.name,
            imageUrl: publicImgUrl,
            targetSets: target?.total_sets || 0,
            targetReps: target?.total_reps || 0
          };
        });

        setHistoryDetails({
          ...data,
          exercises: formattedExercises
        });
      }
    } catch (error) {
      console.error("Error fetching history details:", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#FF6500" />
      </View>
    );
  }

  if (!historyDetails) return null;

  // -- KALKULASI DATA UNTUK UI --
  const totalPerfect = historyDetails.exercises.reduce((acc, curr) => acc + (curr.perfect_reps || 0), 0);
  const totalBad = historyDetails.exercises.reduce((acc, curr) => acc + (curr.bad_reps || 0), 0);
  const totalRepsActual = totalPerfect + totalBad;
  const perfectPercentage = totalRepsActual > 0 ? Math.round((totalPerfect / totalRepsActual) * 100) : 0;
  
  const totalDurationMinutes = Math.max(1, Math.round(historyDetails.total_duration / 60));
  const totalSets = historyDetails.exercises.reduce((acc, curr) => acc + (curr.targetSets || 0), 0);
  const totalExercises = historyDetails.exercises.length;

  const completedDate = parseISO(historyDetails.completed_at);
  const timeString = format(completedDate, 'HH.mm');
  const dateString = format(completedDate, 'EEE, d MMMM yyyy');

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
      {/* HEADER DENGAN BACK BUTTON */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {historyDetails.workouts?.name || "Workout History"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.dateSubtitle}>{timeString} | {dateString}</Text>

        {/* TOP METRICS */}
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

        {/* GRID STATS */}
        <View style={styles.gridStatsContainer}>
          <View style={styles.gridStatCard}>
            <View style={styles.statHeader}>
              <FontAwesome5 name="fire" size={16} color="#FF6500" />
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <Text style={styles.statValue}>{historyDetails.total_calories} <Text style={styles.statUnit}>kcal</Text></Text>
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

        {/* EXERCISE LIST */}
        {historyDetails.exercises.map((ex, index) => {
          const exTotalReps = (ex.perfect_reps || 0) + (ex.bad_reps || 0);
          const exPercentage = exTotalReps > 0 ? Math.round(((ex.perfect_reps || 0) / exTotalReps) * 100) : 0;
          return (
            <View key={index} style={styles.exerciseCard}>
              <Image source={ex.imageUrl ? { uri: ex.imageUrl } : defaultExerciseImage} style={styles.exerciseImage} />
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{ex.name}</Text>
                <Text style={styles.exerciseSets}>{ex.targetSets} Sets {ex.targetReps} Reps</Text>
                <View style={styles.exerciseBadgesRow}>
                  <View style={styles.smallBadgePerfect}>
                    <MaterialCommunityIcons name="check-circle-outline" size={12} color="#FF6500" />
                    <Text style={styles.smallBadgeText}>Perfect Form: {ex.perfect_reps || 0}</Text>
                  </View>
                  <View style={styles.smallBadgeBad}>
                    <MaterialCommunityIcons name="close-circle-outline" size={12} color="#FF6500" />
                    <Text style={styles.smallBadgeText}>Bad Form: {ex.bad_reps || 0}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.percentageBadge}>
                <Text style={styles.percentageText}>{exPercentage}%</Text>
              </View>
            </View>
          );
        })}
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#222222' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, marginBottom: 5 },
  backButton: { marginRight: 15 },
  headerTitle: { color: 'white', fontSize: 24, fontFamily: 'Satoshi-Bold', flex: 1 },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 10 },
  dateSubtitle: { color: 'white', fontSize: 10, fontFamily: 'Satoshi-Regular', marginBottom: 30, marginLeft: 40 }, // Menyesuaikan posisi di bawah teks judul
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
});