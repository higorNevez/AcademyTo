import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const session = await getServerSession(authOptions)
  const { studentId } = await params

  if (!session?.user?.personalId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await request.json()
  const workoutIds = Array.isArray(body.workoutIds)
    ? body.workoutIds.filter((id: unknown): id is string => typeof id === 'string')
    : []
  const uniqueWorkoutIds = Array.from(new Set(workoutIds)) as string[]

  if (uniqueWorkoutIds.length === 0) {
    return NextResponse.json({ error: 'Nenhum treino selecionado' }, { status: 400 })
  }

  const student = await prisma.student.findFirst({
    where: {
      id: studentId,
      personalId: session.user.personalId,
    },
  })

  if (!student) {
    return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })
  }

  const workouts = await prisma.workout.findMany({
    where: {
      id: { in: uniqueWorkoutIds },
      personalId: session.user.personalId,
    },
  })

  if (workouts.length !== uniqueWorkoutIds.length) {
    return NextResponse.json({ error: 'Alguns treinos não pertencem a este personal' }, { status: 400 })
  }

  const existingQueue = await prisma.workoutQueue.findUnique({
    where: { studentId },
    include: { items: true },
  })

  const existingWorkoutIds = existingQueue?.items.map((item) => item.workoutId) ?? []
  const workoutsToAdd = uniqueWorkoutIds.filter(
    (workoutId) => !existingWorkoutIds.includes(workoutId)
  )

  if (workoutsToAdd.length === 0) {
    return NextResponse.json({ error: 'Os treinos selecionados já estão na fila do aluno' }, { status: 400 })
  }

  if (!existingQueue) {
    await prisma.workoutQueue.create({
      data: {
        studentId,
        currentIndex: 0,
        items: {
          create: workoutsToAdd.map((workoutId, index) => ({
            workoutId,
            order: index,
          })),
        },
      },
    })
  } else {
    const nextOrder = existingQueue.items.length
    await prisma.workoutQueueItem.createMany({
      data: workoutsToAdd.map((workoutId, index) => ({
        queueId: existingQueue.id,
        workoutId,
        order: nextOrder + index,
      })),
    })
  }

  return NextResponse.json({ message: 'Fila de treinos atualizada com sucesso' })
}
