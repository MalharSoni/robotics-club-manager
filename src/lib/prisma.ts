import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Global singleton for both pool and prisma client
declare const globalThis: {
  prismaGlobal: PrismaClient | undefined
  poolGlobal: Pool | undefined
} & typeof global

// Create connection pool as a singleton
const getPool = () => {
  if (!globalThis.poolGlobal) {
    globalThis.poolGlobal = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20, // Maximum number of connections
      min: 2, // Minimum idle connections
      idleTimeoutMillis: 60000, // Keep connections alive for 60 seconds
      connectionTimeoutMillis: 30000, // Longer timeout for slow connections
      allowExitOnIdle: false, // Keep pool alive
    })

    // Handle pool errors
    globalThis.poolGlobal.on('error', (err) => {
      console.error('Unexpected error on idle client', err)
    })

    // Cleanup on process exit
    process.on('beforeExit', async () => {
      await globalThis.poolGlobal?.end()
    })
  }
  return globalThis.poolGlobal
}

// Create PrismaClient as a singleton
const prismaClientSingleton = () => {
  const pool = getPool()
  const adapter = new PrismaPg(pool)
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export { prisma }
export default prisma

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma
}
