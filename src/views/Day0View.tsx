/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Eye, Users, Moon, ArrowRight } from 'lucide-react';
import { STRINGS } from '../strings/ru';
import { Player } from '../types/game';
import { triggerHaptic } from '../utils/haptics';

interface Day0ViewProps {
  players: Array<Omit<Player, 'role'>>;
  onAdvanceToNight: () => void;
}

export const Day0View: React.FC<Day0ViewProps> = ({ players, onAdvanceToNight }) => {
  return (
    <div className="flex flex-col items-center justify-between min-h-[70vh] py-3 px-2 text-center space-y-4">
      {/* 1930s Comic Panel: Daybreak Skyline Image */}
      <div className="w-full max-w-sm relative rounded-2xl overflow-hidden comic-border-lg bg-black shadow-2xl group">
        <div className="aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden relative">
          <img
            src="/assets/aistudio/________________________624bf70d.png"
            alt="В городе наступает день"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 comic-halftone-cream opacity-15 pointer-events-none" />
        </div>

        {/* Comic Caption Box */}
        <div className="p-3 bg-[#181410] border-t-2 border-black text-left space-y-1">
          <div className="inline-block bg-[#f59e0b] text-[#110e08] font-comic font-black text-[10px] px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
            ВЫПУСК 1 • ПРОЛОГ
          </div>
          <h2 className="text-lg font-comic font-black tracking-wide text-[#f5eedb]">
            {STRINGS.day0.title}
          </h2>
          <p className="text-xs font-typewriter text-amber-200/90 leading-relaxed">
            {STRINGS.day0.subtitle}
          </p>
        </div>
      </div>

      {/* Living participants comic gallery */}
      <div className="w-full max-w-sm bg-[#181410] comic-border rounded-xl p-3 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-comic border-b-2 border-black/80 pb-1.5">
          <span className="text-amber-200 flex items-center gap-1.5">
            <Users size={14} className="text-[#f59e0b]" />
            <span>УЧАСТНИКИ В ГОРОДЕ:</span>
          </span>
          <span className="bg-[#2c2217] text-amber-300 px-2 py-0.5 rounded border border-black font-black">
            {players.length + 1} ЖИТЕЛЕЙ
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex flex-col items-center p-2 rounded-lg bg-[#221c16] border-2 border-black shadow-[1px_1px_0px_#000] space-y-1"
            >
              <div className="w-8 h-8 rounded-full bg-[#110e08] border-2 border-black overflow-hidden shadow-[1px_1px_0px_#000]">
                <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] font-comic font-bold text-neutral-200 truncate w-full text-center">
                {player.name.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Comic narrator instruction box */}
      <div className="w-full max-w-sm p-3 rounded-lg comic-paper border-2 border-black text-xs font-typewriter text-[#18140f] leading-relaxed shadow-[3px_3px_0px_#000] text-left">
        <span className="font-comic font-black text-xs text-[#b91c1c] block mb-0.5">
          ★ ИНСТРУКЦИЯ ДЛЯ ГОРОЖАН:
        </span>
        {STRINGS.day0.instruction}
      </div>

      {/* Advance to Night Button */}
      <div className="w-full max-w-sm pt-1">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('impact', 'medium');
            onAdvanceToNight();
          }}
          className="w-full min-h-[48px] py-3 px-4 rounded-xl font-comic text-sm tracking-wider comic-btn-yellow flex items-center justify-center gap-2"
        >
          <Moon size={16} />
          <span>ПЕРЕЙТИ К ПЕРВОЙ НОЧИ</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
