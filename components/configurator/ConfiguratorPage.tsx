'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale, useTranslations } from 'next-intl';
import { PageCover, PageSection } from '@/components/shared';
import Konfiguratorius3D from '@/components/Konfiguratorius3D';
import { fetchProducts, type Product, type ProductColorVariant, type ProductProfileVariant } from '@/lib/products.supabase';
import { toLocalePath } from '@/i18n/paths';

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

const FALLBACK_COLORS: ProductColorVariant[] = [
  { id: 'demo-black', name: 'Black', hex: '#161616', priceModifier: 0 },
  { id: 'demo-charcoal', name: 'Charcoal', hex: '#535353', priceModifier: 0 },
  { id: 'demo-natural', name: 'Natural', hex: '#BBBBBB', priceModifier: 0 },
];

const FALLBACK_PROFILES: ProductProfileVariant[] = [
  {
    id: 'demo-half-taper-45',
    name: 'Half taper 45°',
    code: 'half_taper_45_deg',
    description: 'Demo profilis (Half taper 45°)',
    priceModifier: 0,
    dimensions: {
      width: 120,
      thickness: 20,
      length: 4000,
    },
  },
  {
    id: 'demo-rectangle',
    name: 'Rectangle',
    code: 'rectangle',
    description: 'Demo profilis (stačiakampis)',
    priceModifier: 0,
    dimensions: {
      width: 120,
      thickness: 20,
      length: 4000,
    },
  },
];

