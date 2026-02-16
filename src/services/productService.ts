import apiClient from './apiClient';

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    categories: string[];
    isVeg: boolean;
    rating?: number;
}

export const productService = {
    getAllProducts: async (filters?: any) => {
        const response = await apiClient.get('/products', { params: filters });
        return response.data;
    },

    getProductById: async (id: string) => {
        const response = await apiClient.get(`/products/${id}`);
        return response.data;
    },

    getCategories: async () => {
        const response = await apiClient.get('/products/categories');
        return response.data;
    },

    searchProducts: async (query: string) => {
        const response = await apiClient.get('/products/search', { params: { q: query } });
        return response.data;
    },
    
    getBestSellers: async (storeId?: number) => {
        const response = await apiClient.get('/Products', { 
            params: { 
                isBestSeller: true,
                storeId: storeId 
            } 
        });
        return response.data;
    }
};
