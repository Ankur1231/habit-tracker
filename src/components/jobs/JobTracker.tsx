'use client';

import { useState, useMemo, useOptimistic, startTransition } from 'react';
import type { User, Job, JobColumn } from '@/lib/types';
import JobModal from './JobModal';
import UserChip from '../auth/UserChip';
import {
  upsertJob as upsertJobAction,
  moveJob as moveJobAction,
  deleteJob as deleteJobAction,
  addColumn as addColumnAction,
  deleteColumn as deleteColumnAction,
  renameColumn as renameColumnAction,
  reorderColumns as reorderColumnsAction,
} from '@/app/actions/jobs';

interface Props {
  user: User;
  columns: JobColumn[];
  jobs: Job[];
}

// ── Optimistic reducers ───────────────────────────────────────────────────────

type JobAction =
  | { type: 'upsert'; job: Job }
  | { type: 'move'; jobId: string; columnId: string }
  | { type: 'delete'; jobId: string }
  | { type: 'deleteByColumn'; columnId: string };

type ColAction =
  | { type: 'add'; col: JobColumn }
  | { type: 'delete'; columnId: string }
  | { type: 'rename'; columnId: string; name: string }
  | { type: 'reorder'; orderedIds: string[] };

function jobReducer(state: Job[], action: JobAction): Job[] {
  switch (action.type) {
    case 'upsert': {
      const exists = state.some(j => j.id === action.job.id);
      return exists
        ? state.map(j => j.id === action.job.id ? action.job : j)
        : [...state, action.job];
    }
    case 'move':
      return state.map(j => j.id === action.jobId ? { ...j, column: action.columnId } : j);
    case 'delete':
      return state.filter(j => j.id !== action.jobId);
    case 'deleteByColumn':
      return state.filter(j => j.column !== action.columnId);
  }
}

function colReducer(state: JobColumn[], action: ColAction): JobColumn[] {
  switch (action.type) {
    case 'add':
      return [...state, action.col];
    case 'delete':
      return state.filter(c => c.id !== action.columnId);
    case 'rename':
      return state.map(c => c.id === action.columnId ? { ...c, name: action.name } : c);
    case 'reorder': {
      const map = new Map(state.map(c => [c.id, c]));
      return action.orderedIds.map(id => map.get(id)).filter(Boolean) as JobColumn[];
    }
  }
}

// ── Company avatar with deterministic hue ────────────────────────────────────

function CompanyMark({ company }: { company: string }) {
  const ch = (company || '?').trim().charAt(0).toUpperCase();
  let h = 0;
  for (let i = 0; i < (company || '').length; i++) {
    h = (h * 31 + company.charCodeAt(i)) >>> 0;
  }
  const hue = h % 360;
  return (
    <div style={{
      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `oklch(0.62 0.12 ${hue})`,
      color: '#0a0f1a', fontWeight: 800, fontSize: 13,
    }}>
      {ch}
    </div>
  );
}

type ModalState =
  | { mode: 'create'; columnId: string }
  | { mode: 'edit'; job: Job }
  | null;

const menuItemStyle: React.CSSProperties = {
  display: 'block', width: '100%', textAlign: 'left',
  padding: '8px 10px', borderRadius: 6,
  fontSize: 12.5, color: 'var(--ink)',
};

const COLUMN_PALETTE = ['#fb923c', '#facc15', '#22d3ee', '#f472b6', '#a3e635', '#94a3b8'];

