import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'
// Import prisma lazily inside handlers to avoid constructor errors at module load

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Credenciais inválidas')
        }

        const prisma = (await import('@/lib/prisma')).default

        let user = null
        try {
          user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              personal: true,
              student: {
                include: {
                  personal: true
                }
              }
            }
          })
        } catch (error) {
          // fallback to env test user when DB is unavailable
          user = null
        }

        if (user) {
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            throw new Error('Senha incorreta')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            personalId: user.personal?.id || null,
            studentId: user.student?.id || null,
          }
        }

        const testEmail = process.env.TEST_USER_EMAIL
        const testPassword = process.env.TEST_USER_PASSWORD
        if (testEmail && testPassword && credentials.email === testEmail && credentials.password === testPassword) {
          return {
            id: 'dev-test-user',
            email: testEmail,
            name: 'Dev Personal (temp)',
            role: UserRole.PERSONAL,
            personalId: null,
            studentId: null,
          }
        }

        throw new Error('Usuário não encontrado')
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.personalId = user.personalId
        token.studentId = user.studentId
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.personalId = token.personalId as string | null
        session.user.studentId = token.studentId as string | null
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
}
