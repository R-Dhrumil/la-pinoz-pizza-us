import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Product } from '../services/categoryService';
import { useAuth } from './AuthContext';
import { offerService, Offer, AppliedPromo } from '../services/offerService';
import { useStore } from './StoreContext';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number; // Price before any cart-level discounts
  categoryId?: number; // Added
  quantity: number;
  image: string;
  isVeg: boolean | null;
  description: string;
  variant?: any;
  toppings?: any[];
  size?: string;
  crust?: string;
  originalProduct?: Product;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  deleteItem: (id: string) => void;
  updateCartItem: (oldId: string, newItem: CartItem) => void;
  clearCart: () => void;
  totalAmount: number;
  totalItems: number;
  orderMode: 'delivery' | 'pickup';
  setOrderMode: (mode: 'delivery' | 'pickup') => void;
  // Discount Module
  availableOffers: Offer[];
  appliedOfferCodes: string[];
  discountAmount: number;
  appliedPromos: AppliedPromo[];
  validationError: string | null;
  isValidatingOffers: boolean;
  applyOfferCode: (code: string) => void;
  removeOfferCode: (code: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderMode, setOrderMode] = useState<'delivery' | 'pickup'>('delivery');
  const { user } = useAuth();
  const { selectedStore } = useStore();

  // Discount Module State
  const [availableOffers, setAvailableOffers] = useState<Offer[]>([]);
  const [appliedOfferCodes, setAppliedOfferCodes] = useState<string[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [appliedPromos, setAppliedPromos] = useState<AppliedPromo[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidatingOffers, setIsValidatingOffers] = useState<boolean>(false);

  const clearCart = () => {
    setCartItems([]);
    setAppliedOfferCodes([]);
    setDiscountAmount(0);
    setAppliedPromos([]);
    setValidationError(null);
  };

  // Fetch available offers when store changes
  useEffect(() => {
    const fetchOffers = async () => {
      if (selectedStore) {
        const allOffers = await offerService.getOffers();
        // Filter by isActive and storeId
        const filtered = allOffers.filter(o => o.isActive && (!o.storeId || o.storeId === selectedStore.id));
        setAvailableOffers(filtered);
      }
    };
    fetchOffers();
    // Clear applied offers when switching store
    setAppliedOfferCodes([]);
    setDiscountAmount(0);
    setAppliedPromos([]);
    setValidationError(null);
  }, [selectedStore]);

  // Validate offers whenever cart or codes change
  useEffect(() => {
    const validate = async () => {
      if (cartItems.length === 0 || appliedOfferCodes.length === 0) {
        setDiscountAmount(0);
        setAppliedPromos([]);
        setValidationError(null);
        return;
      }

      setIsValidatingOffers(true);
      const payload = {
        storeId: selectedStore?.id || 0,
        offerCodes: appliedOfferCodes,
        cartItems: cartItems.map(item => ({
          productId: item.originalProduct?.id || parseInt(item.id.split('-')[0]),
          categoryId: item.categoryId,
          quantity: item.quantity,
          price: item.originalPrice || item.price,
          size: item.size || item.variant?.size
        }))
      };

      try {
        const res = await offerService.validateOffer(payload);
        if (res.isValid) {
          setDiscountAmount(res.discountAmount);
          setAppliedPromos(res.appliedPromos);
          setValidationError(null);
        } else {
          setDiscountAmount(0);
          setAppliedPromos([]);
          setValidationError(res.errorMessage || 'One or more promo codes are invalid.');
        }
      } catch (err) {
        setDiscountAmount(0);
        setAppliedPromos([]);
        setValidationError('Failed to validate promo code.');
      } finally {
        setIsValidatingOffers(false);
      }
    };

    validate();
  }, [cartItems, appliedOfferCodes, selectedStore]);

  // Clear cart when user logs out or switches account
  useEffect(() => {
    clearCart();
  }, [user]);

  const applyOfferCode = (code: string) => {
    setAppliedOfferCodes(prev => {
      if (prev.includes(code)) return prev;
      if (prev.length >= 2) return prev; // Limit of 2 promos
      return [...prev, code];
    });
  };

  const removeOfferCode = (code: string) => {
    setAppliedOfferCodes(prev => prev.filter(c => c !== code));
  };

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);
      if (existingItem) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === id);
      if (existingItem && existingItem.quantity > 1) {
        return prevItems.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prevItems.filter((i) => i.id !== id);
    });
  };

  const deleteItem = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((i) => i.id !== id));
  };

  const updateCartItem = (oldId: string, newItem: CartItem) => {
    setCartItems((prevItems) => {
      // Case 1: ID didn't change (just qty or meta update)
      if (oldId === newItem.id) {
        return prevItems.map((item) => (item.id === oldId ? newItem : item));
      }

      // Case 2: ID changed (variant/modifier change)
      // Check if new/target ID already exists
      const targetItemExists = prevItems.find((i) => i.id === newItem.id);

      if (targetItemExists) {
        // MERGE: Remove old, add qty to new
        return prevItems
          .filter((i) => i.id !== oldId)
          .map((i) =>
            i.id === newItem.id
              ? { ...i, quantity: i.quantity + newItem.quantity }
              : i
          );
      } else {
        // REPLACE in place
        return prevItems.map((item) => (item.id === oldId ? newItem : item));
      }
    });
  };

  const totalAmount = cartItems.reduce(
    (total, item) => total + (item.originalPrice || item.price) * item.quantity,
    0
  );

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ 
        cartItems, addToCart, removeFromCart, deleteItem, updateCartItem, clearCart, 
        totalAmount, totalItems, orderMode, setOrderMode,
        availableOffers, appliedOfferCodes, discountAmount, appliedPromos, validationError,
        isValidatingOffers, applyOfferCode, removeOfferCode
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
