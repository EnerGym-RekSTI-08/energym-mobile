import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase'; 
import styles from '../../styles/globalStyles';

const defaultProfileImage = require('../../assets/images/profile picture.webp');

export default function ProfileScreen({ navigation }) {
  const [profileData, setProfileData] = useState({
    username: '',
    height: '',
    weight: '',
    avatarUrl: null, 
  });
  
  // State baru untuk menyimpan statistik kumulatif
  const [stats, setStats] = useState({
    totalExercises: 0,
    perfectPercentage: 0,
    formattedCalories: '0'
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Memanggil kedua fungsi secara bersamaan
    fetchUserDataAndStats();
  }, []);

  const fetchUserDataAndStats = async () => {
    try {
      setLoading(true);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("User not logged in");
        setLoading(false);
        return;
      }

      // 1. AMBIL DATA PROFIL
      const profilePromise = supabase
        .from('profiles')
        .select('username, height, weight, avatar_url')
        .eq('id', user.id)
        .single(); 

      // 2. AMBIL DATA STATISTIK WORKOUT (Relasi tabel)
      const statsPromise = supabase
        .from('workout_history')
        .select(`
          total_calories,
          workout_history_exercises (
            perfect_reps,
            bad_reps
          )
        `)
        .eq('user_id', user.id);

      // Tunggu kedua data selesai diambil
      const [profileResponse, statsResponse] = await Promise.all([profilePromise, statsPromise]);

      // --- PROSES DATA PROFIL ---
      if (profileResponse.data) {
        let publicAvatarUrl = null;
        if (profileResponse.data.avatar_url) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(profileResponse.data.avatar_url);
          publicAvatarUrl = publicUrl;
        }

        setProfileData({
          username: profileResponse.data.username,
          height: profileResponse.data.height,
          weight: profileResponse.data.weight,
          avatarUrl: publicAvatarUrl,
        });
      }

      // --- PROSES DATA STATISTIK ---
      if (statsResponse.data && statsResponse.data.length > 0) {
        let totalExercisesCount = 0;
        let totalCaloriesCount = 0;
        let totalPerfectReps = 0;
        let totalBadReps = 0;

        statsResponse.data.forEach(workout => {
          // Tambahkan total kalori
          totalCaloriesCount += (workout.total_calories || 0);
          
          const exercises = workout.workout_history_exercises || [];
          // Tambahkan jumlah exercise
          totalExercisesCount += exercises.length;

          // Tambahkan reps untuk kalkulasi persentase
          exercises.forEach(ex => {
            totalPerfectReps += (ex.perfect_reps || 0);
            totalBadReps += (ex.bad_reps || 0);
          });
        });

        // Kalkulasi Persentase
        const totalReps = totalPerfectReps + totalBadReps;
        // Gunakan toFixed(1) agar hanya ada 1 angka di belakang koma (misal: 57.7)
        const perfectPercentage = totalReps > 0 
          ? ((totalPerfectReps / totalReps) * 100).toFixed(1) 
          : 0;

        // Format Kalori (Ubah ke k jika lebih dari 1000)
        let formattedKcal = totalCaloriesCount.toString();
        if (totalCaloriesCount >= 1000) {
          // Jika 1200 jadi 1.2k. Jika 1000 jadi 1.0k
          formattedKcal = (totalCaloriesCount / 1000).toFixed(1) + 'k';
        }

        setStats({
          totalExercises: totalExercisesCount,
          perfectPercentage: perfectPercentage,
          formattedCalories: formattedKcal
        });
      }

    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Logout Error", error.message);
    } else {
      navigation.navigate('welcome'); 
    }
  };

  const imageSource = profileData.avatarUrl ? { uri: profileData.avatarUrl } : defaultProfileImage;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Profile</Text>
      </View>

      <View style={styles.profileContainer}>
        <Image source={imageSource} style={styles.profileImage} />
        
        {loading ? (
          <ActivityIndicator size="small" color="#FF6500" style={{ marginTop: 10 }} />
        ) : (
          <>
            <Text style={styles.profileName}>{profileData.username || 'User'}</Text>
            <Text style={styles.profileSubname}>
              {profileData.height ? `${profileData.height}cm` : '-'} | {profileData.weight ? `${profileData.weight}kg` : '-'}
            </Text>
          </>
        )}
      </View>

      <View style={styles.profileStatsSection}>
        <Text style={styles.profileStatsSectionTitle}>Your Statistics</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#FF6500" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.profileStatsGrid}>
            <View style={styles.profileStatBox}>
              <MaterialIcons name="work" size={24} color="#FF6500" />
              <Text style={styles.profileStatCount}>{stats.totalExercises}</Text>
              {/* Label saya ubah ke exercises karena menghitung total exercise */}
              <Text style={styles.profileStatLabel}>exercises</Text> 
            </View>
            <View style={styles.profileStatBox}>
              <MaterialIcons name="trending-up" size={24} color="#FF6500" />
              <Text style={styles.profileStatCount}>{stats.perfectPercentage}</Text>
              <Text style={styles.profileStatLabel}>%</Text>
            </View>
            <View style={styles.profileStatBox}>
              <MaterialIcons name="local-fire-department" size={24} color="#FF6500" />
              <Text style={styles.profileStatCount}>{stats.formattedCalories}</Text>
              <Text style={styles.profileStatLabel}>kcal</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.profileButtonsContainer}>
        <TouchableOpacity style={styles.profileActionButton} onPress={() => navigation.navigate('EditProfile')}>
          <MaterialIcons name="edit" size={18} color="white" />
          <Text style={styles.profileActionButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileActionButton} onPress={() => navigation.navigate('PhysicalData')}>
          <MaterialIcons name="info" size={18} color="white" />
          <Text style={styles.profileActionButtonText}>Personal Data</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButtonLarge} onPress={handleLogout}>
        <Text style={styles.logoutButtonLargeText}>Log Out</Text>
      </TouchableOpacity>
      
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}