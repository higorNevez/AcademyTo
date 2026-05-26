import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const measurementSchema = z.object({
  height: z.number().optional(),
  weight: z.number().optional(),
  bodyFat: z.number().optional(),
  shoulders: z.number().optional(),
  back: z.number().optional(),
  leftArm: z.number().optional(),
  rightArm: z.number().optional(),
  leftForearm: z.number().optional(),
  rightForearm: z.number().optional(),
  chest: z.number().optional(),
  waist: z.number().optional(),
  hips: z.number().optional(),
  leftThigh: z.number().optional(),
  rightThigh: z.number().optional(),
  leftCalf: z.number().optional(),
  rightCalf: z.number().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.studentId) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const validated = measurementSchema.parse(body)

    const measurement = await prisma.measurement.create({
      data: {
        studentId: session.user.studentId,
        ...validated,
      },
    })

    if (validated.height !== undefined) {
      await prisma.student.update({
        where: { id: session.user.studentId },
        data: { height: validated.height },
      })
    }

    return NextResponse.json({ message: 'Medição registrada', measurement })
  } catch (error) {
    console.error('Erro ao registrar medição:', error)
    return NextResponse.json({ error: 'Erro ao registrar medição' }, { status: 500 })
  }
}
