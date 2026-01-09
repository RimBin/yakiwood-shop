'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

type Active = 'details' | 'orders';

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
    <div className="min-h-screen bg-[#E1E1E1]">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-10 md:px-10 md:py-14">
        <div className="border-b border-[#BBBBBB] pb-8">
          <h1 className="font-['DM_Sans'] font-light text-[56px] md:text-[128px] leading-[0.95] tracking-[-2.8px] md:tracking-[-6.4px] text-[#161616]">
            {t('title')}
          </h1>
        </div>

        <div className="mt-8 flex flex-col gap-8 md:mt-12 md:flex-row md:gap-14">
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
    </div>
  );
}
