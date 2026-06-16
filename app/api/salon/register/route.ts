import { authClient } from '@/lib/auth-client'
import { db } from '@/lib/db'
import { salon } from '@/lib/db/schema'
import { NextRequest, NextResponse } from 'next/server'

function generateSalonCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, salonName, phone, address } = await request.json()

    // Create user account via Better Auth
    const signUpResponse = await fetch(new URL('/api/auth/sign-up', request.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    if (!signUpResponse.ok) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 400 })
    }

    const userData = await signUpResponse.json()
    const userId = userData.user?.id

    if (!userId) {
      return NextResponse.json({ error: 'User creation failed' }, { status: 400 })
    }

    // Create salon
    const newSalon = await db
      .insert(salon)
      .values({
        userId,
        name: salonName,
        phone,
        address,
        code: generateSalonCode(),
      })
      .returning()

    return NextResponse.json({ success: true, salon: newSalon[0] })
  } catch (error) {
    console.error('Sign up error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
