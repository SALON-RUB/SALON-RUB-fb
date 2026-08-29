import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File) || file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Arquivo inválido ou maior que 5 MB' }, { status: 400 })
  const blob = await put(`subscriptions/${session.user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`, file, { access: 'private' })
  return NextResponse.json({ pathname: blob.pathname })
}
