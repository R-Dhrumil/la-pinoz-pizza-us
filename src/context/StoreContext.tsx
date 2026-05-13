import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { storeService } from '../services/storeService';
import getCurrentLocation from '../services/getCurrentLocation';
import { calculateDistance } from '../utils/calculateDistance';
import { requestLocationPermission } from '../utils/requestLocation';
import { Store } from '../types';

interface StoreContextType {
  selectedStore: Store | null;
  setSelectedStore: (store: Store | null) => void;
  storeReady: boolean; // true once initialization attempt has completed
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [storeReady, setStoreReady] = useState(false);

  useEffect(() => {
    // SplashScreen2 calls setSelectedStore() before navigating to MainTabs.
    // This effect acts as a fallback — it runs in parallel with the splash,
    // but skips initialization if SplashScreen2 already set a store.
    // Timeout gives SplashScreen2's setSelectedStore call time to propagate.
    const timer = setTimeout(async () => {
      // If splash already set a store, do nothing
      if (selectedStore) {
        setStoreReady(true);
        return;
      }

      try {
        const stores = await storeService.getAllStores();
        if (!stores || stores.length === 0) {
          setStoreReady(true);
          return;
        }

        const findRichmond = (list: Store[]) =>
          list.find(
            s =>
              (s.name && s.name.toLowerCase().includes('richmond')) ||
              (s.city && s.city.toLowerCase().includes('richmond')),
          ) || list[0];

        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
          setSelectedStore(findRichmond(stores));
          setStoreReady(true);
          return;
        }

        const location = await getCurrentLocation().catch(() => null);
        if (!location) {
          setSelectedStore(findRichmond(stores));
          setStoreReady(true);
          return;
        }

        let nearest: Store | null = null;
        let minDist = Infinity;
        for (const store of stores) {
          if (store.latitude && store.longitude) {
            const d = calculateDistance(
              location.latitude,
              location.longitude,
              store.latitude,
              store.longitude,
            );
            if (d < minDist) {
              minDist = d;
              nearest = store;
            }
          }
        }

        const MAX_KM = 500;
        setSelectedStore(
          nearest && minDist <= MAX_KM ? nearest : findRichmond(stores),
        );
      } catch (err) {
        console.error('[StoreContext] fallback init error:', err);
      } finally {
        setStoreReady(true);
      }
    }, 1500); // Wait 1.5s so SplashScreen2 can set the store first

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // If selectedStore changes externally (e.g. splash sets it), mark ready
  useEffect(() => {
    if (selectedStore) setStoreReady(true);
  }, [selectedStore]);

  return (
    <StoreContext.Provider value={{ selectedStore, setSelectedStore, storeReady }}>
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
