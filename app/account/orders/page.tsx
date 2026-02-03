'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import AccountLayout from '@/components/account/AccountLayout';
import { getAsset } from '@/lib/assets';
import { createClient } from '@/lib/supabase/client';

type OrderItem = {
  id?: string;
  name?: string;
  quantity?: number;
  basePrice?: number;
  price?: number;
  imageKey?: 'imgLarch1' | 'imgSpruce';
  dimensions?: string;
  configuration?: {
    thicknessMm?: number;
    widthMm?: number;
    lengthMm?: number;
  };
  slug?: string;
};

type OrderRow = {
  id: string;
  order_number?: string;
  created_at?: string;
  status?: string;
  payment_status?: string;
  total?: number;
  total_amount?: number;
  currency?: string;
  items?: OrderItem[];
  order_items?: OrderItem[];
  customer_address?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  shipping_address?: string | null;
  shipping_city?: string | null;
  shipping_postal_code?: string | null;
  shipping_country?: string | null;
  completed_at?: string | null;
};

type OrderView = {
  id: string;
  date: string;
  status: string;
  paymentStatus?: string;
  total: number;
  items: {
    id: string;
    name: string;
    dimensions: string;
    qty: number;
    price: number;
    imageKey?: 'imgLarch1' | 'imgSpruce';
  }[];
  details: {
    dateOfDelivery: string;
    deliveryAddress: string;
    paymentStatus: string;
    shipping: number;
    total: number;
  };
};

function formatMoneyEUR(amount: number): string {
  return `€${amount.toFixed(2)}`;
}

function formatDate(value?: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('lt-LT');
}

function formatDimensions(item: OrderItem): string {
  if (item.dimensions) return item.dimensions;
  const thickness = item.configuration?.thicknessMm;
  const width = item.configuration?.widthMm;
  const length = item.configuration?.lengthMm;
  if (thickness && width && length) {
    return `${thickness}×${width}×${length} mm`;
  }
  return '-';
}

function pickShipping(items: OrderItem[]): number {
  const shippingItem = items.find((item) => {
    const name = (item.name || '').toLowerCase();
    return item.id === 'shipping' || item.slug === 'shipping' || name.includes('pristat');
  });
  if (!shippingItem) return 0;
  return Number(shippingItem.basePrice ?? shippingItem.price ?? 0) * Number(shippingItem.quantity ?? 1);
}

