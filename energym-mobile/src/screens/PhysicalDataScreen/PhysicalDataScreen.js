import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const PhysicalDataScreen = ({ navigation }) => {
  const [weight, setWeight] = useState('68');
  const [height, setHeight] = useState('172');
  const [targetWeight, setTargetWeight] = useState('65');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Physical Data</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.subtitle}>Masukkan data pengukuran tubuh Anda untuk kalibrasi EnerGym.</Text>

      {/* Input Cards */}
      {/* Age Section */}
        <View style={styles.physicalDataGridItem}>
            <Text style={styles.physicalDataFieldLabel}>Age</Text>
            <TextInput
                style={styles.physicalDataInput}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#888"
            />
            <Text style={styles.physicalDataFieldUnit}>years old</Text>
        </View>
        
      <View style={styles.cardGroup}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Berat Badan (kg)</Text>
          <TextInput
            style={styles.cardInput}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Tinggi Badan (cm)</Text>
          <TextInput
            style={styles.cardInput}
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Target Berat (kg)</Text>
          <TextInput
            style={styles.cardInput}
            value={targetWeight}
            onChangeText={setTargetWeight}
            keyboardType="numeric"
            placeholderTextColor="#666"
          />
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={() => navigation.goBack()}>
        <Text style={styles.saveButtonText}>Simpan Data Fisik</Text>
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
    marginBottom: 12,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Satoshi-Bold',
  },
  subtitle: {
    color: '#888',
    fontSize: 13,
    fontFamily: 'Satoshi-Regular',
    marginBottom: 25,
  },
  cardGroup: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#3C3C3E',
  },
  cardLabel: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: 'Satoshi-Medium',
  },
  cardInput: {
    backgroundColor: '#1C1C1E',
    color: '#E65100',
    width: 90,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    textAlign: 'center',
    fontFamily: 'Satoshi-Bold',
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: '#E65100',
    marginTop: 35,
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

export default PhysicalDataScreen;