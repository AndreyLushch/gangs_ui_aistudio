/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Gavel, Scale } from 'lucide-react';
import { Player } from '../types/game';
import { Ranker } from '../components/Ranker';
import { STRINGS } from '../strings/ru';

interface VotingViewProps {
  candidates: Array<Omit<Player, 'role'>>;
  initialRanking: string[];
  maxDepth: number;
  isSubmitted: boolean;
  onSubmit: (ranking: string[]) => void;
}

export const VotingView: React.FC<VotingViewProps> = ({
  candidates,
  initialRanking,
  maxDepth,
  isSubmitted,
  onSubmit,
}) => {
  const livingCandidates = candidates.filter((c) => c.isAlive);

  return (
    <div className="space-y-4 pb-20 pt-1">
      {/* 1930s Court Header Banner */}
      <div className="flex items-center justify-center gap-2 text-[#f59e0b] font-comic font-black text-sm uppercase tracking-widest bg-[#181410] border-2 border-black p-2 rounded-xl shadow-[2px_2px_0px_#000] max-w-md mx-auto">
        <Gavel size={16} />
        <span>★ {STRINGS.voting.title} ★</span>
        <Scale size={16} />
      </div>

      <Ranker
        candidates={livingCandidates}
        initialRanking={initialRanking}
        maxDepth={maxDepth}
        isSubmitted={isSubmitted}
        onSubmit={onSubmit}
        submitButtonText={STRINGS.voting.btnConfirm}
        isVoting={true}
      />
    </div>
  );
};
