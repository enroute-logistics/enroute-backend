import { Module } from '@nestjs/common'
import { DevicesController } from './devices.controller'
import { DevicesService } from './devices.service'
import { CommonModule } from '../common/common.module'
import { DevicesGateway } from './devices.gateway'
import { AuthModule } from '../auth/auth.module'

@Module({
  imports: [CommonModule, AuthModule],
  controllers: [DevicesController],
  providers: [DevicesService, DevicesGateway],
  exports: [DevicesService],
})
export class DevicesModule {}
