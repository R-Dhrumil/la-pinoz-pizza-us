import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  Dimensions,
  Animated,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Linking,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { RouteProp, useRoute } from '@react-navigation/native';
import {
  Search,
  User,
  ChevronRight,
  Pizza,
  IceCream,
  Martini,
  Wheat,
  Utensils,
  X // Import X for close button
} from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { ScreenContainer } from '../components/ScreenContainer';
import MenuSkeleton from '../components/MenuSkeleton';
import { categoryService, Category, Product } from '../services/categoryService';
import FloatingCart from '../components/FloatingCart';
import MenuItem from '../components/MenuItem';

const { width } = Dimensions.get('window');

const MenuScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute<RouteProp<{ params: { categoryId?: number } }, 'params'>>();
  const { categoryId: targetCategoryId } = route.params || {};

  const { addToCart, totalItems, totalAmount } = useCart();
  const { selectedStore } = useStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<number | null>(null);
  
  // Search & Modal state
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuModalVisible, setIsMenuModalVisible] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  // Simple scroll ref to jump to sections (visual only for MVP)
  const scrollViewRef = useRef<ScrollView>(null);
  const tabsScrollViewRef = useRef<ScrollView>(null);
  const sectionPositions = useRef<{ [key: number]: number }>({});
  const tabPositions = useRef<{ [key: number]: number }>({});
  const isTabPress = useRef(false);

  useEffect(() => {
    if (selectedStore?.id) {
        fetchCategories();
    } else {
        setCategories([]);
    }

  }, [selectedStore]);

  // Handle route params when screen focuses or params change
  useEffect(() => {
    if (targetCategoryId && categories.length > 0) {
        const targetId = Number(targetCategoryId);
        const targetExists = categories.find(c => c.id === targetId);
        if (targetExists) {
            // instant jump
            setTimeout(() => {
                handleTabPress(targetId, false);
            }, 100);
        }
    }
  }, [targetCategoryId, categories]);

  const fetchCategories = async () => {
      if (!selectedStore?.id) return;
      
      setLoading(true);
      try {
          // Artificial delay for skeleton testing
          await new Promise(resolve => setTimeout(() => resolve(true), 2000));
          
          const data = await categoryService.getCategories(selectedStore.id);
          setCategories(data);
          // Initial selection logic moved to useEffect above
          if (data.length > 0 && !activeTab) {
              setActiveTab(data[0].id);
          }
      } catch (error) {
          console.error("Failed to fetch categories", error);
          Alert.alert("Error", "Failed to load menu. Please try again.");
      } finally {
          setLoading(false);
          setRefreshing(false);
      }
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Explicitly set loading to true to trigger skeleton
    setLoading(true);
    fetchCategories();
  };

  const scrollToActiveTab = (categoryId: number) => {
      const x = tabPositions.current[categoryId];
      if (tabsScrollViewRef.current && x !== undefined) {
         // Center the tab: x - (screenWidth / 2) + (tabWidth / 2)
         // Assuming tab width is approx 70
         const scrollX = x - (width / 2) + 35; 
         tabsScrollViewRef.current.scrollTo({ x: Math.max(0, scrollX), animated: true });
      }
  };

  const handleTabPress = (categoryId: number, animated = true) => {
      setActiveTab(categoryId);
      isTabPress.current = true;
      const y = sectionPositions.current[categoryId];
      
      if (scrollViewRef.current && y !== undefined) {
          // Add small offset for sticky header / visuals
          const offset = Math.max(0, y - 20);
          scrollViewRef.current.scrollTo({ y: offset, animated });
      }
      scrollToActiveTab(categoryId);
      
      // Reset flag after animation
      setTimeout(() => {
          isTabPress.current = false;
      }, 1000);
  };

  const handleScroll = (event: any) => {
      if (isTabPress.current) return;

      const scrollY = event.nativeEvent.contentOffset.y;
      const effectiveY = scrollY + 100; // Offset for better detection

      // Find the last category whose position is <= effectiveY
      let currentTab = activeTab;
      
      // We need to iterate over visible categories to find the current section
      for (let i = 0; i < filteredCategories.length; i++) {
            const category = filteredCategories[i];
            const pos = sectionPositions.current[category.id];
            
            if (pos !== undefined && pos <= effectiveY) {
                currentTab = category.id;
            } else if (pos !== undefined && pos > effectiveY) {
                // Since positions are ordered, we can stop checking once we go past
                break;
            }
      }

      if (currentTab !== activeTab && currentTab !== null) {
          setActiveTab(currentTab);
          scrollToActiveTab(currentTab);
      }
  };

  const getCategoryIcon = (categoryName: string) => {
      const lowerName = categoryName.toLowerCase();
      if (lowerName.includes('pizza')) return <Pizza size={18} />;
      if (lowerName.includes('dessert')) return <IceCream size={18} />;
      if (lowerName.includes('beverage') || lowerName.includes('drink')) return <Martini size={18} />;
      if (lowerName.includes('bread')) return <Wheat size={18} />;
      return <Utensils size={18} />;
  };

  // Filter categories based on search
  const filteredCategories = categories.map(category => {
      // If no search, return category as is
      if (!searchQuery.trim()) return category;

      // Filter products
      const filteredProducts = category.products.filter(p => 
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Return new category object with filtered products
      return {
          ...category,
          products: filteredProducts
      };
  }).filter(category => category.products.length > 0); // Remove empty categories

  return (
      <ScreenContainer useScrollView={false} containerStyle={styles.containerStyleOverride} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('StoreLocation')}>
          <Text style={styles.brandName}>La Pino'z USA</Text>
          <View style={styles.locationContainer}>
              <View style={styles.locationDot} />
              <Text style={styles.locationText}>
                  {selectedStore 
                  ? `${selectedStore.city}, ${selectedStore.state}` 
                  : 'Select Location'}
              </Text>
              <ChevronRight size={12} color="#3c7d48" />
          </View>
          </TouchableOpacity>
      </View>

      {loading ? (
          <MenuSkeleton />
      ) : !selectedStore ? (
          <View style={[styles.container, styles.centered]}>
              <Text style={styles.messageText}>Please select a store to view the menu</Text>
              <TouchableOpacity 
                  style={styles.selectStoreBtn}
                  onPress={() => navigation.navigate('StoreLocation')}
              >
                  <Text style={styles.selectStoreBtnText}>Select Store</Text>
              </TouchableOpacity>
          </View>
      ) : (
          <>

            <ScrollView 
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3c7d48']} />
                }
            >
                {filteredCategories.map(category => (
                    <View 
                        key={category.id} 
                        style={styles.listSection}
                        onLayout={(event) => {
                            sectionPositions.current[category.id] = event.nativeEvent.layout.y;
                        }}
                    >
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>{category.name}</Text>
                            <Text style={styles.itemCount}>
                                {category.products ? category.products.length : 0} ITEMS
                            </Text>
                        </View>
                        {category.products && category.products.map(item => (
                            <MenuItem 
                                key={item.id} 
                                item={item} 
                                onTap={() => navigation.navigate('ProductDetail', { item })} 
                            />
                        ))}
                    </View>
                ))}
                
                {filteredCategories.length === 0 && !loading && (
                    <View style={styles.centered}>
                        <Text style={styles.messageText}>
                            {searchQuery ? `No items found matching "${searchQuery}"` : "No menu items found for this store."}
                        </Text>
                    </View>
                )}

            </ScrollView>
          </>
      )}

      <FloatingCart />

      {/* Bottom Bar (Search & Menu) anchored */}
      {selectedStore && !loading && (
          <View style={styles.anchoredBottomBar}>
              <View style={styles.floatingSearchContainer}>
                  <Search size={22} color="#6b7280" />
                  <TextInput
                      style={styles.floatingSearchInput}
                      placeholder="Search Menu"
                      placeholderTextColor="#9ca3af"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      returnKeyType="search"
                  />
                  {searchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchQuery('')}>
                          <X size={18} color="#6b7280" />
                      </TouchableOpacity>
                  )}
              </View>
              <TouchableOpacity style={styles.floatingMenuButton} onPress={() => setIsMenuModalVisible(true)}>
                  <Text style={styles.floatingMenuText}>Menu</Text>
              </TouchableOpacity>
          </View>
      )}

      {/* Categories Modal */}
      <Modal visible={isMenuModalVisible} transparent={true} animationType="fade">
          <TouchableOpacity 
              style={styles.modalOverlay} 
              activeOpacity={1} 
              onPress={() => setIsMenuModalVisible(false)}
          >
              <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Menu</Text>
                      <TouchableOpacity onPress={() => setIsMenuModalVisible(false)} style={styles.modalCloseBtn}>
                          <X size={20} color="#000" />
                      </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.modalScroll}>
                      {categories.map(category => (
                          <TouchableOpacity 
                              key={category.id} 
                              style={styles.modalCategoryItem} 
                              onPress={() => {
                                  navigation.navigate('CategoryProducts', { category });
                                  setIsMenuModalVisible(false);
                              }}
                          >
                              <Text style={[styles.modalCategoryText, activeTab === category.id && styles.modalCategoryTextActive]}>
                                  {category.name}
                              </Text>
                              <Text style={styles.modalCategoryCount}>
                                  ({category.products?.length || 0})
                              </Text>
                          </TouchableOpacity>
                      ))}
                  </ScrollView>
              </TouchableOpacity>
          </TouchableOpacity>
      </Modal>

      </ScreenContainer>
  );
};

