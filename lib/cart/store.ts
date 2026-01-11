import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItemConfiguration {
  usageType?: string;
  profileVariantId?: string;
  colorVariantId?: string;
  thicknessOptionId?: string;
  thicknessMm?: number;
  widthMm?: number;
  lengthMm?: number;
}

export interface CartItem {
  lineId: string; // stable key: id + options + configuration
  id: string; // product id
  name: string;
  slug: string;
  quantity: number;
  basePrice: number;
  color?: string;
  finish?: string;
  configuration?: CartItemConfiguration;
  configurationId?: string; // optional saved 3D configuration
  addedAt?: number; // timestamp for expiration check
}

interface CartState {
  items: CartItem[];
  isHydrated: boolean; // Track hydration status for SSR
  addItem: (item: Omit<CartItem, 'lineId' | 'quantity' | 'addedAt'> & { quantity?: number }) => void;
  updateItemConfiguration: (lineId: string, patch: Partial<CartItemConfiguration>) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clear: () => void;
  total: () => number;
  clearExpiredItems: () => void;
  syncWithServer: (serverItems: CartItem[]) => void;
  setHydrated: (hydrated: boolean) => void;
}

const createLineId = (item: {
  id: string;
  color?: string;
  finish?: string;
  configuration?: CartItemConfiguration;
  configurationId?: string;
}): string => {
  const cfg = item.configuration;
  const parts = [
    item.id,
    item.color ?? '',
    item.finish ?? '',
    cfg?.usageType ?? '',
    cfg?.profileVariantId ?? '',
    cfg?.colorVariantId ?? '',
    cfg?.thicknessOptionId ?? '',
    typeof cfg?.thicknessMm === 'number' ? String(cfg.thicknessMm) : '',
    typeof cfg?.widthMm === 'number' ? String(cfg.widthMm) : '',
    typeof cfg?.lengthMm === 'number' ? String(cfg.lengthMm) : '',
    item.configurationId ?? '',
  ];
  return parts.join('|');
};

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
  if (version === 1) {
    // Migration from v1 (no lineId) to v2
    return {
      ...persistedState,
      items:
        persistedState.items?.map((item: any) => {
          const next: CartItem = {
            ...item,
            addedAt: item.addedAt || Date.now(),
            configuration: item.configuration && typeof item.configuration === 'object' ? item.configuration : undefined,
            lineId: typeof item.lineId === 'string' && item.lineId.length > 0
              ? item.lineId
              : createLineId({
                  id: String(item.id || ''),
                  color: typeof item.color === 'string' ? item.color : undefined,
                  finish: typeof item.finish === 'string' ? item.finish : undefined,
                  configuration: item.configuration && typeof item.configuration === 'object' ? item.configuration : undefined,
                  configurationId: typeof item.configurationId === 'string' ? item.configurationId : undefined,
                }),
          };
          return next;
        }) || [],
      isHydrated: false,
    } as CartState;
  }
  return persistedState as CartState;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isHydrated: false,
      
      addItem: (item) => set((state) => {
        const lineId = createLineId(item);
        const existing = state.items.find((i) => i.lineId === lineId);
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
              lineId,
              quantity: item.quantity || 1,
              addedAt: Date.now(),
            }
          ] 
        };
      }),

      updateItemConfiguration: (lineId, patch) => set((state) => {
        const current = state.items.find((i) => i.lineId === lineId);
        if (!current) return state;

        const nextConfiguration: CartItemConfiguration | undefined = {
          ...(current.configuration ?? {}),
          ...patch,
        };

        const nextLineId = createLineId({
          id: current.id,
          color: current.color,
          finish: current.finish,
          configuration: nextConfiguration,
          configurationId: current.configurationId,
        });

        if (nextLineId === current.lineId) {
          return {
            items: state.items.map((i) => (i.lineId === lineId ? { ...i, configuration: nextConfiguration } : i)),
          };
        }

        const existingTarget = state.items.find((i) => i.lineId === nextLineId);
        if (existingTarget) {
          return {
            items: state.items
              .filter((i) => i.lineId !== current.lineId)
              .map((i) =>
                i.lineId === existingTarget.lineId
                  ? {
                      ...i,
                      quantity: i.quantity + current.quantity,
                      configuration: nextConfiguration,
                      addedAt: Math.min(i.addedAt ?? Date.now(), current.addedAt ?? Date.now()),
                    }
                  : i
              ),
          };
        }

        return {
          items: state.items.map((i) =>
            i.lineId === current.lineId
              ? {
                  ...i,
                  lineId: nextLineId,
                  configuration: nextConfiguration,
                }
              : i
          ),
        };
      }),
      
      updateQuantity: (lineId, quantity) => set((state) => ({
        items: quantity > 0
          ? state.items.map(i => i.lineId === lineId ? { ...i, quantity } : i)
          : state.items.filter(i => i.lineId !== lineId) // Remove if quantity is 0
      })),
      
      removeItem: (lineId) => set((state) => ({ 
        items: state.items.filter(i => i.lineId !== lineId) 
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
        const serverLineIds = new Set(serverItems.map((item) => item.lineId));
        
        // Add local items that aren't on server
        state.items.forEach(localItem => {
          if (!serverLineIds.has(localItem.lineId) && !isItemExpired(localItem)) {
            mergedItems.push(localItem);
          }
        });
        
        return { items: mergedItems };
      }),
      
      setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),
    }),
    {
      name: 'yakiwood-cart',
      version: 2,
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
