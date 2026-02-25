import React, { useState } from 'react';
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
import { useStore } from '../context/StoreContext';
import { Product } from '../services/categoryService';

interface MenuItemProps {
  item: Product;
  onTap: () => void;
}

const MenuItem = ({ item, onTap }: MenuItemProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { cartItems, removeFromCart } = useCart();
  const [isExpanded, setIsExpanded] = useState(false);
  
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
    navigation.navigate('ProductDetail', { item });
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
          </View>
        )}
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>${item.basePrice}</Text>
        <TouchableOpacity 
          onPress={toggleExpand} 
          activeOpacity={1}
          style={styles.descButton}
        >
          <Text 
            style={styles.itemDesc} 
            numberOfLines={isExpanded ? undefined : 2}
          >
            {item.description}
          </Text>
        </TouchableOpacity>
      </View>
      
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
              {!isExternal && <Text style={styles.addButtonPlus}> +</Text>}
            </TouchableOpacity>
          )}
        </View>
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
    paddingBottom: 15,
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
  imageContainer: {
    width: 110,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  itemImage: {
    width: 110,
    height: 105,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  addButtonContainer: {
    position: 'absolute',
    bottom: -15,
    alignSelf: 'center',
    zIndex: 10,
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
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  descButton: {
    marginTop: 2,
  },
  itemDesc: {
    fontSize: 11,
    color: '#6b7280',
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

export default MenuItem;
