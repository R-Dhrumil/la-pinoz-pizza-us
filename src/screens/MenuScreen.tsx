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
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import {
  Search,
  User,
  ChevronRight,
  Pizza,
  IceCream,
  Martini,
  Wheat,
  Utensils
} from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import PageLayout from '../components/PageLayout';
import { categoryService, Category, Product } from '../services/categoryService';

const { width } = Dimensions.get('window');

const MenuScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { addToCart, totalItems, totalAmount } = useCart();
  const { selectedStore } = useStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<number | null>(null);

  // Simple scroll ref to jump to sections (visual only for MVP)
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionRefs = useRef<{ [key: number]: View }>({});

  useEffect(() => {
    if (selectedStore?.id) {
        fetchCategories();
    } else {
        setCategories([]);
    }
  }, [selectedStore]);

  const fetchCategories = async () => {
      if (!selectedStore?.id) return;
      
      setLoading(true);
      try {
          const data = await categoryService.getCategories(selectedStore.id);
          setCategories(data);
          if (data.length > 0) {
              setActiveTab(data[0].id);
          }
      } catch (error) {
          console.error("Failed to fetch categories", error);
          Alert.alert("Error", "Failed to load menu. Please try again.");
      } finally {
          setLoading(false);
      }
  };

  const handleTabPress = (categoryId: number) => {
      setActiveTab(categoryId);
      // In a full implementation, this would scroll to the specific section
      // For now, we just update the active tab
  };

  const getCategoryIcon = (categoryName: string) => {
      const lowerName = categoryName.toLowerCase();
      if (lowerName.includes('pizza')) return <Pizza size={18} />;
      if (lowerName.includes('dessert')) return <IceCream size={18} />;
      if (lowerName.includes('beverage') || lowerName.includes('drink')) return <Martini size={18} />;
      if (lowerName.includes('bread')) return <Wheat size={18} />;
      return <Utensils size={18} />;
  };

  return (
    <PageLayout>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandName}>La Pino'z USA</Text>
          <TouchableOpacity 
            style={styles.locationContainer}
            onPress={() => navigation.navigate('StoreLocation')}
          >
             <View style={styles.locationDot} />
             <Text style={styles.locationText}>
               {selectedStore 
                 ? `${selectedStore.city}, ${selectedStore.state}` 
                 : 'Select Location'}
             </Text>
             <ChevronRight size={12} color="#3c7d48" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}><Search size={20} color="#374151" /></TouchableOpacity>
         
        </View>
      </View>

      {loading ? (
          <View style={[styles.container, styles.centered]}>
              <ActivityIndicator size="large" color="#3c7d48" />
          </View>
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
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
                    {categories.map(category => (
                        <TabItem 
                            key={category.id}
                            imageUrl={category.imageUrl}
                            icon={getCategoryIcon(category.name)}
                            name={category.name} 
                            active={activeTab === category.id} 
                            onPress={() => handleTabPress(category.id)} 
                        />
                    ))}
                </ScrollView>
            </View>

            <ScrollView 
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {categories.map(category => (
                    <View key={category.id} style={styles.listSection}>
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
                
                {categories.length === 0 && !loading && (
                    <View style={styles.centered}>
                        <Text style={styles.messageText}>No menu items found for this store.</Text>
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
    
    // Check if this specific item ID is in the cart
    const cartItem = cartItems.find(i => i.id === item.id.toString());
    const quantity = cartItem ? cartItem.quantity : 0;

    const handleAdd = () => {
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
                     
                     {quantity > 0 ? (
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
                        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                            <Text style={styles.addButtonText}>ADD +</Text>
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
});

export default MenuScreen;
