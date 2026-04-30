import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => (
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    paddingBottom: 70,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '600',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  placeholderText: {
    color: '#888',
    fontSize: 16,
    marginTop: 15,
  },
});

export default HomeScreen;
