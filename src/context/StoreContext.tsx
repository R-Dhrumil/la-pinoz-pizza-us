import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { storeService } from '../services/storeService';
import getCurrentLocation from '../services/getCurrentLocation';
import { calculateDistance } from '../utils/calculateDistance';
import { requestLocationPermission } from '../utils/requestLocation';
import { Store } from '../types';

interface StoreContextType {
  selectedStore: Store | null;
  setSelectedStore: (store: Store | null) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  useEffect(() => {
    const initializeStore = async () => {
      try {
        // 1. Fetch all stores (including dummy ones)
        const stores = await storeService.getAllStores();
        
        // 2. Request Location Permission
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
             // If no permission, maybe just select the first one or do nothing
             if (stores.length > 0 && !selectedStore) {
                 // Optional: Default to first store if no location?
                 // setSelectedStore(stores[0]);
             }
             return;
        }

        // 3. Get Current Location
        const location = await getCurrentLocation();
        if (!location) return;

        // 4. Find Nearest Store
        let nearestStore: Store | null = null;
        let minDistance = Infinity;

        for (const store of stores) {
          if (store.latitude && store.longitude) {
            const distance = calculateDistance(
              location.latitude,
              location.longitude,
              store.latitude,
              store.longitude
            );
            if (distance < minDistance) {
              minDistance = distance;
              nearestStore = store;
            }
          }
        }

        // 5. Set Selected Store
        if (nearestStore) {
            console.log('Auto-selected nearest store:', nearestStore.name);
            setSelectedStore(nearestStore);
        }

      } catch (error) {
        console.error('Error initializing store:', error);
      }
    };

    initializeStore();
  }, []); // Run once on mount

  return (
    <StoreContext.Provider value={{ selectedStore, setSelectedStore }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
