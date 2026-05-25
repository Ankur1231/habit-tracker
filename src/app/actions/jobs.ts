'use server'

import { refresh } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Job } from '@/lib/types'

async function requireUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return { supabase, user }
}

const COLUMN_PALETTE = ['#fb923c', '#facc15', '#22d3ee', '#f472b6', '#a3e635', '#94a3b8']

// ── Job mutations ─────────────────────────────────────────────────────────────

export async function upsertJob(job: Job): Promise<void> {
  const { supabase, user } = await requireUser()

  // Check if a row with this ID already exists in the DB
  const { data: existing } = await supabase
    .from('jobs')
    .select('id')
    .eq('id', job.id)
    .maybeSingle()

  if (existing) {
    // Update existing row
    await supabase
      .from('jobs')
      .update({
        column_id: job.column,
        company: job.company,
        position: job.position,
        description: job.description,
        salary: job.salary,
        location: job.location,
        url: job.url,
        tags: job.tags,
        date: job.date,
      })
      .eq('id', job.id)
  } else {
    // Insert — omit id so DB generates a real UUID
    await supabase.from('jobs').insert({
      user_id: user.id,
      column_id: job.column,
      company: job.company,
      position: job.position,
      description: job.description,
      salary: job.salary,
      location: job.location,
      url: job.url,
      tags: job.tags,
      date: job.date,
    })
  }

  refresh()
}

export async function moveJob(jobId: string, columnId: string): Promise<void> {
  const { supabase } = await requireUser()
  await supabase.from('jobs').update({ column_id: columnId }).eq('id', jobId)
  refresh()
}

export async function deleteJob(jobId: string): Promise<void> {
  const { supabase } = await requireUser()
  await supabase.from('jobs').delete().eq('id', jobId)
  refresh()
}

// ── Column mutations ──────────────────────────────────────────────────────────

export async function addColumn(name: string): Promise<void> {
  const { supabase, user } = await requireUser()

  // Get current max sort_order for positioning
  const { data: maxRow } = await supabase
    .from('job_columns')
    .select('sort_order')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const sort_order = (maxRow?.sort_order ?? -1) + 1
  const color = COLUMN_PALETTE[sort_order % COLUMN_PALETTE.length]

  await supabase.from('job_columns').insert({
    user_id: user.id,
    name,
    color,
    emoji: '■',
    sort_order,
  })
  refresh()
}

export async function deleteColumn(columnId: string): Promise<void> {
  const { supabase } = await requireUser()
  // ON DELETE CASCADE in DB handles deleting all jobs in this column
  await supabase.from('job_columns').delete().eq('id', columnId)
  refresh()
}

export async function renameColumn(columnId: string, name: string): Promise<void> {
  const { supabase } = await requireUser()
  await supabase.from('job_columns').update({ name }).eq('id', columnId)
  refresh()
}

export async function reorderColumns(orderedIds: string[]): Promise<void> {
  const { supabase, user } = await requireUser()
  const updates = orderedIds.map((id, i) =>
    supabase.from('job_columns').update({ sort_order: i }).eq('id', id).eq('user_id', user.id)
  )
  await Promise.all(updates)
  refresh()
}
