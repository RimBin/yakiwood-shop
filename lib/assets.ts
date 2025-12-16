/**
 * Local asset paths - all assets now stored in /public/assets/
 * No more Figma URL dependencies
 */

// Map all assets to local paths
const localAssets = {
  // Project images
  imgProject1: '/assets/imgProject1.jpg',
  imgProject2: '/assets/imgProject2.jpg',
  imgProject3: '/assets/imgProject3.jpg',
  imgProject4: '/assets/imgProject4.jpg',
  imgProject5: '/assets/imgProject5.jpg',
  imgProject6: '/assets/imgProject6.jpg',
  
  // Wood samples
  imgSpruce: '/assets/imgSpruce.png',
  imgLarch1: '/assets/imgLarch1.png',
  imgLarch2: '/assets/imgLarch2.png',
  
  // Colors
  imgColor1: '/assets/imgColor1.png',
  imgColor2: '/assets/imgColor2.png',
  imgColor3: '/assets/imgColor3.png',
  imgColor4: '/assets/imgColor4.png',
  imgColor5: '/assets/imgColor5.png',
  imgColor6: '/assets/imgColor6.png',
  imgColor7: '/assets/imgColor7.png',
  imgColor8: '/assets/imgColor8.png',
  
  // Backgrounds & masks
  imgMask: '/assets/imgMask.jpg',
  imgVector33: '/assets/imgVector33.jpg',
  imgVector37: '/assets/imgVector37.jpg',
  
  // Category images
  imgFence: '/assets/imgFence.jpg',
  imgFacades: '/assets/imgFacades.jpg',
  imgTerrace: '/assets/imgTerrace.jpg',
  imgInterior: '/assets/imgInterior.jpg',
  
  // Logo & UI
  imgLogo: '/assets/imgLogo.svg',
  imgCart: '/assets/imgCart.svg',
  
  // Icons
  imgIconTruck: '/assets/imgIconTruck.svg',
  imgIconCoins: '/assets/imgIconCoins.svg',
  imgIconPlant: '/assets/imgIconPlant.svg',
  
  // Certifications
  certEpd: '/assets/cert-epd.png',
  certFsc: '/assets/cert-fsc.png',
  certEu: '/assets/cert-eu.png',
} as const;

export type AssetKey = keyof typeof localAssets;

// Get single asset
export function getAsset(key: AssetKey): string {
  return localAssets[key];
}

// Get multiple assets
export function getAssets(keys: AssetKey[]): Record<string, string> {
  return keys.reduce<Record<string, string>>((acc, k) => {
    acc[k] = localAssets[k];
    return acc;
  }, {});
}

// Grouped exports for convenience
export const assets = {
  projects: [
    localAssets.imgProject1,
    localAssets.imgProject2,
    localAssets.imgProject3,
    localAssets.imgProject4,
    localAssets.imgProject5,
    localAssets.imgProject6,
  ],
  wood: {
    spruce: localAssets.imgSpruce,
    larch1: localAssets.imgLarch1,
    larch2: localAssets.imgLarch2,
  },
  colors: [
    localAssets.imgColor1,
    localAssets.imgColor2,
    localAssets.imgColor3,
    localAssets.imgColor4,
    localAssets.imgColor5,
    localAssets.imgColor6,
    localAssets.imgColor7,
    localAssets.imgColor8,
  ],
  categories: {
    fence: localAssets.imgFence,
    facades: localAssets.imgFacades,
    terrace: localAssets.imgTerrace,
    interior: localAssets.imgInterior,
  },
  icons: {
    truck: localAssets.imgIconTruck,
    coins: localAssets.imgIconCoins,
    plant: localAssets.imgIconPlant,
  },
  certifications: {
    epd: localAssets.certEpd,
    fsc: localAssets.certFsc,
    eu: localAssets.certEu,
  },
  ui: {
    logo: localAssets.imgLogo,
    cart: localAssets.imgCart,
  },
};
