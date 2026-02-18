import React, { useState, useEffect } from 'react';
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
  Linking,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { X, Star, Minus, Plus, Check } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { Product, ProductVariant, ModifierGroup, ModifierOption } from '../services/categoryService';
import PageLayout from '../components/PageLayout';

const { width } = Dimensions.get('window');

type ParamList = {
  ProductDetail: {
    item: Product;
  };
};

const ProductDetailScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const route = useRoute<RouteProp<ParamList, 'ProductDetail'>>();
  const { item } = route.params || {}; 
  const { addToCart } = useCart();
  const { selectedStore } = useStore();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  // Map of GroupID -> Array of selected OptionIDs
  const [selectedModifiers, setSelectedModifiers] = useState<Record<number, number[]>>({});
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (item) {
        // Initialize Variant: Default to first one if available
        if (item.variants && item.variants.length > 0) {
            setSelectedVariant(item.variants[0]);
        }
        
        // Initialize Modifiers: Select defaults
        const initialModifiers: Record<number, number[]> = {};
        if (item.modifierGroups) {
            item.modifierGroups.forEach(group => {
                const defaults = group.modifierOptions
                    .filter(opt => opt.isDefault)
                    .map(opt => opt.id);
                
                if (defaults.length > 0) {
                    initialModifiers[group.id] = defaults;
                }
            });
        }
        setSelectedModifiers(initialModifiers);
    }
  }, [item]);

  if (!item) return null;

  const toggleModifier = (group: ModifierGroup, optionId: number) => {
    const currentSelected = selectedModifiers[group.id] || [];
    const isSelected = currentSelected.includes(optionId);
    
    let newSelected = [...currentSelected];

    if (group.selectionType === 'Single' || group.maxSelection === 1) {
        // Radio behavior
        if (!isSelected) {
            newSelected = [optionId];
        }
        // If already selected and minSelection is 0, we can deselect. If minSelection > 0, we might strictly require one.
        // Usually single select radio buttons don't allow deselecting the only option.
        // Let's assume for Single selection we allow keeping it selected.
    } else {
        // Checkbox behavior
        if (isSelected) {
            newSelected = newSelected.filter(id => id !== optionId);
        } else {
            if (group.maxSelection > 0 && newSelected.length >= group.maxSelection) {
                // Max limit reached, specific logic (replace first? ignore?)
                // Usually we just ignore the tap or show a message.
                return; 
            }
            newSelected.push(optionId);
        }
    }

    setSelectedModifiers({
        ...selectedModifiers,
        [group.id]: newSelected
    });
  };

  const getOptionPrice = (option: ModifierOption) => {
    // Check if there is an override for the current variant size
    if (selectedVariant && option.priceOverrides) {
        const override = option.priceOverrides.find(po => po.size === selectedVariant.size);
        if (override) return override.price;
    }
    return option.price;
  };

  const calculateTotal = () => {
    let total = item.basePrice;

    if (selectedVariant) {
        total = selectedVariant.price;
    }

    // Add selected modifiers
    if (item.modifierGroups) {
        item.modifierGroups.forEach(group => {
            const selectedIds = selectedModifiers[group.id] || [];
            selectedIds.forEach(id => {
                const option = group.modifierOptions.find(o => o.id === id);
                if (option) {
                    total += getOptionPrice(option);
                }
            });
        });
    }

    return (total * quantity).toFixed(2);
  };

  const handleAddToCart = (redirect: boolean) => {
    // Gather all selected modifier objects
    const allSelectedModifiers: ModifierOption[] = [];
    if (item.modifierGroups) {
        item.modifierGroups.forEach(group => {
            const selectedIds = selectedModifiers[group.id] || [];
            selectedIds.forEach(id => {
                const option = group.modifierOptions.find(o => o.id === id);
                if (option) {
                    // Start Clone option to include the *actual* price used (handling overrides)
                    allSelectedModifiers.push({
                        ...option,
                        price: getOptionPrice(option)
                    });
                }
            });
        });
    }

    const uniqueIdParts = [
        item.id, 
        selectedVariant?.id || 'base',
        ...allSelectedModifiers.map(m => m.id).sort()
    ];

    const customItem = {
        ...item, // Fallback properties
        id: uniqueIdParts.join('-'),
        name: selectedVariant ? `${item.name} (${selectedVariant.size})` : item.name,
        price: Number(calculateTotal())/quantity, // Unit price
        image: item.imageUrl || 'https://via.placeholder.com/150',
        isVeg: item.isVeg,
        description: item.description,
        variant: selectedVariant,
        size: selectedVariant?.size,
        crust: selectedVariant?.crust,
        toppings: allSelectedModifiers, // Using generic 'toppings' field for all modifiers
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
          <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} style={styles.image} />
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

          {/* Dynamic Variants */}
          {item.variants && item.variants.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>SELECT VARIANT</Text>
                <View style={styles.variantsGrid}>
                  {item.variants.map((variant) => (
                    <TouchableOpacity
                      key={variant.id}
                      style={[
                        styles.variantCard,
                        selectedVariant?.id === variant.id && styles.variantCardActive,
                      ]}
                      onPress={() => setSelectedVariant(variant)}
                    >
                      <Text style={[
                          styles.variantName, 
                          selectedVariant?.id === variant.id && styles.variantTextActive
                      ]}>{variant.size}</Text>
                      <Text style={[
                          styles.variantPrice,
                          selectedVariant?.id === variant.id && styles.variantTextActive
                      ]}>${variant.price}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
          )}

          {/* Dynamic Modifier Groups */}
          {item.modifierGroups && item.modifierGroups.map(group => (
              <View key={group.id} style={styles.section}>
                <View style={styles.toppingsHeader}>
                    <Text style={styles.sectionTitle}>{group.name.toUpperCase()}</Text>
                    {group.maxSelection > 0 && (
                        <Text style={styles.maxText}>MAX {group.maxSelection}</Text>
                    )}
                </View>
                
                {group.modifierOptions.map((option) => {
                  const isSelected = (selectedModifiers[group.id] || []).includes(option.id);
                  const price = getOptionPrice(option);
                  
                  return (
                    <TouchableOpacity
                      key={option.id}
                      style={styles.toppingRow}
                      onPress={() => toggleModifier(group, option.id)}
                    >
                      <View style={styles.toppingInfo}>
                        <View style={[styles.checkboxBase, isSelected && styles.checkboxChecked]}>
                            {isSelected ? (
                                 <Check size={12} color="#fff" strokeWidth={4} />
                            ) : (
                                 /* Radio style for single select? Or just dot? Keeping consistent for now */
                                 <View style={styles.vegDot} />
                            )} 
                        </View>
                        <Text style={styles.toppingName}>{option.name}</Text>
                      </View>
                      <Text style={styles.toppingPrice}>+${price}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
          ))}

        </View>
      </ScrollView>

      {/* Bottom Bar */}
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
            {(selectedStore?.state === 'NJ' && selectedStore?.city === 'Iselin') || item.externalLink ? (
                 <TouchableOpacity 
                    style={[styles.btn, styles.btnPrimary, { backgroundColor: '#ea580c' }]} 
                    onPress={() => {
                        const link = item.externalLink || 'https://lapinozpizza.us/order-online/';
                        Linking.openURL(link).catch(err => Alert.alert("Error", "Could not open link"));
                    }}
                >
                  <Text style={styles.btnTextPrimary}>ORDER ON WEB</Text>
                </TouchableOpacity>
            ) : (
                <>
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
                </>
            )}
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
