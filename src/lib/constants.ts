import type { Habit, TweakValues } from './types';

export const DAY_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const WEEK_COLORS = ['--w1', '--w2', '--w3', '--w4', '--w5'];

export const DEFAULT_HABITS: Habit[] = [
  { id: 'h1', emoji: '🌅', name: 'Early start' },
  { id: 'h2', emoji: '💪', name: 'Gym or movement' },
  { id: 'h3', emoji: '📚', name: 'Learn something' },
  { id: 'h4', emoji: '📋', name: 'Plan top 3' },
  { id: 'h5', emoji: '💰', name: 'Track money' },
  { id: 'h6', emoji: '🎧', name: 'Deep work' },
  { id: 'h7', emoji: '🚫', name: 'Alcohol free' },
  { id: 'h8', emoji: '📵', name: 'No socials AM' },
  { id: 'h9', emoji: '📓', name: 'Journal' },
  { id: 'h10', emoji: '❄️', name: 'Cold shower' },
];

export const WEEK_SCHEMES: Record<string, string[] | null> = {
  rainbow: ['#8b5cf6', '#5aa7ff', '#2bd4a1', '#f472b6', '#4ade80'],
  cool: ['#7c5cff', '#5b8def', '#3bc4d9', '#2bd4a1', '#7ee787'],
  warm: ['#f472b6', '#fb7185', '#fb923c', '#f59e0b', '#facc15'],
  mono: null,
};

export const TWEAK_DEFAULTS: TweakValues = {
  accent: '#2bd4a1',
  weekScheme: 'rainbow',
  density: 'regular',
  checkStyle: 'fill',
  showMental: false,
  showAnalysis: true,
  showArea: true,
  radius: 14,
};

export const HABIT_EMOJI_GROUPS = [
  { label: 'Morning', emojis: ['🌅', '☀️', '🌞', '🌄', '⏰', '⭐', '✨', '🌙', '🌤️'] },
  { label: 'Move', emojis: ['💪', '🏃', '🚴', '🏋️', '🧘', '⚽', '🏊', '🥋', '🤸', '🚶'] },
  { label: 'Mind', emojis: ['📚', '📖', '🧠', '✏️', '📝', '🎓', '💡', '🔬', '🎨', '🎵'] },
  { label: 'Work', emojis: ['🎧', '💻', '📋', '✅', '📌', '🎯', '📊', '⚡', '🚀', '📂'] },
  { label: 'Money', emojis: ['💰', '💵', '💸', '🪙', '📈', '💳', '🏦', '📉'] },
  { label: 'Health', emojis: ['🥗', '🍎', '🥦', '💧', '🍵', '☕', '💊', '🧴', '🛌', '🧊'] },
  { label: 'Self', emojis: ['📓', '📔', '🧘‍♀️', '🛁', '🚿', '❄️', '🌿', '🕯️', '🧖', '💆'] },
  { label: 'Avoid', emojis: ['🚫', '📵', '🍺', '🍔', '📺', '🎮', '🛑', '❌', '⛔'] },
  {
    label: 'Other',
    emojis: ['🔥', '💎', '🌱', '🪴', '🐶', '🐱', '📷', '🎬', '✈️', '🏠', '❤️', '🙏', '😊'],
  },
];
