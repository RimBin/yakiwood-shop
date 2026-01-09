'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AccountLayout from '@/components/account/AccountLayout';
import { createClient } from '@/lib/supabase/client';

export default function AccountPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          if (!isCancelled) setIsLoading(false);
          return;
        }
      } catch {
        // Ignore and fall back to demo auth.
      }

      try {
        const raw = localStorage.getItem('user');
        const parsed = raw ? (JSON.parse(raw) as { email?: string } | null) : null;
        if (parsed?.email) {
          if (!isCancelled) setIsLoading(false);
          return;
        }
      } catch {
        // ignore
      }

      if (!isCancelled) {
        router.push('/login?redirect=/account');
      }
    };

    void checkAuth();

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

    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }

    router.push('/login');
  };

  if (isLoading) return null;

  return <AccountLayout active="details" onLogout={handleLogout} />;
}

