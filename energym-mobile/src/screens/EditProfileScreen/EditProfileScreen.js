import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const profileImage = require('../../assets/images/profile picture.jpg');

const EditProfileScreen = ({ navigation }) => {
  const [name, setName] = useState('Fhatika Adhalisman');
  const [nim, setNim] = useState('18223062');
  const [major, setMajor] = useState('Sistem dan Teknologi Informasi');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} /> 
      </View>

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <Image source={profileImage} style={styles.avatar} />
        <TouchableOpacity style={styles.changePicButton}>
          <Text style={styles.changePicText}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Form Inputs */}
      <View style={styles.formGroup}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nama Lengkap</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Masukkan nama"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>NIM</Text>
          <TextInput
            style={styles.input}
            value={nim}
            onChangeText={setNim}
            placeholder="Masukkan NIM"
            placeholderTextColor="#666"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Jurusan / Fakultas</Text>
          <TextInput
            style={styles.input}
            value={major}
            onChangeText={setMajor}
            placeholder="Masukkan jurusan"
            placeholderTextColor="#666"
          />
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.saveButton} onPress={() => navigation.goBack()}>
        <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 35,
    marginBottom: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderColor: '#E65100',
    borderWidth: 2,
  },
  changePicButton: {
    marginTop: 12,
  },
  changePicText: {
    color: '#E65100',
    fontFamily: 'Satoshi-Bold',
    fontSize: 14,
  },
  formGroup: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    color: '#999',
    fontSize: 13,
    fontFamily: 'Satoshi-Medium',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1C1C1E',
    color: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    fontFamily: 'Satoshi-Regular',
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: '#E65100',
    marginTop: 30,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
  },
});

export default EditProfileScreen;