import { create } from 'zustand'

export interface CartItem {
  id: string; // product id
  name: string;
  slug: string;
  quantity: number;
  basePrice: number;
  color?: string;
  finish?: string;
  configurationId?: string; // optional saved 3D configuration
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => {
    const existing = state.items.find(i => i.id === item.id && i.color === item.color && i.finish === item.finish);
    if (existing) {
      return {
        items: state.items.map(i => i === existing ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i)
      };
    }
    return { items: [...state.items, { ...item, quantity: item.quantity || 1 }] };
  }),
  updateQuantity: (id, quantity) => set((state) => ({
    items: state.items.map(i => i.id === id ? { ...i, quantity } : i)
  })),
  removeItem: (id) => set((state) => ({ items: state.items.filter(i => i.id !== id) })),
  clear: () => set({ items: [] }),
  total: () => get().items.reduce((sum, i) => sum + i.basePrice * i.quantity, 0)
}));
