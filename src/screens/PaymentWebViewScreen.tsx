import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../navigation/AuthNavigator';
import { ArrowLeft, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { paymentService, PendingOrderData } from '../services/paymentService';
import { useCart } from '../context/CartContext';

type PaymentWebViewRouteProp = RouteProp<AuthStackParamList, 'PaymentWebView'>;

const REDIRECT_URL = 'https://api.nsenterprise.net'; // Base domain to detect redirect

const PaymentWebViewScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
    const route = useRoute<PaymentWebViewRouteProp>();
    const { url, transactionId, orderData } = route.params;
    const { clearCart } = useCart();

    console.log('[PaymentWebView] Loading URL:', url);
    console.log('[PaymentWebView] TransactionId:', transactionId);

    const webViewRef = useRef<WebView>(null);
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [paymentResult, setPaymentResult] = useState<'success' | 'failure' | null>(null);
    const hasHandledRedirect = useRef(false);

    const handlePaymentVerification = useCallback(async () => {
        if (hasHandledRedirect.current) return;
        hasHandledRedirect.current = true;
        setPaymentProcessing(true);

        try {
            // Step 1: Verify the payment
            const verifyResult = await paymentService.verifyPayment(transactionId);
            console.log('[PaymentWebView] Verify result:', JSON.stringify(verifyResult));

            const status = (verifyResult.status || '').toUpperCase();

            if (status === 'SUCCESS' || status === 'COMPLETED' || status === 'PAYMENT_SUCCESS') {
                // Step 2: Create the order
                try {
                    await paymentService.createOrderAfterPayment(transactionId, orderData);
                    setPaymentResult('success');
                } catch (orderError) {
                    console.error('[PaymentWebView] Order creation failed after successful payment:', orderError);
                    // Payment succeeded but order creation failed - still show success
                    // The backend should handle this gracefully  
                    setPaymentResult('success');
                }
            } else if (status === 'PENDING') {
                // Payment still pending — poll again after a delay
                hasHandledRedirect.current = false;
                setTimeout(() => handlePaymentVerification(), 3000);
                return;
            } else {
                setPaymentResult('failure');
            }
        } catch (error) {
            console.error('[PaymentWebView] Payment verification failed:', error);
            setPaymentResult('failure');
        } finally {
            setPaymentProcessing(false);
        }
    }, [transactionId, orderData]);

    const handleNavigationChange = (navState: any) => {
        const { url: currentUrl } = navState;
        console.log('[PaymentWebView] Navigation:', currentUrl);

        // Detect when PhonePe redirects back to our redirect URL
        if (currentUrl && currentUrl.startsWith(REDIRECT_URL) && !hasHandledRedirect.current) {
            handlePaymentVerification();
        }
    };

    const handleGoBack = () => {
        if (paymentResult === null && !paymentProcessing) {
            Alert.alert(
                'Cancel Payment?',
                'Are you sure you want to cancel this payment?',
                [
                    { text: 'No', style: 'cancel' },
                    {
                        text: 'Yes, Cancel',
                        style: 'destructive',
                        onPress: () => navigation.goBack(),
                    },
                ]
            );
        } else {
            navigation.goBack();
        }
    };

    const handleSuccessDone = () => {
        clearCart();
        navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }, { name: 'MyOrders' }],
        });
    };

    const handleRetry = () => {
        navigation.goBack();
    };

    // --- Result screens ---
    if (paymentProcessing) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#3c7d48" />
                    <Text style={styles.processingTitle}>Verifying Payment</Text>
                    <Text style={styles.processingSubtitle}>
                        Please wait while we confirm your payment...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (paymentResult === 'success') {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.centerContent}>
                    <View style={styles.successIconWrapper}>
                        <CheckCircle2 size={64} color="#3c7d48" />
                    </View>
                    <Text style={styles.successTitle}>Payment Successful!</Text>
                    <Text style={styles.successSubtitle}>
                        Your order has been placed successfully. You will receive a confirmation shortly.
                    </Text>
                    <TouchableOpacity style={styles.doneBtn} onPress={handleSuccessDone}>
                        <Text style={styles.doneBtnText}>VIEW MY ORDERS</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (paymentResult === 'failure') {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.centerContent}>
                    <View style={styles.failureIconWrapper}>
                        <AlertTriangle size={64} color="#ef4444" />
                    </View>
                    <Text style={styles.failureTitle}>Payment Failed</Text>
                    <Text style={styles.failureSubtitle}>
                        Your payment could not be completed. Please try again or choose a different payment method.
                    </Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={handleRetry}>
                        <Text style={styles.retryBtnText}>TRY AGAIN</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                        <Text style={styles.cancelBtnText}>Go Back to Checkout</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // --- WebView ---
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
                    <ArrowLeft size={24} color="#000" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <ShieldCheck size={16} color="#3c7d48" />
                    <Text style={styles.headerTitle}>Secure Payment</Text>
                </View>
                <View style={{ width: 32 }} />
            </View>

            <WebView
                ref={webViewRef}
                source={{ uri: url }}
                style={styles.webview}
                onNavigationStateChange={handleNavigationChange}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                thirdPartyCookiesEnabled={true}
                mixedContentMode="always"
                startInLoadingState={true}
                renderLoading={() => (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#3c7d48" />
                        <Text style={styles.loadingText}>Loading payment page...</Text>
                    </View>
                )}
                originWhitelist={['*']}
                setSupportMultipleWindows={false}
                allowsInlineMediaPlayback={true}
                cacheEnabled={true}
                scalesPageToFit={true}
                userAgent="Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
                onError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.error('[PaymentWebView] WebView error:', nativeEvent);
                }}
                onHttpError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.log('[PaymentWebView] HTTP error:', nativeEvent.statusCode, nativeEvent.url);
                    // If the redirect URL returns an error, it might be from PhonePe callback
                    if (nativeEvent.url && nativeEvent.url.startsWith(REDIRECT_URL) && !hasHandledRedirect.current) {
                        handlePaymentVerification();
                    }
                }}
            />

            <View style={styles.secureFooter}>
                <ShieldCheck size={14} color="#6b7280" />
                <Text style={styles.secureFooterText}>
                    Secured by PhonePe Payment Gateway
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    backBtn: {
        padding: 4,
        width: 32,
    },
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    webview: {
        flex: 1,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6b7280',
    },
    secureFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 8,
        backgroundColor: '#f9fafb',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    secureFooterText: {
        fontSize: 12,
        color: '#6b7280',
    },
    // --- Center content (processing / result) ---
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    processingTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginTop: 20,
    },
    processingSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    // Success
    successIconWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#f0fdf4',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3c7d48',
        marginTop: 12,
    },
    successSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    doneBtn: {
        backgroundColor: '#3c7d48',
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 32,
        shadowColor: '#3c7d48',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    doneBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    // Failure
    failureIconWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fef2f2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    failureTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ef4444',
        marginTop: 12,
    },
    failureSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    retryBtn: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 32,
    },
    retryBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    cancelBtn: {
        marginTop: 16,
        paddingVertical: 10,
    },
    cancelBtnText: {
        color: '#6b7280',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default PaymentWebViewScreen;
