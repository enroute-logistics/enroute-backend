import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  Param,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  Res,
  Delete,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { FileUploadService } from './file-upload.service'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { FileTypeValidator, MaxFileSizeValidator, ParseFilePipe } from '@nestjs/common'
import { Response } from 'express'
import { FILE_URI } from '../uris/api.uri'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf']

@Controller(FILE_URI.BASE)
@UseGuards(JwtAuthGuard)
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post(FILE_URI.UPLOAD_VEHICLE)
  @UseInterceptors(FileInterceptor('file'))
  async uploadVehicleFile(
    @Request() req,
    @Param('vehicleId') vehicleId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: new RegExp(ALLOWED_MIME_TYPES.join('|')) }),
        ],
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    try {
      const url = await this.fileUploadService.uploadFile({
        file,
        organizationId: req.user.organizationId,
        vehicleId: parseInt(vehicleId),
      })
      return { url }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to upload file',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Post(FILE_URI.UPLOAD_SHIPMENT)
  @UseInterceptors(FileInterceptor('file'))
  async uploadShipmentFile(
    @Request() req,
    @Param('shipmentId') shipmentId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: new RegExp(ALLOWED_MIME_TYPES.join('|')) }),
        ],
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    try {
      const url = await this.fileUploadService.uploadFile({
        file,
        organizationId: req.user.organizationId,
        shipmentId: parseInt(shipmentId),
      })
      return { url }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to upload file',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Get(FILE_URI.VEHICLE_FILES)
  async getVehicleFiles(@Request() req, @Param('vehicleId') vehicleId: string) {
    try {
      const files = await this.fileUploadService.getVehicleFiles(parseInt(vehicleId))
      return files
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to get vehicle files',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Get(FILE_URI.SHIPMENT_FILES)
  async getShipmentFiles(@Request() req, @Param('shipmentId') shipmentId: string) {
    try {
      const files = await this.fileUploadService.getShipmentFiles(parseInt(shipmentId))
      return files
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to get shipment files',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Get(FILE_URI.DOWNLOAD)
  async downloadFile(@Request() req, @Param('fileId') fileId: string, @Res() res: Response) {
    try {
      const { stream, filename, mimeType } = await this.fileUploadService.downloadFile(
        parseInt(fileId),
        req.user.organizationId,
      )

      res.setHeader('Content-Type', mimeType)
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)

      stream.pipe(res)
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to download file',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  @Delete(FILE_URI.DELETE_FILE)
  async deleteFile(@Request() req, @Param('fileId') fileId: string) {
    await this.fileUploadService.deleteFile(parseInt(fileId), req.user.organizationId)
    return { success: true }
  }
}
