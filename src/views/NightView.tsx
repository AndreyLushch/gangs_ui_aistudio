/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Moon, Eye } from 'lucide-react';
import { Player } from '../types/game';
import { Ranker } from '../components/Ranker';
import { STRINGS } from '../strings/ru';

interface NightViewProps {
  candidates: Array<Omit<Player, 'role'>>;
  initialRanking: string[];
  maxDepth: number;
  isSubmitted: boolean;
  onSubmit: (ranking: string[]) => void;
}

export const NightView: React.FC<NightViewProps> = ({
  candidates,
  initialRanking,
  maxDepth,
  isSubmitted,
  onSubmit,
}) => {
  const livingCandidates = candidates.filter((c) => c.isAlive);

  return (
    <div className="space-y-4 pb-20 pt-1">
      {/* 1930s Comic Nocturnal City Panel */}
      <div className="relative rounded-2xl overflow-hidden comic-border-lg bg-black shadow-xl max-w-md mx-auto">
        <div className="h-32 sm:h-36 w-full relative overflow-hidden">
          <img
            src="/assets/aistudio/________________________d129a94d.png"
            alt="Ночной город"
            className="w-full h-full object-cover object-top opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#14110d] via-transparent to-black/40" />
          <div className="absolute inset-0 comic-halftone-dark opacity-30 pointer-events-none" />

          {/* Comic headline over the night skyline */}
          <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#1c1813] border-2 border-black text-xs font-comic text-[#f59e0b] shadow-[2px_2px_0px_#000]">
              <Moon size={13} className="text-[#f59e0b]" />
              <span>{STRINGS.night.title}</span>
            </div>
            <div className="bg-[#b91c1c] text-[#fef3c7] font-comic text-[10px] px-2 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
              ПОД ПОКРОВОМ ТЬМЫ
            </div>
          </div>
        </div>
      </div>

      {/* Comic Detective Ranker */}
      <Ranker
        candidates={livingCandidates}
        initialRanking={initialRanking}
        maxDepth={maxDepth}
        isSubmitted={isSubmitted}
        onSubmit={onSubmit}
        submitButtonText={STRINGS.night.btnSubmit}
        isVoting={false}
      />
    </div>
  );
};
