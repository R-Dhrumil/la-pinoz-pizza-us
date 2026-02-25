import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ShoppingBag, ChevronRight, Trash2 } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';

const FloatingCart = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { totalItems, totalAmount, clearCart } = useCart();

  if (totalItems === 0) return null;

  const handleClearCart = () => {
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to remove all items?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: clearCart }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.cartBar}>
        <View style={styles.leftSection}>
            <View style={styles.iconContainer}>
              <ShoppingBag size={22} color="#fff" />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.itemCount}>{totalItems} ITEMS</Text>
                <Text style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
            </View>
        </View>

        <View style={styles.actions}>
            <TouchableOpacity style={styles.clearBtn} onPress={handleClearCart}>
                <Trash2 size={20} color="#fff" style={{ opacity: 0.8 }} />
            </TouchableOpacity>
            
            <View style={styles.divider} />

            <TouchableOpacity 
                style={styles.viewCartBtn} 
                onPress={() => navigation.navigate('Cart')}
            >
                <Text style={styles.viewCartText}>VIEW CART</Text>
                <ChevronRight size={18} color="#fff" />
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  cartBar: {
    backgroundColor: '#3c7d48',
    borderRadius: 14,
    padding: 5,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
  },
  iconContainer: {
      position: 'relative',
  },
  textContainer: {
      justifyContent: 'center',
  },
  itemCount: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '600',
      opacity: 0.9,
      letterSpacing: 0.5,
  },
  totalAmount: {
      color: '#fff',
      fontSize: 15,
      fontWeight: 'bold',
  },
  actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
  },
  clearBtn: {
      padding: 4,
  },
  divider: {
      width: 1,
      height: 24,
      backgroundColor: 'rgba(255,255,255,0.2)',
  },
  viewCartBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
  },
  viewCartText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: 'bold',
      letterSpacing: 0.5,
  },
});

export default FloatingCart;
