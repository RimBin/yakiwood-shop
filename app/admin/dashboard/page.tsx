"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { createClient as createSupabaseClient } from '@/lib/supabase/client';
import { AdminBody, AdminCard, AdminKicker, AdminLabel, AdminSectionTitle, AdminSelect, AdminStack } from '@/components/admin/ui/AdminUI';

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

export default function DashboardPage() {
  const t = useTranslations('admin.dashboard');
  const tCommon = useTranslations('common');

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

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilter, statusFilter]);

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
      const totalRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.total), 0);
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
          const existing = salesMap.get(item.name) || { quantity: 0, revenue: 0 };
          salesMap.set(item.name, {
            quantity: existing.quantity + (item.quantity || 1),
            revenue: existing.revenue + (item.price * (item.quantity || 1)),
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

    // Date filter
    if (dateFilter !== 'all') {
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
            href="/admin/orders"
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
            href="/admin/inventory"
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
            href="/admin/products"
            className="bg-[#EAEAEA] rounded-[24px] p-[24px] border border-[#E1E1E1] hover:border-[#161616] transition-colors"
          >
            <div className="flex items-center justify-between mb-[12px]">
              <span className="text-[32px]">🛍️</span>
              <span className="text-[14px] text-[#535353]">→</span>
            </div>
            <p className="font-['DM_Sans'] text-[20px] font-light tracking-[-0.8px] text-[#161616]">{t('quickActions.products')}</p>
            <p className="font-['Outfit'] text-[12px] text-[#535353] mt-[4px]">{t('quickActions.productsSubtitle')}</p>
          </Link>

          <Link
            href="/admin?tab=projects"
            className="bg-[#EAEAEA] rounded-[24px] p-[24px] border border-[#E1E1E1] hover:border-[#161616] transition-colors"
          >
            <div className="flex items-center justify-between mb-[12px]">
              <span className="text-[32px]">🏗️</span>
              <span className="text-[14px] text-[#535353]">→</span>
            </div>
            <p className="font-['DM_Sans'] text-[20px] font-light tracking-[-0.8px] text-[#161616]">{t('quickActions.projects')}</p>
            <p className="font-['Outfit'] text-[12px] text-[#535353] mt-[4px]">{t('quickActions.projectsSubtitle')}</p>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[16px]">
          <StatCard
            title={t('stats.todayOrders')}
            value={stats.todayOrders}
            subtitle={`${tCommon('valiuta')}${stats.todayRevenue.toFixed(2)}`}
            icon="📦"
          />
          <StatCard
            title={t('stats.totalOrders')}
            value={stats.totalOrders}
            subtitle={t('stats.totalOrdersSubtitle', { revenue: stats.totalRevenue.toFixed(2), currency: tCommon('valiuta') })}
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
            value={`€${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : 0}`}
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E1E1E1]">
                  <th className="text-left py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">#</th>
                  <th className="text-left py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">{t('topProducts.table.product')}</th>
                  <th className="text-right py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">{t('topProducts.table.sold')}</th>
                  <th className="text-right py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">{t('topProducts.table.revenue')}</th>
                </tr>
              </thead>
              <tbody>
                {productSales.length > 0 ? (
                  productSales.map((product, index) => (
                    <tr key={index} className="border-b border-[#E1E1E1] hover:bg-[#E1E1E1]">
                      <td className="py-[16px] font-['Outfit'] text-[14px] text-[#161616]">{index + 1}</td>
                      <td className="py-[16px] font-['Outfit'] text-[14px] text-[#161616]">{product.productName}</td>
                      <td className="py-[16px] font-['Outfit'] text-[14px] text-[#161616] text-right">{product.quantitySold} {t('units')}</td>
                      <td className="py-[16px] font-['Outfit'] text-[14px] text-[#161616] text-right font-medium">€{product.revenue.toFixed(2)}</td>
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
              href="/admin/orders"
              className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353] hover:text-[#161616] transition-colors"
            >
              {t('recentOrders.allOrders')} →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E1E1E1]">
                  <th className="text-left py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">{t('recentOrders.table.order')}</th>
                  <th className="text-left py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">{t('recentOrders.table.customer')}</th>
                  <th className="text-left py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">{t('recentOrders.table.date')}</th>
                  <th className="text-right py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">{t('recentOrders.table.total')}</th>
                  <th className="text-left py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">{t('recentOrders.table.status')}</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-[#E1E1E1] hover:bg-[#E1E1E1]">
                      <td className="py-[16px] font-['Outfit'] text-[14px] text-[#161616] font-medium">{order.order_number}</td>
                      <td className="py-[16px] font-['Outfit'] text-[14px] text-[#161616]">{order.customer_name}</td>
                      <td className="py-[16px] font-['Outfit'] text-[14px] text-[#535353]">
                        {format(new Date(order.created_at), 'yyyy-MM-dd HH:mm')}
                      </td>
                      <td className="py-[16px] font-['Outfit'] text-[14px] text-[#161616] text-right font-medium">€{Number(order.total).toFixed(2)}</td>
                      <td className="py-[16px]">
                        <span className={`px-[12px] py-[4px] rounded-[100px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] ${
                          order.status === 'completed' ? 'bg-[#EAEAEA] border border-green-200 text-green-700' :
                          order.status === 'processing' ? 'bg-[#EAEAEA] border border-blue-200 text-blue-700' :
                          order.status === 'pending' ? 'bg-[#EAEAEA] border border-yellow-200 text-yellow-700' :
                          'bg-[#EAEAEA] border border-[#BBBBBB] text-[#535353]'
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
