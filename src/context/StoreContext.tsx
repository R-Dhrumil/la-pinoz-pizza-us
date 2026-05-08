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
        // 1. Fetch all stores
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
        if (!location) {
             const richmondStore = stores.find(s => 
               (s.name && s.name.toLowerCase().includes('richmond')) || 
               (s.city && s.city.toLowerCase().includes('richmond'))
             );
             if (richmondStore) {
                 console.log('Location failed, defaulting to Richmond store:', richmondStore.name);
                 setSelectedStore(richmondStore);
             }
             return;
        }

        // 4. Find Nearest Store
        let nearestStore: Store | null = null;
        let minDistance = Infinity;

        for (const store of stores) {
          if (store.latitude && store.longitude && (store.latitude !== 0 || store.longitude !== 0)) {
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
        const MAX_VALID_DISTANCE_KM = 500;
        
        if (nearestStore && minDistance <= MAX_VALID_DISTANCE_KM) {
            console.log('Auto-selected nearest store:', nearestStore.name);
            setSelectedStore(nearestStore);
        } else {
            // Find Richmond store as fallback
            const richmondStore = stores.find(s => 
              (s.name && s.name.toLowerCase().includes('richmond')) || 
              (s.city && s.city.toLowerCase().includes('richmond'))
            );
            if (richmondStore) {
                console.log('Distance too large, defaulting to Richmond store:', richmondStore.name);
                setSelectedStore(richmondStore);
            } else if (nearestStore) {
                console.log('No Richmond store found, falling back to nearest even if far:', nearestStore.name);
                setSelectedStore(nearestStore);
            }
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
