import { Injectable, NestMiddleware, Logger } from '@nestjs/common'
import { Request, Response, NextFunction } from 'express'

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP')

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip, body } = req
    const userAgent = req.get('user-agent') || ''

    // Log when request starts
    const requestMessage = `[REQUEST] ${method} ${originalUrl} - IP: ${ip} - User-Agent: ${userAgent}`
    this.logger.log(requestMessage)

    // Log request body if it exists
    if (body && typeof body === 'object' && Object.keys(body).length > 0) {
      const bodyMessage = `[REQUEST BODY] ${JSON.stringify(body)}`
      this.logger.log(bodyMessage)
    }

    // Track response time
    const startTime = Date.now()

    // Log when response is sent
    res.on('finish', () => {
      const { statusCode } = res
      const contentLength = res.get('content-length') || 0
      const responseTime = Date.now() - startTime

      const responseMessage = `[RESPONSE] ${method} ${originalUrl} - Status: ${statusCode} - Content-Length: ${contentLength} - Time: ${responseTime}ms`
      this.logger.log(responseMessage)
    })

    next()
  }
}
