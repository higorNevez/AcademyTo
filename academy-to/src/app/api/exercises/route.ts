import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.personalId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const exercises = await prisma.exercise.findMany({
    where: { personalId: session.user.personalId },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(exercises)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.personalId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const { name, muscleGroup, description, videoUrl, imageUrl } = body

  const exercise = await prisma.exercise.create({
    data: {
      personalId: session.user.personalId,
      name,
      muscleGroup,
      description,
      videoUrl,
      imageUrl,
    }
  })

  return NextResponse.json(exercise)
}
