import apiClient from './apiClient';
import { CartItem } from '../context/CartContext';

export interface OrderItem {
    productId: string;
    quantity: number;
    price: number;
}

export interface PlaceOrderParams {
    items: CartItem[];
    totalAmount: number;
    addressId: string;
    paymentMethod: string;
}

export const orderService = {
    placeOrder: async (orderData: PlaceOrderParams) => {
        const response = await apiClient.post('/orders', orderData);
        return response.data;
    },

    getOrderHistory: async () => {
        const response = await apiClient.get('/orders/history');
        return response.data;
    },

    getOrderById: async (id: string) => {
        const response = await apiClient.get(`/orders/${id}`);
        return response.data;
    },

    trackOrder: async (id: string) => {
        const response = await apiClient.get(`/orders/${id}/track`);
        return response.data;
    }
};
