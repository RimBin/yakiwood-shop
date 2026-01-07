export type WoodType = 'spruce' | 'larch' | 'accoya';
export type UsageType = 'facade' | 'terrace' | 'interior' | 'fence';
export type ColorType =
  | 'natural'
  | 'latte'
  | 'graphite'
  | 'dark-brown'
  | 'carbon-light'
  | 'carbon'
  | 'black'
  | 'silver';
export type ProfileType = 'P1' | 'P2' | 'P3' | 'P4';

export type ConfiguratorView = '2d' | '3d';

export const WOOD_OPTIONS: ReadonlyArray<WoodType> = ['spruce', 'larch', 'accoya'];
export const USAGE_OPTIONS: ReadonlyArray<UsageType> = ['facade', 'terrace', 'interior', 'fence'];
export const COLOR_OPTIONS: ReadonlyArray<ColorType> = [
  'natural',
  'latte',
  'graphite',
  'dark-brown',
  'carbon-light',
  'carbon',
  'black',
  'silver',
];
export const PROFILE_OPTIONS: ReadonlyArray<ProfileType> = ['P1', 'P2', 'P3', 'P4'];

export interface ConfigDimensions {
  widthMm?: number;
  lengthMm?: number;
  thicknessMm?: number;
}

export interface ConfiguratorConfig {
  version: 1;
  configId: string;
  productSlug: string;
  presetSlug?: string;
  wood: WoodType;
  usage: UsageType;
  color: ColorType;
  profile: ProfileType;
  view: ConfiguratorView;
  dimensions?: ConfigDimensions;
  createdAt: string;
  updatedAt: string;
}
