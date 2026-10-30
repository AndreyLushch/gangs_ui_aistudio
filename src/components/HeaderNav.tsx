/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HelpCircle, Wrench } from 'lucide-react';
import { SideCounter } from './SideCounter';
import { PhaseTimer } from './PhaseTimer';
import { GamePhase } from '../types/game';
import { STRINGS } from '../strings/ru';

interface HeaderNavProps {
  citizensCount: number;
  gangstersCount: number;
  phase: GamePhase;
  round: number;
  timerRemaining: number;
  timerDuration: number;
  onOpenRules: () => void;
  onToggleDevPanel: () => void;
  isDevOpen: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  citizensCount,
  gangstersCount,
  phase,
  round,
  timerRemaining,
  timerDuration,
  onOpenRules,
  onToggleDevPanel,
  isDevOpen,
}) => {
  const phaseLabels: Record<GamePhase, string> = {
    lobby: 'Выпуск 1: Сбор банды',
    role_reveal: 'Секретные роли',
    day_0: 'День 0: Знакомство',
    night: `Раунд ${round}: Ночной рейд`,
    morning_outcome: `Раунд ${round}: Экстренный выпуск`,
    morning_check: `Раунд ${round}: Тайный агент`,
    morning_pressure: `Раунд ${round}: Слухи в прессе`,
    day_discussion: `Раунд ${round}: Разборки на улице`,
    voting: `Раунд ${round}: Суд присяжных`,
    voting_outcome: `Раунд ${round}: Приговор суда`,
    game_over: 'Финальный выпуск',
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#110e0b] border-b-2 border-black px-3 py-2 space-y-2 shadow-[0_3px_10px_rgba(0,0,0,0.6)]">
      {/* Top Comic Masthead bar */}
      <div className="flex items-center justify-between">
        {/* Brand & Issue badge */}
        <div className="flex items-center gap-2">
          {/* Vintage 10¢ price badge */}
          <div className="w-7 h-7 rounded-full bg-[#f59e0b] text-[#110e08] border-2 border-black flex items-center justify-center font-comic font-black text-[10px] shadow-[1px_1px_0px_#000] -rotate-6">
            10¢
          </div>

          <div className="flex flex-col">
            <span className="font-comic font-black text-xl tracking-wider text-[#f5eedb] drop-shadow-[2px_2px_0px_#000] leading-none">
              GANGS
            </span>
            <span className="text-[9px] font-typewriter tracking-tight text-amber-300/80 -mt-0.5">
              DETECTIVE COMICS • 1934
            </span>
          </div>

          <span className="ml-1 text-[11px] font-comic tracking-wide px-2 py-0.5 rounded border border-black bg-[#231e17] text-amber-200 shadow-[1px_1px_0px_#000]">
            {phaseLabels[phase]}
          </span>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Открыть правила игры"
            onClick={onOpenRules}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#231e17] border-2 border-black text-amber-300 hover:bg-[#342c22] shadow-[2px_2px_0px_#000] transition-transform active:translate-x-0.5 active:translate-y-0.5"
          >
            <HelpCircle size={16} />
          </button>
          <button
            type="button"
            aria-label="Переключить Dev-панель"
            onClick={onToggleDevPanel}
            className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#000] transition-transform active:translate-x-0.5 active:translate-y-0.5 ${
              isDevOpen
                ? 'bg-[#f59e0b] text-[#110e08]'
                : 'bg-[#231e17] text-neutral-400 hover:text-white'
            }`}
          >
            <Wrench size={16} />
          </button>
        </div>
      </div>

      {/* Global Counters bar (Always visible on all game screens) */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-black/60">
        <SideCounter citizensCount={citizensCount} gangstersCount={gangstersCount} />

        {timerDuration > 0 && (
          <PhaseTimer remaining={timerRemaining} duration={timerDuration} />
        )}
      </div>
    </header>
  );
};
