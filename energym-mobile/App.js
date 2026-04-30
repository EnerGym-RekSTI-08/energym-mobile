import { LineChart } from 'react-native-chart-kit';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const profileImage = require('./src/assets/images/profile picture.webp');

// Exercise Images
const chestPressImage = require('./src/assets/images/chest press.jpg');
const dumbbellRowImage = require('./src/assets/images/dumbell row.jpg');
const shoulderPressImage = require('./src/assets/images/shoulder press.jpg');
const bicepCurlsImage = require('./src/assets/images/bicep curls.jpg');
const tricepExtensionsImage = require('./src/assets/images/tricep extensions.jpg');

// ===== SCREENS =====
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

const chartWidth = width - 40;

const WorkoutHistoryScreen = ({ navigation }) => (
  <ScrollView style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Your Workout History</Text>
    </View>

    <View style={{ width: '100%', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 }}>
      <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <MaterialIcons name="accessibility" size={20} color="#E65100" />
        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginLeft: 8 }}>Form Accuracy</Text>
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
              onPress={() => navigation.navigate('WorkoutDetail', { workout: item.name, date: item.date, perfectForm: item.perfectForm, badForm: item.badForm })}
            >
              <MaterialIcons name="chevron-right" size={24} color="#E65100" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  </ScrollView>
);

const WorkoutDetailScreen = ({ route, navigation }) => {
  const { workout, date, perfectForm = 161, badForm = 13 } = route.params || {};
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
        <Text style={styles.detailDate}>{date || '09:23 | Mon, 23 Apr 2026'}</Text>

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
              <Text style={styles.donutInfoLabel}>Total Reps: 174</Text>
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
      </View>
    </ScrollView>
  );
};

const WorkoutScreen = ({ navigation }) => (
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

const LiveWorkoutScreen = ({ route, navigation }) => {
  const { workout } = route.params || {};
  return (
    <ScrollView style={styles.container}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.detailHeaderTitle}>{workout}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.liveWorkoutContent}>
        <View style={styles.liveWorkoutVideoPlaceholder}>
          <MaterialIcons name="play-circle-outline" size={80} color="#E65100" />
          <Text style={styles.liveWorkoutVideoText}>Live Workout Video</Text>
        </View>

        <View style={styles.timerContainer}>
          <Text style={styles.timerLabel}>Duration</Text>
          <Text style={styles.timerValue}>45:30</Text>
        </View>

        <View style={styles.workoutStatsRow}>
          <View style={styles.workoutStat}>
            <Text style={styles.workoutStatLabel}>Calories</Text>
            <Text style={styles.workoutStatValue}>250</Text>
          </View>
          <View style={styles.workoutStat}>
            <Text style={styles.workoutStatLabel}>Reps</Text>
            <Text style={styles.workoutStatValue}>120</Text>
          </View>
          <View style={styles.workoutStat}>
            <Text style={styles.workoutStatLabel}>Sets</Text>
            <Text style={styles.workoutStatValue}>8</Text>
          </View>
        </View>

        <View style={styles.currentExerciseContainer}>
          <Text style={styles.currentExerciseLabel}>Current Exercise</Text>
          <View style={styles.exerciseCardLive}>
            <View style={styles.exerciseImageLive} />
            <View style={styles.exerciseDetailsLive}>
              <Text style={styles.exerciseNameLive}>Chest Press</Text>
              <Text style={styles.exerciseRepsLive}>3 Sets • 12 Reps</Text>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.controlButtons}>
          <TouchableOpacity style={styles.pauseButton}>
            <MaterialIcons name="pause" size={24} color="white" />
            <Text style={styles.pauseButtonText}>Pause</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextButton}>
            <Text style={styles.nextButtonText}>Next Exercise</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const ScanQRScreen = () => (
  <View style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Scan QR Code</Text>
    </View>
    <View style={styles.qrContainer}>
      <View style={styles.qrPlaceholder}>
        <MaterialIcons name="qr-code-2" size={100} color="#E65100" />
        <Text style={styles.qrPlaceholderText}>QR Scanner Placeholder</Text>
      </View>
    </View>
  </View>
);

