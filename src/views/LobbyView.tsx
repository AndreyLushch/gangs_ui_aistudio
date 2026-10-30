/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Check,
  Coins,
  Crown,
  HelpCircle,
  Info,
  LogOut,
  Minus,
  Plus,
  Play,
  Shield,
  Users,
  Flame,
} from 'lucide-react';
import { Player, Role } from '../types/game';
import { GAME_CONFIG, getUnlockedSpecialRoles } from '../config/gameConfig';
import { STRINGS } from '../strings/ru';
import { triggerHaptic } from '../utils/haptics';

interface LobbyViewProps {
  myPlayer: Player;
  allPlayers: Player[];
  gangstersCount: number;
  enabledSpecialRoles: Partial<Record<Role, boolean>>;
  onUpdateGangstersCount: (count: number) => void;
  onToggleSpecialRole: (role: Role) => void;
  onToggleReady: () => void;
  onStartGame: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  myPlayer,
  allPlayers,
  gangstersCount,
  enabledSpecialRoles,
  onUpdateGangstersCount,
  onToggleSpecialRole,
  onToggleReady,
  onStartGame,
}) => {
  const [activeTooltipRole, setActiveTooltipRole] = useState<Role | null>(null);

  const n = allPlayers.length;
  const maxGangsters = Math.max(1, Math.floor(n / 4));
  const unlocked = getUnlockedSpecialRoles(n);
  const tokenCost = n * GAME_CONFIG.TOKEN_PRICE_BASE;

  const specialRolesConfig: Array<{ role: Role; minN: number }> = [
    { role: 'sheriff', minN: 5 },
    { role: 'press', minN: 6 },
    { role: 'boss', minN: 8 },
    { role: 'watchman', minN: 8 },
    { role: 'judge', minN: 10 },
    { role: 'lawyer', minN: 12 },
    { role: 'avenger', minN: 16 },
  ];

  const handleStepGangsters = (delta: number) => {
    const next = Math.max(1, Math.min(maxGangsters, gangstersCount + delta));
    triggerHaptic('impact', 'light');
    onUpdateGangstersCount(next);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* 1930s Comic Cover Title Box */}
      <div className="relative bg-[#1c1813] comic-border-lg p-3 sm:p-4 text-center overflow-hidden">
        {/* Subtle halftone background */}
        <div className="absolute inset-0 comic-halftone-amber opacity-15 pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <div className="inline-block bg-[#f59e0b] text-[#110e08] font-comic font-black text-xs px-2.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
            ★ ПОДПОЛЬНЫЙ КЛУБ • СЕКРЕТНЫЙ ШТАБ ★
          </div>
          <h1 className="text-2xl sm:text-3xl font-comic font-black tracking-wider text-[#f5eedb] drop-shadow-[2px_2px_0px_#000]">
            {STRINGS.lobby.title}
          </h1>
          <p className="text-xs font-typewriter text-amber-300">
            {STRINGS.lobby.playersCount}: <span className="font-bold font-comic text-base text-[#f59e0b]">{n}</span> /{' '}
            {GAME_CONFIG.PLAYERS_MAX}
          </p>
        </div>
      </div>

      {/* Players List Comic Panel */}
      <div className="bg-[#181410] comic-border rounded-xl p-3 sm:p-4 space-y-3">
        <div className="flex items-center justify-between font-comic text-xs border-b-2 border-black/80 pb-2">
          <span className="flex items-center gap-1.5 text-amber-200">
            <Users size={15} className="text-[#f59e0b]" />
            <span className="tracking-wide">УЧАСТНИКИ ЗА СТОЛОМ:</span>
          </span>
          <span className="bg-[#14301d] text-[#6ee7b7] px-2 py-0.5 rounded border border-black font-black">
            ГОТОВЫ: {allPlayers.filter((p) => p.isReady).length}/{n}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
          {allPlayers.map((player) => {
            const isMe = player.id === myPlayer.id;

            return (
              <div
                key={player.id}
                className={`p-2 rounded-lg border-2 border-black flex items-center justify-between gap-2 shadow-[2px_2px_0px_#000] transition-transform ${
                  isMe
                    ? 'bg-[#3b2813] text-[#fef3c7]'
                    : 'bg-[#221c16] text-[#e6ded1]'
                } ${!player.isConnected ? 'opacity-40' : ''}`}
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-7 h-7 rounded-full bg-[#110e08] border-2 border-black overflow-hidden flex-shrink-0 relative shadow-[1px_1px_0px_#000]">
                    <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                    {player.isHost && (
                      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#f59e0b] rounded-full flex items-center justify-center border border-black">
                        <Crown size={8} className="text-[#110e08]" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-comic tracking-wide truncate">
                    {player.name} {isMe && '(ВЫ)'}
                  </span>
                </div>

                <div className="flex-shrink-0">
                  {player.isReady ? (
                    <span className="w-5 h-5 rounded bg-[#10b981] border border-black text-[#110e08] flex items-center justify-center font-comic font-black text-xs shadow-[1px_1px_0px_#000]">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="w-3 h-3 rounded-full bg-[#4a3f33] border border-black block" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Ready toggle comic button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('impact', 'medium');
              onToggleReady();
            }}
            className={`w-full py-2.5 px-4 rounded-xl font-comic text-xs uppercase tracking-wider comic-btn ${
              myPlayer.isReady
                ? 'bg-[#15803d] text-[#f0fdf4] hover:bg-[#16a34a]'
                : 'bg-[#332b21] text-[#f5eedb] hover:bg-[#43392d]'
            }`}
          >
            {myPlayer.isReady ? '✓ ' + STRINGS.lobby.btnNotReady : STRINGS.lobby.btnReady}
          </button>
        </div>
      </div>

      {/* Host Dossier Controls */}
      <div className="bg-[#181410] comic-border-lg rounded-xl p-3 sm:p-4 space-y-4">
        <div className="flex items-center gap-2 font-comic text-sm text-[#f5eedb] border-b-2 border-black/80 pb-2">
          <Crown size={16} className="text-[#f59e0b]" />
          <span className="tracking-wider">НАСТРОЙКИ ВЕДУЩЕГО (ДОСЬЕ ШЕРИФА)</span>
        </div>

        {/* Gangsters Stepper */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-comic">
            <span className="text-amber-200">{STRINGS.lobby.gangstersLabel}:</span>
            <span className="text-[#b91c1c] font-black">{STRINGS.lobby.gangstersLimit}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-[#110e0b] border-2 border-black shadow-[2px_2px_0px_#000]">
            <button
              type="button"
              aria-label="Уменьшить количество гангстеров"
              disabled={gangstersCount <= 1}
              onClick={() => handleStepGangsters(-1)}
              className="w-9 h-9 rounded-lg comic-btn-dark flex items-center justify-center text-amber-200 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus size={15} strokeWidth={2.5} />
            </button>

            <div className="flex items-center gap-2">
              <span className="font-comic font-black text-2xl text-[#f87171] drop-shadow-[1px_1px_0px_#000]">
                {gangstersCount}
              </span>
              <span className="font-comic text-xs text-neutral-400">МАФИОЗИ</span>
            </div>

            <button
              type="button"
              aria-label="Увеличить количество гангстеров"
              disabled={gangstersCount >= maxGangsters}
              onClick={() => handleStepGangsters(1)}
              className="w-9 h-9 rounded-lg comic-btn-dark flex items-center justify-center text-amber-200 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus size={15} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Special Roles Checklist */}
        <div className="space-y-2">
          <div className="text-xs font-comic text-amber-200 flex items-center justify-between">
            <span className="tracking-wide">{STRINGS.lobby.specialRolesTitle}:</span>
            <span className="text-[11px] font-typewriter text-neutral-400">Доступно при N</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {specialRolesConfig.map(({ role, minN }) => {
              const isUnlocked = unlocked[role];
              const isChecked = isUnlocked && enabledSpecialRoles[role] !== false;
              const name = STRINGS.roles.names[role];

              return (
                <div
                  key={role}
                  className={`p-2 rounded-lg border-2 border-black flex items-center justify-between transition-colors shadow-[2px_2px_0px_#000] ${
                    isUnlocked
                      ? isChecked
                        ? 'bg-[#3b2813] text-[#fef3c7]'
                        : 'bg-[#1c1813] text-[#8c8273]'
                      : 'bg-[#14120e] text-[#554e44] opacity-50'
                  }`}
                >
                  <label className="flex items-center gap-2 cursor-pointer select-none truncate flex-1">
                    <input
                      type="checkbox"
                      disabled={!isUnlocked}
                      checked={isChecked}
                      onChange={() => {
                        triggerHaptic('selection');
                        onToggleSpecialRole(role);
                      }}
                      className="accent-[#f59e0b] rounded cursor-pointer w-4 h-4 border-black"
                    />
                    <span className="text-xs font-comic tracking-wide truncate">{name}</span>
                  </label>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      type="button"
                      aria-label={`Описание роли ${name}`}
                      onClick={() =>
                        setActiveTooltipRole(activeTooltipRole === role ? null : role)
                      }
                      className="text-amber-300/70 hover:text-amber-300 p-1"
                    >
                      <Info size={14} />
                    </button>
                    {!isUnlocked && (
                      <span className="text-[10px] font-typewriter text-neutral-400">
                        ({minN}+)
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active tooltip popover */}
          {activeTooltipRole && (
            <div className="p-3 rounded-lg comic-paper border-2 border-black text-xs font-typewriter leading-relaxed shadow-[3px_3px_0px_#000]">
              <span className="font-bold text-[#b91c1c] font-comic text-sm block">
                ★ {STRINGS.roles.names[activeTooltipRole]}:
              </span>{' '}
              {STRINGS.roles.descriptions[activeTooltipRole]}
            </div>
          )}
        </div>

        {/* Tokens block (1930s style ticket / chip) */}
        <div className="p-2.5 rounded-lg border-2 border-black bg-[#251f18] flex items-center justify-between shadow-[2px_2px_0px_#000]">
          <div className="flex items-center gap-2">
            <Coins size={18} className="text-[#f59e0b] flex-shrink-0" />
            <div>
              <div className="text-xs font-comic font-black text-amber-200">
                {STRINGS.lobby.tokensBlock.title}
              </div>
              <div className="text-[10px] font-typewriter text-neutral-400">
                {STRINGS.lobby.tokensBlock.balanceHint}
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="font-comic font-black text-[#f59e0b] text-base">{tokenCost}</span>{' '}
            <span className="text-[10px] font-comic text-neutral-300">
              {STRINGS.lobby.tokensBlock.tokensSuffix}
            </span>
          </div>
        </div>

        {/* Start Game Comic Button */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('impact', 'heavy');
            onStartGame();
          }}
          className="w-full min-h-[50px] py-3 px-6 rounded-xl font-comic text-base tracking-widest comic-btn-yellow flex items-center justify-center gap-2"
        >
          <Play size={18} fill="currentColor" />
          <span>{STRINGS.lobby.btnStart}</span>
        </button>
      </div>
    </div>
  );
};
