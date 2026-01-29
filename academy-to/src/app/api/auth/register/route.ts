import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { registerPersonalSchema, registerStudentSchema } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type } = body

    if (type === 'personal') {
      const validatedData = registerPersonalSchema.parse(body)

      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email já cadastrado' },
          { status: 400 }
        )
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 10)

      const user = await prisma.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          name: validatedData.name,
          phone: validatedData.phone,
          role: 'PERSONAL',
          personal: {
            create: {}
          }
        },
        include: {
          personal: true
        }
      })

      return NextResponse.json({
        message: 'Personal cadastrado com sucesso',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          inviteCode: user.personal?.inviteCode
        }
      })
    }

    if (type === 'student') {
      const validatedData = registerStudentSchema.parse(body)

      const personal = await prisma.personal.findUnique({
        where: { inviteCode: validatedData.inviteCode }
      })

      if (!personal) {
        return NextResponse.json(
          { error: 'Código de convite inválido' },
          { status: 400 }
        )
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email já cadastrado' },
          { status: 400 }
        )
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 10)

      const user = await prisma.user.create({
        data: {
          email: validatedData.email,
          password: hashedPassword,
          name: validatedData.name,
          phone: validatedData.phone,
          role: 'STUDENT',
          student: {
            create: {
              personalId: personal.id
            }
          }
        },
        include: {
          student: true
        }
      })

      return NextResponse.json({
        message: 'Aluno cadastrado com sucesso',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      })
    }

    return NextResponse.json(
      { error: 'Tipo de cadastro inválido' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Erro no registro:', error)
    return NextResponse.json(
      { error: 'Erro ao processar cadastro' },
      { status: 500 }
    )
  }
}
