import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, TextInput, StyleSheet 
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';

const defaultWorkoutImage = require('../../assets/images/profile picture.webp');

export default function WorkoutScreen({ navigation }) {
  const [workouts, setWorkouts] = useState([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllWorkouts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredWorkouts(workouts);
    } else {
      const filtered = workouts.filter(workout => 
        workout.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredWorkouts(filtered);
    }
  }, [searchQuery, workouts]);

  const fetchAllWorkouts = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      if (data) {
        const formattedWorkouts = data.map(w => {
          let imageUrl = null;
          if (w.image_url_path) {
            const { data: { publicUrl } } = supabase.storage
              .from('workouts')
              .getPublicUrl(w.image_url_path);
            imageUrl = publicUrl;
          }
          return { ...w, image_url: imageUrl };
        });

        setWorkouts(formattedWorkouts);
        setFilteredWorkouts(formattedWorkouts);
      }
    } catch (error) {
      console.error("Error fetching all workouts:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      
      <View style={styles.headerContainer}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color="#FFFFFF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#FFFFFF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#FF6500" style={{ marginTop: 50 }} />
        ) : filteredWorkouts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No workouts found.</Text>
          </View>
        ) : (
          <View style={styles.workoutGrid}>
            {filteredWorkouts.map((workout, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.workoutCard}
                onPress={() => navigation.navigate('WorkoutDetail', { 
                  workoutId: workout.id, 
                  workoutName: workout.name 
                })}
              >
                <Image 
                  source={workout.image_url ? { uri: workout.image_url } : defaultWorkoutImage} 
                  style={styles.workoutImage} 
                />
                <View style={styles.workoutOverlay}>
                  
                  <View style={styles.topHeader}>
                    <View style={styles.typeContainer}>
                      <FontAwesome5 name="running" size={12} color="#FF6500" />
                      <Text style={styles.typeText}>Workout</Text>
                    </View>
                    <View style={styles.exerciseBadge}>
                      <FontAwesome5 name="dumbbell" size={10} color="#FF6500" />
                      <Text style={styles.exerciseBadgeText}>{workout.number_of_exercises} Exercises</Text>
                    </View>
                  </View>

                  <View style={styles.workoutTextContainer}>
                    <Text style={styles.workoutName}>{workout.name}</Text>
                    <Text style={styles.workoutDesc}>
                      {workout.total_kcal} kcal | {workout.duration_minutes} min
                    </Text>
                  </View>

                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#121212' 
  },
  headerContainer: { 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    paddingBottom: 15 
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#75757580',
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Satoshi-Regular',
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Satoshi-Regular',
  },
  workoutGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20 
  },
  workoutCard: { 
    width: '48%', 
    height: 220, 
    borderRadius: 15, 
    marginBottom: 15, 
    overflow: 'hidden', 
    backgroundColor: '#1E1E1E' 
  },
  workoutImage: { 
    width: '100%', 
    height: '100%', 
    position: 'absolute' 
  },
  workoutOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.3)', 
    padding: 12, 
    justifyContent: 'space-between' 
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    color: 'white',
    fontSize: 10,
    marginLeft: 5,
    fontFamily: 'Satoshi-Regular',
  },
  exerciseBadge: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
  },
  exerciseBadgeText: {
    color: 'black',
    fontSize: 6,
    fontFamily: 'Satoshi-Medium',
    marginLeft: 4,
  },
  workoutTextContainer: { 
    marginTop: 'auto' 
  },
  workoutName: { 
    color: '#FF6500', 
    fontSize: 14, 
    fontFamily: 'Satoshi-Medium',
    marginBottom: 4,
  },
  workoutDesc: { 
    color: '#C6C3C3', 
    fontSize: 10, 
    fontFamily: 'Satoshi-Regular',
  },
});