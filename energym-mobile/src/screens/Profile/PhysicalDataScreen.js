import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../../styles/globalStyles'; // Mundur ke src/styles/

export default function PhysicalDataScreen({ navigation }) {
  const [physicalData, setPhysicalData] = useState({
    age: '21',
    gender: 'Male',
    height: '181',
    weight: '74',
    dominantHand: 'Right',
    injuryHistory: 'No',
  });

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

      <TouchableOpacity style={styles.physicalDataSaveButton}>
        <Text style={styles.physicalDataSaveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}