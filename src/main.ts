import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

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
}
bootstrap()
