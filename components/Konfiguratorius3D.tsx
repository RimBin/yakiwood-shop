"use client";

import React, { Suspense, useMemo, useState, useEffect, useLayoutEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import type { ProductColorVariant, ProductProfileVariant } from '@/lib/products.supabase';
import { getLocalizedColorName, getLocalizedProfileName } from '@/lib/products.supabase';
import { useLocale, useTranslations } from 'next-intl';
import { useCartStore } from '@/lib/cart/store';
import { trackEvent } from '@/lib/analytics';
import { downloadConfigurationPDF, type ConfigurationPDFData } from '@/lib/configurator/pdf-generator';
import { getGenericModelUrl, getProductModelUrl, hasProductModel } from '@/lib/models';

interface ProfileModelProps {
  color: string;
  finish: ProductProfileVariant | null;
  variantKey: string;
  autoRotate?: boolean;
  rotationYRef?: React.MutableRefObject<number>;
  visualDimensionsMm?: {
    widthMm?: number;
    lengthMm?: number;
    thicknessMm?: number;
  };
}

const DEFAULT_CONFIGURATOR_GLB_PATH = getGenericModelUrl();

function hashStringToSeed(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seedValue: number): () => number {
  let seed = seedValue || 1;
  return () => {
    seed += 0x6d2b79f5;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createLongGrainTexture(variantKey: string): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  const random = createSeededRandom(hashStringToSeed(`long:${variantKey}`));

  const light = 125 + Math.round(random() * 18);
  const mid = 98 + Math.round(random() * 16);
  const dark = 72 + Math.round(random() * 16);
  ctx.fillStyle = `rgb(${light}, ${mid}, ${dark})`;
  ctx.fillRect(0, 0, size, size);

  for (let x = 0; x < size; x += 2) {
    const wave = Math.sin((x / size) * Math.PI * (7 + random() * 3));
    const stripeStrength = 0.12 + random() * 0.2 + Math.abs(wave) * 0.18;
    const line = Math.max(20, Math.min(235, Math.round(125 - stripeStrength * 80)));
    ctx.fillStyle = `rgba(${line}, ${line - 12}, ${line - 26}, ${0.2 + random() * 0.25})`;
    ctx.fillRect(x, 0, 1, size);
  }

  for (let i = 0; i < 90; i += 1) {
    const knotX = Math.floor(random() * size);
    const knotY = Math.floor(random() * size);
    const knotW = 8 + random() * 24;
    const knotH = 2 + random() * 5;
    ctx.fillStyle = `rgba(60, 42, 28, ${0.03 + random() * 0.06})`;
    ctx.fillRect(knotX, knotY, knotW, knotH);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2.6, 2.6);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function createEndGrainTexture(variantKey: string): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  const random = createSeededRandom(hashStringToSeed(`end:${variantKey}`));
  ctx.fillStyle = `rgb(${112 + Math.round(random() * 20)}, ${89 + Math.round(random() * 16)}, ${68 + Math.round(random() * 14)})`;
  ctx.fillRect(0, 0, size, size);

  const centerX = size * (0.42 + random() * 0.16);
  const centerY = size * (0.42 + random() * 0.16);

  for (let r = 8; r < size * 0.7; r += 6 + random() * 5) {
    const jitter = (random() - 0.5) * 8;
    const alpha = 0.08 + random() * 0.18;
    const ring = 54 + Math.round(random() * 34);
    ctx.beginPath();
    ctx.strokeStyle = `rgba(${ring}, ${ring - 10}, ${ring - 24}, ${alpha})`;
    ctx.lineWidth = 1 + random() * 2;
    ctx.arc(centerX + jitter, centerY - jitter, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (let i = 0; i < 120; i += 1) {
    const dotX = random() * size;
    const dotY = random() * size;
    const dotR = 0.6 + random() * 1.5;
    ctx.beginPath();
    ctx.fillStyle = `rgba(50, 37, 27, ${0.08 + random() * 0.2})`;
    ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.8, 1.8);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function normalizeProfileHint(value: string): string {
  return value
    .normalize('NFD')
    // Remove diacritics.
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();
}

function isHalfTaper45(finish: ProductProfileVariant | null): boolean {
  if (!finish) return false;
  const hint = normalizeProfileHint([finish.code, finish.name].filter(Boolean).join(' '));
  return (
    (hint.includes('taper') && hint.includes('45')) ||
    (hint.includes('spunto') && hint.includes('45')) ||
    (hint.includes('spon') && hint.includes('45')) ||
    (hint.includes('half') && hint.includes('taper'))
  );
}

function createCenteredExtrudeGeometry(shape: THREE.Shape, depth: number): THREE.ExtrudeGeometry {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
    steps: 1,
  });

  // Center geometry so rotations happen around its own axis.
  geometry.center();
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

function ProfileModel({ color, finish, variantKey, autoRotate = true, rotationYRef, visualDimensionsMm }: ProfileModelProps) {
  const groupRef = useRef<THREE.Group | null>(null);

  useLayoutEffect(() => {
    if (!groupRef.current || !rotationYRef) return;
    groupRef.current.rotation.y = rotationYRef.current;
  }, [rotationYRef]);

  const geometry = useMemo(() => {
    const widthMm = visualDimensionsMm?.widthMm ?? finish?.dimensions?.width;
    const thicknessMm = visualDimensionsMm?.thicknessMm ?? finish?.dimensions?.thickness;
    const lengthMm = visualDimensionsMm?.lengthMm ?? finish?.dimensions?.length;

    // Keep the model roughly in the same scale as the previous placeholder box: [2, 0.2, 1].
    // width 120mm -> ~2 units, thickness 20mm -> ~0.2 units, length 1000mm -> ~1 unit.
    const widthUnits = (typeof widthMm === 'number' && widthMm > 0 ? widthMm : 120) / 60;
    const thicknessUnits = (typeof thicknessMm === 'number' && thicknessMm > 0 ? thicknessMm : 20) / 100;
    const depthUnits = (typeof lengthMm === 'number' && lengthMm > 0 ? lengthMm : 1000) / 1000;

    if (isHalfTaper45(finish)) {
      // Simple “half taper 45°” approximation:
      // one side is a 45° chamfer (bevel length equals thickness).
      const bevel = Math.min(thicknessUnits, widthUnits * 0.45);
      const shape = new THREE.Shape();
      shape.moveTo(0, 0);
      shape.lineTo(widthUnits, 0);
      shape.lineTo(widthUnits - bevel, thicknessUnits);
      shape.lineTo(0, thicknessUnits);
      shape.lineTo(0, 0);
      return createCenteredExtrudeGeometry(shape, depthUnits);
    }

    // Fallback: simple rectangular profile.
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(widthUnits, 0);
    shape.lineTo(widthUnits, thicknessUnits);
    shape.lineTo(0, thicknessUnits);
    shape.lineTo(0, 0);
    return createCenteredExtrudeGeometry(shape, depthUnits);
  }, [finish, visualDimensionsMm?.lengthMm, visualDimensionsMm?.thicknessMm, visualDimensionsMm?.widthMm]);

  const longGrainMap = useMemo(() => createLongGrainTexture(variantKey), [variantKey]);
  const endGrainMap = useMemo(() => createEndGrainTexture(variantKey), [variantKey]);

  useEffect(() => {
    return () => {
      longGrainMap.dispose();
      endGrainMap.dispose();
    };
  }, [longGrainMap, endGrainMap]);

  const materials = useMemo(() => {
    const capMaterial = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.84,
      metalness: 0.06,
      map: endGrainMap,
    });

    const sideMaterial = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.78,
      metalness: 0.08,
      map: longGrainMap,
    });

    return [capMaterial, sideMaterial] as THREE.Material[];
  }, [color, endGrainMap, longGrainMap]);

  useEffect(() => {
    return () => {
      materials.forEach((material) => material.dispose());
    };
  }, [materials]);

  useFrame((_, delta) => {
    if (!autoRotate) return;
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.7;
    if (rotationYRef) {
      rotationYRef.current = groupRef.current.rotation.y;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh geometry={geometry} material={materials} castShadow receiveShadow frustumCulled={false} />
    </group>
  );
}

function cloneSceneWithUniqueMaterials(scene: THREE.Group): THREE.Group {
  const cloned = scene.clone(true);

  cloned.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;

    if (Array.isArray(mesh.material)) {
      mesh.material = mesh.material.map((material) => material.clone());
      return;
    }

    mesh.material = mesh.material.clone();
  });

  return cloned;
}

