/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameConfig } from '../config/gameConfig';
import { Player, PressureZone, Role, RoleSide, ZoneHistoryEntry } from '../types/game';

export interface NightCalculationResult {
  targetId: string | null;
  prevented: boolean;
  victimPlayer: Player | null;
}

export interface CheckNoticeResult {
  isRelevantRole: boolean;
  roleName?: string;
  title: string;
  result: string;
  subtitle?: string;
}

export interface VotingCalculationResult {
  targetId: string | null;
  acquitted: boolean;
  victimPlayer: Player | null;
}

export const ZONE_LEVELS: Record<PressureZone, number> = {
  trusted: 0, // 🟩
  neutral: 1, // 🟨
  questionable: 2, // 🟧
  suspicious: 3, // 🟥
};

export const LEVEL_TO_ZONE: PressureZone[] = ['trusted', 'neutral', 'questionable', 'suspicious'];

/**
 * Calculates the night kidnapping target and protection status.
 */
export function calculateNightKidnap(
  players: Player[],
  nightRankings: Record<string, string[]>,
  config: GameConfig
): NightCalculationResult {
  const livingPlayers = players.filter((p) => p.isAlive && p.isConnected);
  const livingIds = new Set(livingPlayers.map((p) => p.id));
  const n = livingPlayers.length;

  if (n === 0) {
    return { targetId: null, prevented: false, victimPlayer: null };
  }

  // 1. Tally target_score[j] = sum over gangsters and Boss of w * (N - k)
  const targetScores: Record<string, number> = {};
  for (const p of livingPlayers) {
    targetScores[p.id] = 0;
  }

  const gangstersAndBoss = players.filter(
    (p) => p.isAlive && p.isConnected && (p.role === 'gangster' || p.role === 'boss')
  );

  for (const gangster of gangstersAndBoss) {
    const rawRanking = nightRankings[gangster.id] || [];
    // Only rank living players
    const ranking = rawRanking.filter((id) => livingIds.has(id));
    const w = gangster.role === 'boss' ? 1.5 : 1.0;

    ranking.forEach((targetId, index) => {
      const k = index + 1; // 1-indexed
      const weight = Math.max(0, n - k);
      targetScores[targetId] = (targetScores[targetId] || 0) + w * weight;
    });
  }

  // Find max score among living players
  let maxScore = -1;
  let topCandidates: string[] = [];

  for (const [id, score] of Object.entries(targetScores)) {
    if (score > maxScore) {
      maxScore = score;
      topCandidates = [id];
    } else if (score === maxScore && score > 0) {
      topCandidates.push(id);
    }
  }

  // If no gangster votes, pick none or fallback
  if (topCandidates.length === 0 || maxScore <= 0) {
    // If no votes were cast by gangsters, no target is chosen
    return { targetId: null, prevented: false, victimPlayer: null };
  }

  // Random tie-break
  const chosenTargetId = topCandidates[Math.floor(Math.random() * topCandidates.length)];
  const targetPlayer = players.find((p) => p.id === chosenTargetId) || null;

  // 2. Check protections:
  // Living Watchman (cannot protect self) and living Avenger
  const protectedTargets = new Set<string>();

  for (const p of players) {
    if (!p.isAlive || !p.isConnected) continue;
    const rankList = (nightRankings[p.id] || []).filter((id) => livingIds.has(id));
    if (rankList.length === 0) continue;
    const rank1 = rankList[0];

    if (p.role === 'watchman') {
      // Night watchman cannot protect himself
      if (rank1 !== p.id) {
        protectedTargets.add(rank1);
      }
    } else if (p.role === 'avenger') {
      protectedTargets.add(rank1);
    }
  }

  const isProtected = protectedTargets.has(chosenTargetId);

  return {
    targetId: chosenTargetId,
    prevented: isProtected,
    victimPlayer: isProtected ? null : targetPlayer,
  };
}

/**
 * Calculates check notifications for Sheriff and Boss, or neutral card for others.
 */
