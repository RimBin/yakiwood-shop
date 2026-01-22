'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { PageCover } from '@/components/shared';
import { PageLayout } from '@/components/shared/PageLayout';
import {
  fetchProducts,
  localizeColorLabel,
  type Product,
  type ProductProfileVariant,
} from '@/lib/products.supabase';
import { useLocale, useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { applyRoleDiscount, type RoleDiscount } from '@/lib/pricing/roleDiscounts';
import { toLocalePath } from '@/i18n/paths';
import { trackEvent, trackSearch, trackSelectItem } from '@/lib/analytics';

type DropdownOption = { value: string; label: string };

function FilterDropdown({
  id,
  label,
  options,
  selected,
  onToggle,
  allLabel,
  emptyLabel,
  openId,
  setOpenId,
}: {
  id: string;
  label: string;
  options: DropdownOption[];
  selected: string[];
  onToggle: (value: string) => void;
  allLabel: string;
  emptyLabel: string;
  openId: string | null;
  setOpenId: (value: string | null) => void;
}) {
  const isOpen = openId === id;
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);

  const selectedLabels = useMemo(
    () => options.filter((o) => selected.includes(o.value)).map((o) => o.label),
    [options, selected]
  );

  const summaryValue = selectedLabels.length > 0 ? selectedLabels.join(', ') : allLabel;

  const updatePosition = useCallback(() => {
    const el = buttonRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const minWidth = Math.max(220, rect.width);
    const left = Math.min(rect.left, Math.max(8, window.innerWidth - minWidth - 8));
    const top = rect.bottom + 8;
    setPos({ top, left, width: minWidth });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    const onResizeOrScroll = () => updatePosition();
    window.addEventListener('resize', onResizeOrScroll);
    window.addEventListener('scroll', onResizeOrScroll, true);
    return () => {
      window.removeEventListener('resize', onResizeOrScroll);
      window.removeEventListener('scroll', onResizeOrScroll, true);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (buttonRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpenId(null);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenId(null);
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, setOpenId]);

  return (
    <div className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpenId(isOpen ? null : id)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="h-[40px] px-[14px] rounded-[100px] border border-[#BBBBBB] font-['Outfit'] text-[12px] tracking-[0.6px] flex items-center gap-[8px] max-w-[220px] select-none"
      >
        <span className="flex min-w-0 items-center gap-[8px]">
          <span className="shrink-0">{label}:</span>
          <span className="min-w-0 truncate text-[#535353]">{summaryValue}</span>
        </span>
        <svg
          className={`ml-auto shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="#161616"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && pos
        ? createPortal(
            <div
              ref={menuRef}
              className="z-50 max-h-[260px] overflow-auto rounded-[24px] border border-[#BBBBBB] bg-[#EAEAEA] p-[14px] shadow-lg"
              style={{ position: 'fixed', top: pos.top, left: pos.left, minWidth: pos.width }}
              role="dialog"
              aria-label={label}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {options.length === 0 ? (
                <p className="text-[12px] text-[#7C7C7C]">{emptyLabel}</p>
              ) : (
                <div className="flex flex-col gap-[8px]">
                  {options.map((option) => (
                    <label key={option.value} className="flex items-center gap-[8px] text-[13px]">
                      <input
                        type="checkbox"
                        checked={selected.includes(option.value)}
                        onChange={() => onToggle(option.value)}
                        className="accent-[#161616]"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

export default function ProductsPage() {
  const t = useTranslations('productsPage');
  const locale = useLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';

  const PAGE_SIZE = 24;

  const [selectedUsage, setSelectedUsage] = useState<string[]>([]);
  const [selectedWood, setSelectedWood] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string[]>([]);
  const [selectedWidth, setSelectedWidth] = useState<string[]>([]);
  const [selectedLength, setSelectedLength] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [openFilterId, setOpenFilterId] = useState<string | null>(null);

  const [hasTrackedListView, setHasTrackedListView] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        console.log('Loading products from Supabase...');

        let products: Product[] = [];

        try {
          const stockItems = await fetchProducts({ mode: 'stock-items' });
          if (stockItems.length > 0) {
            products = stockItems;
          } else {
            products = await fetchProducts({ mode: 'active' });
          }
        } catch (stockError) {
          console.warn('Stock items unavailable, falling back to active products.', stockError);
          products = await fetchProducts({ mode: 'active' });
        }

        console.log('Products loaded:', products.length);

        // Apply role discount for authenticated users.
        const supabase = createClient();
        if (supabase) {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('role')
              .eq('id', user.id)
              .maybeSingle();

            const role = (profile as any)?.role as string | undefined;
            if (role) {
              const { data: discountRow } = await supabase
                .from('role_discounts')
                .select('role,discount_type,discount_value,currency,is_active')
                .eq('role', role)
                .eq('is_active', true)
                .maybeSingle();

              const discount = (discountRow as RoleDiscount | null) ?? null;
              if (discount) {
                setAllProducts(
                  products.map((p) => ({
                    ...p,
                    price: applyRoleDiscount(p.price, discount),
                    salePrice:
                      typeof p.salePrice === 'number'
                        ? applyRoleDiscount(p.salePrice, discount)
                        : undefined,
                  }))
                );
              } else {
                setAllProducts(products);
              }
            } else {
              setAllProducts(products);
            }
          } else {
            setAllProducts(products);
          }
        } else {
          setAllProducts(products);
        }
        setError(null);
      } catch (error) {
        console.error('Error loading products:', error);
        setError(error instanceof Error ? error.message : 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    // Reset pagination whenever filters/search change.
    setVisibleCount(PAGE_SIZE);
  }, [
    PAGE_SIZE,
    selectedUsage,
    selectedWood,
    selectedColor,
    selectedProfile,
    selectedWidth,
    selectedLength,
    searchQuery,
  ]);

  const usageFilters = useMemo(
    () => [
      { id: 'facade', label: t('usageFilters.facade') },
      { id: 'terrace', label: t('usageFilters.terrace') },
    ],
    [t]
  );

  const woodFilters = useMemo(
    () => [
      { id: 'spruce', label: t('woodFilters.spruce') },
      { id: 'larch', label: t('woodFilters.larch') },
    ],
    [t]
  );

  const usageLabels: Record<string, string> = useMemo(() => {
    return {
      facade: t('usageFilters.facade'),
      terrace: t('usageFilters.terrace'),
    };
  }, [t]);

  const woodLabels: Record<string, string> = useMemo(() => {
    return {
      spruce: t('woodFilters.spruce'),
      larch: t('woodFilters.larch'),
    };
  }, [t]);

  const normalizeToken = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/[_\s]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

  const normalizeUsageId = (value: string | undefined) => {
    const token = normalizeToken(value ?? '');
    if (!token) return null;
    if (token === 'facade' || token === 'terrace') return token;
    if (token.includes('facade') || token.includes('fasad')) return 'facade';
    if (token.includes('terrace') || token.includes('teras') || token.includes('deck')) return 'terrace';
    return token;
  };

  const parseStockItemSlug = (slug: string) => {
    const parts = slug.split('--');
    if (parts.length < 4) return null;
    const [baseSlug, profile, color, size] = parts;
    if (!baseSlug || !profile || !color || !size) return null;
    return { baseSlug, profile, color, size };
  };

  const formatSizeLabel = (value: string) => {
    if (!value) return value;
    const normalized = value.replace(/x/gi, '×');
    return `${normalized} mm`;
  };

  const parseSizeDimensions = (value: string) => {
    const match = value.trim().match(/^(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)$/i);
    if (!match) return null;
    const width = match[1]!.replace(',', '.');
    const length = match[2]!.replace(',', '.');
    return { width, length };
  };

  const formatDimensionLabel = (value: string) => {
    if (!value) return value;
    return `${value} mm`;
  };

  const formatProductDisplayName = (product: Product) => {
    // Card title intentionally shows color + wood (e.g. "Black Larch").
    // Color names remain English even on LT pages.
    const parsed = product.slug.includes('--') ? parseStockItemSlug(product.slug) : null;
    const colorName = product.colors?.[0]?.name ?? parsed?.color ?? '';
    const colorLabel = colorName ? localizeColorLabel(colorName, 'en') : '';

    const woodKey = typeof product.woodType === 'string' ? product.woodType.trim().toLowerCase() : '';
    const woodLabel =
      woodKey === 'larch'
        ? currentLocale === 'lt'
          ? 'Maumedis'
          : 'Larch'
        : woodKey === 'spruce'
          ? currentLocale === 'lt'
            ? 'Eglė'
            : 'Spruce'
          : product.woodType ?? '';

    const title = [colorLabel, woodLabel].filter(Boolean).join(' ');
    return title || (currentLocale === 'en' && product.nameEn ? product.nameEn : product.name);
  };

  const PROFILE_LABELS: Record<string, { lt: string; en: string }> = {
    'half-taper': { lt: 'Pusė špunto', en: 'Half Taper' },
    'half-taper-45': { lt: 'Pusė špunto 45°', en: 'Half Taper 45°' },
    rectangle: { lt: 'Stačiakampis', en: 'Rectangle' },
    rhombus: { lt: 'Rombas', en: 'Rhombus' },
  };

  const normalizeProfileKey = (input: string) => normalizeToken(input);

  const localizeProfileLabel = (input: string, locale: 'lt' | 'en') => {
    const normalized = normalizeProfileKey(input);
    if (!normalized) return input;
    const mapped = PROFILE_LABELS[normalized];
    if (mapped) return locale === 'lt' ? mapped.lt : mapped.en;
    return input;
  };

  const resolveProfileKey = useCallback((profile?: ProductProfileVariant | null) => {
    const raw = profile?.code ?? profile?.nameEn ?? profile?.name ?? profile?.nameLt ?? '';
    return normalizeProfileKey(raw);
  }, []);

  const resolveProfileLabel = useCallback(
    (profile?: ProductProfileVariant | null) => {
      if (!profile) return '';
      if (currentLocale === 'lt') {
        const raw = profile.nameLt ?? profile.name ?? profile.nameEn ?? profile.code ?? '';
        return localizeProfileLabel(raw, 'lt');
      }
      const raw = profile.nameEn ?? profile.name ?? profile.nameLt ?? profile.code ?? '';
      return localizeProfileLabel(raw, 'en');
    },
    [currentLocale]
  );

  const formatProductAttributes = (product: Product) => {
    const parsed = product.slug.includes('--') ? parseStockItemSlug(product.slug) : null;
    const profileLabel = product.profiles?.[0]
      ? resolveProfileLabel(product.profiles[0])
      : parsed?.profile
        ? localizeProfileLabel(parsed.profile, currentLocale)
        : '';
    const profileSuffix = currentLocale === 'lt' ? 'Profilis' : 'Profile';
    const sizeLabel = parsed?.size ? formatSizeLabel(parsed.size) : '';
    const parts = [profileLabel ? `${profileLabel} ${profileSuffix}` : '', sizeLabel].filter(Boolean);
    return parts.length > 0 ? parts.join(' · ') : '';
  };

  const formatCardPrice = (price: number) => {
    const rounded = price.toFixed(0);
    // Match typical locale formatting used in UI.
    return currentLocale === 'lt' ? `${rounded} €/m²` : `€${rounded}/m²`;
  };

  const roundUpToCents = (value: number) => Math.ceil(value * 100) / 100;

  const formatUnitPrice = (price: number) => {
    const rounded = roundUpToCents(price);
    const formatted = rounded.toFixed(2);
    return currentLocale === 'lt' ? `${formatted} €/vnt` : `€${formatted}/pc`;
  };

  const getUnitPrice = (pricePerM2: number, size: { width: string; length: string } | null) => {
    if (!size) return null;
    const widthMm = Number(size.width);
    const lengthMm = Number(size.length);
    if (!Number.isFinite(widthMm) || !Number.isFinite(lengthMm)) return null;
    const areaM2 = (widthMm / 1000) * (lengthMm / 1000);
    if (!Number.isFinite(areaM2) || areaM2 <= 0) return null;
    return pricePerM2 * areaM2;
  };

  const formatMaybeLabel = (value: string | undefined) => {
    if (!value) return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  };

  const colorOptions = useMemo(() => {
    const set = new Set<string>();
    for (const product of allProducts) {
      for (const color of product.colors ?? []) {
        if (color?.name) set.add(color.name);
      }
    }
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({
        value,
        label: localizeColorLabel(value, currentLocale),
      }));
  }, [allProducts, currentLocale]);

  const profileDropdownOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const product of allProducts) {
      for (const profile of product.profiles ?? []) {
        const key = resolveProfileKey(profile);
        if (!key) continue;
        const label = resolveProfileLabel(profile) || profile.name || profile.code || key;
        if (!map.has(key)) map.set(key, label);
      }
    }

    return Array.from(map.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([value, label]) => ({ value, label }));
  }, [allProducts, resolveProfileKey, resolveProfileLabel]);

  const sizeOptions = useMemo(() => {
    const widths = new Set<string>();
    const lengths = new Set<string>();

    for (const product of allProducts) {
      if (!product.slug.includes('--')) continue;
      const parsed = parseStockItemSlug(product.slug);
      if (!parsed?.size) continue;
      const dims = parseSizeDimensions(parsed.size);
      if (!dims) continue;
      widths.add(dims.width);
      lengths.add(dims.length);
    }

    return {
      widths: Array.from(widths)
        .sort((a, b) => Number(a) - Number(b))
        .map((value) => ({ value, label: formatDimensionLabel(value) })),
      lengths: Array.from(lengths)
        .sort((a, b) => Number(a) - Number(b))
        .map((value) => ({ value, label: formatDimensionLabel(value) })),
    };
  }, [allProducts]);

  const usageOptions = useMemo(
    () => usageFilters.map((filter) => ({ value: filter.id, label: filter.label })),
    [usageFilters]
  );

  const woodOptions = useMemo(
    () => woodFilters.map((filter) => ({ value: filter.id, label: filter.label })),
    [woodFilters]
  );

  

  const renderDropdown = (
    id: string,
    label: string,
    options: Array<{ value: string; label: string }>,
    selected: string[],
    onToggle: (value: string) => void,
    allLabel?: string
  ) => {
    return (
      <FilterDropdown
        id={id}
        label={label}
        options={options}
        selected={selected}
        onToggle={onToggle}
        allLabel={allLabel ?? t('filtersAll')}
        emptyLabel={t('filtersEmpty')}
        openId={openFilterId}
        setOpenId={setOpenFilterId}
      />
    );
  };

  const toggleFilterValue = (
    list: string[],
    value: string,
    setter: Dispatch<SetStateAction<string[]>>
  ) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const usageId = normalizeUsageId(product.category);
      const matchesUsage =
        selectedUsage.length === 0 ||
        (usageId ? selectedUsage.includes(usageId) : false);
      const matchesWood =
        selectedWood.length === 0 ||
        (product.woodType ? selectedWood.includes(product.woodType) : false);

      const normalizedColors = (product.colors ?? [])
        .map((c) => normalizeToken(c?.name ?? ''))
        .filter(Boolean);
      const matchesColor =
        selectedColor.length === 0 ||
        selectedColor.some((value) => normalizedColors.includes(normalizeToken(value)));

      const normalizedProfiles = (product.profiles ?? [])
        .map((p) => resolveProfileKey(p))
        .filter(Boolean);
      const matchesProfile =
        selectedProfile.length === 0 ||
        selectedProfile.some((value) => normalizedProfiles.includes(normalizeToken(value)));

      const parsed = product.slug.includes('--') ? parseStockItemSlug(product.slug) : null;
      const dims = parsed?.size ? parseSizeDimensions(parsed.size) : null;
      const matchesWidth =
        selectedWidth.length === 0 || (dims?.width ? selectedWidth.includes(dims.width) : false);
      const matchesLength =
        selectedLength.length === 0 || (dims?.length ? selectedLength.includes(dims.length) : false);

      const q = searchQuery.trim().toLowerCase();
      const displayName = formatProductDisplayName(product).toLowerCase();
      const attributeText = formatProductAttributes(product).toLowerCase();
      const matchesQuery = q.length === 0 || displayName.includes(q) || attributeText.includes(q);

      return (
        matchesUsage &&
        matchesWood &&
        matchesColor &&
        matchesProfile &&
        matchesWidth &&
        matchesLength &&
        matchesQuery
      );
    });
  }, [
    allProducts,
    formatProductDisplayName,
    formatProductAttributes,
    searchQuery,
    selectedColor,
    selectedLength,
    selectedProfile,
    selectedUsage,
    selectedWidth,
    selectedWood,
  ]);

  const isDefaultListing =
    selectedUsage.length === 0 &&
    selectedWood.length === 0 &&
    selectedColor.length === 0 &&
    selectedProfile.length === 0 &&
    selectedWidth.length === 0 &&
    selectedLength.length === 0 &&
    searchQuery.trim().length === 0;

  const orderedProducts = useMemo(() => {
    if (!isDefaultListing) return filteredProducts;

    const colorOrder = [
      'black',
      'carbon-light',
      'carbon',
      'dark-brown',
      'graphite',
      'latte',
      'natural',
      'silver',
    ] as const;

    const getWoodKey = (product: Product) => normalizeToken(product.woodType ?? '') || 'unknown';

    const getColorKey = (product: Product) => {
      const parsed = product.slug.includes('--') ? parseStockItemSlug(product.slug) : null;
      const rawColor = product.colors?.[0]?.name ?? parsed?.color ?? '';
      return normalizeToken(rawColor) || 'unknown';
    };

    const byGroup = new Map<string, { wood: string; color: string; items: Product[] }>();
    for (const product of filteredProducts) {
      const wood = getWoodKey(product);
      const color = getColorKey(product);
      const key = `${wood}:${color}`;
      const existing = byGroup.get(key);
      if (existing) existing.items.push(product);
      else byGroup.set(key, { wood, color, items: [product] });
    }

    const result: Product[] = [];

    // 1) Ensure the first rows contain a clear mix: 8 colors for spruce and 8 for larch.
    for (const color of colorOrder) {
      for (const wood of ['spruce', 'larch'] as const) {
        const group = byGroup.get(`${wood}:${color}`);
        if (group?.items.length) {
          result.push(group.items.shift()!);
        }
      }
    }

    // 2) Fill the rest round-robin, avoiding repeating the same wood/color in a row when possible.
    let lastWood: string | null = result.at(-1)?.woodType ? normalizeToken(result.at(-1)!.woodType!) : null;
    let lastColor: string | null = (() => {
      const last = result.at(-1);
      if (!last) return null;
      const parsed = last.slug.includes('--') ? parseStockItemSlug(last.slug) : null;
      const rawColor = last.colors?.[0]?.name ?? parsed?.color ?? '';
      return normalizeToken(rawColor) || null;
    })();

    const groups = Array.from(byGroup.values()).filter((g) => g.items.length > 0);

    const colorRank = new Map<string, number>(colorOrder.map((c, idx) => [c, idx]));
    groups.sort((a, b) => {
      const ra = colorRank.get(a.color) ?? 999;
      const rb = colorRank.get(b.color) ?? 999;
      if (ra !== rb) return ra - rb;
      return a.wood.localeCompare(b.wood);
    });

    while (result.length < filteredProducts.length) {
      const pickIndex = (() => {
        const idxStrict = groups.findIndex((g) =>
          g.items.length > 0 && g.wood !== lastWood && g.color !== lastColor
        );
        if (idxStrict !== -1) return idxStrict;

        const idxColor = groups.findIndex((g) => g.items.length > 0 && g.color !== lastColor);
        if (idxColor !== -1) return idxColor;

        const idxAny = groups.findIndex((g) => g.items.length > 0);
        return idxAny;
      })();

      if (pickIndex === -1) break;
      const group = groups[pickIndex]!;
      const next = group.items.shift();
      if (!next) continue;

      result.push(next);
      lastWood = group.wood;
      lastColor = group.color;
    }

    return result;
  }, [filteredProducts, isDefaultListing]);

  const shownProducts = orderedProducts.slice(0, visibleCount);

  const activeUsageLabel =
    selectedUsage.length > 0
      ? usageFilters
          .filter((filter) => selectedUsage.includes(filter.id))
          .map((filter) => filter.label)
          .join(', ')
      : t('filtersAll');

  useEffect(() => {
    if (isLoading) return;
    if (error) return;
    if (hasTrackedListView) return;

    trackEvent('view_item_list', {
      item_list_id: 'products',
      item_list_name: currentLocale === 'lt' ? 'Produktai' : 'Products',
      filters: {
        usage: selectedUsage,
        wood: selectedWood,
        color: selectedColor,
        profile: selectedProfile,
        width: selectedWidth,
        length: selectedLength,
      },
      shown_items_count: shownProducts.length,
    });

    setHasTrackedListView(true);
  }, [
    selectedColor,
    selectedProfile,
    selectedUsage,
    selectedWood,
    selectedWidth,
    selectedLength,
    currentLocale,
    error,
    hasTrackedListView,
    isLoading,
    shownProducts.length,
  ]);

  useEffect(() => {
    if (isLoading) return;
    if (error) return;

    trackEvent('filter_products', {
      filters: {
        usage: selectedUsage,
        wood: selectedWood,
        color: selectedColor,
        profile: selectedProfile,
        width: selectedWidth,
        length: selectedLength,
      },
      shown_items_count: shownProducts.length,
    });
  }, [
    selectedColor,
    selectedProfile,
    selectedUsage,
    selectedWood,
    selectedWidth,
    selectedLength,
    error,
    isLoading,
    shownProducts.length,
  ]);

  return (
    <section className="w-full bg-[#E1E1E1] min-h-screen">
      {/* Cover */}
      <PageCover>
        <div className="flex flex-col gap-[16px]">
          <div className="flex items-start gap-[8px]">
          <h1
            className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] text-[#161616] tracking-[-2.8px] md:tracking-[-6.4px]"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            {t('title')}
          </h1>
          <p
            className="font-['DM_Sans'] font-normal text-[18px] md:text-[32px] leading-[1.1] text-[#161616] tracking-[-0.72px] md:tracking-[-1.28px]"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            ({orderedProducts.length})
          </p>
          </div>

          {!isDefaultListing && selectedUsage.length > 0 && (
            <p
              className="font-['Outfit'] font-normal text-[12px] md:text-[14px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616]"
            >
              {activeUsageLabel}
            </p>
          )}
        </div>
      </PageCover>

      {/* Filters */}
      <PageLayout>
        <div className="py-[24px] flex flex-col gap-4">
          <div className="flex flex-nowrap items-center gap-[12px] overflow-x-auto pb-[6px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="relative flex-[1_1_220px] min-w-[220px] max-w-[520px]">
              <label className="sr-only">{t('searchLabel')}</label>
              <svg
                className="absolute left-[14px] top-1/2 -translate-y-1/2"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"
                  stroke="#161616"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 21l-4.35-4.35"
                  stroke="#161616"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return;
                  const q = searchQuery.trim();
                  if (!q) return;
                  trackSearch(q, orderedProducts.length);
                }}
                placeholder={t('searchPlaceholder')}
                className="w-full h-[40px] pl-[42px] pr-[16px] rounded-[100px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-[#EAEAEA]"
              />
            </div>
            {renderDropdown(
              'usage',
              t('filtersUsage'),
              usageOptions,
              selectedUsage,
              (value) => toggleFilterValue(selectedUsage, value, setSelectedUsage),
              t('usageFilters.all')
            )}
            {renderDropdown(
              'wood',
              t('filtersWood'),
              woodOptions,
              selectedWood,
              (value) => toggleFilterValue(selectedWood, value, setSelectedWood),
              t('woodFilters.all')
            )}
            {renderDropdown(
              'color',
              t('filtersColor'),
              colorOptions,
              selectedColor,
              (value) => toggleFilterValue(selectedColor, value, setSelectedColor),
              t('colorFilterAll')
            )}
            {renderDropdown(
              'profile',
              t('filtersProfile'),
              profileDropdownOptions,
              selectedProfile,
              (value) => toggleFilterValue(selectedProfile, value, setSelectedProfile),
              t('profileFilterAll')
            )}
            {renderDropdown(
              'width',
              t('filtersWidth'),
              sizeOptions.widths,
              selectedWidth,
              (value) => toggleFilterValue(selectedWidth, value, setSelectedWidth),
              t('filtersAny')
            )}
            {renderDropdown(
              'length',
              t('filtersLength'),
              sizeOptions.lengths,
              selectedLength,
              (value) => toggleFilterValue(selectedLength, value, setSelectedLength),
              t('filtersAny')
            )}
          </div>
        </div>
      </PageLayout>

      {/* Product Grid */}
      <PageLayout>
      <div className="pb-[80px]">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#161616]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="font-['DM_Sans'] text-xl font-medium text-[#161616] mb-2">
              {t('errorTitle')}
            </h3>
            <p className="font-['Outfit'] text-[#7C7C7C] mb-2">
              {error}
            </p>
            <p className="font-['Outfit'] text-[#7C7C7C] mb-6">
              {t('errorHelp')}{' '}
              <Link href={toLocalePath('/kontaktai', currentLocale)} className="text-[#161616] underline">
                {t('errorContactLink')}
              </Link>{' '}
              {t('errorContactSuffix')}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-[#161616] text-white rounded-full hover:opacity-90"
            >
              {t('retry')}
            </button>
          </div>
        ) : orderedProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#EAEAEA] rounded-full mb-4">
              <svg className="w-8 h-8 text-[#BBBBBB]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="font-['DM_Sans'] text-xl font-medium text-[#161616] mb-2">
              {t('emptyTitle')}
            </h3>
            <p className="font-['Outfit'] text-[#7C7C7C] mb-6">
              {t('emptyDescriptionPrefix')}{' '}
              <Link href={toLocalePath('/kontaktai', currentLocale)} className="text-[#161616] underline">
                {t('emptyContactLink')}
              </Link>
              {t('emptyDescriptionSuffix')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-[16px] md:gap-x-[19px] gap-y-[40px] md:gap-y-[56px]">
            {shownProducts.map((product, idx) => (
              (() => {
                const localizedDisplayName = formatProductDisplayName(product);
                const attributeLabel = formatProductAttributes(product);
                const hasSale =
                  typeof product.salePrice === 'number' &&
                  product.salePrice > 0 &&
                  product.salePrice < product.price;
                const effectivePrice = hasSale ? product.salePrice! : product.price;
                const discountPercent = hasSale
                  ? Math.max(1, Math.round(((product.price - effectivePrice) / product.price) * 100))
                  : null;
                const hrefSlug = currentLocale === 'en' ? (product.slugEn ?? product.slug) : product.slug;
                const parsedStock = hrefSlug.includes('--') ? parseStockItemSlug(hrefSlug) : null;
                const detailSlug = parsedStock?.baseSlug ?? hrefSlug;
                const detailPath = toLocalePath(`/products/${detailSlug}`, currentLocale);
                const detailParams = new URLSearchParams();
                if (parsedStock?.size) {
                  const dims = parseSizeDimensions(parsedStock.size);
                  if (dims?.width) detailParams.set('w', String(dims.width));
                  if (dims?.length) detailParams.set('l', String(dims.length));
                }
                if (parsedStock?.color) detailParams.set('ct', normalizeToken(parsedStock.color));
                if (parsedStock?.profile) detailParams.set('ft', normalizeToken(parsedStock.profile));
                const detailHref = detailParams.toString()
                  ? `${detailPath}?${detailParams.toString()}`
                  : detailPath;

                const parsed = product.slug.includes('--') ? parseStockItemSlug(product.slug) : null;
                const dims = parsed?.size ? parseSizeDimensions(parsed.size) : null;
                const unitPrice = getUnitPrice(effectivePrice, dims);
                const unitPriceLabel = unitPrice ? formatUnitPrice(unitPrice) : null;

                return (
            <Link
              key={product.id}
              href={detailHref}
              data-testid="product-card"
              className="flex flex-col gap-[8px] group"
              onClick={() => {
                trackSelectItem({
                  id: product.id,
                  name: localizedDisplayName,
                  price: effectivePrice,
                  category: product.category,
                  position: idx + 1,
                });
              }}
            >
              <div className="relative w-full h-[250px] border border-[#161616] border-opacity-30 overflow-hidden">
                <Image
                  src={product.image || '/images/ui/wood/imgSpruce.png'}
                  alt={localizedDisplayName}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {discountPercent ? (
                  <div className="absolute top-[10px] right-[10px] rounded-[100px] bg-[#161616] px-[10px] py-[6px] text-[12px] font-['DM_Sans'] text-white">
                    -{discountPercent}%
                  </div>
                ) : null}
              </div>
              <p
                className="font-['DM_Sans'] font-medium text-[18px] leading-[1.2] text-[#161616] tracking-[-0.36px]"
                style={{ fontVariationSettings: "'opsz' 14" }}
              >
                {localizedDisplayName}
              </p>
              {attributeLabel ? (
                <p
                  className="font-['Outfit'] font-normal text-[12px] leading-[1.2] text-[#7C7C7C] tracking-[0.6px] uppercase"
                >
                  {attributeLabel}
                </p>
              ) : null}
              {(product.category || product.woodType) && (
                <p
                  className="font-['DM_Sans'] font-normal text-[14px] leading-[1.2] text-[#535353] tracking-[-0.28px]"
                  style={{ fontVariationSettings: "'opsz' 14" }}
                >
                  {[
                    product.category
                      ? usageLabels[product.category] ?? formatMaybeLabel(product.category)
                      : undefined,
                    product.woodType ? (woodLabels[product.woodType] ?? product.woodType) : undefined,
                  ]
                    .filter(Boolean)
                    .join(' • ')}
                </p>
              )}
              <p
                className="flex items-center justify-between gap-[12px] font-['DM_Sans'] font-normal text-[16px] leading-[1.2] text-[#535353] tracking-[-0.32px]"
                style={{ fontVariationSettings: "'opsz' 14" }}
              >
                <span className="flex items-center gap-[10px]">
                  <span className={hasSale ? 'text-[#161616]' : undefined}>
                    {formatCardPrice(effectivePrice)}
                  </span>
                  {hasSale ? (
                    <span className="text-[#7C7C7C] line-through">
                      {formatCardPrice(product.price)}
                    </span>
                  ) : null}
                </span>
                {unitPriceLabel ? (
                  <span className="text-[14px] text-[#161616]">
                    {unitPriceLabel}
                  </span>
                ) : null}
              </p>
            </Link>
              );
            })()
          ))}
          </div>
        )}

        {/* Load More Button - only show if there are products */}
        {!isLoading && shownProducts.length < orderedProducts.length && (
          <div className="flex justify-center mt-[64px]">
            <button
              onClick={() => setVisibleCount((c) => Math.min(c + PAGE_SIZE, orderedProducts.length))}
              className="h-[48px] px-[40px] py-[10px] bg-[#161616] text-white rounded-[100px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase hover:opacity-90 transition-opacity"
            >
              {t('loadMore')}
            </button>
          </div>
        )}
      </div>
      </PageLayout>
    </section>
  );
}
