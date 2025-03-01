import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: ['error', 'warn'],
      transactionOptions: {
        timeout: 30000,
        maxWait: 30000,
      },
    })
  }

  async onModuleInit() {
    await this.$connect()
  }
}
