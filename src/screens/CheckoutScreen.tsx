import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { ArrowLeft, MapPin, CreditCard, ChevronRight, CheckCircle2, Circle, X, Plus } from 'lucide-react-native';
import { useAddress } from '../context/AddressContext';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
// import { addressService } from '../services/addressService';
import { orderService } from '../services/orderService';
import PageLayout from '../components/PageLayout';

const CheckoutScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
    const { cartItems, totalAmount, clearCart } = useCart();
    const { selectedStore } = useStore();
    const { isAuthenticated } = useAuth();
    
    const { addresses } = useAddress();
    
    // const [loading, setLoading] = useState(false); // No longer needed for context
    const [selectedAddress, setSelectedAddress] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Online'>('COD');
    const [placingOrder, setPlacingOrder] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);

    // Calculate totals
    const tax = totalAmount * 0.05;
    const deliveryFee = 2.99;
    const finalTotal = totalAmount + tax + deliveryFee;

    useFocusEffect(
        useCallback(() => {
            // Auto-select default or first address from context
            if (addresses.length > 0 && !selectedAddress) {
                 const defaultAddr = addresses.find((a: any) => a.isDefault); // specific type Address if imported?
                 if (defaultAddr) {
                     setSelectedAddress(defaultAddr);
                 } else {
                     setSelectedAddress(addresses[0]);
                 }
            } else if (addresses.length === 0) {
                setSelectedAddress(null);
            }
        }, [addresses, selectedAddress])
    );


    const handlePlaceOrder = async () => {
        if (!isAuthenticated) {
            Alert.alert("Authentication Required", "Please login to place an order.", [
                { text: "Login", onPress: () => navigation.navigate('Login' as any) },
                { text: "Cancel", style: "cancel" }
            ]);
            return;
        }

        if (!selectedAddress) {
            Alert.alert("Address Required", "Please select a delivery address.");
            return;
        }

        if (!selectedStore) {
             Alert.alert("Store Error", "No store selected for this order.");
             return;
        }

        setPlacingOrder(true);
        try {
            const orderData = {
                addressId: selectedAddress.id,
                storeId: selectedStore.id,
                items: cartItems.map(item => ({
                    productId: parseInt(item.id),
                    productName: item.name,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    totalPrice: item.price * item.quantity,
                    modifiers: item.toppings ? item.toppings.map((t: any) => t.name).join(', ') : '',
                    specialInstructions: '',
                    imageUrl: item.image || '', // Assuming item has image property
                    isVeg: item.isVeg || false, // Assuming item has isVeg property
                    size: item.size || '', // Added size if available
                    crust: item.crust || '' // Added crust if available
                })),
                subtotal: totalAmount,
                tax: tax,
                deliveryFee: deliveryFee,
                discount: 0,
                total: finalTotal,
                paymentMethod: paymentMethod,
                specialInstructions: ''
            };

            await orderService.createOrder(orderData);
            
            Alert.alert("Success", "Order placed successfully!", [
                { 
                    text: "OK", 
                    onPress: () => {
                        clearCart();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'MainTabs' }, { name: 'MyOrders' }],
                        });
                    }
                }
            ]);

        } catch (error) {
            console.error("Order placement failed", error);
            Alert.alert("Error", "Failed to place order. Please try again.");
        } finally {
            setPlacingOrder(false);
        }
    };

    const renderAddressModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={showAddressModal}
            onRequestClose={() => setShowAddressModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Select Delivery Address</Text>
                        <TouchableOpacity onPress={() => setShowAddressModal(false)}>
                            <X size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={addresses}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.addressListContent}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                style={[
                                    styles.modalAddressItem,
                                    selectedAddress?.id === item.id && styles.selectedModalAddress
                                ]}
                                onPress={() => {
                                    setSelectedAddress(item);
                                    setShowAddressModal(false);
                                }}
                            >
                                <View style={styles.modalAddressIcon}>
                                    <MapPin size={20} color={selectedAddress?.id === item.id ? "#fff" : "#3c7d48"} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.addressType}>{item.type || 'Home'}</Text>
                                    <Text style={styles.addressText}>
                                        {item.houseNo}, {item.street}, {item.landmark}, {item.city} - {item.pincode}
                                    </Text>
                                </View>
                                {selectedAddress?.id === item.id && (
                                    <CheckCircle2 size={20} color="#3c7d48" />
                                )}
                            </TouchableOpacity>
                        )}
                        ListFooterComponent={() => (
                            <TouchableOpacity 
                                style={styles.modalAddBtn}
                                onPress={() => {
                                    setShowAddressModal(false);
                                    navigation.navigate('AddNewAddress');
                                }}
                            >
                                <Plus size={20} color="#3c7d48" />
                                <Text style={styles.modalAddBtnText}>Add New Address</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {/* Delivery Address Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Delivery Address</Text>
                        <TouchableOpacity onPress={() => setShowAddressModal(true)}>
                            <Text style={styles.changeBtn}>Change</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Delivery Address Section */}
                    {selectedAddress ? (
                        <View style={styles.addressCard}>
                            <View style={styles.addressIcon}>
                                <MapPin size={24} color="#3c7d48" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.addressType}>{selectedAddress.type || 'Home'}</Text>
                                <Text style={styles.addressText}>
                                    {selectedAddress.addressLine1}, {selectedAddress.city}
                                </Text>
                                <Text style={styles.phoneText}>Phone: {selectedAddress.phoneNumber}</Text>
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity 
                            style={styles.addAddressBtn}
                            onPress={() => navigation.navigate('AddNewAddress')}
                        >
                            <Text style={styles.addAddressText}>+ Add New Address</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Payment Method Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    <View style={styles.paymentOptions}>
                        <TouchableOpacity 
                            style={[styles.paymentOption, paymentMethod === 'COD' && styles.paymentOptionActive]}
                            onPress={() => setPaymentMethod('COD')}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                {paymentMethod === 'COD' ? (
                                    <CheckCircle2 size={20} color="#3c7d48" />
                                ) : (
                                    <Circle size={20} color="#9ca3af" />
                                )}
                                <Text style={styles.paymentText}>Cash on Delivery</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.paymentOption, paymentMethod === 'Online' && styles.paymentOptionActive]}
                            onPress={() => setPaymentMethod('Online')}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                {paymentMethod === 'Online' ? (
                                    <CheckCircle2 size={20} color="#3c7d48" />
                                ) : (
                                    <Circle size={20} color="#9ca3af" />
                                )}
                                <Text style={styles.paymentText}>Online Payment (Mock)</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Order Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.billDetails}>
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
                            <Text style={styles.totalLabel}>Grand Total</Text>
                            <Text style={styles.totalValue}>${finalTotal.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>

            <View style={styles.footer}>
                 <View>
                     <Text style={styles.footerTotalLabel}>PAYING</Text>
                     <Text style={styles.footerTotalValue}>${finalTotal.toFixed(2)}</Text>
                 </View>
                 <TouchableOpacity 
                    style={[styles.placeOrderBtn, (placingOrder || !selectedAddress) && styles.disabledBtn]}
                    onPress={handlePlaceOrder}
                    disabled={placingOrder || !selectedAddress}
                 >
                     {placingOrder ? (
                         <ActivityIndicator size="small" color="#fff" />
                     ) : (
                         <Text style={styles.placeOrderText}>CONFIRM ORDER</Text>
                     )}
                 </TouchableOpacity>
            </View>
            {renderAddressModal()}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
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
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 12,
    },
    changeBtn: {
        color: '#3c7d48',
        fontWeight: '600',
        fontSize: 14,
    },
    addressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        gap: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    addressIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0fdf4',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addressType: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 12,
        color: '#6b7280',
        lineHeight: 18,
    },
    phoneText: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
    },
    addAddressBtn: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#3c7d48',
        borderStyle: 'dashed',
        alignItems: 'center',
        backgroundColor: '#f0fdf4',
    },
    addAddressText: {
        color: '#3c7d48',
        fontWeight: 'bold',
        fontSize: 14,
    },
    paymentOptions: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 8,
    },
    paymentOption: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'transparent',
        marginBottom: 8,
    },
    paymentOptionActive: {
        backgroundColor: '#f0fdf4',
        borderColor: '#3c7d48',
    },
    paymentText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    billDetails: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
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
    footer: {
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
    footerTotalLabel: {
        fontSize: 10,
        color: '#6b7280',
        fontWeight: '600',
        marginBottom: 2,
    },
    footerTotalValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
    },
    placeOrderBtn: {
        backgroundColor: '#3c7d48',
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#3c7d48',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    disabledBtn: {
        backgroundColor: '#9ca3af',
        shadowOpacity: 0,
        elevation: 0,
    },
    placeOrderText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        paddingBottom: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    addressListContent: {
        padding: 16,
    },
    modalAddressItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 12,
        gap: 12,
    },
    selectedModalAddress: {
        borderColor: '#3c7d48',
        backgroundColor: '#f0fdf4',
    },
    modalAddressIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f3f4f6', // Default gray bg
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalAddBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#3c7d48',
        borderStyle: 'dashed',
        gap: 8,
        marginTop: 8,
    },
    modalAddBtnText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3c7d48',
    },
});

export default CheckoutScreen;
