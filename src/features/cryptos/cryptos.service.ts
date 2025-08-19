import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisService } from 'src/cache/redis.service';
import { MultipleResponse } from 'src/common/interfaces/multiple-response.interface';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateMarketDataDto } from './dtos/create-market-data.dto';
import { CryptoEntity } from './entities/crypto.entity';
import { MarketDataEntity } from './entities/market-data.entity';
import { TradingPairEntity } from './entities/trading-pair.entity';
@Injectable()
export class CryptosService {
  constructor(
    @InjectRepository(CryptoEntity)
    private readonly repository: Repository<CryptoEntity>,
    @InjectRepository(TradingPairEntity)
    private readonly tradingPairRepository: Repository<TradingPairEntity>,
    @InjectRepository(MarketDataEntity)
    private readonly marketDataRepository: Repository<MarketDataEntity>,
    private readonly redisService: RedisService,
  ) {}

  async getCryptos(page: number = 1): Promise<MultipleResponse<CryptoEntity>> {
    const pageSize = 10;
    const currentPage: number = Number(page);
    const where: FindOptionsWhere<CryptoEntity> = {};

    const skip = (currentPage - 1) * pageSize;
    const data = await this.repository.find({
      skip,
      take: pageSize,
      order: { createdAt: 'DESC' },
      where,
    });
    const total = await this.repository.count({ where });

    return {
      page: currentPage,
      pageSize,
      total,
      data,
    };
  }
  async getTradingPairs(
    page: number = 1,
  ): Promise<MultipleResponse<TradingPairEntity>> {
    const pageSize = 10;
    const currentPage: number = Number(page);
    const where: FindOptionsWhere<TradingPairEntity> = {};

    const skip = (currentPage - 1) * pageSize;
    const data = await this.tradingPairRepository.find({
      skip,
      take: pageSize,
      order: { createdAt: 'DESC' },
      where,
    });
    const total = await this.tradingPairRepository.count({ where });

    return {
      page: currentPage,
      pageSize,
      total,
      data,
    };
  }

  async getMarketData(
    page: number = 1,
  ): Promise<MultipleResponse<MarketDataEntity>> {
    const pageSize = 10;
    const currentPage: number = Number(page);
    const where: FindOptionsWhere<MarketDataEntity> = {};

    const skip = (currentPage - 1) * pageSize;
    const data = await this.marketDataRepository.find({
      skip,
      take: pageSize,
      order: { createdAt: 'DESC' },
      where,
    });
    const total = await this.marketDataRepository.count({ where });

    return {
      page: currentPage,
      pageSize,
      total,
      data,
    };
  }

  async createMarketData(body: CreateMarketDataDto) {
    const marketData = this.marketDataRepository.create(body);
    await this.marketDataRepository.save(marketData);
    return marketData;
  }
  async getAllTradingPairs(): Promise<TradingPairEntity[]> {
    // return this.tradingPairRepository.find({ where: { deleted: false } });
    const cacheKey = this.redisService.generateCacheKey(
      'cryptos_getAllTradingPairs',
    );

    // 1. Check Redis first
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData) as TradingPairEntity[];
    }

    // 2. If no cache, perform the database query
    const tradingPairs = await this.tradingPairRepository.find({
      where: { deleted: false },
    });

    // 3. Cache the result in Redis with a Time-to-Live (TTL)
    const ttlInSeconds = 60 * 60 * 24; // 24 hours (evaluation types rarely change)
    await this.redisService.set(
      cacheKey,
      JSON.stringify(tradingPairs),
      ttlInSeconds,
    );

    return tradingPairs;
  }
  async getStablecoins(): Promise<CryptoEntity[]> {
    const cacheKey = this.redisService.generateCacheKey(
      'cryptos_getStablecoins',
    );

    // 1. Check Redis first
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData) as CryptoEntity[];
    }

    // 2. If no cache, perform the database query
    const cryptos = await this.repository.find({
      where: { type: 'stablecoin' },
    });

    // 3. Cache the result in Redis with a Time-to-Live (TTL)
    const ttlInSeconds = 60 * 60 * 24; // 24 hours (evaluation types rarely change)
    await this.redisService.set(
      cacheKey,
      JSON.stringify(cryptos),
      ttlInSeconds,
    );

    return cryptos;
  }
  async getPricesByTradingPair(
    tradingPairId: number,
  ): Promise<MarketDataEntity | null> {
    const price = await this.marketDataRepository.findOne({
      where: { tradingPairId },
      order: { createdAt: 'DESC' },
    });

    return price;
  }
}
