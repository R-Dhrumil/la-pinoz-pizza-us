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
    SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { orderService, Order } from '../services/orderService';
import { ChevronLeft, Clock, MapPin, Receipt, ShoppingBag, AlertCircle } from 'lucide-react-native';
import PageLayout from '../components/PageLayout';
import MyOrdersSkeleton from '../components/MyOrdersSkeleton';

const MyOrdersScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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
                    <Text style={styles.orderNumber}>#{item.orderNumber || item.id}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.orderStatus) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.orderStatus) }]}>
                        {item.orderStatus}
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
                 <TouchableOpacity style={styles.reorderBtn}>
                     <Text style={styles.reorderText}>Reorder</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={styles.trackBtn}>
                     <Text style={styles.trackText}>Track Order</Text>
                 </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
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
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3c7d48']} />
                    }
                />
            )}
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
    reorderBtn: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderRightWidth: 1,
        borderRightColor: '#f3f4f6',
    },
    reorderText: {
        color: '#3c7d48',
        fontWeight: 'bold',
        fontSize: 14,
    },
    trackBtn: {
        flex: 1,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    trackText: {
        color: '#374151',
        fontWeight: '600', // Slightly less bold than reorder
        fontSize: 14,
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
});

export default MyOrdersScreen;
