
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Dimensions,
  TextInput,
  ImageBackground,
  FlatList,
  RefreshControl,
  Linking,
  ScrollView,
} from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import React, { useRef, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import {
  Pizza,
  User,
  ShoppingCart,
  MapPin,
  Croissant,
  UtensilsCrossed,
  Utensils,
  Martini,
  Soup,
  ChefHat,
  Leaf,
  Trophy,
  Users,
  ArrowRight,
  ChevronDown,
} from 'lucide-react-native';

import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';

import { storeService } from '../services/storeService';
import { categoryService, Category } from '../services/categoryService';
import { productService } from '../services/productService';
import HomeSkeleton from '../components/HomeSkeleton';
import FloatingCart from '../components/FloatingCart';

const { width } = Dimensions.get('window');


const CARD_WIDTH = 240;
const SPACING = 16;

const HomeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { totalItems, addToCart } = useCart();
  const { selectedStore, setSelectedStore } = useStore();
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup'>('delivery');
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  
  useEffect(() => {
    // 1. Set Default Store if none selected
    const initStore = async () => {
      if (!selectedStore) {
        const stores = await storeService.getAllStores();
        if (stores.length > 0) {
          setSelectedStore(stores[0]);
        }
      }
    };
    initStore();
  }, [selectedStore]);

  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    if (selectedStore) {
      try {
        // Fetch Categories
        const cats = await categoryService.getCategories(selectedStore.id);
        setCategories(cats);

        // Fetch Best Sellers
        const best = await productService.getBestSellers(selectedStore.id);
        setBestSellers(best);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [selectedStore]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [selectedStore]);
  
  const flatListRef = useRef<FlatList<any>>(null);
  const scrollIndexRes = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Don't auto-scroll if there are no items or list is not ready
      if (!flatListRef.current || bestSellers.length === 0) return;

      let nextIndex = scrollIndexRes.current + 1;
      if (nextIndex >= bestSellers.length) {
         nextIndex = 0;
      }
      
      flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
      scrollIndexRes.current = nextIndex;
    }, 3000); // Increased to 3 seconds for better experience

    return () => clearInterval(interval);
  }, [bestSellers]); // Add dependency on bestSellers

  return (
    <ScreenContainer useScrollView={false} containerStyle={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#3c7d48"
      />
      
      {/* Navbar - Fixed Bottom */}
      {/* Navbar - Handled by TabNavigator now */}

      {isLoading ? (
        <HomeSkeleton />
      ) : (
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3c7d48']} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerLeft} onPress={() => navigation.navigate('StoreLocation' as any)}>
            <Image 
              source={require('../assets/images/logo.png')} 
              style={{ width: 40, height: 40, resizeMode: 'contain' }}
            />
            <View>
              <Text style={styles.brandName}>{selectedStore ? selectedStore.name : 'Select Outlet'}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 16, color: '#000', fontWeight: '600' }}>{selectedStore ? selectedStore.city : 'Click to select'}</Text>
                <ChevronDown size={18} color="#000" />
              </View>
            </View>
          </TouchableOpacity>
         
        </View>

        {/* Hero Section */}
        <ImageBackground
          source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAT_fev5pujj6i0YT_eyZYIUHLELxKcfyctsEIE0c6kNS3wvf3BeEcMmJKbF6alICfoXEeGtr0zoxpvAXuKR4oDFKRYApwD7OgJiYEtKFxlR21rwF4B4EkWJ1u1ldPiew5Rc7ShjLIDvev0dbAmvRICE52WyFSZXb7rryWmj5V9k2k9IWKKRzET2IWl7aTWWHT67AfNJbM0UIo3BJ9YKVDYfA8k4wfO1Gryg6UIpB2P441wJoqs4t5jclhbnWbbaCpMXabf1zRpaEVE' }}
          style={styles.hero}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay}>
             <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>Serving Over</Text>
                <Text style={[styles.heroTitle, { color: '#3c7d48' }]}>600+ Locations.</Text>
                <TouchableOpacity style={styles.orderButton} onPress={() => navigation.navigate('Menu' as any)}>
                  <Text style={styles.orderButtonText}>Order Now</Text>
                </TouchableOpacity>
             </View>
          </View>
        </ImageBackground>

        {/* Search & Toggle Box */}
        <View style={styles.searchSectionWrapper}>
            <View style={styles.searchContainer}>
                <View style={styles.toggleContainer}>
                    <TouchableOpacity 
                        style={[styles.toggleButton, deliveryMode === 'delivery' && styles.toggleActive]}
                        onPress={() => setDeliveryMode('delivery')}
                    >
                        <Text style={[styles.toggleText, deliveryMode === 'delivery' && styles.toggleTextActive]}>Delivery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.toggleButton, deliveryMode === 'pickup' && styles.toggleActive]}
                        onPress={() => setDeliveryMode('pickup')}
                    >
                        <Text style={[styles.toggleText, deliveryMode === 'pickup' && styles.toggleTextActive]}>Pickup</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.inputContainer}>
                    <MapPin size={20} color="#3c7d48" style={styles.inputIcon} />
                    <TextInput 
                        placeholder="Enter your delivery location" 
                        style={styles.input}
                        placeholderTextColor="#9ca3af"
                    />
                </View>
            </View>
        </View>



        {/* Best Sellers */}
        {bestSellers.length > 0 && (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Our Best Sellers</Text>
                <TouchableOpacity>
                     <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                ref={flatListRef}
                data={bestSellers}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.bestSellerScroll}
                renderItem={({ item }) => (
                    <BestSellerCard 
                        item={{
                            ...item,
                            image: item.imageUrl || item.image, // Handle API property name
                            description: item.description || 'Delicious pizza',
                            price: item.basePrice || item.price 
                        }}
                        onAdd={() => navigation.navigate('ProductDetail' as any, { item })}
                    />
                )}
                snapToInterval={CARD_WIDTH + SPACING}
                decelerationRate="fast"
            />
        </View>
        )}

        {/* Explore Menu */}
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { textTransform: 'uppercase', textAlign: 'center', marginVertical: 8 }]}>Explore Menu</Text>
            <View style={styles.exploreGrid}>
                {categories.map((cat, index) => {
                    return (
                        <ExploreGridCard
                            key={cat.id}
                            category={cat}
                            onPress={() => navigation.navigate('CategoryProducts' as any, { category: cat })}
                        />
                    );
                })}
            </View>
        </View>

        {/* Our Story */}
        <View style={styles.section}>
            <ImageBackground 
                source={{ uri: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1000&auto=format&fit=crop' }}
                style={styles.storyContainer}
                imageStyle={{ borderRadius: 24, opacity: 0.15 }}
            >
                <View style={styles.storyOverlay}>
                    <View style={styles.storyHeaderRow}>
                        <View style={styles.storyHeader}>
                            <Trophy size={18} color="#ffbe33" />
                            <Text style={styles.eyebrow}>OUR STORY</Text>
                        </View>
                        <View style={styles.estBadge}>
                            <Text style={styles.estText}>Since 2011</Text>
                        </View>
                    </View>
                    
                    <Text style={styles.storyTitle}>Our journey from one small outlet to <Text style={{ color: '#ffbe33' }}>Global Icon.</Text></Text>
                    
                    <Text style={styles.storyText}>
                        We started with a simple promise: to serve the freshest, tastiest pizzas. Today, we're proud to be India's favorite.
                    </Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <View style={styles.statIconContainer}>
                                <MapPin size={22} color="#3c7d48" />
                            </View>
                            <View>
                                <Text style={styles.statNumber}>600+</Text>
                                <Text style={styles.statLabel}>OUTLETS</Text>
                            </View>
                        </View>
                        <View style={styles.statBox}>
                            <View style={[styles.statIconContainer, { backgroundColor: '#fff7ed' }]}>
                                <Users size={22} color="#f97316" />
                            </View>
                            <View>
                                <Text style={[styles.statNumber, { color: '#f97316' }]}>10M+</Text>
                                <Text style={styles.statLabel}>CUSTOMERS</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.learnMoreRow} onPress={() => Linking.openURL('https://www.lapinozusa.com/about')}>
                        <Text style={styles.learnMoreText}>Read our full story</Text>
                        <ArrowRight size={16} color="#ffbe33" />
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </View>
        
        {/* Our Promise */}
        <View style={styles.section}>
             <View style={styles.centerHeader}>
                 <Text style={styles.eyebrow}>OUR PROMISE</Text>
                 <Text style={styles.sectionTitle}>7-Star Quality Every Bite</Text>
             </View>
             <View style={{ gap: 16, marginTop: 16 }}>
                <PromiseItem 
                    icon={<ChefHat size={24} color="#d97706" />}
                    title="Freshly Kneaded Dough"
                    desc="Prepared fresh in-store, every single morning."
                    iconBgColor="#fffbeb"
                />
                <PromiseItem 
                    icon={<Leaf size={24} color="#16a34a" />}
                    title="Farm Fresh Toppings"
                    desc="Locally sourced vegetables for high taste."
                    iconBgColor="#dcfce7"
                />
                <PromiseItem 
                    icon={<Soup size={24} color="#dc2626" />}
                    title="Signature Sauces"
                    desc="Secret blend of herbs and zest."
                    iconBgColor="#fee2e2"
                />
             </View>
        </View>
      </ScrollView>
      )}
      <FloatingCart />
    </ScreenContainer>
  );
};

