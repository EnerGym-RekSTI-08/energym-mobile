import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Modal, Alert
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { supabase } from '../../services/supabase';

// ─── IP FALLBACK untuk dev (dipakai tombol dummy) ────────────────────────────
// Ganti dengan IP laptop Anda. Cara cek: jalankan `ipconfig` (Windows)
const DEV_FALLBACK_IP   = '192.168.1.68';
const DEV_FALLBACK_PORT = 8000;
const DEV_STATION_ID    = 'STATION_01';
// ─────────────────────────────────────────────────────────────────────────────

export default function ScanQRScreen({ navigation, route }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [showModal, setShowModal]       = useState(false);
  const [scannedData, setScannedData]   = useState(null);  
  const [isScanning, setIsScanning]     = useState(true);
  const scanLock = useRef(false);

  useEffect(() => {
    requestPermission();
  }, []);

  // ─── Handler saat QR berhasil di-scan ──────────────────────────────────────
  const handleBarcodeScan = ({ data }) => {
    // Cegah scan berkali-kali dalam 1 detik
    if (scanLock.current) return;
    scanLock.current = true;

    try {
      const parsed = JSON.parse(data);

      // Validasi: harus ada station_id, ip, port
      if (!parsed.station_id || !parsed.ip || !parsed.port) {
        Alert.alert('QR Tidak Valid', 'QR code ini bukan untuk EnerGym.');
        scanLock.current = false;
        return;
      }

      setScannedData(parsed);
      setIsScanning(false);
      setShowModal(true);
    } catch {
      Alert.alert('QR Tidak Valid', 'Format QR tidak dikenali.');
      setTimeout(() => { scanLock.current = false; }, 2000);
    }
  };

  // ─── Handler tombol dummy (dev mode) ───────────────────────────────────────
  const handleDummyScan = () => {
    const dummyData = {
      station_id: DEV_STATION_ID,
      ip: DEV_FALLBACK_IP,
      port: DEV_FALLBACK_PORT,
    };
    setScannedData(dummyData);
    setIsScanning(false);
    setShowModal(true);
  };

  // ─── Cek status station di DB, lalu navigate ──────────────────────────────
  const handleAllowWebcam = async () => {
    setShowModal(false);
    const { station_id, ip, port } = scannedData;
    const returnTo = route?.params?.returnTo;
    const paramsTitipan = route?.params?.paramsUntukLiveWorkout;

    const paramsWithAI = {
      ...paramsTitipan,
      stationId: station_id,
      aiIp: ip,
      aiPort: port,
    };

    // Cek apakah station sedang dipakai orang lain
    try {
      const { data: station } = await supabase
        .from('stations')
        .select('station_code, current_workout_id')
        .eq('station_code', station_id)
        .maybeSingle();

      if (station?.current_workout_id != null) {
        Alert.alert(
          'Station Sedang Digunakan',
          'Alat gym ini sedang dipakai oleh pengguna lain. Coba lagi nanti.',
          [
            { text: 'Batal', style: 'cancel', onPress: () => { setIsScanning(true); scanLock.current = false; } },
            { text: 'Tetap Lanjut', onPress: () => doNavigate(returnTo, paramsWithAI) },
          ]
        );
        return;
      }
    } catch {
      // Jika DB tidak bisa diakses, lanjut saja
    }

    doNavigate(returnTo, paramsWithAI);
  };

  const doNavigate = (returnTo, params) => {
    if (returnTo) {
      navigation.navigate(returnTo, params);
    } else {
      navigation.navigate('home');
    }
  };

  // ─── Handle izin kamera ────────────────────────────────────────────────────
  if (!permission) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FF6500" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>Izin kamera diperlukan untuk scan QR.</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Izinkan Kamera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <Text style={styles.headerSubtitle}>Arahkan ke QR code di gym station</Text>
      </View>

      {/* CAMERA AREA */}
      <View style={styles.cameraWrapper}>
        <CameraView
          style={styles.camera}
          facing="back"
          // ✅ Aktifkan barcode scanner
          onBarcodeScanned={isScanning ? handleBarcodeScan : undefined}
          barcodeScannerSettings={{
            barcodeTypes: ['qr'],
          }}
        />

        {/* OVERLAY BRACKETS */}
        <View style={styles.overlay}>
          <View style={styles.bracketContainer}>
            <View style={[styles.bracket, styles.topLeft]} />
            <View style={[styles.bracket, styles.topRight]} />
            <View style={[styles.bracket, styles.bottomLeft]} />
            <View style={[styles.bracket, styles.bottomRight]} />
          </View>
          <Text style={styles.scanHint}>
            {isScanning ? 'Scan QR di alat gym...' : '✓ QR Terdeteksi!'}
          </Text>
        </View>

        {/* TOMBOL DUMMY — hapus saat production */}
        <TouchableOpacity
          style={styles.dummyButton}
          onPress={handleDummyScan}
          activeOpacity={0.8}
        >
          <Text style={styles.dummyButtonText}>
            🛠 Dev: Simulate Scan
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODAL ALLOW WEBCAM */}
      <Modal animationType="fade" transparent visible={showModal} onRequestClose={() => {
        setShowModal(false);
        setIsScanning(true);
        scanLock.current = false;
      }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="camera-enhance" size={60} color="#FFCEAD" />
            </View>

            <Text style={styles.modalTitle}>Activate Gym Station Camera</Text>

            {scannedData && (
              <View style={styles.stationInfo}>
                <Text style={styles.stationText}>📍 {scannedData.station_id}</Text>
                <Text style={styles.stationIp}>{scannedData.ip}:{scannedData.port}</Text>
              </View>
            )}

            <Text style={styles.modalSubtitle}>
              Webcam pada gym station ini akan diaktifkan untuk memantau
              gerakan dan memastikan postur latihan Anda.
              Video tidak disimpan — hanya data metrik latihan.
            </Text>

            <TouchableOpacity style={styles.allowButton} onPress={handleAllowWebcam}>
              <Text style={styles.allowButtonText}>Allow Webcam</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.laterButton} onPress={() => {
              setShowModal(false);
              setIsScanning(true);
              scanLock.current = false;
            }}>
              <Text style={styles.laterButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#222222' },
  centered:    { justifyContent: 'center', alignItems: 'center' },
  header:      { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { color: 'white', fontSize: 24, fontFamily: 'Satoshi-Bold' },
  headerSubtitle: { color: '#888', fontSize: 13, marginTop: 4, fontFamily: 'Satoshi-Regular' },

  cameraWrapper: {
    flex: 1, marginHorizontal: 20, marginBottom: 100,
    borderRadius: 30, overflow: 'hidden',
    backgroundColor: '#000', position: 'relative',
  },
  camera: { flex: 1 },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
  },
  bracketContainer: { width: 250, height: 250, position: 'relative' },
  bracket: { position: 'absolute', width: 50, height: 50, borderColor: '#FF6500' },
  topLeft:     { top: 0, left: 0, borderTopWidth: 5, borderLeftWidth: 5 },
  topRight:    { top: 0, right: 0, borderTopWidth: 5, borderRightWidth: 5 },
  bottomLeft:  { bottom: 0, left: 0, borderBottomWidth: 5, borderLeftWidth: 5 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 5, borderRightWidth: 5 },
  scanHint: { color: 'white', marginTop: 160, fontSize: 13, fontFamily: 'Satoshi-Regular' },

  dummyButton: {
    position: 'absolute', bottom: 30, alignSelf: 'center',
    backgroundColor: '#FF6500', paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: 25,
  },
  dummyButtonText: { color: 'white', fontSize: 14, fontFamily: 'Satoshi-Bold' },

  errorText: { color: 'white', fontSize: 16, marginBottom: 20 },
  permissionButton: { backgroundColor: '#FF6500', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  permissionButtonText: { color: 'white', fontFamily: 'Satoshi-Bold' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: '#FF6500', borderRadius: 30,
    padding: 30, alignItems: 'center', width: '100%',
  },
  iconContainer: { marginBottom: 16 },
  modalTitle: { color: 'white', fontSize: 20, fontFamily: 'Satoshi-Bold', textAlign: 'center', marginBottom: 8 },

  stationInfo: {
    backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 10,
    padding: 10, marginBottom: 12, width: '100%', alignItems: 'center',
  },
  stationText: { color: 'white', fontFamily: 'Satoshi-Bold', fontSize: 15 },
  stationIp:   { color: '#FFE0CC', fontFamily: 'Satoshi-Regular', fontSize: 12, marginTop: 2 },

  modalSubtitle: {
    color: '#FFE0CC', fontSize: 13, fontFamily: 'Satoshi-Regular',
    textAlign: 'center', lineHeight: 20, marginBottom: 24,
  },
  allowButton: {
    backgroundColor: '#222222', width: '100%', paddingVertical: 15,
    borderRadius: 15, alignItems: 'center', marginBottom: 12,
  },
  allowButtonText: { color: 'white', fontSize: 16, fontFamily: 'Satoshi-Bold' },
  laterButton: { paddingVertical: 10 },
  laterButtonText: { color: 'white', fontSize: 14, fontFamily: 'Satoshi-Medium' },
});
