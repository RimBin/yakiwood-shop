'use client';

import { useState, useEffect } from 'react';
import { InventoryTable } from '@/components/admin/InventoryTable';
import { RestockModal } from '@/components/admin/RestockModal';
import { AdjustmentModal } from '@/components/admin/AdjustmentModal';
import type { InventoryWithProduct, InventoryStats, InventoryFilters } from '@/lib/inventory/types';
import {
  AdminBody,
  AdminButton,
  AdminCard,
  AdminInput,
  AdminKicker,
  AdminLabel,
  AdminSectionTitle,
  AdminSelect,
  AdminStack,
} from '@/components/admin/ui/AdminUI';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryWithProduct[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [filters, setFilters] = useState<InventoryFilters>({
    status: 'all',
    search: '',
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [selectedSku, setSelectedSku] = useState<string | null>(null);

  // Fetch inventory data
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(filters.status && filters.status !== 'all' && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`/api/inventory?${params}`);
      if (!response.ok) throw new Error('Failed to fetch inventory');

      const data = await response.json();
      setItems(data.items || []);
      setStats(data.stats);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [page, filters]);

  const handleRestock = (sku: string) => {
    setSelectedSku(sku);
    setShowRestockModal(true);
  };

  const handleAdjust = (sku: string) => {
    setSelectedSku(sku);
    setShowAdjustmentModal(true);
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = ['SKU', 'Product', 'Available', 'Reserved', 'Sold', 'Location', 'Reorder Point', 'Status'];
    const rows = items.map(item => [
      item.sku,
      item.product?.name || 'Unknown',
      item.quantity_available,
      item.quantity_reserved,
      item.quantity_sold,
      item.location || '',
      item.reorder_point,
      item.quantity_available === 0 ? 'Out of Stock' :
        item.quantity_available <= item.reorder_point ? 'Low Stock' : 'In Stock',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (count: number) => {
    if (count === 0) return 'text-gray-500';
    if (count < 5) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <AdminBody className="pt-[clamp(16px,2vw,24px)]">
      <AdminStack>
        <div>
          <AdminKicker>Atsargos</AdminKicker>
          <div className="mt-[8px]">
            <AdminSectionTitle>Atsargų valdymas</AdminSectionTitle>
          </div>
          <p className="mt-[8px] font-['Outfit'] text-[14px] text-[#535353]">
            Sekite ir valdykite produktų atsargų lygius
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-[clamp(12px,2vw,16px)]">
            <AdminCard>
              <AdminKicker>Bendras kiekis</AdminKicker>
              <div className="mt-[8px] font-['DM_Sans'] font-light text-[32px] tracking-[-1.28px] text-[#161616]">
                {stats.total_items}
              </div>
            </AdminCard>
            <AdminCard>
              <AdminKicker>Turime</AdminKicker>
              <div className={`mt-[8px] font-['DM_Sans'] font-light text-[32px] tracking-[-1.28px] ${getStatusColor(stats.in_stock)}`}>
                {stats.in_stock}
              </div>
            </AdminCard>
            <AdminCard>
              <AdminKicker>Mažai</AdminKicker>
              <div className="mt-[8px] font-['DM_Sans'] font-light text-[32px] tracking-[-1.28px] text-yellow-600">
                {stats.low_stock}
              </div>
            </AdminCard>
            <AdminCard>
              <AdminKicker>Nėra</AdminKicker>
              <div className="mt-[8px] font-['DM_Sans'] font-light text-[32px] tracking-[-1.28px] text-red-600">
                {stats.out_of_stock}
              </div>
            </AdminCard>
          </div>
        )}

        <AdminCard>
          <div className="flex flex-col md:flex-row gap-[12px]">
            <div className="flex-1">
              <AdminLabel className="mb-[6px]">Paieška</AdminLabel>
              <AdminInput
                type="text"
                placeholder="Ieškoti pagal SKU arba vietą..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>

            <div>
              <AdminLabel className="mb-[6px]">Statusas</AdminLabel>
              <AdminSelect
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as InventoryFilters['status'] })}
              >
                <option value="all">Visi</option>
                <option value="in_stock">Turime</option>
                <option value="low_stock">Mažai</option>
                <option value="out_of_stock">Nėra</option>
              </AdminSelect>
            </div>

            <div className="flex items-end gap-[12px]">
              <AdminButton onClick={() => setShowRestockModal(true)}>
                Greitas papildymas
              </AdminButton>
              <AdminButton variant="secondary" onClick={handleExportCSV}>
                Eksportuoti CSV
              </AdminButton>
            </div>
          </div>
        </AdminCard>

        <AdminCard className="p-0 overflow-hidden">
          {loading ? (
            <div className="p-[64px] text-center">
              <div className="font-['Outfit'] text-[14px] text-[#7C7C7C]">Kraunama...</div>
            </div>
          ) : items.length === 0 ? (
            <div className="p-[64px] text-center">
              <div className="font-['Outfit'] text-[14px] text-[#7C7C7C]">Nerasta atsargų įrašų</div>
            </div>
          ) : (
            <>
              <InventoryTable items={items} onRestock={handleRestock} onAdjust={handleAdjust} onRefresh={fetchInventory} />

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-[8px] p-[16px] border-t border-[#E1E1E1]">
                  <AdminButton
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Ankstesnis
                  </AdminButton>
                  <span className="px-[12px] font-['Outfit'] text-[12px] text-[#535353]">
                    {page} / {totalPages}
                  </span>
                  <AdminButton
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Kitas
                  </AdminButton>
                </div>
              )}
            </>
          )}
        </AdminCard>

        {showRestockModal && (
          <RestockModal
            sku={selectedSku}
            onClose={() => {
              setShowRestockModal(false);
              setSelectedSku(null);
            }}
            onSuccess={() => {
              fetchInventory();
              setShowRestockModal(false);
              setSelectedSku(null);
            }}
          />
        )}

        {showAdjustmentModal && selectedSku && (
          <AdjustmentModal
            sku={selectedSku}
            onClose={() => {
              setShowAdjustmentModal(false);
              setSelectedSku(null);
            }}
            onSuccess={() => {
              fetchInventory();
              setShowAdjustmentModal(false);
              setSelectedSku(null);
            }}
          />
        )}
      </AdminStack>
    </AdminBody>
  );
}
