/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Gavel, Scale, Moon, ArrowRight } from 'lucide-react';
import { VotingOutcome } from '../types/game';
import { STRINGS } from '../strings/ru';
import { triggerHaptic } from '../utils/haptics';

interface VotingOutcomeViewProps {
  outcome: VotingOutcome | null;
  onContinue: () => void;
}

export const VotingOutcomeView: React.FC<VotingOutcomeViewProps> = ({ outcome, onContinue }) => {
  const isAcquitted = outcome?.acquitted ?? false;
  const victimName = outcome?.victimName;
  const victimSide = outcome?.victimSide;

  return (
    <div className="flex flex-col items-center justify-between min-h-[70vh] py-3 px-2 text-center space-y-4 animate-fade-in max-w-md mx-auto">
      {/* 1930s Court Verdict Document */}
      <div className="w-full relative rounded-2xl comic-border-lg bg-[#181410] p-5 shadow-2xl flex flex-col items-center space-y-4">
        {/* Top Court Badge */}
        <div className="w-full flex items-center justify-between border-b-2 border-black/80 pb-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2a2218] border border-black text-xs font-comic text-[#f59e0b]">
            <Gavel size={13} className="text-[#f59e0b]" />
            <span>ГОРОДСКОЙ СУД • ПРОТОКОЛ</span>
          </div>

          <div
            className={`font-comic font-black text-xs px-2.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000] ${
              isAcquitted
                ? 'bg-[#15803d] text-white'
                : victimName
                ? 'bg-[#b91c1c] text-[#fef3c7]'
                : 'bg-[#332b21] text-neutral-300'
            }`}
          >
            {isAcquitted ? 'ОПРАВДАН' : victimName ? 'ВЕРДИКТ: ВИНОВЕН' : 'ГОЛОСА РАВНЫ'}
          </div>
        </div>

        {/* Big Gavel / Scales Stamp */}
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_#000] ${
            isAcquitted
              ? 'bg-[#14301d] text-[#4ade80]'
              : victimName
              ? 'bg-[#3d1a1f] text-[#f87171]'
              : 'bg-[#221c16] text-[#f59e0b]'
          }`}
        >
          {isAcquitted ? <Scale size={46} /> : <Gavel size={46} />}
        </div>

        {/* Narrative text */}
        <div className="space-y-3 w-full">
          <h2 className="text-xl sm:text-2xl font-comic font-black tracking-wide text-[#f5eedb]">
            {isAcquitted
              ? 'ОПРАВДАТЕЛЬНЫЙ ВЕРДИКТ'
              : victimName
              ? 'ПРИГОВОР ПРИСЯЖНЫХ ВЫНЕСЕН'
              : 'СУД НЕ ПРИШЁЛ К РЕШЕНИЮ'}
          </h2>

          <div className="p-3.5 rounded-lg comic-paper border-2 border-black font-typewriter text-xs text-[#18140f] leading-relaxed shadow-[2px_2px_0px_#000] text-left">
            {isAcquitted
              ? STRINGS.voting.acquittedOutcome
              : victimName
              ? STRINGS.voting.jailedOutcome(victimName)
              : 'Голоса разделились поровну, ни один подозреваемый не отправлен в тюрьму.'}
          </div>

          {!isAcquitted && victimSide && (
            <div className="p-2.5 rounded-lg bg-[#221c16] border-2 border-black font-comic font-black text-xs text-amber-200 shadow-[2px_2px_0px_#000]">
              {STRINGS.voting.sideRevealed(victimSide)}
            </div>
          )}
        </div>
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
          <Moon size={16} />
          <span>НАВСТРЕЧУ СЛЕДУЮЩЕЙ НОЧИ</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
