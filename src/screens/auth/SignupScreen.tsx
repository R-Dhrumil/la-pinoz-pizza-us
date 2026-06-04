import React, { useState } from 'react';
import FocusAwareStatusBar from '../../components/FocusAwareStatusBar';
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

  ActivityIndicator,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Pizza, User, Mail, Phone, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const SignupScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const insets = useSafeAreaInsets();
  const { setUser } = useAuth();
  const [secure, setSecure] = useState(true);
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Email Verification State
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpError, setOtpError] = useState('');
  const [otpSuccessMessage, setOtpSuccessMessage] = useState('');

  // Cooldown countdown timer for OTP resend
  React.useEffect(() => {
    let interval: any = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpTimer]);

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
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    if (!values.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    } else if (values.fullName.trim().length < 3) {
      newErrors.fullName = 'Full Name must be at least 3 characters';
    } else if (values.fullName.trim().length > 50) {
      newErrors.fullName = 'Full Name must be less than 50 characters';
    } else if (!nameRegex.test(values.fullName.trim())) {
      newErrors.fullName = 'Please enter a valid name without special characters or numbers';
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

  const handleSendOtp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address first.');
      return;
    }

    setIsSendingOtp(true);
    setOtpError('');
    setOtpSuccessMessage('');

    try {
      await authService.sendEmailOtp(email.trim().toLowerCase());
      setOtpSent(true);
      setOtpTimer(60);
      setOtpSuccessMessage('Verification code sent to your email.');
      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: 'Verification code sent to your email.'
      });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      const errMsg = error.response?.data?.message || error.response?.data || error.message || 'Failed to send verification code.';
      const errorStr = typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg;
      setOtpError(errorStr);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: typeof errorStr === 'string' ? errorStr : 'Failed to send code.'
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit verification code.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError('');
    setOtpSuccessMessage('');

    try {
      await authService.verifyEmailOtp(email.trim().toLowerCase(), otpCode.trim());
      setIsEmailVerified(true);
      setOtpSent(false);
      setOtpSuccessMessage('Email verified successfully!');
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Email verified successfully!'
      });
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      const errMsg = error.response?.data?.message || error.response?.data || error.message || 'Invalid or expired verification code.';
      const errorStr = typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg;
      setOtpError(errorStr);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: typeof errorStr === 'string' ? errorStr : 'Invalid verification code.'
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

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

    if (!isEmailVerified) {
      Alert.alert('Error', 'Please verify your email address first.');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.register({
        fullName,
        email: email.trim().toLowerCase(),
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
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="#3c7d48" />
      <KeyboardAwareScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
          {/* Hero Header */}
          <View style={[styles.heroContainer, { paddingTop: Math.max(insets.top, 20) }]}>
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
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={[styles.label, { marginBottom: 0 }]}>EMAIL ADDRESS</Text>
                {isEmailVerified && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <CheckCircle size={14} color="#16a34a" />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#16a34a' }}>Verified</Text>
                  </View>
                )}
              </View>
              <View style={[
                styles.inputWrapper, 
                touched.email && errors.email && styles.inputError,
                isEmailVerified && { borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }
              ]}>
                <Mail size={20} color={touched.email && errors.email ? "#ef4444" : isEmailVerified ? "#16a34a" : "#9ca3af"} style={styles.inputIcon} />
                <TextInput
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  style={[styles.input, (isEmailVerified || otpSent) && { color: '#6b7280' }]}
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (isEmailVerified) {
                      setIsEmailVerified(false);
                    }
                  }}
                  onBlur={() => handleBlur('email')}
                  editable={!isEmailVerified && !otpSent}
                />
                {isEmailVerified ? (
                  <TouchableOpacity
                    onPress={() => {
                      setIsEmailVerified(false);
                      setOtpSent(false);
                      setOtpCode('');
                      setOtpSuccessMessage('');
                      setOtpError('');
                    }}
                    style={{ paddingHorizontal: 12, paddingVertical: 8, marginRight: 6 }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#3c7d48' }}>Change</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={handleSendOtp}
                    disabled={isSendingOtp || otpTimer > 0 || !email || !!errors.email}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      marginRight: 6,
                      borderRadius: 8,
                      backgroundColor: (isSendingOtp || otpTimer > 0 || !email || !!errors.email) ? '#f3f4f6' : '#eaf5ed',
                    }}
                  >
                    {isSendingOtp ? (
                      <ActivityIndicator size="small" color="#3c7d48" />
                    ) : (
                      <Text style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: (isSendingOtp || otpTimer > 0 || !email || !!errors.email) ? '#9ca3af' : '#3c7d48'
                      }}>
                        {otpTimer > 0 ? `Resend ${otpTimer}s` : otpSent ? 'Resend' : 'Verify'}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
              {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              {!isEmailVerified && otpSuccessMessage && !otpSent && (
                <Text style={{ color: '#16a34a', fontSize: 12, marginTop: 4, marginLeft: 4, fontWeight: '600' }}>
                  {otpSuccessMessage}
                </Text>
              )}
            </View>

            {/* OTP Verification Field */}
            {otpSent && !isEmailVerified && (
              <View style={[styles.inputGroup, { backgroundColor: '#f9fafb', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6' }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={[styles.label, { marginBottom: 0 }]}>ENTER 6-DIGIT OTP CODE</Text>
                  {otpTimer > 0 && (
                    <Text style={{ fontSize: 11, color: '#6b7280' }}>Resend in {otpTimer}s</Text>
                  )}
                </View>
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <View style={[styles.inputWrapper, { flex: 1 }]}>
                    <TextInput
                      placeholder="••••••"
                      keyboardType="number-pad"
                      maxLength={6}
                      style={[styles.input, { textAlign: 'center', fontWeight: '700', letterSpacing: 6 }]}
                      placeholderTextColor="#9ca3af"
                      value={otpCode}
                      onChangeText={(val) => setOtpCode(val.replace(/[^0-9]/g, ''))}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={handleVerifyOtp}
                    disabled={isVerifyingOtp || otpCode.length !== 6}
                    style={{
                      height: 52,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                      backgroundColor: (isVerifyingOtp || otpCode.length !== 6) ? '#f3f4f6' : '#3c7d48',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {isVerifyingOtp ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={{ fontSize: 14, fontWeight: '700', color: (isVerifyingOtp || otpCode.length !== 6) ? '#9ca3af' : '#fff' }}>
                        Verify Code
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
                {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}
                {otpSuccessMessage ? (
                  <Text style={{ color: '#16a34a', fontSize: 12, marginTop: 4, marginLeft: 4, fontWeight: '600' }}>
                    {otpSuccessMessage}
                  </Text>
                ) : null}
              </View>
            )}

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
              style={[
                styles.mainButton, 
                (loading || !isEmailVerified) && { opacity: 0.7, backgroundColor: '#9ca3af', shadowColor: '#9ca3af' }
              ]}
              onPress={handleSignup}
              disabled={loading || !isEmailVerified}
            >
              <Text style={styles.mainButtonText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
            </TouchableOpacity>

            {/* Terms */}
            <Text style={styles.termsText}>
              By creating an account, you agree to La Pino'z{' '}
              <Text 
                style={styles.linkText}
                onPress={() => navigation.navigate('AppWebView', { url: 'https://www.lapinozusa.com/terms', title: 'Terms of Service' })}
              >
                Terms of Service
              </Text> and{' '}
              <Text 
                style={styles.linkText}
                onPress={() => navigation.navigate('AppWebView', { url: 'https://www.lapinozusa.com/privacy', title: 'Privacy Policy' })}
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
        </KeyboardAwareScrollView>
    </View>
  );
};

import { styles } from './SignupScreen.styles';

export default SignupScreen;
