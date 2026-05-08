import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  RefreshControl,
  Modal,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { RouteProp, useRoute } from '@react-navigation/native';
import {
  Search,
  X,
  ChevronDown,
  ChevronLeft,
  ShoppingCart,
  Info,
  Clock,
  MapPin,
  Share2,
  SlidersHorizontal,
  Box,
  Sparkles,
  Check,
  Star,
  TrendingUp,
  BadgePercent,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
} from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import MenuSkeleton from '../components/MenuSkeleton';
import {
  categoryService,
  Category,
} from '../services/categoryService';
import { storeService } from '../services/storeService';
import FloatingCart from '../components/FloatingCart';
import MenuItem from '../components/MenuItem';
import { getTabHeight } from '../utils/constants';

const { width } = Dimensions.get('window');

const MenuScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route =
    useRoute<RouteProp<{ params: { categoryId?: number } }, 'params'>>();
  const { categoryId: targetCategoryId } = route.params || {};

  const { selectedStore, setSelectedStore } = useStore();
  const { totalItems } = useCart();
  const insets = useSafeAreaInsets();
  const tabHeight = getTabHeight(insets.bottom);
  const lastFetchedStoreId = useRef<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<number | null>(null);

  // Search & Modal state
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuModalVisible, setIsMenuModalVisible] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  const [activeSort, setActiveSort] = useState<string | null>(null);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Simple scroll ref to jump to sections (visual only for MVP)
  const scrollViewRef = useRef<ScrollView>(null);
  const tabsScrollViewRef = useRef<ScrollView>(null);
  const sectionPositions = useRef<{ [key: number]: number }>({});
  const tabPositions = useRef<{ [key: number]: number }>({});
  const isTabPress = useRef(false);

  const fetchCategories = useCallback(async (force = false) => {
    // Skip if we already have categories for this store
    if (!force && selectedStore?.id === lastFetchedStoreId.current && categories.length > 0) {
        setLoading(false);
        return;
    }

    setLoading(true);
    let currentStore = selectedStore;

    if (!currentStore) {
      try {
        const stores = await storeService.getAllStores();
        if (stores && stores.length > 0) {
          const richmondStore = stores.find(s => 
            (s.name && s.name.toLowerCase().includes('richmond')) || 
            (s.city && s.city.toLowerCase().includes('richmond'))
          );
          currentStore = richmondStore || stores[0];
          setSelectedStore(currentStore);
        }
      } catch (err) {
        console.error("Failed to load default store:", err);
      }
    }

    if (!currentStore?.id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const data = await categoryService.getCategories(currentStore.id);
      setCategories(data);
      if (data.length > 0 && !activeTab) {
        setActiveTab(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch categories', error);
      Alert.alert('Error', 'Failed to load menu. Please try again.');
    } finally {
      lastFetchedStoreId.current = currentStore?.id || null;
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedStore, activeTab, setSelectedStore, categories.length]);

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [fetchCategories])
  );

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Explicitly set loading to true to trigger skeleton
    setLoading(true);
    fetchCategories(true);
  }, [fetchCategories]);

  const scrollToActiveTab = (categoryId: number) => {
    const x = tabPositions.current[categoryId];
    if (tabsScrollViewRef.current && x !== undefined) {
      // Center the tab: x - (screenWidth / 2) + (tabWidth / 2)
      // Assuming tab width is approx 70
      const scrollX = x - width / 2 + 35;
      tabsScrollViewRef.current.scrollTo({
        x: Math.max(0, scrollX),
        animated: true,
      });
    }
  };

  const handleTabPress = useCallback((categoryId: number, animated = true) => {
    setActiveTab(categoryId);
    isTabPress.current = true;
    const y = sectionPositions.current[categoryId];

    if (scrollViewRef.current && y !== undefined) {
      // Add small offset for sticky header / visuals
      const offset = Math.max(0, y - 280); // Adjust offset for large header
      scrollViewRef.current.scrollTo({ y: offset, animated });
    }
    scrollToActiveTab(categoryId);

    // Reset flag after animation
    setTimeout(() => {
      isTabPress.current = false;
    }, 1000);
  }, [activeTab]);

  const handleScroll = (event: any) => {
    if (isTabPress.current) return;

    const scrollY = event.nativeEvent.contentOffset.y;
    const effectiveY = scrollY + 280; // Offset for better detection

    // Find the last category whose position is <= effectiveY
    let currentTab = activeTab;

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

  // Filter and sort categories based on search, active filters, and active sort
  const filteredCategories = useMemo(() => {
    return categories
      .map(category => {
        let filteredProducts = category.products;

        // 1. Search Query Filter
        if (searchQuery.trim()) {
          filteredProducts = filteredProducts.filter(
            p =>
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.description.toLowerCase().includes(searchQuery.toLowerCase()),
          );
        }

        // 2. Modal Filters
        if (activeFilters.length > 0) {
          filteredProducts = filteredProducts.filter(p => {
            let passVeg = true;
            let passBestseller = true;

            const hasVegFilter = activeFilters.includes('Veg');
            const hasNonVegFilter = activeFilters.includes('Non-Veg');

            if (hasVegFilter || hasNonVegFilter) {
              if (hasVegFilter && hasNonVegFilter) {
                passVeg = true;
              } else if (hasVegFilter) {
                passVeg = p.isVeg === true;
              } else if (hasNonVegFilter) {
                passVeg = p.isVeg === false;
              }
            }

            if (activeFilters.includes('Bestseller')) {
              passBestseller = p.isBestseller === true;
            }

            return passVeg && passBestseller;
          });
        }

        // 3. Sorting
        if (activeSort === 'price_asc') {
          filteredProducts = [...filteredProducts].sort((a, b) => a.basePrice - b.basePrice);
        } else if (activeSort === 'price_desc') {
          filteredProducts = [...filteredProducts].sort((a, b) => b.basePrice - a.basePrice);
        } else if (activeSort === 'rating_desc') {
          filteredProducts = [...filteredProducts].sort((a, b) => {
            const ratingA = a.isBestseller ? 5 : 4;
            const ratingB = b.isBestseller ? 5 : 4;
            return ratingB - ratingA;
          });
        }

        return {
          ...category,
          products: filteredProducts,
        };
      })
      .filter(category => category.products?.length > 0);
  }, [categories, searchQuery, activeFilters, activeSort]);

  return (
    <View style={styles.containerStyleOverride}>
      <FocusAwareStatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {loading ? (
        <SafeAreaView style={{flex: 1}} edges={['top']}>
           <MenuSkeleton />
        </SafeAreaView>
      ) : !selectedStore ? (
        <SafeAreaView style={[styles.container, styles.centered]} edges={['top']}>
          <Text style={styles.messageText}>
            Please select a store to view the menu
          </Text>
          <TouchableOpacity
            style={styles.selectStoreBtn}
            onPress={() => navigation.navigate('StoreLocation')}
          >
            <Text style={styles.selectStoreBtnText}>Select Store</Text>
          </TouchableOpacity>
        </SafeAreaView>
      ) : (
        <>
          <ScrollView
            style={{ flex: 1 }}
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#3c7d48']}
                // Add top padding to account for the translucent status bar and cover image
                progressViewOffset={Platform.OS === 'android' ? 10 : 0} 
              />
            }
          >
            {/* Cover Image & Header Info */}
            <View style={styles.headerContainer}>
              <Image 
                source={selectedStore?.image ? { uri: selectedStore.image } : require('../assets/images/pizza_placeholder.jpg')}
                style={styles.coverImage}
              />
              <View style={styles.coverImageOverlay} />

              {/* Top Icons */}
              <View style={[styles.topAbsoluteBar, { top: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.roundIconButton}>
                  <ChevronLeft size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Cart' as any)} style={styles.roundIconButton}>
                  <ShoppingCart size={20} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Overlapping Info Card */}
              <View style={styles.storeCardWrapper}>
                <View style={styles.storeCard}>
                  <View style={styles.storeCardTitleRow}>
                    <View style={styles.storeCardLeft}>
                      <Text style={styles.storeNameText}>La Pino'z Pizza</Text>
                      <Info size={16} color="#6b7280" />
                      <View style={styles.openBadge}>
                        <Text style={styles.openBadgeText}>OPEN</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.shareIconBtn}>
                      <Share2 size={16} color="#374151" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.storeCardMetaRow}>
                    <View style={styles.metaBadge}>
                      <Clock size={12} color="#4b5563" />
                      <Text style={styles.metaText}>30 Minutes</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('StoreLocation')} style={styles.metaBadge}>
                      <MapPin size={12} color="#4b5563" />
                      <Text style={styles.metaText} numberOfLines={1}>{selectedStore ? `${selectedStore.city}, ${selectedStore.state}` : 'Select Location'}</Text>
                      <ChevronDown size={12} color="#4b5563" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Filter Pills */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.filtersScroll} 
              contentContainerStyle={styles.filtersContainer}
            >
              <TouchableOpacity
                style={[styles.filterPill, activeFilters.length > 0 && styles.filterPillActive]}
                onPress={() => setIsFilterModalVisible(true)}
              >
                <SlidersHorizontal size={14} color={activeFilters.length > 0 ? "#3c7d48" : "#374151"} />
                <Text style={[styles.filterPillText, activeFilters.length > 0 && styles.filterPillTextActive]}>
                  Filter {activeFilters.length > 0 ? `(${activeFilters.length})` : ''}
                </Text>
                <ChevronDown size={14} color={activeFilters.length > 0 ? "#3c7d48" : "#374151"} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterPill, activeSort === 'price_asc' && styles.filterPillActive]}
                onPress={() => setActiveSort(activeSort === 'price_asc' ? null : 'price_asc')}
              >
                <Text style={[styles.filterPillText, activeSort === 'price_asc' && styles.filterPillTextActive]}>Price low to high</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterPill, activeSort === 'price_desc' && styles.filterPillActive]}
                onPress={() => setActiveSort(activeSort === 'price_desc' ? null : 'price_desc')}
              >
                <Text style={[styles.filterPillText, activeSort === 'price_desc' && styles.filterPillTextActive]}>Price high to low</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterPill, activeSort === 'rating_desc' && styles.filterPillActive]}
                onPress={() => setActiveSort(activeSort === 'rating_desc' ? null : 'rating_desc')}
              >
                <Text style={[styles.filterPillText, activeSort === 'rating_desc' && styles.filterPillTextActive]}>Rating high to low</Text>
              </TouchableOpacity>

              {categories.find(c => c.id === activeTab)?.subcategories?.map(sub => (
                <TouchableOpacity key={sub.id} style={styles.filterPill}>
                  <Text style={styles.filterPillText}>{sub.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.listContainer}>
              {filteredCategories.map(category => (
                <View
                  key={category.id}
                  style={styles.listSection}
                  onLayout={event => {
                    sectionPositions.current[category.id] =
                      event.nativeEvent.layout.y + 250; // offset for the header top
                  }}
                >
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{category.name}</Text>
                    <Text style={styles.itemCount}>
                      {category.products ? category.products.length : 0} ITEMS
                    </Text>
                  </View>
                  {category.products &&
                    category.products.map(item => (
                      <MenuItem
                        key={item.id}
                        item={item}
                        onTap={() =>
                          navigation.navigate('ProductDetail', { item })
                        }
                      />
                    ))}
                </View>
              ))}

              {filteredCategories.length === 0 && !loading && (
                <View style={styles.centered}>
                  <Text style={styles.messageText}>
                    {searchQuery
                      ? `No items found matching "${searchQuery}"`
                      : 'No menu items found for this store.'}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Bottom Action Area: Search + Menu Bar, THEN Floating Cart Below it */}
          <View style={[styles.bottomActionContainer, { bottom: 0 }]}>
            {/* Search & Menu Bar */}
            <View style={[styles.searchMenuBottomBar, totalItems === 0 && { paddingBottom: Math.max(insets.bottom, 12) }]}>
              <View style={styles.bottomSearchContainer}>
                <Search size={18} color="#9ca3af" />
                <TextInput
                  ref={searchInputRef}
                  style={styles.bottomSearchInput}
                  placeholder="Search your favorite..."
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
              <TouchableOpacity
                style={styles.bottomMenuBtn}
                onPress={() => setIsMenuModalVisible(true)}
              >
                <Text style={styles.bottomMenuBtnText}>Menu</Text>
              </TouchableOpacity>
            </View>
            
            {/* The Floating Cart is placed underneath the Search/Menu bar */}
            <FloatingCart />
          </View>
        </>
      )}

      {/* Categories Modal */}
      <Modal
        visible={isMenuModalVisible}
        transparent={true}
        animationType="fade"
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsMenuModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Menu</Text>
              <TouchableOpacity
                onPress={() => setIsMenuModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <X size={20} color="#000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.modalCategoryItem}
                  onPress={() => {
                    handleTabPress(category.id, true);
                    setIsMenuModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalCategoryText,
                      activeTab === category.id &&
                        styles.modalCategoryTextActive,
                    ]}
                  >
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

      {/* Filters Bottom Sheet  */}
      <Modal
        visible={isFilterModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlayBottomSheet}>
          <TouchableOpacity 
            style={styles.modalOverlayTouchable} 
            activeOpacity={1} 
            onPress={() => setIsFilterModalVisible(false)} 
          />
          <View style={styles.bottomSheetContent}>
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>Filters and Sorting</Text>
              <TouchableOpacity
                onPress={() => setIsFilterModalVisible(false)}
                style={styles.bottomSheetCloseBtn}
              >
                <X size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.bottomSheetScrollContent} showsVerticalScrollIndicator={false}>
              {/* Sort By Section */}
              <View style={styles.filterSectionCard}>
                <Text style={styles.filterSectionTitle}>Sort by</Text>
                <View style={styles.filterPillWrap}>
                  <TouchableOpacity 
                    style={[styles.modalFilterPill, activeSort === 'price_asc' && styles.modalFilterPillActive]}
                    onPress={() => setActiveSort(activeSort === 'price_asc' ? null : 'price_asc')}
                  >
                    <ArrowUpNarrowWide size={14} color={activeSort === 'price_asc' ? "#3c7d48" : "#374151"} />
                    <Text style={[styles.modalFilterPillText, activeSort === 'price_asc' && styles.modalFilterPillTextActive]}>Price - Low to High</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalFilterPill, activeSort === 'price_desc' && styles.modalFilterPillActive]}
                    onPress={() => setActiveSort(activeSort === 'price_desc' ? null : 'price_desc')}
                  >
                    <ArrowDownWideNarrow size={14} color={activeSort === 'price_desc' ? "#3c7d48" : "#374151"} />
                    <Text style={[styles.modalFilterPillText, activeSort === 'price_desc' && styles.modalFilterPillTextActive]}>Price - High to Low</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modalFilterPill, activeSort === 'rating_desc' && styles.modalFilterPillActive]}
                    onPress={() => setActiveSort(activeSort === 'rating_desc' ? null : 'rating_desc')}
                  >
                    <Star size={14} color={activeSort === 'rating_desc' ? "#3c7d48" : "#000"} fill={activeSort === 'rating_desc' ? "#3c7d48" : "#000"} />
                    <Text style={[styles.modalFilterPillText, activeSort === 'rating_desc' && styles.modalFilterPillTextActive]}>Rating - High to Low</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Top Picks Section */}
              <View style={styles.filterSectionCard}>
                <Text style={styles.filterSectionTitle}>Top Picks</Text>
                <View style={styles.filterPillWrap}>
                  {[
                    { id: 'In Stock', text: 'In Stock', icon: <Box size={14} color="#374151" /> },
                    { id: 'What\'s New!', text: 'What\'s New!', icon: null },
                    { id: 'Bestseller', text: 'Bestseller', icon: null },
                    { id: 'Highly Ordered', text: 'Highly Ordered', icon: <TrendingUp size={14} color="#374151" /> },
                    { id: 'Rated 4+', text: 'Rated 4+', icon: null },
                    { id: 'On Offer', text: 'On Offer', icon: <BadgePercent size={14} color="#3c7d48" /> }, // Keeping color specific if needed, or dynamically
                  ].map(option => {
                    const isActive = activeFilters.includes(option.id);
                    // Dynamically set icon color based on active state if it exists
                    const renderIcon = () => {
                      if (!option.icon) return null;
                      // React clone element to override color
                      return React.cloneElement(option.icon as React.ReactElement<any>, { 
                        color: isActive ? "#3c7d48" : (option.text === 'On Offer' && !isActive ? "#3c7d48" : "#374151") 
                      });
                    };

                    return (
                      <TouchableOpacity
                        key={option.id}
                        style={[styles.modalFilterPill, isActive && styles.modalFilterPillActive]}
                        onPress={() => {
                          if (isActive) {
                            setActiveFilters(activeFilters.filter(f => f !== option.id));
                          } else {
                            setActiveFilters([...activeFilters, option.id]);
                          }
                        }}
                      >
                        {renderIcon()}
                        <Text style={[styles.modalFilterPillText, isActive && styles.modalFilterPillTextActive]}>
                          {option.text}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            <View style={styles.bottomSheetActionRow}>
              <TouchableOpacity 
                style={styles.bottomSheetClearBtn}
                onPress={() => {
                  setActiveFilters([]);
                  setActiveSort(null);
                }}
              >
                <Text style={styles.bottomSheetClearBtnText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.bottomSheetApplyBtn}
                onPress={() => setIsFilterModalVisible(false)}
              >
                <Text style={styles.bottomSheetApplyBtnText}>Apply ({activeFilters.length + (activeSort ? 1 : 0)})</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6', // Light grey background
  },
  containerStyleOverride: {
    flex: 1,
    backgroundColor: '#f3f4f6', 
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
  content: {
    paddingBottom: 200, // Extra padding to scroll past the floating bottom section
  },
  headerContainer: {
    position: 'relative',
    height: 250,
  },
  coverImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  coverImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.2)', // Darken image slightly for contrast
  },
  topAbsoluteBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  roundIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeCardWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
  },
  storeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  storeCardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  storeCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  storeNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  openBadge: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#10b981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  openBadgeText: {
    color: '#10b981',
    fontSize: 10,
    fontWeight: 'bold',
  },
  shareIconBtn: {
    padding: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
  },
  storeCardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '500',
  },
  filtersScroll: {
    marginTop: 12,
    marginBottom: 4,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    gap: 10,
    alignItems: 'center',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 40,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
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
  bottomActionContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 20,
  },
  searchMenuBottomBar: {
    backgroundColor: '#fff', 
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  bottomSearchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  bottomSearchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#000',
  },
  bottomMenuBtn: {
    backgroundColor: '#374151', // Dark gray almost black
    borderRadius: 12,
    paddingHorizontal: 20,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomMenuBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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
  filterPillActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#3c7d48',
  },
  filterPillTextActive: {
    color: '#3c7d48',
  },
  // Bottom Sheet Styles for Filter
  modalOverlayBottomSheet: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomSheetContent: {
    backgroundColor: '#f3f4f6', // Light grey background like in image
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  bottomSheetCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheetScrollContent: {
    padding: 16,
    paddingBottom: 100, // Make room for fixed bottom row
  },
  filterSectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  filterPillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  modalFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8, // Less rounded in the image than the top level pills
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    gap: 6,
  },
  modalFilterPillActive: {
    borderColor: '#3c7d48',
    backgroundColor: '#f6fbf7',
  },
  modalFilterPillText: {
    fontSize: 14,
    color: '#1f2937',
  },
  modalFilterPillTextActive: {
    color: '#3c7d48',
  },
  bottomSheetActionRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 24, // extra for safe area on iOS
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    gap: 12,
  },
  bottomSheetClearBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  bottomSheetClearBtnText: {
    color: '#374151',
    fontWeight: '500',
    fontSize: 16,
  },
  bottomSheetApplyBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#105022', // Deeper green based on image
    alignItems: 'center',
  },
  bottomSheetApplyBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MenuScreen;