function getFinishSurfacePreset(finish: ProductProfileVariant | null): { roughness: number; metalness: number } {
  if (!finish) return { roughness: 0.78, metalness: 0.08 };

  const token = normalizeProfileHint([finish.code, finish.name, finish.nameEn, finish.nameLt].filter(Boolean).join(' '));

  if (token.includes('matte') || token.includes('mat') || token.includes('natur')) {
    return { roughness: 0.86, metalness: 0.04 };
  }

  if (token.includes('semi') || token.includes('sat')) {
    return { roughness: 0.62, metalness: 0.08 };
  }

  if (token.includes('gloss') || token.includes('polish')) {
    return { roughness: 0.42, metalness: 0.12 };
  }

  return { roughness: 0.74, metalness: 0.08 };
}

function normalizeColorToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function resolveColorHex(color: ProductColorVariant | null): string {
  if (color?.hex && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color.hex)) {
    return color.hex;
  }

  const source = [color?.id, color?.name, color?.nameEn, color?.nameLt].filter(Boolean).join(' ');
  const token = normalizeColorToken(source);

  if (token.includes('black') || token.includes('juod')) return '#1f1f1f';
  if (token.includes('carbon-light') || token.includes('carbonlight')) return '#5b5b5b';
  if (token.includes('carbon')) return '#333333';
  if (token.includes('graphite') || token.includes('grafit')) return '#535353';
  if (token.includes('silver') || token.includes('sidab')) return '#b7b7b7';
  if (token.includes('dark-brown') || token.includes('darkbrown') || token.includes('tams') || token.includes('brown')) return '#5b3b2b';
  if (token.includes('latte')) return '#b18e70';
  if (token.includes('natural') || token.includes('natur') || token.includes('naturali')) return '#8f6a4d';

  return '#444444';
}

type FinishTextureWood = 'larch' | 'spruce';

const MODEL_COLOR_SUFFIX_REGEX = /(black|carbon|carbon-light|graphite|natural|dark-brown|latte|silver)$/;

function resolveColorVariantSlug(baseSlug: string, colorSlug: string): string | null {
  if (!MODEL_COLOR_SUFFIX_REGEX.test(baseSlug)) return null;
  return baseSlug.replace(MODEL_COLOR_SUFFIX_REGEX, colorSlug);
}

function detectModelTypeToken(value: string): 'terrace' | 'facade' | null {
  const token = value.toLowerCase();
  if (token.includes('terrace') || token.includes('teras')) return 'terrace';
  if (token.includes('facade') || token.includes('fasad')) return 'facade';
  return null;
}

function detectModelWoodToken(value: string): 'larch' | 'spruce' | null {
  const token = value.toLowerCase();
  if (token.includes('larch') || token.includes('maumed')) return 'larch';
  if (token.includes('spruce') || token.includes('egle')) return 'spruce';
  return null;
}

function buildColorVariantSlugCandidates(input: {
  modelSlug?: string;
  modelUrl?: string;
  colorSlug: string;
}): string[] {
  const candidates: string[] = [];
  const { modelSlug, modelUrl, colorSlug } = input;

  if (modelSlug) {
    const direct = resolveColorVariantSlug(modelSlug, colorSlug);
    if (direct) candidates.push(direct);
  }

  const source = `${modelSlug ?? ''} ${modelUrl ?? ''}`;
  const type = detectModelTypeToken(source);
  const wood = detectModelWoodToken(source);

  if (!type || !wood) return candidates;

  const woodLt = wood === 'larch' ? 'maumedis' : 'egle';
  const typeLt = type === 'terrace' ? 'terasine-lenta-terasai' : 'dailylente-fasadui';

  candidates.push(`degintos-medienos-${typeLt}-${woodLt}-${colorSlug}`);
  candidates.push(`shou-sugi-ban-for-${type}-${wood}-${colorSlug}`);

  return candidates;
}

function resolveColorVariantModelUrl(input: {
  modelSlug?: string;
  modelUrl?: string;
  colorSlug: string;
}): string | null {
  const candidates = buildColorVariantSlugCandidates(input);
  const matched = candidates.find((slug) => hasProductModel(slug));
  if (!matched) return null;
  return getProductModelUrl({ slug: matched });
}

function resolveColorSlug(color: ProductColorVariant | null):
  | 'black'
  | 'carbon'
  | 'carbon-light'
  | 'graphite'
  | 'natural'
  | 'dark-brown'
  | 'latte'
  | 'silver'
  | null {
  const source = [color?.id, color?.name, color?.nameEn, color?.nameLt].filter(Boolean).join(' ');
  const token = normalizeColorToken(source);

  if (token.includes('carbon-light') || token.includes('carbonlight') || token.includes('sviesi-angl') || token.includes('sviesi-anglis')) {
    return 'carbon-light';
  }
  if (token.includes('carbon') || token.includes('angl')) return 'carbon';
  if (token.includes('graphite') || token.includes('grafit')) return 'graphite';
  if (token.includes('silver') || token.includes('sidab')) return 'silver';
  if (token.includes('dark-brown') || token.includes('darkbrown') || token.includes('tams') || token.includes('brown') || token.includes('ruda')) return 'dark-brown';
  if (token.includes('latte')) return 'latte';
  if (token.includes('black') || token.includes('juod')) return 'black';
  if (token.includes('natural') || token.includes('natur')) return 'natural';
  return null;
}

function resolveFinishTextureWood(modelUrl: string): FinishTextureWood | null {
  const token = modelUrl.toLowerCase();
  if (token.includes('larch')) return 'larch';
  if (token.includes('spruce')) return 'spruce';
  return null;
}

