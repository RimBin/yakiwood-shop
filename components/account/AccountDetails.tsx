'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';

type AccountDetailsData = {
  fullName: string;
  companyName?: string;
  email: string;
  phoneNumber: string;
  country: string;
  city: string;
  streetAddress: string;
  postcodeZip: string;
};

function getStorageKey(email: string) {
  return `account_details_v1_${email}`;
}

function seedData(email: string): AccountDetailsData {
  return {
    fullName: 'Name Surname',
    companyName: '',
    email,
    phoneNumber: '+3706000000',
    country: 'UK',
    city: 'London',
    streetAddress: 'Test',
    postcodeZip: '09789',
  };
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <div className="font-['Outfit'] text-[12px] font-normal uppercase leading-[1.3] tracking-[0.6px] text-[#7C7C7C]">
      {label} {required ? <span className="text-[#F63333]">*</span> : null}
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z"
        stroke="#161616"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="3" stroke="#161616" strokeWidth="1.5" />
    </svg>
  );
}

function TitleRow({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0">
      <div className="flex items-center justify-between">
        <div className="font-['Outfit'] text-[12px] font-normal uppercase leading-[1.3] tracking-[0.6px] text-[#161616]">
          {title}
        </div>
        {action ? action : null}
      </div>
      <div className="mt-2 h-px w-full bg-[#BBBBBB]" />
    </div>
  );
}

function ReadonlyField({ value }: { value: string }) {
  return (
    <div className="flex h-12 w-full items-center border border-[#BBBBBB] bg-transparent px-4">
      <div className="font-['Outfit'] text-[12px] font-normal uppercase leading-[1.2] tracking-[0.6px] text-[#161616]">
        {value}
      </div>
    </div>
  );
}

function TextInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="h-12 w-full border border-[#BBBBBB] bg-transparent px-4 font-['Outfit'] text-[12px] font-normal uppercase leading-[1.2] tracking-[0.6px] text-[#161616] focus:border-[#161616] focus:outline-none disabled:opacity-60"
    />
  );
}

