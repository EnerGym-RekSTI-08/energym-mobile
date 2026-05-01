import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from '../../styles/globalStyles';

export default function ScanQRScreen() {
  return (
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
}