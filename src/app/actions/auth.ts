'use server'

import { signIn, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    redirect('/dashboard')
  } catch (error) {
    console.error('Login error:', error)
    return { error: 'Invalid email or password' }
  }
}

export async function logoutAction() {
  await signOut({ redirect: true, redirectTo: '/login' })
}
