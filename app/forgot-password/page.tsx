'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ModalOverlay from '@/components/modals/ModalOverlay';
import ForgotPasswordModal from '@/components/modals/ForgotPasswordModal';
import SuccessModal from '@/components/modals/SuccessModal';

export default function ForgotPasswordPage() {
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#E1E1E1] flex items-center justify-center">
      <ModalOverlay isOpen={true} onClose={() => router.push('/')}>
        <ForgotPasswordModal
          isOpen={true}
          onClose={() => router.push('/')}
          onSuccess={() => setShowSuccess(true)}
        />
      </ModalOverlay>

      <ModalOverlay isOpen={showSuccess} onClose={() => router.push('/')}>
        <SuccessModal
          isOpen={showSuccess}
          onClose={() => router.push('/')}
          message="We've sent you an email with a link to update your password"
        />
      </ModalOverlay>
    </main>
  );
}
