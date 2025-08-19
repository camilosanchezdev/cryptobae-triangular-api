/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as dayjs from 'dayjs';
import { RedisService } from 'src/cache/redis.service';
import { Between, Repository } from 'typeorm';
import { CryptocurrencyEntity } from './entities/cryptocurrency.entity';
import { PriceEntity } from './entities/price.entity';
import { Cryptocurrencies } from './enums/cryptocurrencies.enum';
import { CryptoPriceUpdate } from './interfaces/binance-websocket.interface';

@Injectable()
export class PricesService {
  constructor(
    @InjectRepository(PriceEntity)
    private readonly repository: Repository<PriceEntity>,
    @InjectRepository(CryptocurrencyEntity)
    private readonly cryptocurrencyRepository: Repository<CryptocurrencyEntity>,
    private readonly redisService: RedisService,
  ) {}

  // Save price data to a database (optional)
  async savePriceData(priceData: CryptoPriceUpdate): Promise<PriceEntity> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const cryptocurrencyId: number =
      Cryptocurrencies[priceData.symbol.toUpperCase()];

    const priceEntity = this.repository.create({
      cryptocurrencyId,
      price: priceData.price,
      volume: priceData.volume24h,
    });

    return await this.repository.save(priceEntity);
  }
  async checkMinPrice(cryptocurrencyId: number) {
    const now = dayjs();
    const startOfDay = now.startOf('day').toDate();
    const endOfDay = now.toDate();
    const prices = await this.repository.find({
      where: {
        cryptocurrencyId,
        createdAt: Between(startOfDay, endOfDay),
      },
    });
    if (prices.length === 0) return -Infinity;
    return Math.min(...prices.map((price) => Number(price.price)));
  }
  async lowestPriceOfFrame(cryptocurrencyId: number) {
    const now = dayjs();
    const lastHour = now.subtract(1, 'hour');
    const start = lastHour.startOf('hour').toDate();
    const end = now.toDate();
    const prices = await this.repository.find({
      where: {
        cryptocurrencyId,
        createdAt: Between(start, end),
      },
    });
    if (prices.length === 0) return Infinity; // Return Infinity if no prices found
    // Return the minimum price from the found prices
    return Math.min(...prices.map((price) => Number(price.price)));
  }
  async highestPriceOfFrame(cryptocurrencyId: number) {
    const cacheKey = this.redisService.generateCacheKey(
      'prices_highestPriceOfFrame',
      cryptocurrencyId,
    );

    // 1. Check Redis first
    const cachedPrice = await this.redisService.get(cacheKey);
    if (cachedPrice) {
      return Number(cachedPrice);
    }

    // 2. If no cache, perform the expensive database query
    const now = dayjs();
    const lastHour = now.subtract(1, 'hour');
    const start = lastHour.startOf('hour').toDate();
    const end = now.toDate();

    const prices = await this.repository.find({
      where: {
        cryptocurrencyId,
        createdAt: Between(start, end),
      },
    });

    if (prices.length === 0) {
      // Handle no prices found and cache the result with a short expiry
      const ttlInSeconds = 60 * 10; // 10 minutes
      await this.redisService.set(cacheKey, Infinity.toString(), ttlInSeconds);
      return Infinity;
    }

    const highestPrice = Math.max(
      ...prices.map((price) => Number(price.price)),
    );

    // 3. Cache the result in Redis with a Time-to-Live (TTL)
    const ttlInSeconds = 60 * 60; // 1 hour
    await this.redisService.set(
      cacheKey,
      highestPrice.toString(),
      ttlInSeconds,
    );

    return highestPrice;
  }

  async lowestPriceOfFrameSecondary(cryptocurrencyId: number) {
    const cacheKey = this.redisService.generateCacheKey(
      'prices_lowestPriceOfFrameSecondary',
      cryptocurrencyId,
    );

    // 1. Check Redis first
    const cachedPrice = await this.redisService.get(cacheKey);
    if (cachedPrice) {
      return Number(cachedPrice);
    }

    // 2. If no cache, perform the expensive database query
    const now = dayjs();
    const lastHour = now.subtract(6, 'hour');
    const start = lastHour.startOf('hour').toDate();
    const end = now.toDate();

    const prices = await this.repository.find({
      where: {
        cryptocurrencyId,
        createdAt: Between(start, end),
      },
    });

    if (prices.length === 0) {
      // Handle no prices found and cache the result with a short expiry
      const ttlInSeconds = 60 * 10; // 10 minutes
      await this.redisService.set(cacheKey, Infinity.toString(), ttlInSeconds);
      return Infinity;
    }

    const lowestPrice = Math.min(...prices.map((price) => Number(price.price)));

    // 3. Cache the result in Redis with a Time-to-Live (TTL)
    const ttlInSeconds = 60 * 60; // 1 hour
    await this.redisService.set(cacheKey, lowestPrice.toString(), ttlInSeconds);

    return lowestPrice;
  }
  async minPriceYesterday(cryptocurrencyId: number): Promise<number> {
    const cacheKey = this.redisService.generateCacheKey(
      'prices_minPriceYesterday',
      cryptocurrencyId,
    );

    // 1. Check Redis for the cached value
    const cachedPrice = await this.redisService.get(cacheKey);
    if (cachedPrice) {
      return Number(cachedPrice);
    }

    // 2. If no cache, perform the database query
    const yesterday = dayjs().subtract(1, 'day');
    const start = yesterday.startOf('day').toDate();
    const end = yesterday.endOf('day').toDate();

    const prices = await this.repository.find({
      where: {
        cryptocurrencyId,
        createdAt: Between(start, end),
      },
    });

    if (prices.length === 0) {
      // If no prices found, cache 0 with a short expiration to avoid repeated queries
      const ttlInSeconds = 60; // 1 minute
      await this.redisService.set(cacheKey, '0', ttlInSeconds);
      return 0;
    }

    const minPrice = Math.min(...prices.map((price) => Number(price.price)));

    // 3. Cache the result in Redis with a TTL
    // The value for "yesterday's min price" is static until the next day.
    // We can set the TTL to expire at midnight of the current day.
    const now = dayjs();
    const endOfDay = now.endOf('day').unix();
    const ttlInSeconds = endOfDay - now.unix();

    await this.redisService.set(cacheKey, minPrice.toString(), ttlInSeconds);

    return minPrice;
  }

  async averagePriceYesterday(cryptocurrencyId: number): Promise<number> {
    const cacheKey = `average_price_yesterday:${cryptocurrencyId}`;

    // 1. Check Redis for the cached value
    const cachedPrice = await this.redisService.get(cacheKey);
    if (cachedPrice) {
      console.log('Serving averagePriceYesterday from Redis cache!');
      return Number(cachedPrice);
    }

    // 2. If no cache, perform the database query
    const yesterday = dayjs().subtract(1, 'day');
    const start = yesterday.startOf('day').toDate();
    const end = yesterday.endOf('day').toDate();

    const prices = await this.repository.find({
      where: {
        cryptocurrencyId,
        createdAt: Between(start, end),
      },
    });

    if (prices.length === 0) {
      // If no prices found, cache a special value (-Infinity) with a short expiration
      const ttlInSeconds = 60 * 10; // 10 minutes
      await this.redisService.set(cacheKey, '-Infinity', ttlInSeconds);
      return -Infinity;
    }

    const sum = prices.reduce((acc, price) => acc + Number(price.price), 0);
    const averagePrice = sum / prices.length;

    // 3. Cache the result in Redis with a TTL
    // Yesterday's average price is static and won't change.
    // Set the TTL to expire at the end of the current day.
    const now = dayjs();
    const endOfDay = now.endOf('day').unix();
    const ttlInSeconds = endOfDay - now.unix();

    await this.redisService.set(
      cacheKey,
      averagePrice.toString(),
      ttlInSeconds,
    );

    return averagePrice;
  }
  async getCryptocurrencies() {
    return await this.cryptocurrencyRepository.find({
      where: {
        deleted: false,
      },
      order: { name: 'ASC' },
    });
  }
  async getCryptocurrency(cryptocurrencyId: number) {
    // Generate a unique cache key
    const cacheKey = this.redisService.generateCacheKey(
      'prices_getCryptocurrency',
      cryptocurrencyId,
    );

    // Try to get data from cache
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData) as CryptocurrencyEntity;
    }
    const cryptocurrency = await this.cryptocurrencyRepository.findOne({
      where: {
        deleted: false,
        id: cryptocurrencyId,
      },
    });
    if (!cryptocurrency) {
      throw new Error(`Cryptocurrency with ID ${cryptocurrencyId} not found`);
    }
    const ttlInSeconds = 60 * 60 * 24; // 1 day
    await this.redisService.set(
      cacheKey,
      JSON.stringify(cryptocurrency),
      ttlInSeconds,
    );
    return cryptocurrency;
  }
  async currentVolume(symbol: string): Promise<number> {
    const cacheKey = this.redisService.generateCacheKey(
      'prices_currentVolume',
      symbol,
    );

    // 1. Check Redis first
    const cachedVolume = await this.redisService.get(cacheKey);
    if (cachedVolume) {
      return Number(cachedVolume);
    }

    // 2. If no cache, perform the external API call
    // const symbol = await this.getSymbolFromCryptocurrencyId(cryptocurrencyId); // e.g., "BTCUSDT"
    const interval = '5m'; // 1-minute candlestick for current volume
    const limit = 1; // Fetch only the latest candlestick
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;

    try {
      const response = await fetch(url);
      const data: unknown = await response.json();
      if (!data || !data[0] || !data[0][5]) {
        throw new Error(`Invalid kline data for ${symbol}`);
      }

      const currentVolume = Number(data[0][5]); // Volume is at index 5 in kline array

      // 3. Cache the result in Redis with a Time-to-Live (TTL)
      const ttlInSeconds = 60 * 2; // 2 minutes (very short TTL for current data)
      await this.redisService.set(
        cacheKey,
        currentVolume.toString(),
        ttlInSeconds,
      );

      return currentVolume;
    } catch (error) {
      console.error(`Error fetching current volume for ${symbol}:`, error);

      // Cache the fallback value with a very short TTL to avoid repeated failures
      const ttlInSeconds = 30; // 30 seconds
      await this.redisService.set(cacheKey, '0', ttlInSeconds);

      return 0; // Fallback to avoid breaking the bot
    }
  }
  async averageVolume(
    symbol: string,
    period: string = '5m',
    limit: number = 14,
  ): Promise<number> {
    const cacheKey = this.redisService.generateCacheKey(
      'prices_averageVolume',
      `${symbol}_${period}_${limit}`,
    );

    // 1. Check Redis first
    const cachedVolume = await this.redisService.get(cacheKey);
    if (cachedVolume) {
      return Number(cachedVolume);
    }

    // 2. If no cache, perform the external API call
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${period}&limit=${limit}`;

    try {
      const response = await fetch(url);
      const data: unknown = await response.json();
      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error(`Invalid kline data for ${symbol}`);
      }
      const volumes = data.map((candle) => Number(candle[5])); // Extract volume from each candlestick
      const average =
        volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;

      // 3. Cache the result in Redis with a Time-to-Live (TTL)
      const ttlInSeconds = 60 * 5; // 5 minutes (shorter TTL for external API data)
      await this.redisService.set(cacheKey, average.toString(), ttlInSeconds);

      return average;
    } catch (error) {
      console.error(`Error fetching average volume for ${symbol}:`, error);

      // Cache the fallback value with a very short TTL to avoid repeated failures
      const ttlInSeconds = 60; // 1 minute
      await this.redisService.set(cacheKey, '0', ttlInSeconds);

      return 0; // Fallback
    }
  }
  async getAveragePriceWeek(cryptocurrencyId: number): Promise<number> {
    const cacheKey = this.redisService.generateCacheKey(
      'prices_getAveragePriceWeek',
      cryptocurrencyId,
    );

    // 1. Check Redis first
    const cachedPrice = await this.redisService.get(cacheKey);
    if (cachedPrice) {
      return Number(cachedPrice);
    }

    // 2. If no cache, perform the expensive database query
    const now = dayjs();
    const sevenDaysAgo = now.subtract(7, 'day').startOf('day').toDate();
    const end = now.toDate();

    const prices = await this.repository.find({
      where: {
        cryptocurrencyId,
        createdAt: Between(sevenDaysAgo, end),
      },
    });

    if (prices.length === 0) {
      // Handle no prices found and cache the result with a short expiry
      const ttlInSeconds = 60 * 10; // 10 minutes
      await this.redisService.set(cacheKey, Infinity.toString(), ttlInSeconds);
      return Infinity;
    }

    const sum = prices.reduce((acc, price) => acc + Number(price.price), 0);
    const averagePrice = sum / prices.length;

    // 3. Cache the result in Redis with a Time-to-Live (TTL)
    const ttlInSeconds = 60 * 60 * 2; // 2 hours
    await this.redisService.set(
      cacheKey,
      averagePrice.toString(),
      ttlInSeconds,
    );

    return averagePrice;
  }
}
