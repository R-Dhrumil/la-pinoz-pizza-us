import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface Address {
  id: string;
  type: 'Home' | 'Work' | 'Other';
  houseNo: string;
  street: string;
  landmark: string;
  city: string;
  pincode: string;
  isDeliverable: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface AddressContextType {
  addresses: Address[];
  addAddress: (address: Omit<Address, 'id'>) => void;
  deleteAddress: (id: string) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider = ({ children }: { children: ReactNode }) => {
  const [addresses, setAddresses] = useState<Address[]>([
    {
        id: '1',
        type: 'Home',
        houseNo: '208',
        street: 'Hotel RK in tarsali , Vijay Nagar, Tarsali',
        landmark: 'Near Hotel RK',
        city: 'Vadodara',
        pincode: '390009',
        isDeliverable: true,
        coordinates: { lat: 22.2587, lng: 73.1812 }
    }, {
        id: '2',
        type: 'Work',
        houseNo: '101',
        street: 'Tech Park, Sector 2',
        landmark: 'Opposite Mall',
        city: 'Vadodara',
        pincode: '390011',
        isDeliverable: false,
        coordinates: { lat: 22.3107, lng: 73.1812 }
    }
  ]);

  const addAddress = (address: Omit<Address, 'id'>) => {
    const newAddress = {
      ...address,
      id: Math.random().toString(36).substr(2, 9),
    };
    setAddresses((prev) => [...prev, newAddress]);
  };

  const deleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((addr) => addr.id !== id));
  };

  const updateAddress = (id: string, updatedFields: Partial<Address>) => {
    setAddresses((prev) =>
      prev.map((addr) => (addr.id === id ? { ...addr, ...updatedFields } : addr))
    );
  };

  return (
    <AddressContext.Provider value={{ addresses, addAddress, deleteAddress, updateAddress }}>
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
