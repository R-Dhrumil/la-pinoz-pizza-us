import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  Alert,
} from 'react-native';
import { Pizza, User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const SignupScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { setUser } = useAuth();
  const [secure, setSecure] = useState(true);
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !phoneNumber || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.register({
        fullName,
        email,
        phoneNumber,
        password
      });
      
      // Store user data in AuthContext
      setUser({
        fullName,
        email,
        phoneNumber,
      });
      
      setLoading(false);
      Alert.alert('Success', 'Account created successfully! Please login.');
      navigation.navigate('Login');
    } catch (error: any) {
      setLoading(false);
      console.error('Signup error:', error);
      const message = error.response?.data?.message || 'Failed to create account. Please try again.';
      Alert.alert('Error', message);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#3c7d48" />
      {/* 
        Using KeyboardAvoidingView to ensure inputs are visible when keyboard is open.
        Platform-specific behavior is needed.
      */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          // contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Mobile Header / Logo Area */}
          <View style={styles.headerContainer}>
             {/* New Header Layout: Row with Brand on Left, Login Button on Right */}
              <View style={styles.logoRow}>
               <View style={styles.brandContainer}>
                  <Pizza size={28} color="#3c7d48" fill="#3c7d48" />
                  <Text style={styles.brandText}>La Pino'z Pizza</Text>
               </View>

               <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginButtonText}>Login</Text>
               </TouchableOpacity>
             </View>
             
             {/* Spacing and Title */}
             <View style={{marginTop: 5, alignItems: 'center'}}>
                 
                 <Text style={styles.pageTitle}>Create Account</Text>
                 <Text style={styles.pageSubtitle}>Join us for faster ordering and exclusive rewards.</Text>
             </View>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <User size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  placeholder="e.g. John Doe"
                  style={styles.input}
                  placeholderTextColor="#9ca3af"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Mail size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  style={styles.input}
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Phone size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  placeholder="(555) 000-0000"
                  keyboardType="phone-pad"
                  style={styles.input}
                  placeholderTextColor="#9ca3af"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  placeholder="At least 8 characters"
                  secureTextEntry={secure}
                  style={styles.input}
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                />
                
                <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.eyeIcon}>
                  {secure ? (
                      <EyeOff size={20} color="#9ca3af" />
                  ) : (
                      <Eye size={20} color="#9ca3af" />
                  )}
                </TouchableOpacity>
              </View>
            </View>



            {/* Create Account Button */}
            <TouchableOpacity 
              style={[styles.mainButton, loading && { opacity: 0.7 }]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.mainButtonText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
            </TouchableOpacity>

            {/* Terms */}
            <Text style={styles.termsText}>
              By creating an account, you agree to La Pino'z{' '}
              <Text style={styles.linkText}>Terms of Service</Text> and{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>.
            </Text>



            {/* Back to Login */}
           

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // scrollContent: {
  //   paddingBottom: 30,
  // },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  brandContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
  },
  brandText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1b0d0e',
    letterSpacing: -0.5,
  },
  loginButton: {
      backgroundColor: '#3c7d48',
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 20,
      elevation: 2,
  },
  loginButtonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 13,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1b0d0e',
    marginBottom: 8,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb', // gray-50
    borderWidth: 1,
    borderColor: '#e5e7eb', // gray-200
    borderRadius: 12,
    height: 52,
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#1b0d0e',
    fontWeight: '500',
  },
  eyeIcon: {
    padding: 10,
    marginRight: 4,
  },
  mainButton: {
    backgroundColor: '#3c7d48',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3c7d48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  termsText: {
    fontSize: 12,
    color: '#9ca3af', // gray-400
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
    marginBottom: 24,
  },
  linkText: {
    color: '#4b5563', // gray-600
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

export default SignupScreen;