export default function JobTracker({ user, columns, jobs }: Props) {
  const [optimisticJobs, dispatchJob] = useOptimistic(jobs, jobReducer);
  const [optimisticCols, dispatchCol] = useOptimistic(columns, colReducer);

  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [colMenu, setColMenu] = useState<string | null>(null);
  const [draggingJob, setDraggingJob] = useState<string | null>(null);
  const [draggingCol, setDraggingCol] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  // ── Mutation handlers ─────────────────────────────────────────────────────

  const upsertJob = (job: Job) => {
    startTransition(async () => {
      dispatchJob({ type: 'upsert', job });
      await upsertJobAction(job);
    });
  };

  const moveJob = (jobId: string, columnId: string) => {
    startTransition(async () => {
      dispatchJob({ type: 'move', jobId, columnId });
      await moveJobAction(jobId, columnId);
    });
  };

  const deleteJob = (jobId: string) => {
    startTransition(async () => {
      dispatchJob({ type: 'delete', jobId });
      await deleteJobAction(jobId);
    });
  };

  const addColumn = () => {
    const name = prompt('Column name?');
    if (!name) return;
    const tempId = `col-temp-${Date.now()}`;
    const color = COLUMN_PALETTE[optimisticCols.length % COLUMN_PALETTE.length];
    startTransition(async () => {
      dispatchCol({ type: 'add', col: { id: tempId, name, color, emoji: '■' } });
      await addColumnAction(name);
    });
  };

  const deleteColumn = (cid: string) => {
    if (!confirm('Delete column and all its jobs?')) return;
    setColMenu(null);
    startTransition(async () => {
      dispatchCol({ type: 'delete', columnId: cid });
      dispatchJob({ type: 'deleteByColumn', columnId: cid });
      await deleteColumnAction(cid);
    });
  };

  const renameColumn = (cid: string) => {
    const cur = optimisticCols.find(c => c.id === cid);
    const name = prompt('Rename column', cur?.name ?? '');
    if (!name) return;
    setColMenu(null);
    startTransition(async () => {
      dispatchCol({ type: 'rename', columnId: cid, name });
      await renameColumnAction(cid, name);
    });
  };

  const reorderColumns = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const cols = [...optimisticCols];
    const fromIdx = cols.findIndex(c => c.id === fromId);
    const toIdx = cols.findIndex(c => c.id === toId);
    if (fromIdx < 0 || toIdx < 0) return;
    const [moved] = cols.splice(fromIdx, 1);
    cols.splice(toIdx, 0, moved);
    const orderedIds = cols.map(c => c.id);
    startTransition(async () => {
      dispatchCol({ type: 'reorder', orderedIds });
      await reorderColumnsAction(orderedIds);
    });
  };

  // ── Filtering ─────────────────────────────────────────────────────────────

  const filterText = search.trim().toLowerCase();
  const jobsByCol = useMemo(() => {
    const map: Record<string, Job[]> = {};
    optimisticCols.forEach(c => { map[c.id] = []; });
    optimisticJobs.forEach(j => {
      if (filterText) {
        const hay = [j.company, j.position, j.tags].join(' ').toLowerCase();
        if (!hay.includes(filterText)) return;
      }
      if (!map[j.column]) map[j.column] = [];
      map[j.column].push(j);
    });
    return map;
  }, [optimisticCols, optimisticJobs, filterText]);

  return (
    <div
      onClick={() => colMenu && setColMenu(null)}
      style={{ padding: '24px 32px 48px', display: 'flex', flexDirection: 'column', gap: 18, minHeight: '100vh' }}
    >
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>
          Job hunt 2026
        </h1>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 11, color: 'var(--ink-mute)', letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 600 }}>
          {optimisticJobs.length} jobs · {optimisticCols.length} columns
        </div>
        <UserChip user={user} />
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{
          flex: '1 1 280px', maxWidth: 420,
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--panel)', border: '1px solid var(--line)',
          borderRadius: 10, padding: '8px 12px',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="var(--ink-mute)" strokeWidth="2" />
            <path d="M21 21l-4.3-4.3" stroke="var(--ink-mute)" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search company, tag, position…"
            style={{ flex: 1, background: 'transparent', border: 0, outline: 0, fontSize: 13, color: 'var(--ink)' }}
          />
        </div>

        <div style={{ flex: 1 }} />

        <button
          onClick={() => setModal({ mode: 'create', columnId: optimisticCols[0]?.id ?? '' })}
          style={{
            padding: '9px 14px', borderRadius: 10,
            background: 'var(--accent)', color: '#06150e',
            fontWeight: 700, fontSize: 12.5, letterSpacing: '.02em',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
          Add job
        </button>

        <button
          onClick={addColumn}
          style={{
            padding: '9px 14px', borderRadius: 10,
            background: 'var(--panel)', color: 'var(--ink)',
            border: '1px solid var(--line)',
            fontWeight: 600, fontSize: 12.5,
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add column
        </button>
      </div>

      {/* Board */}
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 12, alignItems: 'flex-start' }}>
        {optimisticCols.map((col: JobColumn) => {
          const colJobs = jobsByCol[col.id] ?? [];
          return (
            <div
              key={col.id}
              onDragOver={e => {
                e.preventDefault();
                if (draggingCol && draggingCol !== col.id) setDragOverCol(col.id);
                else if (draggingJob) setDragOverCol(col.id);
              }}
              onDragLeave={() => { if (dragOverCol === col.id) setDragOverCol(null); }}
              onDrop={e => {
                e.preventDefault();
                if (draggingJob) moveJob(draggingJob, col.id);
                else if (draggingCol) reorderColumns(draggingCol, col.id);
                setDraggingJob(null);
                setDraggingCol(null);
                setDragOverCol(null);
              }}
              style={{
                width: 280, flexShrink: 0,
                background: 'var(--bg-2)',
                border: dragOverCol === col.id ? '1px solid var(--accent)' : '1px solid var(--line)',
                boxShadow: dragOverCol === col.id ? '0 0 0 3px rgba(43,212,161,0.18)' : 'none',
                borderRadius: 14,
                display: 'flex', flexDirection: 'column',
                maxHeight: 'calc(100vh - 200px)',
                opacity: draggingCol === col.id ? 0.4 : 1,
                transition: 'opacity 140ms, box-shadow 140ms, border-color 140ms',
              }}
            >
              {/* Column header */}
              <div style={{
                padding: '10px 12px',
                borderTopLeftRadius: 14, borderTopRightRadius: 14,
                background: col.color,
                color: '#0a0f1a',
                display: 'flex', alignItems: 'center', gap: 8,
                fontWeight: 700, fontSize: 12, letterSpacing: '.1em',
                textTransform: 'uppercase',
                position: 'relative',
              }}>
                {/* Drag grip */}
                <span
                  draggable
                  onDragStart={e => {
                    e.stopPropagation();
                    setDraggingCol(col.id);
                    e.dataTransfer.effectAllowed = 'move';
                    try { e.dataTransfer.setData('text/plain', col.id); } catch (_) { /* */ }
                  }}
                  onDragEnd={() => { setDraggingCol(null); setDragOverCol(null); }}
                  title="Drag to reorder column"
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, cursor: 'grab', opacity: 0.7 }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="8" cy="6" r="1.6" /><circle cx="16" cy="6" r="1.6" />
                    <circle cx="8" cy="12" r="1.6" /><circle cx="16" cy="12" r="1.6" />
                    <circle cx="8" cy="18" r="1.6" /><circle cx="16" cy="18" r="1.6" />
                  </svg>
                </span>
                <span style={{ fontSize: 13, opacity: 0.9 }}>{col.emoji}</span>
                <span>{col.name}</span>
                <span style={{ opacity: 0.7, fontWeight: 600 }}>({colJobs.length})</span>
                <div style={{ flex: 1 }} />
                <button
                  onClick={e => { e.stopPropagation(); setColMenu(colMenu === col.id ? null : col.id); }}
                  style={{ width: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0a0f1a' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" />
                  </svg>
                </button>

                {colMenu === col.id && (
                  <div
                    onClick={e => e.stopPropagation()}
                    style={{
                      position: 'absolute', top: '100%', right: 8, marginTop: 4,
                      background: 'var(--panel-2)', border: '1px solid var(--line-2)',
                      borderRadius: 8, padding: 4, minWidth: 140,
                      zIndex: 20, color: 'var(--ink)',
                      boxShadow: '0 12px 28px -10px rgba(0,0,0,.6)',
                    }}
                  >
                    <button onClick={() => renameColumn(col.id)} style={menuItemStyle}>Rename</button>
                    <button onClick={() => deleteColumn(col.id)} style={{ ...menuItemStyle, color: '#ef4d6c' }}>Delete column</button>
                  </div>
                )}
              </div>

              {/* Cards */}
              <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', flex: 1, minHeight: 80 }}>
                {colJobs.map((j: Job) => (
                  <div
                    key={j.id}
                    draggable
                    onDragStart={() => setDraggingJob(j.id)}
                    onDragEnd={() => setDraggingJob(null)}
                    onClick={() => setModal({ mode: 'edit', job: j })}
                    style={{
                      background: 'var(--panel)',
                      border: '1px solid var(--line)',
                      borderLeft: `3px solid ${col.color}`,
                      borderRadius: 10,
                      padding: '10px 12px',
                      display: 'flex', flexDirection: 'column', gap: 6,
                      cursor: 'grab',
                      opacity: draggingJob === j.id ? 0.5 : 1,
                      transition: 'border-color 140ms',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--line-2)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--line)')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CompanyMark company={j.company} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {j.company}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--ink-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {j.position}
                        </div>
                      </div>
                    </div>
                    {(j.date || j.salary) && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, color: 'var(--ink-mute)' }}>
                        {j.date && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                              <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
                              <path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            {j.date}
                          </span>
                        )}
                        {j.salary && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ opacity: 0.6 }}>·</span>
                            ${j.salary}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add job button */}
              <button
                onClick={() => setModal({ mode: 'create', columnId: col.id })}
                style={{
                  margin: 10, marginTop: 0,
                  padding: '10px',
                  border: '1px dashed var(--line-2)',
                  borderRadius: 10,
                  background: 'transparent', color: 'var(--ink-dim)',
                  fontSize: 12.5, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
                </svg>
                Add job
              </button>
            </div>
          );
        })}
      </div>

      {modal && (
        <JobModal
          mode={modal.mode}
          job={modal.mode === 'edit' ? modal.job : undefined}
          defaultColumn={modal.mode === 'create' ? modal.columnId : undefined}
          columns={optimisticCols}
          onClose={() => setModal(null)}
          onSave={j => { upsertJob(j); setModal(null); }}
          onDelete={id => { deleteJob(id); setModal(null); }}
        />
      )}
    </div>
  );
}
