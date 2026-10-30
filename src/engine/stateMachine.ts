/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GAME_CONFIG, GameConfig, getRoleDefaults, getUnlockedSpecialRoles } from '../config/gameConfig';
import {
  AnonymousNote,
  GameEventLog,
  GamePhase,
  GameState,
  Player,
  PlayerView,
  PressureZone,
  Role,
  RoleSide,
} from '../types/game';
import {
  calculateCheckNotice,
  calculateNightKidnap,
  calculatePublicOpinion,
  calculateVoting,
  checkWinCondition,
} from './calculations';

export const BOT_NAMES = [
  'Виктор Морган',
  'Марк Корнели',
  'София Моретти',
  'Лео Фальконе',
  'Елена Вольф',
  'Артур Блейк',
  'Диана Скалезе',
  'Роберт Картер',
  'Нина Вайс',
  'Томас Шелби',
  'Мила Романо',
  'Бруно Мартинес',
  'Клара Торрес',
  'Генри Дюпон',
  'Ольга Сальери',
  'Оскар Кинг',
  'Белла Капоне',
  'Феликс Грант',
  'Ирма Костелло',
  'Майкл Корлеоне',
  'Лидия Браун',
  'Эмиль Руссо',
  'Кира Свенсон',
  'Дэвид Финч',
  'Анна Ли',
];

/**
 * Assigns roles to players based on count N, host overrides, and rules:
 * - maxGangsters = floor(N / 4)
 * - If Boss is disabled by Host -> Gangster takes the slot.
 * - If any Citizen special role is disabled -> regular Citizen takes the slot.
 */
export function distributeRoles(
  players: Player[],
  gangstersCountOverride?: number,
  enabledSpecialRoles?: Partial<Record<Role, boolean>>
): Player[] {
  const n = players.length;
  const defaults = getRoleDefaults(n);
  const unlocked = getUnlockedSpecialRoles(n);

  const maxGangsters = Math.floor(n / 4);
  const targetGangsters = Math.min(
    maxGangsters,
    gangstersCountOverride !== undefined ? gangstersCountOverride : defaults.totalGangsters
  );

  const rolesPool: Role[] = [];

  // Gangsters side
  const useBoss = unlocked.boss && defaults.hasBoss && (enabledSpecialRoles?.boss !== false);
  if (useBoss) {
    rolesPool.push('boss');
    for (let i = 1; i < targetGangsters; i++) {
      rolesPool.push('gangster');
    }
  } else {
    for (let i = 0; i < targetGangsters; i++) {
      rolesPool.push('gangster');
    }
  }

  // Citizens side special roles
  if (unlocked.sheriff && defaults.sheriff > 0 && enabledSpecialRoles?.sheriff !== false) {
    rolesPool.push('sheriff');
  }
  if (unlocked.press && defaults.press > 0 && enabledSpecialRoles?.press !== false) {
    for (let i = 0; i < defaults.press; i++) {
      rolesPool.push('press');
    }
  }
  if (unlocked.watchman && defaults.watchman > 0 && enabledSpecialRoles?.watchman !== false) {
    rolesPool.push('watchman');
  }
  if (unlocked.judge && defaults.judge > 0 && enabledSpecialRoles?.judge !== false) {
    rolesPool.push('judge');
  }
  if (unlocked.lawyer && defaults.lawyer > 0 && enabledSpecialRoles?.lawyer !== false) {
    for (let i = 0; i < defaults.lawyer; i++) {
      rolesPool.push('lawyer');
    }
  }
  if (unlocked.avenger && defaults.avenger > 0 && enabledSpecialRoles?.avenger !== false) {
    rolesPool.push('avenger');
  }

  // Fill remaining slots with regular Citizen
  while (rolesPool.length < n) {
    rolesPool.push('citizen');
  }

  // If somehow pool > n (should not happen), truncate
  const finalPool = rolesPool.slice(0, n);

  // Shuffle roles pool
  for (let i = finalPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [finalPool[i], finalPool[j]] = [finalPool[j], finalPool[i]];
  }

  return players.map((player, index) => ({
    ...player,
    role: finalPool[index],
    roleSeen: false,
    isAlive: true,
    eliminatedReason: undefined,
    eliminatedRound: undefined,
  }));
}

/**
 * Creates initial game state with N players.
 */
