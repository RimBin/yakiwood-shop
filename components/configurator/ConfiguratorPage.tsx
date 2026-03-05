'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { PageCover, PageSection } from '@/components/shared';
import Konfiguratorius3D, { type Konfiguratorius3DHandle } from '@/components/Konfiguratorius3D';
import {
  fetchProducts,
  getLocalizedColorName,
  getLocalizedProfileName,
  type Product,
  type ProductColorVariant,
  type ProductProfileVariant,
} from '@/lib/products.supabase';
import { toLocalePath } from '@/i18n/paths';
import { getProductModelUrl, getGenericModelUrl } from '@/lib/models';
import InView from '@/components/InView';
import { downloadConfigurationPDF, type ConfigurationPDFData } from '@/lib/configurator/pdf-generator';
import { useCartStore } from '@/lib/cart/store';
import { useToast } from '@/components/ui/Toast';

type BoardType = 'terasine' | 'fasadine';
type WoodType = 'maumedis' | 'egle' | 'termo';
type ProfileKey = 'staciak' | 'rombas' | 'spuntas' | 'spuntas45';
type ColorKey = 'black' | 'carbon' | 'carbon_light' | 'graphite' | 'natural' | 'dark_brown' | 'latte' | 'silver';

type ToggleOption<T extends string> = {
  value: T;
  label: string;
  enabled?: boolean;
};

const CONFIGURATOR_MODEL_URL = getGenericModelUrl();

const THERMO_COLORS = new Set<ColorKey>(['black', 'carbon', 'carbon_light', 'graphite', 'dark_brown', 'silver']);

const BOARD_OPTIONS: ToggleOption<BoardType>[] = [
  { value: 'terasine', label: 'Terasinė' },
];

const WOOD_OPTIONS: ToggleOption<WoodType>[] = [
  { value: 'maumedis', label: 'Maumedis' },
  { value: 'egle', label: 'Eglė' },
  { value: 'termo', label: 'Termo' },
];

const PROFILE_OPTIONS: ToggleOption<ProfileKey>[] = [
  { value: 'staciak', label: 'Stačiakampis' },
];

const COLOR_OPTIONS: ToggleOption<ColorKey>[] = [
  { value: 'black', label: 'Black' },
  { value: 'carbon', label: 'Carbon' },
  { value: 'carbon_light', label: 'Carbon Light' },
  { value: 'graphite', label: 'Graphite' },
  { value: 'natural', label: 'Natural' },
  { value: 'dark_brown', label: 'Dark Brown' },
  { value: 'latte', label: 'Latte' },
  { value: 'silver', label: 'Silver' },
];

const WIDTH_OPTIONS: ToggleOption<string>[] = [
  { value: '95', label: '95 mm' },
  { value: '120', label: '120 mm' },
  { value: '145', label: '145 mm' },
];

const LENGTH_OPTIONS: ToggleOption<string>[] = [
  { value: '3000', label: '3000 mm' },
  { value: '3300', label: '3300 mm' },
  { value: '3600', label: '3600 mm' },
];

const THICKNESS_OPTIONS: Record<BoardType, ToggleOption<string>[]> = {
  terasine: [{ value: '28', label: '28 mm' }],
  fasadine: [{ value: '20', label: '18/20 mm' }],
};

function PanelSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[12px] border border-[#BBBBBB] bg-white p-3">
      <p className="font-['Outfit'] text-[12px] leading-[1.3] text-[#535353] mb-2">{title}</p>
      {children}
    </div>
  );
}

