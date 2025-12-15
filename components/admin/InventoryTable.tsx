'use client';

import { useState } from 'react';
import type { InventoryWithProduct } from '@/lib/inventory/types';
import Image from 'next/image';

interface InventoryTableProps {
  items: InventoryWithProduct[];
  onRestock: (sku: string) => void;
  onAdjust: (sku: string) => void;
  onRefresh: () => void;
}

export function InventoryTable({ items, onRestock, onAdjust, onRefresh }: InventoryTableProps) {
  const [sortField, setSortField] = useState<keyof InventoryWithProduct>('updated_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof InventoryWithProduct) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedItems = [...items].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    return 0;
  });

  const getStatusBadge = (item: InventoryWithProduct) => {
    if (item.quantity_available === 0) {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
          Out of Stock
        </span>
      );
    }
    if (item.quantity_available <= item.reorder_point) {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
          Low Stock
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
        In Stock
      </span>
    );
  };

  const SortIcon = ({ field }: { field: keyof InventoryWithProduct }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">↕</span>;
    }
    return <span className="text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('sku')}
            >
              <div className="flex items-center gap-2">
                SKU <SortIcon field="sku" />
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('quantity_available')}
            >
              <div className="flex items-center gap-2">
                Available <SortIcon field="quantity_available" />
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('quantity_reserved')}
            >
              <div className="flex items-center gap-2">
                Reserved <SortIcon field="quantity_reserved" />
              </div>
            </th>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('quantity_sold')}
            >
              <div className="flex items-center gap-2">
                Sold <SortIcon field="quantity_sold" />
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedItems.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  {item.product?.image_url && (
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.product?.name || 'Unknown Product'}
                    </div>
                    {item.product?.slug && (
                      <div className="text-sm text-gray-500">{item.product.slug}</div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-mono text-gray-900">{item.sku}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-bold text-gray-900">
                  {item.quantity_available}
                </div>
                <div className="text-xs text-gray-500">
                  Reorder: {item.reorder_point}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{item.quantity_reserved}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{item.quantity_sold}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{item.location || '-'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(item)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <div className="flex gap-2">
                  <button
                    onClick={() => onRestock(item.sku)}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    title="Restock"
                  >
                    ↑ Restock
                  </button>
                  <button
                    onClick={() => onAdjust(item.sku)}
                    className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                    title="Adjust"
                  >
                    ± Adjust
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
