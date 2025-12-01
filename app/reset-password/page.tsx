'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ModalOverlay from '@/components/modals/ModalOverlay';
import NewPasswordModal from '@/components/modals/NewPasswordModal';
import SuccessModal from '@/components/modals/SuccessModal';

function ResetPasswordContent() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  useEffect(() => {
    if (!token) {
      setTokenError('Reset link is invalid');
      return;
    }

    // Validate token
    fetch(`/api/validate-reset-token?token=${token}`)
      .then(res => res.ok ? setTokenValid(true) : setTokenError('Reset link has expired'))
      .catch(() => setTokenError('Error validating reset link'));
  }, [token]);

  if (tokenError) {
    return (
      <main className="min-h-screen bg-[#E1E1E1] flex items-center justify-center">
        <div className="text-center bg-white p-10 rounded-[24px] max-w-[479px]">
          <p className="font-['Outfit'] text-[16px] text-[#161616] mb-4">{tokenError}</p>
          <button
            onClick={() => router.push('/forgot-password')}
            className="font-['Outfit'] text-[12px] text-[#161616] uppercase tracking-[0.6px] hover:underline"
          >
            Request new reset link
          </button>
        </div>
      </main>
    );
  }

  if (!tokenValid) {
    return (
      <main className="min-h-screen bg-[#E1E1E1] flex items-center justify-center">
        <div className="font-['Outfit'] text-[16px] text-[#161616]">Validating...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#E1E1E1] flex items-center justify-center">
      <ModalOverlay isOpen={true} onClose={() => router.push('/')}>
        <NewPasswordModal
          isOpen={true}
          onClose={() => router.push('/')}
          token={token}
          onSuccess={() => {
            setShowSuccess(true);
            setTimeout(() => router.push('/'), 3000);
          }}
        />
      </ModalOverlay>

      <ModalOverlay isOpen={showSuccess} onClose={() => router.push('/')}>
        <SuccessModal
          isOpen={showSuccess}
          onClose={() => router.push('/')}
          message="Your password has been reset. Redirecting to login..."
        />
      </ModalOverlay>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#E1E1E1] flex items-center justify-center">
        <div className="font-['Outfit'] text-[16px] text-[#161616]">Loading...</div>
      </main>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
