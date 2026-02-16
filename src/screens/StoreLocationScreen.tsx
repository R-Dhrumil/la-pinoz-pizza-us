import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Search, MapPin, Navigation, X, SlidersHorizontal } from 'lucide-react-native';
import axios from 'axios';
import { useStore } from '../context/StoreContext';

const API_URL = 'https://api.lapinozusa.com/api/storelocations';

interface Store {
  id: number;
  storeId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  image: string;
  status: string;
  operatingHours: any[];
}

const StoreLocationScreen = () => {
  const navigation = useNavigation();
  const { setSelectedStore } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await axios.get(API_URL);
      setAllStores(response.data);
      setFilteredStores(response.data);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterStores();
  }, [searchQuery, selectedState, selectedCity, allStores]);

  const filterStores = () => {
    let filtered = allStores;

    if (selectedState) {
        filtered = filtered.filter(store => store.state === selectedState);
    }

    if (selectedCity) {
        filtered = filtered.filter(store => store.city === selectedCity);
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (store) =>
          store.name.toLowerCase().includes(lowerQuery) ||
          store.address.toLowerCase().includes(lowerQuery) ||
          store.city.toLowerCase().includes(lowerQuery) ||
          store.zipCode.includes(lowerQuery)
      );
    }

    setFilteredStores(filtered);
  };

  // Extract unique states
  const states = Array.from(new Set(allStores.map(store => store.state))).sort();

  // Extract unique cities based on selected state (or all cities if no state selected)
  const cities = Array.from(new Set(
      allStores
        .filter(store => !selectedState || store.state === selectedState)
        .map(store => store.city)
  )).sort();

  const handleSelectLocation = (store: Store) => {
    setSelectedStore(store);
    navigation.goBack();
  };

  const renderLocationItem = ({ item }: { item: Store }) => (
    <TouchableOpacity
      style={styles.locationItem}
      onPress={() => handleSelectLocation(item)}
    >
      <Image source={{ uri: item.image }} style={styles.storeImage} resizeMode="cover" />
      <View style={styles.locationInfo}>
        <Text style={styles.locationName}>{item.name}</Text>
        <Text style={styles.locationAddress}>{item.address}</Text>
        <Text style={styles.locationDetail}>{item.city}, {item.state} {item.zipCode}</Text>
        
        <View style={styles.statusRow}>
             <View style={[styles.statusDot, { backgroundColor: item.status === 'Open' ? '#22c55e' : '#ef4444' }]} />
             <Text style={[styles.statusText, { color: item.status === 'Open' ? '#15803d' : '#b91c1c' }]}>
                 {item.status}
             </Text>
             <Text style={styles.phoneText}>• {item.phone}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const FilterChip = ({ label, active, onPress }: { label: string, active: boolean, onPress: () => void }) => (
      <TouchableOpacity 
        style={[styles.filterChip, active && styles.filterChipActive]} 
        onPress={onPress}
      >
          <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
      </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
        <View style={{ width: 24 }} /> 
      </View>

      <View style={styles.content}>
        {/* Search & Filter Row */}
        <View style={styles.searchFilterRow}>
            <View style={styles.searchContainer}>
            <Search size={20} color="#6b7280" style={styles.searchIcon} />
            <TextInput
                style={styles.searchInput}
                placeholder="Search city, state or zip..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <X size={18} color="#6b7280" />
                </TouchableOpacity>
            )}
            </View>
            <TouchableOpacity 
                style={[styles.filterButton, showFilters && styles.filterButtonActive]} 
                onPress={() => setShowFilters(!showFilters)}
            >
                <SlidersHorizontal size={20} color={showFilters ? "#fff" : "#000"} />
            </TouchableOpacity>
        </View>
        
        {/* Filters */}
        {showFilters && (
        <View style={styles.filtersContainer}>
            {/* State Filters */}
            <View>
                <Text style={styles.filterLabel}>Filter by State:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    <FilterChip 
                        label="All" 
                        active={selectedState === null} 
                        onPress={() => { setSelectedState(null); setSelectedCity(null); }} 
                    />
                    {states.map(state => (
                        <FilterChip 
                            key={state} 
                            label={state} 
                            active={selectedState === state} 
                            onPress={() => { setSelectedState(state); setSelectedCity(null); }} 
                        />
                    ))}
                </ScrollView>
            </View>

            {/* City Filters */}
            <View style={{ marginTop: 12 }}>
                <Text style={styles.filterLabel}>Filter by City:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    <FilterChip 
                        label="All" 
                        active={selectedCity === null} 
                        onPress={() => setSelectedCity(null)} 
                    />
                    {cities.map(city => (
                        <FilterChip 
                            key={city} 
                            label={city} 
                            active={selectedCity === city} 
                            onPress={() => setSelectedCity(city)} 
                        />
                    ))}
                </ScrollView>
            </View>
        </View>
        )}

        <View style={styles.divider} />

        {/* Use Current Location Button */}
        <TouchableOpacity style={styles.currentLocationButton} onPress={() => {}}>
            <Navigation size={20} color="#3c7d48" />
            <Text style={styles.currentLocationText}>Use my current location</Text>
        </TouchableOpacity>

        {/* Store List */}
        <Text style={styles.sectionTitle}>Available Stores ({filteredStores.length})</Text>
        
        {loading ? (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3c7d48" />
            </View>
        ) : (
            <FlatList
            data={filteredStores}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderLocationItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No stores found matching your criteria.</Text>
                </View>
            }
            />
        )}
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
  },
  searchFilterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginTop: 16,
      marginBottom: 16,
      gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    height: '100%',
  },
  filtersContainer: {
      paddingHorizontal: 16,
      marginBottom: 16,
  },
  filterLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: '#6b7280',
      marginBottom: 8,
  },
  filterScroll: {
      gap: 8,
  },
  filterChip: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: '#f3f4f6',
      borderWidth: 1,
      borderColor: '#e5e7eb',
  },
  filterChipActive: {
      backgroundColor: '#dbfce7', // Light green
      borderColor: '#3c7d48',
  },
  filterChipText: {
      fontSize: 13,
      color: '#4b5563',
      fontWeight: '500',
  },
  filterChipTextActive: {
      color: '#166534',
      fontWeight: '700',
  },
  divider: {
      height: 1,
      backgroundColor: '#f3f4f6',
  },
  currentLocationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
  },
  currentLocationText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#3c7d48',
  },
  sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#000',
      margin: 16,
      marginBottom: 8,
  },
  listContent: {
    gap: 16,
    padding: 16,
    paddingTop: 0,
    paddingBottom: 24,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  storeImage: {
      width: 80,
      height: 80,
      borderRadius: 8,
      backgroundColor: '#f3f4f6',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 2,
  },
  locationDetail: {
      fontSize: 13,
      color: '#6b7280',
      marginBottom: 6,
  },
  statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
  },
  statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
  },
  statusText: {
      fontSize: 12,
      fontWeight: '600',
  },
  phoneText: {
      fontSize: 12,
      color: '#6b7280',
  },
  loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
  },
  filterButton: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: '#f3f4f6',
      justifyContent: 'center',
      alignItems: 'center',
  },
  filterButtonActive: {
      backgroundColor: '#3c7d48',
  },
});

export default StoreLocationScreen;