export default function ConfiguratorPage() {
  const t = useTranslations();
  const locale = useLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const [selectedUsage, setSelectedUsage] = useState<string[]>([]);
  const [selectedWood, setSelectedWood] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string[]>([]);
  const [selectedWidth, setSelectedWidth] = useState<string[]>([]);
  const [selectedLength, setSelectedLength] = useState<string[]>([]);
  const [openFilterId, setOpenFilterId] = useState<string | null>(null);

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        const products = await fetchProducts();
        if (!isMounted) return;
        setAllProducts(products);
        const nextProduct = products[0] ?? null;
        setProduct(nextProduct);
        setSelectedProductId(nextProduct?.id ?? null);
        setError(null);
      } catch (e) {
        if (!isMounted) return;
        setError(e instanceof Error ? e.message : 'Failed to load products');
        setProduct(null);
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizeToken = useCallback((value: string) => {
    return value
      .trim()
      .toLowerCase()
      .replace(/[_\s]+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }, []);

  const normalizeUsageId = useCallback(
    (value: string | undefined) => {
      const token = normalizeToken(value ?? '');
      if (!token) return null;
      if (token === 'facade' || token === 'terrace') return token;
      if (token.includes('facade') || token.includes('fasad')) return 'facade';
      if (token.includes('terrace') || token.includes('teras') || token.includes('deck')) return 'terrace';
      return token;
    },
    [normalizeToken]
  );

  const normalizeWoodId = useCallback(
    (value: string | undefined) => {
      const token = normalizeToken(value ?? '');
      if (!token) return null;
      if (token === 'spruce' || token === 'larch') return token;
      if (token.includes('spruce') || token.includes('egle') || token.includes('egl')) return 'spruce';
      if (token.includes('larch') || token.includes('maumed') || token.includes('maum')) return 'larch';
      return null;
    },
    [normalizeToken]
  );

  const usageOptions = useMemo(
    () => [
      { value: 'facade', label: t('productsPage.usageFilters.facade') },
      { value: 'terrace', label: t('productsPage.usageFilters.terrace') },
    ],
    [t]
  );

  const woodOptions = useMemo(
    () => [
      { value: 'spruce', label: t('productsPage.woodFilters.spruce') },
      { value: 'larch', label: t('productsPage.woodFilters.larch') },
    ],
    [t]
  );

  const colorOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of allProducts) {
      for (const c of p.colors ?? []) {
        if (c?.name) set.add(c.name);
      }
    }
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ value: normalizeToken(value), label: value }));
  }, [allProducts, normalizeToken]);

  const profileOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of allProducts) {
      for (const prof of p.profiles ?? []) {
        if (prof?.name) set.add(prof.name);
      }
    }
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ value: normalizeToken(value), label: value }));
  }, [allProducts, normalizeToken]);

  const sizeOptions = useMemo(() => {
    const widths = new Set<string>();
    const lengths = new Set<string>();

    for (const p of allProducts) {
      for (const prof of p.profiles ?? []) {
        const w = prof?.dimensions?.width;
        const l = prof?.dimensions?.length;
        if (typeof w === 'number' && Number.isFinite(w) && w > 0) widths.add(String(w));
        if (typeof l === 'number' && Number.isFinite(l) && l > 0) lengths.add(String(l));
      }
    }

    const formatMm = (value: string) => `${value} mm`;

    return {
      widths: Array.from(widths)
        .sort((a, b) => Number(a) - Number(b))
        .map((value) => ({ value, label: formatMm(value) })),
      lengths: Array.from(lengths)
        .sort((a, b) => Number(a) - Number(b))
        .map((value) => ({ value, label: formatMm(value) })),
    };
  }, [allProducts]);

  const toggleFilterValue = useCallback((list: string[], value: string, setter: (next: string[]) => void) => {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }, []);

  const setSelectedUsageSafe = useCallback((next: string[]) => setSelectedUsage(next), []);
  const setSelectedWoodSafe = useCallback((next: string[]) => setSelectedWood(next), []);
  const setSelectedColorSafe = useCallback((next: string[]) => setSelectedColor(next), []);
  const setSelectedProfileSafe = useCallback((next: string[]) => setSelectedProfile(next), []);
  const setSelectedWidthSafe = useCallback((next: string[]) => setSelectedWidth(next), []);
  const setSelectedLengthSafe = useCallback((next: string[]) => setSelectedLength(next), []);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const usageId = normalizeUsageId(p.category);
      const matchesUsage = selectedUsage.length === 0 || (usageId ? selectedUsage.includes(usageId) : false);
      const woodId = normalizeWoodId(p.woodType);
      const matchesWood = selectedWood.length === 0 || (woodId ? selectedWood.includes(woodId) : false);

      const normalizedColors = (p.colors ?? []).map((c) => normalizeToken(c?.name ?? '')).filter(Boolean);
      const matchesColor =
        selectedColor.length === 0 || selectedColor.some((value) => normalizedColors.includes(normalizeToken(value)));

      const normalizedProfiles = (p.profiles ?? []).map((prof) => normalizeToken(prof?.name ?? '')).filter(Boolean);
      const matchesProfile =
        selectedProfile.length === 0 || selectedProfile.some((value) => normalizedProfiles.includes(normalizeToken(value)));

      const widths = (p.profiles ?? [])
        .map((prof) => prof?.dimensions?.width)
        .filter((v): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0)
        .map((v) => String(v));
      const lengths = (p.profiles ?? [])
        .map((prof) => prof?.dimensions?.length)
        .filter((v): v is number => typeof v === 'number' && Number.isFinite(v) && v > 0)
        .map((v) => String(v));

      const matchesWidth = selectedWidth.length === 0 || selectedWidth.some((value) => widths.includes(value));
      const matchesLength = selectedLength.length === 0 || selectedLength.some((value) => lengths.includes(value));

      return matchesUsage && matchesWood && matchesColor && matchesProfile && matchesWidth && matchesLength;
    });
  }, [allProducts, normalizeToken, normalizeUsageId, normalizeWoodId, selectedColor, selectedLength, selectedProfile, selectedUsage, selectedWidth, selectedWood]);

  useEffect(() => {
    if (filteredProducts.length === 0) {
      setProduct(null);
      setSelectedProductId(null);
      return;
    }

    const next = filteredProducts.find((item) => item.id === selectedProductId) ?? filteredProducts[0];

    if (next && next.id !== selectedProductId) {
      setSelectedProductId(next.id);
    }

    if (next && next.id !== product?.id) {
      setProduct(next);
    }
  }, [filteredProducts, product?.id, selectedProductId]);

  const availableColors = useMemo(() => {
    const colors = product?.colors ?? [];
    return colors.length > 0 ? colors : FALLBACK_COLORS;
  }, [product]);

  const availableFinishes = useMemo(() => {
    const profiles = product?.profiles ?? [];
    return profiles.length > 0 ? profiles : FALLBACK_PROFILES;
  }, [product]);

  return (
    <main className="min-h-screen bg-[#E1E1E1]">
      <PageCover>
        <div className="flex flex-col gap-[12px]">
          <h1
            className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] text-[#161616] tracking-[-2.8px] md:tracking-[-6.4px]"
            style={{ fontVariationSettings: "'opsz' 14" }}
          >
            {locale === 'lt' ? t('nav.konfiguratorius3d') : t('nav.configurator3d')}
          </h1>
          <p className="max-w-[820px] font-['Outfit'] text-[14px] md:text-[16px] leading-[1.6] text-[#535353]">
            {t('configurator.pageDescription')}
          </p>
        </div>
      </PageCover>

      <PageSection className="max-w-[1440px] mx-auto" centered={false}>
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-[10px]">
            <FilterDropdown
              id="usage"
              label={t('productsPage.filtersUsage')}
              options={usageOptions}
              selected={selectedUsage}
              onToggle={(value) => toggleFilterValue(selectedUsage, value, setSelectedUsageSafe)}
              allLabel={t('productsPage.usageFilters.all')}
              emptyLabel={t('productsPage.filtersEmpty')}
              openId={openFilterId}
              setOpenId={setOpenFilterId}
            />
            <FilterDropdown
              id="wood"
              label={t('productsPage.filtersWood')}
              options={woodOptions}
              selected={selectedWood}
              onToggle={(value) => toggleFilterValue(selectedWood, value, setSelectedWoodSafe)}
              allLabel={t('productsPage.woodFilters.all')}
              emptyLabel={t('productsPage.filtersEmpty')}
              openId={openFilterId}
              setOpenId={setOpenFilterId}
            />
            <FilterDropdown
              id="color"
              label={t('productsPage.filtersColor')}
              options={colorOptions}
              selected={selectedColor}
              onToggle={(value) => toggleFilterValue(selectedColor, value, setSelectedColorSafe)}
              allLabel={t('productsPage.colorFilterAll')}
              emptyLabel={t('productsPage.filtersEmpty')}
              openId={openFilterId}
              setOpenId={setOpenFilterId}
            />
            <FilterDropdown
              id="profile"
              label={t('productsPage.filtersProfile')}
              options={profileOptions}
              selected={selectedProfile}
              onToggle={(value) => toggleFilterValue(selectedProfile, value, setSelectedProfileSafe)}
              allLabel={t('productsPage.profileFilterAll')}
              emptyLabel={t('productsPage.filtersEmpty')}
              openId={openFilterId}
              setOpenId={setOpenFilterId}
            />
            <FilterDropdown
              id="width"
              label={t('productsPage.filtersWidth')}
              options={sizeOptions.widths}
              selected={selectedWidth}
              onToggle={(value) => toggleFilterValue(selectedWidth, value, setSelectedWidthSafe)}
              allLabel={t('productsPage.filtersAny')}
              emptyLabel={t('productsPage.filtersEmpty')}
              openId={openFilterId}
              setOpenId={setOpenFilterId}
            />
            <FilterDropdown
              id="length"
              label={t('productsPage.filtersLength')}
              options={sizeOptions.lengths}
              selected={selectedLength}
              onToggle={(value) => toggleFilterValue(selectedLength, value, setSelectedLengthSafe)}
              allLabel={t('productsPage.filtersAny')}
              emptyLabel={t('productsPage.filtersEmpty')}
              openId={openFilterId}
              setOpenId={setOpenFilterId}
            />
          </div>
          {filteredProducts.length > 1 && (
            <div className="w-full max-w-[420px]">
              <label className="block font-['Outfit'] font-normal text-[12px] leading-[1.3] tracking-[0.6px] uppercase text-[#161616] mb-[8px]">
                {t('breadcrumbs.products')}
              </label>
              <select
                value={selectedProductId ?? ''}
                onChange={(event) => {
                  const nextId = event.target.value;
                  setSelectedProductId(nextId);
                  const nextProduct = filteredProducts.find((item) => item.id === nextId) ?? null;
                  setProduct(nextProduct);
                }}
                className="w-full h-[40px] px-[16px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] font-normal text-[14px] leading-[1.5] text-[#161616] bg-white yw-select"
              >
                {filteredProducts.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        {error && (
          <div className="w-full border border-[#BBBBBB] rounded-[24px] bg-white p-[24px]">
            <p className="font-['Outfit'] text-[14px] text-[#535353]">{t('configurator.loadError')}</p>
            <p className="mt-2 font-['Outfit'] text-[12px] text-[#7C7C7C]">{error}</p>
          </div>
        )}

        {!error && filteredProducts.length === 0 && !isLoading && (
          <div className="w-full border border-[#BBBBBB] rounded-[24px] bg-white p-[24px]">
            <p className="font-['Outfit'] text-[14px] text-[#535353]">{t('productsPage.emptyTitle')}</p>
            <p className="mt-2 font-['Outfit'] text-[12px] text-[#7C7C7C]">
              {t('productsPage.emptyDescriptionPrefix')}{' '}
              <a href={toLocalePath('/kontaktai', currentLocale)} className="text-[#161616] underline">
                {t('productsPage.emptyContactLink')}
              </a>
              {t('productsPage.emptyDescriptionSuffix')}
            </p>

            <div className="mt-[20px]">
              <p className="font-['Outfit'] text-[10px] tracking-[0.6px] uppercase text-[#7C7C7C]">Demo 3D (pavyzdys)</p>
              <div className="mt-[10px]">
                <Konfiguratorius3D
                  productId="demo"
                  availableColors={FALLBACK_COLORS}
                  availableFinishes={FALLBACK_PROFILES}
                  isLoading={false}
                />
              </div>
            </div>
          </div>
        )}

        {!error && (product || isLoading) && (
          <div className="w-full">
            <Konfiguratorius3D
              productId={product?.id ?? 'demo'}
              availableColors={availableColors}
              availableFinishes={availableFinishes}
              isLoading={isLoading}
            />
          </div>
        )}
      </PageSection>
    </main>
  );
}
