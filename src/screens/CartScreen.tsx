import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Trash2, Plus, Minus, MoveRight } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import PageLayout from '../components/PageLayout';

const CartScreen = () => {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const navigation = useNavigation<any>();
  const { cartItems, totalAmount, addToCart, removeFromCart, deleteItem } = useCart();

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Cart</Text>
            <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
            <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/11329/11329060.png' }} 
                style={styles.emptyImage}
            />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptyDesc}>Looks like you haven't added any pizza yet.</Text>
            <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Menu' as any)}>
                <Text style={styles.browseBtnText}>BROWSE AGENTIC PIZZA</Text>
            </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Calculate taxes and delivery (Mock)
  const tax = totalAmount * 0.05;
  const deliveryFee = 2.99;
  const finalTotal = totalAmount + tax + deliveryFee;

  return (
    <PageLayout showCart={false} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Cart Items */}
          <View style={styles.itemsSection}>
              {cartItems.map((item) => (
                  <View key={item.id} style={styles.cartItem}>
                      <Image source={{ uri: item.image }} style={styles.itemImage} />
                      <View style={styles.itemInfo}>
                          <View style={styles.itemHeader}>
                              <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                              <TouchableOpacity onPress={() => deleteItem(item.id)}>
                                  <Trash2 size={16} color="#ef4444" />
                              </TouchableOpacity>
                          </View>
                          
                          <Text style={styles.itemVariant}>
                              {item.variant?.name ? `${item.variant.name} Size` : 'Regular'} 
                              {item.toppings && item.toppings.length > 0 && ` + ${item.toppings.length} Toppings`}
                          </Text>
                          
                          <View style={styles.itemFooter}>
                              <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                              
                              <View style={styles.qtyControl}>
                                  <TouchableOpacity 
                                    style={styles.qtyBtn}
                                    onPress={() => removeFromCart(item.id)}
                                  >
                                      <Minus size={14} color="#000" />
                                  </TouchableOpacity>
                                  <Text style={styles.qtyText}>{item.quantity}</Text>
                                  <TouchableOpacity 
                                    style={styles.qtyBtn}
                                    onPress={() => addToCart({ ...item })}
                                  >
                                      <Plus size={14} color="#000" />
                                  </TouchableOpacity>
                              </View>
                          </View>
                      </View>
                  </View>
              ))}
          </View>

          {/* Add More Button */}
          <TouchableOpacity 
              style={styles.addMoreBtn} 
              onPress={() => navigation.navigate('MainTabs', { screen: 'Menu' })}
          >
              <Text style={styles.addMoreBtnText}>Add more items</Text>
              <Plus size={16} color="#3c7d48" />
          </TouchableOpacity>

          {/* Bill Details */}
          <View style={styles.billSection}>
              <Text style={styles.billTitle}>Bill Details</Text>
              
              <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Item Total</Text>
                  <Text style={styles.billValue}>${totalAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Taxes (5%)</Text>
                  <Text style={styles.billValue}>${tax.toFixed(2)}</Text>
              </View>
               <View style={styles.billRow}>
                  <Text style={styles.billLabel}>Delivery Fee</Text>
                  <Text style={styles.billValue}>${deliveryFee.toFixed(2)}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.billRow}>
                  <Text style={styles.totalLabel}>To Pay</Text>
                  <Text style={styles.totalValue}>${finalTotal.toFixed(2)}</Text>
              </View>
          </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
           <View>
               <Text style={styles.payLabel}>PAYABLE</Text>
               <Text style={styles.payAmount}>${finalTotal.toFixed(2)}</Text>
           </View>
           <TouchableOpacity style={styles.checkoutBtn} onPress={() => { /* Checkout Logic */ }}>
               <Text style={styles.checkoutText}>PLACE ORDER</Text>
               <MoveRight size={18} color="#fff" />
           </TouchableOpacity>
      </View>

    </PageLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#000',
  },
  backBtn: {
      padding: 4,
  },
  scrollContent: {
      padding: 16,
      paddingBottom: 100,
  },
  emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
  },
  emptyImage: {
      width: 120,
      height: 120,
      marginBottom: 24,
      opacity: 0.5,
  },
  emptyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#000',
      marginBottom: 8,
  },
  emptyDesc: {
      fontSize: 14,
      color: '#6b7280',
      textAlign: 'center',
      marginBottom: 32,
  },
  browseBtn: {
      backgroundColor: '#3c7d48',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
  },
  browseBtnText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
  },
  itemsSection: {
      marginBottom: 24,
  },
  cartItem: {
      flexDirection: 'row',
      backgroundColor: '#fff',
      padding: 12,
      borderRadius: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOpacity: 0.02,
      shadowRadius: 4,
      elevation: 2,
  },
  itemImage: {
      width: 80,
      height: 80,
      borderRadius: 12,
      backgroundColor: '#f3f4f6',
  },
  itemInfo: {
      flex: 1,
      marginLeft: 12,
      justifyContent: 'space-between',
  },
  itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
  },
  itemName: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#000',
      flex: 1,
      marginRight: 8,
  },
  itemVariant: {
      fontSize: 12,
      color: '#6b7280',
      marginTop: 2,
  },
  itemFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 8,
  },
  itemPrice: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#000',
  },
  qtyControl: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f3f4f6',
      borderRadius: 8,
      padding: 2,
  },
  qtyBtn: {
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 6,
      backgroundColor: '#fff',
  },
  qtyText: {
      width: 24,
      textAlign: 'center',
      fontSize: 12,
      fontWeight: 'bold',
      color: '#000',
  },
  billSection: {
      backgroundColor: '#fff',
      padding: 16,
      borderRadius: 16,
  },
  billTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#000',
      marginBottom: 16,
  },
  billRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
  },
  billLabel: {
      fontSize: 14,
      color: '#6b7280',
  },
  billValue: {
      fontSize: 14,
      color: '#000',
      fontWeight: '500',
  },
  divider: {
      height: 1,
      backgroundColor: '#f3f4f6',
      marginVertical: 12,
      borderStyle: 'dashed',
      borderWidth: 1,
      borderColor: '#f3f4f6', // Trick for dashed line often requires borderRadius, or just simple line
  },
  totalLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#000',
  },
  totalValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#3c7d48',
  },
  bottomBar: {
      backgroundColor: '#fff',
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: '#f3f4f6',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
  },
  payLabel: {
      fontSize: 10,
      color: '#6b7280',
      fontWeight: '600',
      marginBottom: 2,
  },
  payAmount: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#000',
  },
  checkoutBtn: {
      backgroundColor: '#3c7d48',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
      shadowColor: '#3c7d48',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
  },
  checkoutText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 'bold',
      letterSpacing: 0.5,
  },
  addMoreBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 14,
      borderRadius: 12,
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#3c7d48',
      borderStyle: 'dashed',
      marginBottom: 24,
      gap: 8,
  },
  addMoreBtnText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#3c7d48',
  },
});

export default CartScreen;
