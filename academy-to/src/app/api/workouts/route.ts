import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.personalId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const workouts = await prisma.workout.findMany({
    where: { personalId: session.user.personalId },
    include: {
      exercises: {
        include: {
          exercise: true,
        },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json(workouts)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.personalId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const { name, description, type, muscleGroups, exercises } = body

  const workout = await prisma.workout.create({
    data: {
      personalId: session.user.personalId,
      name,
      description,
      type,
      muscleGroups,
      isActive: true,
      exercises: {
        create: exercises.map((exercise: any, index: number) => ({
          exerciseId: exercise.exerciseId,
          sets: exercise.sets,
          reps: exercise.reps,
          restSeconds: exercise.restSeconds,
          notes: exercise.notes,
          order: index,
        }))
      }
    },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { order: 'asc' }
      }
    }
  })

  return NextResponse.json(workout)
}
