import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { addressService, Address } from '../services/addressService';
import { useAuth } from './AuthContext';

interface AddressContextType {
  addresses: Address[];
  loading: boolean;
  refreshAddresses: () => Promise<void>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<void>;
  deleteAddress: (id: number) => Promise<void>;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider = ({ children }: { children: ReactNode }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchAddresses = useCallback(async () => {
      if (!user) {
          setAddresses([]);
          return;
      }
      setLoading(true);
      try {
          const data = await addressService.getAddresses();
          // Map backend data to UI expectations if needed
          const mappedAddresses = data.map(addr => ({
              ...addr,
              type: addr.type || 'Home', // Default if missing
              isDeliverable: true, // Default
          }));
          setAddresses(mappedAddresses);
      } catch (error) {
          console.error("Failed to fetch addresses", error);
      } finally {
          setLoading(false);
      }
  }, [user]);

  useEffect(() => {
      fetchAddresses();
  }, [fetchAddresses]);

  const addAddress = async (address: Omit<Address, 'id'>) => {
    setLoading(true);
    try {
        await addressService.addAddress(address);
        await fetchAddresses(); // Refresh list after add
    } catch (error) {
        console.error("Failed to add address", error);
        throw error;
    } finally {
        setLoading(false);
    }
  };

  const deleteAddress = async (id: number) => {
    setLoading(true);
    try {
        await addressService.deleteAddress(id);
        setAddresses(prev => prev.filter(a => a.id !== id));
    } catch (error) {
         console.error("Failed to delete address", error);
         throw error;
    } finally {
        setLoading(false);
    }
  };

  return (
    <AddressContext.Provider value={{ addresses, loading, refreshAddresses: fetchAddresses, addAddress, deleteAddress }}>
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (!context) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
};

// Re-export Address type for convenience
export type { Address };
