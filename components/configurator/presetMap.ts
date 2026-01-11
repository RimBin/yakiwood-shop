import type { ColorType, ProfileType, UsageType, WoodType } from './types';

export const INDEXABLE_SHOU_SUGI_BAN_VARIANT_SLUGS = [
  'larch-carbon',
  'spruce-natural',
] as const;

export type IndexableVariantSlug = (typeof INDEXABLE_SHOU_SUGI_BAN_VARIANT_SLUGS)[number];

export type PresetOverrides = Partial<{
  wood: WoodType;
  usage: UsageType;
  color: ColorType;
  profile: ProfileType;
}>;

const PRESET_MAP: Record<string, PresetOverrides> = {
  'larch-carbon': {
    wood: 'larch',
    usage: 'facade',
    color: 'carbon',
    profile: 'P2',
  },
  'spruce-natural': {
    wood: 'spruce',
    usage: 'facade',
    color: 'natural',
    profile: 'P1',
  },
};

export function getPresetOverrides(presetSlug: string | undefined | null): PresetOverrides | null {
  if (!presetSlug) return null;
  return PRESET_MAP[presetSlug] ?? null;
}

export function isIndexableVariantSlug(slug: string): slug is IndexableVariantSlug {
  return (INDEXABLE_SHOU_SUGI_BAN_VARIANT_SLUGS as readonly string[]).includes(slug);
}
