import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const databaseUrl = process.env.DATABASE_URL ?? ''

const isPostgres = databaseUrl.startsWith('postgres:') || databaseUrl.startsWith('postgresql:')

export const prisma = globalForPrisma.prisma ?? (isPostgres
  ? new PrismaClient({ adapter: new PrismaPg(databaseUrl) })
  : new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: databaseUrl }), log: ['warn', 'error'] }))

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
