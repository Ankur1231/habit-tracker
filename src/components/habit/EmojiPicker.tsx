'use client';

import { useState, useMemo } from 'react';
import { HABIT_EMOJI_GROUPS } from '@/lib/constants';

interface Props {
  current: string;
  onPick: (emoji: string) => void;
  onClose: () => void;
}

export default function EmojiPicker({ current, onPick, onClose }: Props) {
  const [custom, setCustom] = useState('');
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    if (!query.trim()) return HABIT_EMOJI_GROUPS;
    const q = query.trim().toLowerCase();
    return HABIT_EMOJI_GROUPS
      .map((g) => ({ ...g, emojis: g.label.toLowerCase().includes(q) ? g.emojis : [] }))
      .filter((g) => g.emojis.length);
  }, [query]);

  return (
    <div role="dialog" aria-label="Pick emoji" style={{
      width: 280, padding: 10,
      background: '#101a30',
      border: '1px solid var(--line-2)',
      borderRadius: 12,
      boxShadow: '0 16px 40px -10px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.02) inset',
    }} onClick={(e) => e.stopPropagation()}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '2px 4px 8px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-mute)' }}>
          Pick an emoji
        </div>
        <button onClick={onClose} aria-label="close" style={{
          width: 22, height: 22, borderRadius: 5, color: 'var(--ink-mute)', fontSize: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'none', border: 'none', cursor: 'pointer',
        }}>×</button>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter category…"
        style={{
          width: '100%', background: '#0a1224', border: '1px solid var(--line)',
          color: 'var(--ink)', fontSize: 12, padding: '7px 10px',
          borderRadius: 8, outline: 'none', marginBottom: 8, fontFamily: 'inherit',
          boxSizing: 'border-box',
        }}
      />
      <div style={{ maxHeight: 260, overflowY: 'auto', paddingRight: 2 }}>
        {groups.map((g) => (
          <div key={g.label} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--ink-mute)', letterSpacing: '.1em', textTransform: 'uppercase', padding: '4px 4px 6px', fontWeight: 600 }}>
              {g.label}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 2 }}>
              {g.emojis.map((em) => (
                <button
                  key={em}
                  onClick={() => onPick(em)}
                  title={em}
                  style={{
                    width: 30, height: 30, borderRadius: 6,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 17, lineHeight: 1, padding: 0,
                    background: em === current ? 'var(--accent)' : 'rgba(255,255,255,0.02)',
                    border: '1px solid ' + (em === current ? 'var(--accent)' : 'transparent'),
                    color: em === current ? '#0a0f1a' : 'var(--ink)',
                    transition: 'background 120ms, transform 120ms',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = em === current ? 'var(--accent)' : 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'scale(1.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = em === current ? 'var(--accent)' : 'rgba(255,255,255,0.02)'; e.currentTarget.style.transform = 'scale(1)'; }}
                >{em}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); const v = custom.trim(); if (v) onPick(v); }}
        style={{ display: 'flex', gap: 6, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--line)' }}
      >
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Or paste your own…"
          maxLength={8}
          style={{
            flex: 1, background: '#0a1224', border: '1px solid var(--line)',
            color: 'var(--ink)', fontSize: 14, padding: '7px 10px',
            borderRadius: 8, outline: 'none', fontFamily: 'inherit',
          }}
        />
        <button type="submit" style={{
          background: 'var(--accent)', color: '#0a0f1a',
          fontWeight: 700, fontSize: 11, letterSpacing: '.04em',
          padding: '7px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        }}>Use</button>
      </form>
    </div>
  );
}
