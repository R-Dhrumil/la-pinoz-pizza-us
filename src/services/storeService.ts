import apiClient from './apiClient';
import { Store } from '../types';
import { getSkyTabUrl } from '../utils/storeMapping';

export const storeService = {
  getAllStores: async (): Promise<Store[]> => {
    try {
      const response = await apiClient.get('/storelocations');
      return response.data.map((store: Store) => ({
        ...store,
        skyTabUrl: getSkyTabUrl(store.zipCode, store.city),
      }));
    } catch (error) {
      console.error('Error fetching stores:', error);
      return [];
    }
  },
};
