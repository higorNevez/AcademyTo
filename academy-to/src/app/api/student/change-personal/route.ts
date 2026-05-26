import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const changePersonalSchema = z.object({
  inviteCode: z.string().min(1, 'Código de convite é obrigatório'),
})

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.studentId) {
      return NextResponse.json({ error: 'Acesso não autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const validated = changePersonalSchema.parse(body)

    const personal = await prisma.personal.findUnique({
      where: { inviteCode: validated.inviteCode },
      include: { user: true },
    })

    if (!personal) {
      return NextResponse.json({ error: 'Código de convite inválido' }, { status: 400 })
    }

    const student = await prisma.student.findUnique({
      where: { id: session.user.studentId },
      include: { personal: true },
    })

    if (!student) {
      return NextResponse.json({ error: 'Aluno não encontrado' }, { status: 404 })
    }

    if (student.personalId === personal.id) {
      return NextResponse.json({ message: 'Você já está vinculado a este personal', personal: { id: personal.id, inviteCode: personal.inviteCode, name: personal.user.name } })
    }

    await prisma.student.update({
      where: { id: session.user.studentId },
      data: { personalId: personal.id },
    })

    await prisma.subscription.updateMany({
      where: {
        studentId: session.user.studentId,
        status: 'ACTIVE',
      },
      data: {
        status: 'CANCELLED',
      },
    })

    return NextResponse.json({
      message: 'Personal atualizado com sucesso',
      personal: {
        id: personal.id,
        inviteCode: personal.inviteCode,
        name: personal.user.name,
      },
    })
  } catch (error) {
    console.error('Erro ao trocar personal:', error)
    return NextResponse.json({ error: 'Erro ao atualizar personal' }, { status: 500 })
  }
}
