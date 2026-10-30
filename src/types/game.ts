/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RoleSide = 'citizens' | 'gangsters';

export type Role =
  | 'citizen' // Горожанин
  | 'sheriff' // Шериф
  | 'watchman' // Ночной страж
  | 'avenger' // Мститель
  | 'press' // Пресса
  | 'judge' // Судья
  | 'lawyer' // Адвокат
  | 'gangster' // Гангстер
  | 'boss'; // Босс гангстеров

export type PressureZone =
  | 'suspicious' // 🟥 Под подозрением
  | 'questionable' // 🟧 Сомнительный
  | 'neutral' // 🟨 Нейтральный
  | 'trusted'; // 🟩 Вызывает доверие

export type GamePhase =
  | 'lobby'
  | 'role_reveal'
  | 'day_0'
  | 'night'
  | 'morning_outcome' // 5.5.1 Night outcome card
  | 'morning_check' // 5.5.2 Sheriff & Boss notifications / neutral screen for others
  | 'morning_pressure' // 5.5.3 Public Opinion zones for 5 sec
  | 'day_discussion' // 5.6 Discussion & anonymous notes
  | 'voting' // 5.7 Voting ranking
  | 'voting_outcome' // 5.7 Voting outcome card
  | 'game_over'; // 5.10 Game summary

export interface Player {
  id: string;
  name: string;
  avatarUrl: string;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  isAlive: boolean;
  eliminatedReason?: 'kidnapped' | 'jailed';
  eliminatedRound?: number;
  role: Role;
  roleSeen: boolean;
}

export interface AnonymousNote {
  id: string;
  fromId: string;
  toId: string;
  text: string;
  round: number;
  timestamp: number;
  read: boolean;
}

export interface NightOutcome {
  targetId: string | null;
  prevented: boolean;
  victimName?: string;
  victimSide?: RoleSide;
}

export interface VotingOutcome {
  targetId: string | null;
  acquitted: boolean;
  victimName?: string;
  victimSide?: RoleSide;
}

export interface CheckNotice {
  isRelevantRole: boolean;
  roleName?: string;
  title: string;
  result: string; // e.g. "Подозрение подтвердилось" or "Да"
  subtitle?: string;
}

export interface ZoneHistoryEntry {
  round: number;
  zones: Record<string, PressureZone>;
}

export interface GameEventLog {
  id: string;
  timestamp: number;
  round: number;
  phase: GamePhase;
  message: string;
  type: 'phase' | 'action' | 'elimination' | 'system';
}

export interface GameState {
  phase: GamePhase;
  round: number;
  players: Player[];
  timerRemaining: number;
  timerDuration: number;
  timerStartedAt: number | null;
  // Host role customization
  gangstersCount: number;
  enabledSpecialRoles: Partial<Record<Role, boolean>>;
  // Rankings for current round
  nightRankings: Record<string, string[]>; // voterId -> targetIds
  votingRankings: Record<string, string[]>; // voterId -> targetIds
  submittedRankings: Record<string, boolean>; // voterId -> boolean
  // Public Opinion & Pressure
  pressureRaw: Record<string, number>;
  shownZones: Record<string, PressureZone>;
  zoneHistory: ZoneHistoryEntry[];
  // Outcomes
  lastNightOutcome: NightOutcome | null;
  lastVotingOutcome: VotingOutcome | null;
  // Notes
  notes: AnonymousNote[];
  notesUsedToday: Record<string, number>; // playerId -> count
  // Game conclusion
  winner: RoleSide | null;
  eventLogs: GameEventLog[];
}

/**
 * Filtered projection for a specific player's screen.
 * Does NOT contain secret roles of other players.
 */
export interface PlayerView {
  myPlayer: Player;
  otherPlayers: Array<Omit<Player, 'role'>>;
  activeCitizensCount: number;
  activeGangstersCount: number;
  phase: GamePhase;
  round: number;
  phaseTimerRemaining: number;
  phaseTimerDuration: number;
  mySubmitted: boolean;
  myCurrentRanking: string[];
  maxRankDepth: number;
  nightOutcome: NightOutcome | null;
  votingOutcome: VotingOutcome | null;
  checkNotice: CheckNotice;
  publicOpinionZones: Record<string, PressureZone> | null;
  myIncomingNotes: Array<{ id: string; text: string; timestamp: number }>;
  notesRemainingToday: number;
  gameOverData: {
    winner: RoleSide;
    allPlayers: Player[]; // Revealed when game is over
    zoneHistory: ZoneHistoryEntry[];
    totalRounds: number;
  } | null;
  isSpectator: boolean;
}
