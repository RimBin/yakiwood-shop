'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { toLocalePath } from '@/i18n/paths';
import type { Product, ProductColorVariant, ProductProfileVariant } from '@/lib/products.supabase';
import { localizeColorLabel } from '@/lib/products.supabase';
import { assets, getAsset } from '@/lib/assets';
import { useCartStore } from '@/lib/cart/store';
import { trackEvent, trackProductView } from '@/lib/analytics';
import Konfiguratorius3D from '@/components/Konfiguratorius3D';
import type { UsageType } from '@/lib/pricing/configuration';

interface ProductDetailClientProps {
  product: Product;
}

function normalizeLabel(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

function normalizeColorKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseStockItemSlug(slug: string) {
  const parts = slug.split('--');
  if (parts.length < 4) return null;
  const [baseSlug, profile, color, size] = parts;
  if (!baseSlug || !profile || !color || !size) return null;
  return { baseSlug, profile, color, size };
}

function parseSizeToken(size: string | undefined | null): { widthMm: number; lengthMm: number } | null {
  if (!size) return null;
  const match = String(size).trim().match(/(\d+)\s*[x×]\s*(\d+)/i);
  if (!match) return null;
  const widthMm = Number(match[1]);
  const lengthMm = Number(match[2]);
  if (!Number.isFinite(widthMm) || !Number.isFinite(lengthMm) || widthMm <= 0 || lengthMm <= 0) return null;
  return { widthMm, lengthMm };
}

function formatSizeLabel(value: string): string {
  if (!value) return value;
  return `${value.replace(/x/gi, '×')} mm`;
}

// Use the centralized color swatch mapping from assets
const COLOR_SWATCH_MAP = assets.colorSwatchMap;

function resolveColorSwatchSrc(color: Pick<ProductColorVariant, 'name'>): string | null {
  const label = normalizeLabel(color.name || '');
  if (!label) return null;
  for (const entry of COLOR_SWATCH_MAP) {
    if (entry.tokens.some((t) => label.includes(t))) {
      return getAsset(entry.assetKey);
    }
  }
  return null;
}

function resolveProfileIconSrc(profile: Pick<ProductProfileVariant, 'name' | 'code'>): string | null {
  const label = normalizeLabel([profile.name, profile.code].filter(Boolean).join(' '));
  if (!label) return null;

  if (label.includes('45') && (label.includes('half') || label.includes('taper') || label.includes('pus') || label.includes('spunto'))) {
    return assets.profiles.halfTaper45Deg;
  }

  if (label.includes('half') || label.includes('taper') || label.includes('pus') || label.includes('spunto')) {
    return assets.profiles.halfTaper;
  }

  if (label.includes('rectangle') || label.includes('staciakamp')) {
    return assets.profiles.rectangle;
  }

  if (label.includes('rhomb') || label.includes('romb')) {
    return assets.profiles.rhombus;
  }

  return null;
}

const PROFILE_ICON_FALLBACK_BY_INDEX = [
  assets.profiles.halfTaper45Deg,
  assets.profiles.halfTaper,
  assets.profiles.rectangle,
  assets.profiles.rhombus,
] as const;

const FALLBACK_PROFILE_OPTIONS: Array<Pick<ProductProfileVariant, 'id' | 'name' | 'code' | 'description' | 'priceModifier'>> = [
  {
    id: 'fallback-profile-half-taper-45',
    name: 'Half-taper 45°',
    code: 'HALF_TAPER_45',
    description: undefined,
    priceModifier: 0,
  },
  {
    id: 'fallback-profile-half-taper',
    name: 'Half-taper',
    code: 'HALF_TAPER',
    description: undefined,
    priceModifier: 0,
  },
  {
    id: 'fallback-profile-rectangle',
    name: 'Rectangle',
    code: 'RECTANGLE',
    description: undefined,
    priceModifier: 0,
  },
  {
    id: 'fallback-profile-rhombus',
    name: 'Rhombus',
    code: 'RHOMBUS',
    description: undefined,
    priceModifier: 0,
  },
];

function isFallbackProfileId(id: string | undefined | null): boolean {
  return typeof id === 'string' && id.startsWith('fallback-profile-');
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const t = useTranslations('productPage');
  const tBreadcrumbs = useTranslations('breadcrumbs');
  const locale = useLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);

  const widthOptionsMm = useMemo(() => [95, 120, 145] as const, []);
  const lengthOptionsMm = useMemo(() => [3000, 3300, 3600] as const, []);

  const cartTotalAreaM2 = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const a = item.pricingSnapshot?.totalAreaM2;
      if (typeof a === 'number' && Number.isFinite(a) && a > 0) return sum + a;
      return sum;
    }, 0);
  }, [cartItems]);

  const baseDisplayName = useMemo(() => {
    const usageKey = typeof product.category === 'string' ? product.category.trim().toLowerCase() : '';
    const woodKey = typeof product.woodType === 'string' ? product.woodType.trim().toLowerCase() : '';

    const usageLabel =
      usageKey === 'terrace'
        ? currentLocale === 'lt'
          ? 'Terasinė lenta'
          : 'Terrace board'
        : usageKey === 'facade'
          ? currentLocale === 'lt'
            ? 'Fasadinė dailylentė'
            : 'Facade cladding'
          : '';

    const woodLabel =
      woodKey === 'larch'
        ? currentLocale === 'lt'
          ? 'Maumedis'
          : 'Larch'
        : woodKey === 'spruce'
          ? currentLocale === 'lt'
            ? 'Eglė'
            : 'Spruce'
          : '';

    const base = usageLabel && woodLabel ? `${usageLabel} / ${woodLabel}` : '';
    return base || (currentLocale === 'en' && product.nameEn ? product.nameEn : product.name);
  }, [product.category, product.woodType, product.name, product.nameEn, currentLocale]);
  const displayDescription =
    currentLocale === 'en' && product.descriptionEn ? product.descriptionEn : product.description;
  const hasSale =
    typeof product.salePrice === 'number' &&
    product.salePrice > 0 &&
    product.salePrice < product.price;
  const effectivePrice = hasSale ? product.salePrice! : product.price;

  const trackedProductIdRef = useRef<string | null>(null);

  const [activeThumb, setActiveThumb] = useState(0);
  const [show3D, setShow3D] = useState(false);
  const loading3D = false;

  const stockPreset = useMemo(() => {
    const parsed = parseStockItemSlug(product.slug);
    if (!parsed) return null;
    return {
      profileToken: parsed.profile,
      colorToken: parsed.color,
      size: parseSizeToken(parsed.size),
    };
  }, [product.slug]);

  const [selectedColor, setSelectedColor] = useState<ProductColorVariant | null>(null);
  const [selectedFinish, setSelectedFinish] = useState<ProductProfileVariant | null>(null);
  const [selectedWidthMm, setSelectedWidthMm] = useState<number>(() => widthOptionsMm[0]);
  const [selectedLengthMm, setSelectedLengthMm] = useState<number>(() => lengthOptionsMm[0]);
  const [targetAreaM2, setTargetAreaM2] = useState<number>(200);

  const selectedSizeLabel = useMemo(() => {
    return `${selectedWidthMm}×${selectedLengthMm} mm`;
  }, [selectedWidthMm, selectedLengthMm]);

  const localizedDisplayName = useMemo(() => {
    return baseDisplayName;
  }, [baseDisplayName]);

  const attributeSummary = useMemo(() => {
    const parsed = product.slug.includes('--') ? parseStockItemSlug(product.slug) : null;
    const colorName = selectedColor?.name || (parsed?.color ? localizeColorLabel(parsed.color, currentLocale) : '');
    const profileName = selectedFinish?.name || (parsed?.profile ? parsed.profile.replace(/[-_]+/g, ' ') : '');
    const sizeLabel = selectedSizeLabel || (parsed?.size ? formatSizeLabel(parsed.size) : '');
    return [profileName, colorName, sizeLabel].filter(Boolean).join(' · ');
  }, [product.slug, selectedColor?.name, selectedFinish?.name, selectedSizeLabel, currentLocale]);

  useEffect(() => {
    if (!product?.id) return;
    if (trackedProductIdRef.current === product.id) return;

    trackProductView({
      id: product.id,
      name: localizedDisplayName,
      price: effectivePrice,
      category: product.category,
    });

    trackedProductIdRef.current = product.id;
  }, [effectivePrice, localizedDisplayName, product?.category, product?.id]);

  const colorOptions = useMemo<ProductColorVariant[]>(() => {
    return (product.colors || []).map((color, index) => ({
      ...color,
      id: color.id || `${product.id}-color-${index}`,
      name: color.name ? localizeColorLabel(color.name, currentLocale) : color.name,
      hex: color.hex || '#444444',
      priceModifier: color.priceModifier ?? 0,
    }));
  }, [product.colors, product.id, currentLocale]);

  const usageTypeForQuote: UsageType | undefined = useMemo(() => {
    const v = String(product.category || '').toLowerCase();
    if (v === 'cladding') return 'facade';
    if (v === 'decking') return 'terrace';
    if (v === 'tiles') return 'interior';
    if (v === 'facade' || v === 'terrace' || v === 'interior' || v === 'fence') return v;
    return undefined;
  }, [product.category]);

  const profileOptions = useMemo<ProductProfileVariant[]>(() => {
    const mapped = (product.profiles || []).map((profile, index) => {
      const dimensionLabel = [
        profile.dimensions?.width ? `${profile.dimensions.width} mm` : null,
        profile.dimensions?.thickness ? `× ${profile.dimensions.thickness} mm` : null,
        profile.dimensions?.length ? `× ${profile.dimensions.length} mm` : null,
      ]
        .filter(Boolean)
        .join(' ');

      const description = [dimensionLabel, profile.description]
        .filter(Boolean)
        .join(' • ');

      return {
        ...profile,
        id: profile.id || `${product.id}-profile-${index}`,
        description,
        priceModifier: profile.priceModifier ?? 0,
      };
    });

    if (mapped.length > 0) {
      if (usageTypeForQuote === 'terrace') return mapped.slice(0, 1);
      if (usageTypeForQuote === 'facade' && mapped.length > 1) return mapped.slice(1);
      return mapped;
    }
    return FALLBACK_PROFILE_OPTIONS.map((fallback) => ({ ...(fallback as unknown as ProductProfileVariant) }));
  }, [product.id, product.profiles, usageTypeForQuote]);

  const skipNextUrlSyncRef = useRef(false);

  const selectionInitializedForProductIdRef = useRef<string | null>(null);

  const [selectedThicknessMm, setSelectedThicknessMm] = useState<number>(() => {
    return usageTypeForQuote === 'terrace' ? 28 : 20;
  });

  const thicknessOptions = useMemo(() => {
    const all = [
      { valueMm: 20, label: '18/20 mm' },
      { valueMm: 28, label: '28 mm' },
    ];

    if (usageTypeForQuote === 'terrace') return all.filter((x) => x.valueMm === 28);
    if (usageTypeForQuote === 'facade') return all.filter((x) => x.valueMm === 20);
    return all;
  }, [usageTypeForQuote]);

  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quotedPricing, setQuotedPricing] = useState<null | {
    unitPricePerBoard: number;
    unitPricePerM2: number;
    unitAreaM2: number;
    totalAreaM2: number;
    quantityBoards: number;
    lineTotal: number;
  }>(null);

  const baseSlugForSelection = useMemo(() => {
    return String(product.slug || '').split('--')[0] || String(product.slug || '');
  }, [product.slug]);

  const selectedColorToken = useMemo(() => {
    return selectedColor?.name ? normalizeColorKey(String(selectedColor.name)) : '';
  }, [selectedColor?.name]);

  const selectedProfileToken = useMemo(() => {
    const raw = [selectedFinish?.code, selectedFinish?.name].filter(Boolean).join(' ');
    return raw ? normalizeColorKey(raw) : '';
  }, [selectedFinish?.code, selectedFinish?.name]);

  const [variantInventory, setVariantInventory] = useState<null | {
    loading: boolean;
    foundProduct: boolean;
    foundInventory: boolean;
    sku: string | null;
    quantityAvailable: number;
    quantityReserved: number;
  }>(null);

  useEffect(() => {
    if (!product?.id) return;
    if (selectionInitializedForProductIdRef.current === product.id) return;

    // Initialize once per product (including stock-item presets).
    const urlColorId = searchParams.get('c');
    const urlFinishId = searchParams.get('f');
    const urlWidth = Number(searchParams.get('w'));
    const urlLength = Number(searchParams.get('l'));
    const urlThickness = Number(searchParams.get('t'));

    const presetColorKey = stockPreset?.colorToken ? normalizeColorKey(stockPreset.colorToken) : null;
    const presetProfileKey = stockPreset?.profileToken ? normalizeLabel(stockPreset.profileToken) : null;

    const initialColor =
      urlColorId && colorOptions.length
        ? colorOptions.find((c) => c.id === urlColorId) ?? null
        : presetColorKey && colorOptions.length
          ? colorOptions.find((c) => normalizeColorKey(c.name || '').includes(presetColorKey)) ?? null
          : null;

    const initialFinish =
      urlFinishId && profileOptions.length
        ? profileOptions.find((p) => p.id === urlFinishId) ?? null
        : presetProfileKey && profileOptions.length
          ? profileOptions.find((p) => {
              const hay = normalizeLabel([p.code, p.name].filter(Boolean).join(' '));
              return hay.includes(presetProfileKey);
            }) ?? null
          : null;

    setSelectedColor(initialColor ?? colorOptions[0] ?? null);
    setSelectedFinish(initialFinish ?? profileOptions[0] ?? null);

    if (Number.isFinite(urlWidth) && widthOptionsMm.includes(urlWidth as any)) {
      setSelectedWidthMm(urlWidth);
    } else {
      const presetSize = stockPreset?.size;
      if (presetSize && widthOptionsMm.includes(presetSize.widthMm as any)) setSelectedWidthMm(presetSize.widthMm);
    }

    if (Number.isFinite(urlLength) && lengthOptionsMm.includes(urlLength as any)) {
      setSelectedLengthMm(urlLength);
    } else {
      const presetSize = stockPreset?.size;
      if (presetSize && lengthOptionsMm.includes(presetSize.lengthMm as any)) setSelectedLengthMm(presetSize.lengthMm);
    }

    if (Number.isFinite(urlThickness) && thicknessOptions.some((x) => x.valueMm === urlThickness)) {
      setSelectedThicknessMm(urlThickness);
    }

    selectionInitializedForProductIdRef.current = product.id;
  }, [product?.id, stockPreset, colorOptions, profileOptions, widthOptionsMm, lengthOptionsMm, thicknessOptions, searchParamsKey, searchParams]);

  useEffect(() => {
    if (!product?.id) return;
    if (selectionInitializedForProductIdRef.current !== product.id) return;

    const urlColorId = searchParams.get('c');
    const urlFinishId = searchParams.get('f');
    const urlWidth = Number(searchParams.get('w'));
    const urlLength = Number(searchParams.get('l'));
    const urlThickness = Number(searchParams.get('t'));

    let didUpdate = false;

    if (urlColorId && selectedColor?.id !== urlColorId) {
      const match = colorOptions.find((c) => c.id === urlColorId) ?? null;
      if (match) {
        setSelectedColor(match);
        didUpdate = true;
      }
    }

    if (urlFinishId && selectedFinish?.id !== urlFinishId) {
      const match = profileOptions.find((p) => p.id === urlFinishId) ?? null;
      if (match) {
        setSelectedFinish(match);
        didUpdate = true;
      }
    }

    if (Number.isFinite(urlWidth) && widthOptionsMm.includes(urlWidth as any) && selectedWidthMm !== urlWidth) {
      setSelectedWidthMm(urlWidth);
      didUpdate = true;
    }

    if (Number.isFinite(urlLength) && lengthOptionsMm.includes(urlLength as any) && selectedLengthMm !== urlLength) {
      setSelectedLengthMm(urlLength);
      didUpdate = true;
    }

    if (Number.isFinite(urlThickness) && thicknessOptions.some((x) => x.valueMm === urlThickness) && selectedThicknessMm !== urlThickness) {
      setSelectedThicknessMm(urlThickness);
      didUpdate = true;
    }

    if (didUpdate) {
      skipNextUrlSyncRef.current = true;
    }
  }, [product?.id, searchParamsKey, colorOptions, profileOptions, widthOptionsMm, lengthOptionsMm, thicknessOptions, selectedColor?.id, selectedFinish?.id, selectedWidthMm, selectedLengthMm, selectedThicknessMm, searchParams]);

  useEffect(() => {
    if (!product?.id) return;
    if (selectionInitializedForProductIdRef.current !== product.id) return;

    if (skipNextUrlSyncRef.current) {
      skipNextUrlSyncRef.current = false;
      return;
    }

    const next = new URLSearchParams(searchParams.toString());

    const desired: Record<string, string | null> = {
      w: String(selectedWidthMm),
      l: String(selectedLengthMm),
      c: selectedColor?.id ?? null,
      f: selectedFinish?.id ?? null,
      t: String(selectedThicknessMm),
    };

    let changed = false;
    for (const [key, value] of Object.entries(desired)) {
      const current = next.get(key);
      if (value === null || value === '') {
        if (current !== null) {
          next.delete(key);
          changed = true;
        }
        continue;
      }
      if (current !== value) {
        next.set(key, value);
        changed = true;
      }
    }

    if (!changed) return;
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [product?.id, selectedWidthMm, selectedLengthMm, selectedColor?.id, selectedFinish?.id, selectedThicknessMm, pathname, router, searchParamsKey, searchParams]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const base = 'Yakiwood';
    document.title = localizedDisplayName ? `${localizedDisplayName} | ${base}` : base;
  }, [localizedDisplayName]);

  useEffect(() => {
    // Keep a valid selection if the options list changes.
    if (!selectedColor) {
      setSelectedColor(colorOptions[0] ?? null);
      return;
    }
    if (!colorOptions.some((c) => c.id === selectedColor.id)) {
      setSelectedColor(colorOptions[0] ?? null);
    }
  }, [colorOptions, selectedColor]);

  useEffect(() => {
    if (!selectedFinish) {
      setSelectedFinish(profileOptions[0] ?? null);
      return;
    }
    if (!profileOptions.some((p) => p.id === selectedFinish.id)) {
      setSelectedFinish(profileOptions[0] ?? null);
    }
  }, [profileOptions, selectedFinish]);

  useEffect(() => {
    const allowed = new Set(thicknessOptions.map((x) => x.valueMm));
    if (!allowed.has(selectedThicknessMm)) {
      setSelectedThicknessMm(thicknessOptions[0]?.valueMm ?? 20);
    }
  }, [selectedThicknessMm, thicknessOptions]);

  useEffect(() => {
    if (!baseSlugForSelection || !selectedColorToken || !selectedProfileToken) {
      setVariantInventory(null);
      return;
    }

    const controller = new AbortController();
    setVariantInventory((prev) => ({
      loading: true,
      foundProduct: prev?.foundProduct ?? false,
      foundInventory: prev?.foundInventory ?? false,
      sku: prev?.sku ?? null,
      quantityAvailable: prev?.quantityAvailable ?? 0,
      quantityReserved: prev?.quantityReserved ?? 0,
    }));

    const run = async () => {
      try {
        const qs = new URLSearchParams({
          baseSlug: baseSlugForSelection,
          profile: selectedProfileToken,
          color: selectedColorToken,
          w: String(selectedWidthMm),
          l: String(selectedLengthMm),
        });

        const res = await fetch(`/api/public/variant-inventory?${qs.toString()}`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) {
          setVariantInventory(null);
          return;
        }

        const data = (await res.json()) as any;
        setVariantInventory({
          loading: false,
          foundProduct: !!data?.foundProduct,
          foundInventory: !!data?.foundInventory,
          sku: typeof data?.sku === 'string' ? data.sku : null,
          quantityAvailable: Number.isFinite(Number(data?.quantityAvailable)) ? Number(data.quantityAvailable) : 0,
          quantityReserved: Number.isFinite(Number(data?.quantityReserved)) ? Number(data.quantityReserved) : 0,
        });
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setVariantInventory(null);
      }
    };

    run();
    return () => controller.abort();
  }, [baseSlugForSelection, selectedColorToken, selectedProfileToken, selectedWidthMm, selectedLengthMm]);

  const selectedThicknessLabel = useMemo(() => {
    return thicknessOptions.find((opt) => opt.valueMm === selectedThicknessMm)?.label ?? `${selectedThicknessMm} mm`;
  }, [selectedThicknessMm, thicknessOptions]);

  const selectionPrice = useMemo(() => {
    const colorMod = selectedColor?.priceModifier ?? 0;
    const finishMod = selectedFinish?.priceModifier ?? 0;
    return effectivePrice + colorMod + finishMod;
  }, [effectivePrice, selectedColor?.priceModifier, selectedFinish?.priceModifier]);

  const handleAddToCart = () => {
    const unitPricePerBoard = quotedPricing?.unitPricePerBoard;
    const unitPricePerM2 = quotedPricing?.unitPricePerM2;
    const unitAreaM2 = quotedPricing?.unitAreaM2;
    const totalAreaM2 = quotedPricing?.totalAreaM2;
    const quantityBoards = quotedPricing?.quantityBoards;
    const lineTotal = quotedPricing?.lineTotal;

    const resolvedQuantityBoards =
      typeof quantityBoards === 'number' && Number.isFinite(quantityBoards) && quantityBoards > 0
        ? Math.max(1, Math.round(quantityBoards))
        : 1;

    addItem({
      id: product.id,
      name: localizedDisplayName,
      slug: product.slug,
      basePrice: typeof unitPricePerBoard === 'number' ? unitPricePerBoard : selectionPrice,
      quantity: resolvedQuantityBoards,
      color: selectedColor?.name,
      finish: selectedFinish?.name,
      configuration: {
        usageType: usageTypeForQuote,
        colorVariantId: selectedColor?.id,
        profileVariantId: selectedFinish?.id,
        sku: typeof variantInventory?.sku === 'string' && variantInventory.sku.trim().length > 0 ? variantInventory.sku : undefined,
        thicknessMm: selectedThicknessMm,
        widthMm: selectedWidthMm,
        lengthMm: selectedLengthMm,
      },
      inputMode: 'area',
      targetAreaM2:
        typeof targetAreaM2 === 'number' && Number.isFinite(targetAreaM2) && targetAreaM2 > 0
          ? targetAreaM2
          : undefined,
      pricingSnapshot:
        typeof unitPricePerBoard === 'number' &&
        typeof unitPricePerM2 === 'number' &&
        typeof unitAreaM2 === 'number' &&
        typeof totalAreaM2 === 'number' &&
        typeof lineTotal === 'number'
          ? {
              unitAreaM2,
              totalAreaM2,
              pricePerM2Used: unitPricePerM2,
              unitPrice: unitPricePerBoard,
              lineTotal,
            }
          : undefined,
    });
  };

  useEffect(() => {
    const widthMm = selectedWidthMm;
    const lengthMm = selectedLengthMm;

    const safeTargetAreaM2 =
      typeof targetAreaM2 === 'number' && Number.isFinite(targetAreaM2) && targetAreaM2 > 0 ? targetAreaM2 : 0;

    if (!product?.id) return;
    if (!safeTargetAreaM2) {
      setQuotedPricing(null);
      setQuoteError(null);
      return;
    }

    const controller = new AbortController();

    const run = async () => {
      setQuoteLoading(true);
      setQuoteError(null);
      try {
        const res = await fetch('/api/pricing/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            productId: product.id,
            usageType: usageTypeForQuote,
            profileVariantId: isFallbackProfileId(selectedFinish?.id) ? undefined : selectedFinish?.id,
            colorVariantId: selectedColor?.id,
            thicknessMm: selectedThicknessMm,
            widthMm,
            lengthMm,
            inputMode: 'area',
            targetAreaM2: safeTargetAreaM2,
            cartTotalAreaM2: cartTotalAreaM2 + safeTargetAreaM2,
          }),
        });

        if (!res.ok) {
          setQuotedPricing(null);
          try {
            const data = await res.json();
            setQuoteError(typeof data?.error === 'string' ? data.error : null);
          } catch {
            setQuoteError(null);
          }
          return;
        }

        const data = await res.json();
        const unitPricePerBoard = Number(data?.unitPricePerBoard);
        const unitPricePerM2 = Number(data?.unitPricePerM2);
        const quotedUnitAreaM2 = Number(data?.areaM2);
        const quotedTotalAreaM2 = Number(data?.totalAreaM2);
        const quotedQuantityBoards = Number(data?.quantityBoards);
        const quotedLineTotal = Number(data?.lineTotal);

        if (
          Number.isFinite(unitPricePerBoard) &&
          unitPricePerBoard > 0 &&
          Number.isFinite(unitPricePerM2) &&
          unitPricePerM2 > 0 &&
          Number.isFinite(quotedUnitAreaM2) &&
          quotedUnitAreaM2 > 0 &&
          Number.isFinite(quotedTotalAreaM2) &&
          quotedTotalAreaM2 > 0 &&
          Number.isFinite(quotedQuantityBoards) &&
          quotedQuantityBoards > 0 &&
          Number.isFinite(quotedLineTotal) &&
          quotedLineTotal > 0
        ) {
          setQuotedPricing({
            unitPricePerBoard,
            unitPricePerM2,
            unitAreaM2: quotedUnitAreaM2,
            totalAreaM2: quotedTotalAreaM2,
            quantityBoards: quotedQuantityBoards,
            lineTotal: quotedLineTotal,
          });
        } else {
          setQuotedPricing(null);
        }
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setQuotedPricing(null);
        setQuoteError(currentLocale === 'lt' ? 'Nepavyko apskaičiuoti kainos' : 'Failed to calculate price');
      } finally {
        setQuoteLoading(false);
      }
    };

    run();

    return () => controller.abort();
  }, [product?.id, usageTypeForQuote, selectedFinish?.id, selectedColor?.id, selectedThicknessMm, selectedWidthMm, selectedLengthMm, targetAreaM2, cartTotalAreaM2, currentLocale]);

  const thumbs = useMemo(() => {
    const srcs = [product.images?.[0], product.images?.[1], product.images?.[2]].filter(Boolean) as string[];
    if (srcs.length === 0) srcs.push(product.image);
    return srcs;
  }, [product.image, product.images]);

  const activeImage = thumbs[activeThumb] ?? product.image;

  const shopHref = toLocalePath('/products', currentLocale);
  const homeHref = toLocalePath('/', currentLocale);
  const contactHref = toLocalePath('/kontaktai', currentLocale);

  return (
    <div className="min-h-screen bg-[#E1E1E1]">
      {/* Breadcrumbs */}
      <div className="max-w-[1440px] mx-auto px-[16px] sm:px-[24px] lg:px-[40px] py-[10px] border-b border-[#bbbbbb]">
        <p className="font-['Outfit'] font-normal text-[12px] leading-[1.3] text-[#7c7c7c]">
          <Link href={homeHref} className="hover:text-[#161616]">
            {tBreadcrumbs('home')}
          </Link>
          {' / '}
          <Link href={shopHref} className="hover:text-[#161616]">
            {tBreadcrumbs('products')}
          </Link>
          {' / '}
          <span className="text-[#161616]">{localizedDisplayName}</span>
        </p>
      </div>

      {/* Product Section */}
      <main className="max-w-[1440px] mx-auto px-[16px] sm:px-[24px] lg:px-[40px] py-[16px] lg:py-[54px]">
        <div className="flex flex-col lg:flex-row gap-[24px] lg:gap-[36px]">
          {/* Left Column - Gallery */}
          <div className="flex gap-[16px] order-2 lg:order-1">
            {/* Thumbnails */}
            <div className="flex lg:flex-col gap-[12px] order-2 lg:order-1">
              {thumbs.map((thumb, index) => (
                <button
                  key={thumb}
                  onClick={() => setActiveThumb(index)}
                  className={`relative w-[60px] h-[60px] lg:w-[80px] lg:h-[80px] rounded-[4px] overflow-hidden shrink-0 ${
                    activeThumb === index ? 'ring-2 ring-[#161616]' : ''
                  }`}
                  aria-label={`Thumb ${index + 1}`}
                >
                  <Image src={thumb} alt={`${localizedDisplayName} view ${index + 1}`} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="relative flex-1 lg:flex-none lg:w-[328px] xl:w-[500px] 2xl:w-[790px] aspect-square lg:aspect-auto lg:h-[400px] xl:h-[500px] 2xl:h-[729px] bg-[#EAEAEA] rounded-[4px] overflow-hidden order-1 lg:order-2">
              <button
                type="button"
                onClick={() =>
                  setShow3D((v) => {
                    const next = !v;
                    trackEvent('toggle_product_3d_view', {
                      product_id: product.id,
                      enabled: next,
                    });
                    return next;
                  })
                }
                className="absolute z-10 top-[16px] right-[16px] h-[32px] px-[12px] rounded-[100px] border border-[#BBBBBB] bg-white/90 font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#161616]"
                aria-label={show3D ? t('toggleShowPhotoAria') : t('toggleShow3dAria')}
              >
                {show3D ? t('photo') : t('view3d')}
              </button>

              {show3D ? (
                <div className="absolute inset-0">
                  <Konfiguratorius3D
                    productId={product.id}
                    availableColors={colorOptions}
                    availableFinishes={profileOptions}
                    selectedColorId={selectedColor?.id}
                    selectedFinishId={selectedFinish?.id}
                    isLoading={loading3D}
                    mode="viewport"
                    className="h-full"
                    canvasClassName="h-full"
                  />
                </div>
              ) : (
                <Image
                  src={activeImage}
                  alt={localizedDisplayName}
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
              )}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="flex-1 flex flex-col gap-[24px] order-1 lg:order-2">
            {/* Title and Price */}
            <div className="flex flex-col gap-[8px]">
              <h1 className="font-['DM_Sans'] font-normal text-[28px] lg:text-[32px] leading-[1.1] tracking-[-1.28px] text-[#161616]">
                {localizedDisplayName}
              </h1>
              {attributeSummary ? (
                <p className="font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#7C7C7C]">
                  {attributeSummary}
                </p>
              ) : null}
              <p className="font-['DM_Sans'] font-normal text-[28px] lg:text-[32px] leading-[1.1] tracking-[-1.28px] text-[#161616]">
                {effectivePrice.toFixed(0)} €
              </p>
              {variantInventory ? (
                <p className="font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#7C7C7C]">
                  {variantInventory.loading
                    ? currentLocale === 'lt'
                      ? 'Tikrinamas sandėlis…'
                      : 'Checking stock…'
                    : variantInventory.foundInventory
                      ? currentLocale === 'lt'
                        ? `Sandėlyje: ${variantInventory.quantityAvailable}`
                        : `In stock: ${variantInventory.quantityAvailable}`
                      : currentLocale === 'lt'
                        ? 'Sandėlio informacijos nėra'
                        : 'No stock info'}
                </p>
              ) : null}
              {quoteError ? (
                <p className="font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#7C7C7C]">{quoteError}</p>
              ) : null}
            </div>

            {/* Description */}
            <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616] max-w-[434px]">
              {displayDescription || t('descriptionFallback')}
            </p>

            {/* Variants */}
            <div className="flex flex-col gap-[24px]">
              {/* Width */}
              <div className="flex flex-col gap-[8px]">
                <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#7c7c7c]">
                  Overall width (mm)
                </p>
                <div className="flex gap-[8px]">
                  {widthOptionsMm.map((width) => (
                    <button
                      key={width}
                      onClick={() => setSelectedWidthMm(width)}
                      className={`relative h-[48px] px-[16px] flex items-center justify-center font-['Outfit'] font-normal text-[14px] tracking-[0.42px] uppercase transition-colors ${
                        selectedWidthMm === width
                          ? 'bg-[#161616] text-white'
                          : 'border border-[#bbbbbb] text-[#161616] hover:border-[#161616]'
                      }`}
                      aria-pressed={selectedWidthMm === width}
                    >
                      {selectedWidthMm === width ? (
                        <span className="absolute top-[8px] right-[8px]">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d="M10 3.5L5 8.5L2 5.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      ) : null}
                      {width} mm
                    </button>
                  ))}
                </div>
              </div>

              {/* Length */}
              <div className="flex flex-col gap-[8px]">
                <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#7c7c7c]">
                  Length (mm)
                </p>
                <div className="flex gap-[8px]">
                  {lengthOptionsMm.map((length) => (
                    <button
                      key={length}
                      onClick={() => setSelectedLengthMm(length)}
                      className={`relative h-[48px] px-[16px] flex items-center justify-center font-['Outfit'] font-normal text-[14px] tracking-[0.42px] uppercase transition-colors ${
                        selectedLengthMm === length
                          ? 'bg-[#161616] text-white'
                          : 'border border-[#bbbbbb] text-[#161616] hover:border-[#161616]'
                      }`}
                      aria-pressed={selectedLengthMm === length}
                    >
                      {selectedLengthMm === length ? (
                        <span className="absolute top-[8px] right-[8px]">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d="M10 3.5L5 8.5L2 5.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      ) : null}
                      {length} mm
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              {colorOptions.length > 0 && (
                <div className="flex flex-col gap-[8px]">
                  <div className="flex gap-[4px] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase">
                    <span className="text-[#7C7C7C]">Color:</span>
                    <span className="text-[#161616]">{selectedColor?.name || t('selectColorPlaceholder')}</span>
                  </div>
                  <div className="flex gap-[8px] flex-wrap">
                    {colorOptions.map((color) => {
                      const swatchSrc = resolveColorSwatchSrc(color);
                      const isActive = selectedColor?.id === color.id;
                      const fallbackSrc = typeof color.image === 'string' ? color.image : null;
                      const canUseNextImage = (src: string) => src.startsWith('/');

                      return (
                        <button
                          key={color.id}
                          onClick={() => setSelectedColor(color)}
                          className={`relative w-[32px] h-[32px] rounded-full overflow-hidden border border-[#BBBBBB] ${
                            isActive ? 'ring-2 ring-[#161616] ring-offset-2' : ''
                          }`}
                          title={color.name}
                          aria-pressed={isActive}
                        >
                          {swatchSrc ? (
                            <Image src={swatchSrc} alt={color.name} fill className="object-cover" sizes="32px" />
                          ) : fallbackSrc ? (
                            canUseNextImage(fallbackSrc) ? (
                              <Image src={fallbackSrc} alt={color.name} fill className="object-cover" sizes="18px" />
                            ) : (
                              <img src={fallbackSrc} alt={color.name} className="w-full h-full object-cover" />
                            )
                          ) : (
                            <div style={{ backgroundColor: color.hex }} className="w-full h-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Profile */}
              {profileOptions.length > 0 && (
                <div className="flex flex-col gap-[8px]">
                  <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#7c7c7c]">
                    Profile
                  </p>
                  <div className="flex gap-[8px] flex-wrap">
                    {profileOptions.map((finish, index) => {
                      const active = selectedFinish?.id === finish.id;
                      const profileIconSrc = resolveProfileIconSrc(finish) ?? PROFILE_ICON_FALLBACK_BY_INDEX[index] ?? null;
                      const fallbackSrc = typeof finish.image === 'string' ? finish.image : null;
                      const canUseNextImage = (src: string) => src.startsWith('/');

                      return (
                        <button
                          key={finish.id}
                          onClick={() => setSelectedFinish(finish)}
                          className={`relative h-[48px] w-[83px] flex items-center justify-center transition-colors ${
                            active ? 'bg-[#161616]' : 'border border-[#bbbbbb] hover:border-[#161616]'
                          }`}
                          title={finish.name}
                          aria-pressed={active}
                        >
                          {active ? (
                            <span className="absolute top-[8px] right-[8px]">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                                <path d="M10 3.5L5 8.5L2 5.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </span>
                          ) : null}
                          {profileIconSrc ? (
                            <Image src={profileIconSrc} alt={finish.name} width={70} height={12} className={active ? 'invert' : ''} />
                          ) : fallbackSrc ? (
                            canUseNextImage(fallbackSrc) ? (
                              <Image src={fallbackSrc} alt={finish.name} width={70} height={12} className={active ? 'invert' : ''} />
                            ) : (
                              <img src={fallbackSrc} alt={finish.name} className={`w-[70px] h-[12px] object-contain ${active ? 'invert' : ''}`} />
                            )
                          ) : (
                            <svg width="70" height="12" viewBox="0 0 70 12" fill="none" className={active ? 'stroke-white' : 'stroke-[#161616]'}>
                              <path d="M0 11L35 0V11H70" strokeWidth="1.5" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex flex-col gap-[8px]">
                <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#7c7c7c]">
                  Quantity m2
                </p>
                <div className="h-[48px] px-[16px] border border-[#bbbbbb] flex items-center max-w-[438px]">
                  <input
                    type="number"
                    inputMode="decimal"
                    value={Number.isFinite(targetAreaM2) ? targetAreaM2 : ''}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      setTargetAreaM2(Number.isFinite(next) ? next : 0);
                    }}
                    className="w-full font-['Outfit'] font-normal text-[14px] tracking-[0.42px] uppercase text-[#161616] bg-transparent outline-none"
                    min={0}
                    step={0.1}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-[8px] items-center max-w-[434px]">
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#535353] text-center">
                Haven't found what you're looking for?{' '}
                <Link href={contactHref} className="text-[#161616] underline">
                  Contact us
                </Link>
              </p>
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full bg-[#161616] text-white h-[48px] rounded-[100px] px-[40px] py-[10px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase flex items-center justify-center hover:bg-[#2d2d2d] transition-colors"
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

