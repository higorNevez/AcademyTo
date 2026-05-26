import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const anamnesisSchema = z.object({
  objectives: z.string().optional(),
  healthConditions: z.string().optional(),
  injuries: z.string().optional(),
  medications: z.string().optional(),
  activityLevel: z.string().optional(),
  sleepQuality: z.string().optional(),
  nutrition: z.string().optional(),
  observations: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.studentId) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const validated = anamnesisSchema.parse(body)

    const anamnesis = await prisma.anamnesis.upsert({
      where: { studentId: session.user.studentId },
      create: {
        studentId: session.user.studentId,
        ...validated,
      },
      update: {
        ...validated,
      },
    })

    return NextResponse.json({ message: 'Anamnese salva com sucesso', anamnesis })
  } catch (error) {
    console.error('Erro ao salvar anamnese:', error)
    return NextResponse.json({ error: 'Erro ao salvar anamnese' }, { status: 500 })
  }
}
