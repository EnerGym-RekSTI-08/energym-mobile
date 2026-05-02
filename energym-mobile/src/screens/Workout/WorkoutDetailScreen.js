import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, StyleSheet 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase'; // Sesuaikan path

const defaultExerciseImage = require('../../assets/images/profile picture.webp'); // Placeholder

export default function WorkoutDetailScreen({ route, navigation }) {
  // Menerima parameter workout dari halaman HomeScreen
  const { workoutId, workoutName } = route.params || {};
  
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (workoutId) {
      fetchExercises();
    }
  }, [workoutId]);

  const fetchExercises = async () => {
    try {
      setLoading(true);
      
      // Mengambil data dari tabel penghubung (workout_exercises)
      // dan JOIN otomatis dengan tabel 'exercises'
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
        .order('order_index', { ascending: true }); // Urutkan berdasarkan urutan latihan

      if (error) throw error;

      if (data) {
        // Map untuk merapikan bentuk data dan mendapatkan public URL gambar
        const formattedExercises = data.map(item => {
          let publicImgUrl = null;
          if (item.exercises.image_url_path) {
            const { data: { publicUrl } } = supabase.storage
              .from('exercises') // Asumsi kamu buat bucket bernama 'exercises'
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

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#ccc" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{workoutName || 'Workout Details'}</Text>
      </View>

      {/* LIST OF EXERCISES */}
      {loading ? (
        <ActivityIndicator size="large" color="#E65100" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {exercises.length === 0 ? (
            <Text style={styles.emptyText}>No exercises found for this workout.</Text>
          ) : (
            exercises.map((exercise, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.card}
                onPress={() => navigation.navigate('ExerciseDetail', { 
                    exerciseId: exercise.id,
                    workoutName: workoutName, 
                    workoutId: workoutId
                })} 
              >
                <Image 
                  source={exercise.imageUrl ? { uri: exercise.imageUrl } : defaultExerciseImage} 
                  style={styles.cardImage} 
                />
                
                <View style={styles.cardTextContainer}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseDetails}>{exercise.sets} Sets {exercise.reps} Reps</Text>
                </View>

                <MaterialIcons name="chevron-right" size={28} color="#E65100" />
              </TouchableOpacity>
            ))
          )}
          <View style={{ height: 50 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E', // Warna latar gelap persis seperti di gambar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    paddingRight: 10,
    color: '#757575',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'Satoshi-Bold',
  },
  scrollContainer: {
    paddingHorizontal: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333', // Warna abu-abu gelap untuk card
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  cardImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#444',
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  exerciseName: {
    color: '#FF6500', // Warna Oranye sesuai gambar
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    marginBottom: 5,
  },
  exerciseDetails: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Satoshi-Light',
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  }
});