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
  const [loading, setLoading] = useState(true);

  // KEMBALI MENGGUNAKAN useEffect BUKAN useFocusEffect
  // Karena sistem navigasi App.js kamu me-render ulang komponen saat tab berubah atau goBack() dipanggil.
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("User not logged in");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('username, height, weight, avatar_url')
        .eq('id', user.id)
        .single(); 

      if (error) {
        console.error("Error fetching profile:", error);
      } else if (data) {
        let publicAvatarUrl = null;
        if (data.avatar_url) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(data.avatar_url);
          publicAvatarUrl = publicUrl;
        }

        setProfileData({
          username: data.username,
          height: data.height,
          weight: data.weight,
          avatarUrl: publicAvatarUrl,
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
      // Karena pakai custom navigation, pastikan 'welcome' terdaftar di switch App.js
      navigation.navigate('welcome'); 
    }
  };

  const imageSource = profileData.avatarUrl ? { uri: profileData.avatarUrl } : defaultProfileImage;

  return (
    <ScrollView style={styles.container}>
      {/* ... KODE UI SISANYA TETAP SAMA SEPERTI SEBELUMNYA ... */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Profile</Text>
      </View>

      <View style={styles.profileContainer}>
        <Image source={imageSource} style={styles.profileImage} />
        
        {loading ? (
          <ActivityIndicator size="small" color="#E65100" style={{ marginTop: 10 }} />
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
        <View style={styles.profileStatsGrid}>
          <View style={styles.profileStatBox}>
            <MaterialIcons name="work" size={24} color="#E65100" />
            <Text style={styles.profileStatCount}>12</Text>
            <Text style={styles.profileStatLabel}>sessions</Text>
          </View>
          <View style={styles.profileStatBox}>
            <MaterialIcons name="trending-up" size={24} color="#E65100" />
            <Text style={styles.profileStatCount}>57.72</Text>
            <Text style={styles.profileStatLabel}>%</Text>
          </View>
          <View style={styles.profileStatBox}>
            <MaterialIcons name="local-fire-department" size={24} color="#E65100" />
            <Text style={styles.profileStatCount}>1.2k</Text>
            <Text style={styles.profileStatLabel}>kcal</Text>
          </View>
        </View>
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