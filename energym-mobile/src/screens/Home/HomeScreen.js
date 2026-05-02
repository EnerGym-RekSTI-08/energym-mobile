import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions, StyleSheet
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { format, addDays } from 'date-fns'; 
import Svg, { Circle, G } from 'react-native-svg'; 
import { supabase } from '../../services/supabase'; 
import styles from '../../styles/globalStyles'; 

const defaultProfileImage = require('../../assets/images/profile picture.webp');
const defaultWorkoutImage = require('../../assets/images/profile picture.webp'); 

const { width } = Dimensions.get('window');

const DonutChartReps = ({ percentage, size, strokeWidth, color, backgroundColor, hideText = false }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * percentage) / 100;

  return (
    <View style={{ position: 'relative', width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={backgroundColor} 
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      </Svg>
      {!hideText ? (
        <View style={{ position: 'absolute', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>{percentage}%</Text>
        </View>
      ) : null}
    </View>
  );
};

export default function HomeScreen({ navigation }) {
  const [profileData, setProfileData] = useState({ username: '', avatarUrl: null });
  const [workouts, setWorkouts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);
  const today = new Date();

  const repsData = { total: 10923, perfect: 923, bad: 323, percentage: 91 };

  useEffect(() => {
    fetchProfile();
    fetchWorkouts();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();

      if (data) {
        let publicAvatarUrl = null;
        if (data.avatar_url) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(data.avatar_url);
          publicAvatarUrl = publicUrl;
        }
        setProfileData({ username: data.username, avatarUrl: publicAvatarUrl });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchWorkouts = async () => {
    try {
      setLoadingWorkouts(true);

      const { data: bicepData, error: bicepError } = await supabase
        .from('workouts')
        .select('*')
        .eq('name', 'Bicep Mastery')
        .single();

      const { data: othersData, error: othersError } = await supabase
        .from('workouts')
        .select('*')
        .neq('name', 'Bicep Mastery') 
        .limit(3);

      let combinedWorkouts = [];

      if (bicepData) {
        combinedWorkouts.push(bicepData);
      }
      if (othersData) {
        combinedWorkouts = [...combinedWorkouts, ...othersData];
      }

      const formattedWorkouts = combinedWorkouts.map(w => {
        let imageUrl = null;
        if (w.image_url_path) {
          const { data: { publicUrl } } = supabase.storage.from('workouts').getPublicUrl(w.image_url_path);
          imageUrl = publicUrl;
        }
        return { ...w, image_url: imageUrl };
      });

      setWorkouts(formattedWorkouts);
    } catch (error) {
      console.log("Error fetching pinned workouts:", error.message);
    } finally {
      setLoadingWorkouts(false);
    }
  };

  const generateDateStrip = () => {
    const dates = [];
    for (let i = -3; i <= 3; i++) {
      dates.push(addDays(today, i));
    }
    return dates;
  };

  const dateStrip = generateDateStrip();
  const profileImageSource = profileData.avatarUrl ? { uri: profileData.avatarUrl } : defaultProfileImage;

  return (
    <ScrollView style={[styles.container, { backgroundColor: '#121212' }]}>
      <View style={localStyles.headerContainer}>
        {loadingProfile ? (
          <ActivityIndicator color="#E65100" />
        ) : (
          <Image source={profileImageSource} style={localStyles.avatar} />
        )}
        <View style={localStyles.headerTextContainer}>
          <Text style={localStyles.greetingText}>Hi, {profileData.username || 'User'}</Text>
          <Text style={localStyles.subGreetingText}>Welcome back!</Text>
        </View>
      </View>

      <View style={localStyles.dateStripContainer}>
        {dateStrip.map((date, index) => {
          const isToday = index === 3; 
          return (
            <View key={index} style={[localStyles.dateBox, isToday ? localStyles.activeDateBox : null]}>
              <Text style={[localStyles.dayText, isToday ? localStyles.activeDateText : null]}>
                {format(date, 'EEE')}
              </Text>
              <Text style={[localStyles.dateText, isToday ? localStyles.activeDateText : null]}>
                {format(date, 'd')}
              </Text>
            </View>
          );
        })}
      </View>

      <Text style={localStyles.sectionTitle}>Recent Activity</Text>
      <View style={localStyles.activityContainer}>
        <View style={localStyles.repsCard}>
          <View style={localStyles.repsHeader}>
            <FontAwesome5 name="dumbbell" size={16} color="#E65100" />
            <Text style={localStyles.repsTitle}>Total Reps</Text>
          </View>
          <View style={localStyles.repsBody}>
            <View>
              <Text style={localStyles.repsCount}>{repsData.total} reps</Text>
              <Text style={localStyles.repsSubText}>{repsData.perfect} perfect | {repsData.bad} bad</Text>
            </View>
            <DonutChartReps percentage={repsData.percentage} size={60} strokeWidth={6} color="#E65100" backgroundColor="#333" hideText={false} />
          </View>
        </View>

        <View style={localStyles.rowCards}>
          <View style={localStyles.smallCard}>
            <View style={localStyles.smallCardHeader}>
              <MaterialIcons name="local-fire-department" size={16} color="#E65100" />
              <Text style={localStyles.smallCardTitle}>Calories</Text>
            </View>
            <View style={localStyles.smallCardBody}>
              <View>
                <Text style={localStyles.smallCardValue}>623 kcal</Text>
                <Text style={localStyles.smallCardSub}>121 mins</Text>
              </View>
              <DonutChartReps percentage={80} size={36} strokeWidth={4} color="#E65100" backgroundColor="#333" hideText={true} />
            </View>
          </View>

          <View style={localStyles.smallCard}>
            <View style={localStyles.smallCardHeader}>
              <MaterialIcons name="alarm" size={16} color="#E65100" />
              <Text style={localStyles.smallCardTitle}>Duration</Text>
            </View>
            <View style={localStyles.smallCardBody}>
              <View>
                <Text style={localStyles.smallCardValue}>43 mins</Text>
                <Text style={localStyles.smallCardSub}>Session</Text>
              </View>
              <DonutChartReps percentage={60} size={36} strokeWidth={4} color="#E65100" backgroundColor="#333" hideText={true} />
            </View>
          </View>
        </View>
      </View>

      <Text style={localStyles.sectionTitle}>Trending Workout</Text>
      {loadingWorkouts ? (
        <ActivityIndicator color="#FF6500" style={{ marginTop: 20 }} />
      ) : (
        <View style={localStyles.workoutGrid}>
          {workouts.map((workout, index) => (
            <TouchableOpacity 
              key={index} 
              style={localStyles.workoutCard}
              onPress={() => navigation.navigate('WorkoutDetail', { 
                workoutId: workout.id, 
                workoutName: workout.name 
              })}
            >
              <Image 
                source={workout.image_url ? { uri: workout.image_url } : defaultWorkoutImage} 
                style={localStyles.workoutImage} 
              />
              <View style={localStyles.workoutOverlay}>
                
                {/* --- BAGIAN HEADER CARD YANG BARU --- */}
                <View style={localStyles.topHeader}>
                  <View style={localStyles.typeContainer}>
                    <FontAwesome5 name="running" size={12} color="#FF6500" />
                    <Text style={localStyles.typeText}>Workout</Text>
                  </View>
                  <View style={localStyles.exerciseBadge}>
                    <FontAwesome5 name="dumbbell" size={10} color="#FF6500" />
                    <Text style={localStyles.exerciseBadgeText}>{workout.number_of_exercises} Exercises</Text>
                  </View>
                </View>
                {/* ---------------------------------- */}

                <View style={localStyles.workoutTextContainer}>
                  <Text style={localStyles.workoutName}>{workout.name}</Text>
                  <Text style={localStyles.workoutDesc}>{workout.total_kcal} kcal | {workout.duration_minutes} min</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
  headerContainer: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 50 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#333' },
  headerTextContainer: { marginLeft: 15 },
  greetingText: { color: 'white', fontSize: 20, fontFamily: 'Satoshi-Medium' },
  subGreetingText: { color: '#FFFFFF', fontSize: 16, fontFamily: 'Satoshi-Light' },
  
  dateStripContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  dateBox: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10 },
  activeDateBox: { backgroundColor: '#E65100' },
  dayText: { color: '#FFFFFF', fontSize: 12, fontFamily: 'Satoshi-Light', marginBottom: 4 },
  dateText: { color: 'white', fontSize: 12, fontFamily: 'Satoshi-Light' },
  activeDateText: { color: 'white' },

  sectionTitle: { color: 'white', fontSize: 18, fontFamily: 'Satoshi-Medium', paddingHorizontal: 20, marginBottom: 15 },
  
  activityContainer: { paddingHorizontal: 20, marginBottom: 25 },
  repsCard: { backgroundColor: '#1E1E1E', borderRadius: 15, padding: 15, marginBottom: 15 },
  repsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  repsTitle: { color: 'white', fontSize: 14, fontFamily: 'Satoshi-Regular', marginLeft: 10 },
  repsBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  repsCount: { color: 'white', fontSize: 14, fontFamily: 'Satoshi-Regular' },
  repsSubText: { color: '#c6c3c3', fontSize: 10, fontFamily: 'Satoshi-Regular', marginTop: 4 },
  
  rowCards: { flexDirection: 'row', justifyContent: 'space-between' },
  smallCard: { backgroundColor: '#1E1E1E', borderRadius: 15, padding: 15, width: '48%' },
  smallCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  smallCardTitle: { color: 'white', fontSize: 14, fontFamily: 'Satoshi-Regular', marginLeft: 8 },
  smallCardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  smallCardValue: { color: 'white', fontSize: 14, fontFamily: 'Satoshi-Regular'},
  smallCardSub: { color: '#c6c3c3', fontSize: 10, fontFamily: 'Satoshi-Regular', marginTop: 4 },

  workoutGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20 },
  workoutCard: { width: '48%', height: 200, borderRadius: 15, marginBottom: 15, overflow: 'hidden', backgroundColor: '#1E1E1E' },
  workoutImage: { width: '100%', height: '100%', position: 'absolute' },
  
  // --- STYLE UNTUK CARD OVERLAY DIPERBARUI ---
  workoutOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', padding: 12, justifyContent: 'space-between' },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  typeContainer: { flexDirection: 'row', alignItems: 'center' },
  typeText: { color: 'white', fontSize: 10, marginLeft: 5, fontFamily: 'Satoshi-Regular' },
  exerciseBadge: { backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 8 },
  exerciseBadgeText: { color: 'black', fontSize: 6, fontFamily: 'Satoshi-Medium', marginLeft: 4 },
  workoutTextContainer: { marginTop: 'auto' },
  workoutName: { color: '#FF6500', fontSize: 14, fontFamily: 'Satoshi-Medium', marginBottom: 4 },
  workoutDesc: { color: '#C6C3C3', fontSize: 10, fontFamily: 'Satoshi-Regular' },
  // ---------------------------------------------
});