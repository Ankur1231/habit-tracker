'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signIn(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }

  const d = new Date()
  redirect(`/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`)
}

const DEFAULT_JOB_COLUMNS = [
  { name: 'Wishlist',     color: '#5aa7ff', emoji: '★',  sort_order: 0 },
  { name: 'Applied',      color: '#8b5cf6', emoji: '➤', sort_order: 1 },
  { name: 'Interviewing', color: '#2bd4a1', emoji: '☏', sort_order: 2 },
  { name: 'Offers',       color: '#4ade80', emoji: '✓',  sort_order: 3 },
  { name: 'Rejected',     color: '#ef4d6c', emoji: '✕',  sort_order: 4 },
  { name: 'Ghosted',      color: '#6b7a99', emoji: '◌',  sort_order: 5 },
]

export async function signUp(
  _prev: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })
  if (error) return { error: error.message }

  // If email confirmation is required, session will be null — sign in instead
  if (!data.session) {
    // Try signing in immediately (works if email confirmation is disabled in Supabase dashboard)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (signInError || !signInData.session) {
      return { error: 'Account created! Please check your email to confirm your account, then sign in.' }
    }
  }

  // Seed the 6 default job columns for this new user
  const userId = data.user?.id
  if (userId) {
    await supabase.from('job_columns').insert(
      DEFAULT_JOB_COLUMNS.map(c => ({ ...c, user_id: userId }))
    )
  }

  const d = new Date()
  redirect(`/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`)
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
