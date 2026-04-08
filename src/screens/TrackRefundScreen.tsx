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
import { ChevronLeft, Search, CheckCircle2, Clock, CircleAlert } from 'lucide-react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';

const TrackRefundScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [refundStatus, setRefundStatus] = useState<null | 'processing' | 'completed' | 'not_found'>(null);

  const handleTrack = () => {
    if (!orderId.trim()) {
      Alert.alert('Error', 'Please enter your Order ID.');
      return;
    }

    setLoading(true);

    // Simulating API call
    setTimeout(() => {
      setLoading(false);
      // Dummy logic: if order starts with 1, it's completed. If 2, processing, else not found.
      if (orderId.startsWith('1')) {
        setRefundStatus('completed');
      } else if (orderId.startsWith('2')) {
        setRefundStatus('processing');
      } else {
        setRefundStatus('not_found');
      }
    }, 1200);
  };

  const renderStatus = () => {
    if (!refundStatus) return null;

    if (refundStatus === 'not_found') {
      return (
        <View style={styles.statusBox}>
          <CircleAlert size={48} color="#ef4444" style={styles.statusIcon} />
          <Text style={styles.statusTitle}>No Refund Found</Text>
          <Text style={styles.statusDesc}>We could not find a refund associated with Order ID {orderId}. If you believe this is a mistake, please raise a concern.</Text>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('RaiseConcern')}>
            <Text style={styles.secondaryBtnText}>Raise a Concern</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.statusBox}>
        {/* Step 1 */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineColumn}>
            <View style={styles.timelineIconBox}>
                <CheckCircle2 size={24} color="#3c7d48" />
            </View>
            <View style={styles.timelineLine} />
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>Refund Initiated</Text>
            <Text style={styles.timelineDate}>Today</Text>
          </View>
        </View>

        {/* Step 2 */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineColumn}>
            <View style={styles.timelineIconBox}>
                {(refundStatus === 'processing' || refundStatus === 'completed') ? (
                  <CheckCircle2 size={24} color="#3c7d48" />
                ) : (
                  <Clock size={24} color="#9ca3af" />
                )}
            </View>
            <View style={styles.timelineLine} />
          </View>
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>Processing Refund</Text>
            <Text style={styles.timelineDate}>Refund is being processed by the bank</Text>
          </View>
        </View>

        {/* Step 3 */}
        <View style={styles.timelineItem}>
          <View style={styles.timelineColumn}>
            <View style={styles.timelineIconBox}>
                {refundStatus === 'completed' ? (
                  <CheckCircle2 size={24} color="#3c7d48" />
                ) : (
                  <Clock size={24} color="#9ca3af" />
                )}
            </View>
            {/* No line for the last item */}
          </View>
          <View style={styles.timelineContent}>
            <Text style={[styles.timelineTitle, refundStatus !== 'completed' && styles.textMuted]}>Refund Completed</Text>
            <Text style={styles.timelineDate}>{refundStatus === 'completed' ? 'Successfully transferred to original payment method' : 'Pending completion'}</Text>
          </View>
        </View>
      </View>
    );
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
          <Text style={styles.headerTitle}>Track Refund</Text>
          <View style={{ width: 40 }} /> 
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          
          <Text style={styles.description}>
            Enter your Order ID to check the status of your refund.
          </Text>

          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <Search size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={orderId}
                onChangeText={setOrderId}
                placeholder="Enter Order ID"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
              />
            </View>
            <TouchableOpacity 
              style={styles.trackBtn} 
              onPress={handleTrack}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.trackBtnText}>Track</Text>
              )}
            </TouchableOpacity>
          </View>

          {renderStatus()}

        </ScrollView>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 20,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 12,
  },
  inputContainer: {
    flex: 1,
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
    fontSize: 16,
    color: '#1f2937',
  },
  trackBtn: {
    backgroundColor: '#3c7d48',
    height: 50,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  trackBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  statusIcon: {
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  statusDesc: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: '#3c7d48',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  secondaryBtnText: {
    color: '#3c7d48',
    fontWeight: '600',
  },
  timelineItem: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'flex-start',
  },
  timelineColumn: {
    alignItems: 'center',
    width: 40,
    marginRight: 12,
  },
  timelineIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineLine: {
    width: 2,
    height: 40, // Length of the line between icons
    backgroundColor: '#e5e7eb',
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
    paddingBottom: 24, // Space around the content matching line
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  textMuted: {
    color: '#9ca3af',
  },
});

export default TrackRefundScreen;
