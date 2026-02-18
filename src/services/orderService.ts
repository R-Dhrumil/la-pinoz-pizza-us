import apiClient from './apiClient';

export interface OrderItem {
    productId: number;
    productName: string;
    size?: string | null;
    crust?: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    modifiers?: string | null;
    specialInstructions?: string | null;
    imageUrl?: string | null;
    isVeg: boolean;
}

export interface Address {
    id: number;
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    zipCode: string;
    landmark?: string | null;
    isDefault: boolean;
}

export interface Order {
    id: number;
    orderNumber: string;
    userId: string;
    address: Address;
    storeId: number;
    storeName?: string | null;
    subtotal: number;
    tax: number;
    deliveryFee: number;
    discount: number;
    total: number;
    paymentMethod: string | null;
    paymentStatus: string | null; // e.g., "Pending", "Paid", "Failed"
    orderStatus: string | null;   // e.g., "Placed", "Confirmed", "Preparing", "OutForDelivery", "Delivered", "Cancelled"
    specialInstructions?: string | null;
    promoCode?: string | null;
    createdAt: string;
    estimatedDeliveryTime?: string | null;
    deliveredAt?: string | null;
    items: OrderItem[];
}

export interface CreateOrderDto {
    addressId: number;
    storeId: number;
    subtotal: number;
    tax: number;
    deliveryFee: number;
    discount: number;
    total: number;
    paymentMethod: string;
    specialInstructions?: string | null;
    promoCode?: string | null;
    items: OrderItem[];
}

export const orderService = {
    getMyOrders: async (): Promise<Order[]> => {
        try {
            const response = await apiClient.get('/Orders');
            return response.data;
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    },

    getOrderById: async (id: number): Promise<Order> => {
        try {
            const response = await apiClient.get(`/Orders/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching order ${id}:`, error);
            throw error;
        }
    },

    createOrder: async (orderData: CreateOrderDto): Promise<Order> => {
        try {
            const response = await apiClient.post('/Orders', orderData);
            return response.data;
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },
    
    cancelOrder: async (id: number): Promise<void> => {
        try {
            await apiClient.put(`/Orders/${id}/cancel`);
        } catch (error) {
             console.error(`Error cancelling order ${id}:`, error);
             throw error;
        }
    }
};
