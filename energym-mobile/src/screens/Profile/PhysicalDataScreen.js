import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase'; // Pastikan path ini benar
import styles from '../../styles/globalStyles'; // Mundur ke src/styles/

export default function PhysicalDataScreen({ navigation }) {
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [physicalData, setPhysicalData] = useState({
    age: '',
    gender: 'Male',
    height: '',
    weight: '',
    dominantHand: 'Right',
    injuryHistory: 'No',
  });

  // Ambil data saat layar pertama kali dibuka
  useEffect(() => {
    fetchPhysicalData();
  }, []);

  const fetchPhysicalData = async () => {
    try {
      setLoading(true);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        Alert.alert("Error", "User not found.");
        setLoading(false);
        return;
      }

      setUserId(user.id);

      // Ambil data dari tabel profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('age, gender, height, weight, dominant_hand, injury_history')
        .eq('id', user.id)
        .single();

      if (data) {
        setPhysicalData({
          age: data.age ? data.age.toString() : '',
          gender: data.gender || 'Male',
          height: data.height ? data.height.toString() : '',
          weight: data.weight ? data.weight.toString() : '',
          dominantHand: data.dominant_hand || 'Right',
          // Konversi Boolean dari DB (true/false) menjadi String untuk UI ('Yes'/'No')
          injuryHistory: data.injury_history ? 'Yes' : 'No',
        });
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    // Validasi input kosong
    if (!physicalData.age || !physicalData.height || !physicalData.weight) {
      Alert.alert("Error", "Please fill in Age, Height, and Weight.");
      return;
    }

    const numAge = parseInt(physicalData.age);
    const numHeight = parseFloat(physicalData.height);
    const numWeight = parseFloat(physicalData.weight);

    // Validasi angka masuk akal
    if (numAge < 12 || numAge > 100) return Alert.alert('Invalid Age', 'Age must be between 12 and 100.');
    if (numHeight < 100 || numHeight > 250) return Alert.alert('Invalid Height', 'Please enter a valid height in cm (100 - 250).');
    if (numWeight < 30 || numWeight > 300) return Alert.alert('Invalid Weight', 'Please enter a valid weight in kg (30 - 300).');

    try {
      setSaving(true);

      // Konversi UI ('Yes'/'No') kembali menjadi Boolean untuk disimpan ke DB
      const isInjured = physicalData.injuryHistory === 'Yes';

      const { error } = await supabase
        .from('profiles')
        .update({
          age: numAge,
          gender: physicalData.gender,
          height: numHeight,
          weight: numWeight,
          dominant_hand: physicalData.dominantHand,
          injury_history: isInjured,
        })
        .eq('id', userId);

      if (error) throw error;

      Alert.alert("Success", "Physical data updated successfully!");
      navigation.goBack();

    } catch (error) {
      Alert.alert("Update Failed", error.message);
    } finally {
      setSaving(false);
    }
  };

  // Tampilkan loading saat pertama kali fetch data
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#E65100" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.detailHeaderTitle}>Physical Data</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.physicalDataGridContainer}>
        {/* Age */}
        <View style={styles.physicalDataGridItem}>
          <View style={styles.physicalDataFieldHeader}>
            <MaterialIcons name="cake" size={20} color="#E65100" />
            <Text style={styles.physicalDataFieldLabel}>Age</Text>
          </View>
          <TextInput
            style={styles.physicalDataInputField}
            value={physicalData.age}
            onChangeText={(val) => setPhysicalData({ ...physicalData, age: val })}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#999"
          />
          <Text style={styles.physicalDataFieldUnit}>years old</Text>
        </View>

        {/* Gender */}
        <View style={styles.physicalDataGridItem}>
          <View style={styles.physicalDataFieldHeader}>
            <MaterialIcons name="wc" size={20} color="#E65100" />
            <Text style={styles.physicalDataFieldLabel}>Gender</Text>
          </View>
          <View style={styles.physicalDataRadioGroup}>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setPhysicalData({ ...physicalData, gender: 'Female' })}
            >
              <View style={[styles.radioButton, physicalData.gender === 'Female' && styles.radioButtonSelected]} />
              <Text style={styles.radioLabel}>Female</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setPhysicalData({ ...physicalData, gender: 'Male' })}
            >
              <View style={[styles.radioButton, physicalData.gender === 'Male' && styles.radioButtonSelected]} />
              <Text style={styles.radioLabel}>Male</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Height */}
        <View style={styles.physicalDataGridItem}>
          <View style={styles.physicalDataFieldHeader}>
            <MaterialIcons name="straighten" size={20} color="#E65100" />
            <Text style={styles.physicalDataFieldLabel}>Height</Text>
          </View>
          <TextInput
            style={styles.physicalDataInputField}
            value={physicalData.height}
            onChangeText={(val) => setPhysicalData({ ...physicalData, height: val })}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#999"
          />
          <Text style={styles.physicalDataFieldUnit}>cm</Text>
        </View>

        {/* Weight */}
        <View style={styles.physicalDataGridItem}>
          <View style={styles.physicalDataFieldHeader}>
            <MaterialIcons name="scale" size={20} color="#E65100" />
            <Text style={styles.physicalDataFieldLabel}>Weight</Text>
          </View>
          <TextInput
            style={styles.physicalDataInputField}
            value={physicalData.weight}
            onChangeText={(val) => setPhysicalData({ ...physicalData, weight: val })}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor="#999"
          />
          <Text style={styles.physicalDataFieldUnit}>kg</Text>
        </View>

        {/* Dominant Hand */}
        <View style={styles.physicalDataGridItem}>
          <View style={styles.physicalDataFieldHeader}>
            <MaterialIcons name="pan-tool" size={20} color="#E65100" />
            <Text style={styles.physicalDataFieldLabel}>Dominant Hand</Text>
          </View>
          <View style={styles.physicalDataRadioGroup}>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setPhysicalData({ ...physicalData, dominantHand: 'Left' })}
            >
              <View style={[styles.radioButton, physicalData.dominantHand === 'Left' && styles.radioButtonSelected]} />
              <Text style={styles.radioLabel}>Left</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setPhysicalData({ ...physicalData, dominantHand: 'Right' })}
            >
              <View style={[styles.radioButton, physicalData.dominantHand === 'Right' && styles.radioButtonSelected]} />
              <Text style={styles.radioLabel}>Right</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Injury History */}
        <View style={styles.physicalDataGridItem}>
          <View style={styles.physicalDataFieldHeader}>
            <MaterialIcons name="local-hospital" size={20} color="#E65100" />
            <Text style={styles.physicalDataFieldLabel}>Injury History</Text>
          </View>
          <View style={styles.physicalDataRadioGroup}>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setPhysicalData({ ...physicalData, injuryHistory: 'Yes' })}
            >
              <View style={[styles.radioButton, physicalData.injuryHistory === 'Yes' && styles.radioButtonSelected]} />
              <Text style={styles.radioLabel}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setPhysicalData({ ...physicalData, injuryHistory: 'No' })}
            >
              <View style={[styles.radioButton, physicalData.injuryHistory === 'No' && styles.radioButtonSelected]} />
              <Text style={styles.radioLabel}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.physicalDataSaveButton} 
        onPress={handleSaveChanges}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.physicalDataSaveButtonText}>Save Changes</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}