// Helper Components

const TabItem = ({ name, active, onPress }: any) => (
    <TouchableOpacity 
        style={[styles.tabItemPill, active && styles.tabItemPillActive]} 
        onPress={onPress}
    >
        <Text style={[styles.tabTextPill, active && styles.tabTextPillActive]} numberOfLines={1}>
            {name}
        </Text>
    </TouchableOpacity>
);

// MenuItem component removed and replaced with shared component in ../components/MenuItem

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  containerStyleOverride: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
  },
  messageText: {
      fontSize: 16,
      color: '#6b7280',
      textAlign: 'center',
      marginBottom: 16,
  },
  selectStoreBtn: {
      backgroundColor: '#3c7d48',
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
  },
  selectStoreBtnText: {
      color: '#fff',
      fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  brandName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#000',
  },
  locationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
  },
  locationDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#3c7d48',
      marginRight: 4,
  },
  locationText: {
      fontSize: 10,
      color: '#3c7d48',
      fontWeight: '600',
  },
  headerRight: {
      flexDirection: 'row',
      gap: 12,
  },
  iconBtn: {
      padding: 10,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f3f4f6',
      borderRadius: 20,
  },
  tabContainer: {
      backgroundColor: '#fff',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
  },
  tabScroll: {
      paddingHorizontal: 16,
      gap: 12,
  },
  tabItemPill: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#e5e7eb',
      backgroundColor: '#fff',
  },
  tabItemPillActive: {
      borderColor: '#3c7d48',
      backgroundColor: 'rgba(60, 125, 72, 0.08)',
  },
  tabTextPill: {
      fontSize: 13,
      fontWeight: '600',
      color: '#6b7280',
  },
  tabTextPillActive: {
      color: '#3c7d48',
  },
  content: {
      padding: 16,
      paddingBottom: 20, // Reduced padding since the bottom bar is no longer floating above
  },
  listSection: {
      marginBottom: 24,
  },
  sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#000',
  },
  itemCount: {
      fontSize: 10,
      color: '#9ca3af',
      fontWeight: '600',
  },
