import React, { useState, useEffect, useContext } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, StyleSheet, Alert 
} from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase'; 
import { WorkoutContext } from '../../context/WorkoutContext'; 

const defaultExerciseImage = require('../../assets/images/profile picture.webp');

export default function WorkoutDetailScreen({ route, navigation }) {
  const { workoutId, workoutName } = route.params || {};
  
  // Ambil state dari context
  const { completedExercises, clearSession } = useContext(WorkoutContext);

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Data Latihan
  useEffect(() => {
    if (workoutId) {
      fetchExercises();
    }
  }, [workoutId]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workout_exercises')
        .select(`
          total_sets,
          total_reps,
          order_index,
          exercises (
            id,
            name,
            image_url_path
          )
        `)
        .eq('workout_id', workoutId)
        .order('order_index', { ascending: true });

      if (error) throw error;

      if (data) {
        const formattedExercises = data.map(item => {
          let publicImgUrl = null;
          if (item.exercises.image_url_path) {
            const { data: { publicUrl } } = supabase.storage
              .from('exercises') 
              .getPublicUrl(item.exercises.image_url_path);
            publicImgUrl = publicUrl;
          }

          return {
            id: item.exercises.id,
            name: item.exercises.name,
            sets: item.total_sets,
            reps: item.total_reps,
            imageUrl: publicImgUrl
          };
        });
        
        setExercises(formattedExercises);
      }
    } catch (error) {
      console.error("Error fetching exercises:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. LOGIKA AUTO-FINISH (Mengecek apakah semua exercise sudah selesai)
  useEffect(() => {
    if (exercises.length > 0 && completedExercises.length === exercises.length) {
      setTimeout(() => {
        // Gabungkan data target dengan data aktual yang dilakukan user
        const summaryData = exercises.map(ex => {
          const completedData = completedExercises.find(c => c.exerciseId === ex.id);
          return {
            ...ex,
            perfectReps: completedData?.perfectCount || 0,
            badReps: completedData?.badCount || 0,
            duration: completedData?.duration || 0,
          };
        });

        // Langsung pindah ke halaman Summary tanpa popup
        navigation.navigate('WorkoutSummary', { 
          workoutName: workoutName,
          summaryData: summaryData,
          workoutId: workoutId 
        });
      }, 500);
    }
  }, [completedExercises, exercises]);

  // Fungsi cek apakah exercise tertentu sudah ada di keranjang completed
  const isExerciseDone = (id) => {
    return completedExercises.some(ex => ex.exerciseId === id);
  };

  // 3. LOGIKA TOMBOL BACK (Mencegah user keluar jika ada progress)
  const handleBackPress = () => {
    // Jika ada progress tapi belum semua selesai
    if (completedExercises.length > 0 && completedExercises.length < exercises.length) {
      Alert.alert(
        "Stop Workout?",
        "Sesi latihan sedang berjalan. Jika kamu keluar sekarang, progres gerakanmu tidak akan disimpan.",
        [
          { text: "Batal", style: "cancel" },
          { 
            text: "Ya, Keluar", 
            style: "destructive",
            onPress: () => {
              clearSession(); // Hapus progress
              navigation.goBack();
            }
          }
        ]
      );
    } else {
      // Jika belum mulai sama sekali, atau (meski jarang terjadi) sudah selesai semua
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#ccc" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{workoutName || 'Workout Details'}</Text>
      </View>

      {/* LIST OF EXERCISES */}
      {loading ? (
        <ActivityIndicator size="large" color="#FF6500" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {exercises.length === 0 ? (
            <Text style={styles.emptyText}>Tidak ada latihan untuk workout ini.</Text>
          ) : (
            exercises.map((exercise, index) => {
              const done = isExerciseDone(exercise.id);

              return (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.card, done && styles.cardDone]} 
                  disabled={done} // Jika done=true, tombol mati. Jika done=false, tombol bisa diklik.
                  onPress={() => {
                    // Pakai setuju untuk navigate dengan membawa parameter lengkap
                    navigation.navigate('ExerciseDetail', { 
                        exerciseId: exercise.id,
                        workoutName: workoutName, 
                        workoutId: workoutId
                    });
                  }} 
                >
                  <Image 
                    source={exercise.imageUrl ? { uri: exercise.imageUrl } : defaultExerciseImage} 
                    style={[styles.cardImage, done && { opacity: 0.5 }]} 
                  />
                  
                  <View style={styles.cardTextContainer}>
                    <Text style={[styles.exerciseName, done && { color: '#888' }]}>{exercise.name}</Text>
                    <Text style={[styles.exerciseDetails, done && { color: '#666' }]}>
                      {exercise.sets} Sets {exercise.reps} Reps
                    </Text>
                  </View>

                  {/* ICON INDICATOR */}
                  {done ? (
                    <MaterialCommunityIcons name="check-circle" size={28} color="#4CAF50" />
                  ) : (
                    <MaterialIcons name="chevron-right" size={28} color="#FF6500" />
                  )}
                </TouchableOpacity>
              );
            })
          )}
          <View style={{ height: 50 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E1E1E' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20,
  },
  backButton: { paddingRight: 10, paddingVertical: 5 },
  headerTitle: { color: 'white', fontSize: 24, fontFamily: 'Satoshi-Bold' },
  scrollContainer: { paddingHorizontal: 20 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#333333', 
    borderRadius: 15, padding: 15, marginBottom: 15,
  },
  cardDone: { opacity: 0.6, backgroundColor: '#222222' },
  cardImage: { width: 70, height: 70, borderRadius: 10, backgroundColor: '#444' },
  cardTextContainer: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  exerciseName: { color: '#FF6500', fontSize: 16, fontFamily: 'Satoshi-Medium', marginBottom: 5 },
  exerciseDetails: { color: '#FFFFFF', fontSize: 12, fontFamily: 'Satoshi-Light' },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 50 },
});