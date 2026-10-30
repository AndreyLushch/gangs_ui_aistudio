/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, BookOpen, Shield, Skull, Eye, Newspaper, Scale, Briefcase, Flame, CheckCircle2 } from 'lucide-react';
import { STRINGS } from '../strings/ru';
import { Role } from '../types/game';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  const roleList: Array<{ role: Role; side: 'citizens' | 'gangsters'; icon: React.ElementType }> = [
    { role: 'citizen', side: 'citizens', icon: Shield },
    { role: 'sheriff', side: 'citizens', icon: Eye },
    { role: 'watchman', side: 'citizens', icon: Shield },
    { role: 'avenger', side: 'citizens', icon: Flame },
    { role: 'press', side: 'citizens', icon: Newspaper },
    { role: 'judge', side: 'citizens', icon: Scale },
    { role: 'lawyer', side: 'citizens', icon: Briefcase },
    { role: 'gangster', side: 'gangsters', icon: Skull },
    { role: 'boss', side: 'gangsters', icon: Skull },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-lg bg-[#181410] comic-border-lg rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col max-h-[88vh] text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black/80 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-[#f59e0b]" />
            <h2 className="text-base sm:text-lg font-comic font-black tracking-wider text-[#f5eedb]">
              {STRINGS.rulesModal.title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Закрыть правила"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#231e17] border-2 border-black text-amber-200 hover:text-white shadow-[2px_2px_0px_#000]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto py-3 space-y-4 text-xs sm:text-sm text-neutral-300 pr-1">
          {/* Key Principle */}
          <div className="p-3.5 rounded-xl comic-paper border-2 border-black text-[#18140f] space-y-2 shadow-[3px_3px_0px_#000]">
            <h3 className="font-comic font-black text-sm text-[#b91c1c] flex items-center gap-1.5 tracking-wide">
              <CheckCircle2 size={16} className="text-[#b91c1c] flex-shrink-0" />
              <span>ГЛАВНЫЙ ПРИНЦИП: ЕДИНОЕ РАНЖИРОВАНИЕ</span>
            </h3>
            <p className="text-xs font-typewriter leading-relaxed">
              В приложении нет отдельных кнопок для спецдействий. Экран ночи и голосования абсолютно одинаков для всех. Каждая роль выражает свой выбор через порядок фигурантов в списке подозрения.
            </p>
            <ul className="text-xs font-typewriter space-y-1 pt-1 list-disc list-inside font-bold text-[#2d2217]">
              <li>1-е место у Шерифа — проверяемый подозреваемый.</li>
              <li>1-е место у Ночного стража и Мстителя — охраняемый житель.</li>
              <li>1-е место у Адвоката — подзащитный (снимает приговор суда).</li>
              <li>1-е место у Босса — цель ночной проверки на Шерифа.</li>
            </ul>
          </div>

          {/* Victory Conditions */}
          <div className="grid grid-cols-2 gap-2 text-xs font-comic">
            <div className="p-3 rounded-lg border-2 border-black bg-[#1b263b] text-[#e0f2fe] shadow-[2px_2px_0px_#000]">
              <div className="font-black text-[#38bdf8] mb-1">ПОБЕДА ГОРОЖАН</div>
              <p className="text-neutral-300 text-[11px] font-typewriter leading-relaxed">
                Отправить всех гангстеров в тюрьму.
              </p>
            </div>
            <div className="p-3 rounded-lg border-2 border-black bg-[#3e1319] text-[#ffe4e6] shadow-[2px_2px_0px_#000]">
              <div className="font-black text-[#f87171] mb-1">ПОБЕДА ГАНГСТЕРОВ</div>
              <p className="text-neutral-300 text-[11px] font-typewriter leading-relaxed">
                Достичь численного перевеса над горожанами (≥).
              </p>
            </div>
          </div>

          {/* Roles list */}
          <div className="space-y-2">
            <h3 className="font-comic font-black text-amber-200 tracking-wider text-xs">
              РОЛИ И ВОЗМОЖНОСТИ
            </h3>

            <div className="space-y-1.5">
              {roleList.map(({ role, side, icon: Icon }) => {
                const name = STRINGS.roles.names[role];
                const desc = STRINGS.roles.descriptions[role];
                const isGangster = side === 'gangsters';

                return (
                  <div
                    key={role}
                    className={`p-2.5 rounded-lg border-2 border-black flex items-start gap-2.5 shadow-[2px_2px_0px_#000] ${
                      isGangster
                        ? 'bg-[#2b171a] text-[#ffe4e6]'
                        : 'bg-[#221c16] text-[#e6ded1]'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 border border-black shadow-[1px_1px_0px_#000] ${
                        isGangster
                          ? 'bg-[#b91c1c] text-white'
                          : 'bg-[#f59e0b] text-[#110e08]'
                      }`}
                    >
                      <Icon size={14} />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-comic font-black text-xs sm:text-sm tracking-wide">
                          {name}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-comic font-black border border-black ${
                            isGangster ? 'bg-[#b91c1c] text-white' : 'bg-[#1b263b] text-sky-200'
                          }`}
                        >
                          {STRINGS.roles.sides[side]}
                        </span>
                      </div>
                      <p className="text-[11px] font-typewriter text-neutral-300 leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t-2 border-black/80">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl font-comic text-xs uppercase tracking-wider comic-btn-yellow"
          >
            {STRINGS.rulesModal.close}
          </button>
        </div>
      </div>
    </div>
  );
};
