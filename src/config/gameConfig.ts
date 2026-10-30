/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Role } from '../types/game';

export interface GameConfig {
  PLAYERS_MIN: number;
  PLAYERS_MAX: number;
  ROLE_CARD_TTL: number; // seconds
  // Timers: marked as TODO(spec) per requirements - not finalized
  DAY_0_TIMER: number; // TODO(spec): not finalized, default 120s
  NIGHT_TIMER: number; // TODO(spec): not finalized, default 45s
  DISCUSSION_TIMER: number; // TODO(spec): not finalized, default 180s
  VOTING_TIMER: number; // TODO(spec): not finalized, default 45s
  RANK_DEPTH: number;
  CHECK_NOTICE_TTL: number; // seconds
  PRESSURE_SHOW_TTL: number; // seconds
  PRESSURE_DAMPING: number;
  PRESSURE_VOTE_DECAY: number;
  PRESSURE_NOISE: number;
  PRESSURE_ZONES: [number, number, number, number]; // [0.20, 0.30, 0.30, 0.20]
  PRESSURE_SPIKE_P: number;
  ZONE_MULT: [number, number, number, number]; // [1.15, 1.05, 1.0, 0.95] for [red, orange, yellow, green]
  NOTES_PER_DAY: number;
  SPECTATOR_MODE: boolean; // TODO(spec): eliminated players spectator mode
  PARTIAL_RANKING_POLICY: 'partial' | 'neutral'; // TODO(spec): unfinished ranking policy
  TOKEN_PRICE_BASE: number; // tokens price per player for lobby block
}

export const GAME_CONFIG: GameConfig = {
  PLAYERS_MIN: 4,
  PLAYERS_MAX: 25,
  ROLE_CARD_TTL: 7,
  // Timers (in seconds)
  DAY_0_TIMER: 120, // TODO(spec): timer values are open for tuning
  NIGHT_TIMER: 45, // TODO(spec): timer values are open for tuning
  DISCUSSION_TIMER: 180, // TODO(spec): timer values are open for tuning
  VOTING_TIMER: 45, // TODO(spec): timer values are open for tuning
  RANK_DEPTH: 5,
  CHECK_NOTICE_TTL: 7,
  PRESSURE_SHOW_TTL: 5,
  PRESSURE_DAMPING: 0.7,
  PRESSURE_VOTE_DECAY: 0.5,
  PRESSURE_NOISE: 0.07,
  PRESSURE_ZONES: [0.20, 0.30, 0.30, 0.20],
  PRESSURE_SPIKE_P: 0.12,
  ZONE_MULT: [1.15, 1.05, 1.0, 0.95],
  NOTES_PER_DAY: 2,
  SPECTATOR_MODE: true, // TODO(spec): eliminated players can observe game flow
  PARTIAL_RANKING_POLICY: 'partial', // TODO(spec): count partial ranking when timer expires
  TOKEN_PRICE_BASE: 5,
};

export interface RoleDefaultsTableEntry {
  totalGangsters: number;
  hasBoss: boolean;
  sheriff: number;
  press: number;
  watchman: number;
  avenger: number;
  judge: number;
  lawyer: number;
}

/**
 * Returns role composition according to the specification table:
 * 4: 1/—/—/—/—/—/—/—
 * 5: 1/—/1/—/—/—/—/—
 * 6–7: 1/—/1/1/—/—/—/—
 * 8–9: 2/1/1/1/1/—/—/—
 * 10–11: 2/1/1/1/1/—/1/—
 * 12–15: 3/1/1/1/1/—/1/1
 * 16–19: 4/1/1/2/1/1/1/1
 * 20–23: 5/1/1/2/1/1/1/2
 * 24–25: 6/1/1/2/1/1/1/2
 * Total gangsters includes Boss.
 * Maximum gangsters = floor(N / 4).
 */
export function getRoleDefaults(n: number): RoleDefaultsTableEntry {
  const clampedN = Math.max(GAME_CONFIG.PLAYERS_MIN, Math.min(GAME_CONFIG.PLAYERS_MAX, n));
  const maxGangsters = Math.floor(clampedN / 4);

  let totalGangsters = 1;
  let hasBoss = false;
  let sheriff = 0;
  let press = 0;
  let watchman = 0;
  let avenger = 0;
  let judge = 0;
  let lawyer = 0;

  if (clampedN === 4) {
    totalGangsters = 1;
  } else if (clampedN === 5) {
    totalGangsters = 1;
    sheriff = 1;
  } else if (clampedN <= 7) {
    totalGangsters = 1;
    sheriff = 1;
    press = 1;
  } else if (clampedN <= 9) {
    totalGangsters = 2;
    hasBoss = true;
    sheriff = 1;
    press = 1;
    watchman = 1;
  } else if (clampedN <= 11) {
    totalGangsters = 2;
    hasBoss = true;
    sheriff = 1;
    press = 1;
    watchman = 1;
    judge = 1;
  } else if (clampedN <= 15) {
    totalGangsters = 3;
    hasBoss = true;
    sheriff = 1;
    press = 1;
    watchman = 1;
    judge = 1;
    lawyer = 1;
  } else if (clampedN <= 19) {
    totalGangsters = 4;
    hasBoss = true;
    sheriff = 1;
    press = 2;
    watchman = 1;
    avenger = 1;
    judge = 1;
    lawyer = 1;
  } else if (clampedN <= 23) {
    totalGangsters = 5;
    hasBoss = true;
    sheriff = 1;
    press = 2;
    watchman = 1;
    avenger = 1;
    judge = 1;
    lawyer = 2;
  } else {
    // 24–25
    totalGangsters = 6;
    hasBoss = true;
    sheriff = 1;
    press = 2;
    watchman = 1;
    avenger = 1;
    judge = 1;
    lawyer = 2;
  }

  // Hard clamp on gangsters: floor(N / 4)
  totalGangsters = Math.min(totalGangsters, maxGangsters);

  return {
    totalGangsters,
    hasBoss,
    sheriff,
    press,
    watchman,
    avenger,
    judge,
    lawyer,
  };
}

/**
 * Checks which special roles are unlocked for a given player count N:
 * Order of unlocking: Sheriff (>=5) -> Press (>=6) -> Watchman & Boss (>=8) -> Judge (>=10) -> Lawyer (>=12) -> Avenger (>=16)
 */
export function getUnlockedSpecialRoles(n: number): Record<Role, boolean> {
  return {
    citizen: true,
    gangster: true,
    boss: n >= 8,
    sheriff: n >= 5,
    press: n >= 6,
    watchman: n >= 8,
    judge: n >= 10,
    lawyer: n >= 12,
    avenger: n >= 16,
  };
}
