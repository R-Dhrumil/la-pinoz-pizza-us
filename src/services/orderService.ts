import apiClient from './apiClient';

export interface OrderItem {
    productId: number;
    productName: string;
    size?: string;
    crust?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    modifiers?: string;
    specialInstructions?: string;
    imageUrl?: string;
    isVeg: boolean;
}

export interface Address {
    id: number;
    fullName: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    landmark?: string;
    isDefault: boolean;
}

export interface Order {
    id: number;
    orderNumber: string;
    userId: string;
    address: Address;
    storeId: number;
    storeName?: string;
    subtotal: number;
    tax: number;
    deliveryFee: number;
    discount: number;
    total: number;
    paymentMethod: string;
    paymentStatus: string; // e.g., "Pending", "Paid", "Failed"
    orderStatus: string;   // e.g., "Placed", "Confirmed", "Preparing", "OutForDelivery", "Delivered", "Cancelled"
    specialInstructions?: string;
    promoCode?: string;
    createdAt: string;
    estimatedDeliveryTime?: string;
    deliveredAt?: string;
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
    specialInstructions?: string;
    promoCode?: string;
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
