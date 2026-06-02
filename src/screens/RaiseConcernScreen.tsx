import React, { useState } from 'react';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, User, Phone, Mail, HelpCircle, MessageSquare } from 'lucide-react-native';
import { contactService } from '../services/contactService';
import { ScreenContainer } from '../components/ScreenContainer';

const RaiseConcernScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { user } = useAuth();

  const [name, setName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(() => {
    if (!user?.phoneNumber) return '';
    // Format the phone if user has one
    const digits = user.phoneNumber.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return user.phoneNumber;
  });
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
    setPhone(formatted);
  };

  const handleSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name.');
      return;
    }
    if (name.trim().length > 100) {
      Alert.alert('Validation Error', 'Name cannot exceed 100 characters.');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email address.');
      return;
    }
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }
    if (email.trim().length > 254) {
      Alert.alert('Validation Error', 'Email cannot exceed 254 characters.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) {
      Alert.alert('Validation Error', 'Please enter your phone number.');
      return;
    }
    if (cleanPhone.length < 10) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit phone number.');
      return;
    }
    if (cleanPhone.length > 20) {
      Alert.alert('Validation Error', 'Phone number cannot exceed 20 characters.');
      return;
    }

    if (!subject.trim()) {
      Alert.alert('Validation Error', 'Please enter a subject.');
      return;
    }
    if (subject.trim().length > 200) {
      Alert.alert('Validation Error', 'Subject cannot exceed 200 characters.');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Validation Error', 'Please enter your concern details.');
      return;
    }
    if (message.trim().length > 1000) {
      Alert.alert('Validation Error', 'Message cannot exceed 1000 characters.');
      return;
    }

    setLoading(true);
    try {
      await contactService.submitContactForm({
        name: name.trim(),
        email: email.trim(),
        phone: cleanPhone,
        subject: subject.trim(),
        message: message.trim(),
      });

      Alert.alert(
        'Concern Raised',
        'Thank you! Your concern has been submitted successfully. A representative will contact you shortly.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('Raise concern error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to submit concern. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer useScrollView={false} containerStyle={[styles.container, { backgroundColor: '#3c7d48' }]} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <FocusAwareStatusBar barStyle="light-content" backgroundColor="#3c7d48" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Raise a Concern</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.subtitle}>
            Have an issue with your order or any other concern? Fill out this form and our support team will get back to you as soon as possible.
          </Text>

          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <User size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor="#9ca3af"
                maxLength={100}
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email address"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9ca3af"
                maxLength={254}
              />
            </View>
          </View>

          {/* Phone Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Phone size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={handlePhoneChange}
                placeholder="(123) 456-7890"
                keyboardType="phone-pad"
                placeholderTextColor="#9ca3af"
                maxLength={14}
              />
            </View>
          </View>

          {/* Subject Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Subject</Text>
            <View style={styles.inputContainer}>
              <HelpCircle size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
                placeholder="Brief summary of your concern"
                placeholderTextColor="#9ca3af"
                maxLength={200}
              />
            </View>
          </View>

          {/* Message Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Details</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <MessageSquare size={20} color="#6b7280" style={[styles.inputIcon, styles.textAreaIcon]} />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={message}
                onChangeText={setMessage}
                placeholder="Please describe your concern in detail..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                maxLength={1000}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Submit Concern</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#3c7d48',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
  },
  textAreaContainer: {
    height: 120,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textAreaIcon: {
    marginTop: 2,
  },
  textArea: {
    height: '100%',
  },
  submitBtn: {
    backgroundColor: '#3c7d48',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RaiseConcernScreen;
