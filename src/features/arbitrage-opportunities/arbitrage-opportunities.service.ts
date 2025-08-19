import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MultipleResponse } from 'src/common/interfaces/multiple-response.interface';
import { CryptoEntity } from 'src/features/cryptos/entities/crypto.entity';
import { MarketDataEntity } from 'src/features/cryptos/entities/market-data.entity';
import { TradingPairEntity } from 'src/features/cryptos/entities/trading-pair.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateArbitrageOpportunityDto } from './dtos/create-arbitrage-opportunity.dto';
import { ArbitrageOpportunityEntity } from './entities/arbitrage-opportunity.entity';
import {
  TriangularArbitrageAnalysis,
  TriangularArbitrageStep,
} from './interfaces/triangular-arbitrage.interface';
@Injectable()
export class ArbitrageOpportunitiesService {
  constructor(
    @InjectRepository(ArbitrageOpportunityEntity)
    private readonly repository: Repository<ArbitrageOpportunityEntity>,
    @InjectRepository(CryptoEntity)
    private readonly cryptoRepository: Repository<CryptoEntity>,
    @InjectRepository(TradingPairEntity)
    private readonly tradingPairRepository: Repository<TradingPairEntity>,
    @InjectRepository(MarketDataEntity)
    private readonly marketDataRepository: Repository<MarketDataEntity>,
  ) {}

