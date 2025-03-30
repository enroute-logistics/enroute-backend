import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('GlobalExceptionFilter')

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

    let message = exception instanceof HttpException ? exception.message : 'Internal server error'
    let validationErrors: any = null

    // Handle validation errors (BadRequestException)
    if (exception instanceof BadRequestException) {
      const exceptionResponse = exception.getResponse() as any

      // Handle class-validator errors
      if (Array.isArray(exceptionResponse.message)) {
        validationErrors = exceptionResponse.message
        message = 'Validation failed'
      } else if (typeof exceptionResponse === 'object') {
        // Handle parameter decorator validation errors
        validationErrors = exceptionResponse.message
        message = exceptionResponse.error || 'Validation failed'
      }

      // Log detailed validation errors
      this.logger.error(
        `Validation failed for ${request.method} ${request.url}:`,
        JSON.stringify({
          validationErrors,
          body: request.body,
          params: request.params,
          query: request.query,
        }),
        'ValidationError',
      )
    }

    // Log the error with stack trace if available
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      ...(validationErrors && { validationErrors }),
    }

    if (exception instanceof Error) {
      this.logger.error(`${request.method} ${request.url}`, exception.stack, 'ExceptionHandler')
    } else {
      this.logger.error(
        `${request.method} ${request.url}`,
        JSON.stringify(exception),
        'ExceptionHandler',
      )
    }

    response.status(status).json(errorResponse)
  }
}
