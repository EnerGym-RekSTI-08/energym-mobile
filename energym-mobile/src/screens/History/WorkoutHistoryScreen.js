import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import styles from '../../styles/globalStyles';

const { width } = Dimensions.get('window');
const chartWidth = width - 40;

export default function WorkoutHistoryScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Workout History</Text>
      </View>

      {/* --- BAGIAN GRAFIK --- */}
      <View style={styles.chartContainer}>
        <View style={styles.chartTitleContainer}>
          <MaterialIcons name="accessibility" size={20} color="#E65100" />
          <Text style={styles.chartTitleText}>Form Accuracy</Text>
        </View>
        <LineChart
          data={{
            labels: ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', ''],
            datasets: [
              {
                data: [null, 45, 15, 60, 80, 72, 40, 100, null],
              },
            ],
          }}
          width={chartWidth}
          height={220}
          yAxisSuffix=""
          yAxisMax={100}
          fromZero
          withVerticalLines={false}
          segments={5}
          chartConfig={{
            backgroundColor: '#1C1C1E',
            backgroundGradientFrom: '#1C1C1E',
            backgroundGradientTo: '#1C1C1E',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(230, 81, 0, ${opacity})`,
            labelColor: () => '#888',
            fillShadowGradient: '#E65100',
            fillShadowGradientOpacity: 0.2,
            propsForDots: {
              r: '5',
              strokeWidth: '2',
              stroke: '#E65100',
              fill: '#1C1C1E',
            },
            propsForBackgroundLines: {
              stroke: '#555',
              strokeDasharray: '1,4',
            },
          }}
          style={{
            borderRadius: 12,
          }}
        />
      </View>

      {/* --- BAGIAN DAFTAR RIWAYAT --- */}
      <View style={styles.historyList}>
        {[
          { name: 'Upper Body Mastery', date: '09:23 | Mon, 23 April 2026', exercises: 5, perfectForm: 161, badForm: 13 },
          { name: 'Core & Stability Flow', date: '13:52 | Tue, 24 April 2026', exercises: 5, perfectForm: 132, badForm: 27 },
          { name: 'Lower Body Power', date: '19:41 | Wed, 25 April 2026', exercises: 5, perfectForm: 87, badForm: 36 },
          { name: 'Full Body Ignite', date: '09:23 | Mon, 23 April 2026', exercises: 5, perfectForm: 74, badForm: 21 },
          { name: 'Upper Body Mastery', date: '09:23 | Mon, 23 April 2026', exercises: 5, perfectForm: 161, badForm: 13 },
        ].map((item, idx) => (
          <View key={idx} style={styles.historyItem}>
            <View style={styles.historyItemHeader}>
              <View style={styles.historyItemLeft}>
                <Text style={styles.historyItemTitle}>{item.name}</Text>
                <Text style={styles.historyItemExercises}>{item.exercises} Exercises</Text>
              </View>
              <Text style={styles.historyItemDateTop}>{item.date}</Text>
            </View>
            <View style={styles.historyItemBadges}>
              <View style={styles.badgePill}>
                <MaterialIcons name="check-circle" size={14} color="#E65100" />
                <Text style={styles.badgePillText}>{item.perfectForm} Perfect Form</Text>
              </View>
              <View style={styles.badgePill}>
                <MaterialIcons name="cancel" size={14} color="#E65100" />
                <Text style={styles.badgePillText}>{item.badForm} Bad Form</Text>
              </View>
              <TouchableOpacity
                style={styles.nextButton}
                onPress={() =>
                  navigation.navigate('WorkoutHistoryDetail', {
                    workout: item.name,
                    date: item.date,
                    perfectForm: item.perfectForm,
                    badForm: item.badForm,
                  })
                }
              >
                <MaterialIcons name="chevron-right" size={24} color="#E65100" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Spacer agar list paling bawah tidak tertutup Bottom Tab */}
      <View style={{ height: 100 }} /> 
    </ScrollView>
  );
}