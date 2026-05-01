import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../../styles/globalStyles'; // Mundur ke src/styles/

// Pastikan path gambar ini sesuai dengan struktur aset kamu
const profileImage = require('../../assets/images/profile picture.webp');

export default function EditProfileScreen({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.detailHeaderTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <TouchableOpacity style={styles.editProfileImageWrapper}>
        <Image source={profileImage} style={styles.editProfileImageLarge} />
        <View style={styles.editProfileImageOverlay}>
          <MaterialIcons name="camera-alt" size={24} color="white" />
        </View>
      </TouchableOpacity>

      <View style={styles.editFormContainer}>
        <Text style={styles.editInputLabel}>Username</Text>
        <TextInput
          style={styles.editInput}
          defaultValue="michael001"
          placeholderTextColor="#999"
        />

        <Text style={styles.editInputLabel}>Full Name</Text>
        <TextInput
          style={styles.editInput}
          defaultValue="Michael B. Jordan"
          placeholderTextColor="#999"
        />

        <Text style={styles.editInputLabel}>Email</Text>
        <TextInput
          style={styles.editInput}
          defaultValue="michaeljordan@gmail.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
        />

        <Text style={styles.editInputLabel}>Password</Text>
        <TextInput
          style={styles.editInput}
          defaultValue="••••••••••••••"
          placeholderTextColor="#999"
          secureTextEntry
        />

        <Text style={styles.editInputLabel}>Phone Number</Text>
        <TextInput
          style={styles.editInput}
          defaultValue="+62-8123-4567-890"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
        />

        <TouchableOpacity style={styles.editSaveButton}>
          <Text style={styles.editSaveButtonText}>Save Changes</Text>
        </TouchableOpacity>
        
        {/* Spacer untuk Bottom Tab */}
        <View style={{ height: 100 }} />
      </View>
    </ScrollView>
  );
}