function getFinishTextureUrl(wood: FinishTextureWood, colorSlug: string): string {
  return `/assets/finishes/${wood}/shou-sugi-ban-${wood}-${colorSlug}-facade-terrace-cladding.webp`;
}

const finishTextureCache = new Map<string, THREE.Texture>();
const finishTexturePromiseCache = new Map<string, Promise<THREE.Texture | null>>();

function cloneFinishTextureInstance(base: THREE.Texture): THREE.Texture {
  const texture = base.clone();
  // Ensure we keep the same underlying image data.
  texture.image = base.image;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;
  texture.needsUpdate = true;
  return texture;
}

function loadFinishTexture(url: string): Promise<THREE.Texture | null> {
  const cached = finishTextureCache.get(url);
  if (cached) {
    cached.colorSpace = THREE.SRGBColorSpace;
    cached.flipY = false;
    cached.needsUpdate = true;
    return Promise.resolve(cached);
  }

  const cachedPromise = finishTexturePromiseCache.get(url);
  if (cachedPromise) return cachedPromise;

  const loader = new THREE.TextureLoader();
  const promise = new Promise<THREE.Texture | null>((resolve) => {
    loader.load(
      url,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.flipY = false;
        texture.needsUpdate = true;
        finishTextureCache.set(url, texture);
        resolve(texture);
      },
      undefined,
      () => resolve(null)
    );
  });

  finishTexturePromiseCache.set(url, promise);
  return promise;
}

function useFinishTexture(url: string | null) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!url) {
      setTexture(null);
      return () => {
        isMounted = false;
      };
    }

    loadFinishTexture(url).then((loaded) => {
      if (!isMounted) return;
      setTexture(loaded ? cloneFinishTextureInstance(loaded) : null);
    });

    return () => {
      isMounted = false;
    };
  }, [url]);

  return texture;
}