export function calculateCheckNotice(
  viewer: Player,
  players: Player[],
  nightRankings: Record<string, string[]>,
  kidnappedId: string | null
): CheckNoticeResult {
  // If player was kidnapped tonight, they don't receive notice
  if (viewer.id === kidnappedId) {
    return {
      isRelevantRole: false,
      title: 'Город осматривает следы ночи',
      result: '...',
      subtitle: 'Вы не получили утреннее уведомление.',
    };
  }

  const livingPlayers = players.filter((p) => p.isAlive);
  const livingIds = new Set(livingPlayers.map((p) => p.id));
  const rawRanking = nightRankings[viewer.id] || [];
  const ranking = rawRanking.filter((id) => livingIds.has(id));
  const rank1Id = ranking[0];
  const targetPlayer = rank1Id ? players.find((p) => p.id === rank1Id) : null;

  if (viewer.role === 'sheriff') {
    if (!targetPlayer) {
      return {
        isRelevantRole: true,
        roleName: 'Шериф',
        title: 'Результат ночной проверки',
        result: 'Нет данных',
        subtitle: 'Вы не выбрали цель для проверки этой ночью.',
      };
    }

    const isGangsterSide = targetPlayer.role === 'gangster' || targetPlayer.role === 'boss';
    return {
      isRelevantRole: true,
      roleName: 'Шериф',
      title: 'Результат проверки Шерифа',
      result: isGangsterSide ? 'Подозрение подтвердилось' : 'Подозрение не подтвердилось',
      subtitle: `Проверен игрок ${targetPlayer.name} (ваше 1-е место).`,
    };
  }

  if (viewer.role === 'boss') {
    if (!targetPlayer) {
      return {
        isRelevantRole: true,
        roleName: 'Босс гангстеров',
        title: 'Проверка подозрения на Шерифа',
        result: 'Нет данных',
        subtitle: 'Вы не выбрали цель этой ночью.',
      };
    }

    const isSheriff = targetPlayer.role === 'sheriff';
    return {
      isRelevantRole: true,
      roleName: 'Босс гангстеров',
      title: 'Проверка на Шерифа',
      result: isSheriff ? 'Да' : 'Нет',
      subtitle: `Цель ${targetPlayer.name} (ваше 1-е место): Шериф ли это?`,
    };
  }

  // Neutral screen for all other roles with identical duration
  return {
    isRelevantRole: false,
    title: 'Город замер на рассвете',
    result: 'Сбор улик',
    subtitle: 'Полиция осматривает кварталы и опрашивает свидетелей ночных событий...',
  };
}

/**
 * Computes Public Opinion (Pressure) and assigns discrete zones with inertia, noise, and false spike.
 */
