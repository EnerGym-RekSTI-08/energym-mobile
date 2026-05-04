import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  Modal
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ScanQRScreen({ navigation, route }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [showModal, setShowModal] = useState(false); 

  useEffect(() => {
    // Meminta izin kamera saat halaman dibuka
    requestPermission();
  }, []);

  // Fungsi saat QR berhasil di-scan (Simulasi Dummy)
  const handleDummyScan = () => {
    setShowModal(true);
  };

  // Fungsi saat user menekan "Allow Webcam"
  const handleAllowWebcam = () => {
    setShowModal(false); 
    
    if (navigation && navigation.setIsAiConnected) {
      navigation.setIsAiConnected(true); 
    }

    // 1. Ambil nama tujuan dari route params
    const returnTo = route?.params?.returnTo;

    // 2. Ambil paket data titipan (workoutId & exerciseId) dari route params
    const paramsTitipan = route?.params?.paramsUntukLiveWorkout;
      
    if (returnTo) {
      // 3. SEKARANG KIRIM KEDUANYA! Tujuan dan isi paketnya
      navigation.navigate(returnTo, paramsTitipan); 
    } else {
      navigation.navigate('home'); // Jika buka QR manual dari Navbar
    }
  };

  // Menunggu status perizinan kamera
  if (!permission) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FF6500" />
      </View>
    );
  }

  // Jika izin kamera ditolak
  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
      </View>

      {/* CAMERA WINDOWED AREA */}
      <View style={styles.cameraWrapper}>
        <CameraView style={styles.camera} facing="back" />

        {/* OVERLAY ORANGE BRACKETS */}
        <View style={styles.overlay}>
          <View style={styles.bracketContainer}>
            <View style={[styles.bracket, styles.topLeft]} />
            <View style={[styles.bracket, styles.topRight]} />
            <View style={[styles.bracket, styles.bottomLeft]} />
            <View style={[styles.bracket, styles.bottomRight]} />
          </View>
        </View>

        {/* DUMMY SCANNED BUTTON */}
        <TouchableOpacity 
          style={styles.dummyButton} 
          onPress={handleDummyScan}
          activeOpacity={0.8}
        >
          <Text style={styles.dummyButtonText}>Simulate "Scanned"</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL POP-UP ALLOW WEBCAM */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Ikon Kamera */}
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="camera-enhance" size={60} color="#FFCEAD" />
            </View>
            
            <Text style={styles.modalTitle}>Activate Gym Station Camera</Text>
            
            <Text style={styles.modalSubtitle}>
              To ensure your perfect form and track real results, we need to activate the webcam on this station.
            </Text>

            <TouchableOpacity 
              style={styles.allowButton} 
              onPress={handleAllowWebcam}
            >
              <Text style={styles.allowButtonText}>Allow Webcam</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.laterButton} 
              onPress={() => setShowModal(false)}
            >
              <Text style={styles.laterButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222222', 
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'Satoshi-Bold', 
  },
  cameraWrapper: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 100, 
    borderRadius: 30, 
    overflow: 'hidden', 
    backgroundColor: '#000', 
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bracketContainer: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  bracket: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderColor: '#FF6500',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 5,
    borderLeftWidth: 5,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 5,
    borderRightWidth: 5,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 5,
    borderRightWidth: 5,
  },
  dummyButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#FF6500',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  dummyButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#FF6500',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontFamily: 'Satoshi-Bold',
  },
  
  /* --- STYLES UNTUK MODAL POP-UP --- */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: '#FF6500',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    marginBottom: 20,
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Satoshi-Bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalSubtitle: {
    color: '#FFE0CC',
    fontSize: 14,
    fontFamily: 'Satoshi-Regular',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  allowButton: {
    backgroundColor: '#222222',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  allowButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
  },
  laterButton: {
    paddingVertical: 10,
  },
  laterButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
  }
});