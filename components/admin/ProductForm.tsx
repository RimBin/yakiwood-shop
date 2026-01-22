'use client';

import { useState, useEffect, useMemo, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';
import { USAGE_TYPES } from '@/types/admin';
import { buildInventorySku } from '@/lib/inventory/sku';
import { useLocale, useTranslations } from 'next-intl';
import { toLocalePath, type AppLocale } from '@/i18n/paths';

const ALLOWED_USAGE_TYPES = ['facade', 'terrace'] as const;
const ALLOWED_WOOD_TYPES = ['spruce', 'larch'] as const;

const WIDTH_OPTIONS_MM = [95, 120, 145] as const;
const LENGTH_OPTIONS_MM = [3000, 3300, 3600] as const;

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildLtProductName(usageType: string, woodType: string): string {
  const usageLt = usageType === 'terrace' ? 'Terasinė lenta' : 'Fasadinė dailylentė';
  const woodLt = woodType === 'larch' ? 'Maumedis' : 'Eglė';
  return `${usageLt} / ${woodLt}`;
}

function buildEnProductName(usageType: string, woodType: string): string {
  const usageEn = usageType === 'terrace' ? 'Terrace board' : 'Facade cladding';
  const woodEn = woodType === 'larch' ? 'Larch' : 'Spruce';
  return `${usageEn} / ${woodEn}`;
}

function buildEnProductSlug(usageType: string, woodType: string): string {
  return slugify(buildEnProductName(usageType, woodType));
}

function buildLtProductSlug(usageType: string, woodType: string): string {
  return slugify(buildLtProductName(usageType, woodType));
}

function woodLtFromType(woodType: string): string {
  return woodType === 'larch' ? 'Maumedis' : 'Eglė';
}

function woodEnFromType(woodType: string): string {
  return woodType === 'larch' ? 'Larch' : 'Spruce';
}

function buildLtSlugFromNameAndWood(name: string, woodType: string): string {
  const wood = woodLtFromType(woodType);
  const normalizedName = (name || '').toLowerCase();
  const normalizedWood = wood.toLowerCase();
  const base = normalizedName.includes(normalizedWood) ? name : `${name} ${wood}`;
  return slugify(base);
}

function buildEnSlugFromNameAndWood(name: string, woodType: string): string {
  const wood = woodEnFromType(woodType);
  const normalizedName = (name || '').toLowerCase();
  const normalizedWood = wood.toLowerCase();
  const base = normalizedName.includes(normalizedWood) ? name : `${name} ${wood}`;
  return slugify(base);
}

function buildStockItemSlug(baseSlug: string, profile: string, color: string, width: number, length: number): string {
  return `${baseSlug}--${slugify(profile)}--${slugify(color)}--${width}x${length}`;
}

function formatUnknownError(error: unknown): string {
  if (!error) return '<no error details>';
  if (error instanceof Error) return error.message || error.name;
  if (typeof error === 'string') return error;

  if (typeof error === 'object') {
    const record = error as Record<string, unknown>;
    const message = typeof record.message === 'string' ? record.message : null;
    const code = typeof record.code === 'string' ? record.code : null;
    const details = typeof record.details === 'string' ? record.details : null;
    const hint = typeof record.hint === 'string' ? record.hint : null;

    const parts = [
      message,
      code ? `code=${code}` : null,
      details ? `details=${details}` : null,
      hint ? `hint=${hint}` : null,
    ].filter(Boolean);

    if (parts.length > 0) return parts.join(' | ');

    try {
      const keys = Object.getOwnPropertyNames(error);
      const picked: Record<string, unknown> = {};
      for (const key of keys) picked[key] = (error as Record<string, unknown>)[key];
      const json = JSON.stringify(picked);
      return json === '{}' ? '[object]' : json;
    } catch {
      return '[object]';
    }
  }

  return String(error);
}

function normalizeNumberInput(input: string): string {
  return input.replace(',', '.');
}

function parseRequiredNumber(input: string): number | undefined | null {
  const trimmed = (input || '').trim();
  if (!trimmed) return undefined;
  const n = Number(normalizeNumberInput(trimmed));
  return Number.isFinite(n) ? n : null;
}

function parseOptionalInteger(input: string): number | undefined | null {
  const trimmed = (input || '').trim();
  if (!trimmed) return undefined;
  const n = Number(normalizeNumberInput(trimmed));
  if (!Number.isFinite(n)) return null;
  if (!Number.isInteger(n)) return null;
  return n;
}

function isMissingColumnError(message: string, column: string): boolean {
  if (!message) return false;
  const escaped = column.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  return (
    new RegExp(`could not find the '\\s*${escaped}\\s*' column`, 'i').test(message) ||
    new RegExp(`column\\s+products\\.${escaped}\\s+does not exist`, 'i').test(message) ||
    (new RegExp(escaped, 'i').test(message) && /schema cache/i.test(message))
  );
}

function isRlsOrPermissionError(message: string): boolean {
  if (!message) return false;
  return (
    /row-level security/i.test(message) ||
    /violates row-level security/i.test(message) ||
    /new row violates row-level security policy/i.test(message) ||
    /permission denied/i.test(message) ||
    /not allowed/i.test(message)
  );
}

function inferUniqueFieldFromError(message: string): 'slug' | 'slug_en' | 'sku' | null {
  if (!message) return null;
  // Postgres details often look like: Key (slug)=(...) already exists.
  if (/key\s*\(\s*slug\s*\)\s*=\s*\(/i.test(message)) return 'slug';
  if (/key\s*\(\s*slug_en\s*\)\s*=\s*\(/i.test(message)) return 'slug_en';
  if (/key\s*\(\s*sku\s*\)\s*=\s*\(/i.test(message)) return 'sku';

  // Fallback to constraint names when available.
  if (/products_slug(_idx|_key|_unique)?/i.test(message) || /slug\s+unique/i.test(message)) return 'slug';
  if (/products_slug_en/i.test(message)) return 'slug_en';
  if (/products_sku/i.test(message)) return 'sku';
  return null;
}

function createProductSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(1, t('validation.nameRequired')),
    name_en: z.string().optional(),
    slug: z
      .string()
      .min(1, t('validation.slugRequired'))
      .regex(/^[a-z0-9-]+$/, t('validation.slugFormat')),
    slug_en: z
      .string()
      .min(1, t('validation.slugRequired'))
      .regex(/^[a-z0-9-]+$/, t('validation.slugFormat')),
    description: z.string().optional(),
    description_en: z.string().optional(),
    usage_type: z
      .string()
      .min(1, t('validation.usageRequired'))
      .refine((v) => (ALLOWED_USAGE_TYPES as readonly string[]).includes(v), t('validation.usageInvalid')),
    wood_type: z
      .string()
      .min(1, t('validation.woodRequired'))
      .refine((v) => (ALLOWED_WOOD_TYPES as readonly string[]).includes(v), t('validation.woodInvalid')),
    base_price: z.number({ message: t('validation.basePriceNumber') }).min(0, t('validation.basePricePositive')),
    status: z.enum(['draft', 'published']),
    stock_quantity: z
      .number({ message: t('validation.integerExpected') })
      .int(t('validation.integerExpected'))
      .min(0, t('validation.numberMinZero'))
      .optional(),
    sku: z.string().optional(),
    width: z.number({ message: t('validation.numberExpected') }),
    height: z.number({ message: t('validation.numberExpected') }),
    depth: z.number({ message: t('validation.numberExpected') }),
  });
}

const PROFILE_LABELS_LT: Record<string, string> = {
  'half-taper-45': 'Pusė špunto 45°',
  'half-taper': 'Pusė špunto',
  rhombus: 'Rombas',
  rectangle: 'Stačiakampis',
};

function resolveProfileLabel(
  code: string,
  labelLt: string | undefined,
  labelEn: string | undefined,
  locale: 'lt' | 'en'
): string {
  if (locale === 'lt') {
    return labelLt || PROFILE_LABELS_LT[code] || labelEn || code;
  }
  return labelEn || code || labelLt || PROFILE_LABELS_LT[code] || code;
}

interface Variant {
  id?: string;
  name: string;
  variant_type: 'color' | 'finish' | 'profile';
  hex_color?: string;
  image_url?: string;
  price_adjustment?: number;
  description?: string;
  is_available: boolean;
  tempId?: string;
}

interface VariantDraft {
  id: string;
  profile: string;
  color: string;
  widthMm: number;
  lengthMm: number;
  price: string;
  imageUrl: string;
  sku: string;
  slug: string;
}

interface VariantProductEdit {
  sku: string;
  base_price: string;
  sale_price: string;
  stock_quantity: string;
  is_active: boolean;
}

interface ProductData {
  id?: string;
  name: string;
  name_en?: string;
  slug: string;
  slug_en?: string;
  description?: string;
  description_en?: string;
  category: string;
  usage_type?: string;
  wood_type: string;
  base_price: number;
  is_active: boolean;
  stock_quantity?: number;
  sku?: string;
  width?: number;
  height?: number;
  depth?: number;
  weight?: number;
  image_url?: string;
  variants?: Variant[];
}

interface Props {
  product?: ProductData;
  mode: 'create' | 'edit';
}

const CATEGORIES = [
  { value: 'cladding', label: 'Fasadai' },
  { value: 'decking', label: 'Lentos' },
  { value: 'interior', label: 'Interjeras' },
  { value: 'tiles', label: 'Plytelės' },
];

const WOOD_TYPES = [
  { value: 'spruce', label: 'Eglė' },
  { value: 'larch', label: 'Maumedis' },
];

const deriveCategoryFromUsage = (usageType: string) => {
  if (usageType === 'terrace') return 'decking';
  // default to facade/cladding
  return 'cladding';
};

const getThicknessValueForUsage = (usageType: string) => {
  if (usageType === 'terrace') return '28';
  if (usageType === 'facade') return '18';
  return '';
};

export default function ProductForm({ product, mode }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const locale = useLocale() as AppLocale;
  const t = useTranslations('admin.products.form');

  async function getAdminToken(): Promise<string | null> {
    if (!supabase) return null;
    const { data } = await supabase!.auth.getSession();
    return data.session?.access_token ?? null;
  }

  async function adminRequest<T>(input: RequestInfo | URL, init: RequestInit = {}): Promise<T> {
    const token = await getAdminToken();
    if (!token) throw new Error('Missing admin token');

    const headers = new Headers(init.headers);
    headers.set('authorization', `Bearer ${token}`);
    if (init.body && !headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }

    const response = await fetch(input, { ...init, headers });
    let payload: any = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const msg = payload?.error || `Request failed (${response.status})`;
      throw new Error(String(msg));
    }

    return payload as T;
  }

  const catalogMigrationPath = 'supabase/migrations/20260111_catalog_options_assets_sale_thickness.sql';
  const slugEnMigrationPath = 'supabase/migrations/20260113_add_products_slug_en.sql';
  const dimensionsMigrationPath = 'supabase/migrations/20260121_add_product_dimensions.sql';

  // Form state
  const [name, setName] = useState(product?.name || '');
  const [isNameManuallyEdited, setIsNameManuallyEdited] = useState(mode === 'edit');
  const [nameEn, setNameEn] = useState(product?.name_en || '');
  const [isNameEnManuallyEdited, setIsNameEnManuallyEdited] = useState(mode === 'edit');
  const [slug, setSlug] = useState(product?.slug || '');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [slugEn, setSlugEn] = useState((product as any)?.slug_en || '');
  const [isSlugEnManuallyEdited, setIsSlugEnManuallyEdited] = useState(false);
  const [description, setDescription] = useState(product?.description || '');
  const [descriptionEn, setDescriptionEn] = useState(product?.description_en || '');
  const [usageType, setUsageType] = useState(() => {
    const initial = product?.usage_type || (mode === 'create' ? 'facade' : '');
    return ALLOWED_USAGE_TYPES.includes(initial as any) ? initial : (mode === 'create' ? 'facade' : '');
  });
  const [woodType, setWoodType] = useState(() => {
    const initial = product?.wood_type || (mode === 'create' ? 'spruce' : '');
    return ALLOWED_WOOD_TYPES.includes(initial as any) ? initial : (mode === 'create' ? 'spruce' : '');
  });
  const [basePrice, setBasePrice] = useState(product?.base_price.toString() || '');
  const [status, setStatus] = useState<'draft' | 'published'>(() => {
    if (product) return product.is_active ? 'published' : 'draft'
    return mode === 'create' ? 'published' : 'draft'
  });
  const [stockQuantity, setStockQuantity] = useState(product?.stock_quantity?.toString() || '');
  const [sku, setSku] = useState(product?.sku || '');
  const [width, setWidth] = useState(() => (product?.width?.toString() || (mode === 'create' ? String(WIDTH_OPTIONS_MM[0]) : '')));
  const [height, setHeight] = useState(() => {
    const existing = product?.height?.toString() || '';
    if (existing) return existing;
    return mode === 'create' ? getThicknessValueForUsage(product?.usage_type || 'facade') : '';
  });
  const [depth, setDepth] = useState(() => (product?.depth?.toString() || (mode === 'create' ? String(LENGTH_OPTIONS_MM[0]) : '')));
  const [imageUrl, setImageUrl] = useState(product?.image_url || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url || null);

  // Global photo library selection (product_assets where product_id IS NULL)
  const [showPhotoLibrary, setShowPhotoLibrary] = useState(false);
  const [libraryWoodType, setLibraryWoodType] = useState<string>('spruce');
  const [libraryColorCode, setLibraryColorCode] = useState<string>('');
  const [libraryColors, setLibraryColors] = useState<Array<{ code: string; label: string }>>([]);
  const [libraryAssets, setLibraryAssets] = useState<Array<{ id: string; url: string; wood_type: string | null }>>(
    []
  );
  const [libraryIsLoading, setLibraryIsLoading] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [activeColorLibrary, setActiveColorLibrary] = useState<string | null>(null);

  const isMissingCatalogSchemaError = (message: string | null) => {
    if (!message) return false;
    return (
      /could not find the table\s+'public\.catalog_options'\s+in the schema cache/i.test(message) ||
      /could not find the table\s+'public\.product_assets'\s+in the schema cache/i.test(message) ||
      /relation\s+"public\.catalog_options"\s+does not exist/i.test(message) ||
      /relation\s+"public\.product_assets"\s+does not exist/i.test(message) ||
      /schema cache/i.test(message)
    );
  };

  // Variants state
  const [variants, setVariants] = useState<Variant[]>(product?.variants || []);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [catalogColorOptions, setCatalogColorOptions] = useState<Array<{ code: string; label: string; hex?: string }>>([]);
  const [catalogProfileOptions, setCatalogProfileOptions] = useState<Array<{ code: string; label: string }>>([]);

  const colorVariantOptions = useMemo(() => {
    const names = variants
      .filter((v) => v.variant_type === 'color')
      .map((v) => v.name)
      .filter((v) => !!v?.trim());
    return Array.from(new Set(names));
  }, [variants]);

  const profileVariantOptions = useMemo(() => {
    const names = variants
      .filter((v) => v.variant_type === 'profile' || v.variant_type === 'finish')
      .map((v) => v.name)
      .filter((v) => !!v?.trim());
    return Array.from(new Set(names));
  }, [variants]);

  const availableColorOptions = useMemo(() => {
    if (colorVariantOptions.length > 0) {
      return colorVariantOptions.map((code) => ({ code, label: code }));
    }
    return catalogColorOptions;
  }, [colorVariantOptions, catalogColorOptions]);

  const baseProfileOptions = useMemo(() => {
    if (profileVariantOptions.length > 0) {
      return profileVariantOptions.map((code) => ({ code, label: code }));
    }
    return catalogProfileOptions;
  }, [profileVariantOptions, catalogProfileOptions]);

  const allowedProfileOptions = useMemo(() => {
    if (usageType === 'terrace') {
      const rectangle = baseProfileOptions.filter((option) => option.code === 'rectangle');
      return rectangle.length > 0 ? rectangle : baseProfileOptions;
    }
    if (usageType === 'facade') {
      const filtered = baseProfileOptions.filter((option) => option.code !== 'rectangle');
      return filtered.length > 0 ? filtered : baseProfileOptions;
    }
    return baseProfileOptions;
  }, [baseProfileOptions, usageType]);

  const [selectedVariantColors, setSelectedVariantColors] = useState<string[]>([]);
  const [selectedVariantProfiles, setSelectedVariantProfiles] = useState<string[]>([]);
  const [selectedVariantWidths, setSelectedVariantWidths] = useState<number[]>([]);
  const [selectedVariantLengths, setSelectedVariantLengths] = useState<number[]>([]);
  const [variantColorImages, setVariantColorImages] = useState<Record<string, string>>({});
  const [variantDrafts, setVariantDrafts] = useState<VariantDraft[]>([]);
  const [variantGeneratorError, setVariantGeneratorError] = useState<string | null>(null);
  const [isCreatingVariants, setIsCreatingVariants] = useState(false);
  const [variantDiscountType, setVariantDiscountType] = useState<'none' | 'percent' | 'amount'>('none');
  const [variantDiscountValue, setVariantDiscountValue] = useState('');
  const [variantProducts, setVariantProducts] = useState<Array<any>>([]);
  const [variantProductsLoading, setVariantProductsLoading] = useState(false);
  const [variantProductsError, setVariantProductsError] = useState<string | null>(null);
  const [bulkVariantPrice, setBulkVariantPrice] = useState('');
  const [bulkVariantPriceError, setBulkVariantPriceError] = useState<string | null>(null);
  const [bulkVariantPriceSaving, setBulkVariantPriceSaving] = useState(false);
  const [expandedVariantId, setExpandedVariantId] = useState<string | null>(null);
  const [variantEditValues, setVariantEditValues] = useState<Record<string, VariantProductEdit>>({});
  const [variantEditErrors, setVariantEditErrors] = useState<Record<string, string>>({});
  const [variantEditSaving, setVariantEditSaving] = useState(false);

  useEffect(() => {
    if (selectedVariantColors.length === 0 && availableColorOptions.length > 0) {
      setSelectedVariantColors(availableColorOptions.map((option) => option.code));
    }
  }, [availableColorOptions, selectedVariantColors.length]);

  useEffect(() => {
    if (availableColorOptions.length === 0) return;
    setVariantColorImages((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const color of availableColorOptions) {
        if (next[color.code] === undefined) {
          const matched = variants.find((variant) => variant.variant_type === 'color' && variant.name === color.code);
          next[color.code] = matched?.image_url || imageUrl || '';
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [availableColorOptions, imageUrl, variants]);

  useEffect(() => {
    if (!supabase) return;
    let isMounted = true;

    const loadCatalogOptions = async () => {
      try {
        const [colorsRes, profilesRes] = await Promise.all([
          supabase
            .from('catalog_options')
            .select('value_text,label_lt,label_en,hex_color,sort_order,is_active')
            .eq('option_type', 'color')
            .eq('is_active', true)
            .order('sort_order', { ascending: true, nullsFirst: true }),
          supabase
            .from('catalog_options')
            .select('value_text,label_lt,label_en,sort_order,is_active')
            .eq('option_type', 'profile')
            .eq('is_active', true)
            .order('sort_order', { ascending: true, nullsFirst: true }),
        ]);

        if (!isMounted) return;

        if (!colorsRes.error) {
          const normalized = (colorsRes.data || [])
            .map((row: any) => {
              const code = (row.value_text as string | null) ?? '';
              const labelEn = (row.label_en as string | null) || undefined;
              const labelLt = (row.label_lt as string | null) || undefined;
              const label = labelEn || code || labelLt;
              return { code, label, hex: (row.hex_color as string | null) ?? undefined };
            })
            .filter((x) => x.code);
          setCatalogColorOptions(normalized);
        }

        if (!profilesRes.error) {
          const normalized = (profilesRes.data || [])
            .map((row: any) => {
              const code = (row.value_text as string | null) ?? '';
              const labelEn = (row.label_en as string | null) || undefined;
              const labelLt = (row.label_lt as string | null) || undefined;
              const label = resolveProfileLabel(code, labelLt, labelEn, locale as 'lt' | 'en');
              return { code, label };
            })
            .filter((x) => x.code);
          setCatalogProfileOptions(normalized);
        }
      } catch {
        // ignore catalog load failures; variants can still be added manually
      }
    };

    if (colorVariantOptions.length === 0 || profileVariantOptions.length === 0) {
      void loadCatalogOptions();
    }

    return () => {
      isMounted = false;
    };
  }, [supabase, locale, colorVariantOptions.length, profileVariantOptions.length]);

  useEffect(() => {
    if (!supabase || mode !== 'edit' || !product?.id) return;
    const baseSlug = product?.slug || slug;
    if (!baseSlug) return;
    let isMounted = true;
    const loadVariantProducts = async () => {
      setVariantProductsLoading(true);
      setVariantProductsError(null);
      const { data, error } = await supabase
        .from('products')
        .select('id,name,slug,sku,stock_quantity,base_price,sale_price,is_active')
        .ilike('slug', `${baseSlug}-%`)
        .neq('id', product.id)
        .order('slug', { ascending: true });

      if (!isMounted) return;
      if (error) {
        setVariantProductsError(formatUnknownError(error));
        setVariantProducts([]);
      } else {
        setVariantProducts(Array.isArray(data) ? data : []);
      }
      setVariantProductsLoading(false);
    };

    loadVariantProducts();
    return () => {
      isMounted = false;
    };
  }, [mode, product?.id, product?.slug, slug, supabase]);

  const ensureVariantEditValues = (item: any) => {
    if (variantEditValues[item.id]) return;
    setVariantEditValues((prev) => ({
      ...prev,
      [item.id]: {
        sku: item.sku ?? '',
        base_price: typeof item.base_price === 'number' ? String(item.base_price) : '',
        sale_price: typeof item.sale_price === 'number' ? String(item.sale_price) : '',
        stock_quantity: typeof item.stock_quantity === 'number' ? String(item.stock_quantity) : '0',
        is_active: Boolean(item.is_active),
      },
    }));
  };

  const toggleVariantAccordion = (item: any) => {
    if (expandedVariantId === item.id) {
      setExpandedVariantId(null);
      return;
    }
    ensureVariantEditValues(item);
    setExpandedVariantId(item.id);
  };

  const updateVariantEditValue = (id: string, patch: Partial<VariantProductEdit>) => {
    setVariantEditValues((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), ...patch },
    }));
  };

  const parseNumber = (value: string) => {
    const normalized = value.replace(',', '.');
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const computeDiscountPercent = (base?: number | null, sale?: number | null) => {
    if (!base || !sale) return null;
    if (!Number.isFinite(base) || !Number.isFinite(sale) || base <= 0) return null;
    if (sale >= base) return null;
    const raw = ((base - sale) / base) * 100;
    return raw < 0 ? null : raw;
  };

  const formatPercent = (value: number) => {
    const rounded = Math.round(value * 100) / 100;
    return rounded.toFixed(2).replace(/\.00$/, '');
  };

  const applyDiscountPercent = (baseValue: string, percentValue: string) => {
    const base = parseNumber(baseValue);
    const percent = parseNumber(percentValue);
    if (!base || !percent || percent <= 0) return '';
    const clamped = Math.min(percent, 99.99);
    const sale = base * (1 - clamped / 100);
    return sale.toFixed(2);
  };

  const handleSaveVariantEdit = async (id: string) => {
    if (!supabase) return;
    const values = variantEditValues[id];
    if (!values) return;
    setVariantEditSaving(true);
    setVariantEditErrors((prev) => ({ ...prev, [id]: '' }));

    const basePriceValue = values.base_price.trim() === '' ? null : Number.parseFloat(values.base_price);
    const salePriceValue = values.sale_price.trim() === '' ? null : Number.parseFloat(values.sale_price);
    const stockValue = values.stock_quantity.trim() === '' ? null : Number.parseInt(values.stock_quantity, 10);

    const payload = {
      sku: values.sku.trim() || null,
      base_price: Number.isFinite(basePriceValue as number) ? basePriceValue : null,
      sale_price: Number.isFinite(salePriceValue as number) ? salePriceValue : null,
      stock_quantity: Number.isFinite(stockValue as number) ? stockValue : null,
      is_active: values.is_active,
    };

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .select('id,name,slug,sku,stock_quantity,base_price,sale_price,is_active')
      .single();

    if (error) {
      setVariantEditErrors((prev) => ({ ...prev, [id]: formatUnknownError(error) }));
      setVariantEditSaving(false);
      return;
    }

    setVariantProducts((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)));
    setVariantEditSaving(false);
  };

  const handleApplyPriceToAllVariants = async () => {
    if (!supabase) return;
    if (variantProducts.length === 0) return;

    const raw = bulkVariantPrice.trim().replace(',', '.');
    const value = Number.parseFloat(raw);
    if (!Number.isFinite(value) || value < 0) {
      setBulkVariantPriceError('Įveskite teisingą kainą.');
      return;
    }

    setBulkVariantPriceError(null);
    setBulkVariantPriceSaving(true);

    const ids = variantProducts.map((item) => item.id).filter(Boolean);
    const { data, error } = await supabase
      .from('products')
      .update({ base_price: value })
      .in('id', ids)
      .select('id,name,slug,sku,stock_quantity,base_price,sale_price,is_active');

    if (error) {
      setBulkVariantPriceError(formatUnknownError(error));
      setBulkVariantPriceSaving(false);
      return;
    }

    if (Array.isArray(data)) {
      setVariantProducts((prev) =>
        prev.map((item) => {
          const updated = data.find((row: any) => row.id === item.id);
          return updated ? { ...item, ...updated } : item;
        })
      );

      setVariantEditValues((prev) => {
        const next = { ...prev };
        for (const item of variantProducts) {
          next[item.id] = {
            ...(next[item.id] || {}),
            base_price: value.toFixed(2),
          };
        }
        return next;
      });
    }

    setBulkVariantPriceSaving(false);
  };

  useEffect(() => {
    if (selectedVariantProfiles.length === 0 && allowedProfileOptions.length > 0) {
      setSelectedVariantProfiles(allowedProfileOptions.map((option) => option.code));
    }
  }, [allowedProfileOptions, selectedVariantProfiles.length]);

  useEffect(() => {
    if (selectedVariantProfiles.length === 0) return;
    const allowed = new Set(allowedProfileOptions.map((option) => option.code));
    const next = selectedVariantProfiles.filter((p) => allowed.has(p));
    if (next.length === selectedVariantProfiles.length) return;
    setSelectedVariantProfiles(next.length > 0 ? next : allowedProfileOptions.map((option) => option.code));
  }, [allowedProfileOptions, selectedVariantProfiles]);

  useEffect(() => {
    if (selectedVariantWidths.length === 0) setSelectedVariantWidths([...WIDTH_OPTIONS_MM]);
  }, [selectedVariantWidths.length]);

  useEffect(() => {
    if (selectedVariantLengths.length === 0) setSelectedVariantLengths([...LENGTH_OPTIONS_MM]);
  }, [selectedVariantLengths.length]);

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const lockBaseFields = false;

  // Auto-generate slugs only (names remain manual).
  // Stops per-field once user edits it manually (unless they clear it).
  useEffect(() => {
    const usageOk = ALLOWED_USAGE_TYPES.includes(usageType as any);
    const woodOk = ALLOWED_WOOD_TYPES.includes(woodType as any);
    if (!usageOk || !woodOk) return;

    if (!isSlugManuallyEdited) {
      const baseName = name?.trim() || buildLtProductName(usageType, woodType);
      const nextLt = buildLtSlugFromNameAndWood(baseName, woodType);
      if (nextLt && nextLt !== slug) setSlug(nextLt);
    }

    if (!isSlugEnManuallyEdited) {
      const baseNameEn = nameEn?.trim() || buildEnProductName(usageType, woodType);
      const nextEn = buildEnSlugFromNameAndWood(baseNameEn, woodType);
      if (nextEn && nextEn !== slugEn) setSlugEn(nextEn);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usageType, woodType, variants, isSlugManuallyEdited, isSlugEnManuallyEdited, slug, slugEn, name, nameEn]);

  // Keep derived fields in sync
  useEffect(() => {
    // Ensure thickness matches usage
    const thickness = getThicknessValueForUsage(usageType);
    if (thickness && height !== thickness) {
      setHeight(thickness);
    }

    // Ensure width/length defaults exist
    if (!width) setWidth(String(WIDTH_OPTIONS_MM[0]));
    if (!depth) setDepth(String(LENGTH_OPTIONS_MM[0]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usageType]);

  useEffect(() => {
    if (!supabase) return;
    if (!showPhotoLibrary) return;
    void loadLibraryColors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPhotoLibrary]);

  useEffect(() => {
    if (!supabase) return;
    if (!showPhotoLibrary) return;
    if (!libraryColorCode) return;
    void loadLibraryAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPhotoLibrary, libraryWoodType, libraryColorCode]);

  if (!supabase) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-10 py-8">
        <h1 className="font-['DM_Sans'] text-2xl font-medium text-[#161616]">
          Supabase is not configured
        </h1>
        <p className="font-['Outfit'] text-sm text-[#535353] mt-2">
          Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
        </p>
      </div>
    );
  }

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageUrl('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const chooseLibraryImage = (url: string) => {
    setImageUrl(url);
    setImageFile(null);
    setImagePreview(url);
  };

  const chooseColorLibraryImage = (color: string, url: string) => {
    updateColorImage(color, url);
    setActiveColorLibrary(null);
  };

  const clearImageSelection = () => {
    setImageUrl('');
    setImageFile(null);
    setImagePreview(null);
  };

  const loadLibraryColors = async () => {
    if (!supabase) return;
    setLibraryError(null);
    const { data, error } = await supabase
      .from('catalog_options')
      .select('value_text,label_lt,label_en,is_active,sort_order')
      .eq('option_type', 'color')
      .eq('is_active', true)
      .order('sort_order', { ascending: true, nullsFirst: true });

    if (error) {
      setLibraryError(error.message);
      return;
    }

    const normalized = (data || [])
      .map((row: any) => {
        const code = (row.value_text as string | null) ?? '';
        const labelEn = (row.label_en as string | null) || undefined;
        const labelLt = (row.label_lt as string | null) || undefined;
        const label = labelEn || code || labelLt;
        return { code, label };
      })
      .filter((x) => x.code);

    setLibraryColors(normalized);
    if (!libraryColorCode && normalized.length > 0) {
      setLibraryColorCode(normalized[0]!.code);
    }
  };

  const loadLibraryAssets = async (opts?: { woodType?: string; colorCode?: string }) => {
    if (!supabase) return;
    const woodType = opts?.woodType ?? libraryWoodType;
    const colorCode = opts?.colorCode ?? libraryColorCode;
    if (!colorCode) return;

    setLibraryIsLoading(true);
    setLibraryError(null);
    try {
      // Show both exact wood match + global (wood_type IS NULL) as fallback.
      const { data, error } = await supabase
        .from('product_assets')
        .select('id,url,wood_type')
        .eq('asset_type', 'photo')
        .is('product_id', null)
        .eq('color_code', colorCode)
        .in('wood_type', [woodType, null])
        .order('created_at', { ascending: false });

      if (error) {
        setLibraryError(error.message);
        return;
      }

      const rows = (data as any[] | null) ?? [];
      // Prefer exact wood_type first, then NULL.
      rows.sort((a, b) => {
        const aw = a.wood_type ? 0 : 1;
        const bw = b.wood_type ? 0 : 1;
        return aw - bw;
      });
      setLibraryAssets(rows.map((r) => ({ id: r.id as string, url: r.url as string, wood_type: (r.wood_type as string | null) ?? null })));
    } finally {
      setLibraryIsLoading(false);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    try {
      const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const base = (slug || name || 'product')
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const fileName = `${base}-${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from('product-images').upload(fileName, imageFile);
      if (error) throw error;

      const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
      return publicUrlData?.publicUrl || null;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const basePriceValue = parseRequiredNumber(basePrice);
    const stockQuantityValue = parseOptionalInteger(stockQuantity);
    const widthValue = parseRequiredNumber(width);
    const heightValue = parseRequiredNumber(height);
    const depthValue = parseRequiredNumber(depth);
    const hasColorVariant = variants.some((variant) => variant.variant_type === 'color' && variant.name?.trim());
    const hasColorSelection = selectedVariantColors.length > 0;

    try {
      const productSchema = createProductSchema((key: string) => t(key as any));

      productSchema.parse({
        name,
        name_en: nameEn || undefined,
        slug,
        slug_en: slugEn,
        description: description || undefined,
        description_en: descriptionEn || undefined,
        usage_type: usageType,
        wood_type: woodType,
        base_price: basePriceValue ?? null,
        status,
        stock_quantity: stockQuantityValue,
        sku: sku || undefined,
        width: widthValue,
        height: heightValue,
        depth: depthValue,
      });

      const nextErrors: Record<string, string> = {};
      if (!hasColorVariant && !hasColorSelection) {
        nextErrors.colorVariants = t('validation.colorRequired');
      }

      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors);
        return false;
      }

      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });

        if (!hasColorVariant && !hasColorSelection) {
          newErrors.colorVariants = t('validation.colorRequired');
        }

        // Prefer a clearer message when the field is simply missing.
        if (basePriceValue === undefined) {
          newErrors.base_price = t('validation.basePriceRequired');
        }
        if (widthValue === undefined) {
          newErrors.width = t('validation.widthRequired');
        }
        if (heightValue === undefined) {
          newErrors.height = t('validation.heightRequired');
        }
        if (depthValue === undefined) {
          newErrors.depth = t('validation.depthRequired');
        }

        setErrors(newErrors);
      }
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveWarning(null);

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const basePriceValue = parseRequiredNumber(basePrice);
      if (basePriceValue === undefined) throw new Error(t('validation.basePriceRequired'));
      if (typeof basePriceValue !== 'number') throw new Error(t('validation.basePriceNumber'));

      const stockQuantityValue = parseOptionalInteger(stockQuantity);
      const widthValue = parseRequiredNumber(width);
      const heightValue = parseRequiredNumber(height);
      const depthValue = parseRequiredNumber(depth);
      const variantsToSave = ensureColorVariants(variants);
      if (variantsToSave !== variants) {
        setVariants(variantsToSave);
      }

      // Upload image if new file selected
      let finalImageUrl = imageUrl;
      if (imageFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      }

      const productData = {
        name,
        name_en: nameEn || null,
        slug,
        slug_en: slugEn || null,
        description: description || null,
        description_en: descriptionEn || null,
        category: deriveCategoryFromUsage(usageType),
        usage_type: usageType || null,
        wood_type: woodType,
        base_price: basePriceValue,
        is_active: status === 'published',
        stock_quantity: typeof stockQuantityValue === 'number' ? stockQuantityValue : null,
        sku: sku || null,
        width: typeof widthValue === 'number' ? widthValue : null,
        height: typeof heightValue === 'number' ? heightValue : null,
        depth: typeof depthValue === 'number' ? depthValue : null,
        image_url: finalImageUrl,
      };

      let productId = product?.id;

      if (mode === 'create') {
        // Create new product
        let data: any = null;
        const { data: initialData, error } = await supabase.from('products').insert(productData).select().single();
        data = initialData as any;

        if (error) {
          const message = formatUnknownError(error);
          const missingSlugEn = isMissingColumnError(message, 'slug_en');
          const missingWidth = isMissingColumnError(message, 'width');
          const missingHeight = isMissingColumnError(message, 'height');
          const missingDepth = isMissingColumnError(message, 'depth');

          if (missingSlugEn || missingWidth || missingHeight || missingDepth) {
            const fallback = { ...(productData as any) };
            if (missingSlugEn) delete fallback.slug_en;
            if (missingWidth) delete fallback.width;
            if (missingHeight) delete fallback.height;
            if (missingDepth) delete fallback.depth;

            const retry = await supabase.from('products').insert(fallback).select().single();
            if (retry.error) throw retry.error;
            data = retry.data as any;

            const warnings: string[] = [];
            if (missingSlugEn) warnings.push(t('errors.slugEnMissing', { path: slugEnMigrationPath } as any));
            if (missingWidth || missingHeight || missingDepth) warnings.push(t('errors.dimensionsMissing', { path: dimensionsMigrationPath } as any));
            if (warnings.length > 0) setSaveWarning(warnings.join('\n'));
          } else {
            throw error;
          }
        }

        productId = (data as any).id;
      } else {
        // Update existing product
        const { error } = await supabase.from('products').update(productData).eq('id', product!.id);

        if (error) {
          const message = formatUnknownError(error);
          const missingSlugEn = isMissingColumnError(message, 'slug_en');
          const missingWidth = isMissingColumnError(message, 'width');
          const missingHeight = isMissingColumnError(message, 'height');
          const missingDepth = isMissingColumnError(message, 'depth');

          if (missingSlugEn || missingWidth || missingHeight || missingDepth) {
            const fallback = { ...(productData as any) };
            if (missingSlugEn) delete fallback.slug_en;
            if (missingWidth) delete fallback.width;
            if (missingHeight) delete fallback.height;
            if (missingDepth) delete fallback.depth;

            const retry = await supabase.from('products').update(fallback).eq('id', product!.id);
            if (retry.error) throw retry.error;

            const warnings: string[] = [];
            if (missingSlugEn) warnings.push(t('errors.slugEnMissing', { path: slugEnMigrationPath } as any));
            if (missingWidth || missingHeight || missingDepth) warnings.push(t('errors.dimensionsMissing', { path: dimensionsMigrationPath } as any));
            if (warnings.length > 0) setSaveWarning(warnings.join('\n'));
          } else {
            throw error;
          }
        }
      }

      // Handle variants
      if (productId) {
        // Delete removed variants
        const existingVariantIds = product?.variants?.map(v => v.id).filter(Boolean) || [];
        const currentVariantIds = variantsToSave.map(v => v.id).filter(Boolean);
        const deletedVariantIds = existingVariantIds.filter(id => !currentVariantIds.includes(id));

        if (deletedVariantIds.length > 0) {
          await supabase
            .from('product_variants')
            .delete()
            .in('id', deletedVariantIds);
        }

        // Update or insert variants
        for (const variant of variantsToSave) {
          const variantData = {
            product_id: productId,
            name: variant.name,
            variant_type: variant.variant_type,
            hex_color: variant.hex_color || null,
            image_url: variant.image_url || null,
            price_adjustment: variant.price_adjustment || 0,
            description: variant.description || null,
            is_available: variant.is_available,
          };

          if (variant.id) {
            // Update existing variant
            await supabase
              .from('product_variants')
              .update(variantData)
              .eq('id', variant.id);
          } else {
            // Insert new variant
            await supabase
              .from('product_variants')
              .insert(variantData);
          }
        }
      }

      router.push(toLocalePath('/admin/products', locale));
      router.refresh();
    } catch (error) {
      const message = formatUnknownError(error);

      const uniqueField = inferUniqueFieldFromError(message);
      if (uniqueField) {
        const nextErrors = { ...errors } as Record<string, string>;
        if (uniqueField === 'slug') nextErrors.slug = t('errors.slugTaken');
        if (uniqueField === 'slug_en') nextErrors.slug_en = t('errors.slugEnTaken');
        if (uniqueField === 'sku') nextErrors.sku = t('errors.skuTaken');
        setErrors(nextErrors);
        setSaveError(null);
        return;
      }

      if (isMissingColumnError(message, 'slug_en')) {
        setSaveError(t('errors.slugEnMissing', { path: slugEnMigrationPath } as any));
      } else if (isMissingColumnError(message, 'width') || isMissingColumnError(message, 'height') || isMissingColumnError(message, 'depth')) {
        setSaveError(t('errors.dimensionsMissing', { path: dimensionsMigrationPath } as any));
      } else if (isMissingColumnError(message, 'sku') || isMissingColumnError(message, 'stock_quantity') || isMissingColumnError(message, 'usage_type')) {
        setSaveError(t('errors.inventoryFieldsMissing', { path: 'supabase/migrations/20260121_add_products_inventory_fields.sql' } as any));
      } else if (isRlsOrPermissionError(message)) {
        setSaveError(t('errors.notAuthorized'));
      } else {
        console.error('Error saving product:', message);
        // Keep UI errors localized; log technical details to console.
        setSaveError(locale === 'lt' ? t('errors.saveFailed') : (message || t('errors.saveFailed')));
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle product deletion
  const handleDelete = async () => {
    if (!product?.id) return;

    setIsSaving(true);
    try {
      // Archive product (soft-delete) via admin API to avoid RLS issues in the browser.
      await adminRequest(`/api/admin/products/${product.id}`, { method: 'DELETE' });

      router.push(toLocalePath('/admin/products', locale));
      router.refresh();
    } catch (error) {
      const message = formatUnknownError(error);
      console.error('Error deleting product:', message);
      setSaveError(locale === 'lt' ? t('errors.deleteFailed') : (message || t('errors.deleteFailed')));
    } finally {
      setIsSaving(false);
      setDeleteModal(false);
    }
  };

  // Variant management
  const addVariant = (variant: Variant) => {
    if (editingVariant) {
      setVariants(variants.map(v => 
        (v.id && v.id === editingVariant.id) || (v.tempId && v.tempId === editingVariant.tempId)
          ? { ...variant, id: v.id }
          : v
      ));
      setEditingVariant(null);
    } else {
      setVariants([...variants, { ...variant, tempId: Date.now().toString() }]);
    }
    setShowVariantForm(false);
  };

  const removeVariant = (variant: Variant) => {
    setVariants(variants.filter(v => 
      (v.id && v.id !== variant.id) && (v.tempId && v.tempId !== variant.tempId)
    ));
  };

  const editVariant = (variant: Variant) => {
    setEditingVariant(variant);
    setShowVariantForm(true);
  };

  const toggleStringSelection = (
    value: string,
    list: string[],
    setter: (next: string[]) => void
  ) => {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const toggleNumberSelection = (
    value: number,
    list: number[],
    setter: (next: number[]) => void
  ) => {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const generateVariantDrafts = () => {
    setVariantGeneratorError(null);

    if (!product?.id) {
      setVariantGeneratorError('Pirma išsaugokite bazinę prekę, tada generuokite variacijas.');
      return;
    }

    if (selectedVariantColors.length === 0 || selectedVariantProfiles.length === 0) {
      setVariantGeneratorError('Pasirinkite bent vieną spalvą ir profilį.');
      return;
    }

    const baseSlug = slug || product.slug || '';
    if (!baseSlug) {
      setVariantGeneratorError('Nėra bazinio slug.');
      return;
    }

    const basePriceValue = Number.parseFloat(basePrice || '0') || 0;
    const discountedPrice = computeDiscountedPrice(basePriceValue);
    const drafts: VariantDraft[] = [];

    for (const profile of selectedVariantProfiles) {
      for (const color of selectedVariantColors) {
        for (const widthMm of selectedVariantWidths) {
          for (const lengthMm of selectedVariantLengths) {
            const slugValue = buildStockItemSlug(baseSlug, profile, color, widthMm, lengthMm);
            const colorImage = variantColorImages[color] ?? imageUrl ?? '';
            drafts.push({
              id: slugValue,
              profile,
              color,
              widthMm,
              lengthMm,
              price: discountedPrice ? String(discountedPrice) : '',
              imageUrl: colorImage,
              sku: buildVariantSku(profile, color, widthMm, lengthMm),
              slug: slugValue,
            });
          }
        }
      }
    }

    setVariantDrafts(drafts);
  };

  const updateVariantDraft = (id: string, patch: Partial<VariantDraft>) => {
    setVariantDrafts((prev) =>
      prev.map((draft) => (draft.id === id ? { ...draft, ...patch } : draft))
    );
  };

  useEffect(() => {
    if (variantDrafts.length === 0) return;
    const basePriceValue = Number.parseFloat(basePrice || '0') || 0;
    const discountedPrice = computeDiscountedPrice(basePriceValue);
    setVariantDrafts((prev) =>
      prev.map((draft) => ({
        ...draft,
        price: discountedPrice ? String(discountedPrice) : '',
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantDiscountType, variantDiscountValue]);

  const updateColorImage = (color: string, value: string) => {
    setVariantColorImages((prev) => ({ ...prev, [color]: value }));
    setVariantDrafts((prev) =>
      prev.map((draft) => (draft.color === color ? { ...draft, imageUrl: value } : draft))
    );
  };

  const computeDiscountedPrice = (base: number): number => {
    if (!Number.isFinite(base)) return 0;
    const raw = Number.parseFloat(variantDiscountValue.replace(',', '.'));
    if (!Number.isFinite(raw) || raw <= 0) return base;
    if (variantDiscountType === 'percent') {
      const next = base * (1 - raw / 100);
      return Math.max(0, Number(next.toFixed(2)));
    }
    if (variantDiscountType === 'amount') {
      const next = base - raw;
      return Math.max(0, Number(next.toFixed(2)));
    }
    return base;
  };

  const buildVariantSku = (profile: string, color: string, widthMm: number, lengthMm: number) => {
    const thicknessMm = parseRequiredNumber(height);
    return buildInventorySku({
      usageType,
      woodType,
      profile,
      color,
      widthMm,
      lengthMm,
      thicknessMm: typeof thicknessMm === 'number' ? thicknessMm : null,
    });
  };

  const ensureColorVariants = (current: Variant[]): Variant[] => {
    if (selectedVariantColors.length === 0) return current;

    const existing = new Set(
      current
        .filter((variant) => variant.variant_type === 'color')
        .map((variant) => variant.name)
        .filter(Boolean)
    );

    const missing = selectedVariantColors.filter((code) => !existing.has(code));
    if (missing.length === 0) return current;

    const next = [...current];
    for (const code of missing) {
      const catalog = catalogColorOptions.find((option) => option.code === code);
      next.push({
        name: code,
        variant_type: 'color',
        hex_color: catalog?.hex,
        image_url: variantColorImages[code] || undefined,
        price_adjustment: 0,
        is_available: true,
      });
    }

    return next;
  };

  const handleCreateVariants = async () => {
    setVariantGeneratorError(null);
    if (!product?.id) {
      setVariantGeneratorError('Pirma išsaugokite bazinę prekę.');
      return;
    }
    if (variantDrafts.length === 0) {
      setVariantGeneratorError('Nėra sugeneruotų variacijų.');
      return;
    }

    setIsCreatingVariants(true);
    try {
      const slugs = variantDrafts.map((d) => d.slug);
      const existing = await supabase
        .from('products')
        .select('id,slug')
        .in('slug', slugs);

      if (existing.error) throw existing.error;
      const existingSlugs = new Set((existing.data || []).map((row: any) => row.slug));
      const basePriceValue = Number.parseFloat(basePrice || '0') || 0;

      const rows = variantDrafts
        .filter((draft) => !existingSlugs.has(draft.slug))
        .map((draft) => {
          const priceValueRaw = Number.parseFloat(draft.price || '');
          const salePriceValue = Number.isFinite(priceValueRaw) ? priceValueRaw : null;
          const salePrice = salePriceValue !== null && salePriceValue < basePriceValue ? salePriceValue : null;
          const baseSlug = slug || product.slug || '';
          const baseSlugEnValue = slugEn || (product as any)?.slug_en || '';
          const slugEnValue = baseSlugEnValue
            ? buildStockItemSlug(baseSlugEnValue, draft.profile, draft.color, draft.widthMm, draft.lengthMm)
            : draft.slug;
          const skuValue = draft.sku || buildVariantSku(draft.profile, draft.color, draft.widthMm, draft.lengthMm);

          return {
            name,
            name_en: nameEn || name || null,
            slug: draft.slug,
            slug_en: slugEnValue,
            description: description || null,
            description_en: descriptionEn || description || null,
            base_price: basePriceValue,
            sale_price: salePrice,
            wood_type: woodType,
            category: deriveCategoryFromUsage(usageType),
            usage_type: usageType || null,
            image_url: draft.imageUrl || imageUrl || null,
            is_active: false,
            sku: skuValue || null,
            width: draft.widthMm,
            depth: draft.lengthMm,
            height: height ? Number.parseFloat(height) : null,
          };
        });

      if (rows.length === 0) {
        setVariantGeneratorError('Visos variacijos jau egzistuoja.');
        return;
      }

      const { error } = await supabase.from('products').insert(rows);
      if (error) {
        const message = formatUnknownError(error);
        const missingSlugEn = isMissingColumnError(message, 'slug_en');
        const missingWidth = isMissingColumnError(message, 'width');
        const missingHeight = isMissingColumnError(message, 'height');
        const missingDepth = isMissingColumnError(message, 'depth');

        if (missingSlugEn || missingWidth || missingHeight || missingDepth) {
          const fallbackRows = rows.map((row: any) => {
            const next = { ...row };
            if (missingSlugEn) delete next.slug_en;
            if (missingWidth) delete next.width;
            if (missingHeight) delete next.height;
            if (missingDepth) delete next.depth;
            return next;
          });

          const retry = await supabase.from('products').insert(fallbackRows);
          if (retry.error) throw retry.error;

          const warnings: string[] = [];
          if (missingSlugEn) warnings.push(t('errors.slugEnMissing', { path: slugEnMigrationPath } as any));
          if (missingWidth || missingHeight || missingDepth) warnings.push(t('errors.dimensionsMissing', { path: dimensionsMigrationPath } as any));
          if (warnings.length > 0) setSaveWarning(warnings.join('\n'));
        } else {
          throw error;
        }
      }

      setVariantDrafts([]);
    } catch (error) {
      setVariantGeneratorError(formatUnknownError(error));
    } finally {
      setIsCreatingVariants(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Sidebar - Image Preview */}
      <div className="lg:col-span-1">
        <div className="bg-[#EAEAEA] rounded-[24px] p-6 border border-[#E1E1E1] sticky top-8">
          <h3 className="text-lg font-['DM_Sans'] font-medium mb-4">{t('sections.photo')}</h3>
          
          <div className="mb-4">
            {imagePreview ? (
              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-[#E1E1E1]">
                <Image
                  src={imagePreview}
                  alt={t('image.previewAlt')}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full aspect-square rounded-lg bg-[#EAEAEA] flex items-center justify-center">
                <span className="text-[#BBBBBB] font-['DM_Sans']">{t('image.noPhoto')}</span>
              </div>
            )}
          </div>

          {!showPhotoLibrary ? (
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm font-['DM_Sans'] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#161616] file:text-white hover:file:bg-[#2d2d2d]"
            />
          ) : null}

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPhotoLibrary((v) => !v)}
              className="px-3 py-2 border border-[#E1E1E1] bg-[#EAEAEA] rounded-lg font-['DM_Sans'] text-sm text-[#161616] hover:bg-[#E1E1E1]"
            >
              {showPhotoLibrary ? t('image.hideLibrary') : t('image.chooseFromLibrary')}
            </button>
            {(imagePreview || imageUrl) ? (
              <button
                type="button"
                onClick={clearImageSelection}
                className="px-3 py-2 border border-red-200 rounded-lg font-['DM_Sans'] text-sm text-red-700 hover:bg-[#E1E1E1]"
              >
                {t('image.remove')}
              </button>
            ) : null}
          </div>

          {showPhotoLibrary ? (
            <div className="mt-4 border border-[#E1E1E1] rounded-lg p-3 bg-[#EAEAEA]">
              <p className="font-['DM_Sans'] text-sm font-medium text-[#161616]">{t('sections.photoLibrary')}</p>
              <p className="mt-1 font-['Outfit'] text-xs text-[#535353]">
                {t('photoLibrary.help')}
              </p>

              <div className="mt-3 grid grid-cols-1 gap-3">
                <div>
                  <label className="block font-['Outfit'] text-xs text-[#535353]">{t('photoLibrary.wood')}</label>
                  <select
                    value={libraryWoodType}
                    onChange={(e) => setLibraryWoodType(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-[#E1E1E1] rounded-lg font-['Outfit'] text-sm bg-[#EAEAEA]"
                  >
                    <option value="spruce">{t('options.woodTypes.spruce')} (spruce)</option>
                    <option value="larch">{t('options.woodTypes.larch')} (larch)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-['Outfit'] text-xs text-[#535353]">{t('photoLibrary.color')}</label>
                  <select
                    value={libraryColorCode}
                    onChange={(e) => setLibraryColorCode(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-[#E1E1E1] rounded-lg font-['Outfit'] text-sm bg-[#EAEAEA]"
                  >
                    {libraryColors.length === 0 ? (
                      <option value="">{t('photoLibrary.noColors')}</option>
                    ) : (
                      libraryColors.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label} ({c.code})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    disabled={libraryIsLoading || !libraryColorCode}
                    onClick={() => loadLibraryAssets()}
                    className="px-3 py-2 border border-[#E1E1E1] bg-[#EAEAEA] rounded-lg font-['DM_Sans'] text-sm text-[#161616] hover:bg-[#E1E1E1] disabled:opacity-60"
                  >
                    {libraryIsLoading ? t('photoLibrary.refreshing') : t('photoLibrary.refresh')}
                  </button>
                  {libraryError ? (
                    <span className="font-['Outfit'] text-xs text-red-700">{libraryError}</span>
                  ) : null}
                </div>

                {isMissingCatalogSchemaError(libraryError) ? (
                  <div className="rounded-lg border border-amber-200 bg-[#EAEAEA] p-3">
                    <p className="font-['DM_Sans'] text-xs font-medium text-amber-900">
                      {t('photoLibrary.missingSchemaTitle')}
                    </p>
                    <p className="mt-1 font-['Outfit'] text-xs text-amber-900">
                      {t('photoLibrary.missingSchemaBody', { path: catalogMigrationPath })}
                    </p>
                    <p className="mt-1 font-['Outfit'] text-xs text-amber-900">
                      {t('photoLibrary.missingSchemaEnvHint')}
                    </p>
                  </div>
                ) : null}

                {libraryAssets.length === 0 ? (
                  <p className="font-['Outfit'] text-xs text-[#7C7C7C]">{t('photoLibrary.noneFound')}</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {libraryAssets.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => chooseLibraryImage(a.url)}
                        className="relative group border border-[#E1E1E1] rounded-lg overflow-hidden bg-[#EAEAEA]"
                        title={a.wood_type ? `wood=${a.wood_type}` : `wood=${t('photoLibrary.any')}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={a.url} alt="asset" className="w-full aspect-square object-cover" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/50 text-white text-[10px] px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {a.wood_type ? a.wood_type : t('photoLibrary.any')}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Slug Preview */}
          <div className="mt-6 pt-6 border-t border-[#E1E1E1]">
            <h4 className="text-sm font-['DM_Sans'] font-medium mb-2">{t('sections.urlPreview')}</h4>
            <div className="space-y-1">
              <p className="text-sm text-[#535353] font-['DM_Sans'] break-all">
                <span className="font-medium text-[#161616]">LT:</span>{' '}
                {toLocalePath(`/products/${slug || 'product-slug'}`, 'lt')}
              </p>
              <p className="text-sm text-[#535353] font-['DM_Sans'] break-all">
                <span className="font-medium text-[#161616]">EN:</span>{' '}
                {toLocalePath(`/products/${slugEn || 'product-slug'}`, 'en')}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          {mode === 'edit' && (
            <div className="mt-6 pt-6 border-t border-[#E1E1E1] space-y-2">
              <div className="flex justify-between text-sm font-['DM_Sans']">
                <span className="text-[#535353]">{t('sections.quickStats.variants')}</span>
                <span className="font-medium">{variants.length}</span>
              </div>
              <div className="flex justify-between text-sm font-['DM_Sans']">
                <span className="text-[#535353]">{t('sections.quickStats.status')}</span>
                <span className={`font-medium ${status === 'published' ? 'text-green-600' : 'text-gray-600'}`}>
                  {status === 'published' ? t('options.status.published') : t('options.status.draft')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Error Message */}
        {saveError && (
          <div className="bg-[#EAEAEA] border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-['DM_Sans']">{saveError}</p>
          </div>
        )}

        {saveWarning && (
          <div className="bg-[#EAEAEA] border border-amber-200 rounded-lg p-4">
            <p className="text-amber-900 font-['DM_Sans']">{saveWarning}</p>
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-[#EAEAEA] rounded-[24px] p-6 border border-[#E1E1E1]">
          <h3 className="text-lg font-['DM_Sans'] font-medium mb-6">{t('sections.basicInfo')}</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                  {t('fields.nameLt')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    const next = e.target.value;
                    setName(next);
                    setIsNameManuallyEdited(next.trim().length > 0);

                    if (!isSlugManuallyEdited) {
                      const nextSlug = buildLtSlugFromNameAndWood(next.trim() || next, woodType);
                      setSlug(nextSlug);
                    }
                  }}
                  readOnly={lockBaseFields}
                  className={`w-full px-4 py-2 border rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 ${
                    errors.name ? 'border-red-500 focus:ring-red-500' : 'border-[#E1E1E1] focus:ring-[#161616]'
                  } ${lockBaseFields ? 'bg-[#EAEAEA]' : ''}`}
                  placeholder={t('placeholders.nameLt')}
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                {lockBaseFields ? (
                  <p className="text-xs text-[#7C7C7C] mt-1">
                    Vardas generuojamas automatiškai iš Fasadinė/Terasinė + Eglė/Maumedis.
                  </p>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                  {t('fields.nameEn')}
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => {
                    const next = e.target.value;
                    setNameEn(next);
                    setIsNameEnManuallyEdited(next.trim().length > 0);

                    if (!isSlugEnManuallyEdited) {
                      const nextSlugEn = buildEnSlugFromNameAndWood(next.trim() || next, woodType);
                      setSlugEn(nextSlugEn);
                    }
                  }}
                  readOnly={lockBaseFields}
                  className={`w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616] ${
                    lockBaseFields ? 'bg-[#EAEAEA]' : ''
                  }`}
                  placeholder={t('placeholders.nameEn')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-['DM_Sans'] font-medium mb-2">{t('fields.slugLt')}</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    const next = slugify(e.target.value);
                    setSlug(next);
                    setIsSlugManuallyEdited(next.length > 0);
                  }}
                  readOnly={lockBaseFields}
                  className={`w-full px-4 py-2 border rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 ${
                    errors.slug ? 'border-red-500 focus:ring-red-500' : 'border-[#E1E1E1] focus:ring-[#161616]'
                  } ${lockBaseFields ? 'bg-[#EAEAEA]' : ''}`}
                  placeholder={t('placeholders.slugLt')}
                />
                {errors.slug && <p className="text-sm text-red-600 mt-1">{errors.slug}</p>}
              </div>

              <div>
                <label className="block text-sm font-['DM_Sans'] font-medium mb-2">{t('fields.slugEn')}</label>
                <input
                  type="text"
                  value={slugEn}
                  onChange={(e) => {
                    const next = slugify(e.target.value);
                    setSlugEn(next);
                    setIsSlugEnManuallyEdited(next.length > 0);
                  }}
                  readOnly={lockBaseFields}
                  className={`w-full px-4 py-2 border rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 ${
                    errors.slug_en ? 'border-red-500 focus:ring-red-500' : 'border-[#E1E1E1] focus:ring-[#161616]'
                  } ${lockBaseFields ? 'bg-[#EAEAEA]' : ''}`}
                  placeholder={t('placeholders.slugEn')}
                />
                {errors.slug_en && <p className="text-sm text-red-600 mt-1">{errors.slug_en}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                {t('fields.descriptionLt')}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                  className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616] bg-[#EAEAEA]"
                placeholder={t('placeholders.descriptionLt')}
              />
            </div>

            <div>
              <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                {t('fields.descriptionEn')}
              </label>
              <textarea
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                rows={4}
                  className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616] bg-[#EAEAEA]"
                placeholder={t('placeholders.descriptionEn')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                  {t('fields.usage')}
                </label>
                <select
                  value={usageType}
                  onChange={(e) => setUsageType(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 ${
                    errors.usage_type ? 'border-red-500 focus:ring-red-500' : 'border-[#E1E1E1] focus:ring-[#161616]'
                  } yw-select`}
                >
                  <option value="">{t('placeholders.selectUsage')}</option>
                  {USAGE_TYPES.filter((u) => ALLOWED_USAGE_TYPES.includes(u.value as any)).map((usage) => (
                    <option key={usage.value} value={usage.value}>
                      {t(`options.usageTypes.${usage.value}` as any)}
                    </option>
                  ))}
                </select>
                {errors.usage_type && <p className="text-sm text-red-600 mt-1">{errors.usage_type}</p>}
              </div>

              <div>
                <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                  {t('fields.woodType')}
                </label>
                <select
                  value={woodType}
                  onChange={(e) => setWoodType(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 ${
                    errors.wood_type ? 'border-red-500 focus:ring-red-500' : 'border-[#E1E1E1] focus:ring-[#161616]'
                  } yw-select`}
                >
                  <option value="">{t('placeholders.selectWoodType')}</option>
                  {WOOD_TYPES.map((wood) => (
                    <option key={wood.value} value={wood.value}>
                      {t(`options.woodTypes.${wood.value}` as any)}
                    </option>
                  ))}
                </select>
                {errors.wood_type && <p className="text-sm text-red-600 mt-1">{errors.wood_type}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-[#EAEAEA] rounded-[24px] p-6 border border-[#E1E1E1]">
          <h3 className="text-lg font-['DM_Sans'] font-medium mb-6">{t('sections.pricingInventory')}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                {t('fields.basePrice')}
              </label>
              <input
                type="number"
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 ${
                  errors.base_price ? 'border-red-500 focus:ring-red-500' : 'border-[#E1E1E1] focus:ring-[#161616]'
                }`}
                placeholder={t('placeholders.basePrice')}
              />
              {errors.base_price && <p className="text-sm text-red-600 mt-1">{errors.base_price}</p>}
            </div>

            <div>
              <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                {t('fields.stockQuantity')}
              </label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 bg-[#EAEAEA] ${
                  errors.stock_quantity ? 'border-red-500 focus:ring-red-500' : 'border-[#E1E1E1] focus:ring-[#161616]'
                }`}
                placeholder={t('placeholders.stockQuantity')}
              />
              {errors.stock_quantity && <p className="text-sm text-red-600 mt-1">{errors.stock_quantity}</p>}
            </div>

            <div>
              <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                {t('fields.sku')}
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 bg-[#EAEAEA] ${
                  errors.sku ? 'border-red-500 focus:ring-red-500' : 'border-[#E1E1E1] focus:ring-[#161616]'
                }`}
                placeholder={t('placeholders.sku')}
              />
              {errors.sku && <p className="text-sm text-red-600 mt-1">{errors.sku}</p>}
            </div>
          </div>
        </div>

        {/* Dimensions */}
        <div className="bg-[#EAEAEA] rounded-[24px] p-6 border border-[#E1E1E1]">
          <h3 className="text-lg font-['DM_Sans'] font-medium mb-6">{t('sections.dimensions')}</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                {t('fields.width')}
              </label>
              <select
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 bg-[#EAEAEA] yw-select ${
                  errors.width ? 'border-red-500 focus:ring-red-500' : 'border-[#E1E1E1] focus:ring-[#161616]'
                }`}
              >
                {WIDTH_OPTIONS_MM.map((mm) => (
                  <option key={mm} value={String(mm)}>
                    {mm} mm
                  </option>
                ))}
              </select>
              {errors.width && <p className="text-sm text-red-600 mt-1">{errors.width}</p>}
            </div>

            <div>
              <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                {t('fields.thickness')}
              </label>
              <select
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                disabled={!usageType}
                className={`w-full px-4 py-2 border rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 bg-[#EAEAEA] disabled:opacity-60 yw-select ${
                  errors.height ? 'border-red-500 focus:ring-red-500' : 'border-[#E1E1E1] focus:ring-[#161616]'
                }`}
              >
                {!usageType ? (
                  <option value="">{t('placeholders.selectUsageFirst')}</option>
                ) : usageType === 'terrace' ? (
                  <option value="28">28 mm</option>
                ) : (
                  <option value="18">18/20 mm</option>
                )}
              </select>
              {errors.height && <p className="text-sm text-red-600 mt-1">{errors.height}</p>}
            </div>

            <div>
              <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                {t('fields.length')}
              </label>
              <select
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 bg-[#EAEAEA] yw-select ${
                  errors.depth ? 'border-red-500 focus:ring-red-500' : 'border-[#E1E1E1] focus:ring-[#161616]'
                }`}
              >
                {LENGTH_OPTIONS_MM.map((mm) => (
                  <option key={mm} value={String(mm)}>
                    {mm} mm
                  </option>
                ))}
              </select>
              {errors.depth && <p className="text-sm text-red-600 mt-1">{errors.depth}</p>}
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-[#EAEAEA] rounded-[24px] p-6 border border-[#E1E1E1]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-['DM_Sans'] font-medium">{t('sections.variants')}</h3>
            <button
              type="button"
              onClick={() => {
                setEditingVariant(null);
                setShowVariantForm(true);
              }}
              className="px-4 py-2 bg-[#161616] text-white rounded-lg font-['DM_Sans'] text-sm hover:bg-[#2d2d2d]"
            >
              {t('variants.add')}
            </button>
          </div>

          {variants.length > 0 ? (
            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div key={variant.id || variant.tempId || index} className="flex items-center justify-between p-4 border border-[#E1E1E1] rounded-lg">
                  <div className="flex items-center gap-4">
                    {variant.hex_color && (
                      <div 
                        className="w-8 h-8 rounded-full border border-[#E1E1E1]"
                        style={{ backgroundColor: variant.hex_color }}
                      />
                    )}
                    {variant.image_url && (
                      <img
                        src={variant.image_url}
                        alt=""
                        className="w-10 h-10 rounded border border-[#E1E1E1] object-cover"
                      />
                    )}
                    <div>
                      <div className="font-['DM_Sans'] font-medium">{variant.name}</div>
                      <div className="text-sm text-[#535353] font-['DM_Sans']">
                        {variant.variant_type === 'color'
                          ? t('variants.typeLabelColor')
                          : variant.variant_type === 'profile'
                            ? t('variants.typeLabelProfile')
                            : t('variants.typeLabelFinish')}
                        {variant.price_adjustment && variant.price_adjustment !== 0 && (
                          <span className="ml-2">
                            {variant.price_adjustment > 0 ? '+' : ''}{variant.price_adjustment.toFixed(2)} EUR
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => editVariant(variant)}
                      className="text-sm text-[#161616] hover:underline font-['DM_Sans']"
                    >
                      {t('variants.edit')}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeVariant(variant)}
                      className="text-sm text-red-600 hover:underline font-['DM_Sans']"
                    >
                      {t('variants.delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#535353] font-['DM_Sans'] text-center py-8">
              {t('variants.empty')}
            </p>
          )}
        </div>

        {/* Variant Generator (WooCommerce-style) */}
        <div className="bg-[#EAEAEA] rounded-[24px] p-6 border border-[#E1E1E1]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-['DM_Sans'] font-medium">Variacijų generatorius</h3>
              <p className="text-sm text-[#535353] font-['Outfit']">
                Sugeneruoja atskiras prekes (stock-item) pagal profilį, spalvą ir matmenis.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={generateVariantDrafts}
                className="px-4 py-2 border border-[#161616] rounded-lg font-['DM_Sans'] text-sm hover:bg-[#E1E1E1]"
              >
                Generuoti kombinacijas
              </button>
              <button
                type="button"
                onClick={handleCreateVariants}
                disabled={isCreatingVariants || variantDrafts.length === 0}
                className="px-4 py-2 bg-[#161616] text-white rounded-lg font-['DM_Sans'] text-sm hover:bg-[#2d2d2d] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingVariants ? 'Kuriama…' : 'Sukurti variacijas'}
              </button>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-[#535353] font-['DM_Sans'] mb-1">Nuolaida</label>
              <select
                value={variantDiscountType}
                onChange={(e) => setVariantDiscountType(e.target.value as 'none' | 'percent' | 'amount')}
                className="w-full px-3 py-2 border border-[#E1E1E1] rounded font-['DM_Sans'] text-sm"
              >
                <option value="none">Be nuolaidos</option>
                <option value="percent">% nuo kainos</option>
                <option value="amount">EUR nuo kainos</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[#535353] font-['DM_Sans'] mb-1">Reikšmė</label>
              <input
                type="number"
                step="0.01"
                value={variantDiscountValue}
                onChange={(e) => setVariantDiscountValue(e.target.value)}
                disabled={variantDiscountType === 'none'}
                className="w-full px-3 py-2 border border-[#E1E1E1] rounded font-['DM_Sans'] text-sm disabled:opacity-50"
                placeholder={variantDiscountType === 'percent' ? '10' : '5'}
              />
            </div>
            <div className="flex items-end text-xs text-[#7C7C7C]">
              Nuolaida taikoma visoms sugeneruotoms variacijoms.
            </div>
          </div>

          {variantGeneratorError ? (
            <div className="mb-4 text-sm text-red-600 font-['DM_Sans']">
              {variantGeneratorError}
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm font-['DM_Sans'] font-medium mb-2">Spalvos</p>
              {errors.colorVariants ? (
                <p className="text-xs text-red-600 mb-2">{errors.colorVariants}</p>
              ) : null}
              <div className="space-y-2">
                {availableColorOptions.length === 0 ? (
                  <p className="text-xs text-[#7C7C7C]">Nėra spalvų variantų</p>
                ) : (
                  availableColorOptions.map((color) => (
                    <label key={color.code} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedVariantColors.includes(color.code)}
                        onChange={() => toggleStringSelection(color.code, selectedVariantColors, setSelectedVariantColors)}
                      />
                      <span>{color.label}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm font-['DM_Sans'] font-medium mb-2">Nuotraukos pagal spalvą</p>
              {selectedVariantColors.length === 0 ? (
                <p className="text-xs text-[#7C7C7C]">Pasirinkite spalvas, kad pridėtumėte nuotraukas</p>
              ) : (
                <div className="space-y-2">
                  {selectedVariantColors.map((color) => {
                    const label = availableColorOptions.find((opt) => opt.code === color)?.label || color;
                    return (
                    <div key={color} className="flex flex-col gap-1">
                      <label className="text-xs text-[#535353]">{label}</label>
                      <input
                        type="text"
                        value={variantColorImages[color] ?? ''}
                        onChange={(e) => updateColorImage(color, e.target.value)}
                        className="w-full px-2 py-2 border border-[#E1E1E1] rounded"
                        placeholder="Nuotraukos URL"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setActiveColorLibrary(color);
                          setLibraryColorCode(color);
                          void loadLibraryAssets({ colorCode: color, woodType });
                        }}
                        className="w-fit text-xs text-[#161616] underline"
                      >
                        Rinktis iš bibliotekos
                      </button>
                      {activeColorLibrary === color ? (
                        <div className="mt-2 rounded border border-[#E1E1E1] p-2">
                          {libraryIsLoading ? (
                            <p className="text-xs text-[#7C7C7C]">Kraunama…</p>
                          ) : libraryError ? (
                            <p className="text-xs text-red-600">{libraryError}</p>
                          ) : libraryAssets.length === 0 ? (
                            <p className="text-xs text-[#7C7C7C]">Nėra nuotraukų šiai spalvai</p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {libraryAssets.map((asset) => (
                                <button
                                  key={asset.id}
                                  type="button"
                                  onClick={() => chooseColorLibraryImage(color, asset.url)}
                                  className="border border-[#E1E1E1] rounded overflow-hidden"
                                >
                                  <img src={asset.url} alt="" className="h-16 w-16 object-cover" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )})}
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-['DM_Sans'] font-medium mb-2">Profiliai</p>
              <div className="space-y-2">
                {allowedProfileOptions.length === 0 ? (
                  <p className="text-xs text-[#7C7C7C]">Nėra profilių variantų</p>
                ) : (
                  allowedProfileOptions.map((profile) => (
                    <label key={profile.code} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedVariantProfiles.includes(profile.code)}
                        onChange={() => toggleStringSelection(profile.code, selectedVariantProfiles, setSelectedVariantProfiles)}
                      />
                      <span>{profile.label}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-['DM_Sans'] font-medium mb-2">Plotis (mm)</p>
              <div className="space-y-2">
                {WIDTH_OPTIONS_MM.map((widthOption) => (
                  <label key={widthOption} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedVariantWidths.includes(widthOption)}
                      onChange={() => toggleNumberSelection(widthOption, selectedVariantWidths, setSelectedVariantWidths)}
                    />
                    <span>{widthOption}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-['DM_Sans'] font-medium mb-2">Ilgis (mm)</p>
              <div className="space-y-2">
                {LENGTH_OPTIONS_MM.map((lengthOption) => (
                  <label key={lengthOption} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedVariantLengths.includes(lengthOption)}
                      onChange={() => toggleNumberSelection(lengthOption, selectedVariantLengths, setSelectedVariantLengths)}
                    />
                    <span>{lengthOption}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {variantDrafts.length > 0 ? (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm border border-[#E1E1E1]">
                <thead className="bg-[#E1E1E1]">
                  <tr>
                    <th className="text-left px-3 py-2">Profilis</th>
                    <th className="text-left px-3 py-2">Spalva</th>
                    <th className="text-left px-3 py-2">Plotis</th>
                    <th className="text-left px-3 py-2">Ilgis</th>
                    <th className="text-left px-3 py-2">Kaina su nuolaida</th>
                    <th className="text-left px-3 py-2">SKU</th>
                    <th className="text-left px-3 py-2">Nuotrauka</th>
                  </tr>
                </thead>
                <tbody>
                  {variantDrafts.map((draft) => (
                    <tr key={draft.id} className="border-t border-[#E1E1E1]">
                      <td className="px-3 py-2">
                        {resolveProfileLabel(
                          draft.profile,
                          catalogProfileOptions.find((option) => option.code === draft.profile)?.label,
                          catalogProfileOptions.find((option) => option.code === draft.profile)?.label,
                          locale as 'lt' | 'en'
                        )}
                      </td>
                      <td className="px-3 py-2">{draft.color}</td>
                      <td className="px-3 py-2">{draft.widthMm}</td>
                      <td className="px-3 py-2">{draft.lengthMm}</td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          step="0.01"
                          value={draft.price}
                          onChange={(e) => updateVariantDraft(draft.id, { price: e.target.value })}
                          className="w-[110px] px-2 py-1 border border-[#E1E1E1] rounded"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={draft.sku}
                          onChange={(e) => updateVariantDraft(draft.id, { sku: e.target.value })}
                          className="w-[140px] px-2 py-1 border border-[#E1E1E1] rounded"
                        />
                      </td>
                      <td className="px-3 py-2 text-xs text-[#535353]">
                        {draft.imageUrl ? 'Pagal spalvą' : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-[#7C7C7C] mt-4">Dar nėra sugeneruotų variacijų.</p>
          )}

          {mode === 'edit' && (
            <div className="mt-8">
              <h4 className="text-base font-['DM_Sans'] font-medium">Sukurtos variacijos (prekės)</h4>
              {variantProductsLoading ? (
                <p className="text-sm text-[#7C7C7C] mt-3">Kraunamos variacijos...</p>
              ) : variantProductsError ? (
                <p className="text-sm text-red-600 mt-3">{variantProductsError}</p>
              ) : variantProducts.length === 0 ? (
                <p className="text-sm text-[#7C7C7C] mt-3">Dar nėra sukurtų variacijų.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <div className="mb-4 flex flex-col sm:flex-row sm:items-end gap-3">
                    <div>
                      <label className="block text-xs text-[#535353] mb-1">Kaina visoms variacijoms (EUR)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={bulkVariantPrice}
                        onChange={(e) => setBulkVariantPrice(e.target.value)}
                        className="w-[180px] px-2 py-2 border border-[#E1E1E1] rounded"
                        placeholder="Pvz. 89.00"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyPriceToAllVariants}
                      disabled={bulkVariantPriceSaving}
                      className="px-4 py-2 bg-[#161616] text-white rounded-[100px] text-sm disabled:opacity-50"
                    >
                      {bulkVariantPriceSaving ? 'Taikoma...' : 'Taikyti visoms'}
                    </button>
                    {bulkVariantPriceError ? (
                      <p className="text-sm text-red-600">{bulkVariantPriceError}</p>
                    ) : null}
                  </div>
                  <table className="w-full text-sm border border-[#E1E1E1]">
                    <thead className="bg-[#E1E1E1]">
                      <tr>
                        <th className="text-left px-3 py-2">Slug</th>
                        <th className="text-left px-3 py-2">SKU</th>
                        <th className="text-left px-3 py-2">Kaina</th>
                        <th className="text-left px-3 py-2">Nuolaida</th>
                        <th className="text-left px-3 py-2">Sandėlis</th>
                        <th className="text-left px-3 py-2">Veiksmai</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variantProducts.map((item: any) => (
                        <Fragment key={item.id}>
                          <tr className="border-t border-[#E1E1E1]">
                            <td className="px-3 py-2">{item.slug}</td>
                            <td className="px-3 py-2">{item.sku || '—'}</td>
                            <td className="px-3 py-2">{typeof item.base_price === 'number' ? item.base_price.toFixed(2) : '—'}</td>
                            <td className="px-3 py-2">
                              {(() => {
                                if (typeof item.base_price !== 'number' || typeof item.sale_price !== 'number') return '—';
                                const percent = computeDiscountPercent(item.base_price, item.sale_price);
                                return percent ? `${formatPercent(percent)}%` : '—';
                              })()}
                            </td>
                            <td className="px-3 py-2">{typeof item.stock_quantity === 'number' ? item.stock_quantity : '—'}</td>
                            <td className="px-3 py-2">
                              <button
                                type="button"
                                className="text-sm font-medium text-[#161616] underline"
                                onClick={() => toggleVariantAccordion(item)}
                              >
                                Redaguoti
                              </button>
                            </td>
                          </tr>
                          {expandedVariantId === item.id && (
                            <tr className="border-t border-[#E1E1E1]">
                              <td colSpan={6} className="px-3 py-4 bg-white">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                  <div>
                                    <label className="block text-xs text-[#535353] mb-1">SKU</label>
                                    <input
                                      type="text"
                                      value={variantEditValues[item.id]?.sku ?? ''}
                                      onChange={(e) => updateVariantEditValue(item.id, { sku: e.target.value })}
                                      className="w-full px-2 py-1 border border-[#E1E1E1] rounded"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-[#535353] mb-1">Kaina</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={variantEditValues[item.id]?.base_price ?? ''}
                                      onChange={(e) => updateVariantEditValue(item.id, { base_price: e.target.value })}
                                      className="w-full px-2 py-1 border border-[#E1E1E1] rounded"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-[#535353] mb-1">Nuolaida (%)</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={(() => {
                                        const base = parseNumber(variantEditValues[item.id]?.base_price ?? '');
                                        const sale = parseNumber(variantEditValues[item.id]?.sale_price ?? '');
                                        const percent = computeDiscountPercent(base, sale);
                                        return percent ? formatPercent(percent) : '';
                                      })()}
                                      onChange={(e) =>
                                        updateVariantEditValue(item.id, {
                                          sale_price: applyDiscountPercent(
                                            variantEditValues[item.id]?.base_price ?? '',
                                            e.target.value
                                          ),
                                        })
                                      }
                                      className="w-full px-2 py-1 border border-[#E1E1E1] rounded"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-[#535353] mb-1">Sandėlis</label>
                                    <input
                                      type="number"
                                      step="1"
                                      value={variantEditValues[item.id]?.stock_quantity ?? ''}
                                      onChange={(e) => updateVariantEditValue(item.id, { stock_quantity: e.target.value })}
                                      className="w-full px-2 py-1 border border-[#E1E1E1] rounded"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-[#535353] mb-1">Statusas</label>
                                    <select
                                      value={variantEditValues[item.id]?.is_active ? 'published' : 'draft'}
                                      onChange={(e) => updateVariantEditValue(item.id, { is_active: e.target.value === 'published' })}
                                      className="w-full px-2 py-1 border border-[#E1E1E1] rounded"
                                    >
                                      <option value="draft">Juodraštis</option>
                                      <option value="published">Publikuota</option>
                                    </select>
                                  </div>
                                </div>
                                {variantEditErrors[item.id] && (
                                  <p className="text-sm text-red-600 mt-3">{variantEditErrors[item.id]}</p>
                                )}
                                <div className="mt-4 flex gap-3">
                                  <button
                                    type="button"
                                    onClick={() => handleSaveVariantEdit(item.id)}
                                    disabled={variantEditSaving}
                                    className="px-4 py-2 bg-[#161616] text-white rounded-[100px] text-sm disabled:opacity-50"
                                  >
                                    {variantEditSaving ? 'Saugoma...' : 'Išsaugoti'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setExpandedVariantId(null)}
                                    className="px-4 py-2 border border-[#E1E1E1] rounded-[100px] text-sm"
                                  >
                                    Uždaryti
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Publishing Options */}
        <div className="bg-[#EAEAEA] rounded-[24px] p-6 border border-[#E1E1E1]">
          <h3 className="text-lg font-['DM_Sans'] font-medium mb-6">{t('sections.publishing')}</h3>
          
          <div>
            <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
              {t('fields.status')}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616] yw-select"
            >
              <option value="draft">{t('options.status.draft')}</option>
              <option value="published">{t('options.status.published')}</option>
            </select>
            <p className="text-sm text-[#535353] font-['DM_Sans'] mt-2">
              {status === 'draft' ? t('options.statusHelp.draft') : t('options.statusHelp.published')}
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-[#161616] text-white rounded-[100px] font-['DM_Sans'] font-medium hover:bg-[#2d2d2d] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? t('buttons.saving') : mode === 'create' ? t('buttons.create') : t('buttons.save')}
            </button>
            
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-[#E1E1E1] rounded-[100px] font-['DM_Sans'] font-medium hover:bg-[#E1E1E1]"
            >
              {t('buttons.cancel')}
            </button>
          </div>

          {mode === 'edit' && (
            <button
              type="button"
              onClick={() => setDeleteModal(true)}
              className="px-6 py-3 border border-red-600 text-red-600 rounded-[100px] font-['DM_Sans'] font-medium hover:bg-[#E1E1E1]"
            >
              {t('buttons.deleteProduct')}
            </button>
          )}
        </div>
      </div>

      {/* Variant Form Modal */}
      {showVariantForm && (
        <VariantFormModal
          variant={editingVariant}
          onSave={addVariant}
          onCancel={() => {
            setShowVariantForm(false);
            setEditingVariant(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#EAEAEA] border border-[#E1E1E1] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-['DM_Sans'] font-medium mb-4">
              {t('deleteModal.title')}
            </h3>
            <p className="text-[#535353] font-['DM_Sans'] mb-6">
              {t('deleteModal.body')}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal(false)}
                disabled={isSaving}
                className="px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] hover:bg-[#E1E1E1] disabled:opacity-50"
              >
                {t('deleteModal.cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={isSaving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-['DM_Sans'] hover:bg-red-700 disabled:opacity-50"
              >
                {isSaving ? t('deleteModal.confirming') : t('deleteModal.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

// Variant Form Modal Component
interface VariantFormModalProps {
  variant: Variant | null;
  onSave: (variant: Variant) => void;
  onCancel: () => void;
}

function VariantFormModal({ variant, onSave, onCancel }: VariantFormModalProps) {
  const t = useTranslations('admin.products.form');
  const [name, setName] = useState(variant?.name || '');
  const [variantType, setVariantType] = useState<'color' | 'finish' | 'profile'>(variant?.variant_type || 'color');
  const [hexColor, setHexColor] = useState(variant?.hex_color || '#161616');
  const [imageUrl, setImageUrl] = useState(variant?.image_url || '');
  const [priceAdjustment, setPriceAdjustment] = useState(variant?.price_adjustment?.toString() || '0');
  const [description, setDescription] = useState(variant?.description || '');
  const [isAvailable, setIsAvailable] = useState(variant?.is_available ?? true);

  const handleSubmit = (e?: React.SyntheticEvent) => {
    e?.preventDefault?.();
    if (!name) return;

    onSave({
      ...(variant?.id && { id: variant.id }),
      name,
      variant_type: variantType,
      hex_color: variantType === 'color' ? hexColor : undefined,
      image_url: variantType === 'color' ? (imageUrl || undefined) : undefined,
      price_adjustment: parseFloat(priceAdjustment) || 0,
      description: description || undefined,
      is_available: isAvailable,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#EAEAEA] border border-[#E1E1E1] rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-['DM_Sans'] font-medium mb-6">
          {variant ? t('variantModal.titleEdit') : t('variantModal.titleNew')}
        </h3>

        <div
          role="dialog"
          aria-modal="true"
          className="space-y-4"
          onKeyDown={(e) => {
            if (e.key !== 'Enter') return;
            const target = e.target as HTMLElement | null;
            if (target?.tagName === 'TEXTAREA') return;
            handleSubmit(e);
          }}
        >
          <div>
            <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
              {t('variantModal.fields.name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616]"
              placeholder={t('variantModal.placeholders.name')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
              {t('variantModal.fields.type')}
            </label>
            <select
              value={variantType}
              onChange={(e) => setVariantType(e.target.value as 'color' | 'finish' | 'profile')}
              className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616] yw-select"
            >
              <option value="color">{t('variantModal.typeOptions.color')}</option>
              <option value="finish">{t('variantModal.typeOptions.finish')}</option>
              <option value="profile">{t('variantModal.typeOptions.profile')}</option>
            </select>
          </div>

          {variantType === 'color' && (
            <div>
              <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                {t('variantModal.fields.hex')}
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={hexColor}
                  onChange={(e) => setHexColor(e.target.value)}
                  className="w-12 h-10 border border-[#E1E1E1] rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={hexColor}
                  onChange={(e) => setHexColor(e.target.value)}
                  className="flex-1 px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616]"
                  placeholder={t('variantModal.placeholders.hex')}
                />
              </div>
            </div>
          )}

          {variantType === 'color' && (
            <div>
              <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                {t('variantModal.fields.image')}
              </label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616]"
                placeholder={t('variantModal.placeholders.image')}
              />
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt=""
                  className="mt-2 h-20 w-20 rounded border border-[#E1E1E1] object-cover"
                />
              ) : null}
            </div>
          )}

          <div>
            <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
              {t('variantModal.fields.priceAdjustment')}
            </label>
            <input
              type="number"
              step="0.01"
              value={priceAdjustment}
              onChange={(e) => setPriceAdjustment(e.target.value)}
              className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616]"
              placeholder={t('variantModal.placeholders.priceAdjustment')}
            />
            <p className="text-xs text-[#535353] mt-1">{t('variantModal.priceHelp')}</p>
          </div>

          <div>
            <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
              {t('variantModal.fields.description')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616]"
              placeholder={t('variantModal.placeholders.description')}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_available"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="is_available" className="text-sm font-['DM_Sans']">
              {t('variantModal.fields.available')}
            </label>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] hover:bg-[#E1E1E1]"
            >
              {t('variantModal.buttons.cancel')}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-[#161616] text-white rounded-lg font-['DM_Sans'] hover:bg-[#2d2d2d]"
            >
              {t('variantModal.buttons.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
