import React, { useState, useEffect, useRef } from 'react';

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ActivityIndicator,
    ScrollView,
    Alert
} from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { orderService, Order } from '../services/orderService';
import { 
    ChevronLeft, 
    ClipboardList, 
    CheckCircle2, 
    ChefHat, 
    Truck, 
    PackageCheck,
    AlertCircle,
    RefreshCw
} from 'lucide-react-native';

type TrackOrderRouteProp = RouteProp<AuthStackParamList, 'TrackOrder'>;

// Define the steps and their corresponding API statuses
const TRACKING_STEPS = [
    { id: 'placed', label: 'Received', icon: ClipboardList },
    { id: 'confirmed', label: 'Accepted', icon: CheckCircle2 },
    { id: 'preparing', label: 'Preparing', icon: ChefHat },
    { id: 'outfordelivery', label: 'Out for Delivery', icon: Truck },
    { id: 'delivered', label: 'Delivered', icon: PackageCheck }
];

const TrackOrderScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
    const route = useRoute<TrackOrderRouteProp>();
    const { orderId } = route.params;

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [isPolling, setIsPolling] = useState(false);
    
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchOrderDetails = async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        else setIsPolling(true);

        try {
            const data = await orderService.getOrderById(orderId);
            setOrder(data);
            
            // If order is completed or cancelled, stop polling
            const status = data.orderStatus?.toLowerCase() || '';
            if (status === 'delivered' || status === 'completed' || status === 'cancelled' || status === 'failed') {
                stopPolling();
            }
        } catch (error) {
            console.error("Failed to fetch order details", error);
            if (!isBackground) {
                Alert.alert("Error", "Could not load order details.");
            }
        } finally {
            setLoading(false);
            setIsPolling(false);
        }
    };

    const startPolling = () => {
        if (intervalRef.current) return;
        // Poll every 10 seconds
        intervalRef.current = setInterval(() => {
            fetchOrderDetails(true);
        }, 10000);
    };

    const stopPolling = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => {
        fetchOrderDetails();
        startPolling();

        return () => {
            stopPolling();
        };
    }, [orderId]);

    // Determine current step index
    const getCurrentStepIndex = () => {
        if (!order || !order.orderStatus) return 0; // Default to first step
        
        const status = order.orderStatus.toLowerCase();
        
        // Handle edge cases
        if (status === 'pending') return 0;
        if (status === 'completed') return TRACKING_STEPS.length - 1;
        
        const index = TRACKING_STEPS.findIndex(step => step.id === status);
        return index !== -1 ? index : 0;
    };

    const currentStepIndex = getCurrentStepIndex();
    const isCancelled = order?.orderStatus?.toLowerCase() === 'cancelled' || order?.orderStatus?.toLowerCase() === 'failed';

    if (loading && !order) {
        return (
            <ScreenContainer useScrollView={false} containerStyle={styles.centeredContainer}>
                <ActivityIndicator size="large" color="#3c7d48" />
                <Text style={styles.loadingText}>Loading order details...</Text>
            </ScreenContainer>
        );
    }

    if (!order) {
         return (
             <ScreenContainer useScrollView={false} containerStyle={styles.centeredContainer}>
                <AlertCircle size={48} color="#ef4444" />
                <Text style={styles.errorText}>Could not find order #{orderId}</Text>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtnText}>Go Back</Text>
                </TouchableOpacity>
             </ScreenContainer>
         );
    }

    return (
        <ScreenContainer useScrollView={false} containerStyle={styles.container}>
            
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconBtn}>
                    <ChevronLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Track Order #{order.orderNumber || order.id}</Text>
                <View style={styles.headerRight}>
                    {isPolling ? (
                        <ActivityIndicator size="small" color="#3c7d48" />
                    ) : (
                        <TouchableOpacity onPress={() => fetchOrderDetails(false)} style={styles.headerIconBtn}>
                            <RefreshCw size={20} color="#6b7280" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Status Summary Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Estimated Delivery</Text>
                    <Text style={styles.etaText}>
                        {order.estimatedDeliveryTime 
                            ? new Date(order.estimatedDeliveryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                            : 'Calculating...'}
                    </Text>
                    {isCancelled ? (
                         <View style={[styles.statusBadge, { backgroundColor: '#fee2e2' }]}>
                             <AlertCircle size={16} color="#ef4444" style={{marginRight: 6}} />
                             <Text style={[styles.statusText, { color: '#ef4444' }]}>Order Cancelled</Text>
                         </View>
                    ) : (
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>
                                {order.orderStatus ? order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1) : 'Processing'}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Tracking Stepper */}
                {!isCancelled && (
                    <View style={styles.stepperContainer}>
                        <View style={styles.stepperWrapper}>
                            {TRACKING_STEPS.map((step, index) => {
                                const isCompleted = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;
                                const Icon = step.icon;
                                
                                return (
                                    <View key={step.id} style={styles.stepItem}>
                                        
                                        {/* Connecting Line (don't show for first item) */}
                                        {index > 0 && (
                                            <View style={[
                                                styles.stepLine, 
                                                isCompleted ? styles.stepLineActive : styles.stepLineInactive
                                            ]} />
                                        )}

                                        {/* Icon Circle */}
                                        <View style={[
                                            styles.iconCircle,
                                            isCompleted ? styles.iconCircleActive : styles.iconCircleInactive,
                                            isCurrent && styles.iconCircleCurrent
                                        ]}>
                                            <Icon 
                                                size={20} 
                                                color={isCompleted ? '#fff' : '#9ca3af'} 
                                            />
                                        </View>
                                        
                                        {/* Label */}
                                        <Text style={[
                                            styles.stepLabel,
                                            isCompleted ? styles.stepLabelActive : styles.stepLabelInactive,
                                            isCurrent && styles.stepLabelCurrent
                                        ]}>
                                            {step.label}
                                        </Text>

                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Delivery Info */}
                {order.address && (
                    <View style={styles.infoSection}>
                        <Text style={styles.sectionTitle}>Delivering to</Text>
                        <View style={styles.infoCard}>
                            <Text style={styles.infoTitle}>{order.address.fullName}</Text>
                            <Text style={styles.infoText}>{order.address.addressLine1}</Text>
                            {order.address.addressLine2 ? <Text style={styles.infoText}>{order.address.addressLine2}</Text> : null}
                            <Text style={styles.infoText}>{order.address.city}, {order.address.state} {order.address.zipCode}</Text>
                        </View>
                    </View>
                )}

                {/* Items Summary (Collapsed) */}
                 <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    <View style={styles.infoCard}>
                        {order.items?.map((item, idx) => (
                             <Text key={idx} style={styles.itemText} numberOfLines={1}>
                                 {item.quantity}x {item.productName}
                             </Text>
                        ))}
                    </View>
                </View>

            </ScrollView>
        </ScreenContainer>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        padding: 24,
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
    headerIconBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    headerRight: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: '#6b7280',
    },
    errorText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 24,
    },
    backBtn: {
        backgroundColor: '#3c7d48',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backBtnText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    summaryLabel: {
        fontSize: 13,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: '600',
        marginBottom: 8,
    },
    etaText: {
        fontSize: 32,
        fontWeight: '900',
        color: '#111827',
        marginBottom: 16,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#edf7ed',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    statusText: {
        color: '#3c7d48',
        fontWeight: 'bold',
        fontSize: 14,
    },
    stepperContainer: {
        backgroundColor: '#fff',
        borderRadius: 16,
        paddingVertical: 32,
        paddingHorizontal: 12,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    stepperWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    stepItem: {
        flex: 1,
        alignItems: 'center',
        position: 'relative',
    },
    stepLine: {
        position: 'absolute',
        top: 22, // Half of icon height (44/2)
        left: '-50%',
        right: '50%',
        height: 3,
        zIndex: 1,
    },
    stepLineActive: {
        backgroundColor: '#3c7d48',
    },
    stepLineInactive: {
        backgroundColor: '#e5e7eb',
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
        borderWidth: 2,
    },
    iconCircleActive: {
        backgroundColor: '#3c7d48',
        borderColor: '#3c7d48',
    },
    iconCircleInactive: {
        backgroundColor: '#fff',
        borderColor: '#e5e7eb',
    },
    iconCircleCurrent: {
        shadowColor: '#3c7d48',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    stepLabel: {
        marginTop: 10,
        fontSize: 11,
        textAlign: 'center',
        minHeight: 32, // Prevent layout shift if text wraps
    },
    stepLabelActive: {
        color: '#374151',
        fontWeight: '600',
    },
    stepLabelCurrent: {
        color: '#3c7d48',
        fontWeight: 'bold',
    },
    stepLabelInactive: {
        color: '#9ca3af',
    },
    infoSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
        marginLeft: 4,
    },
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    infoTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 6,
    },
    infoText: {
        fontSize: 13,
        color: '#4b5563',
        marginBottom: 4,
        lineHeight: 18,
    },
    itemText: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 6,
    }
});

export default TrackOrderScreen;
