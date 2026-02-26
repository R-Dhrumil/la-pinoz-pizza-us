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
  FlatList,
  TextInput,
  Platform,
  StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { paymentService, PendingOrderData } from '../services/paymentService';
import { ScreenContainer } from '../components/ScreenContainer';

const CheckoutScreen = () => {
    const insets = useSafeAreaInsets();
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
    const [orderInstructions, setOrderInstructions] = useState('');

    // Calculate totals
    const tax = totalAmount * 0.05;
    const deliveryFee = 2.99;
    const finalTotal = totalAmount + tax + deliveryFee;

    useFocusEffect(
        useCallback(() => {
            // Auto-select default or first deliverable address from context
            if (addresses.length > 0 && !selectedAddress) {
                 const deliverableAddresses = addresses.filter((a: any) => a.isDeliverable);
                 const defaultAddr = deliverableAddresses.find((a: any) => a.isDefault);
                 
                 if (defaultAddr) {
                     setSelectedAddress(defaultAddr);
                 } else if (deliverableAddresses.length > 0) {
                     setSelectedAddress(deliverableAddresses[0]);
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

        if (!selectedAddress.isDeliverable) {
            Alert.alert("Invalid Address", "Selected address is not deliverable. Please choose another address.");
            return;
        }

        if (!selectedStore) {
             Alert.alert("Store Error", "No store selected for this order.");
             return;
        }

        setPlacingOrder(true);
        try {
            
            const items = cartItems.map(item => {
                const productId = item.originalProduct?.id 
                    ? item.originalProduct.id 
                    : parseInt(item.id.split('-')[0] || item.id);

                return {
                    productId: productId,
                    productName: item.name,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    totalPrice: item.price * item.quantity,
                    modifiers: item.toppings ? item.toppings.map((t: any) => t.name).join(', ') : '',
                    specialInstructions: '',
                    imageUrl: item.image || '',
                    isVeg: item.isVeg !== undefined ? item.isVeg : null,
                    size: item.size || null,
                    crust: item.crust || null
                };
            });

            if (paymentMethod === 'COD') {
                // --- Cash on Delivery: create order directly ---
                const orderData = {
                    addressId: selectedAddress.id,
                    storeId: selectedStore.id,
                    items: items,
                    subtotal: totalAmount,
                    tax: tax,
                    deliveryFee: deliveryFee,
                    discount: 0,
                    total: finalTotal,
                    paymentMethod: 'COD',
                    specialInstructions: orderInstructions || ''
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
            } else {
                // --- Online Payment: PhonePe flow ---
                
                const sessionResponse = await paymentService.initiateSession(
                    finalTotal,
                    selectedAddress.phoneNumber || undefined
                );


                // Prepare order data for after payment
                const pendingOrderData: PendingOrderData = {
                    addressId: selectedAddress.id,
                    storeId: selectedStore.id,
                    subtotal: totalAmount,
                    tax: tax,
                    deliveryFee: deliveryFee,
                    discount: 0,
                    total: finalTotal,
                    specialInstructions: orderInstructions || '',
                    items: items.map(item => ({
                        productId: item.productId,
                        productName: item.productName,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice,
                        modifiers: item.modifiers || '',
                        specialInstructions: item.specialInstructions || '',
                        size: item.size || null,
                        crust: item.crust || null,
                    })),
                };

                // Navigate to the WebView payment screen
                navigation.navigate('PaymentWebView', {
                    url: sessionResponse.redirectUrl,
                    transactionId: sessionResponse.transactionId,
                    orderData: pendingOrderData,
                });
            }

        } catch (error: any) {
            console.error("Order/Payment failed", error);
            
            let errorMessage = "Failed to process your order. Please try again.";
            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.title) {
                    errorMessage = error.response.data.title;
                    if (error.response.data.errors) {
                         const details = Object.values(error.response.data.errors).flat().join('\n');
                         errorMessage += `\n${details}`;
                    }
                }
            } else if (error.message) {
                 errorMessage = error.message;
            }

            Alert.alert("Error", errorMessage);
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
                        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
                        contentContainerStyle={styles.addressListContent}
                        renderItem={({ item }) => {
                            const isDeliverable = item.isDeliverable !== false; // Default to true if undefined, safe check
                            return (
                            <TouchableOpacity 
                                style={[
                                    styles.modalAddressItem,
                                    selectedAddress?.id === item.id && styles.selectedModalAddress,
                                    !isDeliverable && styles.disabledAddressItem
                                ]}
                                onPress={() => {
                                    if (isDeliverable) {
                                        setSelectedAddress(item);
                                        setShowAddressModal(false);
                                    } else {
                                        Alert.alert("Not Deliverable", "We do not deliver to this address.");
                                    }
                                }}
                                activeOpacity={isDeliverable ? 0.7 : 1}
                            >
                                <View style={[styles.modalAddressIcon, !isDeliverable && styles.disabledAddressIcon]}>
                                    <MapPin size={20} color={!isDeliverable ? "#9ca3af" : (selectedAddress?.id === item.id ? "#fff" : "#3c7d48")} />
                                </View>
                                <View style={{ flex: 1, opacity: isDeliverable ? 1 : 0.6 }}>
                                    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                        <Text style={styles.addressType}>{item.type || 'Home'}</Text>
                                        {!isDeliverable && (
                                            <Text style={styles.notDeliverableText}>Not Deliverable</Text>
                                        )}
                                    </View>
                                    <Text style={styles.addressText}>
                                        {item.addressLine1}, {item.addressLine2}
                                    </Text>
                                    <Text style={styles.addressText}>
                                        {item.landmark}, {item.city} - {item.zipCode}
                                    </Text>
                                </View>
                                {selectedAddress?.id === item.id && (
                                    <CheckCircle2 size={20} color="#3c7d48" />
                                )}
                            </TouchableOpacity>
                        )}}
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
        <ScreenContainer useScrollView={false} containerStyle={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
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
                                    {selectedAddress.addressLine1}, {selectedAddress.addressLine2}
                                </Text>
                                <Text style={styles.addressText}>
                                    {selectedAddress.landmark}, {selectedAddress.city} - {selectedAddress.zipCode}
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

                {/* Order Instructions Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Instructions</Text>
                    <TextInput
                        style={styles.instructionInput}
                        placeholder="Add specific cooking instructions, allergies, or delivery notes..."
                        placeholderTextColor="#9ca3af"
                        multiline
                        numberOfLines={3}
                        value={orderInstructions}
                        onChangeText={setOrderInstructions}
                        textAlignVertical="top"
                    />
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
                                <Text style={styles.paymentText}>Pay Online (PhonePe)</Text>
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

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
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
        </ScreenContainer>
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
    instructionInput: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        minHeight: 80,
        fontSize: 14,
        color: '#374151',
    },
    disabledAddressItem: {
        backgroundColor: '#f3f4f6',
        borderColor: '#e5e7eb',
    },
    disabledAddressIcon: {
        backgroundColor: '#e5e7eb',
    },
    notDeliverableText: {
        fontSize: 10,
        color: '#ef4444',
        fontWeight: 'bold',
        backgroundColor: '#fee2e2',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        overflow: 'hidden',
    },
});

export default CheckoutScreen;
