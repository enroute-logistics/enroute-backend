import { Module } from '@nestjs/common'
import { OrganizationsController } from './organizations.controller'
import { OrganizationsService } from './organizations.service'
import { OrganizationsRepository } from './organizations.repository'
import { PrismaService } from '../prisma/prisma.service'
import { UsersService } from '../users/users.service'
import { UsersRepository } from '../users/users.repository'

@Module({
  controllers: [OrganizationsController],
  providers: [
    OrganizationsService,
    OrganizationsRepository,
    UsersService,
    UsersRepository,
    PrismaService,
  ],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
