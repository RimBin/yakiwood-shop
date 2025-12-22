'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/ui';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleUnsubscribe = async () => {
    if (!email) {
      setError('El. pašto adresas nerastas');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Nepavyko atsisakyti prenumeratos');
      }
    } catch (error) {
      setError('Įvyko klaida. Bandykite dar kartą.');
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-[#EAEAEA]">
        <div className="max-w-md w-full bg-white p-8 rounded-[24px] shadow-lg text-center">
          <h1 className="text-3xl font-['DM_Sans'] font-medium tracking-[-1.2px] text-[#161616] mb-4">
            Neteisingas nuoroda
          </h1>
          <p className="text-base font-['DM_Sans'] text-[#535353] mb-6">
            Norėdami atsisakyti prenumeratos, naudokite nuorodą iš el. laiško.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[#161616] text-white rounded-[100px] font-['DM_Sans'] font-medium hover:bg-[#2a2a2a] transition-colors"
          >
            Grįžti į pradžią
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-[#EAEAEA]">
        <div className="max-w-md w-full bg-white p-8 rounded-[24px] shadow-lg text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-['DM_Sans'] font-medium tracking-[-1.2px] text-[#161616] mb-4">
            Prenumerata atšaukta
          </h1>
          <p className="text-base font-['DM_Sans'] text-[#535353] mb-2">
            Daugiau nebebus siunčiami naujienlaiškiai į:
          </p>
          <p className="text-base font-['DM_Sans'] font-medium text-[#161616] mb-6">
            {email}
          </p>
          <p className="text-sm font-['DM_Sans'] text-[#535353] mb-6">
            Persidomėjote? Galite{' '}
            <button
              onClick={() => window.location.href = `/?resubscribe=${email}`}
              className="text-[#161616] underline hover:no-underline"
            >
              vėl prenumeruoti
            </button>
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-[#161616] text-white rounded-[100px] font-['DM_Sans'] font-medium hover:bg-[#2a2a2a] transition-colors"
          >
            Grįžti į pradžią
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#EAEAEA]">
      <div className="max-w-md w-full bg-white p-8 rounded-[24px] shadow-lg">
        <h1 className="text-3xl font-['DM_Sans'] font-medium tracking-[-1.2px] text-[#161616] mb-4 text-center">
          Atsisakyti prenumeratos
        </h1>
        <p className="text-base font-['DM_Sans'] text-[#535353] mb-2 text-center">
          Ar tikrai norite atsisakyti naujienų prenumeratos?
        </p>
        <p className="text-base font-['DM_Sans'] font-medium text-[#161616] mb-6 text-center">
          {email}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[12px]">
            <p className="text-sm font-['DM_Sans'] text-red-800">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleUnsubscribe}
            disabled={loading}
            className="w-full px-6 py-3 bg-[#161616] text-white rounded-[100px] font-['DM_Sans'] font-medium hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Vykdoma...' : 'Taip, atsisakyti prenumeratos'}
          </button>
          <Link
            href="/"
            className="block w-full px-6 py-3 bg-white text-[#161616] border border-[#E1E1E1] rounded-[100px] font-['DM_Sans'] font-medium hover:bg-[#EAEAEA] transition-colors text-center"
          >
            Ne, grįžti atgal
          </Link>
        </div>

        <p className="text-xs font-['DM_Sans'] text-[#BBBBBB] text-center mt-6">
          Atsisakius prenumeratos, nebegausite naujienų iš Yakiwood. Galite bet kada grįžti ir vėl prenumeruoti.
        </p>
      </div>
    </div>
  );
}
export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-6 bg-[#EAEAEA]">
        <div className="font-['Outfit'] text-[16px] text-[#161616]">Kraunama...</div>
      </div>
    }>
      <>
        <Breadcrumbs
          items={[
            { label: 'Pagrindinis', href: '/' },
            { label: 'Naujienos', href: '/naujienos' },
            { label: 'Atsisakyti' },
          ]}
        />
        <UnsubscribeContent />
      </>
    </Suspense>
  );
}