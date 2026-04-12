import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('nutripoint_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('nutripoint_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedFlavor === product.selectedFlavor);
      if (existing) {
        return prev.map(item =>
          item.id === product.id && item.selectedFlavor === product.selectedFlavor
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId, flavor) => {
    setCartItems(prev => prev.filter(item => !(item.id === productId && item.selectedFlavor === flavor)));
  };

  const updateQuantity = (productId, flavor, change) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === productId && item.selectedFlavor === flavor) {
        const MathQ = Math.max(1, item.quantity + change);
        if (MathQ > item.stock && item.stock !== undefined) {
           return item; // prevent exceeding stock
        }
        return { ...item, quantity: MathQ };
      }
      return item;
    }));
  };

  const clearCart = () => setCartItems([]);

  const toggleCart = () => setIsCartOpen(prev => !prev);

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart, 
      isCartOpen, setIsCartOpen, toggleCart, cartTotal, cartCount 
    }}>
      {children}
    </CartContext.Provider>
  );
};
