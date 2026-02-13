"use client";

import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';
import { AdminBody, AdminCard, AdminInput, AdminKicker, AdminLabel, AdminSectionTitle, AdminSelect, AdminStack } from '@/components/admin/ui/AdminUI';
import { toLocalePath, type AppLocale } from '@/i18n/paths';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
  pendingOrders: number;
  completedOrders: number;
  todayOrders: number;
  todayRevenue: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_email: string;
  customer_name: string;
  items: any[];
  total: number;
  status: string;
  payment_status: string;
  created_at: string;
}

interface ProductSales {
  productName: string;
  quantitySold: number;
  revenue: number;
}

const toFiniteNumber = (value: unknown, fallback = 0) => {
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const formatCurrencyEur = (value: unknown) => `€${toFiniteNumber(value).toFixed(2)}`;

export default function DashboardPage() {
  const t = useTranslations('admin.dashboard');
  const tCommon = useTranslations('common');
  const pathname = usePathname();
  const currentLocale = useMemo<AppLocale>(() => (pathname.startsWith('/lt') ? 'lt' : 'en'), [pathname]);
  const ordersHref = useMemo(() => toLocalePath('/admin/orders', currentLocale), [currentLocale]);
  const inventoryHref = useMemo(() => toLocalePath('/admin/inventory', currentLocale), [currentLocale]);
  const productsHref = useMemo(() => toLocalePath('/admin/products', currentLocale), [currentLocale]);

  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
    todayOrders: 0,
    todayRevenue: 0,
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [productSales, setProductSales] = useState<ProductSales[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilter, statusFilter, dateFrom, dateTo]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch orders
      const ordersResponse = await fetch('/api/admin/orders');
      const ordersData = await ordersResponse.json();
      const orders: Order[] = ordersData.orders || [];

      // Fetch products (Supabase when available; fallback to legacy localStorage)
      const { totalProducts, lowStockProducts } = await fetchProductStats();
      // Apply filters
      const filteredOrders = applyFilters(orders);

      // Calculate stats
      const totalRevenue = filteredOrders.reduce((sum, order) => sum + toFiniteNumber(order.total), 0);
      const pendingOrders = filteredOrders.filter(o => o.status === 'pending').length;
      const completedOrders = filteredOrders.filter(o => o.status === 'completed').length;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = filteredOrders.filter(o => new Date(o.created_at) >= today);
      const todayRevenue = todayOrders.reduce((sum, order) => sum + Number(order.total), 0);

      // Calculate product sales
      const salesMap = new Map<string, { quantity: number; revenue: number }>();
      filteredOrders.forEach(order => {
        order.items.forEach((item: any) => {
          const productName = item?.name || '—';
          const quantity = Math.max(1, toFiniteNumber(item?.quantity, 1));
          const price = toFiniteNumber(item?.price, 0);
          const existing = salesMap.get(productName) || { quantity: 0, revenue: 0 };
          salesMap.set(productName, {
            quantity: existing.quantity + quantity,
            revenue: existing.revenue + (price * quantity),
          });
        });
      });

      const productSalesData = Array.from(salesMap.entries())
        .map(([name, data]) => ({
          productName: name,
          quantitySold: data.quantity,
          revenue: data.revenue,
        }))
        .sort((a, b) => b.quantitySold - a.quantitySold)
        .slice(0, 10);

      setStats({
        totalOrders: filteredOrders.length,
        totalRevenue,
        totalProducts,
        lowStockProducts,
        pendingOrders,
        completedOrders,
        todayOrders: todayOrders.length,
        todayRevenue,
      });

      setRecentOrders(filteredOrders.slice(0, 10));
      setProductSales(productSalesData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductStats = async (): Promise<{ totalProducts: number; lowStockProducts: number }> => {
    const supabase = createSupabaseClient();

    // Preferred: query Supabase directly in the browser (uses the current user's session).
    if (supabase) {
      // First try inventory positions (SKUs) so the dashboard reflects all stock items.
      const { data: inventoryRows, error: inventoryError } = await supabase
        .from('inventory_items')
        .select('id, quantity_available, reorder_point');

      if (!inventoryError && Array.isArray(inventoryRows)) {
        const totalProducts = inventoryRows.length;
        const lowStockProducts = inventoryRows.filter((row: any) => {
          const available = Number(row?.quantity_available ?? 0);
          const reorderPoint = Number(row?.reorder_point ?? 10);
          return available > 0 && available <= reorderPoint;
        }).length;

        return { totalProducts, lowStockProducts };
      }

      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, slug, stock_quantity')
        // Keep behaviour consistent with /admin/products: stock-item products (slug contains "--")
        // are managed via Inventory and hidden from the main products list.
        .not('slug', 'like', '%--%');

      if (!productsError && Array.isArray(products)) {
        const totalProducts = products.length;

        const productIds = products.map((p: any) => p.id).filter(Boolean);
        let lowStockProducts = 0;

        // If products have explicit stock_quantity, use it.
        const withStockQuantity = products.filter((p: any) => typeof p.stock_quantity === 'number');
        if (withStockQuantity.length > 0) {
          lowStockProducts = withStockQuantity.filter((p: any) => (p.stock_quantity ?? 0) < 10).length;
          return { totalProducts, lowStockProducts };
        }

        // Otherwise derive low-stock from variants.
        if (productIds.length > 0) {
          const { data: lowVariants, error: variantsError } = await supabase
            .from('product_variants')
            .select('product_id, stock_quantity, is_available')
            .in('product_id', productIds)
            .lt('stock_quantity', 10)
            .eq('is_available', true);

          if (!variantsError && Array.isArray(lowVariants)) {
            const lowIds = new Set(lowVariants.map((v: any) => v.product_id).filter(Boolean));
            lowStockProducts = lowIds.size;
          }
        }

        return { totalProducts, lowStockProducts };
      }
    }

    // Fallback: legacy demo/local mode (keeps dashboard usable without Supabase).
    try {
      const productsData = localStorage.getItem('yakiwood_products');
      const products = productsData ? (JSON.parse(productsData) as Array<any>) : [];
      const totalProducts = Array.isArray(products) ? products.length : 0;
      const lowStockProducts = Array.isArray(products)
        ? products.filter((p: any) => typeof p?.stock === 'number' && p.stock < 10).length
        : 0;
      return { totalProducts, lowStockProducts };
    } catch {
      return { totalProducts: 0, lowStockProducts: 0 };
    }
  };

  const applyFilters = (orders: Order[]) => {
    let filtered = [...orders];

    // Date filter (custom range has priority)
    if (dateFrom || dateTo) {
      const start = dateFrom ? new Date(`${dateFrom}T00:00:00`) : null;
      const end = dateTo ? new Date(`${dateTo}T23:59:59`) : null;

      filtered = filtered.filter((order) => {
        const created = new Date(order.created_at);
        if (start && created < start) return false;
        if (end && created > end) return false;
        return true;
      });
    } else if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      if (dateFilter === 'today') {
        filterDate.setHours(0, 0, 0, 0);
      } else if (dateFilter === 'week') {
        filterDate.setDate(now.getDate() - 7);
      } else if (dateFilter === 'month') {
        filterDate.setMonth(now.getMonth() - 1);
      }

      filtered = filtered.filter(order => new Date(order.created_at) >= filterDate);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    return filtered;
  };

  const getOrderStatusLabel = (status: string) => {
    if (status === 'pending') return t('orderStatus.pending');
    if (status === 'processing') return t('orderStatus.processing');
    if (status === 'completed') return t('orderStatus.completed');
    if (status === 'cancelled') return t('orderStatus.cancelled');
    return status;
  };

  const StatCard = ({ title, value, subtitle, icon }: { title: string; value: string | number; subtitle?: string; icon?: string }) => (
    <AdminCard className="p-[24px]">
      <div className="flex items-center justify-between mb-[8px]">
        <p className="font-['Outfit'] text-[14px] text-[#535353] uppercase tracking-[0.7px]">{title}</p>
        {icon && <span className="text-[24px]">{icon}</span>}
      </div>
      <p className="font-['DM_Sans'] text-[36px] font-light text-[#161616] tracking-[-1.44px]">{value}</p>
      {subtitle && <p className="font-['Outfit'] text-[12px] text-[#BBBBBB] mt-[4px]">{subtitle}</p>}
    </AdminCard>
  );

  if (loading) {
    return (
      <AdminBody className="pt-[clamp(16px,2vw,24px)]">
        <AdminCard className="flex items-center justify-center py-[80px]">
          <div className="text-center">
            <div className="w-[48px] h-[48px] border-4 border-[#E1E1E1] border-t-[#161616] rounded-full animate-spin mx-auto mb-[16px]"></div>
            <p className="font-['Outfit'] text-[14px] text-[#535353]">{tCommon('kraunasi')}</p>
          </div>
        </AdminCard>
      </AdminBody>
    );
  }

  return (
    <AdminBody className="pt-[clamp(16px,2vw,24px)]">
      <AdminStack>
        {/* Filters */}
        <AdminCard>
          <AdminKicker className="mb-[16px]">{t('filters.title')}</AdminKicker>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
            {/* Date filter */}
            <div>
              <AdminLabel className="mb-[6px]">{t('filters.timePeriod')}</AdminLabel>
              <AdminSelect
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">{t('filters.allTime')}</option>
                <option value="today">{t('filters.today')}</option>
                <option value="week">{t('filters.lastWeek')}</option>
                <option value="month">{t('filters.lastMonth')}</option>
              </AdminSelect>

              <div className="mt-[12px] grid grid-cols-1 sm:grid-cols-2 gap-[12px]">
                <div>
                  <AdminLabel className="mb-[6px]">Nuo</AdminLabel>
                  <AdminInput
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    aria-label="Nuo"
                  />
                </div>
                <div>
                  <AdminLabel className="mb-[6px]">Iki</AdminLabel>
                  <AdminInput
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    aria-label="Iki"
                  />
                </div>
              </div>
            </div>

            {/* Status filter */}
            <div>
              <AdminLabel className="mb-[6px]">{t('filters.status')}</AdminLabel>
              <AdminSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">{t('filters.allOrders')}</option>
                <option value="pending">{t('orderStatus.pending')}</option>
                <option value="processing">{t('orderStatus.processing')}</option>
                <option value="completed">{t('orderStatus.completed')}</option>
                <option value="cancelled">{t('orderStatus.cancelled')}</option>
              </AdminSelect>
            </div>
          </div>
        </AdminCard>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[16px]">
          <Link
            href={ordersHref}
            className="bg-[#161616] text-white rounded-[24px] p-[24px] hover:bg-[#2a2a2a] transition-colors"
          >
            <div className="flex items-center justify-between mb-[12px]">
              <span className="text-[32px]">📦</span>
              <span className="text-[14px] opacity-60">→</span>
            </div>
            <p className="font-['DM_Sans'] text-[20px] font-light tracking-[-0.8px]">{t('quickActions.manageOrders')}</p>
            <p className="font-['Outfit'] text-[12px] opacity-60 mt-[4px]">{t('quickActions.manageOrdersSubtitle')}</p>
          </Link>

          <Link
            href={inventoryHref}
            className="bg-[#161616] text-white rounded-[24px] p-[24px] hover:bg-[#2a2a2a] transition-colors"
          >
            <div className="flex items-center justify-between mb-[12px]">
              <span className="text-[32px]">📋</span>
              <span className="text-[14px] opacity-60">→</span>
            </div>
            <p className="font-['DM_Sans'] text-[20px] font-light tracking-[-0.8px]">{t('quickActions.inventory')}</p>
            <p className="font-['Outfit'] text-[12px] opacity-60 mt-[4px]">{t('quickActions.inventorySubtitle')}</p>
          </Link>

          <Link
            href={productsHref}
            className="bg-[#161616] text-white rounded-[24px] p-[24px] hover:bg-[#2a2a2a] transition-colors"
          >
            <div className="flex items-center justify-between mb-[12px]">
              <span className="text-[32px]">🛍️</span>
              <span className="text-[14px] opacity-60">→</span>
            </div>
            <p className="font-['DM_Sans'] text-[20px] font-light tracking-[-0.8px]">{t('quickActions.products')}</p>
            <p className="font-['Outfit'] text-[12px] opacity-60 mt-[4px]">{t('quickActions.productsSubtitle')}</p>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[16px]">
          <StatCard
            title={t('stats.todayOrders')}
            value={stats.todayOrders}
            subtitle={`${tCommon('valiuta')}${toFiniteNumber(stats.todayRevenue).toFixed(2)}`}
            icon="📦"
          />
          <StatCard
            title={t('stats.totalOrders')}
            value={stats.totalOrders}
            subtitle={t('stats.totalOrdersSubtitle', { revenue: toFiniteNumber(stats.totalRevenue).toFixed(2), currency: tCommon('valiuta') })}
            icon="🛒"
          />
          <StatCard
            title={t('stats.pending')}
            value={stats.pendingOrders}
            subtitle={t('stats.pendingSubtitle')}
            icon="⏳"
          />
          <StatCard
            title={t('stats.completed')}
            value={stats.completedOrders}
            subtitle={t('stats.completedSubtitle')}
            icon="✅"
          />
        </div>

        {/* Product & Inventory Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[16px]">
          <StatCard
            title={t('stats.products')}
            value={stats.totalProducts}
            subtitle={t('stats.productsSubtitle')}
            icon="📋"
          />
          <StatCard
            title={t('stats.lowStock')}
            value={stats.lowStockProducts}
            subtitle={t('stats.lowStockSubtitle')}
            icon="⚠️"
          />
          <StatCard
            title={t('stats.avgOrder')}
            value={formatCurrencyEur(stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0)}
            icon="💰"
          />
          <StatCard
            title={t('stats.conversion')}
            value={`${stats.totalOrders > 0 ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1) : 0}%`}
            subtitle={t('stats.conversionSubtitle')}
            icon="📈"
          />
        </div>

        {/* Top Products */}
        <AdminCard className="p-0 overflow-hidden">
          <div className="p-[24px] border-b border-[#E1E1E1]">
            <AdminSectionTitle className="text-[24px] tracking-[-0.96px]">{t('topProducts.title')}</AdminSectionTitle>
          </div>
          <div className="md:hidden px-[16px] py-[12px]">
            {productSales.length > 0 ? (
              <div className="space-y-[10px]">
                {productSales.map((product, index) => (
                  <div key={index} className="rounded-[16px] border border-[#E1E1E1] p-[12px] bg-white">
                    <div className="flex items-start justify-between gap-[12px]">
                      <p className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">#{index + 1}</p>
                      <p className="font-['Outfit'] text-[14px] text-[#161616] font-medium text-right whitespace-nowrap">{formatCurrencyEur(product.revenue)}</p>
                    </div>
                    <p className="mt-[6px] font-['Outfit'] text-[14px] text-[#161616]">{product.productName}</p>
                    <p className="mt-[4px] font-['Outfit'] text-[12px] text-[#535353]">{t('topProducts.table.sold')}: {product.quantitySold} {t('units')}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-[20px] text-center font-['Outfit'] text-[14px] text-[#BBBBBB]">
                {t('topProducts.empty')}
              </div>
            )}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-[#E1E1E1]">
                  <th className="px-[16px] text-left py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">#</th>
                  <th className="px-[16px] text-left py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">{t('topProducts.table.product')}</th>
                  <th className="px-[16px] text-right py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353] whitespace-nowrap">{t('topProducts.table.sold')}</th>
                  <th className="px-[16px] text-right py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353] whitespace-nowrap">{t('topProducts.table.revenue')}</th>
                </tr>
              </thead>
              <tbody>
                {productSales.length > 0 ? (
                  productSales.map((product, index) => (
                    <tr key={index} className="border-b border-[#E1E1E1] hover:bg-[#E1E1E1]">
                      <td className="px-[16px] py-[16px] font-['Outfit'] text-[14px] text-[#161616]">{index + 1}</td>
                      <td className="px-[16px] py-[16px] font-['Outfit'] text-[14px] text-[#161616]">{product.productName}</td>
                      <td className="px-[16px] py-[16px] font-['Outfit'] text-[14px] text-[#161616] text-right whitespace-nowrap">{product.quantitySold} {t('units')}</td>
                      <td className="px-[16px] py-[16px] font-['Outfit'] text-[14px] text-[#161616] text-right font-medium whitespace-nowrap">{formatCurrencyEur(product.revenue)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-[32px] text-center font-['Outfit'] text-[14px] text-[#BBBBBB]">
                      {t('topProducts.empty')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </AdminCard>

        {/* Recent Orders */}
        <AdminCard className="p-0 overflow-hidden">
          <div className="p-[24px] border-b border-[#E1E1E1] flex items-center justify-between">
            <AdminSectionTitle className="text-[24px] tracking-[-0.96px]">{t('recentOrders.title')}</AdminSectionTitle>
            <Link
              href={ordersHref}
              className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353] hover:text-[#161616] transition-colors"
            >
              {t('recentOrders.allOrders')} →
            </Link>
          </div>
          <div className="md:hidden px-[16px] py-[12px]">
            {recentOrders.length > 0 ? (
              <div className="space-y-[10px]">
                {recentOrders.map((order) => (
                  <div key={order.id} className="rounded-[16px] border border-[#E1E1E1] p-[12px] bg-white">
                    <div className="flex items-start justify-between gap-[12px]">
                      <p className="font-['Outfit'] text-[13px] text-[#161616] font-medium">{order.order_number}</p>
                      <p className="font-['Outfit'] text-[13px] text-[#161616] font-medium whitespace-nowrap">{formatCurrencyEur(order.total)}</p>
                    </div>
                    <p className="mt-[6px] font-['Outfit'] text-[13px] text-[#161616]">{order.customer_name}</p>
                    <p className="mt-[4px] font-['Outfit'] text-[12px] text-[#535353]">{format(new Date(order.created_at), 'yyyy-MM-dd HH:mm')}</p>
                    <div className="mt-[8px]">
                      <span className={`px-[10px] py-[4px] rounded-[100px] font-['Outfit'] text-[11px] uppercase tracking-[0.6px] ${
                        order.status === 'completed' ? 'bg-[#EAEAEA] border border-green-500 text-green-700' :
                        order.status === 'processing' ? 'bg-[#EAEAEA] border border-blue-500 text-blue-700' :
                        order.status === 'pending' ? 'bg-[#EAEAEA] border border-yellow-500 text-yellow-700' :
                        'bg-[#EAEAEA] border border-[#7C7C7C] text-[#535353]'
                      }`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-[20px] text-center font-['Outfit'] text-[14px] text-[#BBBBBB]">
                {t('recentOrders.empty')}
              </div>
            )}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E1E1E1]">
                  <th className="px-[16px] text-left py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">{t('recentOrders.table.order')}</th>
                  <th className="px-[16px] text-left py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">{t('recentOrders.table.customer')}</th>
                  <th className="px-[16px] text-left py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">{t('recentOrders.table.date')}</th>
                  <th className="px-[16px] text-right py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">{t('recentOrders.table.total')}</th>
                  <th className="px-[16px] text-right py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">{t('recentOrders.table.status')}</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-[#E1E1E1] hover:bg-[#E1E1E1]">
                      <td className="px-[16px] py-[16px] font-['Outfit'] text-[14px] text-[#161616] font-medium">{order.order_number}</td>
                      <td className="px-[16px] py-[16px] font-['Outfit'] text-[14px] text-[#161616]">{order.customer_name}</td>
                      <td className="px-[16px] py-[16px] font-['Outfit'] text-[14px] text-[#535353]">
                        {format(new Date(order.created_at), 'yyyy-MM-dd HH:mm')}
                      </td>
                      <td className="px-[16px] py-[16px] font-['Outfit'] text-[14px] text-[#161616] text-right font-medium">{formatCurrencyEur(order.total)}</td>
                      <td className="px-[16px] py-[16px] text-right">
                        <span className={`px-[12px] py-[4px] rounded-[100px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] ${
                          order.status === 'completed' ? 'bg-[#EAEAEA] border border-green-500 text-green-700' :
                          order.status === 'processing' ? 'bg-[#EAEAEA] border border-blue-500 text-blue-700' :
                          order.status === 'pending' ? 'bg-[#EAEAEA] border border-yellow-500 text-yellow-700' :
                          'bg-[#EAEAEA] border border-[#7C7C7C] text-[#535353]'
                        }`}>
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-[32px] text-center font-['Outfit'] text-[14px] text-[#BBBBBB]">
                      {t('recentOrders.empty')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </AdminCard>
      </AdminStack>
    </AdminBody>
  );
}
