import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
  id: string; // product id
  name: string;
  slug: string;
  quantity: number;
  basePrice: number;
  color?: string;
  finish?: string;
  configurationId?: string; // optional saved 3D configuration
  addedAt?: number; // timestamp for expiration check
}

interface CartState {
  items: CartItem[];
  isHydrated: boolean; // Track hydration status for SSR
  addItem: (item: Omit<CartItem, 'quantity' | 'addedAt'> & { quantity?: number }) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  total: () => number;
  clearExpiredItems: () => void;
  syncWithServer: (serverItems: CartItem[]) => void;
  setHydrated: (hydrated: boolean) => void;
}

// Helper: Check if item is expired (older than 7 days)
const isItemExpired = (item: CartItem): boolean => {
  if (!item.addedAt) return false;
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - item.addedAt > SEVEN_DAYS;
};

// Helper: Migrate cart data from older versions
const migrateCart = (persistedState: any, version: number): CartState => {
  if (version === 0) {
    // Migration from v0 (no addedAt field) to v1
    return {
      ...persistedState,
      items: persistedState.items?.map((item: CartItem) => ({
        ...item,
        addedAt: item.addedAt || Date.now(),
      })) || [],
      isHydrated: false,
    };
  }
  return persistedState as CartState;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,
      
      addItem: (item) => set((state) => {
        const existing = state.items.find(
          i => i.id === item.id && i.color === item.color && i.finish === item.finish
        );
        if (existing) {
          return {
            items: state.items.map(i => 
              i === existing 
                ? { ...i, quantity: i.quantity + (item.quantity || 1) } 
                : i
            )
          };
        }
        return { 
          items: [
            ...state.items, 
            { 
              ...item, 
              quantity: item.quantity || 1,
              addedAt: Date.now(),
            }
          ] 
        };
      }),
      
      updateQuantity: (id, quantity) => set((state) => ({
        items: quantity > 0
          ? state.items.map(i => i.id === id ? { ...i, quantity } : i)
          : state.items.filter(i => i.id !== id) // Remove if quantity is 0
      })),
      
      removeItem: (id) => set((state) => ({ 
        items: state.items.filter(i => i.id !== id) 
      })),
      
      clear: () => set({ items: [] }),
      
      total: () => get().items.reduce((sum, i) => sum + i.basePrice * i.quantity, 0),
      
      clearExpiredItems: () => set((state) => ({
        items: state.items.filter(item => !isItemExpired(item))
      })),
      
      syncWithServer: (serverItems: CartItem[]) => set((state) => {
        // Merge server items with local cart
        // Server items take precedence, but keep local items not on server
        const mergedItems = [...serverItems];
        const serverIds = new Set(
          serverItems.map(item => `${item.id}-${item.color}-${item.finish}`)
        );
        
        // Add local items that aren't on server
        state.items.forEach(localItem => {
          const key = `${localItem.id}-${localItem.color}-${localItem.finish}`;
          if (!serverIds.has(key) && !isItemExpired(localItem)) {
            mergedItems.push(localItem);
          }
        });
        
        return { items: mergedItems };
      }),
      
      setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),
    }),
    {
      name: 'yakiwood-cart',
      version: 1,
      storage: createJSONStorage(() => {
        // SSR safeguard: only use localStorage in browser
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
      partialize: (state) => ({
        // Only persist items, not UI state like isHydrated
        items: state.items,
      }),
      migrate: migrateCart,
      onRehydrateStorage: () => (state) => {
        // Clear expired items after rehydration
        if (state) {
          state.clearExpiredItems();
          state.setHydrated(true);
        }
      },
    }
  )
);
