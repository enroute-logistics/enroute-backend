import { Module } from '@nestjs/common'
import { PositionsController } from './positions.controller'
import { PositionsService } from './positions.service'
import { CommonModule } from '../common/common.module'

@Module({
  imports: [CommonModule],
  controllers: [PositionsController],
  providers: [PositionsService],
  exports: [PositionsService],
})
export class PositionsModule {}
