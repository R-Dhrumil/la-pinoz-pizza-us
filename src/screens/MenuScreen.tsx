import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SectionList,
  Image,
  Dimensions,
  Alert,
  RefreshControl,
  Modal,
  Platform,
  InteractionManager,
  Animated,
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

// ─── Layout constants for getItemLayout ───────────────────────────────────────
// These must match the actual rendered heights of each component.
// getItemLayout lets RN jump to any section without it needing to be rendered.
const LIST_HEADER_HEIGHT = 304; // headerContainer(250) + filtersScroll(marginTop:12 + pill:38 + marginBottom:4)
const SECTION_HEADER_HEIGHT = 56; // paddingTop:16 + sectionTitle(~24px) + marginBottom:16
const ITEM_HEIGHT = 162;          // padding:10 + imageContainer:105 + marginBottom:12 + paddingBottom:25 + marginBottom:10
// ──────────────────────────────────────────────────────────────────────────────

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
  const categoriesRef = useRef<Category[]>([]);

  useEffect(() => {
    categoriesRef.current = categories;
  }, [categories]);

  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<number | null>(null);

  // Search & Modal state
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuModalVisible, setIsMenuModalVisible] = useState(false);
  const [isModalShimmering, setIsModalShimmering] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  // Shimmer animation for menu modal skeleton
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (isModalShimmering) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(shimmerAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    } else {
      shimmerAnim.stopAnimation();
      shimmerAnim.setValue(0);
    }
  }, [isModalShimmering]);

  const [activeSort, setActiveSort] = useState<string | null>(null);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // ScrollView ref for menu
  const scrollViewRef = useRef<ScrollView>(null);
  const tabsScrollViewRef = useRef<ScrollView>(null);
  const tabPositions = useRef<{ [key: number]: number }>({});
  const isTabPress = useRef(false);
  const categoryPositions = useRef<{ [key: number]: number }>({});

  const fetchCategories = useCallback(async (force = false) => {
    const hasSomething = categoriesRef.current.length > 0;
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
        console.error('Failed to load default store:', err);
      }
    }

    if (!currentStore?.id) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    // Performance Optimization: If store hasn't changed and categories are already loaded, skip fetching!
    if (!force && lastFetchedStoreId.current === currentStore.id && hasSomething) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (!hasSomething) setLoading(true);

    try {
      const data = await categoryService.getCategories(currentStore.id);
      InteractionManager.runAfterInteractions(() => {
        setCategories(data);
        if (data.length > 0) {
          setActiveTab(prev => prev || data[0].id);
        }
        lastFetchedStoreId.current = currentStore?.id || null;
        setLoading(false);
        setRefreshing(false);
      });
    } catch (error) {
      console.error('Failed to fetch categories', error);
      Alert.alert('Error', 'Failed to load menu. Please try again.');
      lastFetchedStoreId.current = currentStore?.id || null;
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedStore, setSelectedStore]);

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

  const handleTabPress = useCallback((categoryId: number, animated = true) => {
    setActiveTab(categoryId);
    scrollToActiveTab(categoryId);
    isTabPress.current = true;

    const yPosition = categoryPositions.current[categoryId];
    if (scrollViewRef.current && yPosition !== undefined) {
      scrollViewRef.current.scrollTo({
        y: yPosition,
        animated,
      });
    }

    setTimeout(() => {
      isTabPress.current = false;
    }, 800);
  }, []);

  const handleScroll = useCallback((event: any) => {
    if (isTabPress.current) return;
    const yOffset = event.nativeEvent.contentOffset.y;

    const positions = Object.entries(categoryPositions.current)
      .map(([id, y]) => ({ id: Number(id), y }))
      .sort((a, b) => a.y - b.y);

    if (positions.length === 0) return;

    let activeId = positions[0].id;
    for (let i = 0; i < positions.length; i++) {
      if (yOffset + 100 >= positions[i].y) {
        activeId = positions[i].id;
      } else {
        break;
      }
    }

    if (activeId !== activeTab) {
      setActiveTab(activeId);
      scrollToActiveTab(activeId);
    }
  }, [activeTab]);

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
          {/* Floating Navigation Header */}
          <View style={[styles.topAbsoluteBar, { top: insets.top + 10, position: 'absolute', left: 16, right: 16, zIndex: 10 }]}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.roundIconButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ChevronLeft size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Cart' as any)} 
              style={styles.roundIconButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <ShoppingCart size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            scrollEventThrottle={16}
            onScroll={handleScroll}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#3c7d48']}
                progressViewOffset={Platform.OS === 'android' ? 10 : 0}
              />
            }
          >
            {/* Cover Image & Header Info */}
            <View style={styles.headerContainer}>
              <Image
                source={(!imageError && selectedStore?.image) ? { uri: selectedStore.image } : require('../assets/images/pizza_placeholder.jpg')}
                style={styles.coverImage}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
              <View style={styles.coverImageOverlay} />
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
                <SlidersHorizontal size={14} color={activeFilters.length > 0 ? '#3c7d48' : '#374151'} />
                <Text style={[styles.filterPillText, activeFilters.length > 0 && styles.filterPillTextActive]}>
                  Filter {activeFilters.length > 0 ? `(${activeFilters.length})` : ''}
                </Text>
                <ChevronDown size={14} color={activeFilters.length > 0 ? '#3c7d48' : '#374151'} />
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

            {/* Menu Items by Category */}
            {filteredCategories.length === 0 ? (
              !loading ? (
                <View style={styles.centered}>
                  <Text style={styles.messageText}>
                    {searchQuery ? `No items found matching "${searchQuery}"` : 'No menu items found for this store.'}
                  </Text>
                </View>
              ) : null
            ) : (
              filteredCategories.map((section) => (
                <View
                  key={section.id}
                  onLayout={(event) => {
                    const { y } = event.nativeEvent.layout;
                    categoryPositions.current[section.id] = y;
                  }}
                >
                  <View style={[styles.sectionHeader, { paddingHorizontal: 16, paddingTop: 16 }]}>
                    <Text style={styles.sectionTitle}>{section.name}</Text>
                    <Text style={styles.itemCount}>{(section.products ?? []).length} ITEMS</Text>
                  </View>
                  <View style={{ paddingHorizontal: 16 }}>
                    {(section.products ?? []).map((item) => (
                      <MenuItem
                        key={item.id}
                        item={item}
                        categoryId={section.id}
                        onTap={() => navigation.navigate('ProductDetail', { item })}
                      />
                    ))}
                  </View>
                </View>
              ))
            )}
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
                onPress={() => {
                  setIsModalShimmering(true);
                  setIsMenuModalVisible(true);
                  setTimeout(() => setIsModalShimmering(false), 400);
                }}
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
              {isModalShimmering
                ? Array.from({ length: 7 }).map((_, i) => {
                    const translateX = shimmerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-250, 250],
                    });
                    return (
                      <View key={i} style={styles.shimmerRow}>
                        <View style={styles.shimmerBase}>
                          <Animated.View
                            style={[
                              styles.shimmerGlow,
                              { transform: [{ translateX }] },
                            ]}
                          />
                        </View>
                        <View style={[styles.shimmerBase, styles.shimmerBadge]}>
                          <Animated.View
                            style={[
                              styles.shimmerGlow,
                              { transform: [{ translateX }] },
                            ]}
                          />
                        </View>
                      </View>
                    );
                  })
                : filteredCategories.map(category => (
                    <TouchableOpacity
                      key={category.id}
                      style={styles.modalCategoryItem}
                      onPress={() => {
                        // Close modal FIRST, then scroll after dismiss animation completes
                        setIsMenuModalVisible(false);
                        setTimeout(() => {
                          handleTabPress(category.id, true);
                        }, 350);
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
                  ))
              }
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
  shimmerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    overflow: 'hidden',
  },
  shimmerBase: {
    height: 16,
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  shimmerBadge: {
    flex: 0,
    width: 36,
    marginLeft: 12,
    borderRadius: 8,
  },
  shimmerGlow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 120,
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 8,
  },
});

export default MenuScreen;
