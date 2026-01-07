/**
 * Local asset paths - assets stored under /public/images and /public/icons
 * No more Figma URL dependencies
 */

// Map all assets to local paths
const localAssets = {
  // Project images
  imgProject1: '/images/ui/projects/imgProject1.jpg',
  imgProject2: '/images/ui/projects/imgProject2.jpg',
  imgProject3: '/images/ui/projects/imgProject3.jpg',
  imgProject4: '/images/ui/projects/imgProject4.jpg',
  imgProject5: '/images/ui/projects/imgProject5.jpg',
  imgProject6: '/images/ui/projects/imgProject6.jpg',
  
  // Wood samples
  imgSpruce: '/images/ui/wood/imgSpruce.png',
  imgLarch1: '/images/ui/wood/imgLarch1.png',
  imgLarch2: '/images/ui/wood/imgLarch2.png',
  
  // Colors
  imgColor1: '/images/ui/colors/imgColor1.png',
  imgColor2: '/images/ui/colors/imgColor2.png',
  imgColor3: '/images/ui/colors/imgColor3.png',
  imgColor4: '/images/ui/colors/imgColor4.png',
  imgColor5: '/images/ui/colors/imgColor5.png',
  imgColor6: '/images/ui/colors/imgColor6.png',
  imgColor7: '/images/ui/colors/imgColor7.png',
  imgColor8: '/images/ui/colors/imgColor8.png',
  
  // Backgrounds & masks
  imgMask: '/images/ui/backgrounds/imgMask.jpg',
  imgVector33: '/images/ui/backgrounds/imgVector33.jpg',
  imgVector37: '/images/ui/backgrounds/imgVector37.jpg',
  
  // Category images
  imgFence: '/images/ui/categories/imgFence.jpg',
  imgFacades: '/images/ui/categories/imgFacades.jpg',
  imgTerrace: '/images/ui/categories/imgTerrace.jpg',
  imgInterior: '/images/ui/categories/imgInterior.jpg',
  
  // Logo & UI
  imgLogo: '/images/ui/brand/imgLogo.svg',
  imgCart: '/icons/ui/shopping-cart-simple.svg',
  
  // Icons (use white PNG variants for announcement bar)
  imgIconTruck: '/icons/ui/package.png',
  imgIconCoins: '/icons/ui/coins.png',
  imgIconPlant: '/icons/ui/plant.png',
  
  // Certifications
  certEpd: '/images/ui/certifications/cert-epd.png',
  certFsc: '/images/ui/certifications/cert-fsc.png',
  certEu: '/images/ui/certifications/cert-eu.png',

  // Hero
  heroVector: '/images/hero/Vector.png',
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
  // Expose hero vector directly
  heroVector: localAssets.heroVector,
};