export function calculatePublicOpinion(
  players: Player[],
  nightRankings: Record<string, string[]>,
  currentPressureRaw: Record<string, number>,
  previousZones: Record<string, PressureZone>,
  round: number,
  config: GameConfig
): {
  newPressureRaw: Record<string, number>;
  newZones: Record<string, PressureZone>;
} {
  const living = players.filter((p) => p.isAlive && p.isConnected);
  const livingIds = living.map((p) => p.id);
  const n = living.length;

  const newPressureRaw: Record<string, number> = {};
  for (const id of livingIds) {
    // 1. Damping
    const prev = currentPressureRaw[id] || 0;
    newPressureRaw[id] = prev * config.PRESSURE_DAMPING;
  }

  // 2. Voter weight additions from Citizens, Press, Judge, Lawyers
  // Ranks of Gangsters, Boss, Sheriff, Watchmen DO NOT contribute!
  const contributingRoles: Role[] = ['citizen', 'press', 'judge', 'lawyer'];
  const voters = living.filter((p) => contributingRoles.includes(p.role));

  for (const voter of voters) {
    const rawRank = nightRankings[voter.id] || [];
    const validRank = rawRank.filter((id) => livingIds.includes(id));
    const w = voter.role === 'press' ? 2.0 : 1.0;

    const rankedSet = new Set(validRank);
    validRank.forEach((targetId, idx) => {
      const k = idx + 1;
      const weight = Math.max(0, n - k);
      newPressureRaw[targetId] = (newPressureRaw[targetId] || 0) + w * weight;
    });

    // Unranked living players get average weight of remaining unranked positions
    const unranked = livingIds.filter((id) => !rankedSet.has(id));
    if (unranked.length > 0) {
      const startPos = validRank.length + 1;
      let totalRemainingWeight = 0;
      for (let pos = startPos; pos <= n; pos++) {
        totalRemainingWeight += Math.max(0, n - pos);
      }
      const avgWeight = totalRemainingWeight / unranked.length;
      for (const targetId of unranked) {
        newPressureRaw[targetId] = (newPressureRaw[targetId] || 0) + w * avgWeight;
      }
    }
  }

  // 3. Noise +/- PRESSURE_NOISE of mean
  const allValues = Object.values(newPressureRaw);
  const meanVal = allValues.length > 0 ? allValues.reduce((a, b) => a + b, 0) / allValues.length : 1;

  for (const id of livingIds) {
    const noise = (Math.random() * 2 - 1) * config.PRESSURE_NOISE * meanVal;
    newPressureRaw[id] = Math.max(0, newPressureRaw[id] + noise);
  }

  // 4. Sort by pressure descending to determine percentiles (20%, 30%, 30%, 20%)
  const sorted = [...livingIds].sort((a, b) => newPressureRaw[b] - newPressureRaw[a]);

  // Compute boundaries
  // Always at least 1 in red zone!
  const countRed = Math.max(1, Math.round(n * config.PRESSURE_ZONES[0]));
  const countOrange = Math.round(n * config.PRESSURE_ZONES[1]);
  const countYellow = Math.round(n * config.PRESSURE_ZONES[2]);

  const targetLevelMap: Record<string, number> = {};
  sorted.forEach((id, idx) => {
    if (idx < countRed) {
      targetLevelMap[id] = ZONE_LEVELS.suspicious; // 3 (🟥)
    } else if (idx < countRed + countOrange) {
      targetLevelMap[id] = ZONE_LEVELS.questionable; // 2 (🟧)
    } else if (idx < countRed + countOrange + countYellow) {
      targetLevelMap[id] = ZONE_LEVELS.neutral; // 1 (🟨)
    } else {
      targetLevelMap[id] = ZONE_LEVELS.trusted; // 0 (🟩)
    }
  });

  // 5. False spike with probability PRESSURE_SPIKE_P on a random living player
  if (Math.random() < config.PRESSURE_SPIKE_P && livingIds.length > 0) {
    const spikeTarget = livingIds[Math.floor(Math.random() * livingIds.length)];
    // Shift up towards suspicious
    targetLevelMap[spikeTarget] = Math.min(3, targetLevelMap[spikeTarget] + 1);
  }

  // 6. Inertia: Zone cannot change by more than 1 step per round
  const newZones: Record<string, PressureZone> = {};
  for (const id of livingIds) {
    const prevZone = previousZones[id];
    const targetLvl = targetLevelMap[id];

    if (round <= 1 || !prevZone) {
      // First round or new player: direct assignment
      newZones[id] = LEVEL_TO_ZONE[targetLvl];
    } else {
      const prevLvl = ZONE_LEVELS[prevZone];
      let newLvl = targetLvl;
      if (targetLvl > prevLvl + 1) {
        newLvl = prevLvl + 1;
      } else if (targetLvl < prevLvl - 1) {
        newLvl = prevLvl - 1;
      }
      newZones[id] = LEVEL_TO_ZONE[newLvl];
    }
  }

  // Guarantee at least one 🟥 is present if there are living players
  const hasRed = Object.values(newZones).includes('suspicious');
  if (!hasRed && sorted.length > 0) {
    newZones[sorted[0]] = 'suspicious';
  }

  return { newPressureRaw, newZones };
}

/**
 * Calculates voting outcome with Judge multiplier, reputation zone multipliers, and Lawyer defense.
 */
