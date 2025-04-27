import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common'
import { Observable, of } from 'rxjs'
import { tap } from 'rxjs/operators'
import { RedisCacheService } from '../services/redis-cache.service'

export interface CacheOptions {
  ttl?: number
  key?: string
}

@Injectable()
export class RedisCacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RedisCacheInterceptor.name)

  constructor(private readonly redisCacheService: RedisCacheService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest()
    const cacheOptions = this.getCacheOptions(context)
    const cacheKey = this.getCacheKey(request, cacheOptions.key)

    try {
      // Try to get from cache first
      const cachedData = await this.redisCacheService.get(cacheKey)
      if (cachedData) {
        this.logger.debug(`Cache hit for key: ${cacheKey}`)
        return of(cachedData)
      }

      this.logger.debug(`Cache miss for key: ${cacheKey}`)
      return next.handle().pipe(
        tap(async (data) => {
          if (data) {
            await this.redisCacheService.set(cacheKey, data, cacheOptions.ttl)
            this.logger.debug(`Cached data for key: ${cacheKey}`)
          }
        }),
      )
    } catch (error) {
      this.logger.error(`Cache error for key ${cacheKey}:`, error)
      return next.handle()
    }
  }

  private getCacheOptions(context: ExecutionContext): CacheOptions {
    const handler = context.getHandler()
    const ttl = Reflect.getMetadata('cache-ttl', handler)
    const key = Reflect.getMetadata('cache-key', handler)

    return {
      ttl: ttl || 3600, // Default 1 hour
      key,
    }
  }

  private getCacheKey(request: any, customKey?: string): string {
    if (customKey) {
      return customKey
    }

    const { method, url, query, params, body } = request
    const userId = request.user?.userId
    const organizationId = request.user?.organizationId

    // Create a unique key based on the request details
    return `${method}:${url}:${userId}:${organizationId}:${JSON.stringify(query)}:${JSON.stringify(params)}:${JSON.stringify(body)}`
  }
}
