'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { PageCover } from '@/components/shared/PageLayout';

type Active = 'details' | 'orders' | 'invoices';

export default function AccountLayout({
  active,
  children,
  onLogout,
}: {
  active: Active;
  children?: React.ReactNode;
  onLogout: () => void;
}) {
  const t = useTranslations('account');

  const hasChildren = React.Children.count(children) > 0;

  const linkBaseClass =
    "font-['Outfit'] uppercase text-[12px] tracking-[0.6px]";

  return (
    <section className="w-full bg-[#E1E1E1] min-h-screen">
      <PageCover>
        <h1
          className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] tracking-[-2.8px] md:tracking-[-6.4px] text-[#161616]"
          style={{ fontVariationSettings: "'opsz' 14" }}
        >
          {t('title')}
        </h1>
      </PageCover>

      <div className="w-full max-w-[1440px] mx-auto px-[16px] md:px-[40px] py-[40px] md:py-[56px]">
        <div className="flex flex-col gap-8 md:flex-row md:gap-14">
          <nav className={hasChildren ? 'hidden md:block md:w-[240px]' : 'w-full md:w-[240px]'}>
            <ul className="flex flex-col gap-4">
              <li>
                <Link
                  href="/account/details"
                  className={`${linkBaseClass} ${
                    active === 'details' ? 'text-[#161616]' : 'text-[#535353]'
                  }`}
                >
                  {t('accountDetails')}
                </Link>
              </li>
              <li>
                <Link
                  href="/account/orders"
                  className={`${linkBaseClass} ${
                    active === 'orders' ? 'text-[#161616]' : 'text-[#535353]'
                  }`}
                >
                  {t('myOrders')}
                </Link>
              </li>
              <li>
                <Link
                  href="/account/invoices"
                  className={`${linkBaseClass} ${
                    active === 'invoices' ? 'text-[#161616]' : 'text-[#535353]'
                  }`}
                >
                  {t('invoices')}
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onLogout}
                  className={`${linkBaseClass} text-[#F63333]`}
                >
                  {t('logout')}
                </button>
              </li>
            </ul>
          </nav>

          {hasChildren ? <div className="min-w-0 flex-1">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
