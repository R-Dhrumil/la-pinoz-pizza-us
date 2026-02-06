import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { X, Star, Minus, Plus, Check } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import PageLayout from '../components/PageLayout';

const { width } = Dimensions.get('window');

// Mock data for variants and toppings since they aren't in the main data yet
const VARIANTS = [
  { id: 'v1', name: 'Slice', price: 4.99 },
  { id: 'v2', name: 'Regular', price: 12.99 },
  { id: 'v3', name: 'Medium', price: 18.99 },
  { id: 'v4', name: 'Large', price: 24.99 },
  { id: 'v5', name: 'Giant', price: 32.99 },
  { id: 'v6', name: 'Monster', price: 45.99 },
];

const TOPPINGS = [
  { id: 't1', name: 'Onions', price: 0.99 },
  { id: 't2', name: 'Capsicum', price: 0.99 },
  { id: 't3', name: 'Paneer', price: 1.49 },
  { id: 't4', name: 'Mushrooms', price: 1.29 },
  { id: 't5', name: 'Olives', price: 1.29 },
];

type ParamList = {
  ProductDetail: {
    item: any;
  };
};

const ProductDetailScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute<RouteProp<ParamList, 'ProductDetail'>>();
  const { item } = route.params || {}; // Fallback if tested directly
  const { addToCart } = useCart();

  const [selectedVariant, setSelectedVariant] = useState(VARIANTS[0]);
  const [selectedToppings, setSelectedToppings] = useState<string[]>(['t1']); // Onions selected by default
  const [quantity, setQuantity] = useState(1);

  // If no item is passed (shouldn't happen in flow), return null or error
  if (!item) return null;

  const toggleTopping = (id: string) => {
    if (selectedToppings.includes(id)) {
      setSelectedToppings(selectedToppings.filter((t) => t !== id));
    } else {
      if (selectedToppings.length < 10) {
        setSelectedToppings([...selectedToppings, id]);
      }
    }
  };

  const calculateTotal = () => {
    let total = selectedVariant.price;
    selectedToppings.forEach((id) => {
      const topping = TOPPINGS.find((t) => t.id === id);
      if (topping) total += topping.price;
    });
    return (total * quantity).toFixed(2);
  };

  const handleAddToCart = (redirect: boolean) => {
    // Construct a custom item based on selections
    const customItem = {
      ...item,
      id: `${item.id}-${selectedVariant.id}-${selectedToppings.join('-')}`, // Unique ID for this combo
      name: `${item.name} (${selectedVariant.name})`,
      price: Number(calculateTotal())/quantity, // Price per unit
      variant: selectedVariant,
      toppings: selectedToppings.map(id => TOPPINGS.find(t => t.id === id)),
    };
    
    // Add quantity times
    for(let i=0; i<quantity; i++) {
        addToCart(customItem);
    }
    
    if (redirect) {
        navigation.navigate('Cart');
    } else {
        navigation.goBack();
    }
  };

  return (
    <PageLayout showCart={false} style={styles.container}>
      {/* Scrollable Content */}
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        
        {/* Header Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.image} />
          {/* Close Button overlay */}
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={20} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.detailsContainer}>
          {/* Title and Rating */}
          <View style={styles.headerRow}>
             <View style={styles.vegTag}>
                <Image 
                    source={{ uri: item.isVeg 
                        ? 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Veg_symbol.svg/1200px-Veg_symbol.svg.png' 
                        : 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Non_veg_symbol.svg/1024px-Non_veg_symbol.svg.png' 
                    }} 
                    style={styles.vegIcon} 
                />
                <Text style={styles.vegText}>{item.isVeg ? 'VEG' : 'NON-VEG'}</Text>
             </View>
             <View style={styles.ratingContainer}>
                 <Star size={14} color="#FBBF24" fill="#FBBF24" />
                 <Text style={styles.ratingText}>4.8</Text>
             </View>
          </View>

          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.description}>{item.description}</Text>

          {/* Variants */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SELECT VARIANT</Text>
            <View style={styles.variantsGrid}>
              {VARIANTS.map((variant) => (
                <TouchableOpacity
                  key={variant.id}
                  style={[
                    styles.variantCard,
                    selectedVariant.id === variant.id && styles.variantCardActive,
                  ]}
                  onPress={() => setSelectedVariant(variant)}
                >
                  <Text style={[
                      styles.variantName, 
                      selectedVariant.id === variant.id && styles.variantTextActive
                  ]}>{variant.name}</Text>
                  <Text style={[
                      styles.variantPrice,
                      selectedVariant.id === variant.id && styles.variantTextActive
                  ]}>${variant.price}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Toppings */}
          <View style={styles.section}>
            <View style={styles.toppingsHeader}>
                <Text style={styles.sectionTitle}>ADD TOPPINGS</Text>
                <Text style={styles.maxText}>MAX 10</Text>
            </View>
            
            {TOPPINGS.map((topping) => {
              const isSelected = selectedToppings.includes(topping.id);
              return (
                <TouchableOpacity
                  key={topping.id}
                  style={styles.toppingRow}
                  onPress={() => toggleTopping(topping.id)}
                >
                  <View style={styles.toppingInfo}>
                    <View style={[styles.checkboxBase, isSelected && styles.checkboxChecked]}>
                        {isSelected ? (
                             <Check size={12} color="#fff" strokeWidth={4} />
                        ) : (
                             <View style={styles.vegDot} />
                        )} 
                    </View>
                    <Text style={styles.toppingName}>{topping.name}</Text>
                  </View>
                  <Text style={styles.toppingPrice}>${topping.price}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

        </View>
      </ScrollView>

      {/* Redesigned Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceRow}>
            <View>
                <Text style={styles.totalLabel}>Total Price</Text>
                <Text style={styles.totalBig}>${calculateTotal()}</Text>
            </View>
            <View style={styles.quantityControl}>
                <TouchableOpacity 
                    style={styles.qtyBtn} 
                    onPress={() => quantity > 1 && setQuantity(q => q - 1)}
                >
                    <Minus size={20} color="#000" />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{quantity}</Text>
                <TouchableOpacity 
                    style={styles.qtyBtn} 
                    onPress={() => setQuantity(q => q + 1)}
                >
                    <Plus size={20} color="#000" />
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.actionButtons}>
            <TouchableOpacity 
                style={[styles.btn, styles.btnSecondary]} 
                onPress={() => handleAddToCart(false)}
            >
              <Text style={styles.btnTextSecondary}>ADD TO CART</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.btn, styles.btnPrimary]} 
                onPress={() => handleAddToCart(true)}
            >
              <Text style={styles.btnTextPrimary}>BUY NOW</Text>
            </TouchableOpacity>
        </View>
      </View>
    </PageLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    height: 300,
    width: '100%',
    position: 'relative',
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
    resizeMode: 'cover',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  detailsContainer: {
    flex: 1,
    padding: 20,
    marginTop: -20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vegTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vegIcon: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
  },
  vegText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6b7280',
    letterSpacing: 0.5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  variantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  variantCard: {
    width: (width - 40 - 24) / 3, // 3 columns, accounting for padding and gaps
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  variantCardActive: {
    borderColor: '#3c7d48',
    backgroundColor: '#f0fdf4',
  },
  variantName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  variantPrice: {
    fontSize: 10,
    color: '#6b7280',
  },
  variantTextActive: {
    color: '#3c7d48', // Dark green text for active
    fontWeight: 'bold',
  },
  toppingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  maxText: {
    fontSize: 10,
    color: '#9ca3af',
  },
  toppingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  toppingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxBase: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3c7d48',
    borderColor: '#3c7d48',
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3c7d48',
  },
  toppingName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  toppingPrice: {
    fontSize: 14,
    color: '#6b7280',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    flexDirection: 'column', // Changed to column for 2 rows
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  priceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
  },
  totalLabel: {
      fontSize: 12,
      color: '#6b7280',
      fontWeight: '600',
      marginBottom: 2,
  },
  totalBig: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#3c7d48',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 16,
    height: 44,
  },
  qtyBtn: {
    padding: 4,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    minWidth: 20,
    textAlign: 'center',
  },
  actionButtons: {
      flexDirection: 'row',
      gap: 12,
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    height: 56,
  },
  btnPrimary: {
    backgroundColor: '#3c7d48',
    shadowColor: '#3c7d48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#3c7d48',
  },
  btnTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  btnTextSecondary: {
    color: '#3c7d48',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  // totalText removed since it's now separate
});

export default ProductDetailScreen;
