'use client';

import { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface MenuItem {
  icon?: 'copy' | 'pen' | 'trash';
  label?: string;
  onClick?: () => void;
  danger?: boolean;
  divider?: boolean;
}

interface Props {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

const icons = {
  copy: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <rect x="4.5" y="4.5" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M11 4V3a1 1 0 00-1-1H4a1 1 0 00-1 1v8a1 1 0 001 1h1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  pen: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M11.5 3L13 4.5L5.5 12L3 13L4 10.5L11.5 3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  trash: (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <path d="M3 4.5h10M6 4.5V3a1 1 0 011-1h2a1 1 0 011 1v1.5M4.5 4.5l.5 8a1 1 0 001 1h4a1 1 0 001-1l.5-8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export default function ContextMenu({ x, y, items, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: y, left: x });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const w = ref.current.offsetWidth;
    const h = ref.current.offsetHeight;
    let top = y, left = x;
    if (left + w > window.innerWidth - 8) left = window.innerWidth - w - 8;
    if (top + h > window.innerHeight - 8) top = Math.max(8, window.innerHeight - h - 8);
    setPos({ top, left });
  }, [x, y]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    function onScroll() { onClose(); }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('contextmenu', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('contextmenu', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [onClose]);

  if (typeof document === 'undefined') return null;
  return createPortal(
    <div ref={ref} role="menu" style={{
      position: 'fixed', top: pos.top, left: pos.left, zIndex: 2147483645,
      minWidth: 180, padding: 4,
      background: '#101a30',
      border: '1px solid var(--line-2)',
      borderRadius: 10,
      boxShadow: '0 16px 40px -10px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.02) inset',
      animation: 'ctx-in 90ms ease-out',
    }}>
      <style>{`
        @keyframes ctx-in {
          from { opacity: 0; transform: translateY(-3px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {items.map((it, i) => it.divider ? (
        <div key={`d-${i}`} style={{ height: 1, background: 'var(--line)', margin: '4px 6px' }} />
      ) : (
        <button key={i} onClick={it.onClick} role="menuitem" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          width: '100%', padding: '8px 10px',
          fontSize: 12.5,
          color: it.danger ? '#ef4d6c' : 'var(--ink)',
          borderRadius: 6,
          textAlign: 'left',
          background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.background = it.danger ? 'rgba(239,77,108,0.12)' : 'rgba(255,255,255,0.06)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
        >
          <span style={{ width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: it.danger ? '#ef4d6c' : 'var(--ink-dim)' }}>
            {it.icon && icons[it.icon]}
          </span>
          {it.label}
        </button>
      ))}
    </div>,
    document.body
  );
}
