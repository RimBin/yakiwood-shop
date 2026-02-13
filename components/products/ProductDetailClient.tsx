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
import { Accordion } from '@/components/ui';
import { useCartStore } from '@/lib/cart/store';
import { trackEvent, trackProductView } from '@/lib/analytics';
import Konfiguratorius3D from '@/components/Konfiguratorius3D';

type InputMode = 'area' | 'boards';
import type { UsageType } from '@/lib/pricing/configuration';
import ModalOverlay from '@/components/modals/ModalOverlay';
import InView from '@/components/InView';

interface ProductDetailClientProps {
  product: Product;
  relatedProducts?: Product[];
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

const PROFILE_LABELS: Record<string, { lt: string; en: string }> = {
  'half-taper': { lt: 'Pusė špunto', en: 'Half Taper' },
  'half-taper-45': { lt: 'Pusė špunto 45°', en: 'Half Taper 45°' },
  rectangle: { lt: 'Stačiakampis', en: 'Rectangle' },
  rhombus: { lt: 'Rombas', en: 'Rhombus' },
};

function normalizeProfileKey(value: string): string {
  return normalizeColorKey(value);
}

function normalizeProfileToken(value: string): string {
  const token = normalizeProfileKey(value);
  if (!token) return '';
  const isHalf = token.includes('half') || token.includes('taper') || token.includes('pus') || token.includes('spunto');
  if (isHalf && token.includes('45')) return 'half-taper-45';
  if (isHalf) return 'half-taper';
  if (token.includes('rhomb') || token.includes('romb')) return 'rhombus';
  if (token.includes('rectangle') || token.includes('staciakamp')) return 'rectangle';
  return token;
}

function localizeProfileLabel(value: string, locale: 'lt' | 'en'): string {
  const normalized = normalizeProfileKey(value);
  if (!normalized) return value;
  const mapped = PROFILE_LABELS[normalized];
  if (mapped) return locale === 'lt' ? mapped.lt : mapped.en;
  return value;
}

type StockDerivedOptions = {
  colors: ProductColorVariant[];
  profiles: ProductProfileVariant[];
  widths: number[];
  lengths: number[];
};

type StockMatrixEntry = {
  colorToken: string;
  profileToken: string;
  widthMm: number;
  lengthMm: number;
};

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

export default function ProductDetailClient({ product, relatedProducts = [] }: ProductDetailClientProps) {
  const t = useTranslations('productPage');
  const tProducts = useTranslations('productsPage');
  const tBreadcrumbs = useTranslations('breadcrumbs');
  const tContact = useTranslations('contact');
  const locale = useLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsKey = searchParams.toString();
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const [stockDerivedOptions, setStockDerivedOptions] = useState<StockDerivedOptions | null>(null);
  const [stockMatrix, setStockMatrix] = useState<StockMatrixEntry[]>([]);
  const [isNeedAssistanceOpen, setIsNeedAssistanceOpen] = useState(false);
  const [needAssistanceSubmitted, setNeedAssistanceSubmitted] = useState(false);
  const [needAssistanceSubmitting, setNeedAssistanceSubmitting] = useState(false);
  const [needAssistanceError, setNeedAssistanceError] = useState<string | null>(null);
  const [needAssistanceConsent, setNeedAssistanceConsent] = useState(false);
  const [needAssistanceForm, setNeedAssistanceForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
  });
  const needAssistanceStartedAtRef = useRef<number>(Date.now());

  const accordionItems = useMemo(
    () =>
      currentLocale === 'lt'
        ? [
            {
              title: 'Produkto priežiūra',
              content:
                'Kiekviena situacija yra unikali, todėl jei turite klausimų dėl priežiūros, susisiekite – įvertinsime jūsų poreikius ir pasiūlysime tinkamiausią sprendimą.',
            },
            {
              title: 'Spalvų išlyga',
              content:
                'Natūrali mediena gali nežymiai skirtis atspalviu ir raštu. Galutinis vaizdas priklauso nuo apdailos ir aplinkos sąlygų.',
            },
            {
              title: 'Pristatymas ir grąžinimas',
              content:
                'Pristatymo terminai ir grąžinimo sąlygos derinamos individualiai. Susisiekite, kad suderintume detales.',
            },
            {
              title: 'Apmokėjimas',
              content:
                'Galimi bankinis pavedimas ir kiti mokėjimo būdai. Dėl detalių susisiekite su mumis.',
            },
          ]
        : [
            {
              title: 'Product maintenance',
              content:
                'Every situation is unique, so if you have any questions about maintenance, we encourage you to contact us so that we can assess your needs and offer the most appropriate solution.',
            },
            {
              title: 'Color disclaimer',
              content:
                'Natural wood may vary slightly in tone and grain. The final appearance depends on finish and environmental conditions.',
            },
            {
              title: 'Shipping & return',
              content:
                'Shipping timelines and return terms are arranged individually. Contact us to confirm the details.',
            },
            {
              title: 'Payment',
              content: 'Bank transfer and other payment options are available. Contact us for details.',
            },
          ],
    [currentLocale]
  );

  const widthOptionsMm = useMemo(() => {
    const derived = stockDerivedOptions?.widths ?? [];
    return derived.length > 0 ? derived : [95, 120, 145];
  }, [stockDerivedOptions?.widths]);

  const lengthOptionsMm = useMemo(() => {
    const derived = stockDerivedOptions?.lengths ?? [];
    return derived.length > 0 ? derived : [3000, 3300, 3600];
  }, [stockDerivedOptions?.lengths]);

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

  const usageLabels = useMemo<Record<string, string>>(
    () => ({
      facade: tProducts('usageFilters.facade'),
      terrace: tProducts('usageFilters.terrace'),
    }),
    [tProducts]
  );

  const woodLabels = useMemo<Record<string, string>>(
    () => ({
      spruce: currentLocale === 'lt' ? 'Eglė' : 'Spruce',
      larch: currentLocale === 'lt' ? 'Maumedis' : 'Larch',
    }),
    [currentLocale]
  );

  const formatCardPrice = useMemo(
    () => (price: number) => {
      const rounded = price.toFixed(0);
      return currentLocale === 'lt' ? `${rounded} €/m²` : `€${rounded}/m²`;
    },
    [currentLocale]
  );

  const getUnitPrice = useMemo(
    () => (pricePerM2: number, size: { widthMm: number; lengthMm: number } | null) => {
      if (!size) return null;
      const areaM2 = (size.widthMm / 1000) * (size.lengthMm / 1000);
      if (!Number.isFinite(areaM2) || areaM2 <= 0) return null;
      return pricePerM2 * areaM2;
    },
    []
  );

  const formatMaybeLabel = useMemo(
    () => (value: string | undefined) => {
      if (!value) return undefined;
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    },
    []
  );

  const formatRelatedDisplayName = useMemo(
    () => (item: Product) => {
      const parsed = item.slug.includes('--') ? parseStockItemSlug(item.slug) : null;
      const colorName = item.colors?.[0]?.name ?? parsed?.color ?? '';
      const colorLabel = colorName ? localizeColorLabel(colorName, 'en') : '';

      const woodKey = typeof item.woodType === 'string' ? item.woodType.trim().toLowerCase() : '';
      const woodLabel =
        woodKey === 'larch'
          ? currentLocale === 'lt'
            ? 'Maumedis'
            : 'Larch'
          : woodKey === 'spruce'
            ? currentLocale === 'lt'
              ? 'Eglė'
              : 'Spruce'
            : item.woodType ?? '';

      const title = [colorLabel, woodLabel].filter(Boolean).join(' ');
      return title || (currentLocale === 'en' && item.nameEn ? item.nameEn : item.name);
    },
    [currentLocale]
  );