function buildAddress(order: OrderRow): string {
  if (order.customer_address) return order.customer_address;
  const parts = [
    order.shipping_address,
    order.shipping_city,
    order.shipping_postal_code,
    order.shipping_country,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : '-';
}

function pickImageKey(item: OrderItem): 'imgLarch1' | 'imgSpruce' | undefined {
  const name = (item.name || '').toLowerCase();
  if (name.includes('maumed')) return 'imgLarch1';
  if (name.includes('egl')) return 'imgSpruce';
  return undefined;
}

export default function OrdersPage() {
  const t = useTranslations('account');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<OrderView[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadOrders = async () => {
      setLoadError(null);
      try {
        const res = await fetch('/api/account/orders');
        if (res.status === 401) {
          if (!isCancelled) router.push('/login?redirect=/account/orders');
          return;
        }

        if (!res.ok) {
          throw new Error('Failed to load orders');
        }

        const payload = (await res.json()) as { orders?: OrderRow[] };
        const statusLabels: Record<string, string> = {
          pending: t('status.pending'),
          processing: t('status.processing'),
          completed: t('status.completed'),
          cancelled: t('status.cancelled'),
          refunded: t('status.refunded'),
          delivered: t('status.delivered'),
        };

        const paymentLabels: Record<string, string> = {
          pending: t('status.pending'),
          paid: t('status.paid'),
          failed: t('status.failed'),
          refunded: t('status.refunded'),
        };

        const nextOrders: OrderView[] = (payload.orders || []).map((order) => {
          const rawItems = (order.items || order.order_items || []) as OrderItem[];
          const shipping = pickShipping(rawItems);
          const total = Number(order.total ?? order.total_amount ?? 0);
          return {
            id: order.order_number || order.id,
            date: formatDate(order.created_at),
            status: statusLabels[order.status || ''] || (order.status || '-'),
            paymentStatus: paymentLabels[order.payment_status || ''] || (order.payment_status || '-'),
            total,
            items: rawItems.map((item, index) => ({
              id: item.id || `${order.id}-${index}`,
              name: item.name || '-',
              dimensions: formatDimensions(item),
              qty: Number(item.quantity ?? 1),
              price: Number(item.basePrice ?? item.price ?? 0),
              imageKey: item.imageKey || pickImageKey(item),
            })),
            details: {
              dateOfDelivery: formatDate(order.completed_at),
              deliveryAddress: buildAddress(order),
              paymentStatus: paymentLabels[order.payment_status || ''] || (order.payment_status || '-'),
              shipping,
              total,
            },
          };
        });

        if (!isCancelled) {
          setOrders(nextOrders);
          setExpandedOrderId(nextOrders[0]?.id ?? null);
          setIsLoading(false);
        }
      } catch {
        if (!isCancelled) {
          setLoadError(tCommon('klaida'));
          setIsLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      isCancelled = true;
    };
  }, [router, supabase, t, tCommon]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('yakiwood_auth');
    } catch {
      // ignore
    }

    const supabaseClient = supabase;
    if (supabaseClient) {
      try {
        await supabaseClient.auth.signOut();
      } catch {
        // ignore
      }
    }

    router.push('/login');
  };

  const toggleExpanded = (orderId: string) => {
    setExpandedOrderId((current) => (current === orderId ? null : orderId));
  };

  if (isLoading) return null;

  return (
    <AccountLayout active="orders" onLogout={handleLogout}>
      {/* Mobile top bar */}
      <div className="mb-6 flex items-center gap-3 md:hidden">
        <Link
          href="/account"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#EAEAEA] text-[#161616]"
          aria-label="Back"
        >
          ←
        </Link>
        <div className="font-['Outfit'] text-[12px] font-normal uppercase tracking-[0.6px] text-[#161616]">
          {t('myOrders').toUpperCase()}
        </div>
      </div>

      {loadError ? (
        <div className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#F63333]">
          {loadError}
        </div>
      ) : null}

      {orders.length === 0 ? (
        <div className="font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#535353]">
          {t('ordersEmpty')}
        </div>
      ) : null}

      {/* Desktop table */}
      {orders.length > 0 ? (
      <div className="hidden md:block">
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_40px] gap-4 border-b border-[#BBBBBB] pb-4">
          <div className="font-['Outfit'] text-[12px] font-normal uppercase tracking-[0.6px] text-[#535353]">
            {t('table.order')}
          </div>
          <div className="font-['Outfit'] text-[12px] font-normal uppercase tracking-[0.6px] text-[#535353]">
            {t('table.date')}
          </div>
          <div className="font-['Outfit'] text-[12px] font-normal uppercase tracking-[0.6px] text-[#535353]">
            {t('table.status')}
          </div>
          <div className="text-right font-['Outfit'] text-[12px] font-normal uppercase tracking-[0.6px] text-[#535353]">
            {t('table.totalCost')}
          </div>
          <div />
        </div>

        <div className="divide-y divide-[#BBBBBB]">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            return (
              <div key={order.id} className="py-4">
                <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_40px] items-center gap-4">
                  <div className="font-['DM_Sans'] text-[16px] font-normal text-[#161616]">
                    {order.id}
                  </div>
                  <div className="font-['DM_Sans'] text-[16px] font-normal text-[#161616]">
                    {order.date}
                  </div>
                  <div className="font-['DM_Sans'] text-[16px] font-normal text-[#161616]">
                    {order.status}
                  </div>
                  <div className="text-right font-['DM_Sans'] text-[16px] font-normal text-[#161616]">
                    {formatMoneyEUR(order.total)}
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleExpanded(order.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAEAEA] font-['DM_Sans'] text-[18px] text-[#161616]"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? '−' : '+'}
                  </button>
                </div>

                {isExpanded ? (
                  <div className="mt-6">
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            {item.imageKey ? (
                              <div className="relative h-[64px] w-[64px] overflow-hidden rounded-[12px] bg-[#EAEAEA]">
                                <Image
                                  src={getAsset(item.imageKey)}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                  sizes="64px"
                                />
                              </div>
                            ) : (
                              <div className="h-[64px] w-[64px] rounded-[12px] bg-[#EAEAEA]" />
                            )}
                            <div>
                              <div className="font-['DM_Sans'] text-[16px] font-normal text-[#161616]">
                                {item.name}
                              </div>
                              <div className="mt-1 font-['DM_Sans'] text-[14px] font-light text-[#535353]">
                                {t('details.dimensions')} {item.dimensions}
                              </div>
                              <div className="font-['DM_Sans'] text-[14px] font-light text-[#535353]">
                                {t('details.qty')} {item.qty}
                              </div>
                            </div>
                          </div>
                          <div className="text-right font-['DM_Sans'] text-[16px] font-normal text-[#161616]">
                            {formatMoneyEUR(item.price)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 space-y-3 border-t border-[#BBBBBB] pt-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="font-['Outfit'] text-[12px] font-normal uppercase tracking-[0.6px] text-[#535353]">
                          {t('details.dateOfDelivery')}
                        </div>
                        <div className="text-right font-['DM_Sans'] text-[16px] font-normal text-[#161616]">
                          {order.details.dateOfDelivery}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="font-['Outfit'] text-[12px] font-normal uppercase tracking-[0.6px] text-[#535353]">
                          {t('details.deliveryAddress')}
                        </div>
                        <div className="text-right font-['DM_Sans'] text-[16px] font-normal text-[#161616]">
                          {order.details.deliveryAddress}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="font-['Outfit'] text-[12px] font-normal uppercase tracking-[0.6px] text-[#535353]">
                          {t('details.paymentStatus')}
                        </div>
                        <div className="text-right font-['DM_Sans'] text-[16px] font-normal text-[#161616]">
                          {order.details.paymentStatus}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="font-['Outfit'] text-[12px] font-normal uppercase tracking-[0.6px] text-[#535353]">
                          {t('details.shipping')}
                        </div>
                        <div className="text-right font-['DM_Sans'] text-[16px] font-normal text-[#161616]">
                          {formatMoneyEUR(order.details.shipping)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4 pt-2">
                        <div className="font-['Outfit'] text-[12px] font-normal uppercase tracking-[0.6px] text-[#161616]">
                          {t('details.total')}
                        </div>
                        <div className="text-right font-['DM_Sans'] text-[18px] font-normal text-[#161616]">
                          {formatMoneyEUR(order.details.total)}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      ) : null}

      {/* Mobile stacked layout */}
      {orders.length > 0 ? (
      <div className="md:hidden">
        <div className="space-y-4">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            return (
              <div key={order.id} className="rounded-[16px] bg-[#EAEAEA] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-['DM_Sans'] text-[16px] font-normal text-[#161616]">
                      {order.id}
                    </div>
                    <div className="mt-1 font-['DM_Sans'] text-[14px] font-light text-[#535353]">
                      {order.date} · {order.status}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleExpanded(order.id)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white font-['DM_Sans'] text-[18px] text-[#161616]"
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? '−' : '+'}
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="font-['Outfit'] text-[12px] font-normal uppercase tracking-[0.6px] text-[#535353]">
                    {t('table.totalCost')}
                  </div>
                  <div className="font-['DM_Sans'] text-[16px] font-normal text-[#161616]">
                    {formatMoneyEUR(order.total)}
                  </div>
                </div>

                {isExpanded ? (
                  <div className="mt-4">
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            {item.imageKey ? (
                              <div className="relative h-[56px] w-[56px] overflow-hidden rounded-[12px] bg-white">
                                <Image
                                  src={getAsset(item.imageKey)}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                  sizes="56px"
                                />
                              </div>
                            ) : (
                              <div className="h-[56px] w-[56px] rounded-[12px] bg-white" />
                            )}
                            <div>
                              <div className="font-['DM_Sans'] text-[15px] font-normal text-[#161616]">
                                {item.name}
                              </div>
                              <div className="mt-1 font-['DM_Sans'] text-[13px] font-light text-[#535353]">
                                {order.date} · {order.status}
                              </div>
                              <div className="font-['DM_Sans'] text-[13px] font-light text-[#535353]">
                                {t('details.qty')} {item.qty}
                              </div>
                            </div>
                          </div>
                          <div className="text-right font-['DM_Sans'] text-[15px] font-normal text-[#161616]">
                            {formatMoneyEUR(item.price)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 space-y-3 border-t border-[#BBBBBB] pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="font-['Outfit'] text-[12px] font-normal uppercase tracking-[0.6px] text-[#535353]">
                          {t('details.dateOfDelivery')}
                        </div>
                        <div className="text-right font-['DM_Sans'] text-[15px] font-normal text-[#161616]">
                          {order.details.dateOfDelivery}
                        </div>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="font-['Outfit'] text-[12px] font-normal uppercase tracking-[0.6px] text-[#535353]">
                          {t('details.deliveryAddress')}
                        </div>
                        <div className="text-right font-['DM_Sans'] text-[15px] font-normal text-[#161616]">
                          {order.details.deliveryAddress}
                        </div>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="font-['Outfit'] text-[12px] font-normal uppercase tracking-[0.6px] text-[#535353]">
                          {t('details.paymentStatus')}
                        </div>
                        <div className="text-right font-['DM_Sans'] text-[15px] font-normal text-[#161616]">
                          {order.details.paymentStatus}
                        </div>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="font-['Outfit'] text-[12px] font-normal uppercase tracking-[0.6px] text-[#535353]">
                          {t('details.shipping')}
                        </div>
                        <div className="text-right font-['DM_Sans'] text-[15px] font-normal text-[#161616]">
                          {formatMoneyEUR(order.details.shipping)}
                        </div>
                      </div>
                      <div className="flex items-start justify-between gap-4 pt-1">
                        <div className="font-['Outfit'] text-[12px] font-normal uppercase tracking-[0.6px] text-[#161616]">
                          {t('details.total')}
                        </div>
                        <div className="text-right font-['DM_Sans'] text-[16px] font-normal text-[#161616]">
                          {formatMoneyEUR(order.details.total)}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      ) : null}
    </AccountLayout>
  );
}
