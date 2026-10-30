/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { EyeOff, AlertTriangle } from 'lucide-react';
import { Role } from '../types/game';
import { STRINGS } from '../strings/ru';
import { triggerAttentionSignal } from '../utils/haptics';

interface RoleCardProps {
  role: Role;
  ttlSeconds: number;
  onDismiss: () => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({ role, ttlSeconds, onDismiss }) => {
  const [remaining, setRemaining] = useState(ttlSeconds);
  const [pulseSignal, setPulseSignal] = useState(true);

  useEffect(() => {
    // Initial attention signal
    triggerAttentionSignal();
    const pulseTimer = setTimeout(() => setPulseSignal(false), 1200);

    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(pulseTimer);
      clearInterval(interval);
    };
  }, [ttlSeconds, onDismiss]);

  const roleName = STRINGS.roles.names[role];

  // Specific role image art mapping (1930s American Comics style assets)
  const getRoleCardImage = (r: Role): { src: string; customBanner?: string } => {
    switch (r) {
      case 'citizen':
        return { src: '/assets/aistudio/__________37c1a98b.png' };
      case 'gangster':
        return { src: '/assets/aistudio/_________b8075905.png' };
      case 'boss':
        return {
          src: '/assets/aistudio/_________b8075905.png',
          customBanner: 'БОСС ГАНГСТЕРОВ',
        };
      case 'sheriff':
        return { src: '/assets/aistudio/______2722ae3f.png' };
      case 'watchman':
        return {
          src: '/assets/aistudio/______2722ae3f.png',
          customBanner: 'НОЧНОЙ СТРАЖ',
        };
      case 'press':
        return {
          src: '/assets/aistudio/______2722ae3f.png',
          customBanner: 'ПРЕССА',
        };
      case 'judge':
        return {
          src: '/assets/aistudio/______2722ae3f.png',
          customBanner: 'СУДЬЯ',
        };
      case 'lawyer':
        return {
          src: '/assets/aistudio/______2722ae3f.png',
          customBanner: 'АДВОКАТ',
        };
      case 'avenger':
        return {
          src: '/assets/aistudio/______2722ae3f.png',
          customBanner: 'МСТИТЕЛЬ',
        };
      default:
        return { src: '/assets/aistudio/__________37c1a98b.png' };
    }
  };

  const cardArt = getRoleCardImage(role);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
      {/* Visual attention pulse overlay */}
      {pulseSignal && (
        <div className="absolute inset-0 bg-amber-500/20 animate-ping pointer-events-none" />
      )}

      <div className="relative w-full max-w-sm rounded-2xl bg-[#14110d] comic-border-lg p-3 sm:p-4 text-center shadow-2xl flex flex-col items-center justify-between min-h-[520px] max-h-[96vh] my-auto">
        {/* Top Comic Notice Header */}
        <div className="w-full flex items-center justify-between border-b-2 border-black/80 pb-2 px-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2a2218] border border-[#4a3a28] text-[11px] font-comic tracking-wider text-amber-300">
            <EyeOff size={13} />
            <span>{STRINGS.roleReveal.hideNotice}</span>
          </div>

          <div className="bg-[#b91c1c] text-[#fef3c7] font-comic text-xs px-2 py-0.5 rounded border border-black shadow-[2px_2px_0px_#000]">
            СЕКРЕТНО
          </div>
        </div>

        {/* 1930s Comic Role Card Art Frame */}
        <div className="w-full flex-1 flex flex-col items-center justify-center py-2">
          <div className="relative w-full max-w-[270px] aspect-[9/16] rounded-xl overflow-hidden comic-border-lg bg-black shadow-2xl group">
            <img
              src={cardArt.src}
              alt={roleName}
              className="w-full h-full object-cover"
            />

            {/* Custom Banner overlay if it's a special role subtype */}
            {cardArt.customBanner && (
              <div className="absolute bottom-[34px] left-6 right-6 z-20">
                <div className="comic-ribbon-banner py-2 px-2 text-center text-lg font-comic font-black tracking-widest text-[#110e08] shadow-[0_4px_12px_rgba(0,0,0,0.9)] border-2 border-black">
                  {cardArt.customBanner}
                </div>
              </div>
            )}

            {/* Vintage Halftone & Vignette overlay */}
            <div className="absolute inset-0 pointer-events-none comic-halftone-cream opacity-15" />
            <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/40 rounded-xl" />
          </div>

          {/* Subtitle notice */}
          <div className="mt-2 text-[11px] font-typewriter text-amber-200/80">
            ★ Ваша тайная личность в этой партии ★
          </div>
        </div>

        {/* Footer with visible countdown timer & comic dismiss button */}
        <div className="w-full space-y-2.5 pt-2 border-t-2 border-black/80">
          <div className="flex items-center justify-center gap-2 text-xs font-comic text-neutral-300">
            <span>{STRINGS.roleReveal.timerLabel}:</span>
            <span className="font-comic font-bold text-amber-300 text-sm bg-black px-2.5 py-0.5 rounded border border-[#4a3a28]">
              {remaining} с
            </span>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="w-full min-h-[46px] py-2.5 px-4 rounded-xl font-comic text-sm tracking-wider comic-btn-yellow flex items-center justify-center gap-2"
          >
            <span>Запомнил (скрыть карту)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