export function createInitialState(playerCount: number = 8, config: GameConfig = GAME_CONFIG): GameState {
  const count = Math.max(config.PLAYERS_MIN, Math.min(config.PLAYERS_MAX, playerCount));
  const defaults = getRoleDefaults(count);
  const unlocked = getUnlockedSpecialRoles(count);

  const players: Player[] = [];
  for (let i = 0; i < count; i++) {
    players.push({
      id: `p-${i + 1}`,
      name: BOT_NAMES[i] || `Игрок ${i + 1}`,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=noir-${i + 1}`,
      isHost: i === 0,
      isReady: true,
      isConnected: true,
      isAlive: true,
      role: 'citizen',
      roleSeen: false,
    });
  }

  const enabledSpecialRoles: Partial<Record<Role, boolean>> = {};
  (Object.keys(unlocked) as Role[]).forEach((role) => {
    enabledSpecialRoles[role] = unlocked[role];
  });

  const distributedPlayers = distributeRoles(players, defaults.totalGangsters, enabledSpecialRoles);

  return {
    phase: 'lobby',
    round: 0,
    players: distributedPlayers,
    timerRemaining: 0,
    timerDuration: 0,
    timerStartedAt: null,
    gangstersCount: defaults.totalGangsters,
    enabledSpecialRoles,
    nightRankings: {},
    votingRankings: {},
    submittedRankings: {},
    pressureRaw: {},
    shownZones: {},
    zoneHistory: [],
    lastNightOutcome: null,
    lastVotingOutcome: null,
    notes: [],
    notesUsedToday: {},
    winner: null,
    eventLogs: [
      {
        id: 'log-0',
        timestamp: Date.now(),
        round: 0,
        phase: 'lobby',
        message: `Создано лобби на ${count} игроков. Ожидание готовности.`,
        type: 'system',
      },
    ],
  };
}

function addLog(state: GameState, message: string, type: GameEventLog['type'] = 'phase'): void {
  state.eventLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    round: state.round,
    phase: state.phase,
    message,
    type,
  });
}

/**
 * Advances the game phase in strict compliance with the state machine.
 */
export function advancePhase(state: GameState, config: GameConfig = GAME_CONFIG): GameState {
  const next = { ...state };

  switch (state.phase) {
    case 'lobby': {
      // 5.2 Role Reveal
      next.phase = 'role_reveal';
      next.players = distributeRoles(next.players, next.gangstersCount, next.enabledSpecialRoles);
      next.timerDuration = config.ROLE_CARD_TTL;
      next.timerRemaining = config.ROLE_CARD_TTL;
      next.timerStartedAt = Date.now();
      addLog(next, 'Раздача секретных ролей. Карточка видна на 7 секунд.');
      break;
    }

    case 'role_reveal': {
      // 5.3 Day 0
      next.phase = 'day_0';
      next.round = 0;
      next.timerDuration = config.DAY_0_TIMER;
      next.timerRemaining = config.DAY_0_TIMER;
      next.timerStartedAt = Date.now();
      addLog(next, 'День 0. Знакомство участников без голосования.');
      break;
    }

    case 'day_0': {
      // Transition to Night 1
      next.phase = 'night';
      next.round = 1;
      next.nightRankings = {};
      next.submittedRankings = {};
      next.timerDuration = config.NIGHT_TIMER;
      next.timerRemaining = config.NIGHT_TIMER;
      next.timerStartedAt = Date.now();
      addLog(next, `Раунд 1. Наступила ночь. Открыто ранжирование подозрений.`);
      break;
    }

    case 'night': {
      // 5.5 Morning - strictly step by step
      // Step 1: Night outcome calculation
      const kidnapResult = calculateNightKidnap(next.players, next.nightRankings, config);

      if (kidnapResult.victimPlayer && !kidnapResult.prevented) {
        const victimId = kidnapResult.victimPlayer.id;
        const side: RoleSide =
          kidnapResult.victimPlayer.role === 'gangster' || kidnapResult.victimPlayer.role === 'boss'
            ? 'gangsters'
            : 'citizens';

        next.players = next.players.map((p) =>
          p.id === victimId
            ? { ...p, isAlive: false, eliminatedReason: 'kidnapped' as const, eliminatedRound: next.round }
            : p
        );

        next.lastNightOutcome = {
          targetId: victimId,
          prevented: false,
          victimName: kidnapResult.victimPlayer.name,
          victimSide: side,
        };
        addLog(
          next,
          `Ночью похищен игрок ${kidnapResult.victimPlayer.name} (Сторона: ${side === 'gangsters' ? 'Гангстеры' : 'Горожане'}).`,
          'elimination'
        );
      } else {
        next.lastNightOutcome = {
          targetId: kidnapResult.targetId,
          prevented: true,
        };
        addLog(next, 'Ночное нападение на горожан было предотвращено защитниками.', 'action');
      }

      next.phase = 'morning_outcome';
      next.timerDuration = 6;
      next.timerRemaining = 6;
      next.timerStartedAt = Date.now();
      break;
    }

    case 'morning_outcome': {
      // Step 2: Sheriff & Boss check notices (modal for CHECK_NOTICE_TTL)
      next.phase = 'morning_check';
      next.timerDuration = config.CHECK_NOTICE_TTL;
      next.timerRemaining = config.CHECK_NOTICE_TTL;
      next.timerStartedAt = Date.now();
      addLog(next, 'Утренние проверки Шерифа и Босса (секретные уведомления).');
      break;
    }

    case 'morning_check': {
      // Step 3: Public Opinion zones for PRESSURE_SHOW_TTL (5 sec)
      const opinion = calculatePublicOpinion(
        next.players,
        next.nightRankings,
        next.pressureRaw,
        next.shownZones,
        next.round,
        config
      );
      next.pressureRaw = opinion.newPressureRaw;
      next.shownZones = opinion.newZones;
      next.zoneHistory = [...next.zoneHistory, { round: next.round, zones: { ...opinion.newZones } }];

      next.phase = 'morning_pressure';
      next.timerDuration = config.PRESSURE_SHOW_TTL;
      next.timerRemaining = config.PRESSURE_SHOW_TTL;
      next.timerStartedAt = Date.now();
      addLog(next, 'Отображение Общественного мнения на 5 секунд.');
      break;
    }

    case 'morning_pressure': {
      // Step 4: Win condition check after night
      const winner = checkWinCondition(next.players);
      if (winner) {
        next.phase = 'game_over';
        next.winner = winner;
        next.timerDuration = 0;
        next.timerRemaining = 0;
        next.timerStartedAt = null;
        addLog(next, `Игра окончена! Победили ${winner === 'citizens' ? 'Горожане' : 'Гангстеры'}!`, 'system');
        break;
      }

      // 5.6 Day Discussion
      next.phase = 'day_discussion';
      next.notesUsedToday = {};
      next.timerDuration = config.DISCUSSION_TIMER;
      next.timerRemaining = config.DISCUSSION_TIMER;
      next.timerStartedAt = Date.now();
      addLog(next, `Раунд ${next.round}. Дневное обсуждение. Разрешены анонимные записки.`);
      break;
    }

    case 'day_discussion': {
      // 5.7 Voting
      next.phase = 'voting';
      next.votingRankings = {};
      next.submittedRankings = {};
      next.timerDuration = config.VOTING_TIMER;
      next.timerRemaining = config.VOTING_TIMER;
      next.timerStartedAt = Date.now();
      addLog(next, `Судебное заседание. Голосование за отправку в тюрьму.`);
      break;
    }

    case 'voting': {
      // 5.7 Voting Outcome
      const voteResult = calculateVoting(
        next.players,
        next.votingRankings,
        next.shownZones,
        next.zoneHistory,
        config
      );

      // Pressure decay after voting
      const decayedPressure: Record<string, number> = {};
      for (const [id, val] of Object.entries(next.pressureRaw)) {
        decayedPressure[id] = val * config.PRESSURE_VOTE_DECAY;
      }
      next.pressureRaw = decayedPressure;

      if (voteResult.acquitted) {
        next.lastVotingOutcome = {
          targetId: voteResult.targetId,
          acquitted: true,
        };
        addLog(next, 'Усилиями адвокатов обвинения сняты, обвиняемый освобождён.', 'action');
      } else if (voteResult.victimPlayer) {
        const victimId = voteResult.victimPlayer.id;
        const side: RoleSide =
          voteResult.victimPlayer.role === 'gangster' || voteResult.victimPlayer.role === 'boss'
            ? 'gangsters'
            : 'citizens';

        next.players = next.players.map((p) =>
          p.id === victimId
            ? { ...p, isAlive: false, eliminatedReason: 'jailed' as const, eliminatedRound: next.round }
            : p
        );

        next.lastVotingOutcome = {
          targetId: victimId,
          acquitted: false,
          victimName: voteResult.victimPlayer.name,
          victimSide: side,
        };
        addLog(
          next,
          `Игрок ${voteResult.victimPlayer.name} отправлен в тюрьму (Сторона: ${side === 'gangsters' ? 'Гангстеры' : 'Горожане'}).`,
          'elimination'
        );
      } else {
        next.lastVotingOutcome = {
          targetId: null,
          acquitted: false,
        };
        addLog(next, 'Голосование завершилось без приговора (недостаточно голосов).', 'action');
      }

      next.phase = 'voting_outcome';
      next.timerDuration = 6;
      next.timerRemaining = 6;
      next.timerStartedAt = Date.now();
      break;
    }

    case 'voting_outcome': {
      // Check win condition
      const winner = checkWinCondition(next.players);
      if (winner) {
        next.phase = 'game_over';
        next.winner = winner;
        next.timerDuration = 0;
        next.timerRemaining = 0;
        next.timerStartedAt = null;
        addLog(next, `Игра окончена! Победили ${winner === 'citizens' ? 'Горожане' : 'Гангстеры'}!`, 'system');
        break;
      }

      // Advance to next night
      next.round += 1;
      next.phase = 'night';
      next.nightRankings = {};
      next.submittedRankings = {};
      next.timerDuration = config.NIGHT_TIMER;
      next.timerRemaining = config.NIGHT_TIMER;
      next.timerStartedAt = Date.now();
      addLog(next, `Раунд ${next.round}. Наступила ночь.`);
      break;
    }

    case 'game_over': {
      // Restart game to lobby with same players
      const resetPlayers = next.players.map((p, idx) => ({
        ...p,
        isAlive: true,
        isConnected: true,
        roleSeen: false,
        eliminatedReason: undefined,
        eliminatedRound: undefined,
      }));
      next.players = resetPlayers;
      next.phase = 'lobby';
      next.round = 0;
      next.winner = null;
      next.nightRankings = {};
      next.votingRankings = {};
      next.submittedRankings = {};
      next.pressureRaw = {};
      next.shownZones = {};
      next.zoneHistory = [];
      next.notes = [];
      next.notesUsedToday = {};
      next.lastNightOutcome = null;
      next.lastVotingOutcome = null;
      addLog(next, 'Новая партия! Все вернулись в лобби.', 'system');
      break;
    }
  }

  return next;
}

/**
 * Submits player ranking for current active phase ('night' or 'voting').
 */
export function submitPlayerRanking(state: GameState, playerId: string, ranking: string[]): GameState {
  const next = { ...state };
  if (state.phase === 'night') {
    next.nightRankings = { ...next.nightRankings, [playerId]: ranking };
    next.submittedRankings = { ...next.submittedRankings, [playerId]: true };
  } else if (state.phase === 'voting') {
    next.votingRankings = { ...next.votingRankings, [playerId]: ranking };
    next.submittedRankings = { ...next.submittedRankings, [playerId]: true };
  }
  return next;
}

/**
 * Dev Panel & auto-complete helper: fills rankings for all bots who haven't submitted yet.
 */
export function autoCompleteBotRankings(state: GameState, config: GameConfig = GAME_CONFIG): GameState {
  const next = { ...state };
  const living = next.players.filter((p) => p.isAlive && p.isConnected);
  const maxDepth = living.length <= 6 ? living.length - 1 : config.RANK_DEPTH;

  for (const bot of living) {
    if (next.submittedRankings[bot.id]) continue;

    // Pick random living others
    const others = living.filter((p) => p.id !== bot.id).map((p) => p.id);
    // Shuffle
    const shuffled = [...others].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, Math.min(maxDepth, shuffled.length));

    if (next.phase === 'night') {
      next.nightRankings = { ...next.nightRankings, [bot.id]: chosen };
      next.submittedRankings = { ...next.submittedRankings, [bot.id]: true };
    } else if (next.phase === 'voting') {
      next.votingRankings = { ...next.votingRankings, [bot.id]: chosen };
      next.submittedRankings = { ...next.submittedRankings, [bot.id]: true };
    }
  }

  return next;
}

/**
 * Sends anonymous note from one player to another.
 */
export function sendAnonymousNote(
  state: GameState,
  fromId: string,
  toId: string,
  text: string,
  config: GameConfig = GAME_CONFIG
): GameState {
  const next = { ...state };
  const used = next.notesUsedToday[fromId] || 0;
  if (used >= config.NOTES_PER_DAY) {
    return state;
  }

  const newNote: AnonymousNote = {
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    fromId,
    toId,
    text,
    round: next.round,
    timestamp: Date.now(),
    read: false,
  };

  next.notes = [...next.notes, newNote];
  next.notesUsedToday = { ...next.notesUsedToday, [fromId]: used + 1 };
  return next;
}

/**
 * Marks role card as seen by player.
 */
export function markRoleSeen(state: GameState, playerId: string): GameState {
  const next = { ...state };
  next.players = next.players.map((p) => (p.id === playerId ? { ...p, roleSeen: true } : p));
  return next;
}

/**
 * Toggles or sets player connectivity.
 */
export function setPlayerConnected(state: GameState, playerId: string, isConnected: boolean): GameState {
  const next = { ...state };
  const player = next.players.find((p) => p.id === playerId);
  if (!player) return state;

  next.players = next.players.map((p) => (p.id === playerId ? { ...p, isConnected } : p));
  addLog(
    next,
    isConnected ? `Игрок ${player.name} подключился.` : `Игрок ${player.name} отключился.`,
    'action'
  );
  return next;
}

/**
 * Dev Panel force role assignment.
 */
export function forceAssignRole(state: GameState, playerId: string, newRole: Role): GameState {
  const next = { ...state };
  next.players = next.players.map((p) => (p.id === playerId ? { ...p, role: newRole } : p));
  addLog(next, `[DEV] Игроку принудительно назначена роль: ${newRole}`, 'system');
  return next;
}

/**
 * Generates the clean player projection (PlayerView).
 * Does not leak other players' roles!
 */
export function getPlayerView(state: GameState, playerId: string, config: GameConfig = GAME_CONFIG): PlayerView {
  const me = state.players.find((p) => p.id === playerId) || state.players[0];
  const living = state.players.filter((p) => p.isAlive);
  const maxDepth = living.length <= 6 ? living.length - 1 : config.RANK_DEPTH;

  // Active side counts: living players per side (disconnected alive still count as active!)
  const activeCitizensCount = living.filter((p) => p.role !== 'gangster' && p.role !== 'boss').length;
  const activeGangstersCount = living.filter((p) => p.role === 'gangster' || p.role === 'boss').length;

  // Sanitize other players (hide secret roles!)
  const otherPlayers = state.players
    .filter((p) => p.id !== me.id)
    .map((p) => ({
      id: p.id,
      name: p.name,
      avatarUrl: p.avatarUrl,
      isHost: p.isHost,
      isReady: p.isReady,
      isConnected: p.isConnected,
      isAlive: p.isAlive,
      eliminatedReason: p.eliminatedReason,
      eliminatedRound: p.eliminatedRound,
      roleSeen: p.roleSeen,
    }));

  const mySubmitted = !!state.submittedRankings[me.id];
  const myCurrentRanking =
    state.phase === 'night'
      ? state.nightRankings[me.id] || []
      : state.phase === 'voting'
      ? state.votingRankings[me.id] || []
      : [];

  // Check notice for morning_check
  const kidnappedId = state.lastNightOutcome?.prevented ? null : state.lastNightOutcome?.targetId || null;
  const checkNotice = calculateCheckNotice(me, state.players, state.nightRankings, kidnappedId);

  // Public Opinion zones are only visible during 'morning_pressure'
  const publicOpinionZones = state.phase === 'morning_pressure' ? state.shownZones : null;

  // Anonymous incoming notes for me today
  const myIncomingNotes = state.notes
    .filter((n) => n.toId === me.id && n.round === state.round)
    .map((n) => ({ id: n.id, text: n.text, timestamp: n.timestamp }));

  const notesUsed = state.notesUsedToday[me.id] || 0;
  const notesRemainingToday = Math.max(0, config.NOTES_PER_DAY - notesUsed);

  // Game over data (reveals all roles when phase is game_over)
  const gameOverData =
    state.phase === 'game_over' && state.winner
      ? {
          winner: state.winner,
          allPlayers: state.players,
          zoneHistory: state.zoneHistory,
          totalRounds: state.round,
        }
      : null;

  return {
    myPlayer: me,
    otherPlayers,
    activeCitizensCount,
    activeGangstersCount,
    phase: state.phase,
    round: state.round,
    phaseTimerRemaining: state.timerRemaining,
    phaseTimerDuration: state.timerDuration,
    mySubmitted,
    myCurrentRanking,
    maxRankDepth: maxDepth,
    nightOutcome: state.lastNightOutcome,
    votingOutcome: state.lastVotingOutcome,
    checkNotice,
    publicOpinionZones,
    myIncomingNotes,
    notesRemainingToday,
    gameOverData,
    isSpectator: !me.isAlive,
  };
}
