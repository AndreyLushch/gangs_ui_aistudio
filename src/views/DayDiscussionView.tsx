/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MessageSquare, Send, Bell, Gavel, X, User } from 'lucide-react';
import { Player } from '../types/game';
import { NoteSheet } from '../components/NoteSheet';
import { STRINGS } from '../strings/ru';
import { triggerHaptic } from '../utils/haptics';

interface DayDiscussionViewProps {
  myPlayer: Player;
  otherPlayers: Array<Omit<Player, 'role'>>;
  notesRemainingToday: number;
  incomingNotes: Array<{ id: string; text: string; timestamp: number }>;
  onSendNote: (toId: string, text: string) => void;
  onAdvanceToVoting: () => void;
}

export const DayDiscussionView: React.FC<DayDiscussionViewProps> = ({
  myPlayer,
  otherPlayers,
  notesRemainingToday,
  incomingNotes,
  onSendNote,
  onAdvanceToVoting,
}) => {
  const [selectedRecipient, setSelectedRecipient] = useState<Omit<Player, 'role'> | null>(null);
  const [dismissedNotes, setDismissedNotes] = useState<Set<string>>(new Set());

  const activeNotes = incomingNotes.filter((n) => !dismissedNotes.has(n.id));
  const livingOthers = otherPlayers.filter((p) => p.isAlive);

  return (
    <div className="space-y-4 pb-20 pt-1 max-w-md mx-auto">
      {/* Title */}
      <div className="text-center space-y-1 px-2">
        <div className="inline-block bg-[#f59e0b] text-[#110e08] font-comic font-black text-xs px-2.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_#000]">
          ЭПИЗОД • ДНЕВНОЕ СОБРАНИЕ
        </div>
        <h1 className="text-2xl font-comic font-black tracking-wide text-[#f5eedb]">
          {STRINGS.discussion.title}
        </h1>
        <p className="text-xs font-typewriter text-amber-200/80">
          {STRINGS.discussion.subtitle}
        </p>
      </div>

      {/* Incoming Anonymous Notes (Speech Bubble / Whisper effect) */}
      {activeNotes.length > 0 && (
        <div className="space-y-2">
          {activeNotes.map((note) => (
            <div
              key={note.id}
              className="p-3.5 rounded-xl comic-paper border-2 border-black shadow-[3px_3px_0px_#000] text-left space-y-2 relative"
            >
              <div className="flex items-center justify-between border-b border-[#c4ad85] pb-1.5">
                <div className="flex items-center gap-1.5 text-[#b91c1c] font-comic font-black text-xs">
                  <Bell size={14} className="animate-bounce" />
                  <span>★ {STRINGS.discussion.incomingNotesTitle} ★</span>
                </div>
                <button
                  type="button"
                  aria-label="Скрыть полученную записку"
                  onClick={() => {
                    triggerHaptic('impact', 'light');
                    setDismissedNotes((prev) => new Set([...prev, note.id]));
                  }}
                  className="w-6 h-6 rounded-md bg-[#181410] text-amber-200 hover:text-white flex items-center justify-center border border-black shadow-[1px_1px_0px_#000]"
                >
                  <X size={13} />
                </button>
              </div>

              <div className="p-2.5 rounded bg-white/70 border border-[#a89070] text-xs font-typewriter text-[#18140f] italic font-bold">
                «{note.text}»
              </div>

              <div className="text-[10px] text-[#6b5841] text-right font-typewriter">
                {STRINGS.discussion.noteReceivedAt}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notes allowance status */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-[#181410] border-2 border-black text-xs font-comic shadow-[2px_2px_0px_#000]">
        <span className="text-amber-200 flex items-center gap-1.5">
          <MessageSquare size={14} className="text-[#f59e0b]" />
          <span>ТАЙНЫЕ ДЕПЕШИ:</span>
        </span>
        <span className={`font-black text-sm ${notesRemainingToday > 0 ? 'text-[#f59e0b]' : 'text-neutral-500'}`}>
          ОСТАЛОСЬ: {notesRemainingToday}
        </span>
      </div>

      {/* Players grid to select note recipient */}
      <div className="bg-[#181410] comic-border rounded-xl p-3 sm:p-4 space-y-3">
        <div className="text-xs font-comic text-amber-200 text-left border-b-2 border-black/80 pb-1.5">
          ВЫБЕРИТЕ ГОРОЖАНИНА, ЧТОБЫ ПЕРЕДАТЬ ЕМУ ЗАПИСКУ:
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
          {livingOthers.map((player) => (
            <button
              key={player.id}
              type="button"
              disabled={notesRemainingToday <= 0}
              onClick={() => {
                triggerHaptic('selection');
                setSelectedRecipient(player);
              }}
              className="p-2 rounded-lg border-2 border-black bg-[#221c16] hover:bg-[#34291c] text-left transition-all flex items-center justify-between gap-2 shadow-[2px_2px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-40"
            >
              <div className="flex items-center gap-2 truncate">
                <div className="w-8 h-8 rounded-full bg-[#110e08] border-2 border-black overflow-hidden flex-shrink-0 shadow-[1px_1px_0px_#000]">
                  <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-comic font-bold text-neutral-200 truncate">
                    {player.name}
                  </div>
                </div>
              </div>

              <Send size={13} className="text-amber-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Advance to Court Voting Comic Button */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('impact', 'heavy');
            onAdvanceToVoting();
          }}
          className="w-full min-h-[50px] py-3 px-6 rounded-xl font-comic text-sm tracking-wider comic-btn-yellow flex items-center justify-center gap-2"
        >
          <Gavel size={17} />
          <span>ПЕРЕЙТИ К СУДУ ПРИСЯЖНЫХ (ГОЛОСОВАНИЕ)</span>
        </button>
      </div>

      {/* Note composer sheet modal */}
      {selectedRecipient && (
        <NoteSheet
          recipient={selectedRecipient}
          remainingNotes={notesRemainingToday}
          onSend={(toId, text) => {
            onSendNote(toId, text);
            setSelectedRecipient(null);
          }}
          onClose={() => setSelectedRecipient(null)}
        />
      )}
    </div>
  );
};
