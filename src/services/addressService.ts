import apiClient from './apiClient';
import { Address } from '../context/AddressContext';

export const addressService = {
    getAddresses: async () => {
        const response = await apiClient.get('/addresses');
        return response.data;
    },

    addAddress: async (address: Omit<Address, 'id'>) => {
        const response = await apiClient.post('/addresses', address);
        return response.data;
    },

    updateAddress: async (id: string, address: Partial<Address>) => {
        const response = await apiClient.put(`/addresses/${id}`, address);
        return response.data;
    },

    deleteAddress: async (id: string) => {
        const response = await apiClient.delete(`/addresses/${id}`);
        return response.data;
    }
};
