import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { AppModule } from './app.module'
import { CORS_URI } from './uris/api.uri'

async function bootstrap() {
  // Create a logger instance
  const logger = new Logger('Bootstrap')

  // Enable application-wide logging
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  })

  logger.log('Application starting up...')

  // Enable CORS with origins from environment variables
  app.enableCors({
    origin: CORS_URI.ALLOWED_ORIGINS,
    credentials: true,
  })

  // Apply validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that aren't in the DTO
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are present
      transform: true, // Transform payloads to be objects typed according to their DTO classes
      disableErrorMessages: false, // Keep error messages in response (disable in production for security)
      stopAtFirstError: true, // Stop at first validation error
    }),
  )

  await app.listen(process.env.PORT ?? 3000)
  logger.log(`Application listening on port ${process.env.PORT ?? 3000}`)
}
bootstrap()
