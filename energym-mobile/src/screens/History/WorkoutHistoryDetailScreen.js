import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

// Sesuaikan path ini dengan lokasi globalStyles kamu
import styles from '../../styles/globalStyles';

// Sesuaikan path ini dengan lokasi gambar-gambar latihan kamu di folder assets
const chestPressImage = require('../../assets/images/chest press.jpg');
const dumbbellRowImage = require('../../assets/images/dumbell row.jpg');
const shoulderPressImage = require('../../assets/images/shoulder press.jpg');
const bicepCurlsImage = require('../../assets/images/bicep curls.jpg');
const tricepExtensionsImage = require('../../assets/images/tricep extensions.jpg');

export default function WorkoutHistoryDetailScreen({ route, navigation }) {
  // Menangkap data dari navigasi (jika ada), dengan nilai default jika kosong
  const { 
    workout = 'Upper Body Blast', 
    date = '09:23 | Mon, 23 Apr 2026', 
    perfectForm = 161, 
    badForm = 13 
  } = route?.params || {};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.detailHeaderTitle}>{workout}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.detailContent}>
        <Text style={styles.detailDate}>{date}</Text>

        {/* Donut Chart Section */}
        <View style={styles.donutContainer}>
          <View style={styles.donutChartWrapper}>
            <View style={styles.donutChart} />
            <View style={styles.donutChartOverlay}>
              <Text style={styles.donutText}>92%</Text>
            </View>
          </View>
          
          <View style={styles.donutInfoBox}>
            <View style={styles.donutInfoItem}>
              <Text style={styles.donutInfoLabel}>Total Reps: {perfectForm + badForm}</Text>
            </View>
            
            <View style={styles.donutBadgesBox}>
              <View style={styles.badgeLarge}>
                <MaterialIcons name="check-circle" size={16} color="#FFFFFF" />
                <Text style={styles.badgeText}>{perfectForm} Perfect Reps</Text>
              </View>
              <View style={styles.badgeLargeDark}>
                <MaterialIcons name="cancel" size={16} color="#FFFFFF" />
                <Text style={styles.badgeText}>{badForm} Bad Reps</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Statistics Section */}
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          {/* Calories */}
          <View style={styles.statBoxColumn}>
            <View style={styles.statHeader}>
              <MaterialIcons name="local-fire-department" size={20} color="#E65100" />
              <Text style={styles.statTitle}>Calories</Text>
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValueBig}>450</Text>
              <Text style={styles.statUnit}>kcal</Text>
            </View>
          </View>

          {/* Duration */}
          <View style={styles.statBoxColumn}>
            <View style={styles.statHeader}>
              <MaterialIcons name="timer" size={20} color="#E65100" />
              <Text style={styles.statTitle}>Duration</Text>
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statValueBig}>45</Text>
              <Text style={styles.statUnit}>minutes</Text>
            </View>
          </View>

          {/* Sets */}
          <View style={styles.statBoxRow}>
            <View style={styles.statContentRow}>
              <Text style={styles.statValueSmall}>12</Text>
              <Text style={styles.statUnitSmall}>sets</Text>
            </View>
            <MaterialIcons name="repeat" size={24} color="#E65100" />
          </View>

          {/* Exercises */}
          <View style={styles.statBoxRow}>
            <View style={styles.statContentRow}>
              <Text style={styles.statValueSmall}>5</Text>
              <Text style={styles.statUnitSmall}>exercises</Text>
            </View>
            <MaterialIcons name="fitness-center" size={24} color="#E65100" />
          </View>
        </View>

        {/* Exercises Section */}
        <Text style={styles.sectionTitle}>Exercises</Text>

        {[
          { name: 'Chest Press', sets: '3 Sets', reps: '12 Reps', progress: 88, perfectForm: 32, badForm: 4, image: chestPressImage },
          { name: 'Dumbbell Row', sets: '3 Sets', reps: '10 Reps', progress: 94, perfectForm: 29, badForm: 1, image: dumbbellRowImage },
          { name: 'Shoulder Press', sets: '3 Sets', reps: '10 Reps', progress: 86, perfectForm: 28, badForm: 2, image: shoulderPressImage },
          { name: 'Bicep Curls', sets: '3 Sets', reps: '12 Reps', progress: 97, perfectForm: 35, badForm: 1, image: bicepCurlsImage },
          { name: 'Tricep Extensions', sets: '5 Sets', reps: '12 Reps', progress: 94, perfectForm: 37, badForm: 5, image: tricepExtensionsImage },
        ].map((ex, idx) => (
          <View key={idx} style={styles.exerciseCardDetail}>
            <View style={styles.exerciseImageContainer}>
              <Image source={ex.image} style={styles.exerciseImage} />
            </View>
            <View style={styles.exerciseContentDetail}>
              <View style={styles.exerciseTitleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.exerciseNameDetail}>{ex.name}</Text>
                  <Text style={styles.exerciseSetsDetail}>{ex.sets} {ex.reps}</Text>
                </View>
                <View style={styles.exerciseProgressCircle}>
                  <Text style={styles.exerciseProgressValue}>{ex.progress}%</Text>
                </View>
              </View>
              
              <View style={styles.exerciseFormBadgesDetail}>
                <View style={styles.badgePill}>
                  <MaterialIcons name="check-circle" size={14} color="#E65100" />
                  <Text style={styles.badgePillText}>Perfect Form: {ex.perfectForm}</Text>
                </View>
                <View style={styles.badgePill}>
                  <MaterialIcons name="cancel" size={14} color="#E65100" />
                  <Text style={styles.badgePillText}>Bad Form: {ex.badForm}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
        
        {/* Spacer agar tidak tertutup bottom tab */}
        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}