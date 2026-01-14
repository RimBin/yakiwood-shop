'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

interface NewsletterSignupProps {
  variant?: 'inline' | 'modal' | 'footer';
  showTitle?: boolean;
  className?: string;
}

export default function NewsletterSignup({
  variant = 'footer',
  showTitle = true,
  className = '',
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    trackEvent('newsletter_subscribe_attempt', {
      source: variant,
      has_name: Boolean(name?.trim()),
    });

    // Validation
    if (!email || !validateEmail(email)) {
      setMessage({ type: 'error', text: 'Prašome įvesti galiojantį el. pašto adresą' });
      return;
    }

    if (!consent) {
      setMessage({ type: 'error', text: 'Prašome sutikti gauti naujienas' });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          ...(name && { name }),
          consent,
          source: variant,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        trackEvent('sign_up', {
          method: 'newsletter',
          source: variant,
        });

        setMessage({ type: 'success', text: 'Sėkmingai užsiprenumeravote naujienas!' });
        setEmail('');
        setName('');
        setConsent(false);
      } else {
        trackEvent('newsletter_subscribe_error', {
          source: variant,
          status: response.status,
        });

        setMessage({ 
          type: 'error', 
          text: data.error || 'Įvyko klaida. Bandykite dar kartą.' 
        });
      }
    } catch (error) {
      trackEvent('newsletter_subscribe_error', {
        source: variant,
        status: 'network_error',
      });
      setMessage({ type: 'error', text: 'Įvyko klaida. Bandykite dar kartą.' });
    } finally {
      setLoading(false);
    }
  };

  const variantStyles = {
    footer: 'w-full max-w-md',
    inline: 'w-full',
    modal: 'w-full max-w-lg mx-auto p-6 bg-white rounded-[24px] shadow-lg',
  };

  return (
    <div className={`${variantStyles[variant]} ${className}`}>
      {showTitle && (
        <div className="mb-4">
          <h3 className="text-2xl font-['DM_Sans'] font-medium tracking-[-0.96px] text-[#161616] mb-2">
            Gaukite naujienas
          </h3>
          <p className="text-sm font-['DM_Sans'] text-[#535353]">
            Sužinokite apie naujus produktus ir pasiūlymus
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name field (optional) */}
        <div>
          <label htmlFor="newsletter-name" className="sr-only">
            Vardas
          </label>
          <input
            type="text"
            id="newsletter-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Vardas (neprivaloma)"
            className="w-full px-4 py-3 border border-[#E1E1E1] rounded-[12px] font-['DM_Sans'] text-[#161616] placeholder:text-[#BBBBBB] focus:outline-none focus:ring-2 focus:ring-[#161616] focus:border-transparent"
          />
        </div>

        {/* Email field */}
        <div>
          <label htmlFor="newsletter-email" className="sr-only">
            El. paštas
          </label>
          <input
            type="email"
            id="newsletter-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Jūsų el. paštas"
            required
            className="w-full px-4 py-3 border border-[#E1E1E1] rounded-[12px] font-['DM_Sans'] text-[#161616] placeholder:text-[#BBBBBB] focus:outline-none focus:ring-2 focus:ring-[#161616] focus:border-transparent"
          />
        </div>

        {/* GDPR consent checkbox */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="newsletter-consent"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
            className="mt-1 w-4 h-4 border border-[#E1E1E1] rounded text-[#161616] focus:ring-2 focus:ring-[#161616]"
          />
          <label
            htmlFor="newsletter-consent"
            className="text-sm font-['DM_Sans'] text-[#535353] leading-tight"
          >
            Sutinku gauti naujienas ir sutinku su{' '}
            <Link
              href="/policies"
              className="text-[#161616] underline hover:no-underline"
            >
              privatumo politika
            </Link>
          </label>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-[#161616] text-white rounded-[100px] font-['DM_Sans'] font-medium hover:bg-[#2a2a2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Prenumeruojama...' : 'Prenumeruoti'}
        </button>

        {/* Message display */}
        {message && (
          <div
            className={`p-3 rounded-[12px] text-sm font-['DM_Sans'] ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
}
