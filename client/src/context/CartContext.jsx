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

//   const addToCart = (product) => {
//     setCartItems(prev => {
//       const existing = prev.find(item => item.id === product.id && item.selectedFlavor === product.selectedFlavor);
//       if (existing) {
//         return prev.map(item =>
//           item.id === product.id && item.selectedFlavor === product.selectedFlavor
//             ? { ...item, quantity: item.quantity + 1 }
//             : item
//         );
//       }
//       return [...prev, { ...product, quantity: 1 }];
//     });
//     setIsCartOpen(true);
//   };

    const addToCart = (product) => {
        setCartItems(prev => {
            const existing = prev.find(item => 
                item.id === product.id && item.selectedFlavor === product.selectedFlavor
            );

            if (existing) {
                // Validamos si al sumar 1 superamos el stock disponible
                const canAddMore = product.stock !== undefined ? existing.quantity < product.stock : true;

                if (!canAddMore) {
                    // Opcional: podrías mostrar una notificación de "Sin más stock"
                    return prev;
                }

                return prev.map(item =>
                    item.id === product.id && item.selectedFlavor === product.selectedFlavor
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            
            // Si el producto es nuevo en el carrito, lo agregamos con quantity 1
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
      const currentQuantity = Number(item.quantity);
      const maxStock = Number(item.stock);
      const newQuantity = currentQuantity + change;

      // 1. No permitir menos de 1
      if (newQuantity < 1) return item;

      // 2. Si el stock existe y es un número, bloquear si se pasa
      if (item.stock !== undefined && newQuantity > maxStock) {
        console.warn("Stock insuficiente");
        return item; 
      }

      return { ...item, quantity: newQuantity };
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