export function calculateVoting(
  players: Player[],
  votingRankings: Record<string, string[]>,
  shownZones: Record<string, PressureZone>,
  zoneHistory: ZoneHistoryEntry[],
  config: GameConfig
): VotingCalculationResult {
  const living = players.filter((p) => p.isAlive && p.isConnected);
  const livingIds = new Set(living.map((p) => p.id));
  const n = living.length;

  if (n === 0) {
    return { targetId: null, acquitted: false, victimPlayer: null };
  }

  // 1. Identify Lawyers and their defendants (rank #1)
  const lawyerDefendants = new Set<string>();
  const lawyers = living.filter((p) => p.role === 'lawyer');
  for (const lawyer of lawyers) {
    const rawRanks = votingRankings[lawyer.id] || [];
    const validRanks = rawRanks.filter((id) => livingIds.has(id));
    if (validRanks.length > 0) {
      lawyerDefendants.add(validRanks[0]);
    }
  }

  // 2. Score calculation: vote_score[j] = (sum over voters except Lawyers of w * (N - k)) * ZONE_MULT[zone_j]
  const rawScores: Record<string, number> = {};
  for (const id of livingIds) {
    rawScores[id] = 0;
  }

  const voters = living.filter((p) => p.role !== 'lawyer');
  for (const voter of voters) {
    const rawRanks = votingRankings[voter.id] || [];
    const validRanks = rawRanks.filter((id) => livingIds.has(id));
    const w = voter.role === 'judge' ? 1.5 : 1.0;

    validRanks.forEach((targetId, idx) => {
      const k = idx + 1;
      const weight = Math.max(0, n - k);
      rawScores[targetId] = (rawScores[targetId] || 0) + w * weight;
    });
  }

  // Multiply by ZONE_MULT: [1.15, 1.05, 1.0, 0.95] for [red, orange, yellow, green]
  const zoneMultipliers: Record<PressureZone, number> = {
    suspicious: config.ZONE_MULT[0], // 1.15
    questionable: config.ZONE_MULT[1], // 1.05
    neutral: config.ZONE_MULT[2], // 1.0
    trusted: config.ZONE_MULT[3], // 0.95
  };

  const finalScores: Record<string, number> = {};
  for (const id of livingIds) {
    const zone = shownZones[id] || 'neutral';
    const mult = zoneMultipliers[zone] ?? 1.0;
    finalScores[id] = rawScores[id] * mult;
  }

  // Find max score
  let maxScore = -1;
  let leadingCandidates: string[] = [];

  for (const [id, score] of Object.entries(finalScores)) {
    if (score > maxScore) {
      maxScore = score;
      leadingCandidates = [id];
    } else if (score === maxScore && score > 0) {
      leadingCandidates.push(id);
    }
  }

  if (leadingCandidates.length === 0 || maxScore <= 0) {
    return { targetId: null, acquitted: false, victimPlayer: null };
  }

  let chosenTargetId: string;

  if (leadingCandidates.length === 1) {
    chosenTargetId = leadingCandidates[0];
  } else {
    // Tie-break:
    // 1) Higher in Judge's ranking
    let judgeTieResolved: string | null = null;
    const livingJudge = living.find((p) => p.role === 'judge');
    if (livingJudge) {
      const judgeRanks = (votingRankings[livingJudge.id] || []).filter((id) =>
        leadingCandidates.includes(id)
      );
      if (judgeRanks.length > 0) {
        judgeTieResolved = judgeRanks[0];
      }
    }

    if (judgeTieResolved) {
      chosenTargetId = judgeTieResolved;
    } else {
      // 2) Who was more frequently in 🟥 in last 2 mornings
      const redCounts: Record<string, number> = {};
      const recentRounds = zoneHistory.slice(-2);
      for (const candId of leadingCandidates) {
        redCounts[candId] = 0;
        for (const history of recentRounds) {
          if (history.zones[candId] === 'suspicious') {
            redCounts[candId]++;
          }
        }
      }

      const maxRedCount = Math.max(...Object.values(redCounts));
      const redLeaders = leadingCandidates.filter((id) => redCounts[id] === maxRedCount);

      if (redLeaders.length === 1) {
        chosenTargetId = redLeaders[0];
      } else {
        // 3) Random tie break
        chosenTargetId = redLeaders[Math.floor(Math.random() * redLeaders.length)];
      }
    }
  }

  // Check Lawyer defense!
  if (lawyerDefendants.has(chosenTargetId)) {
    // Acquitted! No one is jailed
    return {
      targetId: chosenTargetId,
      acquitted: true,
      victimPlayer: null,
    };
  }

  const targetPlayer = players.find((p) => p.id === chosenTargetId) || null;
  return {
    targetId: chosenTargetId,
    acquitted: false,
    victimPlayer: targetPlayer,
  };
}

/**
 * Checks win conditions:
 * - Citizens win if all gangsters are eliminated.
 * - Gangsters win if living gangsters >= living citizens.
 */
export function checkWinCondition(players: Player[]): RoleSide | null {
  const living = players.filter((p) => p.isAlive);
  const gangsters = living.filter((p) => p.role === 'gangster' || p.role === 'boss');
  const citizens = living.filter((p) => p.role !== 'gangster' && p.role !== 'boss');

  if (gangsters.length === 0) {
    return 'citizens';
  }
  if (gangsters.length >= citizens.length) {
    return 'gangsters';
  }
  return null;
}
