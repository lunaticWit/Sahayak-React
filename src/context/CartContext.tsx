'use client';

import React, { createContext, useContext, useState } from 'react';
import { CropListing } from '@/types';

export interface CartItem {
  listing: CropListing;
  quantityKg: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (listing: CropListing, quantityKg: number) => void;
  removeFromCart: (listingId: string) => void;
  updateQuantity: (listingId: string, quantityKg: number) => void;
  clearCart: () => void;
  totalAmount: number;
  totalKg: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (listing: CropListing, quantityKg: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.listing.id === listing.id);
      if (existing) {
        return prev.map((item) =>
          item.listing.id === listing.id
            ? { ...item, quantityKg: item.quantityKg + quantityKg }
            : item
        );
      }
      return [...prev, { listing, quantityKg }];
    });
  };

  const removeFromCart = (listingId: string) => {
    setCart((prev) => prev.filter((item) => item.listing.id !== listingId));
  };

  const updateQuantity = (listingId: string, quantityKg: number) => {
    if (quantityKg <= 0) {
      removeFromCart(listingId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.listing.id === listingId ? { ...item, quantityKg } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.listing.price_per_kg * item.quantityKg,
    0
  );

  const totalKg = cart.reduce((sum, item) => sum + item.quantityKg, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalAmount,
        totalKg,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
