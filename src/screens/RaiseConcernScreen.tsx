import React, { useState } from 'react';
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
import { ChevronLeft, MessageCircle, Type } from 'lucide-react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';

const RaiseConcernScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim()) {
      Alert.alert('Error', 'Please enter a subject for your concern.');
      return;
    }
    
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter your concern message.');
      return;
    }

    if (message.trim().length < 10) {
      Alert.alert('Error', 'Please provide a more detailed message (minimum 10 characters).');
      return;
    }

    setLoading(true);

    // Simulating API call delay
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success',
        'Your concern has been submitted successfully. Our support team will review it and get back to you soon.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1500);
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
          
          <Text style={styles.description}>
            We're here to help! Please provide the details of your concern below, and our team will investigate it promptly.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Subject</Text>
            <View style={styles.inputContainer}>
              <Type size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
                placeholder="Briefly describe the issue"
                placeholderTextColor="#9ca3af"
                maxLength={100}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Message</Text>
            <View style={[styles.inputContainer, styles.messageInputContainer]}>
              <TextInput
                style={styles.messageInput}
                value={message}
                onChangeText={setMessage}
                placeholder="Provide all relevant details about your concern..."
                placeholderTextColor="#9ca3af"
                multiline={true}
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          </View>

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
  description: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
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
  messageInputContainer: {
    height: 150,
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingBottom: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
  },
  messageInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    width: '100%',
    height: '100%',
  },
  submitBtn: {
    backgroundColor: '#3c7d48',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RaiseConcernScreen;
