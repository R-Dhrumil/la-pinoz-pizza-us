import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface Store {
  id: number;
  storeId: string;
  name: string;
  city: string;
  state: string;
  image?: string;
  // add other fields if needed
}

interface StoreContextType {
  selectedStore: Store | null;
  setSelectedStore: (store: Store | null) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

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
