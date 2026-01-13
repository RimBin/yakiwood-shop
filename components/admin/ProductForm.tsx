'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';
import { USAGE_TYPES } from '@/types/admin';
import { useLocale, useTranslations } from 'next-intl';
import { toLocalePath, type AppLocale } from '@/i18n/paths';

const ALLOWED_USAGE_TYPES = ['facade', 'terrace'] as const;
const ALLOWED_WOOD_TYPES = ['spruce', 'larch'] as const;

const WIDTH_OPTIONS_MM = [95, 120, 145] as const;
const LENGTH_OPTIONS_MM = [3000, 3300, 3600] as const;

const DEFAULT_FINISH_SLUG = 'natural';

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

function getDefaultFinishSlug(variants: Variant[]): string {
  const natural = variants.find((v) => slugify(v.name) === DEFAULT_FINISH_SLUG);
  if (natural?.name) return DEFAULT_FINISH_SLUG;

  const first = variants.find((v) => v.name?.trim()) ?? null;
  if (!first) return DEFAULT_FINISH_SLUG;

  const result = slugify(first.name);
  return result || DEFAULT_FINISH_SLUG;
}

function buildEnProductSlug(usageType: string, woodType: string, finishSlug: string): string {
  return slugify(`shou-sugi-ban-for-${usageType}-${woodType}-${finishSlug}`);
}

function buildLtProductSlug(usageType: string, woodType: string, finishSlug: string): string {
  const woodLt = woodType === 'larch' ? 'maumedis' : 'egle';
  const usageLt = usageType === 'terrace' ? 'terasai' : 'fasadui';
  const typeLt = usageType === 'terrace' ? 'terasine-lenta' : 'dailylente';
  return slugify(`degintos-medienos-${typeLt}-${usageLt}-${woodLt}-${finishSlug}`);
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
    base_price: z.number().min(0, t('validation.basePricePositive')),
    status: z.enum(['draft', 'published']),
    stock_quantity: z.number().min(0).optional(),
    sku: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
    depth: z.number().optional(),
  });
}

interface Variant {
  id?: string;
  name: string;
  variant_type: 'color' | 'finish';
  hex_color?: string;
  price_adjustment?: number;
  description?: string;
  is_available: boolean;
  tempId?: string;
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

  const catalogMigrationPath = 'supabase/migrations/20260111_catalog_options_assets_sale_thickness.sql';

