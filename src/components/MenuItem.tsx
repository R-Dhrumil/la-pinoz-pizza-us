import React, { useState, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { useCart } from '../context/CartContext';
import { Product } from '../services/categoryService';
import { offerService } from '../services/offerService';
import { Star, BadgePercent, Plus } from 'lucide-react-native';

interface MenuItemProps {
  item: Product;
  onTap: () => void;
  categoryId?: number;
}

const MenuItem = ({ item, onTap, categoryId }: MenuItemProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { cartItems, removeFromCart, availableOffers } = useCart();
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate discounted price
  const { discountedPrice, appliedOffer } = offerService.getDiscountedPrice(
    item.basePrice, 
    availableOffers, 
    categoryId, 
    item.subcategoryId
  );
  
  const hasDiscount = discountedPrice < item.basePrice;

  // Check if any active offer applies to this item (for badge if needed, but we prefer price)
  const hasOffer = availableOffers.some(offer => 
    (categoryId && offer.categoryIds.includes(categoryId)) ||
    (item.subcategoryId && offer.subcategoryIds.includes(item.subcategoryId))
  );
  
  // Check if this specific item ID is in the cart
  const cartItem = cartItems.find(i => i.id === item.id.toString());
  const quantity = cartItem ? cartItem.quantity : 0;
  
  // External link check
  const isExternal = item.externalLink;

  const handleAdd = () => {
    if (isExternal) {
      const link = item.externalLink || 'https://lapinozpizza.us/order-online/';
      Linking.openURL(link).catch(err => Alert.alert("Error", "Could not open link"));
      return;
    }
    // Instead of adding directly, navigate to details for customization
    navigation.navigate('ProductDetail', { item, categoryId });
  };

  const handleRemove = () => {
    removeFromCart(item.id.toString());
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <TouchableOpacity style={styles.menuItem} onPress={onTap} activeOpacity={0.9}>
      <View style={styles.itemContent}>
        {item.isVeg !== null && item.isVeg !== undefined && (
          <View style={styles.vegIndicatorRow}>
            <View style={[styles.vegSquare, { borderColor: item.isVeg ? '#3c7d48' : '#b91c1c' }]}>
               <View style={[styles.vegDot, { backgroundColor: item.isVeg ? '#3c7d48' : '#b91c1c' }]} />
            </View>
            <Text style={[styles.vegText, { color: item.isVeg ? '#3c7d48' : '#b91c1c' }]}>
              {item.isVeg ? 'VEG' : 'NON-VEG'}
            </Text>
            {hasOffer && (
              <View style={styles.offerBadge}>
                <Text style={styles.offerBadgeText}>OFFER AVAILABLE</Text>
              </View>
            )}
          </View>
        )}
        <Text style={styles.itemName}>{item.name}</Text>
        <View style={styles.priceContainer}>
          {hasDiscount ? (
            <>
              <Text style={styles.itemPrice}>${discountedPrice}</Text>
              <Text style={styles.originalPrice}>${item.basePrice}</Text>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>Save ${(item.basePrice - discountedPrice).toFixed(2)}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.itemPrice}>${item.basePrice}</Text>
          )}
        </View>
        
        {/* Placeholder 5-Star Rating */}
        <View style={styles.ratingRow}>
          {[1,2,3,4,5].map(i => (
             <Star key={i} size={10} color="#fbbf24" fill="#fbbf24" style={{marginRight: 2}} />
          ))}
        </View>

        <TouchableOpacity 
          onPress={toggleExpand} 
          activeOpacity={1}
          style={styles.descButton}
        >
          <Text style={styles.itemDescWrapper}>
            <Text style={styles.itemDesc}>
              {isExpanded ? item.description : (item.description.length > 50 ? item.description.substring(0, 50) + '... ' : item.description)}
            </Text>
            {!isExpanded && item.description.length > 50 && (
              <Text style={styles.readMoreText}>Read More</Text>
            )}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.imageColumn}>
        <View style={styles.imageContainer}>
          <Image 
            source={item.imageUrl ? { uri: item.imageUrl } : require('../assets/images/pizza_placeholder.jpg')} 
            style={[styles.itemImage, !item.imageUrl && { resizeMode: 'contain' }]} 
          />
          <View style={styles.addButtonContainer}>
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
                style={[styles.addButton, isExternal && { backgroundColor: '#ea580c', borderColor: '#ea580c' }]} 
                onPress={handleAdd}
              >
                <Text style={[styles.addButtonText, isExternal && { color: '#fff' }]}>{isExternal ? 'ORDER' : 'ADD'}</Text>
                <Plus size={14} color={isExternal ? "#fff" : "#3c7d48"} strokeWidth={3} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {((item.variants && item.variants.length > 0) || (item.modifierGroups && item.modifierGroups.length > 0)) && (
          <Text style={styles.customisableText}>Customisable</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    paddingBottom: 25,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    justifyContent: 'space-between',
  },
  itemContent: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'flex-start',
  },
  imageColumn: {
    width: 110,
    alignItems: 'center',
  },
  imageContainer: {
    width: 110,
    height: 105,
    position: 'relative',
    marginBottom: 12, // Space for the overlapping button
  },
  itemImage: {
    width: 110,
    height: 105,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: -15, // Center on the edge
    alignSelf: 'center',
    zIndex: 10,
  },
  customisableText: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
  vegIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  vegSquare: {
    width: 12,
    height: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  vegText: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3c7d48',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  originalPrice: {
    fontSize: 11,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  saveBadge: {
    backgroundColor: '#3c7d48',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  saveBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  offerBadge: {
    backgroundColor: '#f0fdf4', // Light green background
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#3c7d48',
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offerBadgeText: {
    color: '#3c7d48', // Brand green
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  descButton: {
    marginTop: 2,
  },
  itemDescWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  itemDesc: {
    fontSize: 11,
    color: '#6b7280',
    lineHeight: 14,
  },
  readMoreText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: 'bold',
    lineHeight: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3c7d48',
    minWidth: 80,
  },
  addButtonText: {
    color: '#3c7d48',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addButtonPlus: {
    color: '#3c7d48',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3c7d48',
    height: 32,
    minWidth: 80,
  },
  qtyBtnSmall: {
    width: 32,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    color: '#3c7d48',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: -2,
  },
  qtyTextSmall: {
    color: '#3c7d48',
    fontSize: 14,
    fontWeight: 'bold',
    marginHorizontal: 2,
    minWidth: 16,
    textAlign: 'center',
  },
});

export default memo(MenuItem);
