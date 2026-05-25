'use client';

import { useState } from 'react';
import type { Job, JobColumn } from '@/lib/types';

interface Props {
  mode: 'create' | 'edit';
  job?: Job;
  defaultColumn?: string;
  columns: JobColumn[];
  onClose: () => void;
  onSave: (job: Job) => void;
  onDelete: (id: string) => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  background: 'var(--bg-2)',
  border: '1px solid var(--line)',
  borderRadius: 10,
  color: 'var(--ink)',
  fontSize: 13.5,
  outline: 'none',
  fontFamily: 'inherit',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-dim)', letterSpacing: '.04em' }}>
        {label}
      </span>
      {children}
    </label>
  );
}

export default function JobModal({ mode, job, defaultColumn, columns, onClose, onSave, onDelete }: Props) {
  const initial: Job = job ?? {
    id: `j-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    company: '',
    position: '',
    description: '',
    column: defaultColumn ?? columns[0]?.id ?? '',
    salary: '',
    location: '',
    url: '',
    tags: '',
    date: new Date().toLocaleString('en', { month: 'short', day: 'numeric' }),
  };

  const [form, setForm] = useState<Job>(initial);
  const [expanded, setExpanded] = useState(false);
  const [columnOpen, setColumnOpen] = useState(false);

  const set = (k: keyof Job) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const selectedCol = columns.find(c => c.id === form.column) ?? columns[0];

  const submit = () => {
    if (!form.company.trim() && !form.position.trim()) {
      alert('Add at least a company or position');
      return;
    }
    onSave(form);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(5,8,16,0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(820px, 96vw)', maxHeight: '92vh', overflowY: 'auto',
          background: 'var(--panel)', border: '1px solid var(--line)',
          borderRadius: 18, padding: '26px 30px 24px',
          boxShadow: '0 30px 80px -20px rgba(0,0,0,.7)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>
            {mode === 'edit' ? 'Edit Job' : 'Add New Job'}
          </h2>
          <button onClick={onClose} style={{ color: 'var(--ink-dim)', padding: 6 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Company + Position */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 16 }}>
          <Field label="Company Name">
            <input
              value={form.company}
              onChange={set('company')}
              placeholder="e.g., Google, Microsoft"
              style={inputStyle}
            />
          </Field>
          <Field label="Position">
            <input
              value={form.position}
              onChange={set('position')}
              placeholder="e.g., Software Engineer, PM"
              style={inputStyle}
            />
          </Field>
        </div>

        {/* Description */}
        <Field label="Description">
          <textarea
            value={form.description}
            onChange={set('description')}
            rows={5}
            placeholder="Describe the role, responsibilities, or notes…"
            style={{
              ...inputStyle,
              resize: 'vertical',
              fontStyle: form.description ? 'normal' : 'italic',
              lineHeight: 1.5,
              padding: '12px 14px',
            }}
          />
        </Field>

        {/* Column + Salary */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginTop: 16 }}>
          <Field label="Column">
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setColumnOpen(o => !o)}
                style={{
                  ...inputStyle,
                  display: 'flex', alignItems: 'center', gap: 10,
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: selectedCol?.color, flexShrink: 0 }} />
                <span style={{ flex: 1, color: 'var(--ink)' }}>{selectedCol?.name}</span>
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  style={{ transform: columnOpen ? 'rotate(180deg)' : '', transition: 'transform 160ms', flexShrink: 0 }}
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {columnOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                  background: 'var(--panel-2)', border: '1px solid var(--line-2)',
                  borderRadius: 10, padding: 6, zIndex: 5,
                  boxShadow: '0 12px 28px -10px rgba(0,0,0,.6)',
                }}>
                  {columns.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setForm(f => ({ ...f, column: c.id })); setColumnOpen(false); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 10px', borderRadius: 6, width: '100%', textAlign: 'left',
                        background: form.column === c.id ? 'rgba(255,255,255,0.04)' : 'transparent',
                        color: 'var(--ink)', fontSize: 13,
                      }}
                    >
                      <span style={{ width: 9, height: 9, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Field>
          <Field label="Salary">
            <input
              value={form.salary}
              onChange={set('salary')}
              placeholder="e.g., 75000 or Not Specified"
              style={inputStyle}
            />
          </Field>
        </div>

        {/* Expandable extra details */}
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            marginTop: 20, width: '100%',
            background: 'var(--bg-2)', border: '1px solid var(--line)',
            borderRadius: 12, padding: '14px 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: 14, fontWeight: 600, color: 'var(--ink)',
          }}
        >
          Show All Job Details
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            style={{ transform: expanded ? 'rotate(180deg)' : '', transition: 'transform 220ms' }}
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {expanded && (
          <div style={{
            marginTop: 12, padding: 18,
            border: '1px solid var(--line)', borderRadius: 12,
            background: 'var(--bg-2)',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
          }}>
            <Field label="Location">
              <input value={form.location} onChange={set('location')} placeholder="e.g., Remote, NYC" style={inputStyle} />
            </Field>
            <Field label="Posting URL">
              <input value={form.url} onChange={set('url')} placeholder="https://…" style={inputStyle} />
            </Field>
            <Field label="Tags">
              <input value={form.tags} onChange={set('tags')} placeholder="comma, separated, tags" style={inputStyle} />
            </Field>
            <Field label="Date">
              <input value={form.date} onChange={set('date')} placeholder="May 25" style={inputStyle} />
            </Field>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 10 }}>
          {mode === 'edit' && (
            <button
              onClick={() => onDelete(form.id)}
              style={{
                padding: '10px 14px', borderRadius: 10,
                color: '#ef4d6c', border: '1px solid rgba(239,77,108,0.3)',
                fontSize: 13, fontWeight: 600,
              }}
            >
              Delete
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button
            onClick={submit}
            style={{
              padding: '12px 22px', borderRadius: 12,
              background: 'var(--accent)', color: '#06150e',
              fontWeight: 700, fontSize: 14, letterSpacing: '.01em',
              boxShadow: '0 8px 24px -8px rgba(43,212,161,0.55)',
            }}
          >
            Save &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
}
