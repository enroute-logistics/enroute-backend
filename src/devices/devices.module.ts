import { Module } from '@nestjs/common'
import { DevicesController } from './devices.controller'
import { DevicesService } from './devices.service'
import { CommonModule } from '../common/common.module'

@Module({
  imports: [CommonModule],
  controllers: [DevicesController],
  providers: [DevicesService],
  exports: [DevicesService],
})
export class DevicesModule {}
