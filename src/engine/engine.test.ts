/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { GAME_CONFIG, getRoleDefaults, getUnlockedSpecialRoles } from '../config/gameConfig';
import {
  calculateCheckNotice,
  calculateNightKidnap,
  calculatePublicOpinion,
  calculateVoting,
  checkWinCondition,
} from './calculations';
import {
  advancePhase,
  createInitialState,
  distributeRoles,
  getPlayerView,
  submitPlayerRanking,
} from './stateMachine';
import { Player } from '../types/game';

function createMockPlayer(id: string, name: string, role: Player['role'], isAlive: boolean = true): Player {
  return {
    id,
    name,
    avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${id}`,
    isHost: id === 'p-1',
    isReady: true,
    isConnected: true,
    isAlive,
    role,
    roleSeen: true,
  };
}

test('Role defaults and balance rules correspond to the specification', () => {
  const d4 = getRoleDefaults(4);
  assert.equal(d4.totalGangsters, 1);
  assert.equal(d4.hasBoss, false);
  assert.equal(d4.sheriff, 0);

  const d5 = getRoleDefaults(5);
  assert.equal(d5.totalGangsters, 1);
  assert.equal(d5.sheriff, 1);

  const d8 = getRoleDefaults(8);
  assert.equal(d8.totalGangsters, 2);
  assert.equal(d8.hasBoss, true);
  assert.equal(d8.sheriff, 1);
  assert.equal(d8.press, 1);
  assert.equal(d8.watchman, 1);

  const d16 = getRoleDefaults(16);
  assert.equal(d16.totalGangsters, 4);
  assert.equal(d16.avenger, 1);
  assert.equal(d16.lawyer, 1);

  const d24 = getRoleDefaults(24);
  assert.equal(d24.totalGangsters, 6);
  assert.equal(d24.lawyer, 2);
});

test('Unlocked roles respect N thresholds', () => {
  const u4 = getUnlockedSpecialRoles(4);
  assert.equal(u4.sheriff, false);
  assert.equal(u4.boss, false);

  const u8 = getUnlockedSpecialRoles(8);
  assert.equal(u8.sheriff, true);
  assert.equal(u8.boss, true);
  assert.equal(u8.watchman, true);
  assert.equal(u8.judge, false);

  const u12 = getUnlockedSpecialRoles(12);
  assert.equal(u12.judge, true);
  assert.equal(u12.lawyer, true);
  assert.equal(u12.avenger, false);

  const u16 = getUnlockedSpecialRoles(16);
  assert.equal(u16.avenger, true);
});

test('Night kidnapping calculation targets highest score and respects Boss weight 1.5', () => {
  const p1 = createMockPlayer('p-1', 'Boss', 'boss');
  const p2 = createMockPlayer('p-2', 'Gangster', 'gangster');
  const p3 = createMockPlayer('p-3', 'Citizen A', 'citizen');
  const p4 = createMockPlayer('p-4', 'Citizen B', 'citizen');
  const p5 = createMockPlayer('p-5', 'Citizen C', 'citizen');

  const players = [p1, p2, p3, p4, p5];
  // Living = 5.
  // Boss votes p3 rank 1 (k=1: w=1.5 * (5 - 1) = 6.0)
  // Gangster votes p4 rank 1 (k=1: w=1.0 * (5 - 1) = 4.0), p3 rank 2 (k=2: w=1.0 * (5 - 2) = 3.0)
  // Target scores: p3 = 6.0 + 3.0 = 9.0; p4 = 4.0
  const nightRankings = {
    'p-1': ['p-3', 'p-4'],
    'p-2': ['p-4', 'p-3'],
  };

  const result = calculateNightKidnap(players, nightRankings, GAME_CONFIG);
  assert.equal(result.targetId, 'p-3');
  assert.equal(result.prevented, false);
  assert.equal(result.victimPlayer?.id, 'p-3');
});

test('Night Watchman protects target on rank 1, but cannot protect self', () => {
  const p1 = createMockPlayer('p-1', 'Gangster', 'gangster');
  const p2 = createMockPlayer('p-2', 'Watchman', 'watchman');
  const p3 = createMockPlayer('p-3', 'Target Victim', 'citizen');
  const players = [p1, p2, p3];

  // Gangster targets p3
  const rankings = {
    'p-1': ['p-3'],
    'p-2': ['p-3'], // Watchman guards p3
  };

  const resultProtected = calculateNightKidnap(players, rankings, GAME_CONFIG);
  assert.equal(resultProtected.targetId, 'p-3');
  assert.equal(resultProtected.prevented, true);
  assert.equal(resultProtected.victimPlayer, null);

  // Watchman tries to guard self: cannot guard self
  const rankingsSelfGuard = {
    'p-1': ['p-2'],
    'p-2': ['p-2'], // Watchman puts himself #1
  };
  const resultUnprotected = calculateNightKidnap(players, rankingsSelfGuard, GAME_CONFIG);
  assert.equal(resultUnprotected.targetId, 'p-2');
  assert.equal(resultUnprotected.prevented, false);
  assert.equal(resultUnprotected.victimPlayer?.id, 'p-2');
});

test('Sheriff check confirms gangster/boss, Boss check verifies sheriff', () => {
  const pSheriff = createMockPlayer('p-1', 'Sheriff', 'sheriff');
  const pBoss = createMockPlayer('p-2', 'Boss', 'boss');
  const pCitizen = createMockPlayer('p-3', 'Citizen', 'citizen');
  const pGangster = createMockPlayer('p-4', 'Gangster', 'gangster');

  const players = [pSheriff, pBoss, pCitizen, pGangster];

  // Sheriff ranks gangster #1
  const noticeSheriff = calculateCheckNotice(pSheriff, players, { 'p-1': ['p-4'] }, null);
  assert.equal(noticeSheriff.isRelevantRole, true);
  assert.equal(noticeSheriff.result, 'Подозрение подтвердилось');

  // Sheriff ranks citizen #1
  const noticeSheriffInnocent = calculateCheckNotice(pSheriff, players, { 'p-1': ['p-3'] }, null);
  assert.equal(noticeSheriffInnocent.result, 'Подозрение не подтвердилось');

  // Boss checks sheriff
  const noticeBossSuccess = calculateCheckNotice(pBoss, players, { 'p-2': ['p-1'] }, null);
  assert.equal(noticeBossSuccess.isRelevantRole, true);
  assert.equal(noticeBossSuccess.result, 'Да');

  // Boss checks citizen
  const noticeBossFail = calculateCheckNotice(pBoss, players, { 'p-2': ['p-3'] }, null);
  assert.equal(noticeBossFail.result, 'Нет');

  // Citizen sees neutral notice
  const noticeCitizen = calculateCheckNotice(pCitizen, players, {}, null);
  assert.equal(noticeCitizen.isRelevantRole, false);
  assert.equal(noticeCitizen.title, 'Город замер на рассвете');
});

test('Voting calculation applies Judge weight and Lawyer defense', () => {
  const p1 = createMockPlayer('p-1', 'Citizen A', 'citizen');
  const p2 = createMockPlayer('p-2', 'Citizen B', 'citizen');
  const pJudge = createMockPlayer('p-3', 'Judge', 'judge');
  const pLawyer = createMockPlayer('p-4', 'Lawyer', 'lawyer');
  const pVictim = createMockPlayer('p-5', 'Accused', 'citizen');

  const players = [p1, p2, pJudge, pLawyer, pVictim];
  const shownZones = {
    'p-5': 'suspicious' as const, // red zone multiplier: 1.15
  };

  // Case 1: Without Lawyer defense -> Accused is jailed
  const rankingsNoDefense = {
    'p-1': ['p-5'],
    'p-2': ['p-5'],
    'p-3': ['p-5'], // Judge vote w=1.5
    'p-4': ['p-1'], // Lawyer defends p-1
  };
  const voteResult = calculateVoting(players, rankingsNoDefense, shownZones, [], GAME_CONFIG);
  assert.equal(voteResult.targetId, 'p-5');
  assert.equal(voteResult.acquitted, false);
  assert.equal(voteResult.victimPlayer?.id, 'p-5');

  // Case 2: Lawyer puts p-5 as #1 defense -> Acquitted!
  const rankingsWithDefense = {
    'p-1': ['p-5'],
    'p-2': ['p-5'],
    'p-3': ['p-5'],
    'p-4': ['p-5'], // Lawyer defends accused!
  };
  const voteResultAcquitted = calculateVoting(players, rankingsWithDefense, shownZones, [], GAME_CONFIG);
  assert.equal(voteResultAcquitted.targetId, 'p-5');
  assert.equal(voteResultAcquitted.acquitted, true);
  assert.equal(voteResultAcquitted.victimPlayer, null);
});

test('Win conditions trigger correctly', () => {
  const g1 = createMockPlayer('p-1', 'Gangster 1', 'gangster', true);
  const c1 = createMockPlayer('p-2', 'Citizen 1', 'citizen', true);
  const c2 = createMockPlayer('p-3', 'Citizen 2', 'citizen', true);

  // Still active: 1 gangster, 2 citizens
  assert.equal(checkWinCondition([g1, c1, c2]), null);

  // Gangsters win when gangsters >= citizens
  const deadC2 = createMockPlayer('p-3', 'Citizen 2', 'citizen', false);
  assert.equal(checkWinCondition([g1, c1, deadC2]), 'gangsters');

  // Citizens win when all gangsters are dead
  const deadG1 = createMockPlayer('p-1', 'Gangster 1', 'gangster', false);
  assert.equal(checkWinCondition([deadG1, c1, c2]), 'citizens');
});

test('Player projection getPlayerView strips secret roles of other players', () => {
  const state = createInitialState(6);
  state.phase = 'night';
  const view = getPlayerView(state, state.players[0].id);

  assert.ok(view.myPlayer.role);
  // Other players MUST NOT contain role property!
  view.otherPlayers.forEach((other) => {
    assert.equal((other as any).role, undefined);
  });
});
