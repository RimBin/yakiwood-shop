/**
 * Cart Types
 * Shared type definitions for cart functionality
 */

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  quantity: number;
  color?: string;
  finish?: string;
  imageUrl?: string;
}

export interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string, color?: string, finish?: string) => void;
  updateQuantity: (id: string, quantity: number, color?: string, finish?: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}
