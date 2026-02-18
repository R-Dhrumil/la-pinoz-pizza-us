import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { ChevronLeft, MapPin, Trash2, AlertTriangle } from 'lucide-react-native';

import { useAddress, Address } from '../context/AddressContext';



const ManageAddressScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
    const { addresses, deleteAddress, loading, refreshAddresses } = useAddress();
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        refreshAddresses();
    }, [refreshAddresses]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refreshAddresses();
        setRefreshing(false);
    }, [refreshAddresses]);
    

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Address</Text>
      </View>

      <View style={styles.content}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing || loading} onRefresh={onRefresh} colors={['#3c7d48']} />
          }
        >
          {addresses.map((address) => (
            <View key={address.id} style={styles.addressCard}>
              <View style={styles.cardHeader}>
                <View style={styles.iconContainer}>
                  <MapPin size={24} color="#3c7d48" />
                </View>
                <View style={styles.addressDetails}>
                  <Text style={styles.addressType}>{address.type || 'Home'}</Text>
                   <Text style={styles.addressText} numberOfLines={2}>
                        {address.fullName}, {address.phoneNumber}
                        {'\n'}
                        {address.addressLine1}, {address.addressLine2 ? address.addressLine2 + ', ' : ''}
                        {address.landmark ? address.landmark + ', ' : ''}
                        {address.city}, {address.state} - {address.zipCode}
                    </Text>
                </View>
                <TouchableOpacity style={styles.deleteButton} onPress={() => {
                  if (address.id !== undefined) {
                    deleteAddress(address.id);
                  }
                }}>
                  <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
              
              {!address.isDeliverable && (
                <TouchableOpacity >
                <View style={styles.warningContainer}>
                  <AlertTriangle size={16} color="#f97316" style={styles.warningIcon} />
                  <Text style={styles.warningText}>Not delivering to this address</Text>
                </View>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddNewAddress')}
          >
            <Text style={styles.addButtonText}>Add New Address</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#fff',
    // Matches the gray header background in screenshot if needed, but white is standard clean
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
    backgroundColor: '#f3f4f6', // Light gray background for the list area
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Space for the fixed button
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(60, 125, 72, 0.1)', // Light green bg
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addressDetails: {
    flex: 1,
    marginRight: 8,
  },
  addressType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  deleteButton: {
    padding: 4,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  warningIcon: {
    marginRight: 6,
  },
  warningText: {
    fontSize: 12,
    color: '#f97316', // Orange
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'transparent',
  },
  addButton: {
    backgroundColor: '#064e3b', // Dark green
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ManageAddressScreen;