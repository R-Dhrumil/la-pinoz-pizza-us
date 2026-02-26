import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
    StatusBar,
    Image,
    Modal,
    ScrollView
} from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { orderService, Order } from '../services/orderService';
import { ChevronLeft, Clock, MapPin, Receipt, ShoppingBag, AlertCircle, X } from 'lucide-react-native';
import MyOrdersSkeleton from '../components/MyOrdersSkeleton';

const MyOrdersScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await orderService.getMyOrders();
            // Sort by date descending
            const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setOrders(sorted);
            
        } catch (error) {
            console.error("Failed to load orders", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        setLoading(true); // Show skeleton on refresh
        fetchOrders();
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const getStatusColor = (status: string) => {
        const lower = status.toLowerCase();
        if (lower === 'delivered' || lower === 'completed') return '#3c7d48'; // Green
        if (lower === 'cancelled' || lower === 'failed') return '#ef4444'; // Red
        if (lower === 'preparing') return '#f59e0b'; // Amber
        return '#3b82f6'; // Blue for others (Placed, etc.)
    };

    const renderOrderItem = ({ item }: { item: Order }) => (
        <TouchableOpacity 
            style={styles.card}
            activeOpacity={0.9}
            // onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })} // Future implementation
        >
            <View style={styles.cardHeader}>
                <View style={styles.orderIdRow}>
                    <Receipt size={16} color="#6b7280" />
                    <Text style={styles.orderNumber}>#{String(item.orderNumber || item.id)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.orderStatus || 'pending') + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.orderStatus || 'pending') }]}>
                        {item.orderStatus || 'Pending'}
                    </Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Clock size={14} color="#9ca3af" />
                    <Text style={styles.infoText}>{formatDate(item.createdAt)}</Text>
                </View>
                
                <View style={styles.infoRow}>
                    <MapPin size={14} color="#9ca3af" />
                    <Text style={styles.infoText} numberOfLines={1}>
                        {item.storeName ? item.storeName : `Store #${item.storeId}`}
                    </Text>
                </View>

                {item.items && item.items.length > 0 && (
                     <View style={styles.itemsPreview}>
                        <Text style={styles.itemsText} numberOfLines={2}>
                            {item.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                        </Text>
                     </View>
                )}
            </View>

            <View style={styles.optionRow}>
                {item.items && item.items.length > 0 && (
                     <Text style={styles.itemCount}>
                        {item.items.reduce((acc, curr) => acc + curr.quantity, 0)} Items
                     </Text>
                )}
                <Text style={styles.totalAmount}>${item.total.toFixed(2)}</Text>
            </View>
            
            <View style={styles.cardFooter}>
                 <TouchableOpacity style={styles.footerBtn}>
                     <Text style={styles.reorderText}>Reorder</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={styles.footerBtn}>
                     <Text style={styles.trackText}>Track Order</Text>
                 </TouchableOpacity>
                 <TouchableOpacity 
                     style={styles.footerBtnLast}
                     onPress={() => setSelectedOrder(item)}
                 >
                     <Text style={styles.viewDetailsText}>View Details</Text>
                 </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScreenContainer useScrollView={false} containerStyle={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Orders</Text>
                <View style={{ width: 40 }} /> 
            </View>

            {loading ? (
                <MyOrdersSkeleton />
            ) : orders.length === 0 ? (
                <View style={styles.centered}>
                    <ShoppingBag size={64} color="#e5e7eb" />
                    <Text style={styles.emptyTitle}>No orders yet</Text>
                    <Text style={styles.emptyText}>Looks like you haven't placed any orders yet.</Text>
                    <TouchableOpacity 
                        style={styles.browseBtn}
                        onPress={() => navigation.navigate('MainTabs')}
                    >
                        <Text style={styles.browseBtnText}>Browse Menu</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderOrderItem}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3c7d48']} />
                    }
                />
            )}

            {/* Order Details Modal */}
            <Modal
                visible={!!selectedOrder}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setSelectedOrder(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Order Details</Text>
                            <TouchableOpacity onPress={() => setSelectedOrder(null)} style={styles.closeBtn}>
                                <X size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        
                        {selectedOrder && (
                            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                                <View style={styles.modalSection}>
                                    <View style={styles.modalRow}>
                                        <Text style={styles.modalLabel}>Order #</Text>
                                        <Text style={styles.modalValue}>{selectedOrder.orderNumber || selectedOrder.id}</Text>
                                    </View>
                                    <View style={styles.modalRow}>
                                        <Text style={styles.modalLabel}>Date</Text>
                                        <Text style={styles.modalValue}>{formatDate(selectedOrder.createdAt)}</Text>
                                    </View>
                                    <View style={styles.modalRow}>
                                        <Text style={styles.modalLabel}>Status</Text>
                                        <Text style={[styles.modalValue, { color: getStatusColor(selectedOrder.orderStatus || 'pending'), textTransform: 'capitalize', fontWeight: 'bold' }]}>
                                            {selectedOrder.orderStatus || 'Pending'}
                                        </Text>
                                    </View>
                                    <View style={styles.modalRow}>
                                        <Text style={styles.modalLabel}>Payment</Text>
                                        <Text style={styles.modalValue}>{selectedOrder.paymentMethod || 'N/A'} - {selectedOrder.paymentStatus || 'Pending'}</Text>
                                    </View>
                                </View>

                                {selectedOrder.address && (
                                    <View style={styles.modalSection}>
                                        <Text style={styles.modalSectionTitle}>Delivery Address</Text>
                                        <Text style={styles.addressText}><Text style={{fontWeight: 'bold'}}>{selectedOrder.address.fullName}</Text></Text>
                                        <Text style={styles.addressText}>{selectedOrder.address.addressLine1}</Text>
                                        {selectedOrder.address.addressLine2 ? <Text style={styles.addressText}>{selectedOrder.address.addressLine2}</Text> : null}
                                        <Text style={styles.addressText}>{selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.zipCode}</Text>
                                        <Text style={styles.addressText}>Phone: {selectedOrder.address.phoneNumber}</Text>
                                    </View>
                                )}

                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionTitle}>Items</Text>
                                    {selectedOrder.items?.map((item, index) => (
                                        <View key={index} style={styles.orderItem}>
                                            <View style={styles.orderItemMain}>
                                                <View style={styles.orderItemLeft}>
                                                    {item.isVeg !== null && item.isVeg !== undefined && (
                                                        <View style={[styles.vegIcon, { borderColor: item.isVeg ? '#3c7d48' : '#ef4444' }]}>
                                                            <View style={[styles.vegDot, { backgroundColor: item.isVeg ? '#3c7d48' : '#ef4444' }]} />
                                                        </View>
                                                    )}
                                                    <Text style={styles.orderItemName}>{item.quantity} x {item.productName}</Text>
                                                </View>
                                                <Text style={styles.orderItemPrice}>${item.totalPrice.toFixed(2)}</Text>
                                            </View>
                                            {(item.size || item.crust) ? (
                                                <Text style={styles.itemMeta}>{item.size ? item.size : ''} {item.crust ? `| ${item.crust}` : ''}</Text>
                                            ) : null}
                                            {item.modifiers ? (
                                                <Text style={styles.itemMeta}>Modifiers: {item.modifiers}</Text> 
                                            ) : null}
                                        </View>
                                    ))}
                                </View>

                                <View style={styles.modalSection}>
                                    <Text style={styles.modalSectionTitle}>Bill Details</Text>
                                    <View style={styles.billRow}>
                                        <Text style={styles.billLabel}>Item Total</Text>
                                        <Text style={styles.billValue}>${selectedOrder.subtotal?.toFixed(2) || '0.00'}</Text>
                                    </View>
                                    <View style={styles.billRow}>
                                        <Text style={styles.billLabel}>Tax</Text>
                                        <Text style={styles.billValue}>${selectedOrder.tax?.toFixed(2) || '0.00'}</Text>
                                    </View>
                                    <View style={styles.billRow}>
                                        <Text style={styles.billLabel}>Delivery Fee</Text>
                                        <Text style={styles.billValue}>${selectedOrder.deliveryFee?.toFixed(2) || '0.00'}</Text>
                                    </View>
                                    {selectedOrder.discount > 0 && (
                                        <View style={styles.billRow}>
                                            <Text style={styles.billLabel}>Discount</Text>
                                            <Text style={styles.discountValue}>-${selectedOrder.discount?.toFixed(2)}</Text>
                                        </View>
                                    )}
                                    <View style={[styles.divider, { marginVertical: 12 }]} />
                                    <View style={styles.billRowTotal}>
                                        <Text style={styles.billTotalLabel}>Grand Total</Text>
                                        <Text style={styles.billTotalValue}>${selectedOrder.total?.toFixed(2) || '0.00'}</Text>
                                    </View>
                                </View>
                                
                                <View style={{height: 40}} />
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
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
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    orderIdRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    orderNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    divider: {
        height: 1,
        backgroundColor: '#f3f4f6',
    },
    cardBody: {
        padding: 16,
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        fontSize: 13,
        color: '#6b7280',
    },
    itemsPreview: {
        marginTop: 4,
        padding: 8,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
    },
    itemsText: {
        fontSize: 13,
        color: '#4b5563',
        lineHeight: 18,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    itemCount: {
        fontSize: 12,
        color: '#9ca3af',
        fontWeight: '600',
    },
    totalAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    cardFooter: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    footerBtn: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: '#f3f4f6',
    },
    footerBtnLast: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    reorderText: {
        color: '#3c7d48',
        fontWeight: 'bold',
        fontSize: 13,
    },
    trackText: {
        color: '#374151',
        fontWeight: '600',
        fontSize: 13,
    },
    viewDetailsText: {
        color: '#3b82f6',
        fontWeight: '600',
        fontSize: 13,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    browseBtn: {
        backgroundColor: '#3c7d48',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    browseBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
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
        height: '85%',
        paddingTop: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    closeBtn: {
        padding: 4,
    },
    modalScroll: {
        padding: 20,
    },
    modalSection: {
        marginBottom: 24,
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 12,
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    modalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    modalLabel: {
        fontSize: 14,
        color: '#6b7280',
    },
    modalValue: {
        fontSize: 14,
        color: '#111827',
        fontWeight: '500',
    },
    addressText: {
        fontSize: 14,
        color: '#4b5563',
        marginBottom: 4,
        lineHeight: 20,
    },
    orderItem: {
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingBottom: 12,
    },
    orderItemMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    orderItemLeft: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
        paddingRight: 12,
    },
    vegIcon: {
        width: 12,
        height: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        marginTop: 4,
    },
    vegDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    orderItemName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        flex: 1,
        lineHeight: 20,
    },
    orderItemPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#111827',
    },
    itemMeta: {
        fontSize: 13,
        color: '#6b7280',
        marginLeft: 20,
        marginTop: 2,
    },
    billRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    billLabel: {
        fontSize: 14,
        color: '#4b5563',
    },
    billValue: {
        fontSize: 14,
        color: '#111827',
    },
    discountValue: {
        fontSize: 14,
        color: '#10b981',
        fontWeight: '500',
    },
    billRowTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    billTotalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    billTotalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3c7d48',
    },
});

export default MyOrdersScreen;
