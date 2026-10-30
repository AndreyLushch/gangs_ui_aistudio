/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { GAME_CONFIG } from './config/gameConfig';
import { GamePhase, GameState, Role } from './types/game';
import {
  advancePhase,
  autoCompleteBotRankings,
  createInitialState,
  forceAssignRole,
  getPlayerView,
  markRoleSeen,
  sendAnonymousNote,
  setPlayerConnected,
  submitPlayerRanking,
} from './engine/stateMachine';
import { HeaderNav } from './components/HeaderNav';
import { RoleCard } from './components/RoleCard';
import { RulesModal } from './components/RulesModal';
import { DevPanel } from './components/DevPanel';

// Views
import { LobbyView } from './views/LobbyView';
import { Day0View } from './views/Day0View';
import { NightView } from './views/NightView';
import { MorningOutcomeView } from './views/MorningOutcomeView';
import { MorningCheckView } from './views/MorningCheckView';
import { MorningPressureView } from './views/MorningPressureView';
import { DayDiscussionView } from './views/DayDiscussionView';
import { VotingView } from './views/VotingView';
import { VotingOutcomeView } from './views/VotingOutcomeView';
import { GameOverView } from './views/GameOverView';
import { STRINGS } from './strings/ru';
import { EyeOff, AlertTriangle } from 'lucide-react';

