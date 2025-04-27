import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisCacheService.name)
  private readonly redis: Redis
  private readonly defaultTTL = 3600 // 1 hour in seconds

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
    })

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error:', error)
    })

    this.redis.on('connect', () => {
      this.logger.log('Successfully connected to Redis')
    })
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(this.getKeyWithPrefix(key))
      return value ? JSON.parse(value) : null
    } catch (error) {
      this.logger.error(`Error getting key ${key}:`, error)
      return null
    }
  }

  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    try {
      const serializedValue = JSON.stringify(value)
      await this.redis.set(this.getKeyWithPrefix(key), serializedValue, 'EX', ttl)
    } catch (error) {
      this.logger.error(`Error setting key ${key}:`, error)
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(this.getKeyWithPrefix(key))
    } catch (error) {
      this.logger.error(`Error deleting key ${key}:`, error)
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(this.getKeyWithPrefix(pattern))
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      this.logger.error(`Error deleting pattern ${pattern}:`, error)
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(this.getKeyWithPrefix(key))
      return result === 1
    } catch (error) {
      this.logger.error(`Error checking existence of key ${key}:`, error)
      return false
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.redis.ttl(this.getKeyWithPrefix(key))
    } catch (error) {
      this.logger.error(`Error getting TTL for key ${key}:`, error)
      return -1
    }
  }

  async getKeysByPattern(pattern: string): Promise<string[]> {
    try {
      return await this.redis.keys(this.getKeyWithPrefix(pattern))
    } catch (error) {
      this.logger.error(`Error getting keys by pattern ${pattern}:`, error)
      return []
    }
  }

  private getKeyWithPrefix(key: string): string {
    return `enroute:${key}`
  }

  async onModuleDestroy() {
    await this.redis.quit()
  }
}
