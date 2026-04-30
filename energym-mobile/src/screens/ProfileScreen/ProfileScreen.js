import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const profileImage = require('../../assets/images/profile picture.jpg');

const ProfileScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Profile Info Card */}
      <View style={styles.profileCard}>
        <Image source={profileImage} style={styles.avatar} />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>Fhatika Adhalisman</Text>
          <Text style={styles.nim}>NIM: 18223062</Text>
          <Text style={styles.major}>Sistem dan Teknologi Informasi, ITB</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={() => navigation.navigate('EditProfile')}
        >
          <MaterialIcons name="edit" size={18} color="#FFF" style={styles.btnIcon} />
          <Text style={styles.primaryButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={() => navigation.navigate('PhysicalData')}
        >
          <Ionicons name="barbell-outline" size={18} color="#E65100" style={styles.btnIcon} />
          <Text style={styles.secondaryButtonText}>Physical Data</Text>
        </TouchableOpacity>
      </View>

      {/* Settings Options */}
      <View style={styles.settingsSection}>
        <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
          <View style={[styles.iconBox, { backgroundColor: '#E6510020' }]}>
            <MaterialIcons name="person-outline" size={24} color="#E65100" />
          </View>
          <Text style={styles.settingText}>Account Settings</Text>
          <MaterialIcons name="chevron-right" size={24} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
          <View style={[styles.iconBox, { backgroundColor: '#2C2C2E' }]}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#888" />
          </View>
          <Text style={styles.settingText}>Privacy & Security</Text>
          <MaterialIcons name="chevron-right" size={24} color="#888" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
          <View style={[styles.iconBox, { backgroundColor: '#2C2C2E' }]}>
            <MaterialIcons name="help-outline" size={24} color="#888" />
          </View>
          <Text style={styles.settingText}>Help & Support</Text>
          <MaterialIcons name="chevron-right" size={24} color="#888" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginTop: 30,
    marginBottom: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontFamily: 'Satoshi-Bold',
  },
  profileCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: '#E65100',
  },
  infoContainer: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
    marginBottom: 4,
  },
  nim: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
  },
  major: {
    color: '#999',
    fontSize: 11,
    fontFamily: 'Satoshi-Regular',
    marginTop: 3,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#E65100',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    width: (width - 56) / 2,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: '#E65100',
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    width: (width - 56) / 2,
  },
  btnIcon: {
    marginRight: 6,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'Satoshi-Bold',
  },
  secondaryButtonText: {
    color: '#E65100',
    fontSize: 13,
    fontFamily: 'Satoshi-Bold',
  },
  settingsSection: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#3C3C3E',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    flex: 1,
  },
});

export default ProfileScreen;