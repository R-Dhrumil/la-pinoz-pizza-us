import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../services/categoryService';
import { useAuth } from './AuthContext';
import { offerService, Offer, AppliedPromo, ValidateOfferRequest } from '../services/offerService';
import { useStore } from './StoreContext';
import { taxService, StoreTax } from '../services/taxService';

const CART_STORAGE_KEY = '@lapinoz_cart_items';
const ORDER_MODE_STORAGE_KEY = '@lapinoz_order_mode';

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
  taxBreakdown: { name: string; percentage: number; amount: number }[];
  totalTaxAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [orderMode, setOrderMode] = useState<'delivery' | 'pickup'>('pickup');
  const [isHydrated, setIsHydrated] = useState(false);
  const { user } = useAuth();
  const { selectedStore } = useStore();

  // ─── Restore cart from AsyncStorage on app launch ───────────────────────
  useEffect(() => {
    const loadCart = async () => {
      try {
        const [savedCart, savedMode] = await Promise.all([
          AsyncStorage.getItem(CART_STORAGE_KEY),
          AsyncStorage.getItem(ORDER_MODE_STORAGE_KEY),
        ]);
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
        if (savedMode === 'pickup') {
          setOrderMode(savedMode);
        } else {
          setOrderMode('pickup');
        }
      } catch (e) {
        console.warn('Failed to load cart from storage:', e);
      } finally {
        setIsHydrated(true);
      }
    };
    loadCart();
  }, []);

  // ─── Persist cartItems to AsyncStorage whenever they change ─────────────
  useEffect(() => {
    if (!isHydrated) return; // Don't overwrite storage before initial load
    AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems)).catch(e =>
      console.warn('Failed to save cart:', e)
    );
  }, [cartItems, isHydrated]);

  // ─── Persist orderMode to AsyncStorage whenever it changes ──────────────
  useEffect(() => {
    if (!isHydrated) return;
    AsyncStorage.setItem(ORDER_MODE_STORAGE_KEY, orderMode).catch(e =>
      console.warn('Failed to save order mode:', e)
    );
  }, [orderMode, isHydrated]);

  // Discount Module State
  const [availableOffers, setAvailableOffers] = useState<Offer[]>([]);
  const [appliedOfferCodes, setAppliedOfferCodes] = useState<string[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [appliedPromos, setAppliedPromos] = useState<AppliedPromo[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidatingOffers, setIsValidatingOffers] = useState<boolean>(false);

  // Dynamic Taxes State
  const [storeTaxes, setStoreTaxes] = useState<StoreTax[]>([]);
  const [taxBreakdown, setTaxBreakdown] = useState<{ name: string; percentage: number; amount: number }[]>([]);
  const [totalTaxAmount, setTotalTaxAmount] = useState<number>(0);

  const totalAmount = cartItems.reduce(
    (total, item) => total + (item.originalPrice || item.price) * item.quantity,
    0
  );

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Fetch active taxes when store changes
  useEffect(() => {
    const fetchTaxes = async () => {
      if (selectedStore?.id) {
        try {
          const taxes = await taxService.getActiveStoreTaxes(selectedStore.id);
          setStoreTaxes(taxes);
        } catch (error) {
          console.error('Failed to load active store taxes:', error);
          setStoreTaxes([]);
        }
      } else {
        setStoreTaxes([]);
      }
    };
    fetchTaxes();
  }, [selectedStore]);

  // Recalculate taxes whenever cart items, discount amount, or store taxes change
  useEffect(() => {
    if (!storeTaxes.length || !cartItems.length) {
      setTaxBreakdown([]);
      setTotalTaxAmount(0);
      return;
    }

    const breakdown: { name: string; percentage: number; amount: number }[] = [];
    let totalTax = 0;
    const deliveryFeeVal = 0; // matching website: tax.appliesToDeliveryFee applies to delivery fee (usually 0 in checkout tax block or config)
    const packagingFeeVal = 0;

    storeTaxes.forEach(tax => {
      let taxableAmount = 0;

      // Sum item prices that belong to categories this tax applies to
      cartItems.forEach(item => {
        const rawCatId = item.categoryId ?? (item.originalProduct as any)?.categoryId;
        if (rawCatId !== undefined && rawCatId !== null) {
          const itemCatId = Number(rawCatId);
          const taxCatIds = tax.categoryIds ? tax.categoryIds.map(Number) : [];
          if (taxCatIds.includes(itemCatId)) {
            const itemTotal = item.price * item.quantity;
            const itemDiscountShare = totalAmount > 0 ? (itemTotal / totalAmount) * (discountAmount || 0) : 0;
            const discountedItemTotal = Math.max(0, itemTotal - itemDiscountShare);
            taxableAmount += discountedItemTotal;
          }
        }
      });

      if (tax.appliesToDeliveryFee) taxableAmount += deliveryFeeVal;
      if (tax.appliesToPackagingFee) taxableAmount += packagingFeeVal;

      if (taxableAmount > 0) {
        const amount = (taxableAmount * tax.percentage) / 100;
        breakdown.push({ name: tax.taxName, percentage: tax.percentage, amount });
        totalTax += amount;
      }
    });

    setTaxBreakdown(breakdown);
    setTotalTaxAmount(totalTax);
  }, [storeTaxes, cartItems, discountAmount, totalAmount]);

  const clearCart = () => {
    setCartItems([]);
    setAppliedOfferCodes([]);
    setDiscountAmount(0);
    setAppliedPromos([]);
    setValidationError(null);
    // Also wipe persisted storage
    AsyncStorage.removeItem(CART_STORAGE_KEY).catch(() => {});
  };

  // Fetch available offers when store changes — uses store-specific /StoreOffers/{storeId}/active
  useEffect(() => {
    const fetchOffers = async () => {
      if (selectedStore?.id) {
        const storeOffers = await offerService.getStoreOffers(selectedStore.id);
        // Backend already filters: isActive, date range, not deleted, not over redemption limit
        const eligibleOffers = storeOffers.filter(o => !o.hasReachedMaxLimit);
        setAvailableOffers(eligibleOffers);
      } else {
        setAvailableOffers([]);
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
      const payload: ValidateOfferRequest = {
        storeId: selectedStore?.id ?? 0,
        offerCodes: appliedOfferCodes,
        cartItems: cartItems.map(item => ({
          productId: item.originalProduct?.id ?? parseInt(item.id.split('-')[0]) ?? 0,
          quantity: item.quantity,
          price: item.originalPrice ?? item.price,
          size: item.variant?.size ?? item.size ?? null,
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

  return (
    <CartContext.Provider
      value={{ 
        cartItems, addToCart, removeFromCart, deleteItem, updateCartItem, clearCart, 
        totalAmount, totalItems, orderMode, setOrderMode,
        availableOffers, appliedOfferCodes, discountAmount, appliedPromos, validationError,
        isValidatingOffers, applyOfferCode, removeOfferCode,
        taxBreakdown, totalTaxAmount
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
