'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Acciones del carrito
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
};

// Estado inicial
const initialState = {
  items: [],
  total: 0,
  itemCount: 0
};

// Reducer del carrito
function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { producto } = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.id === producto.id);
      
      let newItems;
      if (existingItemIndex > -1) {
        // Si el producto ya existe, aumentar cantidad
        newItems = state.items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        // Si es nuevo, agregarlo
        newItems = [...state.items, { ...producto, cantidad: 1 }];
      }
      
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems)
      };
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      const newItems = state.items.filter(item => item.id !== action.payload.productId);
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems)
      };
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Si la cantidad es 0 o menor, remover el item
        return cartReducer(state, {
          type: CART_ACTIONS.REMOVE_ITEM,
          payload: { productId }
        });
      }
      
      const newItems = state.items.map(item =>
        item.id === productId ? { ...item, cantidad: quantity } : item
      );
      
      return {
        ...state,
        items: newItems,
        total: calculateTotal(newItems),
        itemCount: calculateItemCount(newItems)
      };
    }

    case CART_ACTIONS.CLEAR_CART: {
      return initialState;
    }

    case CART_ACTIONS.LOAD_CART: {
      const items = action.payload.items || [];
      return {
        ...state,
        items,
        total: calculateTotal(items),
        itemCount: calculateItemCount(items)
      };
    }

    default:
      return state;
  }
}

// Funciones auxiliares
function calculateTotal(items) {
  return items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
}

function calculateItemCount(items) {
  return items.reduce((count, item) => count + item.cantidad, 0);
}

// Crear contexto
const CartContext = createContext();

// Proveedor del contexto
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Cargar carrito desde localStorage al inicializar
  useEffect(() => {
    const savedCart = localStorage.getItem('confiatrade-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({
          type: CART_ACTIONS.LOAD_CART,
          payload: { items: parsedCart.items || [] }
        });
      } catch (error) {
        console.error('Error al cargar carrito desde localStorage:', error);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('confiatrade-cart', JSON.stringify({
      items: state.items,
      timestamp: Date.now()
    }));
  }, [state.items]);

  // Acciones del carrito
  const addItem = (producto) => {
    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { producto }
    });
  };

  const removeItem = (productId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: { productId }
    });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { productId, quantity }
    });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.id === productId);
    return item ? item.cantidad : 0;
  };

  const value = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Hook para usar el carrito
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider');
  }
  return context;
}