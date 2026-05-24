import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const databaseUrl = process.env.DATABASE_URL ?? ''
const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: databaseUrl }), log: ['warn', 'error'] })

async function main() {
  const hashed = await bcrypt.hash('Senha123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'dev.personal@example.test' },
    create: {
      id: 'dev-personal-1',
      email: 'dev.personal@example.test',
      password: hashed,
      name: 'Dev Personal',
      role: 'PERSONAL'
    },
    update: {
      name: 'Dev Personal',
      role: 'PERSONAL',
      password: hashed
    },
    include: {
      personal: true
    }
  })

  if (!user.personal) {
    const personal = await prisma.personal.create({
      data: {
        userId: user.id,
        bio: 'Usuário de teste Personal',
      }
    })
    console.log('Personal criado:', personal.id)
  }

  console.log('Usuário pronto:', user.email)
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1) })
