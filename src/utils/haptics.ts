/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Safe wrapper for Telegram Mini App HapticFeedback and Web Vibration API

type HapticStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
type NotificationType = 'error' | 'success' | 'warning';

interface TelegramWebApp {
  HapticFeedback?: {
    impactOccurred: (style: HapticStyle) => void;
    notificationOccurred: (type: NotificationType) => void;
    selectionChanged: () => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export function triggerHaptic(type: 'impact' | 'notification' | 'selection' = 'impact', style?: HapticStyle | NotificationType) {
  try {
    const tgHaptic = window.Telegram?.WebApp?.HapticFeedback;
    if (tgHaptic) {
      if (type === 'impact') {
        tgHaptic.impactOccurred((style as HapticStyle) || 'medium');
        return;
      }
      if (type === 'notification') {
        tgHaptic.notificationOccurred((style as NotificationType) || 'warning');
        return;
      }
      if (type === 'selection') {
        tgHaptic.selectionChanged();
        return;
      }
    }

    // Fallback to standard HTML5 navigator.vibrate
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      if (type === 'notification') {
        navigator.vibrate([100, 50, 100]);
      } else if (style === 'heavy') {
        navigator.vibrate(80);
      } else {
        navigator.vibrate(40);
      }
    }
  } catch {
    // Ignore unsupported device errors
  }
}

/**
 * Triggers an attention signal (vibration + audio chime fallback if desired)
 */
export function triggerAttentionSignal() {
  triggerHaptic('notification', 'warning');
}
