import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const databaseUrl = process.env.DATABASE_URL ?? ''
const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: databaseUrl }), log: ['warn', 'error'] })

async function main() {
  const personalEmail = 'dev.personal@example.test'
  const studentEmail = 'dev.student@example.test'
  const password = 'Senha123'

  const personalUser = await prisma.user.findUnique({
    where: { email: personalEmail },
    include: { personal: true }
  })

  if (!personalUser || !personalUser.personal) {
    throw new Error(`Personal user not found or missing Personal record for ${personalEmail}`)
  }

  const hashed = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email: studentEmail },
    create: {
      id: 'dev-student-1',
      email: studentEmail,
      password: hashed,
      name: 'Dev Student',
      role: 'STUDENT',
      student: {
        create: {
          personalId: personalUser.personal.id
        }
      }
    },
    update: {
      name: 'Dev Student',
      password: hashed
    },
    include: {
      student: true
    }
  })

  if (!user.student) {
    await prisma.student.create({
      data: {
        userId: user.id,
        personalId: personalUser.personal.id
      }
    })
  }

  console.log('Aluno criado:')
  console.log(`  email: ${studentEmail}`)
  console.log(`  senha: ${password}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
