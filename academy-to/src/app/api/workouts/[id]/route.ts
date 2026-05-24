import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.personalId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { name, description, type, muscleGroups, exercises } = body

  const workout = await prisma.workout.updateMany({
    where: { id, personalId: session.user.personalId },
    data: {
      name,
      description,
      type,
      muscleGroups,
    }
  })

  if (workout.count === 0) {
    return NextResponse.json({ error: 'Treino não encontrado' }, { status: 404 })
  }

  await prisma.workoutExercise.deleteMany({ where: { workoutId: id } })

  await prisma.workoutExercise.createMany({
    data: exercises.map((exercise: any, index: number) => ({
      workoutId: id,
      exerciseId: exercise.exerciseId,
      sets: exercise.sets,
      reps: exercise.reps,
      restSeconds: exercise.restSeconds,
      notes: exercise.notes,
      order: index,
    }))
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.personalId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  const deleted = await prisma.workout.deleteMany({
    where: { id, personalId: session.user.personalId }
  })

  if (deleted.count === 0) {
    return NextResponse.json({ error: 'Treino não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