  // Form state
  const [name, setName] = useState(product?.name || '');
  const [nameEn, setNameEn] = useState(product?.name_en || '');
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

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);

  // Auto-generate LT + EN slugs from usage/wood and default finish (Natural).
  // Stops per-field once user edits it manually (unless they clear it).
  useEffect(() => {
    const finish = getDefaultFinishSlug(variants);

    const usageOk = ALLOWED_USAGE_TYPES.includes(usageType as any);
    const woodOk = ALLOWED_WOOD_TYPES.includes(woodType as any);
    if (!usageOk || !woodOk) return;

    if (!isSlugManuallyEdited) {
      const nextLt = buildLtProductSlug(usageType, woodType, finish);
      if (nextLt && nextLt !== slug) setSlug(nextLt);
    }

    if (!isSlugEnManuallyEdited) {
      const nextEn = buildEnProductSlug(usageType, woodType, finish);
      if (nextEn && nextEn !== slugEn) setSlugEn(nextEn);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usageType, woodType, variants, isSlugManuallyEdited, isSlugEnManuallyEdited, slug, slugEn]);

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
        const labelLt = (row.label_lt as string | null) || undefined;
        const labelEn = (row.label_en as string | null) || undefined;
        const label = (locale === 'en' ? labelEn : labelLt) || labelLt || labelEn || code;
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
        base_price: parseFloat(basePrice),
        status,
        stock_quantity: stockQuantity ? parseInt(stockQuantity) : undefined,
        sku: sku || undefined,
        width: width ? parseFloat(width) : undefined,
        height: height ? parseFloat(height) : undefined,
        depth: depth ? parseFloat(depth) : undefined,
      });
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
        setErrors(newErrors);
      }
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
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
        base_price: parseFloat(basePrice),
        is_active: status === 'published',
        stock_quantity: stockQuantity ? parseInt(stockQuantity) : null,
        sku: sku || null,
        width: width ? parseFloat(width) : null,
        height: height ? parseFloat(height) : null,
        depth: depth ? parseFloat(depth) : null,
        image_url: finalImageUrl,
      };

      let productId = product?.id;

      if (mode === 'create') {
        // Create new product
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();

        if (error) throw error;
        productId = data.id;
      } else {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product!.id);

        if (error) throw error;
      }

      // Handle variants
      if (productId) {
        // Delete removed variants
        const existingVariantIds = product?.variants?.map(v => v.id).filter(Boolean) || [];
        const currentVariantIds = variants.map(v => v.id).filter(Boolean);
        const deletedVariantIds = existingVariantIds.filter(id => !currentVariantIds.includes(id));

        if (deletedVariantIds.length > 0) {
          await supabase
            .from('product_variants')
            .delete()
            .in('id', deletedVariantIds);
        }

        // Update or insert variants
        for (const variant of variants) {
          const variantData = {
            product_id: productId,
            name: variant.name,
            variant_type: variant.variant_type,
            hex_color: variant.hex_color || null,
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
      console.error('Error saving product:', error);
      setSaveError(error instanceof Error ? error.message : t('errors.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  // Handle product deletion
  const handleDelete = async () => {
    if (!product?.id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      router.push(toLocalePath('/admin/products', locale));
      router.refresh();
    } catch (error) {
      console.error('Error deleting product:', error);
      setSaveError(t('errors.deleteFailed'));
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

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Sidebar - Image Preview */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-[24px] p-6 border border-[#E1E1E1] sticky top-8">
          <h3 className="text-lg font-['DM_Sans'] font-medium mb-4">{t('sections.photo')}</h3>
          
          <div className="mb-4">
            {imagePreview ? (
              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-[#FAFAFA]">
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
              className="px-3 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] text-sm text-[#161616] hover:bg-[#FAFAFA]"
            >
              {showPhotoLibrary ? t('image.hideLibrary') : t('image.chooseFromLibrary')}
            </button>
            {(imagePreview || imageUrl) ? (
              <button
                type="button"
                onClick={clearImageSelection}
                className="px-3 py-2 border border-red-200 rounded-lg font-['DM_Sans'] text-sm text-red-700 hover:bg-red-50"
              >
                {t('image.remove')}
              </button>
            ) : null}
          </div>

          {showPhotoLibrary ? (
            <div className="mt-4 border border-[#E1E1E1] rounded-lg p-3 bg-[#FAFAFA]">
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
                    className="mt-1 w-full px-3 py-2 border border-[#E1E1E1] rounded-lg font-['Outfit'] text-sm bg-white"
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
                    className="mt-1 w-full px-3 py-2 border border-[#E1E1E1] rounded-lg font-['Outfit'] text-sm bg-white"
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
                    className="px-3 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] text-sm text-[#161616] hover:bg-white disabled:opacity-60"
                  >
                    {libraryIsLoading ? t('photoLibrary.refreshing') : t('photoLibrary.refresh')}
                  </button>
                  {libraryError ? (
                    <span className="font-['Outfit'] text-xs text-red-700">{libraryError}</span>
                  ) : null}
                </div>

                {isMissingCatalogSchemaError(libraryError) ? (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
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
                        className="relative group border border-[#E1E1E1] rounded-lg overflow-hidden bg-white"
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-['DM_Sans']">{saveError}</p>
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white rounded-[24px] p-6 border border-[#E1E1E1]">
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
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 ${
                    errors.name ? 'border-red-500 focus:ring-red-500' : 'border-[#E1E1E1] focus:ring-[#161616]'
                  }`}
                  placeholder={t('placeholders.nameLt')}
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                  {t('fields.nameEn')}
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616]"
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
                  className={`w-full px-4 py-2 border rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 ${
                    errors.slug ? 'border-red-500 focus:ring-red-500' : 'border-[#E1E1E1] focus:ring-[#161616]'
                  }`}
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
                  className={`w-full px-4 py-2 border rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 ${
                    errors.slug_en ? 'border-red-500 focus:ring-red-500' : 'border-[#E1E1E1] focus:ring-[#161616]'
                  }`}
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
                className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616]"
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
                className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616]"
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
        <div className="bg-white rounded-[24px] p-6 border border-[#E1E1E1]">
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
                className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616]"
                placeholder={t('placeholders.stockQuantity')}
              />
            </div>

            <div>
              <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                {t('fields.sku')}
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616]"
                placeholder={t('placeholders.sku')}
              />
            </div>
          </div>
        </div>

        {/* Dimensions */}
        <div className="bg-white rounded-[24px] p-6 border border-[#E1E1E1]">
          <h3 className="text-lg font-['DM_Sans'] font-medium mb-6">{t('sections.dimensions')}</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                {t('fields.width')}
              </label>
              <select
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616] bg-white yw-select"
              >
                {WIDTH_OPTIONS_MM.map((mm) => (
                  <option key={mm} value={String(mm)}>
                    {mm} mm
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                {t('fields.thickness')}
              </label>
              <select
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                disabled={!usageType}
                className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616] bg-white disabled:opacity-60 yw-select"
              >
                {!usageType ? (
                  <option value="">{t('placeholders.selectUsageFirst')}</option>
                ) : usageType === 'terrace' ? (
                  <option value="28">28 mm</option>
                ) : (
                  <option value="18">18/20 mm</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                {t('fields.length')}
              </label>
              <select
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616] bg-white yw-select"
              >
                {LENGTH_OPTIONS_MM.map((mm) => (
                  <option key={mm} value={String(mm)}>
                    {mm} mm
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-[24px] p-6 border border-[#E1E1E1]">
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
                    <div>
                      <div className="font-['DM_Sans'] font-medium">{variant.name}</div>
                      <div className="text-sm text-[#535353] font-['DM_Sans']">
                        {variant.variant_type === 'color' ? t('variants.typeLabelColor') : t('variants.typeLabelFinish')}
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

        {/* Publishing Options */}
        <div className="bg-white rounded-[24px] p-6 border border-[#E1E1E1]">
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
              className="px-6 py-3 border border-[#E1E1E1] rounded-[100px] font-['DM_Sans'] font-medium hover:bg-[#FAFAFA]"
            >
              {t('buttons.cancel')}
            </button>
          </div>

          {mode === 'edit' && (
            <button
              type="button"
              onClick={() => setDeleteModal(true)}
              className="px-6 py-3 border border-red-600 text-red-600 rounded-[100px] font-['DM_Sans'] font-medium hover:bg-red-50"
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
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
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
                className="px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] hover:bg-[#FAFAFA] disabled:opacity-50"
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
  const [variantType, setVariantType] = useState<'color' | 'finish'>(variant?.variant_type || 'color');
  const [hexColor, setHexColor] = useState(variant?.hex_color || '#161616');
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
      price_adjustment: parseFloat(priceAdjustment) || 0,
      description: description || undefined,
      is_available: isAvailable,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
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
              onChange={(e) => setVariantType(e.target.value as 'color' | 'finish')}
              className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616] yw-select"
            >
              <option value="color">{t('variantModal.typeOptions.color')}</option>
              <option value="finish">{t('variantModal.typeOptions.finish')}</option>
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
              className="px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] hover:bg-[#FAFAFA]"
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
