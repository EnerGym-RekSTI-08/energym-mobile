import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ImageBackground, KeyboardAvoidingView, Platform, Alert, ActivityIndicator 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../services/supabase'; // Sesuaikan path ini

// Sesuaikan lokasi gambar background-mu
const bgImage = require('../../assets/images/welcome.png'); 

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    // 1. Validasi Input Kosong
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);

    // 2. Proses Login ke Supabase Auth
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Sign In Failed', error.message);
    } else {
      // Jika berhasil, navigasi ke halaman Home
      // (Supabase otomatis mengelola session di background)
      navigation.navigate('home');
    }
    
    setLoading(false);
  };

  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.container}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Sign In</Text>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Feather name="mail" size={20} color="#E0E0E0" style={styles.icon} />
              <TextInput 
                style={styles.input} 
                placeholder="Email" 
                placeholderTextColor="#A0A0A0" 
                value={email} 
                onChangeText={setEmail} 
                keyboardType="email-address" 
                autoCapitalize="none" 
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color="#E0E0E0" style={styles.icon} />
              <TextInput 
                style={styles.input} 
                placeholder="Password" 
                placeholderTextColor="#A0A0A0" 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry 
              />
            </View>

            {/* Remember Me Checkbox (Hanya visual sesuai gambar) */}
            <TouchableOpacity 
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Feather name="check" size={12} color="white" />}
              </View>
              <Text style={styles.rememberMeText}>Remember me</Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity 
              style={styles.submitBtn} 
              onPress={handleSignIn} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Footer Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don’t have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('signup')}>
                <Text style={styles.footerLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
  },
  title: {
    color: '#FFF',
    fontSize: 40,
    fontFamily: 'Satoshi-Bold',
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#993D00', // Warna oranye gelap sesuai gambar referensi
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontFamily: 'Satoshi-Regular',
    fontSize: 10,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginLeft: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FF6500',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FF6500',
    borderColor: '#FF6500',
  },
  rememberMeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Satoshi-Regular',

  },
  submitBtn: {
    backgroundColor: '#FF6500',
    borderRadius: 30,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#FFFFFF', 
    fontSize: 12,
    fontFamily: 'Satoshi-Regular',
  },
  footerLink: {
    color: '#FF6500', // Oranye EnerGym
    fontSize: 12,
    fontFamily: 'Satoshi-Bold',
  },
});