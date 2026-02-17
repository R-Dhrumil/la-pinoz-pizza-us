import React, { useRef, useState } from 'react';
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
} from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import PageLayout from '../components/PageLayout';

const { width } = Dimensions.get('window');

// Mock Data based on the provided image
const VEG_PIZZAS = [
  {
    id: 'v1',
    name: 'Farm Villa Pizza',
    description: 'Spiced paneer, capsicum, onion, and red paprika on a buttery crust.',
    price: 12.99,
    image: 'https://lapinozpizza.in/assets/w_300,h_300/img/menus/farm-villa-pizza.jpg', // Placeholder logic
    isVeg: true,
  },
  {
    id: 'v2',
    name: 'Burn To Hell Pizza',
    description: 'A fiery combination of hot & garlic dip, jalapeños, mushroom.',
    price: 14.99,
    image: 'https://lapinozpizza.in/assets/w_300,h_300/img/menus/burn-to-hell-pizza.jpg',
    isVeg: true,
  },
  {
    id: 'v3',
    name: 'Sweet Heat Pizza',
    description: 'Jalapeños, Pineapples, Sweet Corns, Red Paprika.',
    price: 13.49,
    image: 'https://lapinozpizza.in/assets/w_300,h_300/img/menus/sweet-heat-pizza.jpg',
    isVeg: true,
  },
];

const NON_VEG_PIZZAS = [
  {
    id: 'nv1',
    name: 'Chicken Golden Delight',
    description: 'Golden corn, double chicken toppings and extra cheese.',
    price: 15.99,
    image: 'https://lapinozpizza.in/assets/w_300,h_300/img/menus/chicken-golden-delight-pizza.jpg',
    isVeg: false,
  },
  {
      id: 'nv2',
      name: 'Non-Veg Loaded',
      description: 'Peri-peri chicken, grilled chicken, chicken tikka.',
      price: 16.99,
      image: 'https://lapinozpizza.in/assets/w_300,h_300/img/menus/non-veg-loaded-pizza.jpg',
      isVeg: false,
  }
];

const MenuScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { addToCart, totalItems, totalAmount } = useCart();
  const { selectedStore } = useStore();
  const [activeTab, setActiveTab] = useState('Veg Pizza');

  // Simple scroll ref to jump to sections (visual only for MVP)
  const scrollViewRef = useRef<ScrollView>(null);

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

      {/* Category Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
            <TabItem icon={<Pizza size={18}/>} name="Veg Pizza" active={activeTab === 'Veg Pizza'} onPress={() => setActiveTab('Veg Pizza')} />
            <TabItem icon={<Pizza size={18}/>} name="Non-Veg Pizza" active={activeTab === 'Non-Veg Pizza'} onPress={() => setActiveTab('Non-Veg Pizza')} />
            <TabItem icon={<IceCream size={18}/>} name="Desserts" active={activeTab === 'Desserts'} onPress={() => setActiveTab('Desserts')} />
            <TabItem icon={<Martini size={18}/>} name="Beverages" active={activeTab === 'Beverages'} onPress={() => setActiveTab('Beverages')} />
            <TabItem icon={<Wheat size={18}/>} name="Garlic Breads" active={activeTab === 'Garlic Breads'} onPress={() => setActiveTab('Garlic Breads')} />
        </ScrollView>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        
        {/* Veg Section */}
        <View style={styles.listSection}>
             <View style={styles.sectionHeader}>
                 <Text style={styles.sectionTitle}>Veg Pizza</Text>
                 <Text style={styles.itemCount}>{VEG_PIZZAS.length} ITEMS</Text>
             </View>
             {VEG_PIZZAS.map(item => (
                 <MenuItem key={item.id} item={item} onTap={() => navigation.navigate('ProductDetail', { item })} />
             ))}
        </View>

        {/* Non-Veg Section */}
        <View style={styles.listSection}>
             <View style={styles.sectionHeader}>
                 <Text style={styles.sectionTitle}>Non-Veg Pizza</Text>
                 <Text style={styles.itemCount}>{NON_VEG_PIZZAS.length} ITEMS</Text>
             </View>
             {NON_VEG_PIZZAS.map(item => (
                 <MenuItem key={item.id} item={item} onTap={() => navigation.navigate('ProductDetail', { item })} />
             ))}
        </View>

      </ScrollView>

    </PageLayout>
  );
};

// Helper Components

const TabItem = ({ icon, name, active, onPress }: any) => (
    <TouchableOpacity style={[styles.tabItem, active && styles.tabItemActive]} onPress={onPress}>
        <View style={{ marginBottom: 4 }}>
           {React.cloneElement(icon, { color: active ? '#3c7d48' : '#6b7280' })}
        </View>
        <Text style={[styles.tabText, active && styles.tabTextActive]}>{name}</Text>
    </TouchableOpacity>
);

const MenuItem = ({ item, onTap }: any) => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
    const { cartItems, addToCart, removeFromCart } = useCart();
    
    // Check if this specific item ID is in the cart
    const cartItem = cartItems.find(i => i.id === item.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    const handleAdd = () => {
        // Instead of adding directly, navigate to details for customization
        navigation.navigate('ProductDetail', { item });
    };

    const handleRemove = () => {
        removeFromCart(item.id);
    };

    return (
        <TouchableOpacity style={styles.menuItem} onPress={onTap} activeOpacity={0.9}>
             <Image source={{ uri: item.image }} style={styles.itemImage} />
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
                 <Text style={styles.itemDesc}>{item.description}</Text>
                 <View style={styles.itemFooter}>
                     <Text style={styles.itemPrice}>${item.price}</Text>
                     
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
  },
  tabScroll: {
      paddingHorizontal: 16,
      gap: 24,
  },
  tabItem: {
      alignItems: 'center',
      paddingBottom: 8,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
  },
  tabItemActive: {
      borderBottomColor: '#3c7d48',
  },
  tabText: {
      fontSize: 10,
      fontWeight: '600',
      color: '#6b7280',
  },
  tabTextActive: {
      color: '#3c7d48',
      fontWeight: 'bold',
  },
  content: {
      padding: 16,
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
