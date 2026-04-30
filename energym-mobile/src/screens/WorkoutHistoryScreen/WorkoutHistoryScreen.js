import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const workoutHistoryData = [
  {
    id: '1',
    type: 'Upper Body',
    date: 'May 23, 2024',
    details: 'Details about the workout',
  },
  {
    id: '2',
    type: 'Lower Body Power',
    date: 'May 23, 2024',
    details: 'Details about the workout',
  },
  {
    id: '3',
    type: 'Upper Body Mastery',
    date: 'May 23, 2024',
    details: 'Details about the workout',
  },
];

const WorkoutHistoryScreen = () => {
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemType}>{item.type}</Text>
      <Text style={styles.itemDate}>{item.date}</Text>
      <TouchableOpacity>
        <Text style={styles.itemDetails}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Workout History</Text>
      </View>
      <View style={styles.chartContainer}>
        {/* Chart will be implemented here */}
        <Text style={styles.chartPlaceholder}>Chart Placeholder</Text>
      </View>
      <FlatList
        data={workoutHistoryData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  header: {
    marginTop: 50,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
  },
  chartContainer: {
    height: 200,
    backgroundColor: '#2C2C2E',
    margin: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholder: {
    color: 'white',
  },
  list: {
    marginHorizontal: 20,
  },
  itemContainer: {
    backgroundColor: '#2C2C2E',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  itemType: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  itemDate: {
    color: 'gray',
    fontSize: 14,
  },
  itemDetails: {
    color: '#E65100',
    marginTop: 5,
  },
});

export default WorkoutHistoryScreen;
