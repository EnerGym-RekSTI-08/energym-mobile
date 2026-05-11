import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, StyleSheet 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase'; 

const defaultExerciseImage = require('../../assets/images/profile picture.webp'); 

const AI_READY_EXERCISE_IDS = [
  '6d18d781-55f7-4a4d-8e6d-d7f4510a64bc', 
  '4197a7cc-2d44-49de-aca6-5efeccacf924', 
  '779b0cf6-cdb1-4c8a-b1ad-c921d3b2b74e'
];

export default function ExerciseDetailScreen({ route, navigation }) {
  const { exerciseId, workoutName, workoutId } = route.params || {};
  
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (exerciseId) {
      fetchExerciseDetail();
    }
  }, [exerciseId]);

  const fetchExerciseDetail = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', exerciseId)
        .single();

      if (error) throw error;

      if (data) {
        let publicImgUrl = null;
        if (data.image_url_path) {
          const { data: { publicUrl } } = supabase.storage
            .from('exercises')
            .getPublicUrl(data.image_url_path);
          publicImgUrl = publicUrl;
        }

        setExercise({ ...data, imageUrl: publicImgUrl });
      }
    } catch (error) {
      console.error("Error fetching exercise details:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const isPartOfWorkout = !!workoutId;
  const isAiReady = AI_READY_EXERCISE_IDS.includes(exerciseId);
  const showStartButton = isPartOfWorkout && isAiReady; 

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF6500" />
      </View>
    );
  }

  if (!exercise) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: 'white' }}>Exercise not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back-ios" size={24} color="#ccc" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{exercise.name}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* IMAGE COVER */}
        <View style={styles.imageWrapper}>
          <Image 
            source={exercise.imageUrl ? { uri: exercise.imageUrl } : defaultExerciseImage} 
            style={styles.coverImage} 
          />
          {/* OPTIONAL: Beri label jika AI Support */}
          {isAiReady && (
             <View style={styles.aiBadge}>
               <MaterialIcons name="memory" size={14} color="white" style={{marginRight: 4}} />
               <Text style={styles.aiBadgeText}>AI Supported</Text>
             </View>
          )}
        </View>

        {/* DETAILS SECTION */}
        <View style={styles.detailsContainer}>
          <Text style={styles.detailRow}>
            <Text style={styles.label}>Target Muscles: </Text>
            <Text style={styles.value}>{exercise.target_muscles?.join(', ')}.</Text>
          </Text>

          <Text style={styles.detailRow}>
            <Text style={styles.label}>Difficulty: </Text>
            <Text style={styles.value}>{exercise.difficulty}.</Text>
          </Text>

          <Text style={styles.detailRow}>
            <Text style={styles.label}>Goal: </Text>
            <Text style={styles.value}>{exercise.goal}</Text>
          </Text>

          {/* DIVIDER */}
          <View style={styles.divider} />

          {/* STEP BY STEP */}
          <Text style={styles.stepTitle}>Step-by-step:</Text>
          {exercise.step_by_step?.map((step, index) => (
            <View key={index} style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* START EXERCISE BUTTON */}
        {showStartButton && (
          <TouchableOpacity 
            style={styles.startButton}
            onPress={() => {
              const paramsUntukLiveWorkout = {
                workoutId: workoutId,
                exerciseId: exerciseId,
                workoutName: workoutName
              };
              if (navigation.isAiConnected && navigation.connectedStation) {
                navigation.navigate('LiveWorkout', {
                  ...paramsUntukLiveWorkout,
                  aiIp: navigation.connectedStation.ip,
                  aiPort: navigation.connectedStation.port,
                  stationId: navigation.connectedStation.stationId,
                });
              } else {
                navigation.navigate('scan', { returnTo: 'LiveWorkout', paramsUntukLiveWorkout});
              }
            }}
          >
            <Text style={styles.startButtonText}>Start Exercise!</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#222222' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20 },
  backButton: { paddingRight: 10 },
  headerTitle: { color: 'white', fontSize: 24, fontFamily: 'Satoshi-Bold' },
  scrollContainer: { paddingHorizontal: 20 },
  imageWrapper: { position: 'relative' },
  coverImage: { width: '100%', height: 220, borderRadius: 15, backgroundColor: '#333', marginBottom: 20 },
  aiBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#4CAF50', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  aiBadgeText: { color: 'white', fontSize: 12, fontFamily: 'Satoshi-Bold' },
  detailsContainer: { marginBottom: 20 },
  detailRow: { marginBottom: 8, lineHeight: 22 },
  label: { color: '#FF6500', fontSize: 14, fontFamily: 'Satoshi-Bold' },
  value: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Satoshi-Light' },
  divider: { height: 1, backgroundColor: '#FFFFFF', marginVertical: 15 },
  stepTitle: { color: '#FF6500', fontSize: 14, fontFamily: 'Satoshi-Bold', marginBottom: 10, marginTop: 10 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  bullet: { color: '#FFFFFF', fontSize: 14, marginRight: 8, marginTop: 2 },
  stepText: { color: '#FFFFFF', fontSize: 14, fontFamily: 'Satoshi-Regular', lineHeight: 22, flex: 1 },
  startButton: { backgroundColor: '#FF6500', paddingVertical: 15, borderRadius: 30, alignItems: 'center', marginTop: 20, marginBottom: 30 },
  startButtonText: { color: 'white', fontSize: 16, fontFamily: 'Satoshi-Bold' }
});