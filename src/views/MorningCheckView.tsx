/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Eye, Search, ArrowRight, ShieldCheck, FileText } from 'lucide-react';
import { CheckNotice } from '../types/game';
import { STRINGS } from '../strings/ru';
import { triggerHaptic } from '../utils/haptics';

interface MorningCheckViewProps {
  checkNotice: CheckNotice;
  remainingSeconds: number;
  onContinue: () => void;
}

export const MorningCheckView: React.FC<MorningCheckViewProps> = ({
  checkNotice,
  remainingSeconds,
  onContinue,
}) => {
  const isRelevant = checkNotice.isRelevantRole;

  return (
    <div className="flex flex-col items-center justify-between min-h-[70vh] py-3 px-2 text-center space-y-4 max-w-md mx-auto">
      {/* 1930s Secret Police Dossier Card */}
      <div className="w-full relative rounded-2xl bg-[#181410] comic-border-lg p-5 shadow-2xl flex flex-col items-center space-y-4">
        {/* Top Header & Stamp */}
        <div className="w-full flex items-center justify-between border-b-2 border-black/80 pb-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2a2218] border border-black text-xs font-comic text-amber-300">
            <Search size={13} className="text-[#f59e0b]" />
            <span>УТРЕННИЕ ПРОВЕРКИ ({remainingSeconds} с)</span>
          </div>

          <div
            className={`font-comic font-black text-xs px-2.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000] ${
              isRelevant ? 'bg-[#b91c1c] text-[#fef3c7]' : 'bg-[#332b21] text-neutral-300'
            }`}
          >
            {isRelevant ? 'СОВЕРШЕННО СЕКРЕТНО' : 'ДЕЛО В АРХИВЕ'}
          </div>
        </div>

        {/* Emblem */}
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 border-black shadow-[3px_3px_0px_#000] ${
            isRelevant
              ? 'bg-[#3b2813] text-[#f59e0b]'
              : 'bg-[#221c16] text-neutral-400'
          }`}
        >
          {isRelevant ? <Eye size={44} strokeWidth={2.2} /> : <FileText size={44} strokeWidth={2} />}
        </div>

        {/* Content */}
        <div className="space-y-3 w-full">
          <h2 className="text-xl font-comic font-black tracking-wide text-[#f5eedb]">
            {checkNotice.title}
          </h2>

          <div
            className={`p-4 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000] font-comic font-black text-lg sm:text-xl tracking-wider ${
              isRelevant
                ? 'bg-[#f59e0b] text-[#110e08]'
                : 'comic-paper text-[#18140f]'
            }`}
          >
            ★ {checkNotice.result} ★
          </div>

          {checkNotice.subtitle && (
            <div className="p-3 rounded-lg comic-paper border-2 border-black text-xs font-typewriter text-[#18140f] leading-relaxed shadow-[2px_2px_0px_#000] text-left">
              {checkNotice.subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Continue */}
      <div className="w-full pt-1">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('impact', 'medium');
            onContinue();
          }}
          className="w-full min-h-[48px] py-3 px-6 rounded-xl font-comic text-sm tracking-wider comic-btn-yellow flex items-center justify-center gap-2"
        >
          <span>ДАЛЕЕ: ОБЩЕСТВЕННОЕ МНЕНИЕ</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};
