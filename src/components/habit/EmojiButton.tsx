'use client';

import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { createPortal } from 'react-dom';
import EmojiPicker from './EmojiPicker';

interface Props {
  emoji: string;
  onPick: (emoji: string) => void;
}

export default function EmojiButton({ emoji, onPick }: Props) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    const popW = 280;
    const popH = 360;
    let left = r.left;
    let top = r.bottom + 6;
    if (left + popW > window.innerWidth - 8) left = window.innerWidth - popW - 8;
    if (top + popH > window.innerHeight - 8) top = Math.max(8, r.top - popH - 6);
    setPos({ top, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (btnRef.current?.contains(e.target as Node)) return;
      if (popRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    function onResize() { setOpen(false); }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        title="Change emoji"
        style={{
          width: 26, height: 26, borderRadius: 6,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, lineHeight: 1, padding: 0,
          background: open ? 'rgba(255,255,255,0.06)' : 'transparent',
          border: open ? '1px solid var(--line-2)' : '1px solid transparent',
          transition: 'background 120ms, border-color 120ms',
          cursor: 'pointer', flexShrink: 0,
        }}
      >{emoji}</button>
      {open && typeof document !== 'undefined' && createPortal(
        <div ref={popRef} style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 2147483645 }}>
          <EmojiPicker
            current={emoji}
            onClose={() => setOpen(false)}
            onPick={(em) => { onPick(em); setOpen(false); }}
          />
        </div>,
        document.body
      )}
    </>
  );
}
