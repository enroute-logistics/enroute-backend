import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'

async function bootstrap() {
  // Create a logger instance
  const logger = new Logger('Bootstrap')

  // Enable application-wide logging
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  })
  const configService = app.get(ConfigService)
  const corsAllowedOrigins = configService.get('CORS_ALLOWED_ORIGINS')

  logger.log('Application starting up...')

  // Enable CORS with origins from environment variables
  app.enableCors({
    origin: corsAllowedOrigins,
    credentials: true,
  })

  // Apply validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false, // Allow properties not defined in DTOs
      forbidNonWhitelisted: false, // Don't throw errors for additional properties
      transform: true, // Transform payloads to be objects typed according to their DTO classes
      disableErrorMessages: false, // Keep error messages in response
      stopAtFirstError: true, // Stop at first validation error
    }),
  )

  // Add global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter())

  const port = configService.get('PORT') || 3000
  await app.listen(port)
  logger.log(`Application is running on: http://localhost:${port}`)
}
bootstrap()
