import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

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
    fontFamily: 'Satoshi-Bold',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  detailHeaderTitle: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'Satoshi-Bold',
    marginLeft: 12,
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
    fontSize: 20,
    fontFamily: 'Satoshi-Medium',
  },
  profileSubname: {
    color: '#FFFF',
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    marginTop: 4,
  },
  profileStatsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  profileStatsSectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Satoshi-Medium',
    marginBottom: 12,
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
    fontSize: 26,
    fontFamily: 'Satoshi-Bold',
    marginTop: 8,
  },
  profileStatLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Satoshi-Regular',
    marginTop: 4,
  },
  profileButtonsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 10,
  },
  profileActionButton: {
    backgroundColor: '#993D00',
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  profileActionButtonText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
  },
  logoutButtonLarge: {
    backgroundColor: '#FF6500',
    marginHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonLargeText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Satoshi-Bold',
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
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Satoshi-Medium',
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: '#993D00',
    color: 'white',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 12,
    fontFamily: 'Satoshi-Regular',
  },
  editSaveButton: {
    backgroundColor: '#FF6500',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  editSaveButtonText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Satoshi-Bold',
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
    fontSize: 16,
    fontFamily: 'Satoshi-Medium',
    marginLeft: 8,
  },
  physicalDataInputField: {
    backgroundColor: '#1C1C1E',
    color: 'white',
    borderRadius: 5,
    padding: 10,
    fontSize: 12,
    fontFamily: 'Satoshi-Bold',
    textAlign: 'center',
  },
  physicalDataFieldUnit: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Satoshi-Regular',
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
    borderColor: '#FF6500',
    marginRight: 8,
  },
  radioButtonSelected: {
    backgroundColor: '#FF6500',
  },
  radioLabel: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Satoshi-Regular',
  },
  physicalDataSaveButton: {
    backgroundColor: '#FF6500',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  physicalDataSaveButtonText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Satoshi-Bold',
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
    borderTopColor: '#FF6500',
  },
  tabLabel: {
    color: '#888',
    fontSize: 10,
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#FF6500',
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
    backgroundColor: '#FF6500',
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
    color: '#FF6500',
  },
// --- MODAL DISCONNECT STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: '#FF6500', // Warna gelap agar kontras
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    width: '100%',
  },
  modalTitle: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalSubtitle: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Satoshi-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  disconnectButton: {
    backgroundColor: '#3B3838', 
    width: '100%',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  disconnectButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
  },
  cancelButton: {
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Satoshi-Bold',
  },
});

export default styles;