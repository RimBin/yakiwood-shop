"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

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

interface Product {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  inStock: boolean;
  stock?: number;
}

interface ProductSales {
  productName: string;
  quantitySold: number;
  revenue: number;
}

export default function DashboardPage() {
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

      // Fetch products (from localStorage for now)
      const productsData = localStorage.getItem('yakiwood_products');
      const products: Product[] = productsData ? JSON.parse(productsData) : [];

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
        totalProducts: products.length,
        lowStockProducts: products.filter(p => p.stock && p.stock < 10).length,
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

  const StatCard = ({ title, value, subtitle, icon }: { title: string; value: string | number; subtitle?: string; icon?: string }) => (
    <div className="bg-white rounded-[16px] p-[24px] border border-[#E1E1E1]">
      <div className="flex items-center justify-between mb-[8px]">
        <p className="font-['Outfit'] text-[14px] text-[#535353] uppercase tracking-[0.7px]">{title}</p>
        {icon && <span className="text-[24px]">{icon}</span>}
      </div>
      <p className="font-['DM_Sans'] text-[36px] font-light text-[#161616] tracking-[-1.44px]">{value}</p>
      {subtitle && <p className="font-['Outfit'] text-[12px] text-[#BBBBBB] mt-[4px]">{subtitle}</p>}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EAEAEA] flex items-center justify-center">
        <div className="text-center">
          <div className="w-[48px] h-[48px] border-4 border-[#E1E1E1] border-t-[#161616] rounded-full animate-spin mx-auto mb-[16px]"></div>
          <p className="font-['Outfit'] text-[14px] text-[#535353]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAEAEA]">
      <div className="max-w-[1440px] mx-auto px-[16px] md:px-[32px] lg:px-[40px] py-[40px]">
        {/* Header */}
        <div className="mb-[40px]">
          <h1 className="font-['DM_Sans'] font-light text-[48px] md:text-[64px] leading-[0.95] tracking-[-2.4px] md:tracking-[-3.2px] text-[#161616] mb-[16px]">
            Store <span className="font-['Tiro_Tamil'] italic">Dashboard</span>
          </h1>
          <p className="font-['Outfit'] text-[14px] text-[#535353]">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-[16px] p-[24px] mb-[32px] border border-[#E1E1E1]">
          <p className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353] mb-[16px]">Filters</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
            {/* Date filter */}
            <div>
              <label className="font-['Outfit'] text-[12px] text-[#535353] mb-[8px] block">Time Period</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-[16px] py-[12px] border border-[#E1E1E1] rounded-[8px] font-['Outfit'] text-[14px] focus:outline-none focus:border-[#161616]"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
              </select>
            </div>

            {/* Status filter */}
            <div>
              <label className="font-['Outfit'] text-[12px] text-[#535353] mb-[8px] block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-[16px] py-[12px] border border-[#E1E1E1] rounded-[8px] font-['Outfit'] text-[14px] focus:outline-none focus:border-[#161616]"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[16px] mb-[32px]">
          <a
            href="/admin/orders"
            className="bg-[#161616] text-white rounded-[16px] p-[24px] hover:bg-[#2a2a2a] transition-colors"
          >
            <div className="flex items-center justify-between mb-[12px]">
              <span className="text-[32px]">📦</span>
              <span className="text-[14px] opacity-60">→</span>
            </div>
            <p className="font-['DM_Sans'] text-[20px] font-light tracking-[-0.8px]">Manage Orders</p>
            <p className="font-['Outfit'] text-[12px] opacity-60 mt-[4px]">View & update order status</p>
          </a>

          <a
            href="/admin/inventory"
            className="bg-[#161616] text-white rounded-[16px] p-[24px] hover:bg-[#2a2a2a] transition-colors"
          >
            <div className="flex items-center justify-between mb-[12px]">
              <span className="text-[32px]">📋</span>
              <span className="text-[14px] opacity-60">→</span>
            </div>
            <p className="font-['DM_Sans'] text-[20px] font-light tracking-[-0.8px]">Inventory</p>
            <p className="font-['Outfit'] text-[12px] opacity-60 mt-[4px]">Manage stock levels</p>
          </a>

          <a
            href="/admin?tab=products"
            className="bg-white rounded-[16px] p-[24px] border border-[#E1E1E1] hover:border-[#161616] transition-colors"
          >
            <div className="flex items-center justify-between mb-[12px]">
              <span className="text-[32px]">🛍️</span>
              <span className="text-[14px] text-[#535353]">→</span>
            </div>
            <p className="font-['DM_Sans'] text-[20px] font-light tracking-[-0.8px] text-[#161616]">Products</p>
            <p className="font-['Outfit'] text-[12px] text-[#535353] mt-[4px]">Add & edit products</p>
          </a>

          <a
            href="/admin?tab=projects"
            className="bg-white rounded-[16px] p-[24px] border border-[#E1E1E1] hover:border-[#161616] transition-colors"
          >
            <div className="flex items-center justify-between mb-[12px]">
              <span className="text-[32px]">🏗️</span>
              <span className="text-[14px] text-[#535353]">→</span>
            </div>
            <p className="font-['DM_Sans'] text-[20px] font-light tracking-[-0.8px] text-[#161616]">Projects</p>
            <p className="font-['Outfit'] text-[12px] text-[#535353] mt-[4px]">Showcase portfolio</p>
          </a>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[16px] mb-[32px]">
          <StatCard
            title="Today's Orders"
            value={stats.todayOrders}
            subtitle={`€${stats.todayRevenue.toFixed(2)}`}
            icon="📦"
          />
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            subtitle={`€${stats.totalRevenue.toFixed(2)} revenue`}
            icon="🛒"
          />
          <StatCard
            title="Pending"
            value={stats.pendingOrders}
            subtitle="need processing"
            icon="⏳"
          />
          <StatCard
            title="Completed"
            value={stats.completedOrders}
            subtitle="successfully"
            icon="✅"
          />
        </div>

        {/* Product & Inventory Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[16px] mb-[32px]">
          <StatCard
            title="Products"
            value={stats.totalProducts}
            subtitle="in catalog"
            icon="📋"
          />
          <StatCard
            title="Low Stock"
            value={stats.lowStockProducts}
            subtitle="< 10 units"
            icon="⚠️"
          />
          <StatCard
            title="Avg. Order"
            value={`€${stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : 0}`}
            icon="💰"
          />
          <StatCard
            title="Conversion"
            value={`${stats.totalOrders > 0 ? ((stats.completedOrders / stats.totalOrders) * 100).toFixed(1) : 0}%`}
            subtitle="completed"
            icon="📈"
          />
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-[16px] p-[24px] mb-[32px] border border-[#E1E1E1]">
          <h2 className="font-['DM_Sans'] text-[24px] font-light text-[#161616] tracking-[-0.96px] mb-[24px]">
            Top Products
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E1E1E1]">
                  <th className="text-left py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">#</th>
                  <th className="text-left py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">Product</th>
                  <th className="text-right py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">Sold</th>
                  <th className="text-right py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {productSales.length > 0 ? (
                  productSales.map((product, index) => (
                    <tr key={index} className="border-b border-[#E1E1E1] hover:bg-[#FAFAFA]">
                      <td className="py-[16px] font-['Outfit'] text-[14px] text-[#161616]">{index + 1}</td>
                      <td className="py-[16px] font-['Outfit'] text-[14px] text-[#161616]">{product.productName}</td>
                      <td className="py-[16px] font-['Outfit'] text-[14px] text-[#161616] text-right">{product.quantitySold} units</td>
                      <td className="py-[16px] font-['Outfit'] text-[14px] text-[#161616] text-right font-medium">€{product.revenue.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-[32px] text-center font-['Outfit'] text-[14px] text-[#BBBBBB]">
                      No sales data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-[16px] p-[24px] border border-[#E1E1E1]">
          <div className="flex items-center justify-between mb-[24px]">
            <h2 className="font-['DM_Sans'] text-[24px] font-light text-[#161616] tracking-[-0.96px]">
              Recent Orders
            </h2>
            <a
              href="/admin/orders"
              className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353] hover:text-[#161616] transition-colors"
            >
              All Orders →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E1E1E1]">
                  <th className="text-left py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">Order</th>
                  <th className="text-left py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">Customer</th>
                  <th className="text-left py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">Date</th>
                  <th className="text-right py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">Total</th>
                  <th className="text-left py-[12px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-[#E1E1E1] hover:bg-[#FAFAFA]">
                      <td className="py-[16px] font-['Outfit'] text-[14px] text-[#161616] font-medium">{order.order_number}</td>
                      <td className="py-[16px] font-['Outfit'] text-[14px] text-[#161616]">{order.customer_name}</td>
                      <td className="py-[16px] font-['Outfit'] text-[14px] text-[#535353]">
                        {format(new Date(order.created_at), 'yyyy-MM-dd HH:mm')}
                      </td>
                      <td className="py-[16px] font-['Outfit'] text-[14px] text-[#161616] text-right font-medium">€{Number(order.total).toFixed(2)}</td>
                      <td className="py-[16px]">
                        <span className={`px-[12px] py-[4px] rounded-[100px] font-['Outfit'] text-[12px] uppercase tracking-[0.6px] ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-[32px] text-center font-['Outfit'] text-[14px] text-[#BBBBBB]">
                      No orders
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
