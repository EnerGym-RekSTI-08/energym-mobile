import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // Tambahan untuk pilih gambar
import { decode } from 'base64-arraybuffer'; // Tambahan untuk konversi gambar ke Supabase
import { supabase } from '../../services/supabase'; 
import styles from '../../styles/globalStyles'; 

const defaultProfileImage = require('../../assets/images/profile picture.webp');

export default function EditProfileScreen({ navigation }) {
  const [userId, setUserId] = useState(null);

  // State untuk form input yang bisa diubah
  const [username, setUsername] = useState('');
  const [fullname, setFullname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // State untuk data yang hanya dibaca (Read-only)
  const [email, setEmail] = useState('');

  // State BARU untuk gambar
  const [avatarUrl, setAvatarUrl] = useState(null); // URL gambar dari database
  const [localImageUri, setLocalImageUri] = useState(null); // Preview gambar lokal dari HP
  const [imageBase64, setImageBase64] = useState(null); // Data mentah untuk diupload

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        Alert.alert("Error", "User not found.");
        setLoading(false);
        return;
      }

      setUserId(user.id);
      setEmail(user.email); // Set email untuk ditampilkan saja

      // Tambahkan avatar_url ke dalam select
      const { data, error } = await supabase
        .from('profiles')
        .select('username, fullname, phone_number, avatar_url')
        .eq('id', user.id)
        .single();

      if (data) {
        setUsername(data.username || '');
        setFullname(data.fullname || '');
        setPhoneNumber(data.phone_number || '');

        // Cek apakah user punya gambar profil di database
        if (data.avatar_url) {
          const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(data.avatar_url);
          setAvatarUrl(publicUrl);
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi BARU untuk memilih gambar dari galeri
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Kotak 1:1
      quality: 0.5, // Kompresi
      base64: true, // Kunci untuk upload ke Supabase
    });

    if (!result.canceled) {
      setLocalImageUri(result.assets[0].uri); // Untuk preview instan
      setImageBase64(result.assets[0].base64); // Untuk dikirim saat 'Save Changes'
    }
  };

  const handleSaveChanges = async () => {
    if (!username || !fullname) {
      Alert.alert("Error", "Username and Full Name cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      let newAvatarPath = null;

      // 1. Jika user memilih foto baru, upload dulu ke Supabase Storage
      if (imageBase64) {
        const filePath = `${userId}/${Date.now()}.jpg`; // Nama file unik
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, decode(imageBase64), {
            contentType: 'image/jpeg',
          });

        if (uploadError) throw uploadError;
        newAvatarPath = filePath; // Simpan path-nya
      }

      // 2. Siapkan data biodata yang mau di-update
      const updateData = {
        username: username,
        fullname: fullname,
        phone_number: phoneNumber,
      };

      // 3. Jika ada foto baru, tambahkan path fotonya ke update data
      if (newAvatarPath) {
        updateData.avatar_url = newAvatarPath;
      }

      // 4. Kirim update ke tabel profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (profileError) throw profileError;

      Alert.alert("Success", "Profile updated successfully!");
      navigation.goBack(); 

    } catch (error) {
      Alert.alert("Update Failed", error.message);
    } finally {
      setSaving(false);
    }
  };

  // Menentukan gambar mana yang akan ditampilkan saat ini
  const imageSource = localImageUri 
    ? { uri: localImageUri }  // Prioritas 1: Foto baru yang dipilih dari galeri
    : avatarUrl 
      ? { uri: avatarUrl }    // Prioritas 2: Foto dari database
      : defaultProfileImage;  // Prioritas 3: Gambar default statis

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF6500" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.detailHeaderTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tambahkan onPress={pickImage} pada bungkus gambar ini */}
      <TouchableOpacity style={styles.editProfileImageWrapper} onPress={pickImage}>
        <Image source={imageSource} style={styles.editProfileImageLarge} />
        <View style={styles.editProfileImageOverlay}>
          <MaterialIcons name="camera-alt" size={24} color="white" />
        </View>
      </TouchableOpacity>

      <View style={styles.editFormContainer}>
        <Text style={styles.editInputLabel}>Username</Text>
        <TextInput
          style={styles.editInput}
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="#999"
        />

        <Text style={styles.editInputLabel}>Full Name</Text>
        <TextInput
          style={styles.editInput}
          value={fullname}
          onChangeText={setFullname}
          placeholderTextColor="#999"
        />

        <Text style={styles.editInputLabel}>Email</Text>
        <TextInput
          style={[styles.editInput, { color: '#777', backgroundColor: '#2A2A2A' }]}
          value={email}
          editable={false} 
        />

        <Text style={styles.editInputLabel}>Password</Text>
        <TextInput
          style={[styles.editInput, { color: '#777', backgroundColor: '#2A2A2A' }]}
          value="••••••••" 
          editable={false} 
          secureTextEntry
        />

        <Text style={styles.editInputLabel}>Phone Number</Text>
        <TextInput
          style={styles.editInput}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholderTextColor="#999"
          keyboardType="phone-pad"
        />

        <TouchableOpacity 
          style={styles.editSaveButton} 
          onPress={handleSaveChanges}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.editSaveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
        
        <View style={{ height: 100 }} />
      </View>
    </ScrollView>
  );
}