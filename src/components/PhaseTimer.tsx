/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Clock } from 'lucide-react';

interface PhaseTimerProps {
  remaining: number;
  duration: number;
  showIcon?: boolean;
}

export const PhaseTimer: React.FC<PhaseTimerProps> = ({ remaining, duration, showIcon = true }) => {
  const isUrgent = remaining <= 10 && remaining > 0;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const timeFormatted = `${minutes > 0 ? `${minutes}:` : ''}${seconds.toString().padStart(2, '0')}`;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 border-black font-comic shadow-[2px_2px_0px_#000] transition-colors ${
        isUrgent
          ? 'bg-[#851818] text-amber-200 animate-pulse'
          : 'bg-[#231e17] text-amber-300'
      }`}
    >
      {showIcon && <Clock size={14} className={isUrgent ? 'text-amber-200 animate-spin' : 'text-amber-400'} />}
      <span className="font-comic font-black text-sm tracking-widest">{timeFormatted}</span>
    </div>
  );
};
