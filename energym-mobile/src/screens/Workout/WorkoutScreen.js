import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import styles from '../../styles/globalStyles';

export default function WorkoutScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workout</Text>
      </View>
      <View style={styles.placeholderContainer}>
        <FontAwesome5 name="dumbbell" size={60} color="#E65100" />
        <Text style={styles.placeholderText}>Workout Screen Placeholder</Text>
      </View>
    </ScrollView>
  );
}