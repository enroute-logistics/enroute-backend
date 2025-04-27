import { SetMetadata } from '@nestjs/common'

export const CACHE_TTL_KEY = 'cache-ttl'
export const CACHE_KEY = 'cache-key'

export const RedisCacheTTL = (ttl: number) => SetMetadata(CACHE_TTL_KEY, ttl)
export const RedisCacheKey = (key: string) => SetMetadata(CACHE_KEY, key)
