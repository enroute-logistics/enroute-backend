import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'
import { PrismaService } from '../prisma/prisma.service'
import { File } from '@prisma/client'

interface StorageConfig {
  endpoint: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
  region: string
}

interface UploadFileOptions {
  file: Express.Multer.File
  organizationId: number
  vehicleId?: number
  shipmentId?: number
}

@Injectable()
export class FileUploadService {
  private readonly logger = new Logger(FileUploadService.name)
  private s3: S3Client
  private bucket: string

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const storageConfig = this.configService.get<StorageConfig>('storage')

    if (!storageConfig) {
      throw new Error('Storage configuration is missing')
    }

    // Validate required configuration
    const { endpoint, accessKeyId, secretAccessKey, bucketName, region } = storageConfig
    if (!endpoint || !accessKeyId || !secretAccessKey || !bucketName || !region) {
      throw new Error('Missing required storage configuration')
    }

    try {
      this.s3 = new S3Client({
        region: region,
        endpoint: endpoint,
        credentials: {
          accessKeyId: accessKeyId,
          secretAccessKey: secretAccessKey,
        },
        forcePathStyle: true,
      })
      this.bucket = bucketName

      this.logger.log(`S3 client initialized with endpoint: ${endpoint} and region: ${region}`)
    } catch (error) {
      this.logger.error('Failed to initialize S3 client:', error)
      throw new Error('Failed to initialize storage client')
    }
  }

  async uploadFile({
    file,
    organizationId,
    vehicleId,
    shipmentId,
  }: UploadFileOptions): Promise<string> {
    try {
      const key = `${uuidv4()}-${file.originalname}`

      // Upload to S3
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      )

      const url = `${this.configService.get('storage.endpoint')}/${this.bucket}/${key}`

      // Store in database
      const dbFile = await this.prisma.file.create({
        data: {
          name: file.originalname,
          key: key,
          url: url,
          mimeType: file.mimetype,
          size: file.size,
          organizationId: organizationId,
          ...(vehicleId && {
            vehicles: {
              create: {
                vehicleId: vehicleId,
              },
            },
          }),
          ...(shipmentId && {
            shipments: {
              create: {
                shipmentId: shipmentId,
              },
            },
          }),
        },
      })

      this.logger.log(`File uploaded successfully: ${url}`)
      return url
    } catch (error) {
      this.logger.error('Failed to upload file:', error)
      throw new Error('Failed to upload file to storage')
    }
  }

  async getVehicleFiles(vehicleId: number): Promise<File[]> {
    return this.prisma.file.findMany({
      where: {
        vehicles: {
          some: {
            vehicleId: vehicleId,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async getShipmentFiles(shipmentId: number): Promise<File[]> {
    return this.prisma.file.findMany({
      where: {
        shipments: {
          some: {
            shipmentId: shipmentId,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async downloadFile(
    fileId: number,
    organizationId: number,
  ): Promise<{ stream: any; filename: string; mimeType: string }> {
    const file = await this.prisma.file.findFirst({
      where: {
        id: fileId,
        organizationId: organizationId,
      },
    })

    if (!file) {
      throw new NotFoundException('File not found')
    }

    try {
      const response = await this.s3.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: file.key,
        }),
      )

      return {
        stream: response.Body,
        filename: file.name,
        mimeType: file.mimeType,
      }
    } catch (error) {
      this.logger.error('Failed to download file:', error)
      throw new Error('Failed to download file from storage')
    }
  }

  async deleteFile(fileId: number, organizationId: number): Promise<void> {
    const file = await this.prisma.file.findFirst({
      where: { id: fileId, organizationId },
    })
    if (!file) throw new NotFoundException('File not found')

    // Delete from S3
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: file.key,
      }),
    )

    // Delete join table entries first
    await this.prisma.vehicleFile.deleteMany({ where: { fileId } })
    await this.prisma.shipmentFile.deleteMany({ where: { fileId } })

    // Delete from DB
    await this.prisma.file.delete({ where: { id: fileId } })
  }
}
