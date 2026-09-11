import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) return NextResponse.json({ error: 'Selecione uma imagem.' }, { status: 400 })
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'O arquivo precisa ser uma imagem.' }, { status: 400 })
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'A imagem deve ter no máximo 5 MB.' }, { status: 400 })

  try {
    const blob = await put(`services/${session.user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`, file, { access: 'public', addRandomSuffix: false })
    return NextResponse.json({ url: blob.url })
  } catch (error) {
    console.error('[v0] Falha no upload da imagem:', error)
    return NextResponse.json({ error: 'Não foi possível armazenar a imagem agora. Tente novamente.' }, { status: 503 })
  }
}
