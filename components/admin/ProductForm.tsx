'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { z } from 'zod';
import { USAGE_TYPES } from '@/types/admin';

// Validation schema
const productSchema = z.object({
  name: z.string().min(1, 'Pavadinimas privalomas'),
  name_en: z.string().optional(),
  slug: z.string().min(1, 'Slug privalomas').regex(/^[a-z0-9-]+$/, 'Slug turi būti tik mažosios raidės, skaičiai ir brūkšneliai'),
  description: z.string().optional(),
  description_en: z.string().optional(),
  category: z.string().min(1, 'Kategorija privaloma'),
  usage_type: z.string().min(1, 'Pritaikymas privalomas'),
  wood_type: z.string().min(1, 'Medienos tipas privalomas'),
  base_price: z.number().min(0, 'Kaina turi būti teigiama'),
  status: z.enum(['draft', 'published']),
  stock_quantity: z.number().min(0).optional(),
  sku: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  depth: z.number().optional(),
  weight: z.number().optional(),
});

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
  { value: 'pine', label: 'Pušis' },
  { value: 'spruce', label: 'Eglė' },
  { value: 'oak', label: 'Ąžuolas' },
  { value: 'larch', label: 'Maumedis' },
];

export default function ProductForm({ product, mode }: Props) {
  const router = useRouter();
  const supabase = createClient();

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

  // Form state
  const [name, setName] = useState(product?.name || '');
  const [nameEn, setNameEn] = useState(product?.name_en || '');
  const [slug, setSlug] = useState(product?.slug || '');
  const [description, setDescription] = useState(product?.description || '');
  const [descriptionEn, setDescriptionEn] = useState(product?.description_en || '');
  const [category, setCategory] = useState(product?.category || '');
  const [usageType, setUsageType] = useState(product?.usage_type || '');
  const [woodType, setWoodType] = useState(product?.wood_type || '');
  const [basePrice, setBasePrice] = useState(product?.base_price.toString() || '');
  const [status, setStatus] = useState<'draft' | 'published'>(product?.is_active ? 'published' : 'draft');
  const [stockQuantity, setStockQuantity] = useState(product?.stock_quantity?.toString() || '');
  const [sku, setSku] = useState(product?.sku || '');
  const [width, setWidth] = useState(product?.width?.toString() || '');
  const [height, setHeight] = useState(product?.height?.toString() || '');
  const [depth, setDepth] = useState(product?.depth?.toString() || '');
  const [weight, setWeight] = useState(product?.weight?.toString() || '');
  const [imageUrl, setImageUrl] = useState(product?.image_url || '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url || null);

  // Variants state
  const [variants, setVariants] = useState<Variant[]>(product?.variants || []);
  const [showVariantForm, setShowVariantForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);

  // Auto-generate slug from name
  useEffect(() => {
    if (mode === 'create' && name && !slug) {
      const generatedSlug = name
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  }, [name, mode, slug]);

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to Supabase Storage
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return imageUrl || null;

    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${slug}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageFile);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      return publicUrlData?.publicUrl || null;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    try {
      productSchema.parse({
        name,
        name_en: nameEn || undefined,
        slug,
        description: description || undefined,
        description_en: descriptionEn || undefined,
        category,
        usage_type: usageType,
        wood_type: woodType,
        base_price: parseFloat(basePrice),
        status,
        stock_quantity: stockQuantity ? parseInt(stockQuantity) : undefined,
        sku: sku || undefined,
        width: width ? parseFloat(width) : undefined,
        height: height ? parseFloat(height) : undefined,
        depth: depth ? parseFloat(depth) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
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
        description: description || null,
        description_en: descriptionEn || null,
        category,
        usage_type: usageType || null,
        wood_type: woodType,
        base_price: parseFloat(basePrice),
        is_active: status === 'published',
        stock_quantity: stockQuantity ? parseInt(stockQuantity) : null,
        sku: sku || null,
        width: width ? parseFloat(width) : null,
        height: height ? parseFloat(height) : null,
        depth: depth ? parseFloat(depth) : null,
        weight: weight ? parseFloat(weight) : null,
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

      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      console.error('Error saving product:', error);
      setSaveError(error instanceof Error ? error.message : 'Klaida išsaugant produktą');
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

      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      console.error('Error deleting product:', error);
      setSaveError('Klaida trinant produktą');
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
        <div className="bg-white rounded-lg p-6 shadow sticky top-8">
          <h3 className="text-lg font-['DM_Sans'] font-medium mb-4">Nuotrauka</h3>
          
          <div className="mb-4">
            {imagePreview ? (
              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-[#FAFAFA]">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full aspect-square rounded-lg bg-[#EAEAEA] flex items-center justify-center">
                <span className="text-[#BBBBBB] font-['DM_Sans']">Nėra nuotraukos</span>
              </div>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm font-['DM_Sans'] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#161616] file:text-white hover:file:bg-[#2d2d2d]"
          />

          {/* Slug Preview */}
          <div className="mt-6 pt-6 border-t border-[#E1E1E1]">
            <h4 className="text-sm font-['DM_Sans'] font-medium mb-2">URL peržiūra</h4>
            <p className="text-sm text-[#535353] font-['DM_Sans'] break-all">
              /produktai/{slug || 'product-slug'}
            </p>
          </div>

          {/* Quick Stats */}
          {mode === 'edit' && (
            <div className="mt-6 pt-6 border-t border-[#E1E1E1] space-y-2">
              <div className="flex justify-between text-sm font-['DM_Sans']">
                <span className="text-[#535353]">Variantų:</span>
                <span className="font-medium">{variants.length}</span>
              </div>
              <div className="flex justify-between text-sm font-['DM_Sans']">
                <span className="text-[#535353]">Statusas:</span>
                <span className={`font-medium ${status === 'published' ? 'text-green-600' : 'text-gray-600'}`}>
                  {status === 'published' ? 'Publikuotas' : 'Juodraštis'}
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
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-['DM_Sans'] font-medium mb-6">Pagrindinė informacija</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                  Pavadinimas (LT) *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 ${
                    errors.name ? 'border-red-500 focus:ring-red-500' : 'border-[#E1E1E1] focus:ring-[#161616]'
                  }`}
                  placeholder="Pvz., Deginta eglės dailylentė"
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                  Pavadinimas (EN)
                </label>
                <input
                  type="text"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616]"
                  placeholder="E.g., Burnt Spruce Cladding"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                Slug *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                className={`w-full px-4 py-2 border rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 ${
                  errors.slug ? 'border-red-500 focus:ring-red-500' : 'border-[#E1E1E1] focus:ring-[#161616]'
                }`}
                placeholder="pvz-deginta-egles-dailylente"
              />
              {errors.slug && <p className="text-sm text-red-600 mt-1">{errors.slug}</p>}
            </div>

            <div>
              <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                Aprašymas (LT)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616]"
                placeholder="Produkto aprašymas lietuvių kalba..."
              />
            </div>

            <div>
              <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                Aprašymas (EN)
              </label>
              <textarea
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616]"
                placeholder="Product description in English..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                  Pritaikymas *
                </label>
                <select
                  value={usageType}
                  onChange={(e) => setUsageType(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 ${
                    errors.usage_type ? 'border-red-500 focus:ring-red-500' : 'border-[#E1E1E1] focus:ring-[#161616]'
                  }`}
                >
                  <option value="">Pasirinkite pritaikyma</option>
                  {USAGE_TYPES.map((usage) => (
                    <option key={usage.value} value={usage.value}>
                      {usage.label}
                    </option>
                  ))}
                </select>
                {errors.usage_type && <p className="text-sm text-red-600 mt-1">{errors.usage_type}</p>}
              </div>

              <div>
                <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                  Kategorija *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 ${
                    errors.category ? 'border-red-500 focus:ring-red-500' : 'border-[#E1E1E1] focus:ring-[#161616]'
                  }`}
                >
                  <option value="">Pasirinkite kategoriją</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                  Medienos tipas *
                </label>
                <select
                  value={woodType}
                  onChange={(e) => setWoodType(e.target.value)}
                  className={`w-full px-4 py-2 border rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 ${
                    errors.wood_type ? 'border-red-500 focus:ring-red-500' : 'border-[#E1E1E1] focus:ring-[#161616]'
                  }`}
                >
                  <option value="">Pasirinkite medienos tipą</option>
                  {WOOD_TYPES.map(wood => (
                    <option key={wood.value} value={wood.value}>{wood.label}</option>
                  ))}
                </select>
                {errors.wood_type && <p className="text-sm text-red-600 mt-1">{errors.wood_type}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-['DM_Sans'] font-medium mb-6">Kaina ir atsargos</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                Bazinė kaina (EUR) *
              </label>
              <input
                type="number"
                step="0.01"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 ${
                  errors.base_price ? 'border-red-500 focus:ring-red-500' : 'border-[#E1E1E1] focus:ring-[#161616]'
                }`}
                placeholder="0.00"
              />
              {errors.base_price && <p className="text-sm text-red-600 mt-1">{errors.base_price}</p>}
            </div>

            <div>
              <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                Atsargos (vnt.)
              </label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616]"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                SKU kodas
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616]"
                placeholder="SKU-001"
              />
            </div>
          </div>
        </div>

        {/* Dimensions */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-['DM_Sans'] font-medium mb-6">Matmenys</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                Plotis (mm)
              </label>
              <input
                type="number"
                step="0.1"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616]"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                Aukštis (mm)
              </label>
              <input
                type="number"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616]"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                Gylis (mm)
              </label>
              <input
                type="number"
                step="0.1"
                value={depth}
                onChange={(e) => setDepth(e.target.value)}
                className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616]"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                Svoris (kg)
              </label>
              <input
                type="number"
                step="0.01"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616]"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white rounded-lg p-6 shadow">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-['DM_Sans'] font-medium">Variantai</h3>
            <button
              type="button"
              onClick={() => {
                setEditingVariant(null);
                setShowVariantForm(true);
              }}
              className="px-4 py-2 bg-[#161616] text-white rounded-lg font-['DM_Sans'] text-sm hover:bg-[#2d2d2d]"
            >
              + Pridėti variantą
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
                        {variant.variant_type === 'color' ? 'Spalva' : 'Apdaila'}
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
                      Redaguoti
                    </button>
                    <button
                      type="button"
                      onClick={() => removeVariant(variant)}
                      className="text-sm text-red-600 hover:underline font-['DM_Sans']"
                    >
                      Ištrinti
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#535353] font-['DM_Sans'] text-center py-8">
              Dar nėra variantų. Pridėkite spalvas ar apdailos variantus.
            </p>
          )}
        </div>

        {/* Publishing Options */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h3 className="text-lg font-['DM_Sans'] font-medium mb-6">Publikavimas</h3>
          
          <div>
            <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
              Statusas
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616]"
            >
              <option value="draft">Juodraštis</option>
              <option value="published">Publikuotas</option>
            </select>
            <p className="text-sm text-[#535353] font-['DM_Sans'] mt-2">
              {status === 'draft' 
                ? 'Produktas matomas tik administratoriams' 
                : 'Produktas matomas visiems lankytojams'}
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
              {isSaving ? 'Išsaugoma...' : mode === 'create' ? 'Sukurti produktą' : 'Išsaugoti pakeitimus'}
            </button>
            
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-[#E1E1E1] rounded-[100px] font-['DM_Sans'] font-medium hover:bg-[#FAFAFA]"
            >
              Atšaukti
            </button>
          </div>

          {mode === 'edit' && (
            <button
              type="button"
              onClick={() => setDeleteModal(true)}
              className="px-6 py-3 border border-red-600 text-red-600 rounded-[100px] font-['DM_Sans'] font-medium hover:bg-red-50"
            >
              Ištrinti produktą
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
              Patvirtinti trynimą
            </h3>
            <p className="text-[#535353] font-['DM_Sans'] mb-6">
              Ar tikrai norite visam laikui ištrinti šį produktą? Šio veiksmo negalima atšaukti.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModal(false)}
                disabled={isSaving}
                className="px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] hover:bg-[#FAFAFA] disabled:opacity-50"
              >
                Atšaukti
              </button>
              <button
                onClick={handleDelete}
                disabled={isSaving}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-['DM_Sans'] hover:bg-red-700 disabled:opacity-50"
              >
                {isSaving ? 'Trinamas...' : 'Ištrinti'}
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
  const [name, setName] = useState(variant?.name || '');
  const [variantType, setVariantType] = useState<'color' | 'finish'>(variant?.variant_type || 'color');
  const [hexColor, setHexColor] = useState(variant?.hex_color || '#161616');
  const [priceAdjustment, setPriceAdjustment] = useState(variant?.price_adjustment?.toString() || '0');
  const [description, setDescription] = useState(variant?.description || '');
  const [isAvailable, setIsAvailable] = useState(variant?.is_available ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
          {variant ? 'Redaguoti variantą' : 'Naujas variantas'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
              Pavadinimas *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616]"
              placeholder="Pvz., Natūrali deginta"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
              Tipas *
            </label>
            <select
              value={variantType}
              onChange={(e) => setVariantType(e.target.value as 'color' | 'finish')}
              className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616]"
            >
              <option value="color">Spalva</option>
              <option value="finish">Apdaila</option>
            </select>
          </div>

          {variantType === 'color' && (
            <div>
              <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
                Spalvos kodas (HEX)
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
                  placeholder="#161616"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
              Kainos koregavimas (EUR)
            </label>
            <input
              type="number"
              step="0.01"
              value={priceAdjustment}
              onChange={(e) => setPriceAdjustment(e.target.value)}
              className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616]"
              placeholder="0.00"
            />
            <p className="text-xs text-[#535353] mt-1">Teigiama reikšmė prideda, neigiama atima nuo bazinės kainos</p>
          </div>

          <div>
            <label className="block text-sm font-['DM_Sans'] font-medium mb-2">
              Aprašymas
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616]"
              placeholder="Papildomas aprašymas..."
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
              Variantas prieinamas užsakymui
            </label>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] hover:bg-[#FAFAFA]"
            >
              Atšaukti
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#161616] text-white rounded-lg font-['DM_Sans'] hover:bg-[#2d2d2d]"
            >
              Išsaugoti
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
