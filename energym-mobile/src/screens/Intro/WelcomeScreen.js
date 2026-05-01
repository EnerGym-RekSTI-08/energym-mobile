import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ImageBackground, 
  TouchableOpacity, 
  SafeAreaView,
  StatusBar
} from 'react-native';

// Sesuaikan path ini dengan lokasi gambar kamu
const backgroundImage = require('../../assets/images/welcome.png');

export default function WelcomeScreen() {
  return (
    <ImageBackground 
      source={backgroundImage} 
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      
      {/* Overlay gelap agar teks lebih mudah dibaca */}
      <View style={styles.overlay}>
        <SafeAreaView style={styles.safeArea}>
          
          <View style={styles.contentContainer}>
            
            {/* Tombol Next */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.nextButton}>
                <Text style={styles.buttonText}>Next →</Text>
              </TouchableOpacity>
            </View>

            {/* Area Teks Utama */}
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.titleText}>EnerGym</Text>
            <Text style={styles.subtitleText}>
              Let our AI ensure your perfect form today,{'\n'}
              so you can celebrate your real results tomorrow.
            </Text>

          </View>

        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    // Menambahkan gradien gelap transparan (opsional, tapi disarankan agar teks terbaca jelas)
    backgroundColor: 'rgba(0, 0, 0, 0.4)', 
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end', // Mendorong semua konten ke bawah
    paddingHorizontal: 24,
    paddingBottom: 40, // Jarak dari tepi bawah layar
  },
  buttonContainer: {
    alignItems: 'flex-end', // Memposisikan tombol ke kanan
    marginBottom: 20, // Jarak antara tombol dan teks "Welcome to"
  },
  nextButton: {
    backgroundColor: '#FF6500', // Warna orange sesuai desain
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30, // Membuat ujung tombol membulat
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '500',
    marginBottom: -10, // Mengurangi jarak antara "Welcome to" dan "EnerGym"
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 56,
    fontWeight: '900', // Sangat tebal
    letterSpacing: -1,
    marginBottom: 16,
  },
  subtitleText: {
    color: '#E0E0E0',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
});