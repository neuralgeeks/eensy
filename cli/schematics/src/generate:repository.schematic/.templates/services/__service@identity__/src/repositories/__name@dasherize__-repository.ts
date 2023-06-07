import PrismaRepository from 'eensy/dist/src/prisma/prisma-repository'

import { <%= classify(name) %> } from '@prisma-generated/client'

import ApplicationPrisma from '../database/application-prisma'

const prisma = ApplicationPrisma.client

export default class <%= classify(name) %>Repository extends PrismaRepository<string, <%= classify(name) %>> {
  constructor() {
    super(prisma.<%= camelize(name) %>)
  }
}
