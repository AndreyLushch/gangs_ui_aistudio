/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trophy, RotateCcw, Skull, Shield, Users, Activity } from 'lucide-react';
import { Player, RoleSide, ZoneHistoryEntry } from '../types/game';
import { ZoneBadge } from '../components/ZoneBadge';
import { STRINGS } from '../strings/ru';
import { triggerHaptic } from '../utils/haptics';

interface GameOverViewProps {
  winner: RoleSide;
  allPlayers: Player[];
  zoneHistory: ZoneHistoryEntry[];
  totalRounds: number;
  onPlayAgain: () => void;
}

export const GameOverView: React.FC<GameOverViewProps> = ({
  winner,
  allPlayers,
  zoneHistory,
  totalRounds,
  onPlayAgain,
}) => {
  const isCitizens = winner === 'citizens';

  const jailedPlayers = allPlayers.filter((p) => p.eliminatedReason === 'jailed');
  const kidnappedPlayers = allPlayers.filter((p) => p.eliminatedReason === 'kidnapped');

  return (
    <div className="space-y-4 pb-20 pt-1 text-center animate-fade-in max-w-md mx-auto">
      {/* 1930s Comic Final Cover Victory Box */}
      <div className="relative rounded-2xl comic-border-lg overflow-hidden bg-[#181410] shadow-2xl p-4 space-y-3">
        {/* Victory Art Hero */}
        <div className="w-full aspect-[16/10] rounded-xl overflow-hidden comic-border relative bg-black">
          <img
            src={
              isCitizens
                ? '/assets/aistudio/______2722ae3f.png'
                : '/assets/aistudio/_________b8075905.png'
            }
            alt="Финал игры"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 comic-halftone-cream opacity-15 pointer-events-none" />

          {/* Victory Ribbon */}
          <div className="absolute bottom-2 left-2 right-2">
            <div className="comic-ribbon-banner py-1 px-2 text-center text-sm font-comic font-black tracking-widest text-[#110e08] border-2 border-black">
              {isCitizens ? 'ПОБЕДА СИЛ ЗАКОНА!' : 'СИНДИКАТ ЗАХВАТИЛ ГОРОД!'}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-comic font-black tracking-wide text-[#f5eedb]">
            {isCitizens ? STRINGS.gameOver.citizensWonTitle : STRINGS.gameOver.gangstersWonTitle}
          </h1>
          <p className="text-xs font-typewriter text-amber-200/90 leading-relaxed">
            {isCitizens ? STRINGS.gameOver.citizensWonSubtitle : STRINGS.gameOver.gangstersWonSubtitle}
          </p>
        </div>
      </div>

      {/* Match Stats summary (Police Archive) */}
      <div className="bg-[#181410] comic-border rounded-xl p-3 sm:p-4 space-y-3 text-left">
        <div className="flex items-center justify-between text-xs font-comic border-b-2 border-black/80 pb-2">
          <span className="text-amber-200">{STRINGS.gameOver.statsTitle}:</span>
          <span className="bg-[#2c2217] text-[#f59e0b] px-2 py-0.5 rounded border border-black font-black">
            РАУНДОВ: {totalRounds}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-comic">
          <div className="p-2.5 rounded-lg bg-[#2b171a] border-2 border-black space-y-1 shadow-[2px_2px_0px_#000]">
            <span className="text-[#f87171] block font-bold">ПОХИЩЕНО НОЧЬЮ ({kidnappedPlayers.length}):</span>
            <span className="text-neutral-200 text-[11px] block truncate font-typewriter">
              {kidnappedPlayers.length > 0
                ? kidnappedPlayers.map((p) => p.name.split(' ')[0]).join(', ')
                : 'Никто'}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-[#182333] border-2 border-black space-y-1 shadow-[2px_2px_0px_#000]">
            <span className="text-[#38bdf8] block font-bold">В ТЮРЬМЕ ({jailedPlayers.length}):</span>
            <span className="text-neutral-200 text-[11px] block truncate font-typewriter">
              {jailedPlayers.length > 0
                ? jailedPlayers.map((p) => p.name.split(' ')[0]).join(', ')
                : 'Никто'}
            </span>
          </div>
        </div>
      </div>

      {/* Revealed Secret Roles List */}
      <div className="bg-[#181410] comic-border rounded-xl p-3 sm:p-4 space-y-3 text-left">
        <div className="flex items-center gap-2 text-xs font-comic text-amber-200 border-b-2 border-black/80 pb-2">
          <Users size={14} className="text-[#f59e0b]" />
          <span>{STRINGS.gameOver.rolesRevealTitle}:</span>
        </div>

        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
          {allPlayers.map((player) => {
            const isGangster = player.role === 'gangster' || player.role === 'boss';

            return (
              <div
                key={player.id}
                className={`p-2 rounded-lg border-2 border-black flex items-center justify-between gap-2 shadow-[2px_2px_0px_#000] ${
                  isGangster
                    ? 'bg-[#3d1a1f] text-[#fee2e2]'
                    : 'bg-[#221c16] text-[#e6ded1]'
                } ${!player.isAlive ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-8 h-8 rounded-full bg-[#110e08] border-2 border-black overflow-hidden flex-shrink-0 shadow-[1px_1px_0px_#000]">
                    <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-comic font-bold tracking-wide truncate">{player.name}</div>
                    <div className="text-[10px] font-typewriter text-neutral-400">
                      {player.isAlive
                        ? 'Выжил'
                        : player.eliminatedReason === 'jailed'
                        ? 'Осуждён'
                        : 'Похищен'}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span
                    className={`text-xs font-comic font-black tracking-wider ${
                      isGangster ? 'text-[#f87171]' : 'text-[#38bdf8]'
                    }`}
                  >
                    {STRINGS.roles.names[player.role]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Zones History Timeline */}
      {zoneHistory.length > 0 && (
        <div className="bg-[#181410] comic-border rounded-xl p-3 sm:p-4 space-y-3 text-left">
          <div className="flex items-center gap-2 text-xs font-comic text-amber-200 border-b-2 border-black/80 pb-2">
            <Activity size={14} className="text-[#f59e0b]" />
            <span>ХРОНИКА СЛУХОВ (ПО РАУНДАМ):</span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {zoneHistory.map((entry) => (
              <div key={entry.round} className="p-2 rounded-lg bg-[#221c16] border-2 border-black space-y-1 shadow-[1px_1px_0px_#000]">
                <div className="text-[11px] font-comic text-[#f59e0b] font-black">
                  РАУНД {entry.round}:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(entry.zones).map(([playerId, zone]) => {
                    const player = allPlayers.find((p) => p.id === playerId);
                    if (!player) return null;
                    return (
                      <span
                        key={playerId}
                        className="text-[10px] font-comic p-1 rounded bg-[#110e0b] border border-black flex items-center gap-1"
                      >
                        <span className="text-neutral-300 truncate max-w-[70px]">
                          {player.name.split(' ')[0]}:
                        </span>
                        <ZoneBadge zone={zone} size="sm" showIcon={false} />
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Play Again button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('impact', 'heavy');
            onPlayAgain();
          }}
          className="w-full min-h-[50px] py-3.5 px-6 rounded-xl font-comic text-base tracking-widest comic-btn-yellow flex items-center justify-center gap-2"
        >
          <RotateCcw size={18} />
          <span>{STRINGS.gameOver.playAgainBtn}</span>
        </button>
      </div>
    </div>
  );
};
