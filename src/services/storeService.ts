import apiClient from './apiClient';
import { Store } from '../types';
import { logger } from '../utils/logger';
import { getSkyTabUrl } from '../utils/urlHelper';

export const storeService = {
  getAllStores: async (): Promise<Store[]> => {
    try {
      const response = await apiClient.get('/storelocations');
      return response.data.map((store: Store) => ({
        ...store,
        skyTabUrl: getSkyTabUrl(store.zipCode, store.city),
      }));
    } catch (error) {
      logger.error(error, 'storeService getAllStores');
      return [];
    }
  },
};
