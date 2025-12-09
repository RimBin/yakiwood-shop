'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

type VariantInput = {
  id?: string;
  name: string;
  variantType: string;
  hexColor?: string;
  priceAdjustment?: number;
  stockQuantity?: number;
  sku?: string;
  isAvailable?: boolean;
};

type ProductFormState = {
  name: string;
  slug: string;
  basePrice: string;
  woodType: string;
  category: string;
  description: string;
  imageUrl: string;
  model3dUrl: string;
  isActive: boolean;
};

const defaultProduct: ProductFormState = {
  name: '',
  slug: '',
  basePrice: '',
  woodType: 'spruce',
  category: 'cladding',
  description: '',
  imageUrl: '',
  model3dUrl: '',
  isActive: true,
};

export default function AdminPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState<ProductFormState>(defaultProduct);
  const [variants, setVariants] = useState<VariantInput[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setSessionReady(true);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    loadProducts();
  }, []);

  const authHeaders = (): Record<string, string> => {
    if (!session?.access_token) return {};
    return { Authorization: `Bearer ${session.access_token}` };
  };

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    router.push('/login');
  };

  const handleFileChange = async (file: File) => {
    if (!session) {
      setError('Prieš įkeldami nuotraukas prisijunkite.');
      return;
    }
    setUploading(true);
    setError(null);
    setStatus(null);

    try {
      const uploadResponse = await fetch('/api/admin/uploads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
        }),
      });

      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || 'Nepavyko sukurti įkėlimo nuorodos');
      }

      const putResponse = await fetch(uploadData.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!putResponse.ok) {
        throw new Error('Nepavyko įkelti failo');
      }

      setForm((prev) => ({ ...prev, imageUrl: uploadData.publicUrl }));
      setStatus('Nuotrauka įkelta');
    } catch (err: any) {
      setError(err.message || 'Nepavyko įkelti nuotraukos');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setError('Turite prisijungti, kad kurtumėte produktą.');
      return;
    }

    setSaving(true);
    setError(null);
    setStatus(null);

    try {
      const payload = {
        ...form,
        basePrice: Number(form.basePrice),
        variants: variants.filter((v) => v.name && v.variantType),
      };

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders(),
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Nepavyko sukurti produkto');
      }

      setStatus('Produktas sukurtas');
      setForm(defaultProduct);
      setVariants([]);
      await loadProducts();
    } catch (err: any) {
      setError(err.message || 'Nepavyko išsaugoti produkto');
    } finally {
      setSaving(false);
    }
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        name: '',
        variantType: 'color',
        hexColor: '',
        priceAdjustment: 0,
        stockQuantity: 0,
        isAvailable: true,
      },
    ]);
  };

  const updateVariant = (index: number, key: keyof VariantInput, value: string | number | boolean) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  if (!sessionReady) {
    return (
      <main className="min-h-screen bg-[#E1E1E1] flex items-center justify-center">
        <p className="text-[#161616]">Kraunama...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-[#E1E1E1] flex items-center justify-center px-4">
        <div className="bg-white rounded-[12px] p-8 max-w-[480px] w-full text-center shadow-sm">
          <h1 className="font-['DM_Sans'] text-[32px] font-light tracking-tight text-[#161616] mb-4">
            Reikalingas prisijungimas
          </h1>
          <p className="font-['Outfit'] text-[14px] text-[#535353] mb-6">
            Prisijunkite su administratoriaus paskyra (ADMIN_EMAILS).
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full h-[48px] rounded-[100px] bg-[#161616] text-white font-['Outfit'] text-[12px] tracking-[0.6px] uppercase hover:bg-[#535353]"
          >
            Eiti į prisijungimą
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#E1E1E1] px-[16px] md:px-[40px] py-[32px]">
      <div className="max-w-[1200px] mx-auto">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <p className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">
              Turinys ir produktų valdymas
            </p>
            <h1 className="font-['DM_Sans'] text-[40px] md:text-[56px] font-light text-[#161616] leading-[1] tracking-[-1.6px]">
              Admin skydelis
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-[8px] px-4 py-2 text-left">
              <p className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">
                Prisijungęs
              </p>
              <p className="font-['Outfit'] text-[14px] text-[#161616]">{session.user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="h-[40px] px-[16px] rounded-[100px] border border-[#161616] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#161616] hover:bg-[#161616] hover:text-white transition-colors"
            >
              Atsijungti
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <div className="bg-white rounded-[12px] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">
                  Produktų kūrimas
                </p>
                <h2 className="font-['DM_Sans'] text-[24px] font-light text-[#161616] tracking-[-0.6px]">
                  Naujas produktas
                </h2>
              </div>
              {status && <span className="text-[12px] text-green-700">{status}</span>}
              {error && <span className="text-[12px] text-red-600">{error}</span>}
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] uppercase tracking-[0.6px] text-[#161616] mb-2">
                    Pavadinimas
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="w-full h-[44px] border border-[#BBBBBB] rounded-[8px] px-3 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[12px] uppercase tracking-[0.6px] text-[#161616] mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    placeholder="auto-generuojamas jei tuščias"
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full h-[44px] border border-[#BBBBBB] rounded-[8px] px-3 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[12px] uppercase tracking-[0.6px] text-[#161616] mb-2">
                    Kaina (EUR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.basePrice}
                    onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                    required
                    className="w-full h-[44px] border border-[#BBBBBB] rounded-[8px] px-3 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[12px] uppercase tracking-[0.6px] text-[#161616] mb-2">
                    Kategorija
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full h-[44px] border border-[#BBBBBB] rounded-[8px] px-3 bg-white"
                  >
                    <option value="cladding">Cladding</option>
                    <option value="decking">Decking</option>
                    <option value="furniture">Furniture</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] uppercase tracking-[0.6px] text-[#161616] mb-2">
                    Medienos tipas
                  </label>
                  <select
                    value={form.woodType}
                    onChange={(e) => setForm({ ...form, woodType: e.target.value })}
                    className="w-full h-[44px] border border-[#BBBBBB] rounded-[8px] px-3 bg-white"
                  >
                    <option value="spruce">Spruce</option>
                    <option value="larch">Larch</option>
                    <option value="pine">Pine</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] uppercase tracking-[0.6px] text-[#161616] mb-2">
                    Modelio URL (GLB)
                  </label>
                  <input
                    type="url"
                    value={form.model3dUrl}
                    onChange={(e) => setForm({ ...form, model3dUrl: e.target.value })}
                    className="w-full h-[44px] border border-[#BBBBBB] rounded-[8px] px-3 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] uppercase tracking-[0.6px] text-[#161616] mb-2">
                  Aprašymas
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full border border-[#BBBBBB] rounded-[8px] px-3 py-2 bg-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="block text-[12px] uppercase tracking-[0.6px] text-[#161616]">
                  Nuotrauka
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                    className="w-full"
                  />
                  {uploading && <span className="text-[12px] text-[#535353]">Įkeliama...</span>}
                  {form.imageUrl && (
                    <span className="text-[12px] text-green-700 truncate max-w-[200px]">
                      {form.imageUrl}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" className="text-[14px] text-[#161616]">
                  Produktas aktyvus
                </label>
              </div>

              <div className="border border-dashed border-[#BBBBBB] rounded-[10px] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-['DM_Sans'] text-[18px] text-[#161616]">Variantai</h3>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="h-[36px] px-[12px] rounded-[8px] border border-[#161616] text-[12px] uppercase tracking-[0.6px] hover:bg-[#161616] hover:text-white transition-colors"
                  >
                    Pridėti
                  </button>
                </div>
                {variants.length === 0 && (
                  <p className="text-[14px] text-[#535353]">Kol kas nėra variantų.</p>
                )}
                <div className="space-y-4">
                  {variants.map((variant, idx) => (
                    <div key={idx} className="border border-[#E1E1E1] rounded-[8px] p-3 bg-[#F8F8F8]">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          placeholder="Pavadinimas"
                          value={variant.name}
                          onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                          className="h-[40px] border border-[#BBBBBB] rounded-[8px] px-3 bg-white"
                        />
                        <select
                          value={variant.variantType}
                          onChange={(e) => updateVariant(idx, 'variantType', e.target.value)}
                          className="h-[40px] border border-[#BBBBBB] rounded-[8px] px-3 bg-white"
                        >
                          <option value="color">Color</option>
                          <option value="finish">Finish</option>
                          <option value="size">Size</option>
                        </select>
                        <input
                          placeholder="#000000"
                          value={variant.hexColor || ''}
                          onChange={(e) => updateVariant(idx, 'hexColor', e.target.value)}
                          className="h-[40px] border border-[#BBBBBB] rounded-[8px] px-3 bg-white"
                        />
                        <input
                          type="number"
                          placeholder="Kainos korekcija"
                          value={variant.priceAdjustment ?? 0}
                          onChange={(e) => updateVariant(idx, 'priceAdjustment', Number(e.target.value))}
                          className="h-[40px] border border-[#BBBBBB] rounded-[8px] px-3 bg-white"
                        />
                        <input
                          type="number"
                          placeholder="Kiekis sandėlyje"
                          value={variant.stockQuantity ?? 0}
                          onChange={(e) => updateVariant(idx, 'stockQuantity', Number(e.target.value))}
                          className="h-[40px] border border-[#BBBBBB] rounded-[8px] px-3 bg-white"
                        />
                        <input
                          placeholder="SKU"
                          value={variant.sku || ''}
                          onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                          className="h-[40px] border border-[#BBBBBB] rounded-[8px] px-3 bg-white"
                        />
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <label className="flex items-center gap-2 text-[14px] text-[#161616]">
                          <input
                            type="checkbox"
                            checked={variant.isAvailable ?? true}
                            onChange={(e) => updateVariant(idx, 'isAvailable', e.target.checked)}
                          />
                          Galimas prekybai
                        </label>
                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          className="text-[12px] text-[#F63333] uppercase tracking-[0.6px]"
                        >
                          Pašalinti
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setForm(defaultProduct);
                    setVariants([]);
                    setError(null);
                    setStatus(null);
                  }}
                  className="h-[44px] px-[16px] rounded-[100px] border border-[#161616] text-[12px] uppercase tracking-[0.6px] text-[#161616] hover:bg-[#161616] hover:text-white transition-colors"
                >
                  Atšaukti
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-[44px] px-[20px] rounded-[100px] bg-[#161616] text-white text-[12px] uppercase tracking-[0.6px] hover:bg-[#535353] transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saugoma...' : 'Išsaugoti produktą'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-[12px] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">
                  Produktai
                </p>
                <h2 className="font-['DM_Sans'] text-[20px] font-light text-[#161616] tracking-[-0.5px]">
                  Greita peržiūra
                </h2>
              </div>
              <button
                type="button"
                onClick={loadProducts}
                className="h-[36px] px-[12px] rounded-[8px] border border-[#161616] text-[12px] uppercase tracking-[0.6px] hover:bg-[#161616] hover:text-white transition-colors"
              >
                Atnaujinti
              </button>
            </div>
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border border-[#E1E1E1] rounded-[10px] p-3 bg-[#F8F8F8] flex items-center justify-between"
                >
                  <div>
                    <p className="font-['DM_Sans'] text-[16px] text-[#161616]">{product.name}</p>
                    <p className="font-['Outfit'] text-[12px] text-[#535353]">
                      {product.category} • {product.woodType}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-['DM_Sans'] text-[16px] text-[#161616]">
                      €{Number(product.basePrice || product.base_price || 0).toFixed(2)}
                    </p>
                    <p className="font-['Outfit'] text-[12px] text-[#535353]">
                      {(product.isActive === false || product.is_active === false) ? 'Išjungtas' : 'Aktyvus'}
                    </p>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <p className="text-[14px] text-[#535353]">Produktų dar nėra.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
