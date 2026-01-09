'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Variant {
  id: string;
  name: string;
  variant_type: string;
  hex_color?: string;
  price_adjustment?: number;
  is_available: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  base_price: number;
  wood_type?: string;
  category?: string;
  usage_type?: string;
  image_url?: string;
  image?: string;
  is_active: boolean;
  stock_quantity?: number;
  sku?: string;
  variants?: Variant[];
  created_at: string;
}

interface Props {
  initialProducts: Product[];
}

const USAGE_LABELS: Record<string, string> = {
  facade: 'Fasadui',
  terrace: 'Terasai',
  interior: 'Interjerui',
  fence: 'Tvoroms',
};

export default function ProductsAdminClient({ initialProducts }: Props) {
  const router = useRouter();
  const supabase = createClient();

  if (!supabase) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-10 py-8">
        <h1 className="font-['DM_Sans'] text-2xl font-medium text-[#161616]">
          Supabase is not configured
        </h1>
        <p className="font-['Outfit'] text-sm text-[#535353] mt-2">
          Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
        </p>
      </div>
    );
  }
  
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [usageFilter, setUsageFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.slug.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesUsage = usageFilter === 'all' || product.usage_type === usageFilter;
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && product.is_active) ||
                           (statusFilter === 'inactive' && !product.is_active);
      return matchesSearch && matchesCategory && matchesUsage && matchesStatus;
    });
  }, [products, searchQuery, categoryFilter, usageFilter, statusFilter]);

  const handleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      setProducts(products.map(p => 
        p.id === id ? { ...p, is_active: false } : p
      ));
      setDeleteConfirmId(null);
      router.refresh();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Klaida trinant produktą');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Ar tikrai norite ištrinti ${selectedIds.size} produktų?`)) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .in('id', Array.from(selectedIds));

      if (error) throw error;

      setProducts(products.map(p => 
        selectedIds.has(p.id) ? { ...p, is_active: false } : p
      ));
      setSelectedIds(new Set());
      router.refresh();
    } catch (error) {
      console.error('Error bulk deleting:', error);
      alert('Klaida trinant produktus');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkToggleStatus = async (active: boolean) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: active })
        .in('id', Array.from(selectedIds));

      if (error) throw error;

      setProducts(products.map(p => 
        selectedIds.has(p.id) ? { ...p, is_active: active } : p
      ));
      setSelectedIds(new Set());
      router.refresh();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Klaida keičiant būseną');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async (product: Product) => {
    const newName = `${product.name} (kopija)`;
    const newSlug = `${product.slug}-copy-${Date.now()}`;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: newName,
          slug: newSlug,
          description: product.description,
          base_price: product.base_price,
          wood_type: product.wood_type,
          category: product.category,
          usage_type: product.usage_type,
          image: product.image,
          is_active: false,
          stock_quantity: product.stock_quantity,
          sku: product.sku ? `${product.sku}-COPY` : undefined,
        })
        .select()
        .single();

      if (error) throw error;

      // Duplicate variants
      if (product.variants && product.variants.length > 0) {
        const variantsCopy = product.variants.map(v => ({
          product_id: data.id,
          name: v.name,
          variant_type: v.variant_type,
          hex_color: v.hex_color,
          price_adjustment: v.price_adjustment,
          is_available: v.is_available,
        }));

        await supabase.from('product_variants').insert(variantsCopy);
      }

      router.push(`/admin/products/${data.id}`);
    } catch (error) {
      console.error('Error duplicating product:', error);
      alert('Klaida dubliuojant produktą');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Ieškoti produktų..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] focus:outline-none focus:ring-2 focus:ring-[#161616]"
          />
        </div>
        
        <Link
          href="/admin/products/new"
          className="px-6 py-3 bg-[#161616] text-white rounded-[100px] font-['DM_Sans'] font-medium hover:bg-[#2d2d2d] transition-colors"
        >
          + Naujas produktas
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] bg-white"
        >
          <option value="all">Visos kategorijos</option>
          <option value="cladding">Fasadai</option>
          <option value="decking">Lentos</option>
          <option value="interior">Interjeras</option>
          <option value="tiles">Plytelės</option>
        </select>

        <select
          value={usageFilter}
          onChange={(e) => setUsageFilter(e.target.value)}
          className="px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] bg-white"
        >
          <option value="all">Visi pritaikymai</option>
          <option value="facade">Fasadui</option>
          <option value="terrace">Terasai</option>
          <option value="interior">Interjerui</option>
          <option value="fence">Tvoroms</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] bg-white"
        >
          <option value="all">Visi statusai</option>
          <option value="active">Aktyvūs</option>
          <option value="inactive">Neaktyvūs</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex gap-3 items-center p-4 bg-[#EAEAEA] rounded-lg">
          <span className="font-['DM_Sans'] text-[#161616]">
            Pasirinkta: {selectedIds.size}
          </span>
          <button
            onClick={() => handleBulkToggleStatus(true)}
            disabled={isDeleting}
            className="px-4 py-2 bg-white border border-[#E1E1E1] rounded-lg font-['DM_Sans'] hover:bg-[#f5f5f5] disabled:opacity-50"
          >
            Publikuoti
          </button>
          <button
            onClick={() => handleBulkToggleStatus(false)}
            disabled={isDeleting}
            className="px-4 py-2 bg-white border border-[#E1E1E1] rounded-lg font-['DM_Sans'] hover:bg-[#f5f5f5] disabled:opacity-50"
          >
            Nuimti
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-['DM_Sans'] hover:bg-red-700 disabled:opacity-50"
          >
            Ištrinti
          </button>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#FAFAFA] border-b border-[#E1E1E1]">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredProducts.length && filteredProducts.length > 0}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium font-['DM_Sans'] text-[#161616]">
                  Produktas
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium font-['DM_Sans'] text-[#161616]">
                  Kategorija
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium font-['DM_Sans'] text-[#161616]">
                  Pritaikymas
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium font-['DM_Sans'] text-[#161616]">
                  Kaina
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium font-['DM_Sans'] text-[#161616]">
                  Atsargos
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium font-['DM_Sans'] text-[#161616]">
                  Statusas
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium font-['DM_Sans'] text-[#161616]">
                  Veiksmai
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E1E1E1]">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-[#FAFAFA]">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.id)}
                      onChange={() => handleSelectOne(product.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.image_url || product.image ? (
                        <Image
                          src={product.image_url || product.image || ''}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-[#EAEAEA] rounded-lg flex items-center justify-center">
                          <span className="text-[#BBBBBB] text-xs">No img</span>
                        </div>
                      )}
                      <div>
                        <div className="font-['DM_Sans'] font-medium text-[#161616]">
                          {product.name}
                        </div>
                        <div className="text-sm text-[#535353]">{product.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-['DM_Sans'] text-[#535353]">
                    {product.category || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-['DM_Sans'] text-[#535353]">
                    {product.usage_type ? (USAGE_LABELS[product.usage_type] || product.usage_type) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-['DM_Sans'] font-medium text-[#161616]">
                    €{product.base_price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm font-['DM_Sans'] text-[#535353]">
                    {product.stock_quantity ?? '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-['DM_Sans'] rounded-full ${
                      product.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.is_active ? 'Aktyvus' : 'Neaktyvus'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-sm text-[#161616] hover:underline font-['DM_Sans']"
                      >
                        Redaguoti
                      </Link>
                      <span className="text-[#E1E1E1]">|</span>
                      <Link
                        href={`/produktai/${product.slug}`}
                        target="_blank"
                        className="text-sm text-[#535353] hover:underline font-['DM_Sans']"
                      >
                        Peržiūra
                      </Link>
                      <span className="text-[#E1E1E1]">|</span>
                      <button
                        onClick={() => handleDuplicate(product)}
                        className="text-sm text-[#535353] hover:underline font-['DM_Sans']"
                      >
                        Dubliuoti
                      </button>
                      <span className="text-[#E1E1E1]">|</span>
                      <button
                        onClick={() => setDeleteConfirmId(product.id)}
                        className="text-sm text-red-600 hover:underline font-['DM_Sans']"
                      >
                        Ištrinti
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#535353] font-['DM_Sans']">
              {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
                ? 'Produktų nerasta'
                : 'Dar nėra produktų'}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-['DM_Sans'] font-medium mb-4">
              Patvirtinti trynimą
            </h3>
            <p className="text-[#535353] font-['DM_Sans'] mb-6">
              Ar tikrai norite ištrinti šį produktą? Jis bus pažymėtas kaip neaktyvus.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-[#E1E1E1] rounded-lg font-['DM_Sans'] hover:bg-[#FAFAFA] disabled:opacity-50"
              >
                Atšaukti
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-['DM_Sans'] hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Trinamas...' : 'Ištrinti'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
