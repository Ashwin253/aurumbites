"use client";

import { createContext, useContext } from "react";

const CartContext = createContext(null);

export function CartProvider({ onCartChange, children }) {
  return (
    <CartContext.Provider value={onCartChange}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartChange() {
  return useContext(CartContext);
}
