import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../../styles/globalStyles';

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
      </View>
      <View style={styles.placeholderContainer}>
        <MaterialIcons name="home" size={60} color="#E65100" />
        <Text style={styles.placeholderText}>Home Screen Placeholder</Text>
      </View>
    </ScrollView>
  );
}