  async getArbitrageOpportunities(
    page: number = 1,
  ): Promise<MultipleResponse<ArbitrageOpportunityEntity>> {
    const pageSize = 10;
    const currentPage: number = Number(page);
    const where: FindOptionsWhere<ArbitrageOpportunityEntity> = {};

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

  async analyzeTriangularArbitrage(
    minProfitPercentage: number = 0.1, // Minimum profit threshold (0.1%)
  ): Promise<ArbitrageOpportunityEntity[]> {
    // Get all stablecoins
    const stablecoins = await this.cryptoRepository.find({
      where: { type: 'stablecoin', deleted: false },
    });

    // Get all cryptocurrencies (non-stablecoins)
    const cryptocurrencies = await this.cryptoRepository.find({
      where: { type: 'cryptocoin', deleted: false },
    });

    // Get all trading pairs with their latest market data
    const tradingPairs = await this.tradingPairRepository
      .createQueryBuilder('tp')
      .leftJoinAndSelect('tp.baseCrypto', 'baseCrypto')
      .leftJoinAndSelect('tp.quoteCrypto', 'quoteCrypto')
      .where('tp.deleted = false')
      .getMany();

    console.log('📊 Found trading pairs:', tradingPairs.length);
    console.log('🪙 Found stablecoins:', stablecoins.length);
    console.log('🪙 Found cryptocurrencies:', cryptocurrencies.length);

    // Debug: Log crypto IDs and symbols
    console.log('🔍 Stablecoins:');
    stablecoins.forEach((coin) => {
      console.log(
        `  ID: ${coin.id}, Symbol: ${coin.symbol}, Type: ${coin.type}`,
      );
    });

    console.log('🔍 Cryptocurrencies:');
    cryptocurrencies.forEach((crypto) => {
      console.log(
        `  ID: ${crypto.id}, Symbol: ${crypto.symbol}, Type: ${crypto.type}`,
      );
    });

    // Debug: Log existing trading pairs to understand the structure
    console.log('🔍 Available trading pairs:');
    tradingPairs.forEach((pair, index) => {
      if (index < 20) {
        // Log first 20 to see more
        console.log(
          `  ${pair.pairSymbol}: base=${pair.baseCrypto?.symbol || pair.baseCryptoId}, quote=${pair.quoteCrypto?.symbol || pair.quoteCryptoId} (IDs: ${pair.baseCryptoId}/${pair.quoteCryptoId})`,
        );
      }
    });

    // Get market data separately for better control
    const marketDataMap = new Map<number, MarketDataEntity>();

    for (const pair of tradingPairs) {
      const latestMarketData = await this.marketDataRepository.findOne({
        where: { tradingPairId: pair.id, deleted: false },
        order: { createdAt: 'DESC' },
      });

      if (latestMarketData) {
        marketDataMap.set(pair.id, latestMarketData);
      }
    }

    console.log('📈 Market data entries found:', marketDataMap.size);

    const opportunities: CreateArbitrageOpportunityDto[] = [];

    // Analyze triangular arbitrage opportunities
    // Pattern: Stablecoin -> Crypto1 -> Crypto2 -> Stablecoin
    // Example: USDT -> BTC -> ETH -> USDC
    for (const startStablecoin of stablecoins) {
      for (const midCrypto of cryptocurrencies) {
        // Step 1: Find pair between startStablecoin and midCrypto (USDT/BTC)
        const pair1 = this.findTradingPair(
          tradingPairs,
          startStablecoin.id,
          midCrypto.id,
        );

        if (!pair1) continue; // Skip if no pair exists

        // Step 2: Find pairs from midCrypto to other cryptocurrencies
        for (const endCrypto of cryptocurrencies) {
          if (midCrypto.id === endCrypto.id) continue; // Skip same crypto

          const pair2 = this.findTradingPair(
            tradingPairs,
            midCrypto.id,
            endCrypto.id,
          );

          if (!pair2) continue; // Skip if no pair exists

          // Step 3: Find pairs from endCrypto to ANY stablecoin (to complete the triangular cycle)
          for (const endStablecoin of stablecoins) {
            if (startStablecoin.id === endStablecoin.id) continue; // Must end in different stablecoin

            const pair3 = this.findTradingPair(
              tradingPairs,
              endCrypto.id,
              endStablecoin.id,
            );

            if (!pair3) continue; // Skip if no pair exists

            console.log(
              `🔄 Found valid triangular cycle: ${startStablecoin.symbol} -> ${midCrypto.symbol} -> ${endCrypto.symbol} -> ${endStablecoin.symbol}`,
            );
            console.log(
              `📈 Pairs: ${pair1.pairSymbol}, ${pair2.pairSymbol}, ${pair3.pairSymbol}`,
            );

            const marketData1 = marketDataMap.get(pair1.id);
            const marketData2 = marketDataMap.get(pair2.id);
            const marketData3 = marketDataMap.get(pair3.id);

            console.log(
              `📊 Market data availability: ${!!marketData1}, ${!!marketData2}, ${!!marketData3}`,
            );

            if (marketData1 && marketData2 && marketData3) {
              const profitPercentage =
                this.calculateTriangularProfitWithMarketData(
                  pair1,
                  pair2,
                  pair3,
                  marketData1,
                  marketData2,
                  marketData3,
                  startStablecoin.id,
                  midCrypto.id,
                  endCrypto.id,
                  endStablecoin.id,
                );

              console.log(
                `💰 Profit percentage: ${profitPercentage.toFixed(4)}%`,
              );

              if (profitPercentage >= minProfitPercentage) {
                opportunities.push({
                  profitPercentage,
                  cycleStartCryptoId: startStablecoin.id,
                  midCryptoId: midCrypto.id,
                  secondMidCryptoId: endCrypto.id, // This is the second intermediate crypto
                  endCryptoId: endStablecoin.id, // This is the final stablecoin
                });
              }
            }
          }
        }
      }
    }

    console.log(`✅ Found ${opportunities.length} profitable opportunities`);

    // Save profitable opportunities to database
    const savedOpportunities: ArbitrageOpportunityEntity[] = [];
    for (const opportunity of opportunities) {
      const entity = this.repository.create(opportunity);
      const saved = await this.repository.save(entity);
      savedOpportunities.push(saved);
    }

    return savedOpportunities;
  }

  async getTriangularArbitrageAnalysisDetails(
    minProfitPercentage: number = 0.1,
  ): Promise<TriangularArbitrageAnalysis[]> {
    // Get all stablecoins
    const stablecoins = await this.cryptoRepository.find({
      where: { type: 'stablecoin', deleted: false },
    });

    // Get all cryptocurrencies (non-stablecoins)
    const cryptocurrencies = await this.cryptoRepository.find({
      where: { type: 'cryptocoin', deleted: false },
    });

    // Get all trading pairs with their latest market data
    const tradingPairs = await this.tradingPairRepository
      .createQueryBuilder('tp')
      .leftJoinAndSelect('tp.baseCrypto', 'baseCrypto')
      .leftJoinAndSelect('tp.quoteCrypto', 'quoteCrypto')
      .leftJoinAndSelect(
        'tp.marketData',
        'md',
        'md.created_at = (SELECT MAX(md2.created_at) FROM market_data md2 WHERE md2.trading_pair_id = tp.trading_pair_id)',
      )
      .where('tp.deleted = false')
      .getMany();

    const analyses: TriangularArbitrageAnalysis[] = [];

    // Analyze triangular arbitrage opportunities with detailed steps
    // Pattern: Stablecoin -> Crypto1 -> Crypto2 -> Stablecoin
    for (const startStablecoin of stablecoins) {
      for (const midCrypto of cryptocurrencies) {
        // Step 1: Find pair between startStablecoin and midCrypto
        const pair1 = this.findTradingPair(
          tradingPairs,
          startStablecoin.id,
          midCrypto.id,
        );

        if (!pair1) continue;

        // Step 2: Find pairs from midCrypto to other cryptocurrencies
        for (const endCrypto of cryptocurrencies) {
          if (midCrypto.id === endCrypto.id) continue;

          const pair2 = this.findTradingPair(
            tradingPairs,
            midCrypto.id,
            endCrypto.id,
          );

          if (!pair2) continue;

          // Step 3: Find pairs from endCrypto to ANY stablecoin (different from start)
          for (const endStablecoin of stablecoins) {
            if (startStablecoin.id === endStablecoin.id) continue;

            const pair3 = this.findTradingPair(
              tradingPairs,
              endCrypto.id,
              endStablecoin.id,
            );

            if (!pair3) continue;

            const analysis = this.calculateDetailedTriangularProfit(
              pair1,
              pair2,
              pair3,
              startStablecoin,
              midCrypto,
              endCrypto,
              endStablecoin,
            );

            if (analysis && analysis.profitPercentage >= minProfitPercentage) {
              analyses.push(analysis);
            }
          }
        }
      }
    }

    return analyses.sort((a, b) => b.profitPercentage - a.profitPercentage);
  }

  private calculateDetailedTriangularProfit(
    pair1: TradingPairEntity,
    pair2: TradingPairEntity,
    pair3: TradingPairEntity,
    startCrypto: CryptoEntity,
    midCrypto: CryptoEntity,
    endCrypto: CryptoEntity,
    endStablecoin: CryptoEntity,
  ): TriangularArbitrageAnalysis | null {
    const marketData1 = pair1.marketData?.[0];
    const marketData2 = pair2.marketData?.[0];
    const marketData3 = pair3.marketData?.[0];

    if (!marketData1 || !marketData2 || !marketData3) {
      return null;
    }

    const initialAmount = 1000;
    let currentAmount = initialAmount;
    const steps: TriangularArbitrageStep[] = [];

    // Step 1: Convert start stablecoin to mid crypto
    const step1Amount = this.convertCurrency(
      currentAmount,
      startCrypto.id,
      midCrypto.id,
      pair1,
      marketData1,
    );
    steps.push({
      fromCrypto: startCrypto.symbol,
      toCrypto: midCrypto.symbol,
      tradingPair: pair1.pairSymbol,
      price: this.getConversionRate(
        startCrypto.id,
        midCrypto.id,
        pair1,
        marketData1,
      ),
      amount: step1Amount,
    });
    currentAmount = step1Amount;

    // Step 2: Convert mid crypto to end crypto
    const step2Amount = this.convertCurrency(
      currentAmount,
      midCrypto.id,
      endCrypto.id,
      pair2,
      marketData2,
    );
    steps.push({
      fromCrypto: midCrypto.symbol,
      toCrypto: endCrypto.symbol,
      tradingPair: pair2.pairSymbol,
      price: this.getConversionRate(
        midCrypto.id,
        endCrypto.id,
        pair2,
        marketData2,
      ),
      amount: step2Amount,
    });
    currentAmount = step2Amount;

    // Step 3: Convert end crypto to end stablecoin
    const finalAmount = this.convertCurrency(
      currentAmount,
      endCrypto.id,
      endStablecoin.id,
      pair3,
      marketData3,
    );
    steps.push({
      fromCrypto: endCrypto.symbol,
      toCrypto: endStablecoin.symbol,
      tradingPair: pair3.pairSymbol,
      price: this.getConversionRate(
        endCrypto.id,
        endStablecoin.id,
        pair3,
        marketData3,
      ),
      amount: finalAmount,
    });

    const profit = finalAmount - initialAmount;
    const profitPercentage = (profit / initialAmount) * 100;

    return {
      id: 0, // This would be set if saved to database
      profitPercentage,
      cycleStartCrypto: startCrypto.symbol,
      midCrypto: midCrypto.symbol,
      secondMidCrypto: endCrypto.symbol, // This is the second intermediate crypto
      endCrypto: endStablecoin.symbol, // This is the final stablecoin
      steps,
      initialAmount,
      finalAmount,
      createdAt: new Date(),
    };
  }

  private getConversionRate(
    fromCryptoId: number,
    toCryptoId: number,
    tradingPair: TradingPairEntity,
    marketData: MarketDataEntity,
  ): number {
    const { baseCryptoId, quoteCryptoId } = tradingPair;
    const { bidPrice, askPrice } = marketData;

    if (fromCryptoId === baseCryptoId && toCryptoId === quoteCryptoId) {
      return Number(bidPrice);
    } else if (fromCryptoId === quoteCryptoId && toCryptoId === baseCryptoId) {
      return 1 / Number(askPrice);
    }

    return 0;
  }

  async findStablecoinPairs(): Promise<{
    stablecoins: CryptoEntity[];
    cryptocurrencies: CryptoEntity[];
    availablePairs: string[];
  }> {
    const stablecoins = await this.cryptoRepository.find({
      where: { type: 'stablecoin', deleted: false },
    });

    const cryptocurrencies = await this.cryptoRepository.find({
      where: { type: 'cryptocoin', deleted: false },
    });

    const tradingPairs = await this.tradingPairRepository.find({
      where: { deleted: false },
      relations: ['baseCrypto', 'quoteCrypto'],
    });

    const availablePairs = tradingPairs.map((pair) => pair.pairSymbol);

    return {
      stablecoins,
      cryptocurrencies,
      availablePairs,
    };
  }

  private findTradingPair(
    tradingPairs: TradingPairEntity[],
    baseCryptoId: number,
    quoteCryptoId: number,
  ): TradingPairEntity | undefined {
    console.log(`🔍 Looking for pair: ${baseCryptoId} <-> ${quoteCryptoId}`);

    const found = tradingPairs.find(
      (pair) =>
        (pair.baseCryptoId === baseCryptoId &&
          pair.quoteCryptoId === quoteCryptoId) ||
        (pair.baseCryptoId === quoteCryptoId &&
          pair.quoteCryptoId === baseCryptoId),
    );

    if (found) {
      console.log(
        `✅ Found pair: ${found.pairSymbol} (${found.baseCryptoId}/${found.quoteCryptoId})`,
      );
    } else {
      console.log(`❌ No pair found for ${baseCryptoId} <-> ${quoteCryptoId}`);
      // Show some examples of what pairs exist for debugging
      const relatedPairs = tradingPairs.filter(
        (pair) =>
          pair.baseCryptoId === baseCryptoId ||
          pair.quoteCryptoId === baseCryptoId ||
          pair.baseCryptoId === quoteCryptoId ||
          pair.quoteCryptoId === quoteCryptoId,
      );
      console.log(
        `   Related pairs found: ${relatedPairs.map((p) => `${p.pairSymbol}(${p.baseCryptoId}/${p.quoteCryptoId})`).join(', ')}`,
      );
    }

    return found;
  }

  private calculateTriangularProfit(
    pair1: TradingPairEntity,
    pair2: TradingPairEntity,
    pair3: TradingPairEntity,
    startCryptoId: number,
    midCryptoId: number,
    endCryptoId: number,
  ): number {
    // Get the latest market data for each pair
    const marketData1 = pair1.marketData?.[0];
    const marketData2 = pair2.marketData?.[0];
    const marketData3 = pair3.marketData?.[0];

    if (!marketData1 || !marketData2 || !marketData3) {
      return 0; // No market data available
    }

    const initialAmount = 1000; // Start with 1000 units of the starting stablecoin

    // Step 1: Convert start stablecoin to mid crypto
    let currentAmount = this.convertCurrency(
      initialAmount,
      startCryptoId,
      midCryptoId,
      pair1,
      marketData1,
    );

    // Step 2: Convert mid crypto to end stablecoin
    currentAmount = this.convertCurrency(
      currentAmount,
      midCryptoId,
      endCryptoId,
      pair2,
      marketData2,
    );

    // Step 3: Convert end stablecoin back to start stablecoin
    const finalAmount = this.convertCurrency(
      currentAmount,
      endCryptoId,
      startCryptoId,
      pair3,
      marketData3,
    );

    // Calculate profit percentage
    const profit = finalAmount - initialAmount;
    const profitPercentage = (profit / initialAmount) * 100;

    return profitPercentage;
  }

  private calculateTriangularProfitWithMarketData(
    pair1: TradingPairEntity,
    pair2: TradingPairEntity,
    pair3: TradingPairEntity,
    marketData1: MarketDataEntity,
    marketData2: MarketDataEntity,
    marketData3: MarketDataEntity,
    startCryptoId: number,
    midCryptoId: number,
    endCryptoId: number,
    endStablecoinId: number,
  ): number {
    const initialAmount = 1000; // Start with 1000 units of the starting stablecoin

    console.log(`💰 Starting with ${initialAmount} of crypto ${startCryptoId}`);

    // Step 1: Convert start stablecoin to mid crypto
    let currentAmount = this.convertCurrency(
      initialAmount,
      startCryptoId,
      midCryptoId,
      pair1,
      marketData1,
    );
    console.log(
      `💱 Step 1: ${initialAmount} -> ${currentAmount} (${startCryptoId} to ${midCryptoId})`,
    );

    // Step 2: Convert mid crypto to end crypto
    const step2Amount = currentAmount;
    currentAmount = this.convertCurrency(
      currentAmount,
      midCryptoId,
      endCryptoId,
      pair2,
      marketData2,
    );
    console.log(
      `💱 Step 2: ${step2Amount} -> ${currentAmount} (${midCryptoId} to ${endCryptoId})`,
    );

    // Step 3: Convert end crypto to end stablecoin
    const step3Amount = currentAmount;
    const finalAmount = this.convertCurrency(
      currentAmount,
      endCryptoId,
      endStablecoinId,
      pair3,
      marketData3,
    );
    console.log(
      `💱 Step 3: ${step3Amount} -> ${finalAmount} (${endCryptoId} to ${endStablecoinId})`,
    );

    // Calculate profit percentage
    const profit = finalAmount - initialAmount;
    const profitPercentage = (profit / initialAmount) * 100;

    console.log(
      `📊 Final calculation: ${finalAmount} - ${initialAmount} = ${profit} (${profitPercentage.toFixed(4)}%)`,
    );

    return profitPercentage;
  }

  private convertCurrency(
    amount: number,
    fromCryptoId: number,
    toCryptoId: number,
    tradingPair: TradingPairEntity,
    marketData: MarketDataEntity,
  ): number {
    const { baseCryptoId, quoteCryptoId } = tradingPair;
    const { bidPrice, askPrice } = marketData;

    console.log(
      `🔄 Converting ${amount} from ${fromCryptoId} to ${toCryptoId}`,
    );
    console.log(`📊 Pair: base=${baseCryptoId}, quote=${quoteCryptoId}`);
    console.log(`💰 Prices: bid=${bidPrice}, ask=${askPrice}`);

    if (fromCryptoId === baseCryptoId && toCryptoId === quoteCryptoId) {
      // Selling base currency for quote currency (use bid price)
      const result = amount * Number(bidPrice);
      console.log(
        `💸 Selling base for quote: ${amount} * ${bidPrice} = ${result}`,
      );
      return result;
    } else if (fromCryptoId === quoteCryptoId && toCryptoId === baseCryptoId) {
      // Buying base currency with quote currency (use ask price)
      const result = amount / Number(askPrice);
      console.log(
        `💸 Buying base with quote: ${amount} / ${askPrice} = ${result}`,
      );
      return result;
    }

    console.log(
      `❌ Invalid conversion: ${fromCryptoId} -> ${toCryptoId} for pair ${baseCryptoId}/${quoteCryptoId}`,
    );
    return 0; // Invalid conversion
  }
}