const ProfileScreen = ({ navigation }) => (
  <ScrollView style={styles.container}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Manage Profile</Text>
    </View>

    <View style={styles.profileContainer}>
      <Image source={profileImage} style={styles.profileImage} />
      <Text style={styles.profileName}>Michael</Text>
      <Text style={styles.profileSubname}>181cm | 74kg</Text>
    </View>

    <View style={styles.profileStatsSection}>
      <Text style={styles.profileStatsSectionTitle}>Your Statistics</Text>
      <View style={styles.profileStatsGrid}>
        <View style={styles.profileStatBox}>
          <MaterialIcons name="work" size={24} color="#E65100" />
          <Text style={styles.profileStatCount}>12</Text>
          <Text style={styles.profileStatLabel}>sessions</Text>
        </View>
        <View style={styles.profileStatBox}>
          <MaterialIcons name="trending-up" size={24} color="#E65100" />
          <Text style={styles.profileStatCount}>57.72</Text>
          <Text style={styles.profileStatLabel}>%</Text>
        </View>
        <View style={styles.profileStatBox}>
          <MaterialIcons name="local-fire-department" size={24} color="#E65100" />
          <Text style={styles.profileStatCount}>1.2k</Text>
          <Text style={styles.profileStatLabel}>kcal</Text>
        </View>
      </View>
    </View>

    <View style={styles.profileButtonsContainer}>
      <TouchableOpacity
        style={styles.profileActionButton}
        onPress={() => navigation.navigate('EditProfile')}
      >
        <MaterialIcons name="edit" size={18} color="white" />
        <Text style={styles.profileActionButtonText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.profileActionButton}
        onPress={() => navigation.navigate('PhysicalData')}
      >
        <MaterialIcons name="info" size={18} color="white" />
        <Text style={styles.profileActionButtonText}>Personal Data</Text>
      </TouchableOpacity>
    </View>

    <TouchableOpacity style={styles.logoutButtonLarge}>
      <Text style={styles.logoutButtonLargeText}>Log Out</Text>
    </TouchableOpacity>
  </ScrollView>
);

