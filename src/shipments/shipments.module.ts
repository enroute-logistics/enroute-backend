import { Module } from '@nestjs/common'
import { ShipmentsController } from './shipments.controller'
import { ShipmentsService } from './shipments.service'
import { ShipmentsRepository } from './shipments.repository'
import { PrismaService } from '../prisma/prisma.service'
import { CustomersModule } from '../customers/customers.module'

@Module({
  imports: [CustomersModule],
  controllers: [ShipmentsController],
  providers: [ShipmentsService, ShipmentsRepository, PrismaService],
  exports: [ShipmentsService],
})
export class ShipmentsModule {}
