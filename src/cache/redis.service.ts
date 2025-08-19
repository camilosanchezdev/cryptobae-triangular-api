/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as Redis from 'ioredis';
import { env } from 'process';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis.Redis;
  private readonly logger = new Logger(RedisService.name);
  async onModuleInit() {
    this.client = new Redis.Redis(env.REDIS_HOST || 'redis');
    try {
      await this.client.ping();
      this.logger.log('Redis connected successfully'); // Use logger.log
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error); // Use logger.error
      throw new Error('Redis connection failed');
    }
  }
  onModuleDestroy() {
    this.client.quit(); //
  }
  async set(key: string, otp: string, ttlInSeconds: number): Promise<void> {
    await this.client.set(key, otp, 'EX', ttlInSeconds); // 'EX' sets an expiration time
  }

  // Example of getting OTP from Redis
  get(key: string): Promise<string | null> {
    return this.client.get(key);
  }
  // Example of deleting OTP (optional)
  delete(key: string): Promise<number> {
    return this.client.del(key);
  }

  /**
   * Generates a cache key based on provided parameters.
   * @param prefix - A prefix for the key (e.g., method name or entity type)
   * @param params - Additional parameters to include in the key
   * @returns A unique cache key
   */
  generateCacheKey(prefix: string, ...params: any[]): string {
    const paramString = params.map((param) => JSON.stringify(param)).join('_');
    return `${prefix}_${paramString}`;
  }
}
