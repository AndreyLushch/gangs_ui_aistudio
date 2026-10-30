/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, Skull } from 'lucide-react';
import { STRINGS } from '../strings/ru';

interface SideCounterProps {
  citizensCount: number;
  gangstersCount: number;
  compact?: boolean;
}

export const SideCounter: React.FC<SideCounterProps> = ({
  citizensCount,
  gangstersCount,
  compact = false,
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* Citizens side (Police / Citizens badge) */}
      <div
        className="flex items-center gap-1.5 rounded-lg border-2 border-black bg-[#1b263b] px-2.5 py-1 text-sky-200 shadow-[2px_2px_0px_#000]"
        title="Живые горожане"
      >
        <Shield size={14} className="text-amber-400 fill-amber-400/30" />
        <span className="font-comic text-xs hidden min-[380px]:inline text-neutral-200">
          {STRINGS.roles.sides.citizens}:
        </span>
        <span className="font-comic font-black text-amber-300 text-sm tracking-wider">
          {citizensCount}
        </span>
      </div>

      <span className="text-[#d4af37] font-comic font-black text-sm">VS</span>

      {/* Gangsters side (Mafia skull badge) */}
      <div
        className="flex items-center gap-1.5 rounded-lg border-2 border-black bg-[#3e1319] px-2.5 py-1 text-rose-200 shadow-[2px_2px_0px_#000]"
        title="Живые гангстеры"
      >
        <Skull size={14} className="text-rose-400" />
        <span className="font-comic text-xs hidden min-[380px]:inline text-neutral-200">
          {STRINGS.roles.sides.gangsters}:
        </span>
        <span className="font-comic font-black text-rose-300 text-sm tracking-wider">
          {gangstersCount}
        </span>
      </div>
    </div>
  );
};
