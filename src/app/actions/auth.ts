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

  const d = new Date()
  redirect(`/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}`)
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
