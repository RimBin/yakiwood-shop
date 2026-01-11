'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import OrderCard from './OrderCard';
import { toLocalePath } from '@/i18n/paths';

interface Order {
  id: string;
  email: string;
  status: string;
  total_amount: number;
  currency: string;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  shipping_phone: string | null;
  payment_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items: Array<{
    id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    configuration_snapshot: any;
    products: {
      name: string;
      slug: string;
    } | null;
  }>;
}

interface OrdersClientProps {
  orders: Order[];
}

export default function OrdersClient({ orders }: OrdersClientProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const locale = useLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statuses = [
    { value: 'all', label: 'Visi' },
    { value: 'pending', label: 'Laukiama' },
    { value: 'processing', label: 'Vykdomas' },
    { value: 'shipped', label: 'Išsiųstas' },
    { value: 'delivered', label: 'Pristatytas' },
    { value: 'cancelled', label: 'Atšauktas' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-['DM_Sans'] font-medium tracking-[-1.6px] text-[#161616] mb-2">
            Mano užsakymai
          </h1>
          <p className="text-[#535353] font-['DM_Sans']">
            Peržiūrėkite ir valdykite savo užsakymus
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-[24px] p-6 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex-1">
              <label
                htmlFor="status-filter"
                className="block text-sm font-['DM_Sans'] font-medium text-[#161616] mb-2"
              >
                Būsena
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-[#E1E1E1] rounded-[12px] font-['DM_Sans'] text-[#161616] focus:outline-none focus:ring-2 focus:ring-[#161616] focus:border-transparent yw-select"
              >
                {statuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex-1">
              <label
                htmlFor="search"
                className="block text-sm font-['DM_Sans'] font-medium text-[#161616] mb-2"
              >
                Paieška
              </label>
              <input
                id="search"
                type="text"
                placeholder="Užsakymo numeris ar gavėjas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-[#E1E1E1] rounded-[12px] font-['DM_Sans'] text-[#161616] placeholder:text-[#BBBBBB] focus:outline-none focus:ring-2 focus:ring-[#161616] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-[24px] p-12 text-center shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-[#EAEAEA] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-[#BBBBBB]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-['DM_Sans'] font-medium text-[#161616] mb-2">
                {searchQuery || statusFilter !== 'all'
                  ? 'Užsakymų nerasta'
                  : 'Jūs dar neturite užsakymų'}
              </h3>
              <p className="text-[#535353] font-['DM_Sans'] mb-6">
                {searchQuery || statusFilter !== 'all'
                  ? 'Pabandykite pakeisti paieškos kriterijus'
                  : 'Pradėkite apsipirkti ir jūsų užsakymai atsiras čia'}
              </p>
              {(!searchQuery && statusFilter === 'all') && (
                <a
                  href={toLocalePath('/produktai', currentLocale)}
                  className="inline-block px-8 py-3 bg-[#161616] text-white rounded-[100px] font-['DM_Sans'] font-medium hover:bg-[#2d2d2d] transition-colors"
                >
                  Žiūrėti produktus
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isExpanded={expandedOrderId === order.id}
                onToggleExpand={() =>
                  setExpandedOrderId(
                    expandedOrderId === order.id ? null : order.id
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
