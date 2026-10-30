/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  FastForward,
  Shuffle,
  Users,
  Eye,
  EyeOff,
  Wifi,
  WifiOff,
  UserCheck,
  Terminal,
  Activity,
  Wrench,
} from 'lucide-react';
import { GamePhase, GameState, Player, Role } from '../types/game';
import { STRINGS } from '../strings/ru';
import { triggerHaptic } from '../utils/haptics';

interface DevPanelProps {
  state: GameState;
  activeViewerId: string;
  isOpen: boolean;
  onToggleOpen: () => void;
  onSwitchViewer: (playerId: string) => void;
  onChangePlayerCount: (count: number) => void;
  onAdvancePhase: () => void;
  onSkipTimer: () => void;
  onAutoCompleteBots: () => void;
  onToggleConnection: (playerId: string) => void;
  onForceAssignRole: (playerId: string, role: Role) => void;
}

export const DevPanel: React.FC<DevPanelProps> = ({
  state,
  activeViewerId,
  isOpen,
  onToggleOpen,
  onSwitchViewer,
  onChangePlayerCount,
  onAdvancePhase,
  onSkipTimer,
  onAutoCompleteBots,
  onToggleConnection,
  onForceAssignRole,
}) => {
  const [revealAllRoles, setRevealAllRoles] = useState(false);
  const [selectedRoleToAssign, setSelectedRoleToAssign] = useState<Role>('sheriff');
  const [activeTab, setActiveTab] = useState<'controls' | 'logs'>('controls');

  const currentViewer = state.players.find((p) => p.id === activeViewerId) || state.players[0];

  const allRolesList: Role[] = [
    'citizen',
    'sheriff',
    'watchman',
    'avenger',
    'press',
    'judge',
    'lawyer',
    'gangster',
    'boss',
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 max-w-lg mx-auto bg-[#181410] border-t-2 border-black shadow-[0_-4px_20px_rgba(0,0,0,0.8)]">
      {/* Dev panel header banner */}
      <div
        onClick={onToggleOpen}
        className="flex items-center justify-between px-3 py-2 bg-[#231e17] border-b-2 border-black cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <Wrench size={14} className="text-[#f59e0b]" />
          <span className="font-comic font-black text-xs tracking-wider text-amber-200">
            ★ ДЕТЕКТИВНЫЙ ПУЛЬТ УПРАВЛЕНИЯ ★
          </span>
          <span className="text-[10px] font-comic px-1.5 py-0.5 rounded bg-[#110e08] text-amber-300 border border-black">
            {currentViewer ? `ВИД: ${currentViewer.name}` : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-neutral-300 font-comic">
            {isOpen ? 'СВЕРНУТЬ' : 'РАЗВЕРНУТЬ'}
          </span>
          {isOpen ? (
            <ChevronDown size={16} className="text-amber-400" />
          ) : (
            <ChevronUp size={16} className="text-amber-400" />
          )}
        </div>
      </div>

      {/* Expanded panel body */}
      {isOpen && (
        <div className="p-3.5 space-y-3 max-h-[70vh] overflow-y-auto text-xs">
          {/* Tabs */}
          <div className="flex rounded-lg bg-[#110e08] p-1 border-2 border-black">
            <button
              type="button"
              onClick={() => setActiveTab('controls')}
              className={`flex-1 py-1 px-2 rounded-md font-comic font-black transition-colors ${
                activeTab === 'controls'
                  ? 'bg-[#f59e0b] text-[#110e08] shadow-[1px_1px_0px_#000]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              УПРАВЛЕНИЕ И СИМУЛЯЦИЯ
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('logs')}
              className={`flex-1 py-1 px-2 rounded-md font-comic font-black transition-colors ${
                activeTab === 'logs'
                  ? 'bg-[#f59e0b] text-[#110e08] shadow-[1px_1px_0px_#000]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              ЖУРНАЛ ДЕЛА ({state.eventLogs.length})
            </button>
          </div>

          {activeTab === 'controls' ? (
            <>
              {/* 1. Perspective Switcher */}
              <div className="space-y-1.5 bg-[#221c16] p-2.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000]">
                <div className="flex items-center justify-between text-neutral-300 font-comic">
                  <span className="flex items-center gap-1.5 text-amber-200">
                    <UserCheck size={13} className="text-[#f59e0b]" />
                    <span>СМОТРЕТЬ ГЛАЗАМИ:</span>
                  </span>
                  <span className="text-[#f59e0b] font-black">
                    {STRINGS.roles.names[currentViewer.role]} ({currentViewer.isAlive ? 'Жив' : 'Выбыл'})
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {state.players.map((p, idx) => {
                    const isSelected = p.id === activeViewerId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          triggerHaptic('selection');
                          onSwitchViewer(p.id);
                        }}
                        className={`p-1.5 rounded-md border-2 border-black text-left truncate transition-colors flex items-center justify-between font-comic shadow-[1px_1px_0px_#000] ${
                          isSelected
                            ? 'bg-[#f59e0b] text-[#110e08] font-black'
                            : 'bg-[#181410] text-neutral-300 hover:bg-[#2b241d]'
                        } ${!p.isAlive ? 'opacity-50 line-through' : ''}`}
                      >
                        <span className="truncate">#{idx + 1} {p.name.split(' ')[0]}</span>
                        {!p.isConnected && <WifiOff size={10} className="text-[#f87171] flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Phase & Timer controls */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('impact', 'medium');
                    onAdvancePhase();
                  }}
                  className="py-2 px-3 rounded-lg comic-btn-yellow font-comic text-xs flex items-center justify-center gap-1.5"
                >
                  <FastForward size={14} />
                  <span>{STRINGS.devPanel.nextPhaseBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('impact', 'light');
                    onSkipTimer();
                  }}
                  className="py-2 px-3 rounded-lg comic-btn-dark font-comic text-xs flex items-center justify-center gap-1.5"
                >
                  <Activity size={14} className="text-[#f87171]" />
                  <span>{STRINGS.devPanel.skipTimerBtn}</span>
                </button>
              </div>

              {/* Victory simulation shortcuts */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('impact', 'heavy');
                    onForceAssignRole('all_gangsters_out', 'citizen');
                  }}
                  className="py-1.5 px-2.5 rounded-lg bg-[#1b263b] hover:bg-[#233552] border-2 border-black text-[#7dd3fc] font-comic font-black text-xs shadow-[2px_2px_0px_#000] truncate"
                >
                  ПОБЕДА ГОРОЖАН
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('impact', 'heavy');
                    onForceAssignRole('all_citizens_out', 'gangster');
                  }}
                  className="py-1.5 px-2.5 rounded-lg bg-[#3e1319] hover:bg-[#521821] border-2 border-black text-[#fca5a5] font-comic font-black text-xs shadow-[2px_2px_0px_#000] truncate"
                >
                  ПОБЕДА ГАНГСТЕРОВ
                </button>
              </div>

              {/* 3. Auto-complete bot rankings */}
              {(state.phase === 'night' || state.phase === 'voting') && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('impact', 'medium');
                    onAutoCompleteBots();
                  }}
                  className="w-full py-2.5 px-3 rounded-lg bg-[#3b2813] hover:bg-[#4a3319] border-2 border-black text-amber-200 font-comic font-black text-xs flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000]"
                >
                  <Shuffle size={14} />
                  <span>{STRINGS.devPanel.fillRankingsBtn}</span>
                </button>
              )}

              {/* 4. Lobby count adjustment */}
              {state.phase === 'lobby' && (
                <div className="p-2.5 rounded-lg border-2 border-black bg-[#221c16] space-y-2 shadow-[2px_2px_0px_#000]">
                  <div className="flex items-center justify-between font-comic">
                    <span className="text-neutral-300">ЧИСЛО ИГРОКОВ N (4–25):</span>
                    <span className="text-[#f59e0b] font-black text-sm">{state.players.length}</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="25"
                    value={state.players.length}
                    onChange={(e) => onChangePlayerCount(Number(e.target.value))}
                    className="w-full accent-[#f59e0b] cursor-pointer"
                  />
                </div>
              )}

              {/* 5. Force assign role & connection toggle */}
              <div className="p-2.5 rounded-lg border-2 border-black bg-[#221c16] space-y-2 shadow-[2px_2px_0px_#000]">
                <div className="flex items-center justify-between font-comic text-neutral-300">
                  <span>ИГРОК: {currentViewer.name}</span>
                  <button
                    type="button"
                    onClick={() => onToggleConnection(currentViewer.id)}
                    className={`px-2 py-0.5 rounded border border-black text-[11px] font-comic font-black flex items-center gap-1 shadow-[1px_1px_0px_#000] ${
                      currentViewer.isConnected
                        ? 'bg-[#b91c1c] text-white'
                        : 'bg-[#15803d] text-white'
                    }`}
                  >
                    {currentViewer.isConnected ? <WifiOff size={11} /> : <Wifi size={11} />}
                    <span>{STRINGS.devPanel.reconnectToggle(currentViewer.isConnected)}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <select
                    value={selectedRoleToAssign}
                    onChange={(e) => setSelectedRoleToAssign(e.target.value as Role)}
                    className="flex-1 bg-[#110e08] border-2 border-black rounded-lg p-1.5 text-neutral-200 font-comic text-xs"
                  >
                    {allRolesList.map((r) => (
                      <option key={r} value={r}>
                        {STRINGS.roles.names[r]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('impact', 'medium');
                      onForceAssignRole(currentViewer.id, selectedRoleToAssign);
                    }}
                    className="px-3 py-1.5 rounded-lg comic-btn-yellow font-comic text-xs"
                  >
                    НАЗНАЧИТЬ
                  </button>
                </div>
              </div>

              {/* 6. Reveal all roles toggle */}
              <div className="p-2.5 rounded-lg border-2 border-black bg-[#221c16] space-y-2 shadow-[2px_2px_0px_#000]">
                <div className="flex items-center justify-between">
                  <span className="font-comic text-neutral-300">СЕКРЕТНЫЕ РОЛИ ВСЕХ:</span>
                  <button
                    type="button"
                    onClick={() => setRevealAllRoles(!revealAllRoles)}
                    className="px-2 py-1 rounded-md comic-btn-dark font-comic text-[11px] flex items-center gap-1.5"
                  >
                    {revealAllRoles ? <EyeOff size={12} /> : <Eye size={12} />}
                    <span>{revealAllRoles ? 'Скрыть' : STRINGS.devPanel.revealRolesBtn}</span>
                  </button>
                </div>

                {revealAllRoles && (
                  <div className="grid grid-cols-2 gap-1.5 pt-1 font-comic text-[11px] max-h-36 overflow-y-auto">
                    {state.players.map((p) => {
                      const isG = p.role === 'gangster' || p.role === 'boss';
                      return (
                        <div
                          key={p.id}
                          className={`p-1.5 rounded border border-black flex items-center justify-between shadow-[1px_1px_0px_#000] ${
                            isG
                              ? 'bg-[#3e1319] text-[#fca5a5]'
                              : 'bg-[#181410] text-[#e6ded1]'
                          } ${!p.isAlive ? 'line-through opacity-50' : ''}`}
                        >
                          <span className="truncate">{p.name.split(' ')[0]}</span>
                          <span className="font-black">{STRINGS.roles.names[p.role]}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Logs Tab */
            <div className="space-y-1.5 font-typewriter text-[11px] max-h-56 overflow-y-auto pr-1">
              {state.eventLogs.map((log) => {
                const color =
                  log.type === 'elimination'
                    ? 'text-[#f87171] bg-[#2b171a] border-black'
                    : log.type === 'action'
                    ? 'text-amber-200 bg-[#3b2813] border-black'
                    : 'text-neutral-200 bg-[#181410] border-black';

                return (
                  <div key={log.id} className={`p-2 rounded-lg border-2 ${color} space-y-0.5 shadow-[1px_1px_0px_#000]`}>
                    <div className="text-[10px] text-neutral-400 flex items-center justify-between font-comic">
                      <span>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                      <span className="uppercase">{log.phase}</span>
                    </div>
                    <div>{log.message}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