class GLBErrorBoundary extends React.Component<
  {
    modelUrl: string;
    fallback: React.ReactNode;
    children: React.ReactNode;
  },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('[Konfiguratorius3D] GLB load/render failed', {
      modelUrl: this.props.modelUrl,
      error,
    });
  }

  componentDidUpdate(prevProps: Readonly<{ modelUrl: string }>) {
    if (prevProps.modelUrl !== this.props.modelUrl && this.state.hasError) {
      // Reset boundary when a new model is selected.
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

interface GLBProfileModelProps {
  modelUrl: string;
  materialVariantUrl?: string | null;
  color: string;
  finish: ProductProfileVariant | null;
  overrideColorMap?: THREE.Texture | null;
  overrideColorMapKey?: string | null;
  applyColorTint?: boolean;
  applyDynamicFinishSurface?: boolean;
  autoRotate?: boolean;
  rotationYRef?: React.MutableRefObject<number>;
  visualDimensionsMm?: {
    widthMm?: number;
    lengthMm?: number;
    thicknessMm?: number;
  };
}

function GLBProfileModel({
  modelUrl,
  materialVariantUrl,
  color,
  finish,
  overrideColorMap,
  overrideColorMapKey,
  applyColorTint = true,
  applyDynamicFinishSurface = true,
  autoRotate = true,
  rotationYRef,
  visualDimensionsMm,
}: GLBProfileModelProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const gltf = useGLTF(modelUrl) as { scene: THREE.Group };
  const materialVariantGltf = useGLTF(materialVariantUrl ?? modelUrl) as { scene: THREE.Group };

  const visualScale = useMemo(() => {
    const widthMm = visualDimensionsMm?.widthMm ?? finish?.dimensions?.width ?? 120;
    const lengthMm = visualDimensionsMm?.lengthMm ?? finish?.dimensions?.length ?? 3300;
    const thicknessMm = visualDimensionsMm?.thicknessMm ?? finish?.dimensions?.thickness ?? 28;

    // Use fixed baseline so width/length selectors visibly affect proportions.
    const widthScale = Math.max(0.65, Math.min(1.6, widthMm / 120));
    const lengthScale = Math.max(0.75, Math.min(1.4, lengthMm / 3300));
    const thicknessScale = Math.max(0.6, Math.min(1.5, thicknessMm / 28));

    return { widthScale, lengthScale, thicknessScale };
  }, [finish?.dimensions?.length, finish?.dimensions?.thickness, finish?.dimensions?.width, visualDimensionsMm?.lengthMm, visualDimensionsMm?.thicknessMm, visualDimensionsMm?.widthMm]);

  const modelScene = useMemo(() => {
    const cloned = cloneSceneWithUniqueMaterials(gltf.scene);

    // Center and uniformly fit the model so it remains clearly visible in the viewport.
    // Uniform scale preserves proportions.
    const wrapper = new THREE.Group();
    wrapper.add(cloned);

    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // Center model at world origin.
    cloned.position.set(-center.x, -center.y, -center.z);

    const maxDim = Math.max(size.x, size.y, size.z);
    if (Number.isFinite(maxDim) && maxDim > 0) {
      const targetMaxDim = 2.0;
      const scale = targetMaxDim / maxDim;
      wrapper.scale.set(
        scale * visualScale.widthScale,
        scale * visualScale.thicknessScale,
        scale * visualScale.lengthScale
      );
    }

    return wrapper;
  }, [gltf.scene, visualScale.lengthScale, visualScale.thicknessScale, visualScale.widthScale]);

  const variantMaterialsByName = useMemo(() => {
    const map = new Map<string, THREE.MeshStandardMaterial>();

    materialVariantGltf.scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;

      const register = (material: THREE.Material) => {
        const standardMaterial = material as THREE.MeshStandardMaterial;
        const key = (standardMaterial.name ?? '').trim().toLowerCase();
        if (!key) return;
        if (!map.has(key)) {
          map.set(key, standardMaterial);
        }
      };

      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(register);
      } else {
        register(mesh.material);
      }
    });

    return map;
  }, [materialVariantGltf.scene]);

  useLayoutEffect(() => {
    const surface = getFinishSurfacePreset(finish);

    modelScene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh || !mesh.material) return;

      const applyMaterial = (material: THREE.Material) => {
        const standardMaterial = material as THREE.MeshStandardMaterial;
        const materialName = (standardMaterial.name ?? '').toLowerCase();
        const isFixedMaterial =
          materialName.includes('bottom') ||
          materialName.includes('end_grain') ||
          materialName.includes('end grain');
        const hasBaseMap = 'map' in standardMaterial && !!standardMaterial.map;

        const cloneMapLike = (source: THREE.Texture | null | undefined): THREE.Texture | null => {
          if (!source) return null;
          const cloned = source.clone();
          cloned.image = source.image;
          cloned.colorSpace = source.colorSpace;
          cloned.flipY = source.flipY;
          cloned.wrapS = source.wrapS;
          cloned.wrapT = source.wrapT;
          cloned.repeat.copy(source.repeat);
          cloned.offset.copy(source.offset);
          cloned.center.copy(source.center);
          cloned.rotation = source.rotation;
          if ('channel' in source && typeof (source as any).channel === 'number') {
            (cloned as any).channel = (source as any).channel;
          }
          cloned.needsUpdate = true;
          return cloned;
        };

        // Keep GLB textures enabled. If the model uses embedded textures,
        // GLTFLoader will create blob: URLs for them — we only need to ensure
        // the correct color space for color textures.
        if ('map' in standardMaterial && standardMaterial.map) {
          standardMaterial.map.colorSpace = THREE.SRGBColorSpace;
          standardMaterial.map.needsUpdate = true;
        }
        if ('emissiveMap' in standardMaterial && standardMaterial.emissiveMap) {
          standardMaterial.emissiveMap.colorSpace = THREE.SRGBColorSpace;
          standardMaterial.emissiveMap.needsUpdate = true;
        }

        // Keep bottom/end materials as-authored in the GLB.
        // For the main wood surface:
        // - if we have an override texture, apply it as baseColor map (real texture switch)
        // - otherwise, fall back to tinting (brightness/color shift)
        if (!isFixedMaterial) {
          const variantSource = variantMaterialsByName.get((standardMaterial.name ?? '').trim().toLowerCase());

          if (variantSource && materialVariantUrl) {
            if ('map' in standardMaterial) {
              standardMaterial.map = cloneMapLike(variantSource.map);
              if (standardMaterial.map) {
                standardMaterial.map.colorSpace = THREE.SRGBColorSpace;
                standardMaterial.map.needsUpdate = true;
              }
            }

            if ('normalMap' in standardMaterial) {
              standardMaterial.normalMap = cloneMapLike(variantSource.normalMap);
            }
            if ('roughnessMap' in standardMaterial) {
              standardMaterial.roughnessMap = cloneMapLike(variantSource.roughnessMap);
            }
            if ('metalnessMap' in standardMaterial) {
              standardMaterial.metalnessMap = cloneMapLike(variantSource.metalnessMap);
            }
            if ('aoMap' in standardMaterial) {
              standardMaterial.aoMap = cloneMapLike(variantSource.aoMap);
            }
            if ('displacementMap' in standardMaterial) {
              standardMaterial.displacementMap = cloneMapLike(variantSource.displacementMap);
            }
            if ('emissiveMap' in standardMaterial) {
              standardMaterial.emissiveMap = cloneMapLike(variantSource.emissiveMap);
            }

            if ('roughness' in standardMaterial) {
              standardMaterial.roughness = variantSource.roughness;
            }
            if ('metalness' in standardMaterial) {
              standardMaterial.metalness = variantSource.metalness;
            }
            if ('aoMapIntensity' in standardMaterial) {
              standardMaterial.aoMapIntensity = variantSource.aoMapIntensity;
            }
            if ('displacementScale' in standardMaterial) {
              standardMaterial.displacementScale = variantSource.displacementScale;
            }
            if ('displacementBias' in standardMaterial) {
              standardMaterial.displacementBias = variantSource.displacementBias;
            }
            if ('normalScale' in standardMaterial && standardMaterial.normalScale && variantSource.normalScale) {
              standardMaterial.normalScale.copy(variantSource.normalScale);
            }

            if ('color' in standardMaterial && standardMaterial.color) {
              standardMaterial.color.set('#ffffff');
            }
          } else
          if (overrideColorMap && 'map' in standardMaterial) {
            const existingKey = (standardMaterial.userData as any)?.__finishTextureKey as string | undefined;
            const existingTexture = (standardMaterial.userData as any)?.__finishTexture as THREE.Texture | undefined;

            const prevMap = standardMaterial.map;

            const nextTexture =
              overrideColorMapKey && existingKey === overrideColorMapKey && existingTexture
                ? existingTexture
                : cloneFinishTextureInstance(overrideColorMap);

            // Preserve UV channel and mapping transforms from the original GLB texture.
            if (prevMap) {
              nextTexture.wrapS = prevMap.wrapS;
              nextTexture.wrapT = prevMap.wrapT;
              nextTexture.repeat.copy(prevMap.repeat);
              nextTexture.offset.copy(prevMap.offset);
              nextTexture.center.copy(prevMap.center);
              nextTexture.rotation = prevMap.rotation;

              if ('channel' in prevMap && typeof (prevMap as any).channel === 'number') {
                (nextTexture as any).channel = (prevMap as any).channel;
              }
            }

            nextTexture.needsUpdate = true;

            (standardMaterial.userData as any).__finishTextureKey = overrideColorMapKey ?? undefined;
            (standardMaterial.userData as any).__finishTexture = nextTexture;

            standardMaterial.map = nextTexture;
            if ('color' in standardMaterial && standardMaterial.color) {
              standardMaterial.color.set('#ffffff');
            }
          } else if (applyColorTint && !hasBaseMap && 'color' in standardMaterial && standardMaterial.color) {
            standardMaterial.color.set(color);
          } else if ('color' in standardMaterial && standardMaterial.color) {
            standardMaterial.color.set('#ffffff');
          }
        }

        if (applyDynamicFinishSurface && 'roughness' in standardMaterial) {
          standardMaterial.roughness = surface.roughness;
        }

        if (applyDynamicFinishSurface && 'metalness' in standardMaterial) {
          standardMaterial.metalness = surface.metalness;
        }

        standardMaterial.needsUpdate = true;
      };

      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(applyMaterial);
      } else {
        applyMaterial(mesh.material);
      }
    });
  }, [
    applyColorTint,
    applyDynamicFinishSurface,
    color,
    finish,
    materialVariantUrl,
    modelScene,
    overrideColorMap,
    overrideColorMapKey,
    variantMaterialsByName,
  ]);

  useLayoutEffect(() => {
    if (!groupRef.current || !rotationYRef) return;
    groupRef.current.rotation.y = rotationYRef.current;
  }, [modelScene, rotationYRef]);

  useFrame((_, delta) => {
    if (!autoRotate) return;
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.35;
    if (rotationYRef) {
      rotationYRef.current = groupRef.current.rotation.y;
    }
  });

  return <primitive ref={groupRef} object={modelScene} />;
}

/** Handle exposed by Konfiguratorius3D via React ref. */
export interface Konfiguratorius3DHandle {
  /** Capture the current 3D canvas as a PNG data-URL. */
  takeScreenshot: () => string | null;
}

export interface Konfiguratorius3DProps {
  productId: string;
  availableColors: ProductColorVariant[];
  availableFinishes: ProductProfileVariant[];
  modelUrl?: string;
  modelSlug?: string;
  mode?: 'full' | 'viewport';
  selectedColorId?: string;
  selectedFinishId?: string;
  onColorChange?: (color: ProductColorVariant) => void;
  onFinishChange?: (finish: ProductProfileVariant) => void;
  className?: string;
  isLoading?: boolean;
  canvasClassName?: string;
  basePrice?: number;
  visualDimensionsMm?: {
    widthMm?: number;
    lengthMm?: number;
    thicknessMm?: number;
  };
}

/**
 * Internal helper rendered inside <Canvas> to expose the WebGL renderer
 * so the parent can call `renderer.domElement.toDataURL()`.
 */