  const formatRelatedAttributes = useMemo(
    () => (item: Product) => {
      const parsed = item.slug.includes('--') ? parseStockItemSlug(item.slug) : null;
      const profileLabel = item.profiles?.[0]
        ? localizeProfileLabel(item.profiles[0].name ?? item.profiles[0].code ?? '', currentLocale)
        : parsed?.profile
          ? localizeProfileLabel(parsed.profile, currentLocale)
          : '';
      const profileSuffix = currentLocale === 'lt' ? 'Profilis' : 'Profile';
      const sizeLabel = parsed?.size ? formatSizeLabel(parsed.size) : '';
      const parts = [profileLabel ? `${profileLabel} ${profileSuffix}` : '', sizeLabel].filter(Boolean);
      return parts.length > 0 ? parts.join(' · ') : '';
    },
    [currentLocale]
  );

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
  const [inputMode, setInputMode] = useState<InputMode>('area');
  const [quantityBoards, setQuantityBoards] = useState<number>(500);

  const selectedSizeLabel = useMemo(() => {
    return `${selectedWidthMm}×${selectedLengthMm} mm`;
  }, [selectedWidthMm, selectedLengthMm]);

  const localizedDisplayName = useMemo(() => {
    return baseDisplayName;
  }, [baseDisplayName]);

  const attributeSummary = useMemo(() => {
    const parsed = product.slug.includes('--') ? parseStockItemSlug(product.slug) : null;
    const colorName = selectedColor?.name || (parsed?.color ? localizeColorLabel(parsed.color, currentLocale) : '');
    const profileSource = selectedFinish?.name || selectedFinish?.code || parsed?.profile || '';
    const profileName = profileSource
      ? localizeProfileLabel(profileSource, currentLocale)
      : '';
    const sizeLabel = selectedSizeLabel || (parsed?.size ? formatSizeLabel(parsed.size) : '');
    return [profileName, colorName, sizeLabel].filter(Boolean).join(' · ');
  }, [product.slug, selectedColor?.name, selectedFinish?.name, selectedFinish?.code, selectedSizeLabel, currentLocale]);

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
    const base = (product.colors || []).map((color, index) => ({
      ...color,
      id: color.id || `${product.id}-color-${index}`,
      name: color.name ? localizeColorLabel(color.name, currentLocale) : color.name,
      hex: color.hex || '#444444',
      priceModifier: color.priceModifier ?? 0,
    }));

    const derived = stockDerivedOptions?.colors ?? [];
    if (base.length === 0) return derived;
    if (derived.length === 0) return base;

