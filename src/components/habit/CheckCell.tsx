'use client';

import type { CheckStyle } from '@/lib/types';

interface Props {
  checked: boolean;
  color: string;
  style?: CheckStyle;
  disabled?: boolean;
  title?: string;
  onClick: () => void;
}

export default function CheckCell({ checked, color, style = 'fill', disabled = false, title, onClick }: Props) {
  const isFill = style === 'fill';
  const isBox = style === 'box';
  const isDot = style === 'dot';

  const base: React.CSSProperties = {
    width: 22, height: 22, borderRadius: 5,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.35 : 1,
    transition: 'all 140ms',
    border: 'none', background: 'none', padding: 0,
  };

  let look: React.CSSProperties;
  if (checked) {
    if (isFill) look = { background: color, border: `1.5px solid ${color}`, borderRadius: 5 };
    else if (isBox) look = { background: 'transparent', border: `1.5px solid ${color}`, borderRadius: 5, color };
    else look = { background: 'rgba(255,255,255,0.04)', border: `1.5px solid ${color}`, borderRadius: 5 };
  } else {
    look = { background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.10)', borderRadius: 5 };
  }

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-pressed={checked}
      aria-disabled={disabled}
      title={title}
      style={{ ...base, ...look }}
    >
      {checked && isFill && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#0a0f1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {checked && isBox && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 6L5 8.5L9.5 3.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {checked && isDot && (
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'block' }} />
      )}
    </button>
  );
}
