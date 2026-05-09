import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Dimensions 
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { supabase } from '../../services/supabase'; 
import styles from '../../styles/globalStyles';
import { LineChart } from 'react-native-chart-kit';
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval, getDay } from 'date-fns';

const { width } = Dimensions.get('window');

export default function WorkoutHistoryScreen({ navigation }) {
  const [historyData, setHistoryData] = useState([]);
  const [chartData, setChartData] = useState([0, 0, 0, 0, 0, 0, 0]); // Default Senin - Minggu
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistoryData();
  }, []);

  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Ambil seluruh riwayat beserta relasi nama workout dan detail exercise-nya
      const { data, error } = await supabase
        .from('workout_history')
        .select(`
          id,
          completed_at,
          workouts ( name ),
          workout_history_exercises ( perfect_reps, bad_reps )
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      if (data) {
        processHistoryData(data);
      }
    } catch (error) {
      console.error("Error fetching history:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const processHistoryData = (data) => {
    const today = new Date();
    // Set minggu dimulai pada hari Senin (weekStartsOn: 1)
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 });
    const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 });

    // Inisialisasi wadah untuk menghitung total reps harian dalam minggu ini
    // Index: 0=Senin, 1=Selasa, 2=Rabu, 3=Kamis, 4=Jumat, 5=Sabtu, 6=Minggu
    const weeklyStats = Array(7).fill(null).map(() => ({ perfect: 0, total: 0 }));

    const formattedHistory = data.map(item => {
      let perfectCount = 0;
      let badCount = 0;
      const exercises = item.workout_history_exercises || [];

      // Hitung reps per workout
      exercises.forEach(ex => {
        perfectCount += (ex.perfect_reps || 0);
        badCount += (ex.bad_reps || 0);
      });

      const totalReps = perfectCount + badCount;
      const completedDate = parseISO(item.completed_at);

      // --- LOGIKA UNTUK GRAFIK (HANYA MINGGU INI) ---
      if (isWithinInterval(completedDate, { start: startOfCurrentWeek, end: endOfCurrentWeek })) {
        let dayIndex = getDay(completedDate); // getDay: 0=Minggu, 1=Senin, ..., 6=Sabtu
        // Sesuaikan index agar Senin=0, ..., Minggu=6
        let adjustedIndex = dayIndex === 0 ? 6 : dayIndex - 1; 
        
        weeklyStats[adjustedIndex].perfect += perfectCount;
        weeklyStats[adjustedIndex].total += totalReps;
      }

      // --- KEMBALIKAN DATA UNTUK LIST HISTORY ---
      return {
        id: item.id,
        workoutName: item.workouts?.name || 'Custom Workout',
        exerciseCount: exercises.length,
        perfectForm: perfectCount,
        badForm: badCount,
        timestamp: item.completed_at
      };
    });

    // Kalkulasi persentase akurasi untuk grafik
    const newChartData = weeklyStats.map(day => {
      if (day.total === 0) return 0;
      return Math.round((day.perfect / day.total) * 100);
    });

    setChartData(newChartData);
    setHistoryData(formattedHistory);
  };

  const renderChart = () => {
    return (
      <View style={localStyles.chartContainer}>
        <View style={localStyles.chartHeader}>
          <FontAwesome5 name="child" size={16} color="#FF6500" />
          <Text style={localStyles.chartTitle}>Form Accuracy</Text>
        </View>
        <LineChart
          data={{
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [
              {
                data: chartData,
                color: (opacity = 1) => `rgba(255, 101, 0, ${opacity})`, // Orange line
                strokeWidth: 3
              }
            ]
          }}
          width={width - 45} // Lebar layar dikurangi padding
          height={200}
          withInnerLines={true}
          withOuterLines={false}
          withShadow={true}
          fromZero={true}
          yAxisSuffix=""
          
          chartConfig={{
            backgroundColor: "#333",
            backgroundGradientFrom: "#333",
            backgroundGradientTo: "#333",
            decimalPlaces: 0, 
            color: (opacity = 1) => `rgba(255, 255, 255, 0.1)`, // Grid lines color
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            propsForLabels: {
                fontFamily: 'Satoshi-Regular', 
                fontSize: 12,                 
              },
            propsForDots: {
              r: "4",
              strokeWidth: "1",
              stroke: "#FF6500",
              fill: "#FFFFFF"
            },
            propsForBackgroundLines: {
              strokeDasharray: "" // Solid grid lines instead of dashed
            }
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
            marginLeft: -14 // Penyesuaian agar tidak terlalu ke kanan
          }}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: '#121212' }]}>
      <View style={localStyles.header}>
        <Text style={localStyles.headerTitle}>Your Workout History</Text>
      </View>

      {loading ? (
        <View style={localStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6500" />
        </View>
      ) : (
        <ScrollView style={localStyles.scrollContainer} contentContainerStyle={{ paddingBottom: 100 }}>
          {renderChart()}

          <View style={localStyles.listContainer}>
            {historyData.length === 0 ? (
              <Text style={localStyles.emptyText}>No workout history found.</Text>
            ) : (
              historyData.map((item, index) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={localStyles.historyCard}
                  onPress={() => navigation.navigate('WorkoutHistoryDetail', { historyId: item.id })}
                >
                  <View style={localStyles.cardTopRow}>
                    <Text style={localStyles.workoutName}>{item.workoutName}</Text>
                    <Text style={localStyles.timestamp}>
                      {format(parseISO(item.timestamp), 'HH.mm | EEE, d MMMM yyyy')}
                    </Text>
                  </View>
                  
                  <View style={localStyles.cardMiddleRow}>
                    <Text style={localStyles.exerciseCount}>{item.exerciseCount} Exercises</Text>
                  </View>

                  <View style={localStyles.cardBottomRow}>
                    <View style={localStyles.badgeContainer}>
                      <View style={[localStyles.badge, { backgroundColor: '#75757580', borderWidth: 0.5, borderColor: '#993D00' }]}>
                        <MaterialIcons name="check-circle-outline" size={14} color="#FF6500" />
                        <Text style={localStyles.badgeText}>Perfect Form: {item.perfectForm}</Text>
                      </View>
                      <View style={[localStyles.badge, { backgroundColor: '#75757580', borderWidth: 0.5, borderColor: '#993D00' , marginLeft: 10 }]}>
                        <MaterialIcons name="highlight-off" size={14} color="#FF6500" />
                        <Text style={localStyles.badgeText}>Bad Form: {item.badForm}</Text>
                      </View>
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color="#757575" />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const localStyles = StyleSheet.create({
  header: { padding: 20, paddingTop: 50, paddingBottom: 10 },
  headerTitle: { color: 'white', fontSize: 24, fontFamily: 'Satoshi-Bold' }, 
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { flex: 1, paddingHorizontal: 20 },
  
  // --- Chart Styles ---
  chartContainer: { backgroundColor: '#333', borderRadius: 15, padding: 15, marginBottom: 20 },
  chartHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  chartTitle: { color: '#FFF', fontSize: 14, fontFamily: 'Satoshi-Regular', marginLeft: 10 },
  
  // --- List Styles ---
  listContainer: { flex: 1 },
  emptyText: { color: '#888', textAlign: 'center', marginTop: 20, fontFamily: 'Satoshi-Regular' },
  historyCard: { backgroundColor: '#333', borderRadius: 15, padding: 15, marginBottom: 15 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
  workoutName: { color: '#FF6500', fontSize: 16, fontFamily: 'Satoshi-Medium', flex: 1 },
  timestamp: { color: '#FFFFFF', fontSize: 10, fontFamily: 'Satoshi-Regular', textAlign: 'right' },
  cardMiddleRow: { marginBottom: 10 },
  exerciseCount: { color: '#FFFFFF', fontSize: 12, fontFamily: 'Satoshi-Light' },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgeContainer: { flexDirection: 'row'},
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: '#FFFFFF', fontSize: 8, marginLeft: 4, fontFamily: 'Satoshi-Light' }
});