'use client';

import { useState, useEffect } from 'react';
import { InventoryTable } from '@/components/admin/InventoryTable';
import { RestockModal } from '@/components/admin/RestockModal';
import { AdjustmentModal } from '@/components/admin/AdjustmentModal';
import type { InventoryWithProduct, InventoryStats, InventoryFilters } from '@/lib/inventory/types';

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
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Inventory Management</h1>
        <p className="text-gray-600">Track and manage product inventory levels</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Total Items</div>
            <div className="text-3xl font-bold">{stats.total_items}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">In Stock</div>
            <div className={`text-3xl font-bold ${getStatusColor(stats.in_stock)}`}>
              {stats.in_stock}
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Low Stock</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.low_stock}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Out of Stock</div>
            <div className="text-3xl font-bold text-red-600">{stats.out_of_stock}</div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by SKU or location..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          {/* Status Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as InventoryFilters['status'] })}
          >
            <option value="all">All Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          {/* Actions */}
          <button
            onClick={() => setShowRestockModal(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Quick Restock
          </button>
          <button
            onClick={handleExportCSV}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading inventory...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-gray-600">
            No inventory items found
          </div>
        ) : (
          <>
            <InventoryTable
              items={items}
              onRestock={handleRestock}
              onAdjust={handleAdjust}
              onRefresh={fetchInventory}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 p-6 border-t">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
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
    </div>
  );
}
