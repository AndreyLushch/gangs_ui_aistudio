/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ArrowUp, ArrowDown, X, Check, Lock, AlertCircle } from 'lucide-react';
import { Player } from '../types/game';
import { STRINGS } from '../strings/ru';
import { triggerHaptic } from '../utils/haptics';

interface CandidatePlayer {
  id: string;
  name: string;
  avatarUrl: string;
  isConnected: boolean;
}

interface RankerProps {
  candidates: CandidatePlayer[];
  initialRanking: string[];
  maxDepth: number;
  isSubmitted: boolean;
  onSubmit: (ranking: string[]) => void;
  submitButtonText?: string;
  isVoting?: boolean;
}

export const Ranker: React.FC<RankerProps> = ({
  candidates,
  initialRanking,
  maxDepth,
  isSubmitted,
  onSubmit,
  submitButtonText = STRINGS.night.btnSubmit,
  isVoting = false,
}) => {
  const [ranking, setRanking] = useState<string[]>(initialRanking);

  const candidateMap = new Map<string, CandidatePlayer>();
  candidates.forEach((c) => candidateMap.set(c.id, c));

  const handleAddCandidate = (id: string) => {
    if (isSubmitted) return;
    if (ranking.includes(id)) {
      handleRemove(id);
      return;
    }
    if (ranking.length >= maxDepth) {
      triggerHaptic('notification', 'warning');
      return;
    }

    triggerHaptic('selection');
    setRanking([...ranking, id]);
  };

  const handleRemove = (id: string) => {
    if (isSubmitted) return;
    triggerHaptic('impact', 'light');
    setRanking(ranking.filter((item) => item !== id));
  };

  const handleMoveUp = (index: number) => {
    if (isSubmitted || index <= 0) return;
    triggerHaptic('impact', 'light');
    const newRank = [...ranking];
    const temp = newRank[index - 1];
    newRank[index - 1] = newRank[index];
    newRank[index] = temp;
    setRanking(newRank);
  };

  const handleMoveDown = (index: number) => {
    if (isSubmitted || index >= ranking.length - 1) return;
    triggerHaptic('impact', 'light');
    const newRank = [...ranking];
    const temp = newRank[index + 1];
    newRank[index + 1] = newRank[index];
    newRank[index] = temp;
    setRanking(newRank);
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    if (ranking.length === 0) {
      triggerHaptic('notification', 'warning');
      return;
    }
    triggerHaptic('impact', 'heavy');
    onSubmit(ranking);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
      {/* Title & subtitle box */}
      <div className="bg-[#181410] comic-border rounded-xl p-3 text-center space-y-1">
        <h2 className="text-lg font-comic font-black tracking-wide text-amber-200">
          {isVoting ? STRINGS.voting.title : STRINGS.night.subtitle}
        </h2>
        <p className="text-xs font-typewriter text-neutral-300 leading-relaxed">
          {isVoting ? STRINGS.voting.instruction : STRINGS.night.instruction}
        </p>
      </div>

      {/* Ranked slots list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-comic text-amber-200 px-1">
          <span>ДОСЬЕ ПОДОЗРЕВАЕМЫХ (МАКС. {maxDepth}):</span>
          <span className="bg-[#2c2217] text-[#f59e0b] px-2 py-0.5 rounded border border-black font-black">
            {ranking.length}/{maxDepth}
          </span>
        </div>

        {ranking.length === 0 ? (
          <div className="border-2 border-dashed border-[#44382c] rounded-xl p-5 text-center text-neutral-400 text-xs font-typewriter bg-[#14110d]">
            Нажмите на фигурантов ниже, чтобы внести их в список подозрения.
          </div>
        ) : (
          <div className="space-y-2">
            {ranking.map((id, index) => {
              const player = candidateMap.get(id);
              if (!player) return null;
              const isFirst = index === 0;

              return (
                <div
                  key={id}
                  className={`flex items-center justify-between p-2.5 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] transition-all ${
                    isFirst
                      ? 'bg-[#3d1a1f] text-[#fee2e2]'
                      : 'bg-[#221c16] text-[#e6ded1]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank position badge */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-comic font-black text-xs border-2 border-black shadow-[1px_1px_0px_#000] ${
                        isFirst
                          ? 'bg-[#b91c1c] text-[#fef2f2]'
                          : 'bg-[#f59e0b] text-[#110e08]'
                      }`}
                    >
                      #{index + 1}
                    </div>

                    {/* Avatar & Name */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#110e08] border-2 border-black overflow-hidden flex-shrink-0 shadow-[1px_1px_0px_#000]">
                        <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs sm:text-sm font-comic font-bold tracking-wide">
                          {player.name}
                        </div>
                        {isFirst && (
                          <div className="text-[10px] font-comic tracking-wider text-[#f87171] font-bold">
                            ★ ГЛАВНЫЙ ПОДОЗРЕВАЕМЫЙ
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Move Up/Down and Remove controls */}
                  {!isSubmitted ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label={`Поднять ${player.name} выше`}
                        disabled={index === 0}
                        onClick={() => handleMoveUp(index)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center comic-btn-dark text-neutral-200 disabled:opacity-20"
                      >
                        <ArrowUp size={14} strokeWidth={2.5} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Опустить ${player.name} ниже`}
                        disabled={index === ranking.length - 1}
                        onClick={() => handleMoveDown(index)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center comic-btn-dark text-neutral-200 disabled:opacity-20"
                      >
                        <ArrowDown size={14} strokeWidth={2.5} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Удалить ${player.name} из рейтинга`}
                        onClick={() => handleRemove(id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#7f1d1d] hover:bg-[#991b1b] border-2 border-black text-white shadow-[2px_2px_0px_#000]"
                      >
                        <X size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-amber-400 pr-1">
                      <Lock size={15} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Candidates grid */}
      <div className="space-y-2 pt-1">
        <div className="text-xs font-comic text-amber-200 px-1">
          ФИГУРАНТЫ ДЕЛА (НАЖМИТЕ ДЛЯ ВЫБОРА):
        </div>
        <div className="grid grid-cols-2 gap-2">
          {candidates.map((player) => {
            const rankIndex = ranking.indexOf(player.id);
            const isRanked = rankIndex !== -1;

            return (
              <button
                key={player.id}
                type="button"
                aria-label={`Выбрать ${player.name}`}
                disabled={isSubmitted}
                onClick={() => handleAddCandidate(player.id)}
                className={`flex items-center justify-between p-2 rounded-lg border-2 border-black text-left transition-all min-h-[48px] shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 ${
                  isRanked
                    ? 'bg-[#3b2813] text-[#fef3c7]'
                    : 'bg-[#181410] hover:bg-[#251f18] text-[#e6ded1]'
                } ${!player.isConnected ? 'opacity-40' : ''}`}
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-7 h-7 rounded-full bg-[#110e08] border-2 border-black overflow-hidden flex-shrink-0 shadow-[1px_1px_0px_#000]">
                    <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-comic tracking-wide truncate">{player.name}</span>
                </div>

                {isRanked ? (
                  <span className="w-5 h-5 rounded bg-[#f59e0b] text-[#110e08] text-[11px] font-comic font-black flex items-center justify-center border border-black shadow-[1px_1px_0px_#000] flex-shrink-0">
                    {rankIndex + 1}
                  </span>
                ) : (
                  <span className="text-[#8c8273] font-comic font-black text-sm flex-shrink-0">+</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Submission block */}
      <div className="pt-1">
        {isSubmitted ? (
          <div className="p-3.5 rounded-xl border-2 border-black bg-[#14301d] text-center space-y-1 shadow-[3px_3px_0px_#000]">
            <div className="flex items-center justify-center gap-2 text-[#6ee7b7] font-comic font-black text-sm tracking-wide">
              <Check size={18} strokeWidth={3} />
              <span>{STRINGS.night.submittedNotice}</span>
            </div>
            <p className="text-xs font-typewriter text-neutral-300">
              Ваш выбор зафиксирован в протоколе. Ожидайте истечения таймера.
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={ranking.length === 0}
            className="w-full min-h-[50px] py-3 px-6 rounded-xl font-comic text-sm tracking-widest comic-btn-yellow disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitButtonText} ({ranking.length})
          </button>
        )}
      </div>
    </div>
  );
};
