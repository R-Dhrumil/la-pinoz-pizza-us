import apiClient from './apiClient';
import { Store } from '../context/StoreContext';

export const storeService = {
  getAllStores: async (): Promise<Store[]> => {
    try {
      const response = await apiClient.get('/storelocations');
      return response.data;
    } catch (error) {
      console.error('Error fetching stores:', error);
      return [];
    }
  },
};
