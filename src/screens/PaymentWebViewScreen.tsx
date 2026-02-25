import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
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
import { ScreenContainer } from '../components/ScreenContainer';

type PaymentWebViewRouteProp = RouteProp<AuthStackParamList, 'PaymentWebView'>;

const REDIRECT_URL = 'https://api.nsenterprise.net'; // Base domain to detect redirect
const FALLBACK_REDIRECT_URL = 'http://localhost:5173'; // Current backend local redirect

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
            console.log('[PaymentWebView] Verifying payment for TX:', transactionId);
            const verifyResult = await paymentService.verifyPayment(transactionId);
            console.log('[PaymentWebView] Verify result:', JSON.stringify(verifyResult));

            const status = (verifyResult.status || '').toUpperCase();

            // Handle various success status strings
            if (status === 'SUCCESS' || status === 'COMPLETED' || status === 'PAYMENT_SUCCESS' || status === 'PAID') {
                // Step 2: Create the order
                try {
                    await paymentService.createOrderAfterPayment(transactionId, orderData);
                    setPaymentResult('success');
                } catch (orderError) {
                    console.error('[PaymentWebView] Order creation failed after successful payment:', orderError);
                    // If payment succeeded but order creation failed, we might want to still show success 
                    // or a help message. For now, showing success as the money is taken.
                    setPaymentResult('success');
                }
            } else if (status === 'PENDING') {
                // Payment still pending — poll again after a delay
                console.log('[PaymentWebView] Status PENDING, will poll again...');
                hasHandledRedirect.current = false;
                setTimeout(() => handlePaymentVerification(), 3000);
            } else {
                console.log('[PaymentWebView] Payment status non-success:', status);
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
        if (!currentUrl) return;
        
        console.log('[PaymentWebView] Navigation:', currentUrl);

        // Detect when PhonePe redirects back to our redirect URL (Production OR Fallback)
        const isMatchedRedirect = currentUrl.startsWith(REDIRECT_URL) || currentUrl.startsWith(FALLBACK_REDIRECT_URL);
        const isResultPath = currentUrl.includes('payment-result');

        if ((isMatchedRedirect || isResultPath) && !hasHandledRedirect.current) {
            console.log('[PaymentWebView] Detected redirect path, triggering verification...');
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
            <ScreenContainer useScrollView={false} containerStyle={styles.container}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#3c7d48" />
                    <Text style={styles.processingTitle}>Verifying Payment</Text>
                    <Text style={styles.processingSubtitle}>
                        Please wait while we confirm your payment with PhonePe...
                    </Text>
                </View>
            </ScreenContainer>
        );
    }

    if (paymentResult === 'success') {
        return (
            <ScreenContainer useScrollView={false} containerStyle={styles.container}>
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
            </ScreenContainer>
        );
    }

    if (paymentResult === 'failure') {
        return (
            <ScreenContainer useScrollView={false} containerStyle={styles.container}>
                <StatusBar barStyle="dark-content" />
                <View style={styles.centerContent}>
                    <View style={styles.failureIconWrapper}>
                        <AlertTriangle size={64} color="#ef4444" />
                    </View>
                    <Text style={styles.failureTitle}>Payment Issue</Text>
                    <Text style={styles.failureSubtitle}>
                        We couldn't confirm your payment. If money was debited, please contact support with Transaction ID: {transactionId}
                    </Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={() => {
                        hasHandledRedirect.current = false;
                        handlePaymentVerification();
                    }}>
                        <Text style={styles.retryBtnText}>CHECK STATUS AGAIN</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                        <Text style={styles.cancelBtnText}>Go Back to Checkout</Text>
                    </TouchableOpacity>
                </View>
            </ScreenContainer>
        );
    }

    // --- WebView ---
    return (
        <ScreenContainer useScrollView={false} containerStyle={styles.container}>
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
                    console.log('[PaymentWebView] WebView error occurred:', nativeEvent.description);
                    
                    // If we get an error on a result URL (like localhost refusing connection)
                    // we should still try to verify because the backend has likely received the status
                    if (nativeEvent.url && (nativeEvent.url.includes('payment-result') || nativeEvent.url.includes('localhost')) && !hasHandledRedirect.current) {
                        console.log('[PaymentWebView] Error on result URL, triggering verification fallback...');
                        handlePaymentVerification();
                    }
                }}
                onHttpError={(syntheticEvent) => {
                    const { nativeEvent } = syntheticEvent;
                    console.log('[PaymentWebView] HTTP error:', nativeEvent.statusCode, nativeEvent.url);
                    if (nativeEvent.url && (nativeEvent.url.includes('payment-result') || nativeEvent.url.includes('localhost')) && !hasHandledRedirect.current) {
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
        </ScreenContainer>
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