const EditProfileScreen = ({ navigation }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.detailHeaderTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <TouchableOpacity style={styles.editProfileImageWrapper}>
        <Image source={profileImage} style={styles.editProfileImageLarge} />
        <View style={styles.editProfileImageOverlay}>
          <MaterialIcons name="camera-alt" size={24} color="white" />
        </View>
      </TouchableOpacity>

      <View style={styles.editFormContainer}>
        <Text style={styles.editInputLabel}>Username</Text>
        <TextInput
          style={styles.editInput}
          defaultValue="michael001"
          placeholderTextColor="#999"
        />

        <Text style={styles.editInputLabel}>Full Name</Text>
        <TextInput
          style={styles.editInput}
          defaultValue="Michael B. Jordan"
          placeholderTextColor="#999"
        />

        <Text style={styles.editInputLabel}>Email</Text>
        <TextInput
          style={styles.editInput}
          defaultValue="michaeljordan@gmail.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
        />

        <Text style={styles.editInputLabel}>Password</Text>
        <TextInput
          style={styles.editInput}
          defaultValue="••••••••••••••"
          placeholderTextColor="#999"
          secureTextEntry
        />

        <Text style={styles.editInputLabel}>Phone Number</Text>
        <TextInput
          style={styles.editInput}
          defaultValue="+62-8123-4567-890"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
        />

        <TouchableOpacity style={styles.editSaveButton}>
          <Text style={styles.editSaveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const PhysicalDataScreen = ({ navigation }) => {
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
};

// ===== MAIN APP =====
export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [navigationStack, setNavigationStack] = useState({ home: ['home'] });

  const navigate = (screen, params) => {
    setNavigationStack(prev => ({
      ...prev,
      [currentTab]: [...(prev[currentTab] || [currentTab]), { screen, params }],
    }));
  };

  const goBack = () => {
    setNavigationStack(prev => ({
      ...prev,
      [currentTab]: (prev[currentTab] || []).slice(0, -1),
    }));
  };

  const currentScreenObj = navigationStack[currentTab];
  const currentScreen =
    currentScreenObj && currentScreenObj.length > 0
      ? currentScreenObj[currentScreenObj.length - 1]
      : currentTab;

  const renderScreen = () => {
    const screenName = typeof currentScreen === 'string' ? currentScreen : currentScreen.screen;
    const params = typeof currentScreen === 'string' ? {} : currentScreen.params;

    const navigationObj = {
      navigate,
      goBack,
    };

    switch (screenName) {
      case 'home':
        return <HomeScreen navigation={navigationObj} />;
      case 'history':
        return <WorkoutHistoryScreen navigation={navigationObj} />;
      case 'WorkoutDetail':
        return <WorkoutDetailScreen route={{ params }} navigation={navigationObj} />;
      case 'workout':
        return <WorkoutScreen navigation={navigationObj} />;
      case 'LiveWorkout':
        return <LiveWorkoutScreen route={{ params }} navigation={navigationObj} />;
      case 'scan':
        return <ScanQRScreen />;
      case 'profile':
        return <ProfileScreen navigation={navigationObj} />;
      case 'EditProfile':
        return <EditProfileScreen navigation={navigationObj} />;
      case 'PhysicalData':
        return <PhysicalDataScreen navigation={navigationObj} />;
      default:
        return <HomeScreen navigation={navigationObj} />;
    }
  };

  return (
    <View style={styles.appContainer}>
      {renderScreen()}

      <View style={styles.bottomTab}>
        <TouchableOpacity
          style={[styles.tabButton, currentTab === 'home' && styles.tabButtonActive]}
          onPress={() => {
            setCurrentTab('home');
            setNavigationStack(prev => ({ ...prev, home: ['home'] }));
          }}
        >
          <Ionicons
            name={currentTab === 'home' ? 'home' : 'home-outline'}
            size={24}
            color={currentTab === 'home' ? '#E65100' : '#888'}
          />
          <Text style={[styles.tabLabel, currentTab === 'home' && styles.tabLabelActive]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, currentTab === 'workout' && styles.tabButtonActive]}
          onPress={() => {
            setCurrentTab('workout');
            setNavigationStack(prev => ({ ...prev, workout: ['workout'] }));
          }}
        >
          <FontAwesome5
            name={currentTab === 'workout' ? 'dumbbell' : 'dumbbell'}
            size={20}
            color={currentTab === 'workout' ? '#E65100' : '#888'}
          />
          <Text style={[styles.tabLabel, currentTab === 'workout' && styles.tabLabelActive]}>
            Workout
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, styles.scanQRButton, currentTab === 'scan' && styles.scanQRButtonActive]}
          onPress={() => {
            setCurrentTab('scan');
            setNavigationStack(prev => ({ ...prev, scan: ['scan'] }));
          }}
        >
          <View style={styles.scanQRIconContainer}>
            <MaterialIcons
              name="qr-code-2"
              size={32}
              color="white"
            />
          </View>
          <Text style={[styles.scanQRLabel, currentTab === 'scan' && styles.scanQRLabelActive]}>
            Scan QR
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, currentTab === 'history' && styles.tabButtonActive]}
          onPress={() => {
            setCurrentTab('history');
            setNavigationStack(prev => ({ ...prev, history: ['history'] }));
          }}
        >
          <Ionicons
            name={currentTab === 'history' ? 'stats-chart' : 'stats-chart-outline'}
            size={24}
            color={currentTab === 'history' ? '#E65100' : '#888'}
          />
          <Text style={[styles.tabLabel, currentTab === 'history' && styles.tabLabelActive]}>
            History
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, currentTab === 'profile' && styles.tabButtonActive]}
          onPress={() => {
            setCurrentTab('profile');
            setNavigationStack(prev => ({ ...prev, profile: ['profile'] }));
          }}
        >
          <Ionicons
            name={currentTab === 'profile' ? 'person' : 'person-outline'}
            size={24}
            color={currentTab === 'profile' ? '#E65100' : '#888'}
          />
          <Text style={[styles.tabLabel, currentTab === 'profile' && styles.tabLabelActive]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ===== STYLES =====
const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
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
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  detailHeaderTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },

  // Placeholders
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

  // Home/Workouts
  workoutItemsContainer: {
    paddingHorizontal: 20,
  },
  workoutCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
  },
  workoutCardContent: {},
  workoutTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  workoutSubtitle: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
  },

  // Donut Chart
  donutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 15,
  },
  donutChart: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#E65100',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 40,
    borderColor: '#1C1C1E',
  },
  donutText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '700',
  },
  donutStatsBox: {
    flex: 1,
  },
  donutStat: {
    marginBottom: 10,
  },
  donutStatLabel: {
    color: '#E65100',
    fontSize: 13,
    fontWeight: '600',
  },
  donutStatBadges: {
    gap: 6,
  },

  // Large Stats Row
  statsRowLarge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  statBoxLarge: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  statLabelLarge: {
    color: '#888',
    fontSize: 10,
    marginTop: 6,
  },
  statValueLarge: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  statUnitLarge: {
    color: '#888',
    fontSize: 9,
    marginTop: 2,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },

  // Exercise Item Detail
  exerciseItemDetail: {
    marginBottom: 12,
  },
  exerciseItemContent: {
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseFormBadges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  chartContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  chartLabel: {
    color: '#E65100',
    fontSize: 14,
    fontWeight: '600',
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: '#3C3C3E',
    borderRadius: 10,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lineChart: {
    height: '100%',
    width: '100%',
    position: 'relative',
    justifyContent: 'flex-end',
  },
  chartDays: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 30,
  },
  chartDayLabel: {
    color: '#888',
    fontSize: 10,
    fontWeight: '500',
  },
  chartYAxis: {
    position: 'absolute',
    left: 10,
    top: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  chartYLabel: {
    color: '#888',
    fontSize: 9,
  },
  historyList: {
    paddingHorizontal: 20,
  },
  historyItem: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  historyItemLeft: {
    flex: 1,
  },
  historyItemTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  historyItemExercises: {
    color: '#AAA',
    fontSize: 10,
    marginTop: 4,
  },
  historyItemDateTop: {
    color: '#AAA',
    fontSize: 10,
    marginLeft: 10,
  },
  historyItemBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badgePill: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#555',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgePillText: {
    color: '#AAA',
    fontSize: 10,
    fontWeight: '500',
  },
  nextButton: {
    marginLeft: 'auto',
    padding: 4,
  },

  // Workout Detail
  detailContent: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  detailDate: {
    color: '#888',
    fontSize: 13,
    marginBottom: 20,
    fontWeight: '500',
  },
  
  // Donut Chart Section
  donutChartWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  donutChart: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E65100',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutChartOverlay: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '700',
  },
  donutInfoBox: {
    flex: 1,
    marginLeft: 16,
  },
  donutInfoItem: {
    marginBottom: 12,
  },
  donutInfoLabel: {
    color: '#E65100',
    fontSize: 14,
    fontWeight: '600',
  },
  donutBadgesBox: {
    gap: 8,
  },
  
  // Badge Styles
  badgeLarge: {
    backgroundColor: '#E65100',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeLargeDark: {
    backgroundColor: '#3C3C3E',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  statBoxColumn: {
    backgroundColor: '#2C2C2E',
    width: '48%',
    height: 160,
    padding: 16,
    borderRadius: 12,
    justifyContent: 'space-between',
  },
  statBoxRow: {
    backgroundColor: '#2C2C2E',
    width: '48%',
    height: 74,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  statContentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  statValueBig: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 50,
  },
  statUnit: {
    color: '#AAA',
    fontSize: 16,
    fontWeight: '500',
    paddingBottom: 5,
  },
  statValueSmall: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  statUnitSmall: {
    color: '#AAA',
    fontSize: 14,
    fontWeight: '500',
    paddingBottom: 4,
  },
  
  // Section Title
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
    marginTop: 10,
  },
  
  // Exercise Card Detail
  exerciseCardDetail: {
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  exerciseImageContainer: {
    marginRight: 12,
  },
  exerciseImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  exerciseImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#3C3C3E',
    borderRadius: 8,
  },
  exerciseContentDetail: {
    flex: 1,
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  exerciseNameDetail: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  exerciseSetsDetail: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  exerciseProgressCircle: {
    backgroundColor: '#E65100',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 50,
    alignItems: 'center',
  },
  exerciseProgressValue: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  
  // Form Badges Detail
  exerciseFormBadgesDetail: {
    flexDirection: 'row',
    gap: 8,
  },
  formBadgeDetail: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  formBadgeDetailHistoryStyle: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  formBadgeHistoryDetailStyle: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  formBadgeGreen: {
    backgroundColor: '#F5F5F5',
  },
  formBadgeDark: {
    backgroundColor: '#1C1C1E',
  },
  formBadgeLabel: {
    color: '#888',
    fontSize: 11,
    fontWeight: '500',
  },
  exerciseBadgeBordered: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FFF',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
  },
  exerciseBadgeTextBordered: {
    color: '#E65100',
    fontSize: 9,
    fontWeight: '600',
  },
  
  // Old styles preserved
  progressCircle: {
    alignItems: 'center',
    marginBottom: 20,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E65100',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleText: {
    color: 'white',
    fontSize: 36,
    fontWeight: '600',
  },
  exerciseItem: {
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  exerciseSets: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  exerciseProgress: {
    backgroundColor: '#E65100',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  exerciseProgressText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },

  // Scan QR
  qrContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrPlaceholder: {
    width: 250,
    height: 250,
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrPlaceholderText: {
    color: '#888',
    marginTop: 10,
  },

  // Profile
  profileContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  profileName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  profileSubname: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  profileStatsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  profileStatsSectionTitle: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  profileStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  profileStatBox: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 120,
  },
  profileStatCount: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  },
  profileStatLabel: {
    color: '#888',
    fontSize: 11,
    marginTop: 4,
  },
  profileButtonsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 10,
  },
  profileActionButton: {
    backgroundColor: '#E65100',
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  profileActionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButtonLarge: {
    backgroundColor: '#E65100',
    marginHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonLargeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Edit Profile
  editProfileImageLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginVertical: 24,
  },
  editFormContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  editInputLabel: {
    color: '#E65100',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: '#E65100',
    color: 'white',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 13,
    fontWeight: '500',
  },
  editSaveButton: {
    backgroundColor: '#E65100',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  editSaveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Physical Data
  physicalDataGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  physicalDataGridItem: {
    width: '48%',
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  physicalDataFieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  physicalDataFieldLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  physicalDataInputField: {
    backgroundColor: '#1C1C1E',
    color: 'white',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  physicalDataFieldUnit: {
    color: '#888',
    textAlign: 'center',
    marginTop: 5,
  },
  physicalDataRadioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E65100',
    marginRight: 8,
  },
  radioButtonSelected: {
    backgroundColor: '#E65100',
  },
  radioLabel: {
    color: 'white',
  },
  physicalDataSaveButton: {
    backgroundColor: '#E65100',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  physicalDataSaveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Bottom Tab
  bottomTab: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#2C2C2E',
    borderTopWidth: 1,
    borderTopColor: '#3C3C3E',
    height: 70,
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 8,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 6,
  },
  tabButtonActive: {
    borderTopWidth: 3,
    borderTopColor: '#E65100',
  },
  tabLabel: {
    color: '#888',
    fontSize: 10,
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#E65100',
  },

  // Scan QR Button
  scanQRButton: {
    paddingHorizontal: 6,
  },
  scanQRButtonActive: {
    borderTopWidth: 0,
  },
  scanQRIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#E65100',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  scanQRLabel: {
    color: '#888',
    fontSize: 9,
    marginTop: 2,
  },
  scanQRLabelActive: {
    color: '#E65100',
  },
});

