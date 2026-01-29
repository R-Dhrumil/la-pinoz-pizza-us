import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ImageBackground,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Pizza, AtSign, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
    
      
      {/* Top Header Bar */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {/* Hero Section */}
        <View style={styles.heroContainer}>
            <ImageBackground
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAT_fev5pujj6i0YT_eyZYIUHLELxKcfyctsEIE0c6kNS3wvf3BeEcMmJKbF6alICfoXEeGtr0zoxpvAXuKR4oDFKRYApwD7OgJiYEtKFxlR21rwF4B4EkWJ1u1ldPiew5Rc7ShjLIDvev0dbAmvRICE52WyFSZXb7rryWmj5V9k2k9IWKKRzET2IWl7aTWWHT67AfNJbM0UIo3BJ9YKVDYfA8k4wfO1Gryg6UIpB2P441wJoqs4t5jclhbnWbbaCpMXabf1zRpaEVE' }} // Using the pizza image from the HTML snippet you provided earlier
                style={styles.heroImage}
                resizeMode="cover"
            >
                <View style={styles.heroOverlay}>
                     <View style={styles.heroBrandContainer}>
                        <Pizza size={20} color="#fff" />
                        <Text style={styles.heroBrandText}>La Pino'z USA</Text>
                     </View>
                     <Text style={styles.heroTitle}>Taste the Tradition{'\n'}in Every Slice.</Text>
                </View>
            </ImageBackground>
        </View>

        {/* Login Form Section - Overlapping or continuing below */}
        <View style={styles.formContainer}>
            <Text style={styles.welcomeTitle}>Welcome Back</Text>
            <Text style={styles.welcomeSubtitle}>Please enter your details to sign in</Text>

            {/* Email Input */}
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>EMAIL OR PHONE NUMBER</Text>
                <View style={styles.inputWrapper}>
                    <AtSign size={20} color="#9ca3af" style={styles.inputIcon} />
                    <TextInput 
                        placeholder="example@email.com" 
                        placeholderTextColor="#9ca3af"
                        style={styles.input}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
            </View>

             {/* Password Input */}
             <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PASSWORD</Text>
                <View style={styles.inputWrapper}>
                    <Lock size={20} color="#9ca3af" style={styles.inputIcon} />
                    <TextInput 
                        placeholder="••••••••" 
                        placeholderTextColor="#9ca3af"
                        style={styles.input}
                        secureTextEntry={!passwordVisible}
                    />
                    <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.eyeIcon}>
                        {passwordVisible ? (
                             <EyeOff size={20} color="#9ca3af" />
                        ) : (
                             <Eye size={20} color="#9ca3af" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity style={styles.forgotContainer}>
                <Text style={styles.forgotText}>Forgot your password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.signInButton} onPress={() => navigation.replace('Home')}>
                <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>

             {/* Optional: Add Sign Up link since the plan mentioned connecting "Sign Up" */}
             <TouchableOpacity style={{alignSelf: 'center', marginTop: 20}} onPress={() => navigation.navigate('Signup')}>
                <Text style={{color: '#6b7280', fontSize: 14, fontWeight: '600'}}>
                    Don't have an account? <Text style={{color: '#3c7d48'}}>Sign Up</Text>
                </Text>
            </TouchableOpacity>

        </View>
    </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  heroContainer: {
    height: 300,
    width: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  heroBrandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  heroBrandText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  formContainer: {
    marginTop: -20, // Negative margin to pull up or just create visual continuity
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 25,
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1b0d0e',
    textAlign: 'center',
    marginBottom: 15,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    height: 52,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginLeft: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#1b0d0e',
    fontSize: 15,
  },
  eyeIcon: {
    padding: 10,
    marginRight: 6,
  },
  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: '#3c7d48',
    fontWeight: '700',
    fontSize: 13,
  },
  signInButton: {
    backgroundColor: '#3c7d48',
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3c7d48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  
});

export default LoginScreen;