export default function AccountDetails({
  userEmail,
}: {
  userEmail: string;
}) {
  const t = useTranslations('account');
  const tCommon = useTranslations('common');
  const supabase = useMemo(() => createClient(), []);

  const [data, setData] = useState<AccountDetailsData>(() => seedData(userEmail));
  const [isLoaded, setIsLoaded] = useState(false);

  const [isEditingMyInfo, setIsEditingMyInfo] = useState(false);
  const [isEditingDelivery, setIsEditingDelivery] = useState(false);

  const [passwordCurrent, setPasswordCurrent] = useState('');
  const [passwordNext, setPasswordNext] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [addressId, setAddressId] = useState<string | null>(null);
  const [isSavingMyInfo, setIsSavingMyInfo] = useState(false);
  const [isSavingDelivery, setIsSavingDelivery] = useState(false);

  const storageKey = useMemo(() => getStorageKey(userEmail), [userEmail]);

  useEffect(() => {
    let isCancelled = false;

    const load = async () => {
      let next = seedData(userEmail);
      let loadedFromSupabase = false;

      const supabaseClient = supabase;
      if (supabaseClient) {
        try {
          const {
            data: { user },
          } = await supabaseClient.auth.getUser();

          if (user?.email) {
            setAuthUserId(user.id);

            const { data: profile } = await supabaseClient
              .from('user_profiles')
              .select('id,email,full_name,phone')
              .eq('id', user.id)
              .maybeSingle();

            const { data: address } = await supabaseClient
              .from('delivery_addresses')
              .select('id,country,city,street_address,postal_code,is_default')
              .eq('user_id', user.id)
              .order('is_default', { ascending: false })
              .order('updated_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            const companyNameRaw = (user.user_metadata as { company_name?: string } | null)?.company_name;
            const fullNameMeta = (user.user_metadata as { full_name?: string } | null)?.full_name;

            next = {
              ...next,
              email: user.email,
              fullName: profile?.full_name || fullNameMeta || '',
              companyName: typeof companyNameRaw === 'string' ? companyNameRaw : '',
              phoneNumber: profile?.phone || '',
              country: address?.country || '',
              city: address?.city || '',
              streetAddress: address?.street_address || '',
              postcodeZip: address?.postal_code || '',
            };

            loadedFromSupabase = true;
            setAddressId(address?.id ?? null);
          }
        } catch {
          // ignore
        }
      }

      if (!loadedFromSupabase) {
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            const parsed = JSON.parse(raw) as Partial<AccountDetailsData>;
            next = {
              ...next,
              ...parsed,
              email: parsed.email ?? userEmail,
            };
          }
        } catch {
          // ignore
        }
      }

      if (!isCancelled) {
        setData(next);
        setIsLoaded(true);
      }
    };

    void load();

    return () => {
      isCancelled = true;
    };
  }, [storageKey, userEmail, supabase]);

  const persist = (next: AccountDetailsData) => {
    setData(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const saveMyInfo = async () => {
    const supabaseClient = supabase;
    if (supabaseClient && authUserId) {
      setIsSavingMyInfo(true);
      try {
        await supabaseClient
          .from('user_profiles')
          .upsert(
            {
              id: authUserId,
              email: userEmail,
              full_name: data.fullName,
              phone: data.phoneNumber,
            },
            { onConflict: 'id' }
          );

        await supabaseClient.auth.updateUser({
          data: {
            company_name: data.companyName ?? '',
            full_name: data.fullName || '',
          },
        });
      } catch {
        // ignore
      } finally {
        setIsSavingMyInfo(false);
      }
    }

    persist(data);
  };

  const saveDelivery = async () => {
    const supabaseClient = supabase;
    if (supabaseClient && authUserId) {
      setIsSavingDelivery(true);
      try {
        const payload = {
          user_id: authUserId,
          country: data.country,
          city: data.city,
          street_address: data.streetAddress,
          postal_code: data.postcodeZip,
          is_default: true,
        };

        if (addressId) {
          await supabaseClient
            .from('delivery_addresses')
            .update(payload)
            .eq('id', addressId);
        } else {
          const { data: inserted } = await supabaseClient
            .from('delivery_addresses')
            .insert(payload)
            .select('id')
            .single();
          setAddressId(inserted?.id ?? null);
        }
      } catch {
        // ignore
      } finally {
        setIsSavingDelivery(false);
      }
    }

    persist(data);
  };

  const handleSavePassword = async () => {
    if (!passwordCurrent || !passwordNext || !passwordConfirm) {
      setPasswordError(t('form.passwordRequired'));
      return;
    }

    if (passwordNext !== passwordConfirm) {
      setPasswordError(t('form.passwordMismatch'));
      return;
    }

    const supabaseClient = supabase;
    if (supabaseClient) {
      try {
        const { error } = await supabaseClient.auth.updateUser({ password: passwordNext });
        if (error) {
          setPasswordError(error.message);
          return;
        }
      } catch {
        setPasswordError(tCommon('klaida'));
        return;
      }
    }

    setPasswordError(null);
    setPasswordCurrent('');
    setPasswordNext('');
    setPasswordConfirm('');
  };

  if (!isLoaded) return null;

  const editButtonClass =
    "font-['Outfit'] text-[12px] font-normal uppercase leading-[1.2] tracking-[0.6px] text-[#161616]";

  return (
    <div className="min-w-0">
      {/* Mobile top bar (matches the Figma pattern used on /account/orders) */}
      <div className="mb-6 flex items-center gap-3 md:hidden">
        <Link
          href="/account"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#EAEAEA] text-[#161616]"
          aria-label={t('form.back')}
        >
          ←
        </Link>
        <div className="font-['Outfit'] text-[12px] font-normal uppercase tracking-[0.6px] text-[#161616]">
          {t('accountDetails')}
        </div>
      </div>

      <div className="flex flex-col gap-10">
        {/* My information */}
        <section className="flex flex-col gap-6">
          <TitleRow
            title={t('form.myInformation')}
            action={
              <button
                type="button"
                onClick={() => {
                  if (isEditingMyInfo) {
                    void saveMyInfo().then(() => setIsEditingMyInfo(false));
                  } else {
                    setIsEditingMyInfo(true);
                  }
                }}
                className={editButtonClass}
                disabled={isSavingMyInfo}
              >
                {isEditingMyInfo ? t('form.saveInline') : t('form.edit')}
              </button>
            }
          />

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <FieldLabel label={t('form.fullName')} required />
              {isEditingMyInfo ? (
                <TextInput
                  value={data.fullName}
                  onChange={(v) => setData((s) => ({ ...s, fullName: v }))}
                />
              ) : (
                <ReadonlyField value={data.fullName || '-'} />
              )}
            </div>

            <div className="flex flex-col gap-1">
              <FieldLabel label={t('form.companyNameOptional')} />
              {isEditingMyInfo ? (
                <TextInput
                  value={data.companyName ?? ''}
                  onChange={(v) => setData((s) => ({ ...s, companyName: v }))}
                />
              ) : (
                <ReadonlyField value={(data.companyName?.trim() ? data.companyName : '-') || '-'} />
              )}
            </div>

            <div className="flex flex-col gap-1">
              <FieldLabel label={t('form.email')} required />
              {isEditingMyInfo ? (
                <TextInput
                  value={data.email}
                  onChange={(v) => setData((s) => ({ ...s, email: v }))}
                  disabled
                />
              ) : (
                <ReadonlyField value={data.email || '-'} />
              )}
            </div>

            <div className="flex flex-col gap-1">
              <FieldLabel label={t('form.phoneNumber')} required />
              {isEditingMyInfo ? (
                <TextInput
                  value={data.phoneNumber}
                  onChange={(v) => setData((s) => ({ ...s, phoneNumber: v }))}
                />
              ) : (
                <ReadonlyField value={data.phoneNumber || '-'} />
              )}
            </div>
          </div>
        </section>

        {/* Delivery information */}
        <section className="flex flex-col gap-6">
          <TitleRow
            title={t('form.deliveryInformation')}
            action={
              <button
                type="button"
                onClick={() => {
                  if (isEditingDelivery) {
                    void saveDelivery().then(() => setIsEditingDelivery(false));
                  } else {
                    setIsEditingDelivery(true);
                  }
                }}
                className={editButtonClass}
                disabled={isSavingDelivery}
              >
                {isEditingDelivery ? t('form.saveInline') : t('form.edit')}
              </button>
            }
          />

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <FieldLabel label={t('form.country')} required />
              {isEditingDelivery ? (
                <TextInput
                  value={data.country}
                  onChange={(v) => setData((s) => ({ ...s, country: v }))}
                />
              ) : (
                <ReadonlyField value={data.country || '-'} />
              )}
            </div>

            <div className="flex flex-col gap-1">
              <FieldLabel label={t('form.city')} required />
              {isEditingDelivery ? (
                <TextInput
                  value={data.city}
                  onChange={(v) => setData((s) => ({ ...s, city: v }))}
                />
              ) : (
                <ReadonlyField value={data.city || '-'} />
              )}
            </div>

            <div className="flex flex-col gap-1">
              <FieldLabel label={t('form.streetAddress')} required />
              {isEditingDelivery ? (
                <TextInput
                  value={data.streetAddress}
                  onChange={(v) => setData((s) => ({ ...s, streetAddress: v }))}
                />
              ) : (
                <ReadonlyField value={data.streetAddress || '-'} />
              )}
            </div>

            <div className="flex flex-col gap-1">
              <FieldLabel label={t('form.postcodeZip')} required />
              {isEditingDelivery ? (
                <TextInput
                  value={data.postcodeZip}
                  onChange={(v) => setData((s) => ({ ...s, postcodeZip: v }))}
                />
              ) : (
                <ReadonlyField value={data.postcodeZip || '-'} />
              )}
            </div>
          </div>
        </section>

        {/* Change password */}
        <section className="flex flex-col gap-6">
          <TitleRow title={t('changePassword')} />

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <FieldLabel label={t('currentPassword')} required />
              <div className="relative flex h-12 w-full items-center border border-[#BBBBBB]">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={passwordCurrent}
                  onChange={(e) => setPasswordCurrent(e.target.value)}
                  className="h-full w-full bg-transparent px-4 pr-12 font-['Outfit'] text-[12px] font-normal uppercase leading-[1.2] tracking-[0.6px] text-[#161616] focus:outline-none"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-0 top-0 flex h-full items-center justify-center px-4"
                  aria-label={t('form.togglePasswordVisibility')}
                >
                  <EyeIcon />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <FieldLabel label={t('newPassword')} required />
              <div className="relative flex h-12 w-full items-center border border-[#BBBBBB]">
                <input
                  type={showNext ? 'text' : 'password'}
                  value={passwordNext}
                  onChange={(e) => setPasswordNext(e.target.value)}
                  className="h-full w-full bg-transparent px-4 pr-12 font-['Outfit'] text-[12px] font-normal uppercase leading-[1.2] tracking-[0.6px] text-[#161616] focus:outline-none"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNext((v) => !v)}
                  className="absolute right-0 top-0 flex h-full items-center justify-center px-4"
                  aria-label={t('form.togglePasswordVisibility')}
                >
                  <EyeIcon />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <FieldLabel label={t('confirmPassword')} required />
              <div className="relative flex h-12 w-full items-center border border-[#BBBBBB]">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="h-full w-full bg-transparent px-4 pr-12 font-['Outfit'] text-[12px] font-normal uppercase leading-[1.2] tracking-[0.6px] text-[#161616] focus:outline-none"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-0 top-0 flex h-full items-center justify-center px-4"
                  aria-label={t('form.togglePasswordVisibility')}
                >
                  <EyeIcon />
                </button>
              </div>
              {passwordError ? (
                <div className="mt-2 font-['Outfit'] text-[12px] uppercase tracking-[0.6px] text-[#F63333]">
                  {passwordError}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSavePassword}
              className="flex h-12 w-[173px] items-center justify-center rounded-[100px] bg-[#161616]"
            >
              <span className="font-['Outfit'] text-[12px] font-normal uppercase leading-[1.2] tracking-[0.6px] text-white">
                {t('form.save')}
              </span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
