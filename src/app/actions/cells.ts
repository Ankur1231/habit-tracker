'use server'

import { refresh } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCellDateRelation } from '@/lib/habitUtils'

export async function toggleCell(
  habitId: string,
  year: number,
  month: number,
  day: number,
  currentValue: boolean
): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  if (getCellDateRelation(year, month, day, true) === 'future') {
    throw new Error('Cannot mark habits for future dates')
  }

  const done_on = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  if (currentValue) {
    // Un-tick: delete the completion
    await supabase
      .from('habit_completions')
      .delete()
      .eq('habit_id', habitId)
      .eq('done_on', done_on)
  } else {
    // Tick: insert (ignore conflict if somehow already exists)
    await supabase
      .from('habit_completions')
      .upsert({ habit_id: habitId, user_id: user.id, done_on }, { onConflict: 'habit_id,done_on' })
  }

  refresh()
}
