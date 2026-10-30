/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Skull, ShieldCheck, Sun, ArrowRight, AlertTriangle } from 'lucide-react';
import { NightOutcome } from '../types/game';
import { STRINGS } from '../strings/ru';
import { triggerHaptic } from '../utils/haptics';

interface MorningOutcomeViewProps {
  outcome: NightOutcome | null;
  onContinue: () => void;
}

export const MorningOutcomeView: React.FC<MorningOutcomeViewProps> = ({ outcome, onContinue }) => {
  const isPrevented = outcome ? outcome.prevented : true;
  const victimName = outcome?.victimName || 'Неизвестный житель';
  const victimSide = outcome?.victimSide;

  return (
    <div className="flex flex-col items-center justify-between min-h-[72vh] py-2 px-2 text-center space-y-4 animate-fade-in max-w-md mx-auto">
      {/* 1930s Newspaper Front Page Panel */}
      <div className="w-full relative rounded-2xl overflow-hidden comic-border-lg bg-[#181410] shadow-2xl">
        {!isPrevented ? (
          /* Real 1930s Newspaper Illustration from User */
          <div className="relative">
            <div className="w-full aspect-[9/13] max-h-[380px] overflow-hidden relative bg-black">
              <img
                src="/assets/aistudio/________________________06f91637.png"
                alt="Газета: Экстренная новость о погроме и похищении"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 comic-halftone-cream opacity-10 pointer-events-none" />

              {/* Red Stamp Badge */}
              <div className="absolute top-3 right-3 bg-[#b91c1c] text-[#fef3c7] font-comic font-black text-xs px-2.5 py-1 rounded border-2 border-black shadow-[2px_2px_0px_#000] rotate-6">
                ДЕЛО ОТКРЫТО
              </div>
            </div>

            {/* Newspaper narrative briefing box */}
            <div className="p-3 bg-[#f5ebd6] text-[#1a1510] border-t-2 border-black space-y-2 text-left">
              <div className="font-comic font-black text-xs text-[#b91c1c] tracking-wider border-b border-[#a89070] pb-1">
                ГОРОДСКОЙ ВЕСТНИК • ЭКСТРЕННЫЙ ВЫПУСК
              </div>

              <div className="font-typewriter text-xs leading-relaxed font-bold">
                «{STRINGS.morning.kidnappedText(victimName)}»
              </div>

              {victimSide && (
                <div className="p-2 rounded bg-[#1c1813] text-amber-200 border-2 border-black font-comic text-xs flex items-center gap-2 shadow-[2px_2px_0px_#000]">
                  <AlertTriangle size={15} className="text-[#f59e0b] flex-shrink-0" />
                  <span>{STRINGS.morning.sideRevealed(victimSide)}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Attack Prevented Newspaper Headline */
          <div className="p-5 comic-paper space-y-4 text-center">
            <div className="inline-block bg-[#15803d] text-white font-comic font-black text-xs px-3 py-1 rounded border-2 border-black shadow-[2px_2px_0px_#000]">
              ГОРОДСКОЙ ВЕСТНИК • СПЕЦИАЛЬНЫЙ ВЫПУСК
            </div>

            <div className="w-20 h-20 mx-auto rounded-2xl bg-[#dcfce7] border-2 border-black flex items-center justify-center text-[#15803d] shadow-[3px_3px_0px_#000]">
              <ShieldCheck size={50} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-comic font-black tracking-wide text-[#110e08]">
                НАПАДЕНИЕ ПРЕДОТВРАЩЕНО!
              </h2>

              <p className="text-xs font-typewriter text-[#332b21] leading-relaxed">
                {STRINGS.morning.preventedText}
              </p>

              <div className="p-2.5 rounded bg-[#fef9c3] border-2 border-black font-comic text-xs text-[#713f12] shadow-[2px_2px_0px_#000]">
                Бдительность шерифа и стражей спасла жителя от лап синдиката!
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Continue button */}
      <div className="w-full pt-1">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('impact', 'medium');
            onContinue();
          }}
          className="w-full min-h-[48px] py-3 px-6 rounded-xl font-comic text-sm tracking-wider comic-btn-yellow flex items-center justify-center gap-2"
        >
          <span>ДАЛЕЕ: СВОДКИ И ПРОВЕРКИ</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
