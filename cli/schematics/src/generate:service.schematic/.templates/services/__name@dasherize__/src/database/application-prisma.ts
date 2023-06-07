import { PrismaClient } from '@prisma-generated/client'

import softDeleteMiddleware from './soft-delete-middleware'

export default class ApplicationPrisma {
  private static prisma?: PrismaClient

  static get client() {
    if (!ApplicationPrisma.prisma) {
      ApplicationPrisma.prisma = new PrismaClient()
      // ApplicationPrisma.prisma.$use(softDeleteMiddleware('User'))
    }

    return ApplicationPrisma.prisma
  }

  static async disconnect() {
    await ApplicationPrisma.prisma?.$disconnect()
  }
}
