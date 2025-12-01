import manifest from '../public/assets/figma-manifest.json';

// Type for manifest keys
export type AssetKey = keyof typeof manifest;

// Map of asset keys to their file extensions (determined during download)
const assetExtensions: Record<string, string> = {
  imgProject1: '.jpg',
  imgProject2: '.jpg',
  imgProject3: '.jpg',
  imgProject4: '.jpg',
  imgProject5: '.jpg',
  imgProject6: '.jpg',
  imgSpruce: '.png',
  imgLarch1: '.png',
  imgLarch2: '.png',
  imgColor1: '.png',
  imgColor2: '.png',
  imgColor3: '.png',
  imgColor4: '.png',
  imgColor5: '.png',
  imgColor6: '.png',
  imgColor7: '.png',
  imgColor8: '.png',
  imgMask: '.jpg',
  imgVector33: '.jpg',
  imgVector37: '.jpg',
  imgFence: '.jpg',
  imgFacades: '.jpg',
  imgTerrace: '.jpg',
  imgInterior: '.jpg',
  imgLogo: '.jpg',
  imgCart: '.jpg',
  imgIconTruck: '.jpg',
  imgIconCoins: '.jpg',
  imgIconPlant: '.jpg',
};

// Returns local path if downloaded, otherwise remote URL
export function getAsset(key: AssetKey): string {
  const ext = assetExtensions[key];
  if (ext) {
    return `/assets/${key}${ext}`;
  }
  // Fallback to remote URL if extension not mapped
  return manifest[key];
}

// Convenience batch getter
export function getAssets(keys: AssetKey[]): Record<string, string> {
  return keys.reduce<Record<string, string>>((acc, k) => {
    acc[k] = getAsset(k);
    return acc;
  }, {});
}