// Helper Components

const CategoryItem = ({icon, name, active, onPress}: {icon: React.ReactNode, name: string, active?: boolean, onPress?: () => void}) => (
    <TouchableOpacity style={styles.categoryItem} onPress={onPress}>
        <View style={[styles.categoryIcon, active && styles.categoryIconActive]}>
            {icon}
        </View>
        <Text style={[styles.categoryName, active ? {fontWeight: '700', color: '#000'} : {color: '#6b7280'}]}>{name}</Text>
    </TouchableOpacity>
);

const BestSellerCard = ({item, onAdd}: {item: any, onAdd: () => void}) => (
    <View style={styles.bestSellerCard}>
        <Image source={{uri: item.image}} style={styles.bsImage} />
        <View style={styles.bsContent}>
            <Text style={styles.bsName}>{item.name}</Text>
            <Text style={styles.bsDesc} numberOfLines={1}>{item.description}</Text>
            <View style={styles.bsFooter}>
                <Text style={styles.bsPrice}>${item.price}</Text>
                <TouchableOpacity style={styles.addButton} onPress={onAdd}>
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
            </View>
        </View>
    </View>
);

const ExploreGridCard = ({category, tagText, tagColor, onPress}: any) => (
    <TouchableOpacity style={styles.exploreGridCard} onPress={onPress} activeOpacity={0.9}>
        <View style={styles.exploreGridImageContainer}>
            <ImageBackground 
                source={category.imageUrl ? { uri: category.imageUrl } : require('../assets/images/pizza_placeholder.jpg')} 
                style={styles.exploreGridImage}
                imageStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, resizeMode: category.imageUrl ? 'cover' : 'contain' }}
            >
                {tagText ? (
                    <View style={[styles.exploreGridTag, { backgroundColor: tagColor }]}>
                        <Text style={styles.exploreGridTagText}>{tagText}</Text>
                    </View>
                ) : null}
            </ImageBackground>
            <View style={styles.exploreGridFooter}>
                <Text style={styles.exploreGridTitle} numberOfLines={2}>
                    {category.name}
                </Text>
            </View>
        </View>
    </TouchableOpacity>
);

