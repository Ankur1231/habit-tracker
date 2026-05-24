'use server'

import { refresh } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function setMental(
  year: number,
  month: number,
  day: number,
  key: 'mood' | 'motivation',
  val: number
): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const logged_on = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

  await supabase
    .from('mental_logs')
    .upsert(
      { user_id: user.id, logged_on, [key]: val },
      { onConflict: 'user_id,logged_on' }
    )

  refresh()
}