export default function App() {
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(8));
  const [activeViewerId, setActiveViewerId] = useState<string>('p-1');
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isDevOpen, setIsDevOpen] = useState(false);
  const [connectionNotice, setConnectionNotice] = useState<string | null>(null);

  // Timer reference for ticking
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Derive current player view for the active viewer
  const playerView = getPlayerView(gameState, activeViewerId, GAME_CONFIG);

  // Ensure activeViewerId points to a valid player
  useEffect(() => {
    if (!gameState.players.some((p) => p.id === activeViewerId) && gameState.players.length > 0) {
      setActiveViewerId(gameState.players[0].id);
    }
  }, [gameState.players, activeViewerId]);

  // Main countdown timer loop
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (gameState.timerRemaining > 0 && gameState.phase !== 'lobby' && gameState.phase !== 'game_over') {
      timerRef.current = setInterval(() => {
        setGameState((prev) => {
          if (prev.timerRemaining <= 1) {
            // When timer hits 0, auto advance phase!
            // First auto-complete bot rankings if in night or voting
            let updated = prev;
            if (prev.phase === 'night' || prev.phase === 'voting') {
              updated = autoCompleteBotRankings(prev, GAME_CONFIG);
            }
            return advancePhase(updated, GAME_CONFIG);
          }
          return {
            ...prev,
            timerRemaining: prev.timerRemaining - 1,
          };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.phase, gameState.timerRemaining]);

  // Advance Phase action
  const handleAdvancePhase = () => {
    setGameState((prev) => {
      let stateToAdvance = prev;
      if (prev.phase === 'night' || prev.phase === 'voting') {
        stateToAdvance = autoCompleteBotRankings(prev, GAME_CONFIG);
      }
      return advancePhase(stateToAdvance, GAME_CONFIG);
    });
  };

  // Skip Timer action
  const handleSkipTimer = () => {
    setGameState((prev) => {
      let stateToAdvance = prev;
      if (prev.phase === 'night' || prev.phase === 'voting') {
        stateToAdvance = autoCompleteBotRankings(prev, GAME_CONFIG);
      }
      return advancePhase(stateToAdvance, GAME_CONFIG);
    });
  };

  // Change player count in lobby
  const handleChangePlayerCount = (newCount: number) => {
    setGameState(createInitialState(newCount, GAME_CONFIG));
  };

  // Switch perspective in dev panel
  const handleSwitchViewer = (playerId: string) => {
    setActiveViewerId(playerId);
  };

  // Submit Ranking for current player
  const handleSubmitRanking = (ranking: string[]) => {
    setGameState((prev) => submitPlayerRanking(prev, activeViewerId, ranking));
  };

  // Auto-complete bot rankings
  const handleAutoCompleteBots = () => {
    setGameState((prev) => autoCompleteBotRankings(prev, GAME_CONFIG));
  };

  // Send anonymous note
  const handleSendNote = (toId: string, text: string) => {
    setGameState((prev) => sendAnonymousNote(prev, activeViewerId, toId, text, GAME_CONFIG));
  };

  // Mark role card as seen
  const handleDismissRoleCard = () => {
    setGameState((prev) => markRoleSeen(prev, activeViewerId));
  };

  // Toggle player connection
  const handleToggleConnection = (playerId: string) => {
    const target = gameState.players.find((p) => p.id === playerId);
    if (!target) return;
    const nextStatus = !target.isConnected;
    setGameState((prev) => setPlayerConnected(prev, playerId, nextStatus));
    setConnectionNotice(
      nextStatus ? STRINGS.connection.reconnected(target.name) : STRINGS.connection.disconnected(target.name)
    );
    setTimeout(() => setConnectionNotice(null), 3500);
  };

  // Force assign role or simulate game over
  const handleForceAssignRole = (playerId: string, role: Role) => {
    if (playerId === 'all_gangsters_out') {
      setGameState((prev) => ({
        ...prev,
        phase: 'game_over',
        winner: 'citizens',
        timerDuration: 0,
        timerRemaining: 0,
        timerStartedAt: null,
      }));
      return;
    }
    if (playerId === 'all_citizens_out') {
      setGameState((prev) => ({
        ...prev,
        phase: 'game_over',
        winner: 'gangsters',
        timerDuration: 0,
        timerRemaining: 0,
        timerStartedAt: null,
      }));
      return;
    }
    setGameState((prev) => forceAssignRole(prev, playerId, role));
  };

  // Toggle ready status in lobby
  const handleToggleReady = () => {
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p) => (p.id === activeViewerId ? { ...p, isReady: !p.isReady } : p)),
    }));
  };

  // Update gangsters count in lobby
  const handleUpdateGangstersCount = (count: number) => {
    setGameState((prev) => ({
      ...prev,
      gangstersCount: count,
    }));
  };

  // Toggle special role enable state in lobby
  const handleToggleSpecialRole = (role: Role) => {
    setGameState((prev) => ({
      ...prev,
      enabledSpecialRoles: {
        ...prev.enabledSpecialRoles,
        [role]: prev.enabledSpecialRoles[role] === false ? true : false,
      },
    }));
  };

  // Determine if role card modal should show for active viewer
  // Show if phase is role_reveal OR if player missed seeing role (was disconnected/reconnected)
  const shouldShowRoleCard =
    (gameState.phase === 'role_reveal' && !playerView.myPlayer.roleSeen) ||
    (!playerView.myPlayer.roleSeen && gameState.phase !== 'lobby' && gameState.phase !== 'game_over');

  return (
    <div className="min-h-screen bg-[#0a0806] text-[#f5eedb] flex flex-col items-center">
      {/* Mobile container - 360-430px wide styled like a vintage comic book issue */}
      <div className="w-full max-w-[430px] min-h-screen flex flex-col bg-[#14100c] border-x-2 border-black shadow-[0_0_50px_rgba(0,0,0,0.9)] relative">
        {/* Header navigation bar with side counter & timer */}
        <HeaderNav
          citizensCount={playerView.activeCitizensCount}
          gangstersCount={playerView.activeGangstersCount}
          phase={playerView.phase}
          round={playerView.round}
          timerRemaining={playerView.phaseTimerRemaining}
          timerDuration={playerView.phaseTimerDuration}
          onOpenRules={() => setIsRulesOpen(true)}
          onToggleDevPanel={() => setIsDevOpen(!isDevOpen)}
          isDevOpen={isDevOpen}
        />

        {/* Connection Notice Toast */}
        {connectionNotice && (
          <div className="sticky top-[86px] z-30 mx-3 my-1.5 p-2 rounded-lg bg-[#b91c1c] text-[#fef3c7] text-xs font-comic font-black text-center shadow-[2px_2px_0px_#000] border-2 border-black animate-fade-in flex items-center justify-center gap-1.5">
            <AlertTriangle size={14} />
            <span>{connectionNotice}</span>
          </div>
        )}

        {/* Spectator Mode Banner */}
        {playerView.isSpectator && GAME_CONFIG.SPECTATOR_MODE && gameState.phase !== 'game_over' && (
          <div className="mx-3 mt-2 p-2.5 rounded-lg bg-[#241a13] border-2 border-black text-center space-y-0.5 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center justify-center gap-1.5 text-[#f87171] font-comic font-black text-xs">
              <EyeOff size={13} />
              <span>★ {STRINGS.spectator.banner} ★</span>
            </div>
            <p className="text-[11px] font-typewriter text-neutral-300 leading-tight">
              {STRINGS.spectator.subtitle}
            </p>
          </div>
        )}

        {/* Main Content View Container */}
        <main className="flex-1 px-3 py-3 pb-24 w-full">
          {/* 5.1 Lobby */}
          {playerView.phase === 'lobby' && (
            <LobbyView
              myPlayer={playerView.myPlayer}
              allPlayers={gameState.players}
              gangstersCount={gameState.gangstersCount}
              enabledSpecialRoles={gameState.enabledSpecialRoles}
              onUpdateGangstersCount={handleUpdateGangstersCount}
              onToggleSpecialRole={handleToggleSpecialRole}
              onToggleReady={handleToggleReady}
              onStartGame={handleAdvancePhase}
            />
          )}

          {/* 5.2 Role Reveal backdrop */}
          {playerView.phase === 'role_reveal' && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
              <div className="w-16 h-16 rounded-full border-4 border-[#f59e0b] border-t-transparent animate-spin" />
              <div className="space-y-1">
                <h2 className="text-xl font-comic font-black tracking-wide text-amber-200">
                  {STRINGS.roleReveal.signalTitle}
                </h2>
                <p className="text-xs font-typewriter text-neutral-400">
                  {STRINGS.roleReveal.signalSubtitle}
                </p>
              </div>
            </div>
          )}

          {/* 5.3 Day 0 (Acquaintance) */}
          {playerView.phase === 'day_0' && (
            <Day0View
              players={playerView.otherPlayers}
              onAdvanceToNight={handleAdvancePhase}
            />
          )}

          {/* 5.4 Night (Unified Ranking) */}
          {playerView.phase === 'night' && (
            <NightView
              candidates={playerView.otherPlayers}
              initialRanking={playerView.myCurrentRanking}
              maxDepth={playerView.maxRankDepth}
              isSubmitted={playerView.mySubmitted}
              onSubmit={handleSubmitRanking}
            />
          )}

          {/* 5.5.1 Morning Outcome */}
          {playerView.phase === 'morning_outcome' && (
            <MorningOutcomeView
              outcome={playerView.nightOutcome}
              onContinue={handleAdvancePhase}
            />
          )}

          {/* 5.5.2 Morning Check notice for Sheriff & Boss, or neutral card */}
          {playerView.phase === 'morning_check' && (
            <MorningCheckView
              checkNotice={playerView.checkNotice}
              remainingSeconds={playerView.phaseTimerRemaining}
              onContinue={handleAdvancePhase}
            />
          )}

          {/* 5.5.3 Morning Public Opinion zones (5 sec) */}
          {playerView.phase === 'morning_pressure' && playerView.publicOpinionZones && (
            <MorningPressureView
              livingPlayers={playerView.otherPlayers}
              myPlayer={playerView.myPlayer}
              zones={playerView.publicOpinionZones}
              remainingSeconds={playerView.phaseTimerRemaining}
              onContinue={handleAdvancePhase}
            />
          )}

          {/* 5.6 Day Discussion & anonymous notes */}
          {playerView.phase === 'day_discussion' && (
            <DayDiscussionView
              myPlayer={playerView.myPlayer}
              otherPlayers={playerView.otherPlayers}
              notesRemainingToday={playerView.notesRemainingToday}
              incomingNotes={playerView.myIncomingNotes}
              onSendNote={handleSendNote}
              onAdvanceToVoting={handleAdvancePhase}
            />
          )}

          {/* 5.7 Voting Ranking */}
          {playerView.phase === 'voting' && (
            <VotingView
              candidates={playerView.otherPlayers}
              initialRanking={playerView.myCurrentRanking}
              maxDepth={playerView.maxRankDepth}
              isSubmitted={playerView.mySubmitted}
              onSubmit={handleSubmitRanking}
            />
          )}

          {/* 5.7 Voting Outcome */}
          {playerView.phase === 'voting_outcome' && (
            <VotingOutcomeView
              outcome={playerView.votingOutcome}
              onContinue={handleAdvancePhase}
            />
          )}

          {/* 5.10 Game Over */}
          {playerView.phase === 'game_over' && playerView.gameOverData && (
            <GameOverView
              winner={playerView.gameOverData.winner}
              allPlayers={playerView.gameOverData.allPlayers}
              zoneHistory={playerView.gameOverData.zoneHistory}
              totalRounds={playerView.gameOverData.totalRounds}
              onPlayAgain={handleAdvancePhase}
            />
          )}
        </main>

        {/* 5.2 Role Card Modal Overlay with TTL countdown */}
        {shouldShowRoleCard && (
          <RoleCard
            role={playerView.myPlayer.role}
            ttlSeconds={GAME_CONFIG.ROLE_CARD_TTL}
            onDismiss={handleDismissRoleCard}
          />
        )}

        {/* 5.11 Rules Modal Overlay */}
        {isRulesOpen && <RulesModal onClose={() => setIsRulesOpen(false)} />}

        {/* 3. Dev & Simulation Panel Overlay */}
        <DevPanel
          state={gameState}
          activeViewerId={activeViewerId}
          isOpen={isDevOpen}
          onToggleOpen={() => setIsDevOpen(!isDevOpen)}
          onSwitchViewer={handleSwitchViewer}
          onChangePlayerCount={handleChangePlayerCount}
          onAdvancePhase={handleAdvancePhase}
          onSkipTimer={handleSkipTimer}
          onAutoCompleteBots={handleAutoCompleteBots}
          onToggleConnection={handleToggleConnection}
          onForceAssignRole={handleForceAssignRole}
        />
      </div>
    </div>
  );
}