const PromiseItem = ({icon, title, desc, iconBgColor}: any) => (
    <View style={styles.promiseCard}>
        <View style={[styles.promiseIconBox, { backgroundColor: iconBgColor || '#f0fdf4' }]}>
            {icon}
        </View>
        <View style={{flex: 1}}>
            <Text style={styles.promiseTitle}>{title}</Text>
            <Text style={styles.promiseDesc}>{desc}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfbfb',
  },
  scrollContent: {
    paddingBottom: 20, // Reduced from 80
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoContainer: {
    /* No specialized style needed */
  },
  brandName: {
    fontSize: 10,
    fontWeight: '500',
    color: '#000',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#3c7d48',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  hero: {
    width: '100%',
    height: 320,
    justifyContent: 'center',
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  heroContent: {
      gap: 12,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 44,
  },
  orderButton: {
    backgroundColor: '#3c7d48',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchSectionWrapper: {
      marginTop: -32,
      paddingHorizontal: 16,
      marginBottom: 32,
  },
  searchContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: '#3c7d48',
    shadowColor: '#3c7d48',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  toggleTextActive: {
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  categoryScroll: {
    gap: 24,
    paddingBottom: 8,
  },
  categoryItem: {
    alignItems: 'center',
    gap: 8,
    minWidth: 70,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconActive: {
    backgroundColor: 'rgba(60, 125, 72, 0.1)',
    borderWidth: 2,
    borderColor: '#3c7d48',
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAll: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3c7d48',
  },
  bestSellerScroll: {
    gap: 16,
    paddingBottom: 16,
  },
  bestSellerCard: {
    width: 240,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bsImage: {
    width: '100%',
    height: 128,
    resizeMode: 'cover',
  },
  bsContent: {
    padding: 12,
  },
  bsName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  bsDesc: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
  },
  bsFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
  },
  bsPrice: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#3c7d48',
  },
  addButton: {
      backgroundColor: '#3c7d48',
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderRadius: 8,
  },
  addButtonText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
  },
  exploreGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
      marginTop: 8,
  },
  exploreGridCard: {
      width: '31%', // roughly 1/3 minus gap
      backgroundColor: '#fff',
      borderRadius: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 3,
      borderWidth: 1,
      borderColor: '#f3f4f6',
      minHeight: 140,
  },
  exploreGridImageContainer: {
      flex: 1,
      alignItems: 'center',
      padding: 4,
  },
  exploreGridImage: {
      width: '100%',
      aspectRatio: 1, // square image area
      justifyContent: 'flex-start',
      alignItems: 'flex-end',
  },
  exploreGridTag: {
      paddingHorizontal: 6,
      paddingVertical: 4,
      borderBottomLeftRadius: 8,
      borderTopRightRadius: 12,
  },
  exploreGridTagText: {
      color: '#fff',
      fontSize: 7,
      fontWeight: 'bold',
      textTransform: 'uppercase',
  },
  exploreGridFooter: {
      paddingVertical: 8,
      paddingHorizontal: 4,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
  },
  exploreGridTitle: {
      fontSize: 11,
      fontWeight: '600',
      textAlign: 'center',
      color: '#374151',
  },
  storyContainer: {
      backgroundColor: '#1a472a', // Even deeper, more premium green
      borderRadius: 24,
      overflow: 'hidden',
  },
  storyOverlay: {
    padding: 24,
    backgroundColor: 'rgba(60, 125, 72, 0.6)', // Forest green overlay
  },
  storyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  estBadge: {
    backgroundColor: 'rgba(255,190,51,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,190,51,0.4)',
  },
  estText: {
    color: '#ffbe33',
    fontSize: 10,
    fontWeight: 'bold',
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyebrow: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#ffbe33', // Golden color
      textTransform: 'uppercase',
      letterSpacing: 1.5,
  },
  storyTitle: {
      fontSize: 26,
      fontWeight: '900',
      color: '#fff',
      marginBottom: 12,
      lineHeight: 32,
      letterSpacing: -0.5,
  },
  storyText: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.9)',
      lineHeight: 22,
      marginBottom: 24,
  },
  statsRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
  },
  statBox: {
      flex: 1,
      backgroundColor: '#fff',
      padding: 10,
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
  },
  statIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: '#f0fdf4',
      justifyContent: 'center',
      alignItems: 'center',
  },
  statNumber: {
      fontSize: 20,
      fontWeight: '900',
      color: '#3c7d48',
  },
  statLabel: {
      fontSize: 9,
      fontWeight: 'bold',
      color: '#6b7280',
      textTransform: 'uppercase',
  },
  learnMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  learnMoreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
    textDecorationColor: '#ffbe33',
  },
  centerHeader: {
      alignItems: 'center',
      marginBottom: 8,
  },
  promiseCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      backgroundColor: '#fff',
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#f3f4f6',
      shadowColor: '#000',
      shadowOpacity: 0.02,
      shadowRadius: 4,
  },
  promiseIconBox: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(60, 125, 72, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
  },
  promiseTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#000',
  },
  promiseDesc: {
      fontSize: 11,
      color: '#6b7280',
  },
  appBanner: {
      backgroundColor: '#0b1219',
      borderRadius: 24,
      padding: 24,
      overflow: 'hidden',
      position: 'relative',
      minHeight: 200,
  },
  appContent: {
      position: 'relative',
      zIndex: 10,
      width: '60%',
  },
  appTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 8,
  },
  appDesc: {
      fontSize: 12,
      color: '#9ca3af',
      marginBottom: 24,
  },
  appButtons: {
      flexDirection: 'row',
      gap: 12,
  },
  appBtn: {
      backgroundColor: '#fff',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
  },
  appBtnText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: '#4b5563',
  },
  appImage: {
      position: 'absolute',
      bottom: -40,
      right: -20,
      width: 140,
      height: 180,
      transform: [{rotate: '-5deg'}],
  },
});

export default HomeScreen;
