import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Dimensions,
  Alert,
  Linking,
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

  // Auto-format phone number to US format (XXX) XXX-XXXX
  const handlePhoneChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    let formatted = '';
    if (digits.length <= 3) {
      formatted = digits;
    } else if (digits.length <= 6) {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
    setPhoneNumber(formatted);
  };
  
  // Validation State
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const getValidationErrors = (values: { fullName: string, email: string, phoneNumber: string, password: string }) => {
    let newErrors: { [key: string]: string } = {};

    // Full Name Validation
    if (!values.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    } else if (values.fullName.trim().length < 3) {
      newErrors.fullName = 'Full Name must be at least 3 characters';
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!values.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(values.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone Validation (USA Format - 10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!values.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone Number is required';
    } else if (!phoneRegex.test(values.phoneNumber.replace(/\D/g, ''))) {
       newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    // Password Validation (Strict)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!values.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRegex.test(values.password)) {
      newErrors.password = '8+ chars, 1 Uppercase, 1 Number, 1 Symbol (!@#$%)';
    }

    return newErrors;
  };

  const errors = getValidationErrors({ fullName, email, phoneNumber, password });

  const handleSignup = async () => {
    // specific check: if any error exists key length > 0
    if (Object.keys(errors).length > 0) {
      // Mark all as touched to show errors
      setTouched({
        fullName: true,
        email: true,
        phoneNumber: true,
        password: true,
      });
      return;
    }

    try {
      setLoading(true);
      const response = await authService.register({
        fullName,
        email,
        phoneNumber: phoneNumber.replace(/\D/g, ''),
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

  const handleBlur = (field: string) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
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
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Header */}
          <View style={styles.heroContainer}>
            <View style={styles.heroBrandRow}>
              <Pizza size={22} color="#fff" />
              <Text style={styles.heroBrandText}>La Pino'z USA</Text>
            </View>
            <Text style={styles.heroTitle}>Create Account</Text>
            <Text style={styles.heroSubtitle}>Join us for faster ordering and exclusive rewards.</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <View style={[styles.inputWrapper, touched.fullName && errors.fullName && styles.inputError]}>
                <User size={20} color={touched.fullName && errors.fullName ? "#ef4444" : "#9ca3af"} style={styles.inputIcon} />
                <TextInput
                  placeholder="e.g. John Doe"
                  style={styles.input}
                  placeholderTextColor="#9ca3af"
                  value={fullName}
                  onChangeText={setFullName}
                  onBlur={() => handleBlur('fullName')}
                />
              </View>
              {touched.fullName && errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <View style={[styles.inputWrapper, touched.email && errors.email && styles.inputError]}>
                <Mail size={20} color={touched.email && errors.email ? "#ef4444" : "#9ca3af"} style={styles.inputIcon} />
                <TextInput
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  style={styles.input}
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  onBlur={() => handleBlur('email')}
                />
              </View>
              {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PHONE NUMBER</Text>
              <View style={[styles.inputWrapper, touched.phoneNumber && errors.phoneNumber && styles.inputError]}>
                <Phone size={20} color={touched.phoneNumber && errors.phoneNumber ? "#ef4444" : "#9ca3af"} style={styles.inputIcon} />
                <TextInput
                  placeholder="(555) 000-0000"
                  keyboardType="phone-pad"
                  style={styles.input}
                  placeholderTextColor="#9ca3af"
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  onBlur={() => handleBlur('phoneNumber')}
                  maxLength={14}
                />
              </View>
               {touched.phoneNumber && errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <View style={[styles.inputWrapper, touched.password && errors.password && styles.inputError]}>
                <Lock size={20} color={touched.password && errors.password ? "#ef4444" : "#9ca3af"} style={styles.inputIcon} />
                <TextInput
                  placeholder="At least 8 characters"
                  secureTextEntry={secure}
                  style={styles.input}
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  onBlur={() => handleBlur('password')}
                />
                
                <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.eyeIcon}>
                  {secure ? (
                      <EyeOff size={20} color="#9ca3af" />
                  ) : (
                      <Eye size={20} color="#9ca3af" />
                  )}
                </TouchableOpacity>
              </View>
              {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
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
              <Text 
                style={styles.linkText}
                onPress={() => Linking.openURL('https://www.lapinozusa.com/terms')}
              >
                Terms of Service
              </Text> and{' '}
              <Text 
                style={styles.linkText}
                onPress={() => Linking.openURL('https://www.lapinozusa.com/privacy')}
              >
                Privacy Policy
              </Text>.
            </Text>

            {/* Already have an account? Login */}
            <TouchableOpacity style={styles.loginLinkContainer} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLinkText}>
                Already have an account? <Text style={styles.loginLinkHighlight}>Login</Text>
              </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

import { styles } from './SignupScreen.styles';

export default SignupScreen;
