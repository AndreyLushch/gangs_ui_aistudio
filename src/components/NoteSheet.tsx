/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Send, X, MessageSquare, AlertCircle } from 'lucide-react';
import { STRINGS } from '../strings/ru';
import { triggerHaptic } from '../utils/haptics';

interface RecipientPlayer {
  id: string;
  name: string;
  avatarUrl: string;
}

interface NoteSheetProps {
  recipient: RecipientPlayer;
  remainingNotes: number;
  onSend: (toId: string, text: string) => void;
  onClose: () => void;
}

export const NoteSheet: React.FC<NoteSheetProps> = ({
  recipient,
  remainingNotes,
  onSend,
  onClose,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>(STRINGS.notesTemplates[0]);

  const handleSend = () => {
    if (remainingNotes <= 0) return;
    triggerHaptic('impact', 'medium');
    onSend(recipient.id, selectedTemplate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#181410] comic-border-lg rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        {/* Vintage Telegram Header */}
        <div className="flex items-center justify-between border-b-2 border-black/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#110e08] border-2 border-black overflow-hidden shadow-[2px_2px_0px_#000]">
              <img src={recipient.avatarUrl} alt={recipient.name} className="w-full h-full object-cover" />
            </div>
            <div className="text-left">
              <div className="text-[10px] font-comic tracking-wider text-amber-400">
                ★ ТАЙНАЯ ДЕПЕША ДЛЯ ★
              </div>
              <div className="text-base font-comic font-black text-[#f5eedb]">{recipient.name}</div>
            </div>
          </div>
          <button
            type="button"
            aria-label="Закрыть выбор записки"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#231e17] border-2 border-black text-neutral-300 hover:text-white shadow-[2px_2px_0px_#000]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Telegram Counter Notice */}
        <div className="flex items-center justify-between text-xs font-comic bg-[#110e0b] p-2.5 rounded-lg border-2 border-black shadow-[2px_2px_0px_#000]">
          <span className="text-amber-200">ЛИМИТ ДЕПЕШ НА СЕГОДНЯ:</span>
          <span className={`font-black text-sm ${remainingNotes > 0 ? 'text-[#f59e0b]' : 'text-[#f87171]'}`}>
            {STRINGS.discussion.notesRemaining(remainingNotes)}
          </span>
        </div>

        {/* Template choices (Vintage Paper) */}
        <div className="space-y-2">
          <div className="text-xs font-comic text-amber-200">
            ВЫБЕРИТЕ ТЕКСТ ПОСЛАНИЯ:
          </div>
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {STRINGS.notesTemplates.map((template, idx) => {
              const isSelected = selectedTemplate === template;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    triggerHaptic('selection');
                    setSelectedTemplate(template);
                  }}
                  className={`w-full p-2.5 rounded-lg text-left text-xs font-typewriter leading-relaxed border-2 border-black transition-all shadow-[2px_2px_0px_#000] ${
                    isSelected
                      ? 'bg-[#f59e0b] text-[#110e08] font-bold'
                      : 'comic-paper text-[#18140f] hover:bg-[#faedd3]'
                  }`}
                >
                  «{template}»
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-1">
          <button
            type="button"
            disabled={remainingNotes <= 0}
            onClick={handleSend}
            className="w-full min-h-[48px] py-3 px-4 rounded-xl font-comic text-sm tracking-wider comic-btn-yellow disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send size={15} />
            <span>{STRINGS.discussion.sendNoteBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
