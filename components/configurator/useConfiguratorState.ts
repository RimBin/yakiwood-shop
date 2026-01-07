'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ConfiguratorConfig, ConfiguratorView, ColorType, ProfileType, UsageType, WoodType } from './types';
import { getPresetOverrides } from './presetMap';

const STORAGE_KEY = 'yakiwood:configurator:shou-sugi-ban-wood:v1';

function nowIso() {
  return new Date().toISOString();
}

function createConfigId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback: not cryptographically strong, but sufficient as a stub identifier.
  return `cfg_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function safeParse(json: string): unknown {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isStoredConfig(value: unknown): value is ConfiguratorConfig {
  if (!value || typeof value !== 'object') return false;
  const v = value as Partial<ConfiguratorConfig>;
  return (
    v.version === 1 &&
    typeof v.configId === 'string' &&
    typeof v.productSlug === 'string' &&
    typeof v.wood === 'string' &&
    typeof v.usage === 'string' &&
    typeof v.color === 'string' &&
    typeof v.profile === 'string' &&
    typeof v.view === 'string' &&
    typeof v.createdAt === 'string' &&
    typeof v.updatedAt === 'string'
  );
}

export interface UseConfiguratorStateArgs {
  productSlug: string;
  presetSlug?: string | null;
}

export function useConfiguratorState({ productSlug, presetSlug }: UseConfiguratorStateArgs) {
  const presetOverrides = useMemo(() => getPresetOverrides(presetSlug), [presetSlug]);

  const defaultConfig = useMemo<ConfiguratorConfig>(() => {
    const ts = nowIso();
    return {
      version: 1,
      configId: 'pending',
      productSlug,
      presetSlug: presetSlug ?? undefined,
      wood: 'spruce',
      usage: 'facade',
      color: 'natural',
      profile: 'P1',
      view: '2d',
      createdAt: ts,
      updatedAt: ts,
    };
  }, [productSlug, presetSlug]);

  const [config, setConfig] = useState<ConfiguratorConfig>(defaultConfig);
  const [isHydrated, setIsHydrated] = useState(false);
  const [offerStatus, setOfferStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const lastSavedRef = useRef<string | null>(null);

  useEffect(() => {
    // Hydrate from localStorage only when there is no preset.
    // Preset URLs are intentionally treated as a fresh config context.
    const shouldLoadStored = !presetSlug;

    const ts = nowIso();
    const initial: ConfiguratorConfig = {
      ...defaultConfig,
      configId: createConfigId(),
      createdAt: ts,
      updatedAt: ts,
    };

    if (typeof window !== 'undefined' && shouldLoadStored) {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? safeParse(raw) : null;

      if (isStoredConfig(parsed) && parsed.productSlug === productSlug) {
        // Keep stored configId and timestamps.
        setConfig({
          ...parsed,
          updatedAt: ts,
        });
        setIsHydrated(true);
        return;
      }
    }

    // Apply preset overrides (if any) on the fresh config.
    const withPreset = presetOverrides ? { ...initial, ...presetOverrides, presetSlug: presetSlug ?? undefined } : initial;
    setConfig(withPreset);
    setIsHydrated(true);
  }, [defaultConfig, presetOverrides, presetSlug, productSlug]);

  useEffect(() => {
    if (!isHydrated) return;
    if (typeof window === 'undefined') return;

    const serialized = JSON.stringify(config);
    if (serialized === lastSavedRef.current) return;

    window.localStorage.setItem(STORAGE_KEY, serialized);
    lastSavedRef.current = serialized;
  }, [config, isHydrated]);

  const setWood = useCallback((wood: WoodType) => {
    setConfig((prev) => ({ ...prev, wood, updatedAt: nowIso() }));
  }, []);

  const setUsage = useCallback((usage: UsageType) => {
    setConfig((prev) => ({ ...prev, usage, updatedAt: nowIso() }));
  }, []);

  const setColor = useCallback((color: ColorType) => {
    setConfig((prev) => ({ ...prev, color, updatedAt: nowIso() }));
  }, []);

  const setProfile = useCallback((profile: ProfileType) => {
    setConfig((prev) => ({ ...prev, profile, updatedAt: nowIso() }));
  }, []);

  const setView = useCallback((view: ConfiguratorView) => {
    setConfig((prev) => ({ ...prev, view, updatedAt: nowIso() }));
  }, []);

  const submitOffer = useCallback(async () => {
    setOfferStatus('submitting');
    try {
      const res = await fetch('/api/offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (!res.ok) {
        setOfferStatus('error');
        return { ok: false as const };
      }

      const data = (await res.json()) as { ok?: boolean; received?: string };
      if (data?.ok) {
        setOfferStatus('success');
        return { ok: true as const, received: data.received };
      }

      setOfferStatus('error');
      return { ok: false as const };
    } catch {
      setOfferStatus('error');
      return { ok: false as const };
    }
  }, [config]);

  return {
    config,
    isHydrated,
    presetOverrides,
    offerStatus,
    actions: {
      setWood,
      setUsage,
      setColor,
      setProfile,
      setView,
      submitOffer,
      resetOfferStatus: () => setOfferStatus('idle'),
    },
  };
}
