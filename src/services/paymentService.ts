import apiClient from './apiClient';

// --- Types ---

export interface InitiateSessionRequest {
    amount: number;
    mobileNumber?: string | null;
}

export interface InitiateSessionResponse {
    sessionId: string;
    redirectUrl: string;
    transactionId: string;
}

export interface PendingOrderItem {
    productId: number;
    productName: string;
    size?: string | null;
    crust?: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    modifiers?: string | null;
    specialInstructions?: string | null;
}

export interface PendingOrderData {
    addressId: number;
    storeId: number;
    subtotal: number;
    tax: number;
    deliveryFee: number;
    discount: number;
    total: number;
    specialInstructions?: string | null;
    promoCode?: string | null;
    items: PendingOrderItem[];
}

export interface CreateOrderAfterPaymentRequest {
    transactionId: string;
    orderData: PendingOrderData;
}

export interface PaymentVerifyResponse {
    status: string;        // e.g. "SUCCESS", "PENDING", "FAILED"
    transactionId: string;
    amount: number;
    [key: string]: any;    // additional fields from backend
}

// --- Service ---

export const paymentService = {
    /**
     * Step 1: Initiate a PhonePe payment session via the backend.
     * Returns a redirect URL to load in a WebView and a transactionId.
     */
    initiateSession: async (amount: number, mobileNumber?: string): Promise<InitiateSessionResponse> => {
        try {
            const payload: InitiateSessionRequest = {
                amount,
                mobileNumber: mobileNumber || null,
            };
            const response = await apiClient.post('/Payment/initiate-session', payload);
            
            
            // The backend may return different field names — try common patterns
            const data = response.data;
            const result: InitiateSessionResponse = {
                sessionId: data.sessionId || data.session_id || data.merchantTransactionId || '',
                transactionId: data.transactionId || data.transaction_id || data.merchantTransactionId || '',
                redirectUrl: data.redirectUrl 
                    || data.redirect_url 
                    || data.url 
                    || data.paymentUrl
                    || data.checkoutUrl
                    || data?.instrumentResponse?.redirectInfo?.url
                    || data?.data?.instrumentResponse?.redirectInfo?.url
                    || '',
            };
            
            
            if (!result.redirectUrl) {
                throw new Error('No payment URL received from server. Please try again.');
            }
            
            return result;
        } catch (error) {
            console.error('[PaymentService] Error initiating session:', error);
            throw error;
        }
    },

    /**
     * Step 2: Verify the payment status after the user completes payment in the WebView.
     */
    verifyPayment: async (transactionId: string): Promise<PaymentVerifyResponse> => {
        try {
            const response = await apiClient.get(`/Payment/verify/${transactionId}`);
            return response.data;
        } catch (error) {
            console.error('[PaymentService] Error verifying payment:', error);
            throw error;
        }
    },

    /**
     * Step 3: Create the order after payment verification succeeds.
     */
    createOrderAfterPayment: async (
        transactionId: string,
        orderData: PendingOrderData
    ): Promise<any> => {
        try {
            const payload: CreateOrderAfterPaymentRequest = {
                transactionId,
                orderData,
            };
            const response = await apiClient.post('/Payment/create-order-after-payment', payload);
            return response.data;
        } catch (error) {
            console.error('[PaymentService] Error creating order after payment:', error);
            throw error;
        }
    },
};
