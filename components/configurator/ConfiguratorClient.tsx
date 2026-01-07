'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import Image2D from './Image2D';
import OptionGroup from './OptionGroup';
import { COLOR_OPTIONS, PROFILE_OPTIONS, USAGE_OPTIONS, WOOD_OPTIONS, type ColorType, type ProfileType, type UsageType, type WoodType } from './types';
import { useConfiguratorState } from './useConfiguratorState';

const LazyView3D = dynamic(() => import('./View3D'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[#EAEAEA]">
      <p className="font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#535353]">Kraunama 3D perziura...</p>
    </div>
  ),
});

export interface ConfiguratorClientProps {
  productSlug: string;
  presetSlug?: string | null;
}

export default function ConfiguratorClient({ productSlug, presetSlug }: ConfiguratorClientProps) {
  const { config, isHydrated, offerStatus, actions } = useConfiguratorState({ productSlug, presetSlug });

  const woodOptions = useMemo(
    () => WOOD_OPTIONS.map((v) => ({ value: v, label: v })),
    []
  );
  const usageOptions = useMemo(
    () => USAGE_OPTIONS.map((v) => ({ value: v, label: v })),
    []
  );
  const colorOptions = useMemo(
    () => COLOR_OPTIONS.map((v) => ({ value: v, label: v })),
    []
  );
  const profileOptions = useMemo(
    () => PROFILE_OPTIONS.map((v) => ({ value: v, label: v })),
    []
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_520px] gap-[16px] lg:gap-[24px]">
      {/* Media column */}
      <div className="relative w-full h-[420px] lg:h-[729px] rounded-[8px] overflow-hidden bg-[#EAEAEA]">
        <button
          type="button"
          onClick={() => actions.setView(config.view === '2d' ? '3d' : '2d')}
          className="absolute z-10 top-[16px] right-[16px] h-[32px] px-[12px] rounded-[100px] border border-[#BBBBBB] bg-white/90 font-['Outfit'] text-[12px] tracking-[0.6px] uppercase text-[#161616]"
          aria-label={config.view === '2d' ? 'Ijungti 3D perziura' : 'Ijungti foto perziura'}
          data-testid="configurator-toggle-view"
        >
          {config.view === '2d' ? '3D' : 'Foto'}
        </button>

        {/* Default SEO 2D view (indexable). */}
        {config.view === '2d' ? (
          <Image2D alt="Shou Sugi Ban medienos lentos (2D vaizdas)" />
        ) : (
          <div className="absolute inset-0" data-testid="configurator-3d-container">
            <LazyView3D config={config} />
          </div>
        )}
      </div>

      {/* Controls column */}
      <div className="flex flex-col gap-[16px] lg:gap-[20px]">
        {!isHydrated ? (
          <div className="border border-[#BBBBBB] rounded-[8px] bg-white p-[16px]">
            <p className="font-['Outfit'] text-[12px] text-[#535353]">Kraunama konfiguracija...</p>
          </div>
        ) : (
          <>
            <OptionGroup<WoodType>
              label="Mediena"
              ariaLabel="wood"
              value={config.wood}
              options={woodOptions}
              onChange={actions.setWood}
            />

            <OptionGroup<UsageType>
              label="Paskirtis"
              ariaLabel="usage"
              value={config.usage}
              options={usageOptions}
              onChange={actions.setUsage}
            />

            <OptionGroup<ColorType>
              label="Spalva"
              ariaLabel="color"
              value={config.color}
              options={colorOptions}
              onChange={actions.setColor}
            />

            <OptionGroup<ProfileType>
              label="Profilis"
              ariaLabel="profile"
              value={config.profile}
              options={profileOptions}
              onChange={actions.setProfile}
            />

            <div className="border border-[#BBBBBB] rounded-[8px] bg-white p-[12px]">
              <p className="font-['Outfit'] text-[10px] tracking-[0.6px] uppercase text-[#7C7C7C]">Konfiguracija</p>
              <pre className="mt-[8px] font-mono text-[11px] text-[#161616] whitespace-pre-wrap" data-testid="configurator-summary">
                {JSON.stringify(
                  {
                    config_id: config.configId,
                    wood: config.wood,
                    usage: config.usage,
                    color: config.color,
                    profile: config.profile,
                    preset: config.presetSlug ?? null,
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <button
              type="button"
              onClick={() => actions.submitOffer()}
              disabled={offerStatus === 'submitting'}
              className="h-[48px] w-full rounded-[100px] bg-[#161616] text-white font-['Outfit'] text-[12px] tracking-[0.6px] uppercase disabled:opacity-60"
              aria-label="Gauti pasiulyma"
              data-testid="configurator-offer-button"
            >
              {offerStatus === 'submitting' ? 'Siunciama...' : 'Gauti pasiulyma'}
            </button>

            {offerStatus === 'success' && (
              <div className="border border-[#BBBBBB] rounded-[8px] bg-white p-[12px]" data-testid="configurator-offer-success">
                <p className="font-['Outfit'] text-[12px] text-[#161616]">Pasiulymas uzregistruotas.</p>
              </div>
            )}

            {offerStatus === 'error' && (
              <div className="border border-[#BBBBBB] rounded-[8px] bg-white p-[12px]">
                <p className="font-['Outfit'] text-[12px] text-[#161616]">Nepavyko issiusti. Bandykite dar karta.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
