'use server'

import { refresh } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { parseHabitInput } from '@/lib/habitUtils'

async function requireUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return { supabase, user }
}

export async function addHabit(text: string): Promise<void> {
  const { supabase, user } = await requireUser()
  const { emoji, name } = parseHabitInput(text)

  // Get current max sort_order
  const { data: maxRow } = await supabase
    .from('habits')
    .select('sort_order')
    .eq('user_id', user.id)
    .is('archived_at', null)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const sort_order = (maxRow?.sort_order ?? -1) + 1

  await supabase.from('habits').insert({ user_id: user.id, emoji, name, sort_order })
  refresh()
}

export async function renameHabit(habitId: string, name: string): Promise<void> {
  const { supabase } = await requireUser()
  await supabase.from('habits').update({ name }).eq('id', habitId)
  refresh()
}

export async function setEmoji(habitId: string, emoji: string): Promise<void> {
  const { supabase } = await requireUser()
  await supabase.from('habits').update({ emoji }).eq('id', habitId)
  refresh()
}

export async function deleteHabit(habitId: string): Promise<void> {
  const { supabase } = await requireUser()
  // Soft delete via archived_at
  await supabase.from('habits').update({ archived_at: new Date().toISOString() }).eq('id', habitId)
  refresh()
}

export async function duplicateHabit(habitId: string): Promise<void> {
  const { supabase, user } = await requireUser()

  const { data: src } = await supabase
    .from('habits')
    .select('emoji, name, sort_order')
    .eq('id', habitId)
    .single()

  if (!src) return

  // Find the habit immediately after src to insert duplicate between them
  const { data: maxRow } = await supabase
    .from('habits')
    .select('sort_order')
    .eq('user_id', user.id)
    .is('archived_at', null)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const sort_order = (maxRow?.sort_order ?? src.sort_order) + 1

  await supabase.from('habits').insert({
    user_id: user.id,
    emoji: src.emoji,
    name: `${src.name} copy`,
    sort_order,
  })
  refresh()
}
