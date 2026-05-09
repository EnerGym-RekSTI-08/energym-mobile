import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ImageBackground, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../services/supabase'; // Sesuaikan path ini

// Sesuaikan lokasi gambar background-mu
const bgImage = require('../../assets/images/welcome.png'); 

export default function SignUpScreen({ navigation }) {
  // State untuk Auth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // State untuk Profile
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState(''); // State Baru
  const [phoneNumber, setPhoneNumber] = useState(''); // State Baru
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState(''); 
  const [dominantHand, setDominantHand] = useState(''); 
  const [injuryHistory, setInjuryHistory] = useState(null); 
  
  const [loading, setLoading] = useState(false);

  const ToggleButton = ({ label, value, state, setState }) => (
    <TouchableOpacity 
      style={[styles.toggleBtn, state === value && styles.toggleBtnActive]}
      onPress={() => setState(value)}
    >
      <Text style={[styles.toggleBtnText, state === value && styles.toggleBtnTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const handleSignUp = async () => {
    // 1. Validasi Kolom Kosong (Sudah ditambah username & phone)
    if (!email || !password || !fullname || !username || !phoneNumber || !age || !height || !weight || !gender || !dominantHand || injuryHistory === null) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const numAge = parseInt(age);
    const numHeight = parseFloat(height);
    const numWeight = parseFloat(weight);

    if (numAge < 12 || numAge > 100) return Alert.alert('Invalid Age', 'Age must be between 12 and 100.');
    if (numHeight < 100 || numHeight > 250) return Alert.alert('Invalid Height', 'Please enter a valid height in cm (100 - 250).');
    if (numWeight < 30 || numWeight > 300) return Alert.alert('Invalid Weight', 'Please enter a valid weight in kg (30 - 300).');

    setLoading(true);

    // 2. Daftar ke Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (authError) {
      Alert.alert('Sign Up Failed', authError.message);
      setLoading(false);
      return;
    }

    // 3. Masukkan biodata ke Profiles
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            fullname: fullname,
            username: username, // Simpan Username
            phone_number: phoneNumber, // Simpan Phone Number
            age: numAge,
            gender: gender,
            height: numHeight,
            weight: numWeight,
            dominant_hand: dominantHand,
            injury_history: injuryHistory,
          }
        ]);

      if (profileError) {
        Alert.alert('Profile Error', profileError.message);
      } else {
        Alert.alert('Success', 'Account created successfully!');
        navigation.navigate('SignIn'); // Atau navigate ke 'home'
      }
    }
    
    setLoading(false);
  };

  return (
    <ImageBackground source={bgImage} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            
            <Text style={styles.title}>Sign Up</Text>

            {/* Auth Info */}
            <View style={styles.inputContainer}>
              <Feather name="mail" size={20} color="#E0E0E0" style={styles.icon} />
              <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#A0A0A0" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>

            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color="#E0E0E0" style={styles.icon} />
              <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#A0A0A0" value={password} onChangeText={setPassword} secureTextEntry />
            </View>

            {/* Personal Data */}
            <View style={styles.inputContainer}>
              <Feather name="user" size={20} color="#E0E0E0" style={styles.icon} />
              <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#A0A0A0" value={fullname} onChangeText={setFullname} autoCapitalize="words" />
            </View>

            <View style={styles.inputContainer}>
              <Feather name="at-sign" size={20} color="#E0E0E0" style={styles.icon} />
              <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#A0A0A0" value={username} onChangeText={setUsername} autoCapitalize="none" />
            </View>

            <View style={styles.inputContainer}>
              <Feather name="phone" size={20} color="#E0E0E0" style={styles.icon} />
              <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#A0A0A0" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                <TextInput style={styles.input} placeholder="Age (12-100)" placeholderTextColor="#A0A0A0" value={age} onChangeText={setAge} keyboardType="numeric" maxLength={3} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionLabel}>Gender</Text>
                <View style={styles.toggleRow}>
                  <ToggleButton label="Male" value="Male" state={gender} setState={setGender} />
                  <ToggleButton label="Female" value="Female" state={gender} setState={setGender} />
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                <TextInput style={styles.input} placeholder="Height (cm)" placeholderTextColor="#A0A0A0" value={height} onChangeText={setHeight} keyboardType="numeric" maxLength={3} />
              </View>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <TextInput style={styles.input} placeholder="Weight (kg)" placeholderTextColor="#A0A0A0" value={weight} onChangeText={setWeight} keyboardType="numeric" maxLength={3} />
              </View>
            </View>

            {/* Physical Conditions */}
            <Text style={styles.sectionLabel}>Dominant Hand</Text>
            <View style={styles.toggleRow}>
              <ToggleButton label="Left" value="Left" state={dominantHand} setState={setDominantHand} />
              <ToggleButton label="Right" value="Right" state={dominantHand} setState={setDominantHand} />
            </View>

            <Text style={styles.sectionLabel}>History of Injury?</Text>
            <View style={styles.toggleRow}>
              <ToggleButton label="Yes" value={true} state={injuryHistory} setState={setInjuryHistory} />
              <ToggleButton label="No" value={false} state={injuryHistory} setState={setInjuryHistory} />
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSignUp} disabled={loading}>
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitBtnText}>Sign Up</Text>}
            </TouchableOpacity>

            {/* Bottom Link (Sudah sesuai dengan gambar referensi) */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('signin')}>
                <Text style={styles.footerLink}>Sign in</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
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
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  title: {
    color: '#FFF',
    fontSize: 40,
    fontFamily: 'Satoshi-Bold',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B3A00',
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
    color: '#FFF',
    fontFamily: 'Satoshi-Regular',
    fontSize: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionLabel: {
    color: '#E0E0E0',
    fontSize: 14,
    fontFamily: 'Satoshi-Medium',
    marginBottom: 8,
    marginLeft: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  toggleBtnActive: {
    backgroundColor: '#FF6500', 
  },
  toggleBtnText: {
    color: '#A0A0A0',
    fontFamily: 'Satoshi-Regular',
  },
  toggleBtnTextActive: {
    color: '#FFF',
    fontFamily: 'Satoshi-Bold',
  },
  submitBtn: {
    backgroundColor: '#FF6500',
    borderRadius: 30,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Satoshi-Bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center', // Pastikan teks sejajar
    marginBottom: 20,
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