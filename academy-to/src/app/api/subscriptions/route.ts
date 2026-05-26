import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const subscriptionSchema = z.object({
  planId: z.string().min(1, 'Plano é obrigatório'),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.studentId) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const validated = subscriptionSchema.parse(body)

    const student = await prisma.student.findUnique({
      where: { id: session.user.studentId },
      include: { personal: true },
    })

    if (!student) {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })
    }

    const plan = await prisma.plan.findUnique({
      where: { id: validated.planId },
    })

    if (!plan || plan.personalId !== student.personalId) {
      return NextResponse.json({ error: 'Plano inválido para este personal' }, { status: 400 })
    }

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        studentId: student.id,
        status: 'ACTIVE',
      },
    })

    if (activeSubscription) {
      return NextResponse.json({ error: 'Já existe um plano ativo para este aluno' }, { status: 400 })
    }

    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + plan.durationMonths)

    const subscription = await prisma.subscription.create({
      data: {
        studentId: student.id,
        planId: plan.id,
        status: 'ACTIVE',
        startDate,
        endDate,
      },
    })

    return NextResponse.json({ message: 'Assinatura criada com sucesso', subscription })
  } catch (error) {
    console.error('Erro ao criar assinatura:', error)
    return NextResponse.json({ error: 'Erro ao criar assinatura' }, { status: 500 })
  }
}
