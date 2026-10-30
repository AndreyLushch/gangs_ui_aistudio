/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Activity, ArrowRight, ShieldAlert } from 'lucide-react';
import { Player, PressureZone } from '../types/game';
import { ZoneBadge } from '../components/ZoneBadge';
import { STRINGS } from '../strings/ru';
import { triggerHaptic } from '../utils/haptics';

interface MorningPressureViewProps {
  livingPlayers: Array<Omit<Player, 'role'>>;
  myPlayer: Player;
  zones: Record<string, PressureZone>;
  remainingSeconds: number;
  onContinue: () => void;
}

export const MorningPressureView: React.FC<MorningPressureViewProps> = ({
  livingPlayers,
  myPlayer,
  zones,
  remainingSeconds,
  onContinue,
}) => {
  const allLiving: Array<Omit<Player, 'role'>> = [
    myPlayer,
    ...livingPlayers.filter((p) => p.isAlive),
  ];

  return (
    <div className="space-y-4 pb-20 pt-1 text-center animate-fade-in max-w-md mx-auto">
      {/* Title */}
      <div className="space-y-1 px-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#1c1813] border-2 border-black text-xs font-comic text-[#f59e0b] shadow-[2px_2px_0px_#000]">
          <Activity size={13} className="text-[#f59e0b]" />
          <span>{STRINGS.morning.pressureTitle} ({remainingSeconds} с)</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-comic font-black tracking-wide text-[#f5eedb]">
          {STRINGS.morning.pressureSubtitle}
        </h2>
      </div>

      {/* Grid of Living Players and their reputation zone (No numbers, no rank positions) */}
      <div className="bg-[#181410] comic-border-lg rounded-xl p-3 sm:p-4 space-y-2.5 text-left">
        <div className="text-xs font-comic text-amber-200 border-b-2 border-black/80 pb-1.5">
          СВОДКА ПОЛИЦИИ И ГАЗЕТНЫЕ СЛУХИ:
        </div>

        <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1">
          {allLiving.map((player) => {
            const zone = zones[player.id] || 'neutral';
            const isMe = player.id === myPlayer.id;

            return (
              <div
                key={player.id}
                className={`p-2.5 rounded-lg border-2 border-black flex items-center justify-between gap-3 shadow-[2px_2px_0px_#000] ${
                  isMe
                    ? 'bg-[#3b2813] text-[#fef3c7]'
                    : 'bg-[#221c16] text-[#e6ded1]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-8 h-8 rounded-full bg-[#110e08] border-2 border-black overflow-hidden flex-shrink-0 shadow-[1px_1px_0px_#000]">
                    <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left truncate">
                    <div className="text-xs sm:text-sm font-comic font-bold tracking-wide truncate">
                      {player.name} {isMe && '(ВЫ)'}
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <ZoneBadge zone={zone} size="md" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mandatory small text disclaimer at bottom */}
      <div className="p-3 rounded-lg comic-paper border-2 border-black text-left space-y-1 shadow-[2px_2px_0px_#000]">
        <div className="text-[11px] font-typewriter text-[#18140f] leading-relaxed">
          {STRINGS.morning.pressureDisclaimer}
        </div>
      </div>

      {/* Continue */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('impact', 'medium');
            onContinue();
          }}
          className="w-full min-h-[48px] py-3 px-6 rounded-xl font-comic text-sm tracking-wider comic-btn-yellow flex items-center justify-center gap-2"
        >
          <span>ПЕРЕЙТИ К ДНЕВНОМУ ОБСУЖДЕНИЮ</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
