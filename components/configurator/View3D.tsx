'use client';

import { useEffect, useRef } from 'react';
import type { ConfiguratorConfig } from './types';

const COLOR_HEX: Record<string, string> = {
  natural: '#BBBBBB',
  latte: '#D6C3A6',
  graphite: '#535353',
  'dark-brown': '#5A3B2E',
  'carbon-light': '#7C7C7C',
  carbon: '#2A2A2A',
  black: '#161616',
  silver: '#C7C7C7',
};

export interface View3DProps {
  config: ConfiguratorConfig;
}

export default function View3D({ config }: View3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = COLOR_HEX[config.color] ?? '#444444';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.fillRect(16, 16, Math.min(420, w - 32), 140);

    ctx.fillStyle = '#161616';
    ctx.font = '600 14px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.fillText('3D perziura (MVP)', 28, 44);

    ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    const lines = [
      `Mediena: ${config.wood}`,
      `Paskirtis: ${config.usage}`,
      `Spalva: ${config.color}`,
      `Profilis: ${config.profile}`,
    ];
    lines.forEach((line, i) => ctx.fillText(line, 28, 70 + i * 20));
  }, [config]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      data-testid="configurator-3d-canvas"
      aria-label="3D produkto perziura"
    />
  );
}
