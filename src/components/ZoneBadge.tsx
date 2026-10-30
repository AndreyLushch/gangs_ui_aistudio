/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, AlertTriangle, MinusCircle, ShieldCheck } from 'lucide-react';
import { PressureZone } from '../types/game';
import { STRINGS } from '../strings/ru';

interface ZoneBadgeProps {
  zone: PressureZone;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const ZoneBadge: React.FC<ZoneBadgeProps> = ({ zone, size = 'md', showIcon = true }) => {
  const info = STRINGS.zones[zone];

  const config = {
    suspicious: {
      bg: 'bg-[#991b1b] text-[#fef2f2] border-black',
      icon: ShieldAlert,
      iconColor: 'text-[#fee2e2]',
    },
    questionable: {
      bg: 'bg-[#d97706] text-[#fffbeb] border-black',
      icon: AlertTriangle,
      iconColor: 'text-[#fef3c7]',
    },
    neutral: {
      bg: 'bg-[#3e3831] text-[#f5eedb] border-black',
      icon: MinusCircle,
      iconColor: 'text-amber-200',
    },
    trusted: {
      bg: 'bg-[#166534] text-[#f0fdf4] border-black',
      icon: ShieldCheck,
      iconColor: 'text-[#bbf7d0]',
    },
  }[zone];

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  }[size];

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-lg border-2 font-comic font-black tracking-wider shadow-[2px_2px_0px_#000] uppercase ${config.bg} ${sizeClasses}`}
      title={info.description}
    >
      {showIcon && <Icon size={iconSizes} className={config.iconColor} strokeWidth={2.5} />}
      <span>{info.label}</span>
    </span>
  );
};
