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
import PageLayout from '../components/PageLayout';
import MenuSkeleton from '../components/MenuSkeleton';
import { categoryService, Category, Product } from '../services/categoryService';

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
  
  // Search state
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleSearchToggle = () => {
      if (isSearchVisible) {
          setIsSearchVisible(false);
          setSearchQuery('');
      } else {
          setIsSearchVisible(true);
          // Focus input after render
          setTimeout(() => searchInputRef.current?.focus(), 100);
      }
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
    <PageLayout>
      {/* Header */}
      <View style={styles.header}>
        {isSearchVisible ? (
             <View style={styles.searchHeaderContainer}>
                 <View style={styles.searchBox}>
                     <Search size={18} color="#6b7280" style={{ marginRight: 8 }} />
                     <TextInput
                        ref={searchInputRef}
                        style={styles.searchInput}
                        placeholder="Search for items..."
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                     />
                     {searchQuery.length > 0 && (
                         <TouchableOpacity onPress={() => setSearchQuery('')}>
                             <X size={16} color="#6b7280" />
                         </TouchableOpacity>
                     )}
                 </View>
                 <TouchableOpacity onPress={handleSearchToggle} style={styles.cancelBtn}>
                     <Text style={styles.cancelText}>Cancel</Text>
                 </TouchableOpacity>
             </View>
        ) : (
            <>
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
                <View style={styles.headerRight}>
                <TouchableOpacity style={styles.iconBtn} onPress={handleSearchToggle}>
                    <Search size={20} color="#374151" />
                </TouchableOpacity>
                </View>
            </>
        )}
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
            {/* Category Tabs */}
            <View style={styles.tabContainer}>
                <ScrollView 
                    ref={tabsScrollViewRef}
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={styles.tabScroll}
                >
                    {filteredCategories.map(category => (
                        <View 
                            key={category.id}
                            onLayout={(event) => {
                                tabPositions.current[category.id] = event.nativeEvent.layout.x;
                            }}
                        >
                            <TabItem 
                                imageUrl={category.imageUrl}
                                icon={getCategoryIcon(category.name)}
                                name={category.name} 
                                active={activeTab === category.id} 
                                onPress={() => handleTabPress(category.id)} 
                            />
                        </View>
                    ))}
                </ScrollView>
            </View>

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

    </PageLayout>
  );
};

// Helper Components

const TabItem = ({ icon, imageUrl, name, active, onPress }: any) => (
    <TouchableOpacity style={styles.tabItem} onPress={onPress}>
        <View style={[styles.tabIconContainer, active && styles.tabIconActive]}>
            {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.tabImage} />
            ) : (
                <View style={styles.fallbackIcon}>
                   {React.cloneElement(icon, { color: active ? '#3c7d48' : '#6b7280', size: 24 })}
                </View>
            )}
        </View>
        <Text style={[styles.tabText, active && styles.tabTextActive]} numberOfLines={1}>{name}</Text>
    </TouchableOpacity>
);

const MenuItem = ({ item, onTap }: { item: Product, onTap: () => void }) => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
    const { cartItems, addToCart, removeFromCart } = useCart();
    const { selectedStore } = useStore();
    
    // Check if this specific item ID is in the cart
    const cartItem = cartItems.find(i => i.id === item.id.toString());
    const quantity = cartItem ? cartItem.quantity : 0;
    
    // External link check
    const isExternal = (selectedStore?.state === 'NJ' && selectedStore?.city === 'Iselin') || item.externalLink;

    const handleAdd = () => {
        if (isExternal) {
             const link = item.externalLink || 'https://lapinozpizza.us/order-online/';
             Linking.openURL(link).catch(err => Alert.alert("Error", "Could not open link"));
             return;
        }
        // Instead of adding directly, navigate to details for customization
        navigation.navigate('ProductDetail', { item });
    };

    const handleRemove = () => {
        removeFromCart(item.id.toString());
    };

    return (
        <TouchableOpacity style={styles.menuItem} onPress={onTap} activeOpacity={0.9}>
             <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} style={styles.itemImage} />
             <View style={styles.itemContent}>
                 <View style={styles.vegIndicatorRow}>
                     <Image 
                        source={{ uri: item.isVeg 
                            ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Veg_symbol.svg/1200px-Veg_symbol.svg.png' 
                            : 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Non_veg_symbol.svg/1024px-Non_veg_symbol.svg.png' 
                        }} 
                        style={styles.vegIcon} 
                     />
                     <Text style={styles.itemName}>{item.name}</Text>
                 </View>
                 <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
                 <View style={styles.itemFooter}>
                     <Text style={styles.itemPrice}>${item.basePrice}</Text>
                     
                     {quantity > 0 && !isExternal ? (
                        <View style={styles.qtyContainer}>
                            <TouchableOpacity style={styles.qtyBtnSmall} onPress={handleRemove}>
                                <Text style={styles.qtyBtnText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.qtyTextSmall}>{quantity}</Text>
                            <TouchableOpacity style={styles.qtyBtnSmall} onPress={handleAdd}>
                                <Text style={styles.qtyBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                     ) : (
                        <TouchableOpacity 
                            style={[styles.addButton, isExternal && { backgroundColor: '#ea580c' }]} 
                            onPress={handleAdd}
                        >
                            <Text style={styles.addButtonText}>{isExternal ? 'ORDER' : 'ADD +'}</Text>
                        </TouchableOpacity>
                     )}
                 </View>
             </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
  container: {
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
      paddingVertical: 16,
  },
  tabScroll: {
      paddingHorizontal: 16,
      gap: 16,
  },
  tabItem: {
      alignItems: 'center',
      gap: 8,
      width: 70,
  },
  tabIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#f3f4f6',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: 'transparent',
  },
  tabIconActive: {
      borderColor: '#3c7d48',
      backgroundColor: 'rgba(60, 125, 72, 0.1)',
  },
  tabImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
  },
  fallbackIcon: {
      justifyContent: 'center',
      alignItems: 'center',
  },
  tabText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#6b7280',
      textAlign: 'center',
  },
  tabTextActive: {
      color: '#3c7d48',
      fontWeight: 'bold',
  },
  content: {
      padding: 16,
      paddingBottom: 100, // Add bottom padding for better scrolling
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
  menuItem: {
      flexDirection: 'row',
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#f3f4f6',
      shadowColor: '#000',
      shadowOpacity: 0.02,
      shadowRadius: 4,
      elevation: 2,
  },
  itemImage: {
      width: 100,
      height: 100,
      borderRadius: 12,
      backgroundColor: '#f3f4f6',
  },
  itemContent: {
      flex: 1,
      marginLeft: 12,
      justifyContent: 'center',
  },
  vegIndicatorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
      gap: 6,
  },
  vegIcon: {
      width: 12,
      height: 12,
      resizeMode: 'contain',
  },
  itemName: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#000',
  },
  itemDesc: {
      fontSize: 10,
      color: '#6b7280',
      lineHeight: 14,
      marginBottom: 12,
  },
  itemFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  itemPrice: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#000',
  },
  addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#3c7d48',
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderRadius: 8,
      shadowColor: '#3c7d48',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
  },
  addButtonText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
  },
  qtyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#3c7d48',
      borderRadius: 8,
      height: 32,
      overflow: 'hidden',
  },
  qtyBtnSmall: {
      width: 30,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
  },
  qtyBtnText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: -2,
  },
  qtyTextSmall: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
      marginHorizontal: 2,
      minWidth: 16,
      textAlign: 'center',
  },
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
});

export default MenuScreen;
