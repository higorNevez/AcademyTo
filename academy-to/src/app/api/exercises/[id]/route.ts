import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.personalId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const { name, muscleGroup, description, videoUrl, imageUrl } = body

  const updated = await prisma.exercise.updateMany({
    where: { id: params.id, personalId: session.user.personalId },
    data: { name, muscleGroup, description, videoUrl, imageUrl }
  })

  if (updated.count === 0) {
    return NextResponse.json({ error: 'Exercício não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.personalId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const deleted = await prisma.exercise.deleteMany({
    where: { id: params.id, personalId: session.user.personalId }
  })

  if (deleted.count === 0) {
    return NextResponse.json({ error: 'Exercício não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
