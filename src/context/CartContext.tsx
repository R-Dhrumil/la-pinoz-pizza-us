import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Product } from '../services/categoryService';

export interface CartItem {
  id: string;
  name: string;
  price: number;
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

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

  const clearCart = () => {
    setCartItems([]);
  };

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, deleteItem, updateCartItem, clearCart, totalAmount, totalItems }}
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
