import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { FileUploadService } from './file-upload.service'
import { FileUploadController } from './file-upload.controller'
import storageConfig from '../config/storage.config'
import { PrismaService } from '../prisma/prisma.service'

@Module({
  imports: [ConfigModule.forFeature(storageConfig)],
  controllers: [FileUploadController],
  providers: [FileUploadService, PrismaService],
})
export class FileUploadModule {}
