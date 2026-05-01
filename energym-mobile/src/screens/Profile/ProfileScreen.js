import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../../styles/globalStyles';

// Path mundur satu tingkat ke assets
const profileImage = require('../../assets/images/profile picture.webp');

export default function ProfileScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Profile</Text>
      </View>

      <View style={styles.profileContainer}>
        <Image source={profileImage} style={styles.profileImage} />
        <Text style={styles.profileName}>Michael</Text>
        <Text style={styles.profileSubname}>181cm | 74kg</Text>
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
        <TouchableOpacity
          style={styles.profileActionButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <MaterialIcons name="edit" size={18} color="white" />
          <Text style={styles.profileActionButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileActionButton}
          onPress={() => navigation.navigate('PhysicalData')}
        >
          <MaterialIcons name="info" size={18} color="white" />
          <Text style={styles.profileActionButtonText}>Personal Data</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButtonLarge}>
        <Text style={styles.logoutButtonLargeText}>Log Out</Text>
      </TouchableOpacity>
      
      {/* Spacer untuk Bottom Tab */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}