// MenuItem styles removed as they are now in the shared MenuItem component
  searchHeaderContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
  },
  searchBox: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f3f4f6',
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 40,
  },
  searchInput: {
      flex: 1,
      fontSize: 14,
      color: '#000',
      paddingVertical: 0,
  },
  cancelBtn: {
      padding: 4,
  },
  cancelText: {
      color: '#3c7d48',
      fontSize: 14,
      fontWeight: '600',
  },
  anchoredBottomBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      paddingHorizontal: 12,
      paddingVertical: 4,
      backgroundColor: '#fff',
      borderTopWidth: 1,
      borderTopColor: '#f3f4f6',
      zIndex: 10,
  },
  floatingSearchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f3f4f6',
      borderRadius: 12,
      paddingHorizontal: 10,
      height: 38,
  },
  floatingSearchInput: {
      flex: 1,
      fontSize: 12,
      color: '#000',
      marginLeft: 8,
      paddingVertical: 0,
  },
  floatingMenuButton: {
      backgroundColor: '#374151',
      height: 38,
      paddingHorizontal: 16,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
  },
  floatingMenuText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: 'bold',
  },
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  modalContent: {
      width: '85%',
      maxHeight: '70%',
      backgroundColor: '#fff',
      borderRadius: 24,
      padding: 24,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 20,
      elevation: 10,
  },
  modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
  },
  modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#000',
  },
  modalCloseBtn: {
      padding: 4,
      backgroundColor: '#f3f4f6',
      borderRadius: 20,
  },
  modalScroll: {
      flexGrow: 0,
  },
  modalCategoryItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
  },
  modalCategoryText: {
      fontSize: 16,
      color: '#4b5563',
  },
  modalCategoryTextActive: {
      color: '#3c7d48',
      fontWeight: 'bold',
  },
  modalCategoryCount: {
      fontSize: 14,
      color: '#6b7280',
      fontWeight: '600',
  },
});

export default MenuScreen;