function RendererBridge({ onRenderer }: { onRenderer: (gl: THREE.WebGLRenderer) => void }) {
  const { gl } = useThree();
  useEffect(() => { onRenderer(gl); }, [gl, onRenderer]);
  return null;
}

const Konfiguratorius3D = forwardRef<Konfiguratorius3DHandle, Konfiguratorius3DProps>(function Konfiguratorius3D({
  productId,
  availableColors, 
  availableFinishes,
  modelUrl = DEFAULT_CONFIGURATOR_GLB_PATH,
  modelSlug,
  mode = 'full',
  selectedColorId,
  selectedFinishId,
  onColorChange,
  onFinishChange,
  className = '',
  isLoading = false,
  canvasClassName,
  basePrice,
  visualDimensionsMm,
}, ref) {
  const t = useTranslations();
  const locale = useLocale();
  const currentLocale = locale === 'lt' ? 'lt' : 'en';
  const [selectedColor, setSelectedColor] = useState<ProductColorVariant | null>(
    availableColors[0] || null
  );
  const [selectedFinish, setSelectedFinish] = useState<ProductProfileVariant | null>(
    availableFinishes[0] || null
  );
  const [modelColor, setModelColor] = useState('#ffffff');
  const sharedRotationYRef = useRef(0);
  const [resolvedModelUrl, setResolvedModelUrl] = useState<string | null>(null);
  const [isModelResolved, setIsModelResolved] = useState(false);
  const { active: isGltfLoading } = useProgress();
  const textureVariantKey = useMemo(
    () => [
      selectedColor?.id ?? 'default-color',
      selectedColor?.image ?? 'no-image',
      selectedColor?.name ?? 'no-name',
      selectedFinish?.id ?? 'default-finish',
      selectedFinish?.code ?? 'no-code',
    ].join('|'),
    [selectedColor?.id, selectedColor?.image, selectedColor?.name, selectedFinish?.id, selectedFinish?.code]
  );

  // -- Screenshot support -------------------------------------------------
  const glRef = useRef<THREE.WebGLRenderer | null>(null);
  const handleRendererReady = useCallback((gl: THREE.WebGLRenderer) => {
    glRef.current = gl;

  // Make wood textures look more natural/bright.
  // Important: requires a full dev-server restart to update CSP headers
  // if you recently changed them.
  gl.outputColorSpace = THREE.SRGBColorSpace;
  gl.toneMapping = THREE.ACESFilmicToneMapping;
  gl.toneMappingExposure = 1.55;
  if ('physicallyCorrectLights' in gl) {
    (gl as THREE.WebGLRenderer & { physicallyCorrectLights?: boolean }).physicallyCorrectLights = true;
  }
  }, []);

  useImperativeHandle(ref, () => ({
    takeScreenshot(): string | null {
      const gl = glRef.current;
      if (!gl) return null;
      try {
        return gl.domElement.toDataURL('image/png');
      } catch {
        return null;
      }
    },
  }), []);

  const [inputMode, setInputMode] = useState<'boards' | 'area'>('boards');
  const [quantityBoards, setQuantityBoards] = useState<number>(1);
  const [targetAreaM2, setTargetAreaM2] = useState<number>(1);

  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quote, setQuote] = useState<null | {
    unitPricePerM2: number;
    areaM2: number;
    totalAreaM2: number;
    unitPricePerBoard: number;
    quantityBoards: number;
    lineTotal: number;
    inputMode: 'boards' | 'area';
    roundingInfo?: {
      requestedAreaM2: number;
      actualAreaM2: number;
      deltaAreaM2: number;
      rounding: 'ceil' | 'round' | 'floor';
    };
  }>(null);

  // -- PDF download ---------------------------------------------------------
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleDownloadPdf = useCallback(async () => {
    setPdfLoading(true);
    try {
      // Capture 3D screenshot
      const gl = glRef.current;
      let screenshotDataUrl: string | null = null;
      if (gl) {
        try { screenshotDataUrl = gl.domElement.toDataURL('image/png'); } catch { /* ignore */ }
      }

      const pdfData: ConfigurationPDFData = {
        productName: productId,
        colorName: selectedColor
          ? getLocalizedColorName(selectedColor, currentLocale)
          : '',
        colorHex: selectedColor?.hex,
        profileName: selectedFinish
          ? getLocalizedProfileName(selectedFinish, currentLocale)
          : '',
        widthMm: selectedFinish?.dimensions?.width,
        lengthMm: selectedFinish?.dimensions?.length,
        thicknessMm: selectedFinish?.dimensions?.thickness,
        pricePerM2: quote?.unitPricePerM2,
        pricePerBoard: quote?.unitPricePerBoard,
        quantityBoards: quote?.quantityBoards,
        totalAreaM2: quote?.totalAreaM2,
        lineTotal: quote?.lineTotal,
        screenshotDataUrl,
        configUrl: typeof window !== 'undefined' ? window.location.href : undefined,
      };

      await downloadConfigurationPDF(pdfData, currentLocale);

      trackEvent('configurator_download_pdf', {
        product_id: productId,
        color: selectedColor?.name,
        profile: selectedFinish?.name,
      });
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setPdfLoading(false);
    }
  }, [productId, selectedColor, selectedFinish, quote, currentLocale]);

  const cartItems = useCartStore((state) => state.items);

  const cartTotalAreaM2 = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const a = item.pricingSnapshot?.totalAreaM2;
      if (typeof a === 'number' && Number.isFinite(a) && a > 0) return sum + a;
      return sum;
    }, 0);
  }, [cartItems]);

  const currency = useMemo(
    () =>
      new Intl.NumberFormat(locale === 'lt' ? 'lt-LT' : 'en-US', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2,
      }),
    [locale]
  );

  const numberM2 = useMemo(
    () =>
      new Intl.NumberFormat(locale === 'lt' ? 'lt-LT' : 'en-US', {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      }),
    [locale]
  );

  const basePriceLabel = useMemo(() => {
    const key = 'configurator.basePriceLabel';
    if (typeof t.has === 'function' && t.has(key)) return t(key);
    return currentLocale === 'lt' ? 'Bazinė kaina' : 'Base price';
  }, [t, currentLocale]);

  useEffect(() => {
    if (!selectedColorId) return;
    const next = availableColors.find((c) => c.id === selectedColorId) ?? null;
    setSelectedColor(next);
  }, [availableColors, selectedColorId, productId]);

  useEffect(() => {
    if (!selectedFinishId) return;
    const next = availableFinishes.find((f) => f.id === selectedFinishId) ?? null;
    setSelectedFinish(next);
  }, [availableFinishes, selectedFinishId, productId]);

  useEffect(() => {
    setModelColor(resolveColorHex(selectedColor));
  }, [selectedColor]);

  const resolvedVariantMaterialUrl = useMemo(() => {
    if (!selectedColor) return null;
    const colorSlug = resolveColorSlug(selectedColor);
    if (!colorSlug) return null;

    return resolveColorVariantModelUrl({
      modelSlug,
      modelUrl,
      colorSlug,
    });
  }, [modelSlug, modelUrl, selectedColor]);

  // Prefer loading the full per-color GLB when available. This is the most
  // reliable path (materials + slot assignments + textures are authored in the
  // exported file) and avoids “nothing changes” issues when material names
  // differ across exports.
  const effectiveModelUrl = useMemo(() => {
    return resolvedVariantMaterialUrl ?? resolvedModelUrl;
  }, [resolvedVariantMaterialUrl, resolvedModelUrl]);

  // Only use a separate material-variant source when we're rendering a
  // different base model. When `effectiveModelUrl` is already the variant, we
  // don't need to load a second GLB.
  const effectiveMaterialVariantUrl = useMemo(() => {
    if (!resolvedVariantMaterialUrl) return null;
    if (effectiveModelUrl === resolvedVariantMaterialUrl) return null;
    return resolvedVariantMaterialUrl;
  }, [effectiveModelUrl, resolvedVariantMaterialUrl]);

  const isPerColorVariantModel = useMemo(() => {
    return !!resolvedVariantMaterialUrl;
  }, [resolvedVariantMaterialUrl]);

  useEffect(() => {
    availableColors.forEach((colorOption) => {
      const colorSlug = resolveColorSlug(colorOption);
      if (!colorSlug) return;

      const variantUrl = resolveColorVariantModelUrl({
        modelSlug,
        modelUrl,
        colorSlug,
      });

      if (!variantUrl) return;
      useGLTF.preload(variantUrl);
    });
  }, [availableColors, modelSlug, modelUrl]);

  const isFinishTextureSwapEnabled = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_ENABLE_3D_FINISH_TEXTURE_SWAP;
    if (!raw) return false;
    const value = raw.trim().toLowerCase();
    return value === 'true' || value === '1';
  }, []);

  const finishTextureUrl = useMemo(() => {
    if (!isFinishTextureSwapEnabled) return null;
    if (!selectedColor) return null;
    if (!resolvedModelUrl && !modelUrl) return null;

    const wood = resolveFinishTextureWood(resolvedModelUrl ?? modelUrl);
    if (!wood) return null;

    const slug = resolveColorSlug(selectedColor);
    if (!slug) return null;

    return getFinishTextureUrl(wood, slug);
  }, [isFinishTextureSwapEnabled, modelUrl, resolvedModelUrl, selectedColor]);

  const finishTexture = useFinishTexture(finishTextureUrl);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    // eslint-disable-next-line no-console
    console.log('[Konfiguratorius3D] selection', {
      modelSlug,
      modelUrl,
      resolvedModelUrl,
      effectiveModelUrl,
      selectedColorId: selectedColor?.id ?? null,
      selectedColorName: selectedColor?.name ?? null,
      colorSlug: selectedColor ? resolveColorSlug(selectedColor) : null,
      resolvedVariantMaterialUrl,
      effectiveMaterialVariantUrl,
    });
  }, [modelSlug, modelUrl, resolvedModelUrl, effectiveModelUrl, resolvedVariantMaterialUrl, effectiveMaterialVariantUrl, selectedColor?.id, selectedColor?.name]);

  useEffect(() => {
    // We used to issue a HEAD request to check if the model exists before
    // passing it to `useGLTF()`. In some environments (dev proxies / server
    // configs), HEAD can be blocked or behave inconsistently for large static
    // assets with query strings, causing the viewer to fall back to the
    // placeholder model and making color switching appear “broken”.
    //
    // Instead, always attempt to load the model URL; failures are handled by
    // `GLBErrorBoundary`, which keeps UX stable and logs the error.
    if (!modelUrl) {
      setResolvedModelUrl(null);
      setIsModelResolved(true);
      return;
    }

    setResolvedModelUrl(modelUrl);
    setIsModelResolved(true);
  }, [modelUrl]);

  useEffect(() => {
    if (!productId) return;
    trackEvent('configurator_view', {
      product_id: productId,
      mode,
    });
  }, [productId, mode]);

  // Realtime price quote for current configuration.
  useEffect(() => {
    if (mode === 'viewport') {
      setQuote(null);
      setQuoteError(null);
      setQuoteLoading(false);
      return;
    }

    const widthMm = selectedFinish?.dimensions?.width;
    const lengthMm = selectedFinish?.dimensions?.length;

    if (!productId) return;
    if (typeof widthMm !== 'number' || typeof lengthMm !== 'number') {
      setQuote(null);
      setQuoteError(null);
      return;
    }

    const controller = new AbortController();

    const run = async () => {
      setQuoteLoading(true);
      setQuoteError(null);
      try {
        type QuoteRequestBody = {
          productId: string;
          profileVariantId?: string;
          colorVariantId?: string;
          widthMm: number;
          lengthMm: number;
          inputMode: 'boards' | 'area';
          quantityBoards?: number;
          targetAreaM2?: number;
          rounding?: 'ceil' | 'round' | 'floor';
          cartTotalAreaM2?: number;
        };

        const unitAreaM2 =
          typeof widthMm === 'number' && typeof lengthMm === 'number'
            ? (widthMm / 1000) * (lengthMm / 1000)
            : 0;

        const currentLineAreaM2 =
          inputMode === 'boards'
            ? (typeof quantityBoards === 'number' ? quantityBoards : 0) * unitAreaM2
            : typeof targetAreaM2 === 'number' && unitAreaM2 > 0
              ? Math.ceil(targetAreaM2 / unitAreaM2) * unitAreaM2
              : 0;

        const body: QuoteRequestBody =
          inputMode === 'boards'
            ? {
                productId,
                profileVariantId: selectedFinish?.id,
                colorVariantId: selectedColor?.id,
                widthMm,
                lengthMm,
                inputMode,
                quantityBoards,
                cartTotalAreaM2: cartTotalAreaM2 + currentLineAreaM2,
              }
            : {
                productId,
                profileVariantId: selectedFinish?.id,
                colorVariantId: selectedColor?.id,
                widthMm,
                lengthMm,
                inputMode,
                targetAreaM2,
                rounding: 'ceil',
                cartTotalAreaM2: cartTotalAreaM2 + currentLineAreaM2,
              };

        const res = await fetch('/api/pricing/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          setQuote(null);
          try {
            const data = await res.json();
            setQuoteError(typeof data?.error === 'string' ? data.error : t('configurator.priceNotAvailable'));
          } catch {
            setQuoteError(t('configurator.priceNotAvailable'));
          }
          return;
        }

        const data: any = await res.json();

        const next = {
          unitPricePerM2: Number(data?.unitPricePerM2),
          areaM2: Number(data?.areaM2),
          totalAreaM2: Number(data?.totalAreaM2),
          unitPricePerBoard: Number(data?.unitPricePerBoard),
          quantityBoards: Number(data?.quantityBoards),
          lineTotal: Number(data?.lineTotal),
          inputMode: data?.inputMode === 'area' ? 'area' : 'boards',
          roundingInfo: data?.roundingInfo as
            | {
                requestedAreaM2: number;
                actualAreaM2: number;
                deltaAreaM2: number;
                rounding: 'ceil' | 'round' | 'floor';
              }
            | undefined,
        } as const;

        if (!Number.isFinite(next.unitPricePerM2) || next.unitPricePerM2 <= 0) {
          setQuote(null);
          setQuoteError(t('configurator.priceNotAvailable'));
          return;
        }

        setQuote(next);
        setQuoteError(null);

        // Keep UI values in sync with server-resolved quantity.
        if (inputMode === 'boards') {
          if (Number.isFinite(next.quantityBoards) && next.quantityBoards > 0 && next.quantityBoards !== quantityBoards) {
            setQuantityBoards(next.quantityBoards);
          }
        }
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setQuote(null);
        setQuoteError(t('configurator.priceNotAvailable'));
      } finally {
        setQuoteLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [mode, productId, selectedFinish?.id, selectedFinish?.dimensions?.width, selectedFinish?.dimensions?.length, selectedColor?.id, inputMode, quantityBoards, targetAreaM2, cartTotalAreaM2, t]);

  const handleColorSelect = (color: ProductColorVariant) => {
    setSelectedColor(color);
    onColorChange?.(color);

    trackEvent('configurator_select_color', {
      product_id: productId,
      color_id: color.id,
      color_name: color.name,
      price_modifier: color.priceModifier ?? 0,
    });
  };

  const handleFinishSelect = (finish: ProductProfileVariant) => {
    setSelectedFinish(finish);
    onFinishChange?.(finish);

    trackEvent('configurator_select_finish', {
      product_id: productId,
      finish_id: finish.id,
      finish_name: finish.name,
      price_modifier: finish.priceModifier ?? 0,
    });
  };

  return (
    <div className={mode === 'viewport' ? `w-full h-full ${className}` : `w-full flex flex-col gap-6 ${className}`}>
      {/* 3D Canvas */}
      <div
        className={`relative w-full border border-[#BBBBBB] rounded-[24px] overflow-hidden bg-[#EAEAEA] ${
          canvasClassName ?? (mode === 'viewport' ? 'h-full' : 'h-[400px] md:h-[500px]')
        }`}
      >
        {(isLoading || !isModelResolved || (effectiveModelUrl && isGltfLoading)) && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#EAEAEA] z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-[#BBBBBB] border-t-[#161616] rounded-full animate-spin" />
              <p className="font-['Outfit'] text-sm text-[#7C7C7C]">{t('configurator.loadingModel')}</p>
            </div>
          </div>
        )}
        
        <Canvas camera={{ position: [3, 2, 3], fov: 50 }} gl={{ preserveDrawingBuffer: true }}>
          <RendererBridge onRenderer={handleRendererReady} />
            <ambientLight intensity={1.05} />
            <hemisphereLight args={['#FFFFFF', '#DCDCDC', 0.7]} />
      {/* Key */}
      <directionalLight position={[5, 5, 5]} intensity={1.45} />
      {/* Fill */}
      <directionalLight position={[-5, 2, 4]} intensity={0.95} />
      {/* Front lift for dark finishes */}
      <directionalLight position={[0, 1.8, 6]} intensity={0.85} />
      {/* Rim/back */}
      <directionalLight position={[0, 6, -6]} intensity={0.5} />
          <Suspense
            fallback={
				  resolvedModelUrl
					? null
					: (
						<ProfileModel
						  color={modelColor}
						  finish={selectedFinish}
						  variantKey={textureVariantKey}
						  autoRotate={true}
						  rotationYRef={sharedRotationYRef}
						  visualDimensionsMm={visualDimensionsMm}
						/>
					  )
				}
          >
            {effectiveModelUrl ? (
              <GLBErrorBoundary
                modelUrl={effectiveModelUrl}
                fallback={<ProfileModel color={modelColor} finish={selectedFinish} variantKey={textureVariantKey} autoRotate={true} rotationYRef={sharedRotationYRef} visualDimensionsMm={visualDimensionsMm} />}
              >
          {!isGltfLoading ? (
            <GLBProfileModel
              modelUrl={effectiveModelUrl}
              materialVariantUrl={effectiveMaterialVariantUrl}
              color={modelColor}
              finish={selectedFinish}
              overrideColorMap={finishTexture}
              overrideColorMapKey={finishTextureUrl}
              applyColorTint={!isPerColorVariantModel}
              applyDynamicFinishSurface={!isPerColorVariantModel}
              autoRotate={true}
              rotationYRef={sharedRotationYRef}
              visualDimensionsMm={visualDimensionsMm}
            />
          ) : null}
              </GLBErrorBoundary>
            ) : (
              <ProfileModel color={modelColor} finish={selectedFinish} variantKey={textureVariantKey} autoRotate={true} rotationYRef={sharedRotationYRef} visualDimensionsMm={visualDimensionsMm} />
            )}
          </Suspense>
          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            enableRotate={true}
            minDistance={2}
            maxDistance={10}
          />
        </Canvas>

        {mode === 'full' && (
          <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-2 rounded-lg text-xs font-['Outfit'] text-[#535353]">
            {t('configurator.controlsHint')}
          </div>
        )}
      </div>

      {mode === 'full' && (
        <>
          {/* Color Selector */}
          {availableColors.length > 0 && (
            <div className="flex flex-col gap-3">
              <label className="font-['DM_Sans'] text-sm font-medium text-[#161616]">
                {t('configurator.colorLabel')}
                {selectedColor && (
                  <span className="ml-2 font-['Outfit'] font-normal text-[#7C7C7C]">
                    ({getLocalizedColorName(selectedColor, currentLocale)})
                  </span>
                )}
              </label>
              <div className="flex flex-wrap gap-3">
                {availableColors.map((color) => {
                  const colorLabel = getLocalizedColorName(color, currentLocale);
                  const priceModifier = color.priceModifier ?? 0;

                  return (
                    <button
                      key={color.id}
                      onClick={() => handleColorSelect(color)}
                      className={`relative group ${
                        selectedColor?.id === color.id ? 'ring-2 ring-[#161616] ring-offset-2' : ''
                      }`}
                      aria-label={t('configurator.selectColorAria', { name: colorLabel })}
                      title={colorLabel}
                    >
                    {color.image ? (
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border-2 border-[#EAEAEA] group-hover:border-[#BBBBBB] transition-colors">
                        <img 
                          src={color.image} 
                          alt={colorLabel}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        style={{ backgroundColor: color.hex }}
                        className="w-12 h-12 rounded-lg border-2 border-[#EAEAEA] group-hover:border-[#BBBBBB] transition-colors"
                      />
                    )}
                    
                    {priceModifier !== 0 && (
                      <span className="absolute -top-2 -right-2 bg-[#161616] text-white text-[10px] px-1.5 py-0.5 rounded-full font-['Outfit']">
                        {priceModifier > 0 ? '+' : ''}€{priceModifier.toFixed(0)}
                      </span>
                    )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Finish Selector */}
          {availableFinishes.length > 0 && (
            <div className="flex flex-col gap-3">
              <label className="font-['DM_Sans'] text-sm font-medium text-[#161616]">
                {t('configurator.profileLabel')}
              </label>
              <div className="grid grid-cols-1 gap-2">
                {availableFinishes.map((finish) => {
                  const finishLabel = getLocalizedProfileName(finish, currentLocale);
                  const priceModifier = finish.priceModifier ?? 0;

                  return (
                    <label
                      key={finish.id}
                      className={`relative flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedFinish?.id === finish.id
                          ? 'border-[#161616] bg-[#F9F9F9]'
                          : 'border-[#EAEAEA] hover:border-[#BBBBBB]'
                      }`}
                    >
                    <input
                      type="radio"
                      name="finish"
                      value={finish.id}
                      checked={selectedFinish?.id === finish.id}
                      onChange={() => handleFinishSelect(finish)}
                      className="mt-0.5 w-4 h-4 text-[#161616] focus:ring-[#161616]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-['DM_Sans'] font-medium text-[#161616]">
                          {finishLabel}
                        </span>
                        {priceModifier !== 0 && (
                          <span className="font-['Outfit'] text-sm text-[#535353]">
                            {priceModifier > 0 ? '+' : ''}€{priceModifier.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {finish.description && (
                        <p className="mt-1 font-['Outfit'] text-xs text-[#7C7C7C]">
                          {finish.description}
                        </p>
                      )}
                    </div>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Info Note */}
          <div className="p-4 bg-[#F9F9F9] rounded-lg border border-[#EAEAEA]">
            <p className="font-['Outfit'] text-xs text-[#535353]">
              <strong>{t('configurator.noteTitle')}</strong> {t('configurator.noteBody')}
            </p>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-white rounded-lg border border-[#EAEAEA]">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-['DM_Sans'] text-sm font-medium text-[#161616]">{t('configurator.pricingTitle')}</h3>

              <div className="flex items-center gap-2">
                <span className="font-['Outfit'] text-xs text-[#7C7C7C]">{t('configurator.inputModeLabel')}</span>
                <div className="flex rounded-[100px] border border-[#BBBBBB] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode('boards');
                      if (quote?.quantityBoards) setQuantityBoards(quote.quantityBoards);

                      trackEvent('configurator_input_mode_change', {
                        product_id: productId,
                        input_mode: 'boards',
                      });
                    }}
                    className={`h-[28px] px-3 font-['Outfit'] text-[12px] ${
                      inputMode === 'boards' ? 'bg-[#161616] text-white' : 'bg-white text-[#161616]'
                    }`}
                  >
                    {t('configurator.inputModeBoards')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode('area');
                      if (quote?.totalAreaM2) setTargetAreaM2(Number(quote.totalAreaM2.toFixed(2)));

                      trackEvent('configurator_input_mode_change', {
                        product_id: productId,
                        input_mode: 'area',
                      });
                    }}
                    className={`h-[28px] px-3 font-['Outfit'] text-[12px] ${
                      inputMode === 'area' ? 'bg-[#161616] text-white' : 'bg-white text-[#161616]'
                    }`}
                  >
                    {t('configurator.inputModeArea')}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-3">
              {typeof basePrice === 'number' && Number.isFinite(basePrice) && basePrice > 0 && (
                <div className="mb-3 flex items-center justify-between rounded-md bg-[#F9F9F9] px-3 py-2">
                  <span className="font-['Outfit'] text-xs text-[#535353]">{basePriceLabel}</span>
                  <span className="font-['Outfit'] text-xs text-[#161616]">{currency.format(basePrice)}</span>
                </div>
              )}
              {inputMode === 'boards' ? (
                <label className="block">
                  <span className="block font-['Outfit'] text-xs text-[#535353] mb-1">{t('configurator.quantityBoardsLabel')}</span>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={quantityBoards}
                    onChange={(e) => setQuantityBoards(Math.max(1, Math.round(Number(e.target.value) || 1)))}
                    className="w-full h-[40px] px-[12px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] text-[14px] text-[#161616]"
                  />
                </label>
              ) : (
                <label className="block">
                  <span className="block font-['Outfit'] text-xs text-[#535353] mb-1">{t('configurator.targetAreaLabel')}</span>
                  <input
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={targetAreaM2}
                    onChange={(e) => setTargetAreaM2(Math.max(0.01, Number(e.target.value) || 0.01))}
                    className="w-full h-[40px] px-[12px] rounded-[8px] border border-[#BBBBBB] font-['Outfit'] text-[14px] text-[#161616]"
                  />
                </label>
              )}
            </div>

            {quoteLoading && (
              <p className="mt-3 font-['Outfit'] text-xs text-[#7C7C7C]">{t('configurator.calculatingPrice')}</p>
            )}

            {quoteError && !quoteLoading && (
              <p className="mt-3 font-['Outfit'] text-xs text-[#7C7C7C]">{quoteError}</p>
            )}

            {quote && !quoteLoading && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quote.roundingInfo && quote.roundingInfo.deltaAreaM2 > 0.000001 && (
                  <div className="sm:col-span-2">
                    <p className="font-['Outfit'] text-xs text-[#7C7C7C]">
                      ~{' '}
                      {t('configurator.roundingNotice', {
                        boards: String(quote.quantityBoards),
                        actualArea: numberM2.format(quote.roundingInfo.actualAreaM2),
                      })}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between rounded-md bg-[#F9F9F9] px-3 py-2">
                  <span className="font-['Outfit'] text-xs text-[#535353]">{t('configurator.unitPricePerM2Label')}</span>
                  <span className="font-['Outfit'] text-xs text-[#161616]">{currency.format(quote.unitPricePerM2)}</span>
                </div>

                <div className="flex items-center justify-between rounded-md bg-[#F9F9F9] px-3 py-2">
                  <span className="font-['Outfit'] text-xs text-[#535353]">{t('configurator.unitPricePerBoardLabel')}</span>
                  <span className="font-['Outfit'] text-xs text-[#161616]">{currency.format(quote.unitPricePerBoard)}</span>
                </div>

                <div className="flex items-center justify-between rounded-md bg-[#F9F9F9] px-3 py-2">
                  <span className="font-['Outfit'] text-xs text-[#535353]">{t('configurator.totalAreaLabel')}</span>
                  <span className="font-['Outfit'] text-xs text-[#161616]">{numberM2.format(quote.totalAreaM2)} m²</span>
                </div>

                <div className="flex items-center justify-between rounded-md bg-[#F9F9F9] px-3 py-2">
                  <span className="font-['Outfit'] text-xs text-[#535353]">{t('configurator.lineTotalLabel')}</span>
                  <span className="font-['Outfit'] text-xs text-[#161616]">{currency.format(quote.lineTotal)}</span>
                </div>
              </div>
            )}

            {/* PDF download button */}
            {selectedColor && selectedFinish && (
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={pdfLoading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-[100px] border border-[#BBBBBB] bg-white px-6 py-3 font-['DM_Sans'] text-sm font-medium text-[#161616] transition-colors hover:bg-[#F9F9F9] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pdfLoading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t('configurator.downloadingPdf')}
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {t('configurator.downloadPdf')}
                  </>
                )}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
});

export default Konfiguratorius3D;
