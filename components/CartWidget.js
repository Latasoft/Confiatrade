'use client';

import { useState } from 'react';
import { useCart } from '@/lib/CartContext';
import { utilidadesService } from '@/lib/webpayServices';

export default function CartWidget() {
  const { items, total, itemCount, removeItem, updateQuantity } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  if (itemCount === 0) {
    return null; // No mostrar si el carrito está vacío
  }

  return (
    <>
      {/* Botón flotante del carrito */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 flex items-center space-x-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2 8M7 13l-2-8m2 8h10m-10 0a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z" />
          </svg>
          <span className="bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {itemCount}
          </span>
        </button>
      </div>

      {/* Modal del carrito */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Carrito de Compras
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Lista de items */}
            <div className="overflow-y-auto max-h-96 p-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.nombre}</h3>
                    <p className="text-sm text-gray-500">{utilidadesService.formatearPrecio(item.precio)}</p>
                  </div>
                  
                  {/* Controles de cantidad */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                    >
                      <span className="text-lg">-</span>
                    </button>
                    <span className="w-8 text-center font-medium">{item.cantidad}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                    >
                      <span className="text-lg">+</span>
                    </button>
                  </div>

                  {/* Botón eliminar */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Footer con total y acciones */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-xl font-bold text-blue-600">
                  {utilidadesService.formatearPrecio(total)}
                </span>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Continuar Comprando
                </button>
                <a
                  href="/checkout"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Ir a Pagar
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}