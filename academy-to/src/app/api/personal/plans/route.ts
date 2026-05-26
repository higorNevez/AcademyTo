import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const planValuesSchema = z.object({
  semestralPrice: z.number().min(0.01),
  anualPrice: z.number().min(0.01),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.personalId) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const validated = planValuesSchema.parse(body)

    const plansToSave = [
      {
        name: 'Semestral',
        durationMonths: 6,
        price: validated.semestralPrice,
        description: 'Plano de 6 meses',
      },
      {
        name: 'Anual',
        durationMonths: 12,
        price: validated.anualPrice,
        description: 'Plano de 12 meses',
      },
    ]

    const savedPlans = []

    for (const planData of plansToSave) {
      const existingPlan = await prisma.plan.findFirst({
        where: {
          personalId: session.user.personalId,
          durationMonths: planData.durationMonths,
        },
      })

      if (existingPlan) {
        const updatedPlan = await prisma.plan.update({
          where: { id: existingPlan.id },
          data: {
            name: planData.name,
            price: planData.price,
            description: planData.description,
            isActive: true,
          },
        })
        savedPlans.push(updatedPlan)
      } else {
        const createdPlan = await prisma.plan.create({
          data: {
            personalId: session.user.personalId,
            name: planData.name,
            description: planData.description,
            durationMonths: planData.durationMonths,
            price: planData.price,
            isActive: true,
          },
        })
        savedPlans.push(createdPlan)
      }
    }

    return NextResponse.json({ message: 'Valores de plano atualizados', plans: savedPlans })
  } catch (error) {
    console.error('Erro ao salvar planos:', error)
    return NextResponse.json({ error: 'Erro ao salvar valores de plano' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.personalId) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
    }

    const plans = await prisma.plan.findMany({
      where: {
        personalId: session.user.personalId,
        durationMonths: { in: [6, 12] },
      },
      orderBy: { durationMonths: 'asc' },
    })

    return NextResponse.json({ plans })
  } catch (error) {
    console.error('Erro ao buscar planos:', error)
    return NextResponse.json({ error: 'Erro ao buscar planos' }, { status: 500 })
  }
}
