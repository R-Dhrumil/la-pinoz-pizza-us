import apiClient from './apiClient';

export interface Address {
    id?: number; // Optional for new addresses (before saving)
    fullName: string;
    phoneNumber: string;
    addressLine1: string; // House No, Street, etc.
    addressLine2?: string | null; // Locality, Area, etc.
    city: string;
    state: string;
    zipCode: string;
    landmark?: string | null;
    isDefault: boolean;
    // UI-only fields (not sent to backend directly unless we map them)
    type?: 'Home' | 'Work' | 'Other'; 
    coordinates?: {
        lat: number;
        lng: number;
    };
    isDeliverable?: boolean;
}

export const addressService = {
    getAddresses: async (): Promise<Address[]> => {
        try {
            const response = await apiClient.get('/Addresses');
            return response.data;
        } catch (error) {
            console.error('Error fetching addresses:', error);
            throw error;
        }
    },

    addAddress: async (address: Omit<Address, 'id'>): Promise<Address> => {
        try {
            const payload = {
                fullName: address.fullName,
                phoneNumber: address.phoneNumber,
                addressLine1: address.addressLine1,
                addressLine2: address.addressLine2,
                city: address.city,
                state: address.state,
                zipCode: address.zipCode,
                landmark: address.landmark,
                isDefault: address.isDefault
            };
            const response = await apiClient.post('/Addresses', payload);
            return response.data;
        } catch (error) {
            console.error('Error adding address:', error);
            throw error;
        }
    },

    deleteAddress: async (id: number): Promise<void> => {
        try {
            await apiClient.post(`/Addresses/Delete/${id}`);
        } catch (error: any) {
            console.error(`Error deleting address ${id}:`, error.response?.data || error.message);
            throw error;
        }
    },

    updateAddress: async (id: number, address: Omit<Address, 'id'>): Promise<Address> => {
        try {
            const payload = {
                fullName: address.fullName,
                phoneNumber: address.phoneNumber,
                addressLine1: address.addressLine1,
                addressLine2: address.addressLine2,
                city: address.city,
                state: address.state,
                zipCode: address.zipCode,
                landmark: address.landmark,
                isDefault: address.isDefault
            };
            const response = await apiClient.post(`/Addresses/Update/${id}`, payload);
            return response.data;
        } catch (error: any) {
            console.error(`Error updating address ${id}:`, error.response?.data || error.message);
            throw error;
        }
    }
};