    const map = new Map<string, ProductColorVariant>();
    for (const color of base) {
      const key = normalizeColorKey(color.name || color.id || '');
      if (!key) continue;
      map.set(key, color);
    }
    for (const color of derived) {
      const key = normalizeColorKey(color.name || color.id || '');
      if (!key || map.has(key)) continue;
      map.set(key, color);
    }
    return Array.from(map.values());
  }, [product.colors, product.id, currentLocale, stockDerivedOptions?.colors]);

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

      const localizedName = profile.name
        ? localizeProfileLabel(profile.name, currentLocale)
        : profile.name;

      return {
        ...profile,
        name: localizedName,
        id: profile.id || `${product.id}-profile-${index}`,
        description,
        priceModifier: profile.priceModifier ?? 0,
      };
    });

    const derived = stockDerivedOptions?.profiles ?? [];

    if (mapped.length > 0) {
      if (derived.length === 0) return mapped;
      const map = new Map<string, ProductProfileVariant>();
      for (const profile of mapped) {
        const key = normalizeProfileKey([profile.code, profile.name].filter(Boolean).join(' '));
        if (!key) continue;
        map.set(key, profile);
      }
      for (const profile of derived) {
        const key = normalizeProfileKey([profile.code, profile.name].filter(Boolean).join(' '));
        if (!key || map.has(key)) continue;
        map.set(key, profile);
      }
      return Array.from(map.values());
    }

    if (derived.length > 0) return derived;
    return FALLBACK_PROFILE_OPTIONS.map((fallback) => ({ ...(fallback as unknown as ProductProfileVariant) }));
  }, [product.id, product.profiles, currentLocale, stockDerivedOptions?.profiles]);

  const urlColorSelection = useMemo(() => {
    const urlColorId = searchParams.get('c');
    const urlColorToken = searchParams.get('ct');
    if (urlColorId) return colorOptions.find((c) => c.id === urlColorId) ?? null;
    if (urlColorToken) {
      const token = normalizeColorKey(urlColorToken);
      return (
        colorOptions.find((c) => normalizeColorKey(c.name || '') === token) ??
        colorOptions.find((c) => normalizeColorKey(c.name || '').includes(token)) ??
        null
      );
    }
    return null;
  }, [searchParamsKey, searchParams, colorOptions]);

  const urlFinishSelection = useMemo(() => {
    const urlFinishId = searchParams.get('f');
    const urlFinishToken = searchParams.get('ft');
    if (urlFinishId) return profileOptions.find((p) => p.id === urlFinishId) ?? null;
    if (urlFinishToken) {
      const token = normalizeProfileToken(urlFinishToken);
      return (
        profileOptions.find((p) => {
          const hay = normalizeProfileToken([p.code, p.name].filter(Boolean).join(' '));
          return hay === token || hay.includes(token);
        }) ?? null
      );
    }
    return null;
  }, [searchParamsKey, searchParams, profileOptions]);

  const effectiveSelectedColor = selectedColor ?? urlColorSelection ?? null;
  const effectiveSelectedFinish = selectedFinish ?? urlFinishSelection ?? null;

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

  const getColorToken = (color?: ProductColorVariant | null) => {
    if (!color) return '';
    if (typeof color.id === 'string' && color.id.startsWith('stock-color:')) {
      return color.id.replace('stock-color:', '');
    }
    return color.name ? normalizeColorKey(String(color.name)) : '';
  };

  const getProfileToken = (finish?: ProductProfileVariant | null) => {
    if (!finish) return '';
    if (typeof finish.id === 'string' && finish.id.startsWith('stock-profile:')) {
      return finish.id.replace('stock-profile:', '');
    }
    const raw = finish.code || finish.name || '';
    return raw ? normalizeProfileToken(raw) : '';
  };

  useEffect(() => {
    if (!baseSlugForSelection) return;

    let isMounted = true;
    const controller = new AbortController();

    const run = async () => {
      try {
        const res = await fetch('/api/products?mode=stock-items', {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        });

        if (!res.ok) return;
        const json = await res.json();
        if (!Array.isArray(json)) return;

        const baseKey = normalizeColorKey(baseSlugForSelection);
        const colors = new Map<string, ProductColorVariant>();
        const profiles = new Map<string, ProductProfileVariant>();
        const widths = new Set<number>();
        const lengths = new Set<number>();
        const matrix: StockMatrixEntry[] = [];

        for (const item of json) {
          const slug = typeof item?.slug === 'string' ? item.slug : '';
          if (!slug.includes('--')) continue;
          const parsed = parseStockItemSlug(slug);
          if (!parsed) continue;
          if (normalizeColorKey(parsed.baseSlug) !== baseKey) continue;

          const itemImage =
            typeof item?.image_url === 'string'
              ? item.image_url
              : typeof item?.image === 'string'
                ? item.image
                : null;

          const colorToken = normalizeColorKey(parsed.color);
          if (colorToken && !colors.has(colorToken)) {
            colors.set(colorToken, {
              id: `stock-color:${colorToken}`,
              name: localizeColorLabel(parsed.color, currentLocale),
              hex: undefined,
              image: itemImage ?? undefined,
              priceModifier: 0,
            });
          }

          const profileToken = normalizeProfileToken(parsed.profile);
          if (profileToken && !profiles.has(profileToken)) {
            profiles.set(profileToken, {
              id: `stock-profile:${profileToken}`,
              name: localizeProfileLabel(parsed.profile.replace(/[-_]+/g, ' '), currentLocale),
              code: parsed.profile,
              priceModifier: 0,
            });
          }

          const size = parseSizeToken(parsed.size);
          if (size?.widthMm) widths.add(size.widthMm);
          if (size?.lengthMm) lengths.add(size.lengthMm);

          if (colorToken && profileToken && size?.widthMm && size?.lengthMm) {
            matrix.push({
              colorToken,
              profileToken,
              widthMm: size.widthMm,
              lengthMm: size.lengthMm,
            });
          }
        }

        const derived: StockDerivedOptions = {
          colors: Array.from(colors.values()),
          profiles: Array.from(profiles.values()),
          widths: Array.from(widths.values()).sort((a, b) => a - b),
          lengths: Array.from(lengths.values()).sort((a, b) => a - b),
        };

        if (isMounted) {
          setStockDerivedOptions(derived);
          setStockMatrix(matrix);
        }
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
      }
    };

    run();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [baseSlugForSelection, currentLocale]);

  const selectedColorToken = useMemo(() => {
    return getColorToken(effectiveSelectedColor);
  }, [effectiveSelectedColor?.id, effectiveSelectedColor?.name]);

  const selectedProfileToken = useMemo(() => {
    return getProfileToken(effectiveSelectedFinish);
  }, [effectiveSelectedFinish?.id, effectiveSelectedFinish?.code, effectiveSelectedFinish?.name]);

  const hasStockMatrix = stockMatrix.length > 0;

  const isSelectionAvailable = useMemo(() => {
    if (!hasStockMatrix) return true;
    if (!selectedColorToken || !selectedProfileToken) return true;
    return stockMatrix.some(
      (entry) =>
        entry.colorToken === selectedColorToken &&
        entry.profileToken === selectedProfileToken &&
        entry.widthMm === selectedWidthMm &&
        entry.lengthMm === selectedLengthMm
    );
  }, [hasStockMatrix, stockMatrix, selectedColorToken, selectedProfileToken, selectedWidthMm, selectedLengthMm]);

  useEffect(() => {
    if (!product?.id) return;
    if (selectionInitializedForProductIdRef.current === product.id) return;

    // Initialize once per product (including stock-item presets).
    const urlColorId = searchParams.get('c');
    const urlColorToken = searchParams.get('ct');
    const urlFinishId = searchParams.get('f');
    const urlFinishToken = searchParams.get('ft');
    const urlWidth = Number(searchParams.get('w'));
    const urlLength = Number(searchParams.get('l'));
    const urlThickness = Number(searchParams.get('t'));

    const presetColorKey = stockPreset?.colorToken ? normalizeColorKey(stockPreset.colorToken) : null;
    const presetProfileKey = stockPreset?.profileToken ? normalizeProfileToken(stockPreset.profileToken) : null;

    const hasColorParam = Boolean(urlColorId || urlColorToken || presetColorKey);
    const hasFinishParam = Boolean(urlFinishId || urlFinishToken || presetProfileKey);

    let initialColor: ProductColorVariant | null = null;
    if (urlColorId && colorOptions.length) {
      initialColor = colorOptions.find((c) => c.id === urlColorId) ?? null;
    }
    if (!initialColor && urlColorToken && colorOptions.length) {
      const token = normalizeColorKey(urlColorToken);
      initialColor =
        colorOptions.find((c) => normalizeColorKey(c.name || '') === token) ??
        colorOptions.find((c) => normalizeColorKey(c.name || '').includes(token)) ??
        null;
    }
    if (!initialColor && presetColorKey && colorOptions.length) {
      initialColor =
        colorOptions.find((c) => normalizeColorKey(c.name || '') === presetColorKey) ??
        colorOptions.find((c) => normalizeColorKey(c.name || '').includes(presetColorKey)) ??
        null;
    }

    let initialFinish: ProductProfileVariant | null = null;
    if (urlFinishId && profileOptions.length) {
      initialFinish = profileOptions.find((p) => p.id === urlFinishId) ?? null;
    }
    if (!initialFinish && urlFinishToken && profileOptions.length) {
      const token = normalizeProfileToken(urlFinishToken);
      initialFinish =
        profileOptions.find((p) => {
          const hay = normalizeProfileToken([p.code, p.name].filter(Boolean).join(' '));
          return hay === token;
        }) ?? null;
      if (!initialFinish) {
        initialFinish =
          profileOptions.find((p) => {
            const hay = normalizeProfileToken([p.code, p.name].filter(Boolean).join(' '));
            return hay.includes(token);
          }) ?? null;
      }
    }
    if (!initialFinish && presetProfileKey && profileOptions.length) {
      initialFinish =
        profileOptions.find((p) => {
          const hay = normalizeProfileToken([p.code, p.name].filter(Boolean).join(' '));
          return hay === presetProfileKey;
        }) ?? null;
      if (!initialFinish) {
        initialFinish =
          profileOptions.find((p) => {
            const hay = normalizeProfileToken([p.code, p.name].filter(Boolean).join(' '));
            return hay.includes(presetProfileKey);
          }) ?? null;
      }
    }

    if (initialColor) {
      setSelectedColor(initialColor);
    } else if (!hasColorParam) {
      setSelectedColor(colorOptions[0] ?? null);
    }

    if (initialFinish) {
      setSelectedFinish(initialFinish);
    } else if (!hasFinishParam) {
      setSelectedFinish(profileOptions[0] ?? null);
    }

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

    const pendingColor = hasColorParam && !initialColor;
    const pendingFinish = hasFinishParam && !initialFinish;
    if (!pendingColor && !pendingFinish) {
      selectionInitializedForProductIdRef.current = product.id;
    }
  }, [product?.id, stockPreset, colorOptions, profileOptions, widthOptionsMm, lengthOptionsMm, thicknessOptions, searchParamsKey, searchParams]);

  useEffect(() => {
    if (!product?.id) return;
    if (selectionInitializedForProductIdRef.current !== product.id) return;

    const urlColorId = searchParams.get('c');
    const urlColorToken = searchParams.get('ct');
    const urlFinishId = searchParams.get('f');
    const urlFinishToken = searchParams.get('ft');
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
    if (urlColorToken) {
      const token = normalizeColorKey(urlColorToken);
      const match =
        colorOptions.find((c) => normalizeColorKey(c.name || '') === token) ??
        colorOptions.find((c) => normalizeColorKey(c.name || '').includes(token)) ??
        null;
      if (match && selectedColor?.id !== match.id) {
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
    if (urlFinishToken) {
      const token = normalizeProfileToken(urlFinishToken);
      const match =
        profileOptions.find((p) => {
          const hay = normalizeProfileToken([p.code, p.name].filter(Boolean).join(' '));
          return hay === token;
        }) ??
        profileOptions.find((p) => {
          const hay = normalizeProfileToken([p.code, p.name].filter(Boolean).join(' '));
          return hay.includes(token);
        }) ??
        null;
      if (match && selectedFinish?.id !== match.id) {
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
  }, [product?.id, searchParamsKey, colorOptions, profileOptions, widthOptionsMm, lengthOptionsMm, thicknessOptions, searchParams]);

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
      ct: selectedColor?.name ? normalizeColorKey(String(selectedColor.name)) : null,
      ft: selectedFinish ? normalizeProfileToken(selectedFinish.code || selectedFinish.name || '') : null,
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
    if (!product?.id) return;
    if (selectionInitializedForProductIdRef.current !== product.id) return;
    // Keep a valid selection if the options list changes.
    if (!selectedColor) {
      setSelectedColor(colorOptions[0] ?? null);
      return;
    }
    if (!colorOptions.some((c) => c.id === selectedColor.id)) {
      setSelectedColor(colorOptions[0] ?? null);
    }
  }, [product?.id, colorOptions, selectedColor]);

  useEffect(() => {
    if (!product?.id) return;
    if (selectionInitializedForProductIdRef.current !== product.id) return;
    if (!selectedFinish) {
      setSelectedFinish(profileOptions[0] ?? null);
      return;
    }
    if (!profileOptions.some((p) => p.id === selectedFinish.id)) {
      setSelectedFinish(profileOptions[0] ?? null);
    }
  }, [product?.id, profileOptions, selectedFinish]);

  useEffect(() => {
    if (!product?.id) return;
    if (selectionInitializedForProductIdRef.current !== product.id) return;
    if (widthOptionsMm.length === 0) return;
    if (!widthOptionsMm.includes(selectedWidthMm)) {
      setSelectedWidthMm(widthOptionsMm[0] ?? selectedWidthMm);
    }
  }, [product?.id, selectedWidthMm, widthOptionsMm]);

  useEffect(() => {
    if (!product?.id) return;
    if (selectionInitializedForProductIdRef.current !== product.id) return;
    if (lengthOptionsMm.length === 0) return;
    if (!lengthOptionsMm.includes(selectedLengthMm)) {
      setSelectedLengthMm(lengthOptionsMm[0] ?? selectedLengthMm);
    }
  }, [product?.id, selectedLengthMm, lengthOptionsMm]);

  useEffect(() => {
    const allowed = new Set(thicknessOptions.map((x) => x.valueMm));
    if (!allowed.has(selectedThicknessMm)) {
      setSelectedThicknessMm(thicknessOptions[0]?.valueMm ?? 20);
    }
  }, [selectedThicknessMm, thicknessOptions]);

  const selectedThicknessLabel = useMemo(() => {
    return thicknessOptions.find((opt) => opt.valueMm === selectedThicknessMm)?.label ?? `${selectedThicknessMm} mm`;
  }, [selectedThicknessMm, thicknessOptions]);

  const selectionPrice = useMemo(() => {
    const colorMod = selectedColor?.priceModifier ?? 0;
    const finishMod = selectedFinish?.priceModifier ?? 0;
    return effectivePrice + colorMod + finishMod;
  }, [effectivePrice, selectedColor?.priceModifier, selectedFinish?.priceModifier]);

  const unitAreaM2Raw = useMemo(() => {
    const widthM = selectedWidthMm / 1000;
    const lengthM = selectedLengthMm / 1000;
    const area = widthM * lengthM;
    return Number.isFinite(area) && area > 0 ? area : null;
  }, [selectedWidthMm, selectedLengthMm]);

  const formatUnitPrice = (value: number) => {
    const rounded = Math.ceil(value * 100) / 100;
    const formatted = rounded.toFixed(2);
    return currentLocale === 'lt' ? `${formatted} €/vnt` : `€${formatted}/pc`;
  };

  const unitPricePerBoardDisplay = useMemo(() => {
    const fromQuote = quotedPricing?.unitPricePerBoard;
    if (typeof fromQuote === 'number' && Number.isFinite(fromQuote) && fromQuote > 0) return fromQuote;
    if (typeof unitAreaM2Raw === 'number' && Number.isFinite(unitAreaM2Raw) && unitAreaM2Raw > 0) {
      const fallback = selectionPrice * unitAreaM2Raw;
      return Number.isFinite(fallback) && fallback > 0 ? fallback : null;
    }
    return null;
  }, [quotedPricing?.unitPricePerBoard, selectionPrice, unitAreaM2Raw]);

  const handleAddToCart = () => {
    if (!isSelectionAvailable) return;
    const unitPricePerBoard = quotedPricing?.unitPricePerBoard;
    const unitPricePerM2 = quotedPricing?.unitPricePerM2;
    const unitAreaM2 = quotedPricing?.unitAreaM2;
    const totalAreaM2 = quotedPricing?.totalAreaM2;
    const quotedQuantityBoards = quotedPricing?.quantityBoards;
    const lineTotal = quotedPricing?.lineTotal;

    const resolvedTargetAreaM2 =
      inputMode === 'area' && typeof targetAreaM2 === 'number' && Number.isFinite(targetAreaM2) && targetAreaM2 > 0
        ? targetAreaM2
        : undefined;

    const fallbackUnitAreaM2 =
      typeof unitAreaM2 === 'number' && Number.isFinite(unitAreaM2) && unitAreaM2 > 0 ? unitAreaM2 : unitAreaM2Raw;

    const fallbackUnitPricePerM2 =
      typeof unitPricePerM2 === 'number' && Number.isFinite(unitPricePerM2) && unitPricePerM2 > 0
        ? unitPricePerM2
        : selectionPrice;

    const fallbackUnitPricePerBoard =
      typeof fallbackUnitAreaM2 === 'number' && Number.isFinite(fallbackUnitAreaM2) && fallbackUnitAreaM2 > 0
        ? fallbackUnitPricePerM2 * fallbackUnitAreaM2
        : null;

    const resolvedQuantityBoards =
      typeof quotedQuantityBoards === 'number' && Number.isFinite(quotedQuantityBoards) && quotedQuantityBoards > 0
        ? Math.max(1, Math.round(quotedQuantityBoards))
        : inputMode === 'boards'
          ? Math.max(1, Math.round(Number(quantityBoards) || 1))
          : 1;

    const basePriceForCart =
      inputMode === 'area'
        ? fallbackUnitPricePerM2
        : typeof unitPricePerBoard === 'number' && Number.isFinite(unitPricePerBoard) && unitPricePerBoard > 0
          ? unitPricePerBoard
          : typeof fallbackUnitPricePerBoard === 'number' && Number.isFinite(fallbackUnitPricePerBoard)
            ? fallbackUnitPricePerBoard
            : selectionPrice;

    const fallbackTotalAreaM2 =
      inputMode === 'area'
        ? typeof resolvedTargetAreaM2 === 'number'
          ? resolvedTargetAreaM2
          : 0
        : typeof fallbackUnitAreaM2 === 'number' && Number.isFinite(fallbackUnitAreaM2)
          ? fallbackUnitAreaM2 * resolvedQuantityBoards
          : 0;

    const fallbackLineTotal =
      inputMode === 'area'
        ? fallbackUnitPricePerM2 * (resolvedTargetAreaM2 ?? 0)
        : typeof fallbackUnitPricePerBoard === 'number' && Number.isFinite(fallbackUnitPricePerBoard)
          ? fallbackUnitPricePerBoard * resolvedQuantityBoards
          : selectionPrice * resolvedQuantityBoards;

    const cartImage =
      typeof activeImage === 'string' && activeImage.trim().length > 0
        ? activeImage
        : typeof product.image === 'string'
          ? product.image
          : undefined;

    addItem({
      id: product.id,
      name: localizedDisplayName,
      slug: currentLocale === 'en' ? (product.slugEn ?? product.slug) : product.slug,
      image: cartImage,
      basePrice: basePriceForCart,
      quantity: inputMode === 'area' && resolvedTargetAreaM2 ? resolvedTargetAreaM2 : resolvedQuantityBoards,
      color: selectedColor?.name,
      finish: selectedFinish?.name,
      configuration: {
        usageType: usageTypeForQuote,
        colorVariantId: selectedColor?.id,
        profileVariantId: selectedFinish?.id,
        thicknessMm: selectedThicknessMm,
        widthMm: selectedWidthMm,
        lengthMm: selectedLengthMm,
      },
      inputMode,
      targetAreaM2:
        inputMode === 'area' ? resolvedTargetAreaM2 : undefined,
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
          : typeof fallbackUnitAreaM2 === 'number' &&
              Number.isFinite(fallbackUnitAreaM2) &&
              fallbackUnitAreaM2 > 0
            ? {
                unitAreaM2: fallbackUnitAreaM2,
                totalAreaM2: fallbackTotalAreaM2,
                pricePerM2Used: fallbackUnitPricePerM2,
                unitPrice: typeof fallbackUnitPricePerBoard === 'number' && Number.isFinite(fallbackUnitPricePerBoard)
                  ? fallbackUnitPricePerBoard
                  : fallbackUnitPricePerM2 * fallbackUnitAreaM2,
                lineTotal: fallbackLineTotal,
              }
            : undefined,
    });
  };

  useEffect(() => {
    const widthMm = selectedWidthMm;
    const lengthMm = selectedLengthMm;

    const safeTargetAreaM2 =
      typeof targetAreaM2 === 'number' && Number.isFinite(targetAreaM2) && targetAreaM2 > 0 ? targetAreaM2 : 0;
    const safeQuantityBoards =
      typeof quantityBoards === 'number' && Number.isFinite(quantityBoards) && quantityBoards > 0
        ? Math.max(1, Math.round(quantityBoards))
        : 0;

    if (!product?.id) return;
    if (inputMode === 'area' && !safeTargetAreaM2) {
      setQuotedPricing(null);
      setQuoteError(null);
      return;
    }

    if (inputMode === 'boards' && !safeQuantityBoards) {
      setQuotedPricing(null);
      setQuoteError(null);
      return;
    }

    const requestedAreaFromBoards =
      inputMode === 'boards' && typeof unitAreaM2Raw === 'number' && Number.isFinite(unitAreaM2Raw) && unitAreaM2Raw > 0
        ? unitAreaM2Raw * safeQuantityBoards
        : 0;

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
            inputMode,
            quantityBoards: inputMode === 'boards' ? safeQuantityBoards : undefined,
            targetAreaM2: inputMode === 'area' ? safeTargetAreaM2 : undefined,
            cartTotalAreaM2:
              inputMode === 'area'
                ? cartTotalAreaM2 + safeTargetAreaM2
                : requestedAreaFromBoards > 0
                  ? cartTotalAreaM2 + requestedAreaFromBoards
                  : cartTotalAreaM2,
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
  }, [product?.id, usageTypeForQuote, selectedFinish?.id, selectedColor?.id, selectedThicknessMm, selectedWidthMm, selectedLengthMm, targetAreaM2, quantityBoards, inputMode, cartTotalAreaM2, currentLocale, unitAreaM2Raw]);

  const thumbs = useMemo(() => {
    const srcs = [product.images?.[0], product.images?.[1], product.images?.[2]].filter(Boolean) as string[];
    if (srcs.length === 0) srcs.push(product.image);
    return srcs;
  }, [product.image, product.images]);

  const urlImageOverride = searchParams.get('img');
  const colorPreviewImage =
    typeof effectiveSelectedColor?.image === 'string' ? effectiveSelectedColor.image : null;
  const activeImage = colorPreviewImage || urlImageOverride || thumbs[activeThumb] || product.image;

  const shopHref = toLocalePath('/products', currentLocale);
  const homeHref = toLocalePath('/', currentLocale);
  const needAssistanceLabel = currentLocale === 'lt' ? 'Reikia pagalbos?' : 'Need assistance?';
  const needAssistanceLead =
    currentLocale === 'lt' ? 'Nerandate to, ko ieškote?' : "Haven't found what you're looking for?";

  const closeNeedAssistance = () => {
    setIsNeedAssistanceOpen(false);
  };

  const handleNeedAssistanceSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!needAssistanceConsent || needAssistanceSubmitting) return;

    setNeedAssistanceSubmitting(true);
    setNeedAssistanceError(null);

    trackEvent('contact_submit_attempt', {
      method: 'product_need_assistance',
      has_phone: Boolean(needAssistanceForm.phone?.trim()),
    });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: needAssistanceForm.fullName,
          email: needAssistanceForm.email,
          phone: needAssistanceForm.phone,
          company: needAssistanceForm.company,
          startedAt: needAssistanceStartedAtRef.current,
        }),
      });

      if (!res.ok) {
        trackEvent('contact_submit_error', {
          method: 'product_need_assistance',
          status: res.status,
        });
        setNeedAssistanceError(tContact('messageError'));
        setNeedAssistanceSubmitting(false);
        return;
      }

      trackEvent('generate_lead', {
        method: 'product_need_assistance',
      });

      setNeedAssistanceSubmitted(true);
      setNeedAssistanceForm({ fullName: '', email: '', phone: '', company: '' });
      setNeedAssistanceConsent(false);
      needAssistanceStartedAtRef.current = Date.now();
    } catch {
      trackEvent('contact_submit_error', {
        method: 'product_need_assistance',
        status: 'network_error',
      });
      setNeedAssistanceError(tContact('messageError'));
    } finally {
      setNeedAssistanceSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E1E1E1]">
      {/* Breadcrumbs */}
      <div className="w-full border-b border-[#BBBBBB]">
        <div className="max-w-[1440px] mx-auto px-[16px] sm:px-[24px] lg:px-[40px] py-[10px]">
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
      </div>

      {/* Product Section */}
      <InView className="hero-animate-root">
      <main className="max-w-[1440px] mx-auto px-[16px] sm:px-[24px] lg:px-[40px] py-[16px] lg:py-[54px]">
        <div className="flex flex-col lg:flex-row gap-[24px] lg:gap-[36px]">
          {/* Left Column - Gallery (Desktop) */}
          <div className="hidden lg:flex lg:flex-[0_0_55%] order-1 hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
            {/* Main Image */}
            <div className="relative w-full h-full bg-[#EAEAEA] rounded-[4px] overflow-hidden lg:min-h-[400px] xl:min-h-[500px] 2xl:min-h-[729px]">
              {unitPricePerBoardDisplay ? (
                <div className="absolute z-10 top-[16px] left-[16px] rounded-[6px] bg-[#161616] px-[10px] py-[6px]">
                  <span className="font-['DM_Sans'] text-[14px] leading-[1] tracking-[-0.2px] text-white">
                    {formatUnitPrice(unitPricePerBoardDisplay)}
                    {typeof unitAreaM2Raw === 'number' && Number.isFinite(unitAreaM2Raw) ? (
                      <span className="font-['Outfit'] text-[12px] tracking-[0.2px] text-white/90">
                        {' '}· {unitAreaM2Raw.toFixed(2)} m²
                      </span>
                    ) : null}
                  </span>
                </div>
              ) : null}
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
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
              )}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="flex-1 flex flex-col gap-[24px] order-2 lg:order-2 hero-seq-item hero-seq-right" style={{ animationDelay: '200ms' }}>
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
              {unitPricePerBoardDisplay ? (
                <p className="font-['DM_Sans'] font-medium text-[22px] lg:text-[24px] leading-[1.15] tracking-[-0.6px] text-[#161616]">
                  {currentLocale === 'lt' ? 'Vienos lentos kaina' : 'Price per board'}: {formatUnitPrice(unitPricePerBoardDisplay)}
                  {typeof unitAreaM2Raw === 'number' && Number.isFinite(unitAreaM2Raw) ? (
                    <span className="font-['Outfit'] text-[14px] tracking-[0.2px] text-[#7C7C7C]">
                      {' '}· {unitAreaM2Raw.toFixed(2)} m²
                    </span>
                  ) : null}
                </p>
              ) : null}
              <p className="font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#7C7C7C]">
                {currentLocale === 'lt' ? 'Kaina už m²' : 'Price per m²'}: {effectivePrice.toFixed(0)} €
              </p>
              {quoteError && quoteError !== 'Kaina nerasta šiai konfigūracijai' ? (
                <p className="font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#7C7C7C]">{quoteError}</p>
              ) : null}
            </div>

            {/* Main Image (Tablet/Mobile) */}
            <div className="lg:hidden">
              <div className="relative w-full aspect-square bg-[#EAEAEA] rounded-[4px] overflow-hidden">
                {unitPricePerBoardDisplay ? (
                  <div className="absolute z-10 top-[16px] left-[16px] rounded-[6px] bg-[#161616] px-[10px] py-[6px]">
                    <span className="font-['DM_Sans'] text-[14px] leading-[1] tracking-[-0.2px] text-white">
                      {formatUnitPrice(unitPricePerBoardDisplay)}
                      {typeof unitAreaM2Raw === 'number' && Number.isFinite(unitAreaM2Raw) ? (
                        <span className="font-['Outfit'] text-[12px] tracking-[0.2px] text-white/90">
                          {' '}· {unitAreaM2Raw.toFixed(2)} m²
                        </span>
                      ) : null}
                    </span>
                  </div>
                ) : null}
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
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    priority
                  />
                )}
              </div>
            </div>

            {/* Colors (immediately after image) */}
            {colorOptions.length > 0 && (
              <div className="flex flex-col gap-[8px]">
                <div className="flex gap-[4px] font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase">
                  <span className="text-[#7C7C7C]">{currentLocale === 'lt' ? 'Spalva:' : 'Color:'}</span>
                  <span className="text-[#161616]">{effectiveSelectedColor?.name || t('selectColorPlaceholder')}</span>
                </div>
                <div className="flex gap-[8px] flex-wrap">
                  {colorOptions.map((color) => {
                    const swatchSrc = resolveColorSwatchSrc(color);
                    const isActive = effectiveSelectedColor?.id === color.id;
                    const colorToken = getColorToken(color);
                    const isAvailable = !hasStockMatrix || stockMatrix.some((entry) =>
                      entry.colorToken === colorToken &&
                      entry.widthMm === selectedWidthMm &&
                      entry.lengthMm === selectedLengthMm &&
                      (!selectedProfileToken || entry.profileToken === selectedProfileToken)
                    );
                    const fallbackSrc = typeof color.image === 'string' ? color.image : null;
                    const canUseNextImage = (src: string) => src.startsWith('/');

                    return (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => {
                          if (!isAvailable) return;
                          setSelectedColor(color);
                        }}
                        disabled={!isAvailable}
                        className={`relative w-[32px] h-[32px] rounded-full overflow-hidden border border-[#BBBBBB] ${
                          isActive ? 'ring-2 ring-[#161616] ring-offset-2' : ''
                        } ${!isAvailable ? 'opacity-40 cursor-not-allowed' : ''}`}
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

            {/* Description */}
            <p className="font-['Outfit'] font-light text-[14px] leading-[1.2] tracking-[0.14px] text-[#161616] w-full">
              {displayDescription || t('descriptionFallback')}
            </p>

            {/* Variants */}
            <div className="flex flex-col gap-[24px]">
              {/* Width */}
              <div className="flex flex-col gap-[8px]">
                <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#7c7c7c]">
                  {currentLocale === 'lt' ? 'Bendras plotis (mm)' : 'Overall width (mm)'}
                </p>
                <div className="flex gap-[8px]">
                  {widthOptionsMm.map((width) => {
                    const isAvailable = !hasStockMatrix || stockMatrix.some((entry) =>
                      entry.widthMm === width &&
                      entry.lengthMm === selectedLengthMm &&
                      (!selectedColorToken || entry.colorToken === selectedColorToken) &&
                      (!selectedProfileToken || entry.profileToken === selectedProfileToken)
                    );
                    const isActive = selectedWidthMm === width;

                    return (
                    <button
                      key={width}
                      type="button"
                      onClick={() => {
                        if (!isAvailable) return;
                        setSelectedWidthMm(width);
                      }}
                      disabled={!isAvailable}
                      className={`relative h-[48px] px-[16px] flex items-center justify-center font-['Outfit'] font-normal text-[14px] tracking-[0.42px] uppercase transition-colors ${
                        isActive
                          ? 'bg-[#161616] text-white'
                          : isAvailable
                            ? 'border border-[#bbbbbb] text-[#161616] hover:border-[#161616]'
                            : 'border border-[#bbbbbb] text-[#161616] opacity-40 cursor-not-allowed'
                      }`}
                      aria-pressed={isActive}
                    >
                      {isActive ? (
                        <span className="absolute top-[8px] right-[8px]">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d="M10 3.5L5 8.5L2 5.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      ) : null}
                      {width} mm
                    </button>
                    );
                  })}
                </div>
              </div>

              {/* Length */}
              <div className="flex flex-col gap-[8px]">
                <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#7c7c7c]">
                  {currentLocale === 'lt' ? 'Ilgis (mm)' : 'Length (mm)'}
                </p>
                <div className="flex gap-[8px]">
                  {lengthOptionsMm.map((length) => {
                    const isAvailable = !hasStockMatrix || stockMatrix.some((entry) =>
                      entry.lengthMm === length &&
                      entry.widthMm === selectedWidthMm &&
                      (!selectedColorToken || entry.colorToken === selectedColorToken) &&
                      (!selectedProfileToken || entry.profileToken === selectedProfileToken)
                    );
                    const isActive = selectedLengthMm === length;

                    return (
                    <button
                      key={length}
                      type="button"
                      onClick={() => {
                        if (!isAvailable) return;
                        setSelectedLengthMm(length);
                      }}
                      disabled={!isAvailable}
                      className={`relative h-[48px] px-[16px] flex items-center justify-center font-['Outfit'] font-normal text-[14px] tracking-[0.42px] uppercase transition-colors ${
                        isActive
                          ? 'bg-[#161616] text-white'
                          : isAvailable
                            ? 'border border-[#bbbbbb] text-[#161616] hover:border-[#161616]'
                            : 'border border-[#bbbbbb] text-[#161616] opacity-40 cursor-not-allowed'
                      }`}
                      aria-pressed={isActive}
                    >
                      {isActive ? (
                        <span className="absolute top-[8px] right-[8px]">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <path d="M10 3.5L5 8.5L2 5.5" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      ) : null}
                      {length} mm
                    </button>
                    );
                  })}
                </div>
              </div>

              {/* Profile */}
              {profileOptions.length > 0 && (
                <div className="flex flex-col gap-[8px]">
                  <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#7c7c7c]">
                    {currentLocale === 'lt' ? 'Profilis' : 'Profile'}
                  </p>
                  <div className="flex gap-[8px] flex-wrap">
                    {profileOptions.map((finish, index) => {
                      const active = effectiveSelectedFinish?.id === finish.id;
                      const profileToken = getProfileToken(finish);
                      const isAvailable = !hasStockMatrix || stockMatrix.some((entry) =>
                        entry.profileToken === profileToken &&
                        entry.widthMm === selectedWidthMm &&
                        entry.lengthMm === selectedLengthMm &&
                        (!selectedColorToken || entry.colorToken === selectedColorToken)
                      );
                      const profileIconSrc = resolveProfileIconSrc(finish) ?? PROFILE_ICON_FALLBACK_BY_INDEX[index] ?? null;
                      const fallbackSrc = typeof finish.image === 'string' ? finish.image : null;
                      const canUseNextImage = (src: string) => src.startsWith('/');

                      return (
                        <button
                          key={finish.id}
                          type="button"
                          onClick={() => {
                            if (!isAvailable) return;
                            setSelectedFinish(finish);
                          }}
                          disabled={!isAvailable}
                          className={`relative h-[48px] w-[83px] flex items-center justify-center transition-colors ${
                            active
                              ? 'bg-[#161616]'
                              : isAvailable
                                ? 'border border-[#bbbbbb] hover:border-[#161616]'
                                : 'border border-[#bbbbbb] opacity-40 cursor-not-allowed'
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

              {!isSelectionAvailable && hasStockMatrix ? (
                <p className="font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#B00020]">
                  {currentLocale === 'lt' ? 'Tokios variacijos nėra' : 'This variation is unavailable'}
                </p>
              ) : null}

              {/* Quantity */}
              <div className="flex flex-col gap-[8px]">
                <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#7c7c7c]">
                  {currentLocale === 'lt' ? 'Kiekis' : 'Quantity'}
                </p>
                <div className="flex gap-[8px]">
                  <button
                    type="button"
                    onClick={() => setInputMode('area')}
                    className={`h-[36px] px-[12px] flex items-center justify-center font-['Outfit'] font-normal text-[12px] tracking-[0.42px] uppercase transition-colors ${
                      inputMode === 'area'
                        ? 'bg-[#161616] text-white'
                        : 'border border-[#bbbbbb] text-[#161616] hover:border-[#161616]'
                    }`}
                    aria-pressed={inputMode === 'area'}
                  >
                    {currentLocale === 'lt' ? 'm²' : 'm²'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('boards')}
                    className={`h-[36px] px-[12px] flex items-center justify-center font-['Outfit'] font-normal text-[12px] tracking-[0.42px] uppercase transition-colors ${
                      inputMode === 'boards'
                        ? 'bg-[#161616] text-white'
                        : 'border border-[#bbbbbb] text-[#161616] hover:border-[#161616]'
                    }`}
                    aria-pressed={inputMode === 'boards'}
                  >
                    {currentLocale === 'lt' ? 'vnt' : 'pcs'}
                  </button>
                </div>
                <div className="h-[48px] px-[16px] border border-[#bbbbbb] flex items-center w-full">
                  {inputMode === 'area' ? (
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
                      aria-label={currentLocale === 'lt' ? 'Plotas m²' : 'Area m²'}
                    />
                  ) : (
                    <input
                      type="number"
                      inputMode="numeric"
                      value={Number.isFinite(quantityBoards) ? quantityBoards : ''}
                      onChange={(e) => {
                        const next = Number(e.target.value);
                        setQuantityBoards(Number.isFinite(next) ? next : 0);
                      }}
                      className="w-full font-['Outfit'] font-normal text-[14px] tracking-[0.42px] uppercase text-[#161616] bg-transparent outline-none"
                      min={1}
                      step={1}
                      aria-label={currentLocale === 'lt' ? 'Kiekis vnt' : 'Quantity pcs'}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-[8px] items-stretch w-full">
              <p className="font-['Outfit'] font-normal text-[12px] leading-[1.2] tracking-[0.6px] uppercase text-[#535353] text-center">
                {needAssistanceLead}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setNeedAssistanceSubmitted(false);
                    setNeedAssistanceError(null);
                    setIsNeedAssistanceOpen(true);
                  }}
                  className="text-[#161616] underline"
                >
                  {needAssistanceLabel}
                </button>
              </p>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!isSelectionAvailable}
                className={`w-full bg-[#161616] text-white h-[48px] rounded-[100px] px-[40px] py-[10px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase flex items-center justify-center transition-colors ${
                  isSelectionAvailable ? 'hover:bg-[#2d2d2d]' : 'opacity-40 cursor-not-allowed'
                }`}
              >
                {currentLocale === 'lt' ? 'Į krepšelį' : 'Add to cart'}
              </button>
            </div>
          </div>
        </div>
      </main>
      </InView>

      <section className="max-w-[1440px] mx-auto px-[16px] sm:px-[24px] lg:px-[40px] py-[32px] lg:py-[48px]">
        <Accordion items={accordionItems} defaultOpen={0} />
      </section>

      {relatedProducts.length > 0 ? (
        <section className="max-w-[1440px] mx-auto px-[16px] sm:px-[24px] lg:px-[40px] py-[40px] lg:py-[80px]">
          <div className="flex items-center justify-between mb-[24px]">
            <h2 className="font-['DM_Sans'] font-light text-[40px] lg:text-[80px] leading-none tracking-[-2.2px] lg:tracking-[-4.4px] text-[#161616]">
              {t('relatedProducts.title')}
            </h2>
            <Link
              href={toLocalePath('/products', currentLocale)}
              className="hidden lg:flex items-center gap-[8px] font-['Outfit'] font-normal text-[12px] tracking-[0.6px] uppercase text-[#161616] hover:opacity-70"
            >
              {t('relatedProducts.viewAll')}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-[16px] md:gap-x-[19px] gap-y-[40px] md:gap-y-[56px]">
            {relatedProducts.slice(0, 4).map((item) => {
              const localizedDisplayName = formatRelatedDisplayName(item);
              const attributeLabel = formatRelatedAttributes(item);
              const hasSaleItem =
                typeof item.salePrice === 'number' &&
                item.salePrice > 0 &&
                item.salePrice < item.price;
              const effectiveItemPrice = hasSaleItem ? item.salePrice! : item.price;
              const discountPercent = hasSaleItem
                ? Math.max(1, Math.round(((item.price - effectiveItemPrice) / item.price) * 100))
                : null;
              const hrefSlug = currentLocale === 'en' ? (item.slugEn ?? item.slug) : item.slug;
              const parsed = hrefSlug.includes('--') ? parseStockItemSlug(hrefSlug) : null;
              const size = parseSizeToken(parsed?.size ?? null);
              const unitPrice = getUnitPrice(effectiveItemPrice, size);
              const unitPriceLabel = unitPrice ? formatUnitPrice(unitPrice) : null;
              const detailSlug = parsed?.baseSlug ?? hrefSlug;
              const detailPath = toLocalePath(`/products/${detailSlug}`, currentLocale);
              const detailParams = new URLSearchParams();
              if (size?.widthMm) detailParams.set('w', String(size.widthMm));
              if (size?.lengthMm) detailParams.set('l', String(size.lengthMm));
              const cardColorName = parsed?.color ?? item.colors?.[0]?.name ?? '';
              if (cardColorName) detailParams.set('ct', normalizeColorKey(cardColorName));
              const cardProfileToken = parsed?.profile
                ? parsed.profile
                : item.profiles?.[0]
                  ? item.profiles[0].code ?? item.profiles[0].name ?? ''
                  : '';
              if (cardProfileToken) detailParams.set('ft', normalizeProfileToken(cardProfileToken));
              if (item.image) detailParams.set('img', item.image);
              const href = detailParams.toString() ? `${detailPath}?${detailParams.toString()}` : detailPath;

              return (
                <Link
                  key={item.id}
                  href={href}
                  className="flex flex-col gap-[8px] group"
                >
                  <div className="relative w-full h-[250px] border border-[#161616] border-opacity-30 overflow-hidden">
                    <Image
                      src={item.image || '/images/ui/wood/imgSpruce.png'}
                      alt={localizedDisplayName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {unitPriceLabel ? (
                      <div className="absolute top-[10px] left-[10px] text-[14px] font-['DM_Sans'] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
                        {unitPriceLabel}
                      </div>
                    ) : null}
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
                  {(item.category || item.woodType) && (
                    <p
                      className="font-['DM_Sans'] font-normal text-[14px] leading-[1.2] text-[#535353] tracking-[-0.28px]"
                      style={{ fontVariationSettings: "'opsz' 14" }}
                    >
                      {[
                        item.category
                          ? usageLabels[item.category] ?? formatMaybeLabel(item.category)
                          : undefined,
                        item.woodType ? (woodLabels[item.woodType] ?? item.woodType) : undefined,
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
                      <span className={hasSaleItem ? 'text-[#161616]' : undefined}>
                        {formatCardPrice(effectiveItemPrice)}
                      </span>
                      {hasSaleItem ? (
                        <span className="text-[#7C7C7C] line-through">
                          {formatCardPrice(item.price)}
                        </span>
                      ) : null}
                    </span>
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <ModalOverlay isOpen={isNeedAssistanceOpen} onClose={closeNeedAssistance}>
        <div className="relative w-[min(520px,92vw)] bg-[#EAEAEA] border border-[#BBBBBB] rounded-[16px] p-[20px] sm:p-[28px]">
          <button
            type="button"
            onClick={closeNeedAssistance}
            className="absolute right-[16px] top-[16px] h-[28px] w-[28px] rounded-full border border-[#BBBBBB] text-[#535353] hover:text-[#161616] hover:border-[#161616]"
            aria-label={currentLocale === 'lt' ? 'Uždaryti' : 'Close'}
          >
            ×
          </button>

          <p className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#7C7C7C]">
            {currentLocale === 'lt' ? 'Užklausa' : 'Request'}
          </p>
          <h3 className="mt-[6px] font-['DM_Sans'] text-[20px] sm:text-[22px] text-[#161616]">
            {tContact('subtitle')}
          </h3>

          <div className="mt-[16px]">
            {needAssistanceSubmitted ? (
              <div className="py-[16px]">
                <p className="font-['DM_Sans'] text-[20px] text-[#161616]">{tContact('thankYou')}</p>
                <p className="mt-[6px] font-['Outfit'] text-[14px] text-[#535353]">{tContact('thankYouMessage')}</p>
              </div>
            ) : (
              <form onSubmit={handleNeedAssistanceSubmit} className="space-y-[12px]">
                <div className="space-y-[8px]">
                  <label className="block font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                    {tContact('fullName')}*
                  </label>
                  <input
                    type="text"
                    required
                    value={needAssistanceForm.fullName}
                    onChange={(event) =>
                      setNeedAssistanceForm((prev) => ({
                        ...prev,
                        fullName: event.target.value,
                      }))
                    }
                    className="w-full h-[44px] px-[14px] bg-transparent border border-[#BBBBBB] rounded-[8px] font-['Outfit'] text-[14px] text-[#161616]"
                  />
                </div>
                <div className="space-y-[8px]">
                  <label className="block font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                    {tContact('email')}*
                  </label>
                  <input
                    type="email"
                    required
                    value={needAssistanceForm.email}
                    onChange={(event) =>
                      setNeedAssistanceForm((prev) => ({
                        ...prev,
                        email: event.target.value,
                      }))
                    }
                    className="w-full h-[44px] px-[14px] bg-transparent border border-[#BBBBBB] rounded-[8px] font-['Outfit'] text-[14px] text-[#161616]"
                  />
                </div>
                <div className="space-y-[8px]">
                  <label className="block font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#7C7C7C]">
                    {tContact('phone')}*
                  </label>
                  <input
                    type="tel"
                    required
                    value={needAssistanceForm.phone}
                    onChange={(event) =>
                      setNeedAssistanceForm((prev) => ({
                        ...prev,
                        phone: event.target.value,
                      }))
                    }
                    className="w-full h-[44px] px-[14px] bg-transparent border border-[#BBBBBB] rounded-[8px] font-['Outfit'] text-[14px] text-[#161616]"
                  />
                </div>

                <input
                  type="text"
                  value={needAssistanceForm.company}
                  onChange={(event) =>
                    setNeedAssistanceForm((prev) => ({
                      ...prev,
                      company: event.target.value,
                    }))
                  }
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <label className="flex items-start gap-[10px] text-[12px] text-[#535353] font-['Outfit']">
                  <input
                    type="checkbox"
                    checked={needAssistanceConsent}
                    onChange={(event) => setNeedAssistanceConsent(event.target.checked)}
                    className="mt-[2px] h-[16px] w-[16px] border border-[#BBBBBB] accent-[#161616]"
                  />
                  <span>
                    {tContact('privacyConsent')}{' '}
                    <Link href="/privacy-policy" className="text-[#161616] underline">
                      {tContact('privacyPolicy')}
                    </Link>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={needAssistanceSubmitting || !needAssistanceConsent}
                  className="w-full h-[48px] bg-[#161616] rounded-[100px] font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-white disabled:opacity-50"
                >
                  {needAssistanceSubmitting ? tContact('sending') : tContact('leaveRequest')}
                </button>

                {needAssistanceError ? (
                  <p className="font-['Outfit'] text-[12px] text-[#F63333]">{needAssistanceError}</p>
                ) : null}
              </form>
            )}
          </div>
        </div>
      </ModalOverlay>
    </div>
  );
}

