import apiClient from './apiClient';
import { Store } from '../types';
import { logger } from '../utils/logger';
import { getSkyTabUrl } from '../utils/urlHelper';

let cachedStores: Store[] | null = null;
let storesPromise: Promise<Store[]> | null = null;

export const storeService = {
  getAllStores: async (): Promise<Store[]> => {
    if (cachedStores) return cachedStores;
    if (storesPromise) return storesPromise;

    storesPromise = apiClient.get('/storelocations')
      .then(response => {
        const formatted = response.data.map((store: Store) => ({
          ...store,
          skyTabUrl: getSkyTabUrl(store.zipCode, store.city),
        }));
        cachedStores = formatted;
        return formatted;
      })
      .catch(error => {
        logger.error(error, 'storeService getAllStores');
        storesPromise = null; // allow retry on error
        return [];
      });

    return storesPromise;
  },
  clearCache: () => {
    cachedStores = null;
    storesPromise = null;
  }
};