function ToggleButtons<T extends string>({
  value,
  onChange,
  options,
  columns = 1,
}: {
  value: T;
  onChange: (next: T) => void;
  options: ToggleOption<T>[];
  columns?: 1 | 2 | 3;
}) {
  const gridClass = columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <div className={`grid ${gridClass} gap-1.5`}>
      {options.map((option) => {
        const active = value === option.value;
        const enabled = option.enabled !== false;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => enabled && onChange(option.value)}
            disabled={!enabled}
            className={`h-[30px] rounded-[4px] px-2 font-['Outfit'] text-[12px] leading-[1.2] transition-colors border ${
              active
                ? 'bg-[#161616] border-[#161616] text-white'
                : enabled
                  ? 'bg-[#F9F9F9] border-[#BBBBBB] text-[#161616] hover:border-[#535353]'
                  : 'bg-[#EAEAEA] border-[#E1E1E1] text-[#7C7C7C] cursor-not-allowed'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function pickFirstEnabled<T extends string>(options: ToggleOption<T>[]): T | null {
  return options.find((option) => option.enabled !== false)?.value ?? null;
}

export default function ConfiguratorPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const toast = useToast();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';

  const fallbackColors = useMemo<ProductColorVariant[]>(
    () => [
      { id: 'demo-black', name: 'Black', nameLt: 'Juoda', nameEn: 'Black', hex: '#1f1f1f', priceModifier: 0 },
      { id: 'demo-carbon', name: 'Carbon', nameLt: 'Anglis', nameEn: 'Carbon', hex: '#333333', priceModifier: 0 },
      { id: 'demo-carbon-light', name: 'Carbon Light', nameLt: 'Šviesi anglis', nameEn: 'Carbon Light', hex: '#5b5b5b', priceModifier: 0 },
      { id: 'demo-graphite', name: 'Graphite', nameLt: 'Grafitas', nameEn: 'Graphite', hex: '#535353', priceModifier: 0 },
      { id: 'demo-natural', name: 'Natural', nameLt: 'Natūrali', nameEn: 'Natural', hex: '#8f6a4d', priceModifier: 0 },
      { id: 'demo-dark-brown', name: 'Dark Brown', nameLt: 'Tamsiai ruda', nameEn: 'Dark Brown', hex: '#5b3b2b', priceModifier: 0 },
      { id: 'demo-latte', name: 'Latte', nameLt: 'Latte', nameEn: 'Latte', hex: '#b18e70', priceModifier: 0 },
      { id: 'demo-silver', name: 'Silver', nameLt: 'Sidabrinė', nameEn: 'Silver', hex: '#b7b7b7', priceModifier: 0 },
    ],
    []
  );

  const fallbackProfiles = useMemo<ProductProfileVariant[]>(
    () => [
      {
        id: 'demo-half-taper-45',
        name: 'Half taper 45°',
        nameLt: 'Pusė špunto 45°',
        nameEn: 'Half taper 45°',
        code: 'half_taper_45_deg',
        description: currentLocale === 'lt' ? 'Demo profilis (Pusė špunto 45°)' : 'Demo profile (Half taper 45°)',
        priceModifier: 0,
        dimensions: {
          width: 120,
          thickness: 20,
          length: 3300,
        },
      },
      {
        id: 'demo-rectangle',
        name: 'Rectangle',
        nameLt: 'Stačiakampis',
        nameEn: 'Rectangle',
        code: 'rectangle',
        description: currentLocale === 'lt' ? 'Demo profilis (stačiakampis)' : 'Demo profile (rectangle)',
        priceModifier: 0,
        dimensions: {
          width: 120,
          thickness: 20,
          length: 3300,
        },
      },
    ],
    [currentLocale]
  );

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const [selectedBoardType, setSelectedBoardType] = useState<BoardType>('terasine');
  const [selectedWood, setSelectedWood] = useState<WoodType>('egle');
  const [selectedProfile, setSelectedProfile] = useState<ProfileKey>('staciak');
  const [selectedThickness, setSelectedThickness] = useState<'28' | '20'>('28');
  const [selectedColor, setSelectedColor] = useState<ColorKey>('natural');
  const [selectedWidth, setSelectedWidth] = useState<string>('120');
  const [selectedLength, setSelectedLength] = useState<string>('3300');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'boards' | 'area'>('boards');
  const [quantityBoards, setQuantityBoards] = useState<number>(1);
  const [targetAreaM2, setTargetAreaM2] = useState<number>(1);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [quote, setQuote] = useState<null | {
    unitPricePerM2: number;
    areaM2: number;
    totalAreaM2: number;
    unitPricePerBoard: number;
    quantityBoards: number;
    lineTotal: number;
    inputMode: 'boards' | 'area';
    roundingInfo?: {
      requestedAreaM2: number;
      actualAreaM2: number;
      deltaAreaM2: number;
      rounding: 'ceil' | 'round' | 'floor';
    };
  }>(null);

  const configuratorRef = useRef<Konfiguratorius3DHandle | null>(null);

  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);

  const normalizeToken = useCallback((value: string) => {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
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
      if (token === 'spruce' || token === 'larch' || token === 'thermo') return token;
      if (token.includes('spruce') || token.includes('egle') || token.includes('egl')) return 'spruce';
      if (token.includes('larch') || token.includes('maumed') || token.includes('maum')) return 'larch';
      if (token.includes('thermo') || token.includes('termo')) return 'thermo';
      return null;
    },
    [normalizeToken]
  );

  const colorVariantToKey = useCallback(
    (variant: ProductColorVariant): ColorKey | null => {
      const token = normalizeToken([variant.id, variant.nameEn, variant.nameLt, variant.name].filter(Boolean).join(' '));
      if (!token) return null;

      if (token.includes('black') || token.includes('juod')) return 'black';

      if (token.includes('carbon-light') || token.includes('carbonlight') || token.includes('sviesi-angl') || token.includes('sviesi-anglis')) {
        return 'carbon_light';
      }
      if (token.includes('carbon') || token.includes('angl')) return 'carbon';

      if (token.includes('graphite') || token.includes('grafit')) return 'graphite';

      if (token.includes('dark-brown') || token.includes('darkbrown') || token.includes('tams') || token.includes('brown') || token.includes('ruda')) {
        return 'dark_brown';
      }

      if (token.includes('silver') || token.includes('sidabr')) return 'silver';

      if (token.includes('latte')) return 'latte';

      if (token.includes('natural') || token.includes('natur') || token.includes('natural-burnt') || token.includes('natural-burn')) {
        return 'natural';
      }

      return null;
    },
    [normalizeToken]
  );

  const finishToProfileKey = useCallback(
    (finish: ProductProfileVariant): ProfileKey => {
      const token = normalizeToken([finish.code, finish.nameEn, finish.nameLt, finish.name].filter(Boolean).join(' '));
      if (token.includes('spunt') && token.includes('45')) return 'spuntas45';
      if (token.includes('spunt') || token.includes('taper')) return 'spuntas';
      if (token.includes('romb')) return 'rombas';
      return 'staciak';
    },
    [normalizeToken]
  );

  const boardTypeToUsage = useCallback((value: BoardType) => (value === 'fasadine' ? 'facade' : 'terrace'), []);
  const woodToWoodId = useCallback((value: WoodType) => (value === 'maumedis' ? 'larch' : value === 'egle' ? 'spruce' : 'thermo'), []);

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

  useEffect(() => {
    setSelectedThickness(selectedBoardType === 'terasine' ? '28' : '20');
  }, [selectedBoardType]);

  useEffect(() => {
    if (selectedWood === 'termo' && !THERMO_COLORS.has(selectedColor)) {
      setSelectedColor('carbon');
    }
  }, [selectedWood, selectedColor]);

  const filteredProducts = useMemo(() => {
    const usage = boardTypeToUsage(selectedBoardType);
    const wood = woodToWoodId(selectedWood);

    return allProducts.filter((p) => {
      const usageId = normalizeUsageId(p.category);
      const woodId = normalizeWoodId(p.woodType);
      return usageId === usage && woodId === wood;
    });
  }, [allProducts, boardTypeToUsage, normalizeUsageId, normalizeWoodId, selectedBoardType, selectedWood, woodToWoodId]);

  useEffect(() => {
    if (filteredProducts.length === 0) {
      setProduct(null);
      setSelectedProductId(null);
      return;
    }

    const next = filteredProducts.find((item) => item.id === selectedProductId) ?? filteredProducts[0];
    if (next?.id !== selectedProductId) {
      setSelectedProductId(next.id);
    }
    if (next?.id !== product?.id) {
      setProduct(next);
    }
  }, [filteredProducts, product?.id, selectedProductId]);

  const availableColors = useMemo(() => {
    const colors = product?.colors ?? [];
    return colors.length > 0 ? colors : fallbackColors;
  }, [product, fallbackColors]);

  const availableFinishes = useMemo(() => {
    const profiles = product?.profiles ?? [];
    return profiles.length > 0 ? profiles : fallbackProfiles;
  }, [product, fallbackProfiles]);

  const availableColorKeys = useMemo(() => {
    const keys = new Set<ColorKey>();
    availableColors.forEach((color) => {
      const key = colorVariantToKey(color);
      if (key) keys.add(key);
    });
    return keys;
  }, [availableColors, colorVariantToKey]);

  const availableProfileKeys = useMemo(() => {
    const keys = new Set<ProfileKey>();
    availableFinishes.forEach((finish) => {
      keys.add(finishToProfileKey(finish));
    });
    return keys;
  }, [availableFinishes, finishToProfileKey]);

  const availableWidths = useMemo(() => new Set<string>(WIDTH_OPTIONS.map((option) => option.value)), []);

  const availableLengths = useMemo(() => new Set<string>(LENGTH_OPTIONS.map((option) => option.value)), []);

  const availableThicknesses = useMemo(() => {
    const set = new Set<'28' | '20'>();
    availableFinishes.forEach((finish) => {
      const thickness = finish.dimensions?.thickness;
      if (typeof thickness !== 'number') return;
      if (thickness >= 24) set.add('28');
      else set.add('20');
    });
    return set;
  }, [availableFinishes]);

  useEffect(() => {
    if (!availableColorKeys.has(selectedColor)) {
      const next = pickFirstEnabled(
        COLOR_OPTIONS.map((option) => ({
          ...option,
          enabled: availableColorKeys.has(option.value) && (selectedWood !== 'termo' || THERMO_COLORS.has(option.value)),
        }))
      );
      if (next) setSelectedColor(next);
    }
  }, [availableColorKeys, selectedColor, selectedWood]);

  useEffect(() => {
    if (!availableProfileKeys.has(selectedProfile)) {
      const next = pickFirstEnabled(PROFILE_OPTIONS.map((option) => ({ ...option, enabled: availableProfileKeys.has(option.value) })));
      if (next) setSelectedProfile(next);
    }
  }, [availableProfileKeys, selectedProfile]);

  useEffect(() => {
    if (!availableWidths.has(selectedWidth)) {
      const next = pickFirstEnabled(WIDTH_OPTIONS);
      if (next) setSelectedWidth(next);
    }
  }, [availableWidths, selectedWidth]);

  useEffect(() => {
    if (!availableLengths.has(selectedLength)) {
      const next = pickFirstEnabled(LENGTH_OPTIONS);
      if (next) setSelectedLength(next);
    }
  }, [availableLengths, selectedLength]);

  useEffect(() => {
    if (!availableThicknesses.has(selectedThickness)) {
      setSelectedThickness(selectedBoardType === 'terasine' ? '28' : '20');
    }
  }, [availableThicknesses, selectedBoardType, selectedThickness]);

  const selectedColorVariant = useMemo(() => {
    return (
      availableColors.find((color) => colorVariantToKey(color) === selectedColor) ??
      availableColors[0] ??
      null
    );
  }, [availableColors, colorVariantToKey, selectedColor]);

  const selectedFinishVariant = useMemo(() => {
    const targetWidth = Number(selectedWidth);
    const targetLength = Number(selectedLength);

    const thicknessMatches = (thickness: number | undefined): boolean => {
      if (typeof thickness !== 'number' || !Number.isFinite(thickness)) return false;
      if (selectedThickness === '28') return thickness >= 24;
      return thickness < 24 || thickness === 20 || thickness === 18;
    };

    const scored = availableFinishes
      .map((finish) => {
        let score = 0;

        if (finishToProfileKey(finish) === selectedProfile) score += 5;
        if (finish.dimensions?.width === targetWidth) score += 3;
        if (finish.dimensions?.length === targetLength) score += 3;
        if (thicknessMatches(finish.dimensions?.thickness)) score += 2;

        return { finish, score };
      })
      .sort((a, b) => b.score - a.score);

    return scored[0]?.finish ?? null;
  }, [availableFinishes, finishToProfileKey, selectedLength, selectedProfile, selectedThickness, selectedWidth]);

  const productModelUrl = useMemo(
    () =>
      product
        ? getProductModelUrl({ slug: product.slug, category: product.category, woodType: product.woodType })
        : CONFIGURATOR_MODEL_URL,
    [product]
  );

  const boardTypeOptions = BOARD_OPTIONS;
  const woodOptions = WOOD_OPTIONS.map((option) => ({
    ...option,
    enabled:
      option.value !== 'termo'
        ? true
        : allProducts.some((p) => normalizeWoodId(p.woodType) === 'thermo'),
  }));

  const profileOptions = PROFILE_OPTIONS.map((option) => ({
    ...option,
    enabled: availableProfileKeys.has(option.value),
  }));

  const thicknessOptions = THICKNESS_OPTIONS[selectedBoardType].map((option) => ({
    ...option,
    enabled: availableThicknesses.has(option.value as '28' | '20'),
  }));

  const colorOptions = COLOR_OPTIONS.map((option) => ({
    ...option,
    enabled: availableColorKeys.has(option.value) && (selectedWood !== 'termo' || THERMO_COLORS.has(option.value)),
  }));

  const widthOptions = WIDTH_OPTIONS.map((option) => ({
    ...option,
    enabled: true,
  }));

  const lengthOptions = LENGTH_OPTIONS.map((option) => ({
    ...option,
    enabled: true,
  }));

  const widthMm = useMemo(() => Number(selectedWidth), [selectedWidth]);
  const lengthMm = useMemo(() => Number(selectedLength), [selectedLength]);
  const thicknessMm = useMemo(() => (selectedThickness === '28' ? 28 : 20), [selectedThickness]);

  const selectedProductName =
    product ? (currentLocale === 'en' && product.nameEn ? product.nameEn : product.name) : null;

  const buyNowLabel = useMemo(() => {
    const key = 'products.buyNow';
    if (typeof t.has === 'function' && t.has(key)) return t(key);
    return currentLocale === 'lt' ? 'Pirkti dabar' : 'Buy now';
  }, [currentLocale, t]);

  const currency = useMemo(
    () =>
      new Intl.NumberFormat(locale === 'lt' ? 'lt-LT' : 'en-US', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2,
      }),
    [locale]
  );

  const cartTotalAreaM2 = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const area = item.pricingSnapshot?.totalAreaM2;
      if (typeof area === 'number' && Number.isFinite(area) && area > 0) return sum + area;
      return sum;
    }, 0);
  }, [cartItems]);

  const displayLineTotal = useMemo(() => {
    if (!quote) return null;

    const safeUnitPerM2 = Number.isFinite(quote.unitPricePerM2) ? quote.unitPricePerM2 : 0;
    const safeUnitPerBoard = Number.isFinite(quote.unitPricePerBoard) ? quote.unitPricePerBoard : 0;

    if (inputMode === 'boards') {
      const boards = Math.max(1, Math.round(Number(quantityBoards) || 1));
      if (safeUnitPerBoard > 0) return safeUnitPerBoard * boards;
      return Number.isFinite(quote.lineTotal) ? quote.lineTotal : null;
    }

    const unitAreaM2 = (widthMm / 1000) * (lengthMm / 1000);
    const requestedArea = Math.max(0.01, Number(targetAreaM2) || 0.01);
    const roundedAreaM2 = unitAreaM2 > 0 ? Math.ceil(requestedArea / unitAreaM2) * unitAreaM2 : requestedArea;

    if (safeUnitPerM2 > 0) return safeUnitPerM2 * roundedAreaM2;
    return Number.isFinite(quote.lineTotal) ? quote.lineTotal : null;
  }, [inputMode, lengthMm, quantityBoards, quote, targetAreaM2, widthMm]);

  useEffect(() => {
    if (!product?.id || !selectedColorVariant || !selectedFinishVariant) {
      setQuote(null);
      setQuoteError(null);
      return;
    }

    if (typeof widthMm !== 'number' || typeof lengthMm !== 'number') {
      setQuote(null);
      setQuoteError(null);
      return;
    }

    const controller = new AbortController();

    const run = async () => {
      setQuoteLoading(true);
      setQuoteError(null);

      try {
        type QuoteRequestBody = {
          productId: string;
          usageType?: 'facade' | 'terrace';
          profileVariantId?: string;
          colorVariantId?: string;
          thicknessMm?: number;
          widthMm: number;
          lengthMm: number;
          inputMode: 'boards' | 'area';
          quantityBoards?: number;
          targetAreaM2?: number;
          rounding?: 'ceil' | 'round' | 'floor';
          cartTotalAreaM2?: number;
        };

        const unitAreaM2 = (widthMm / 1000) * (lengthMm / 1000);

        const currentLineAreaM2 =
          inputMode === 'boards'
            ? (typeof quantityBoards === 'number' ? quantityBoards : 0) * unitAreaM2
            : typeof targetAreaM2 === 'number' && unitAreaM2 > 0
              ? Math.ceil(targetAreaM2 / unitAreaM2) * unitAreaM2
              : 0;

        const body: QuoteRequestBody =
          inputMode === 'boards'
            ? {
                productId: product.id,
                usageType: boardTypeToUsage(selectedBoardType),
                profileVariantId: selectedFinishVariant.id,
                colorVariantId: selectedColorVariant.id,
                widthMm,
                lengthMm,
                inputMode,
                quantityBoards,
                cartTotalAreaM2: cartTotalAreaM2 + currentLineAreaM2,
                thicknessMm,
              }
            : {
                productId: product.id,
                usageType: boardTypeToUsage(selectedBoardType),
                profileVariantId: selectedFinishVariant.id,
                colorVariantId: selectedColorVariant.id,
                widthMm,
                lengthMm,
                inputMode,
                targetAreaM2,
                rounding: 'ceil',
                cartTotalAreaM2: cartTotalAreaM2 + currentLineAreaM2,
                thicknessMm,
              };

        const res = await fetch('/api/pricing/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          setQuote(null);
          try {
            const data = await res.json();
            setQuoteError(typeof data?.error === 'string' ? data.error : t('configurator.priceNotAvailable'));
          } catch {
            setQuoteError(t('configurator.priceNotAvailable'));
          }
          return;
        }

        const data: any = await res.json();
        const next = {
          unitPricePerM2: Number(data?.unitPricePerM2),
          areaM2: Number(data?.areaM2),
          totalAreaM2: Number(data?.totalAreaM2),
          unitPricePerBoard: Number(data?.unitPricePerBoard),
          quantityBoards: Number(data?.quantityBoards),
          lineTotal: Number(data?.lineTotal),
          inputMode: data?.inputMode === 'area' ? 'area' : 'boards',
          roundingInfo: data?.roundingInfo as
            | {
                requestedAreaM2: number;
                actualAreaM2: number;
                deltaAreaM2: number;
                rounding: 'ceil' | 'round' | 'floor';
              }
            | undefined,
        } as const;

        if (!Number.isFinite(next.unitPricePerM2) || next.unitPricePerM2 <= 0) {
          setQuote(null);
          setQuoteError(t('configurator.priceNotAvailable'));
          return;
        }

        setQuote(next);
        setQuoteError(null);

        if (inputMode === 'boards') {
          if (Number.isFinite(next.quantityBoards) && next.quantityBoards > 0 && next.quantityBoards !== quantityBoards) {
            setQuantityBoards(next.quantityBoards);
          }
        }
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setQuote(null);
        setQuoteError(t('configurator.priceNotAvailable'));
      } finally {
        setQuoteLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [
    cartTotalAreaM2,
    inputMode,
    lengthMm,
    product?.id,
    quantityBoards,
    selectedColorVariant,
    selectedFinishVariant,
    thicknessMm,
    t,
    targetAreaM2,
    widthMm,
  ]);

  const handleDownloadPdf = useCallback(async () => {
    if (!selectedFinishVariant || !selectedColorVariant) return;

    setPdfLoading(true);
    try {
      const screenshotDataUrl = configuratorRef.current?.takeScreenshot() ?? null;

      const pdfData: ConfigurationPDFData = {
        productName: selectedProductName ?? product?.id ?? 'config',
        colorName: getLocalizedColorName(selectedColorVariant, currentLocale),
        colorHex: selectedColorVariant.hex,
        profileName: getLocalizedProfileName(selectedFinishVariant, currentLocale),
        widthMm,
        lengthMm,
        thicknessMm,
        pricePerM2: quote?.unitPricePerM2,
        pricePerBoard: quote?.unitPricePerBoard,
        quantityBoards: quote?.quantityBoards,
        totalAreaM2: quote?.totalAreaM2,
        lineTotal: quote?.lineTotal,
        screenshotDataUrl,
        configUrl: typeof window !== 'undefined' ? window.location.href : undefined,
      };

      await downloadConfigurationPDF(pdfData, currentLocale);
    } finally {
      setPdfLoading(false);
    }
  }, [currentLocale, product?.id, quote, selectedColorVariant, selectedFinishVariant, selectedProductName]);

  const handleAddToCart = useCallback(
    (goToCheckout: boolean) => {
      if (!product || !selectedColorVariant || !selectedFinishVariant) return;
      const unitAreaM2 =
        typeof widthMm === 'number' && typeof lengthMm === 'number' && widthMm > 0 && lengthMm > 0
          ? (widthMm / 1000) * (lengthMm / 1000)
          : 0;

      const resolvedQuantityBoards =
        inputMode === 'boards'
          ? Math.max(1, Math.round(Number(quote?.quantityBoards ?? quantityBoards) || 1))
          : 1;

      const resolvedTargetAreaM2 =
        inputMode === 'area' ? Math.max(0.01, Number(quote?.totalAreaM2 ?? targetAreaM2) || 0.01) : undefined;

      const basePriceForCart =
        inputMode === 'area'
          ? quote?.unitPricePerM2 ?? product.price ?? 0
          : quote?.unitPricePerBoard ?? product.price ?? 0;

      const quantityForCart = inputMode === 'area' ? resolvedTargetAreaM2 ?? 1 : resolvedQuantityBoards;

      const totalAreaForSnapshot =
        inputMode === 'area'
          ? resolvedTargetAreaM2 ?? 0
          : quote?.totalAreaM2 ?? (unitAreaM2 > 0 ? unitAreaM2 * resolvedQuantityBoards : 0);

      const unitPriceForSnapshot =
        typeof quote?.unitPricePerBoard === 'number' && Number.isFinite(quote.unitPricePerBoard)
          ? quote.unitPricePerBoard
          : unitAreaM2 > 0
            ? basePriceForCart * unitAreaM2
            : basePriceForCart;

      const lineTotalForSnapshot =
        typeof quote?.lineTotal === 'number' && Number.isFinite(quote.lineTotal)
          ? quote.lineTotal
          : inputMode === 'area'
            ? (quote?.unitPricePerM2 ?? basePriceForCart) * (resolvedTargetAreaM2 ?? 0)
            : unitPriceForSnapshot * resolvedQuantityBoards;

      addItem({
        id: product.id,
        name: selectedProductName ?? product.name,
        slug: currentLocale === 'en' ? (product.slugEn ?? product.slug) : product.slug,
        image:
          typeof selectedColorVariant.image === 'string' && selectedColorVariant.image.trim().length > 0
            ? selectedColorVariant.image
            : typeof product.image === 'string'
              ? product.image
              : undefined,
        basePrice: basePriceForCart,
        quantity: quantityForCart,
        color: selectedColorVariant.name,
        finish: selectedFinishVariant.name,
        configuration: {
          usageType: boardTypeToUsage(selectedBoardType),
          colorVariantId: selectedColorVariant.id,
          profileVariantId: selectedFinishVariant.id,
          thicknessMm,
          widthMm,
          lengthMm,
        },
        inputMode,
        targetAreaM2: inputMode === 'area' ? resolvedTargetAreaM2 : undefined,
        pricingSnapshot:
          unitAreaM2 > 0
            ? {
                unitAreaM2,
                totalAreaM2: totalAreaForSnapshot,
                pricePerM2Used: quote?.unitPricePerM2 ?? basePriceForCart,
                unitPrice: unitPriceForSnapshot,
                lineTotal: lineTotalForSnapshot,
              }
            : undefined,
      });

      if (goToCheckout) {
        router.push(toLocalePath('/checkout', currentLocale));
      } else {
        toast.success(t('cart.itemAdded'));
      }
    },
    [
      addItem,
      boardTypeToUsage,
      currentLocale,
      inputMode,
      product,
      quantityBoards,
      quote,
      router,
      selectedBoardType,
      selectedColorVariant,
      selectedFinishVariant,
      selectedProductName,
      t,
      targetAreaM2,
      toast,
    ]
  );

  return (
    <main className="min-h-screen bg-[#E1E1E1]">
      <InView className="hero-animate-root">
        <PageCover>
          <div className="flex flex-col gap-[12px] hero-seq-item hero-seq-right" style={{ animationDelay: '0ms' }}>
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
      </InView>

      <InView className="hero-animate-root">
        <PageSection className="max-w-[1440px] mx-auto" centered={false}>
          {error && (
            <div className="w-full border border-[#BBBBBB] rounded-[24px] bg-white p-[24px] hero-seq-item hero-seq-right" style={{ animationDelay: '320ms' }}>
              <p className="font-['Outfit'] text-[14px] text-[#535353]">{t('configurator.loadError')}</p>
              <p className="mt-2 font-['Outfit'] text-[12px] text-[#7C7C7C]">{error}</p>
            </div>
          )}

          {!error && filteredProducts.length === 0 && !isLoading && (
            <div className="w-full border border-[#BBBBBB] rounded-[24px] bg-white p-[24px] hero-seq-item hero-seq-right" style={{ animationDelay: '320ms' }}>
              <p className="font-['Outfit'] text-[14px] text-[#535353]">{t('productsPage.emptyTitle')}</p>
              <p className="mt-2 font-['Outfit'] text-[12px] text-[#7C7C7C]">
                {t('productsPage.emptyDescriptionPrefix')}{' '}
                <a href={toLocalePath('/kontaktai', currentLocale)} className="text-[#161616] underline">
                  {t('productsPage.emptyContactLink')}
                </a>
                {t('productsPage.emptyDescriptionSuffix')}
              </p>

              <div className="mt-[20px]">
                <p className="font-['Outfit'] text-[10px] tracking-[0.6px] uppercase text-[#7C7C7C]">
                  {t('configurator.demoExampleLabel')}
                </p>
                <div className="mt-[10px]">
                  <Konfiguratorius3D
                    productId="demo"
                    availableColors={fallbackColors}
                    availableFinishes={fallbackProfiles}
                    modelUrl={CONFIGURATOR_MODEL_URL}
                    basePrice={undefined}
                    isLoading={false}
                  />
                </div>
              </div>
            </div>
          )}

          {!error && (product || isLoading) && (
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 hero-seq-item hero-seq-right" style={{ animationDelay: '320ms' }}>
              <div>
                <Konfiguratorius3D
                  ref={configuratorRef}
                  productId={product?.id ?? 'demo'}
                  availableColors={availableColors}
                  availableFinishes={availableFinishes}
                  modelSlug={product?.slug}
                  modelUrl={productModelUrl}
                  basePrice={product?.price}
                  isLoading={isLoading}
                  mode="viewport"
                  selectedColorId={selectedColorVariant?.id}
                  selectedFinishId={selectedFinishVariant?.id}
                  visualDimensionsMm={{
                    widthMm,
                    lengthMm,
                    thicknessMm,
                  }}
                  onColorChange={(color) => {
                    const key = colorVariantToKey(color);
                    if (key) setSelectedColor(key);
                  }}
                  onFinishChange={(finish) => {
                    setSelectedProfile(finishToProfileKey(finish));
                    if (typeof finish.dimensions?.width === 'number') {
                      setSelectedWidth(String(Math.round(finish.dimensions.width)));
                    }
                    if (typeof finish.dimensions?.length === 'number') {
                      setSelectedLength(String(Math.round(finish.dimensions.length)));
                    }
                    if (typeof finish.dimensions?.thickness === 'number') {
                      setSelectedThickness(finish.dimensions.thickness >= 24 ? '28' : '20');
                    }
                  }}
                />
              </div>

              <aside className="rounded-[24px] border border-[#BBBBBB] bg-[#EAEAEA] p-4 flex flex-col gap-3 h-fit">
                <h2 className="font-['Outfit'] text-[13px] text-[#161616]">Lentų Konfiguratoriaus</h2>

                <PanelSection title="Lento tipas">
                  <ToggleButtons value={selectedBoardType} onChange={setSelectedBoardType} options={boardTypeOptions} columns={2} />
                </PanelSection>

                <PanelSection title="Profilis">
                  <ToggleButtons value={selectedProfile} onChange={setSelectedProfile} options={profileOptions} columns={2} />
                </PanelSection>

                <PanelSection title="Storis">
                  <ToggleButtons
                    value={selectedThickness}
                    onChange={(value) => setSelectedThickness(value as '28' | '20')}
                    options={thicknessOptions}
                    columns={2}
                  />
                </PanelSection>

                <PanelSection title="Mediena">
                  <ToggleButtons value={selectedWood} onChange={setSelectedWood} options={woodOptions} columns={3} />
                </PanelSection>

                <PanelSection title="Spalva">
                  <ToggleButtons value={selectedColor} onChange={setSelectedColor} options={colorOptions} columns={2} />
                </PanelSection>

                <PanelSection title="Plotis">
                  <ToggleButtons value={selectedWidth} onChange={setSelectedWidth} options={widthOptions} columns={3} />
                </PanelSection>

                <PanelSection title="Ilgis">
                  <ToggleButtons value={selectedLength} onChange={setSelectedLength} options={lengthOptions} columns={3} />
                </PanelSection>

                {filteredProducts.length > 1 && (
                  <PanelSection title="Produktas">
                    <div className="grid grid-cols-1 gap-1.5">
                      {filteredProducts.map((item) => {
                        const itemName = currentLocale === 'en' && item.nameEn ? item.nameEn : item.name;
                        const active = selectedProductId === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setSelectedProductId(item.id);
                              setProduct(item);
                            }}
                            className={`h-[30px] rounded-[4px] px-2 font-['Outfit'] text-[12px] text-left border ${
                              active
                                ? 'bg-[#161616] border-[#161616] text-white'
                                : 'bg-[#F9F9F9] border-[#BBBBBB] text-[#161616]'
                            }`}
                          >
                            {itemName}
                          </button>
                        );
                      })}
                    </div>
                  </PanelSection>
                )}

                <PanelSection title="Matmenys">
                  <div className="space-y-1 font-['Outfit'] text-[12px] text-[#535353]">
                    <p>Ilgis: {selectedLength} mm</p>
                    <p>Plotis: {selectedWidth} mm</p>
                    <p>Storis: {selectedThickness === '20' ? '18/20 mm' : '28 mm'}</p>
                    {selectedProductName ? <p className="text-[#7C7C7C]">{selectedProductName}</p> : null}
                  </div>
                </PanelSection>

                <PanelSection title={t('configurator.pricingTitle')}>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setInputMode('boards');
                          if (quote?.quantityBoards) setQuantityBoards(quote.quantityBoards);
                        }}
                        className={`h-[30px] rounded-[4px] px-3 font-['Outfit'] text-[12px] border ${
                          inputMode === 'boards'
                            ? 'bg-[#161616] border-[#161616] text-white'
                            : 'bg-[#F9F9F9] border-[#BBBBBB] text-[#161616]'
                        }`}
                      >
                        {t('configurator.inputModeBoards')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setInputMode('area');
                          if (quote?.totalAreaM2) setTargetAreaM2(Number(quote.totalAreaM2.toFixed(2)));
                        }}
                        className={`h-[30px] rounded-[4px] px-3 font-['Outfit'] text-[12px] border ${
                          inputMode === 'area'
                            ? 'bg-[#161616] border-[#161616] text-white'
                            : 'bg-[#F9F9F9] border-[#BBBBBB] text-[#161616]'
                        }`}
                      >
                        {t('configurator.inputModeArea')}
                      </button>
                    </div>

                    {inputMode === 'boards' ? (
                      <label className="block">
                        <span className="block font-['Outfit'] text-[12px] text-[#535353] mb-1">{t('configurator.quantityBoardsLabel')}</span>
                        <input
                          type="number"
                          min={1}
                          step={1}
                          value={quantityBoards}
                          onChange={(e) => setQuantityBoards(Math.max(1, Math.round(Number(e.target.value) || 1)))}
                          className="w-full h-[32px] px-2 rounded-[8px] border border-[#BBBBBB] bg-white font-['Outfit'] text-[12px] text-[#161616]"
                        />
                      </label>
                    ) : (
                      <label className="block">
                        <span className="block font-['Outfit'] text-[12px] text-[#535353] mb-1">{t('configurator.targetAreaLabel')}</span>
                        <input
                          type="number"
                          min={0.01}
                          step={0.01}
                          value={targetAreaM2}
                          onChange={(e) => setTargetAreaM2(Math.max(0.01, Number(e.target.value) || 0.01))}
                          className="w-full h-[32px] px-2 rounded-[8px] border border-[#BBBBBB] bg-white font-['Outfit'] text-[12px] text-[#161616]"
                        />
                      </label>
                    )}

                    {quoteError && !quoteLoading && <p className="font-['Outfit'] text-[12px] text-[#FFB3B3]">{quoteError}</p>}

                    <div className="flex items-center justify-between rounded-[8px] border border-[#BBBBBB] bg-[#F9F9F9] px-2 py-1.5">
                      <span className="font-['Outfit'] text-[12px] text-[#535353]">{t('configurator.lineTotalLabel')}</span>
                      <span className="font-['Outfit'] text-[12px] text-[#161616]">
                        {typeof displayLineTotal === 'number' && Number.isFinite(displayLineTotal)
                          ? currency.format(displayLineTotal)
                          : '-'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      disabled={pdfLoading || !selectedColorVariant || !selectedFinishVariant}
                      className="h-[36px] rounded-[100px] px-3 font-['DM_Sans'] text-[13px] border border-[#161616] bg-[#161616] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {pdfLoading ? t('configurator.downloadingPdf') : t('configurator.downloadPdf')}
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(false)}
                        disabled={!selectedColorVariant || !selectedFinishVariant || quoteLoading || !!quoteError}
                        className="h-[36px] rounded-[100px] px-3 font-['DM_Sans'] text-[13px] border border-[#161616] bg-white text-[#161616] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t('configurator.addToCart')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(true)}
                        disabled={!selectedColorVariant || !selectedFinishVariant || quoteLoading || !!quoteError}
                        className="h-[36px] rounded-[100px] px-3 font-['DM_Sans'] text-[13px] border border-[#161616] bg-[#161616] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {buyNowLabel}
                      </button>
                    </div>
                  </div>
                </PanelSection>
              </aside>
            </div>
          )}
        </PageSection>
      </InView>
    </main>
  );
}
