'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import AccountLayout from '@/components/account/AccountLayout';
import { getAsset } from '@/lib/assets';
import { createClient } from '@/lib/supabase/client';

type DemoOrderStatus = 'delivered';

type DemoOrderItem = {
  id: string;
  name: string;
  dimensions: string;
  qty: number;
  price: number;
  imageKey: 'imgLarch1' | 'imgSpruce';
};

type DemoOrder = {
  id: string;
  date: string;
  status: DemoOrderStatus;
  total: number;
  items: DemoOrderItem[];
  details: {
    dateOfDelivery: string;
    deliveryAddress: string;
    paymentMethod: string;
    shipping: number;
    total: number;
  };
};

function seedDemoOrders(email: string): DemoOrder[] {
  const baseAddress = email.includes('@') ? 'Gedimino pr. 45, Vilnius' : 'Vilnius';

  return [
    {
      id: 'YW-1001',
      date: '2025-12-18',
      status: 'delivered',
      total: 395.0,
      items: [
        {
          id: 'item-1',
          name: 'Shou sugi ban lentos (maumedis)',
          dimensions: '20×140×3000 mm',
          qty: 12,
          price: 180.0,
          imageKey: 'imgLarch1',
        },
        {
          id: 'item-2',
          name: 'Shou sugi ban lentos (eglė)',
          dimensions: '20×120×3000 mm',
          qty: 10,
          price: 140.0,
          imageKey: 'imgSpruce',
        },
        {
          id: 'item-3',
          name: 'Montavimo rinkinys',
          dimensions: 'Komplektas',
          qty: 1,
          price: 55.0,
          imageKey: 'imgLarch1',
        },
      ],
      details: {
        dateOfDelivery: '2025-12-23',
        deliveryAddress: baseAddress,
        paymentMethod: 'Stripe',
        shipping: 20.0,
        total: 395.0,
      },
    },
    {
      id: 'YW-1000',
      date: '2025-11-02',
      status: 'delivered',
      total: 289.0,
      items: [
        {
          id: 'item-1',
          name: 'Shou sugi ban lentos (maumedis)',
          dimensions: '20×140×2400 mm',
          qty: 8,
          price: 209.0,
          imageKey: 'imgLarch1',
        },
      ],
      details: {
        dateOfDelivery: '2025-11-06',
        deliveryAddress: baseAddress,
        paymentMethod: 'Stripe',
        shipping: 20.0,
        total: 289.0,
      },
    },
    {
      id: 'YW-0999',
      date: '2025-10-14',
      status: 'delivered',
      total: 129.0,
      items: [
        {
          id: 'item-1',
          name: 'Shou sugi ban lentos (eglė)',
          dimensions: '20×120×2000 mm',
          qty: 6,
          price: 109.0,
          imageKey: 'imgSpruce',
        },
      ],
      details: {
        dateOfDelivery: '2025-10-18',
        deliveryAddress: baseAddress,
        paymentMethod: 'Stripe',
        shipping: 20.0,
        total: 129.0,
      },
    },
  ];
}

function formatMoneyEUR(amount: number): string {
  return `€${amount.toFixed(2)}`;
}

function getDemoOrdersKey(email: string) {
  return `demo_orders_v1_${email}`;
}

export default function OrdersPage() {
  const t = useTranslations('account');
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<DemoOrder[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const checkAuthAndLoad = async () => {
      let email: string | null = null;

      const supabaseClient = supabase;
      if (supabaseClient) {
        try {
          const { data } = await supabaseClient.auth.getUser();
          if (data?.user?.email) email = data.user.email;
        } catch {
          // ignore
        }
      }

      if (!email) {
        try {
          const raw = localStorage.getItem('user');
          const parsed = raw ? (JSON.parse(raw) as { email?: string } | null) : null;
          if (parsed?.email) email = parsed.email;
        } catch {
          // ignore
        }
      }

      if (!email) {
        if (!isCancelled) router.push('/login?redirect=/account/orders');
        return;
      }

      const storageKey = getDemoOrdersKey(email);
      let nextOrders: DemoOrder[] = [];

      try {
        const existing = localStorage.getItem(storageKey);
        if (existing) {
          nextOrders = JSON.parse(existing) as DemoOrder[];
        } else {
          nextOrders = seedDemoOrders(email);
          localStorage.setItem(storageKey, JSON.stringify(nextOrders));
        }
      } catch {
        nextOrders = seedDemoOrders(email);
      }

      if (!isCancelled) {
        setOrders(nextOrders);
        setExpandedOrderId(nextOrders[0]?.id ?? null);
        setIsLoading(false);
      }
    };

    void checkAuthAndLoad();

    return () => {
      isCancelled = true;
    };
  }, [router, supabase]);

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

      {/* Desktop table */}
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
                    {t('status.delivered')}
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
                            <div className="relative h-[64px] w-[64px] overflow-hidden rounded-[12px] bg-[#EAEAEA]">
                              <Image
                                src={getAsset(item.imageKey)}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            </div>
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
                          {t('details.paymentMethod')}
                        </div>
                        <div className="text-right font-['DM_Sans'] text-[16px] font-normal text-[#161616]">
                          {order.details.paymentMethod}
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

      {/* Mobile stacked layout */}
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
                      {order.date} · {t('status.delivered')}
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
                            <div className="relative h-[56px] w-[56px] overflow-hidden rounded-[12px] bg-white">
                              <Image
                                src={getAsset(item.imageKey)}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            </div>
                            <div>
                              <div className="font-['DM_Sans'] text-[15px] font-normal text-[#161616]">
                                {item.name}
                              </div>
                              <div className="mt-1 font-['DM_Sans'] text-[13px] font-light text-[#535353]">
                                {order.date} · {t('status.delivered')}
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
                          {t('details.paymentMethod')}
                        </div>
                        <div className="text-right font-['DM_Sans'] text-[15px] font-normal text-[#161616]">
                          {order.details.paymentMethod}
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
    </AccountLayout>
  );
}
