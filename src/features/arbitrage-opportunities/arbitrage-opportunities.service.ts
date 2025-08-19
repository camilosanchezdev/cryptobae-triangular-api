import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CryptosService } from '../cryptos/cryptos.service';
import { CreateArbitrageOpportunityDto } from './dtos/create-arbitrage-opportunity.dto';
import { ArbitrageOpportunityEntity } from './entities/arbitrage-opportunity.entity';
// Interface for cuadrangular (quadrangular) arbitrage path
interface CuadrangularPath {
  startStable: string;
  coin1: string;
  coin2: string;
  endStable: string;
  path: [string, string, string]; // e.g. [USDT->BTC, BTC->ETH, ETH->USDC]
  priceTypes: [
    'ask' | 'bid', // for first pair
    'ask' | 'bid', // for second pair
    'ask' | 'bid', // for third pair
  ];
  tradingPairIds: [number, number, number];
}
interface TriangularPath {
  startStable: string;
  coin: string;
  endStable: string;
  path: [string, string];
  priceTypes: [
    'ask' | 'bid', // for first pair
    'ask' | 'bid', // for second pair
  ];
  tradingPairIds: [number, number]; // IDs for the two pairs in the path
}
@Injectable()
export class ArbitrageOpportunitiesService {
  private readonly logger = new Logger(ArbitrageOpportunitiesService.name);
  private readonly minProfitPercentage = Number(
    process.env.CRYPTO_MIN_PROFIT_PERCENTAGE,
  );
  constructor(
    @InjectRepository(ArbitrageOpportunityEntity)
    private readonly repository: Repository<ArbitrageOpportunityEntity>,
    private readonly cryptoService: CryptosService,
  ) {}

  async createArbitrageOpportunity(body: CreateArbitrageOpportunityDto) {
    const opportunity = this.repository.create(body);
    await this.repository.save(opportunity);
  }
  /**
   * Checks if a triangular arbitrage is profitable.
   * @param startAmount Initial stablecoin amount (e.g., 1000 USDT)
   * @param askPrice1 Ask price for first buy (e.g., ETHUSDT)
   * @param bidPrice2 Bid price for second sell (e.g., ETHUSDC)
   * @param feeRate Total fee rate (e.g., 0.0015 for 0.15%)
   * @returns { profit: number, profitPercent: number, isProfitable: boolean }
   */
  checkTriangularArbitrageProfit(
    startAmount: number,
    askPrice1: number,
    bidPrice2: number,
    feeRate = 0.0015,
  ) {
    // Step 1: Buy ETH with USDT (pay ask price, deduct fee)
    const ethAmount = (startAmount / askPrice1) * (1 - feeRate / 2);

    // Step 2: Sell ETH for USDC (receive bid price, deduct fee)
    const finalStablecoin = ethAmount * bidPrice2 * (1 - feeRate / 2);

    // Calculate profit
    const profit = finalStablecoin - startAmount;
    const profitPercent = (profit / startAmount) * 100;
    const isProfitable = profit > 0;

    return { profit, profitPercent, isProfitable };
  }
  async checkOpportunity(path: TriangularPath) {
    const firstTradingPairPrices =
      await this.cryptoService.getPricesByTradingPair(path.tradingPairIds[0]);

    if (!firstTradingPairPrices) {
      this.logger.log('No prices found for first trading pair');
      return;
    }

    // Check the ASK price
    const askPrice = Number(firstTradingPairPrices.askPrice);

    const secondTradingPairPrices =
      await this.cryptoService.getPricesByTradingPair(path.tradingPairIds[1]);
    if (!secondTradingPairPrices) {
      this.logger.log('No prices found for second trading pair');
      return;
    }
    // Check the BID price
    const bidPrice = Number(secondTradingPairPrices.bidPrice);

    if (askPrice > bidPrice) {
      this.logger.log('Not profitable');
      return;
    }
    const difference = bidPrice - askPrice;
    const differencePercentage = (difference / askPrice) * 100;

    const fees = 0.0015; // 0.15% fee
    const netProfit = differencePercentage - fees * 100;

    if (netProfit < 0) {
      this.logger.log('Not profitable after fees');
      return;
    }
    if (netProfit < this.minProfitPercentage) {
      this.logger.log(
        'Not profitable after fees because min profit percentage not met',
      );
      return;
    }
    this.logger.log('==========================');
    this.logger.log(JSON.stringify(path, null, 2));
    this.logger.log('Profitable after fees: ' + netProfit);
    this.logger.log('==========================');
  }
  async checkOpportunities() {
    const tradingPairs = await this.cryptoService.getAllTradingPairs();
    const tradingPairsStr = tradingPairs.map((pair) => ({
      pairSymbol: pair.pairSymbol,
      id: pair.id,
    }));
    const stablecoins = await this.cryptoService.getStablecoins();
    const stablecoinStr = stablecoins.map((coin) => coin.symbol);
    const paths = this.getTriangularPaths(tradingPairsStr, stablecoinStr);
    // console.log('Triangular paths:', paths);
    for (const path of paths) {
      await this.checkOpportunity(path);
    }
    return;
    // Example usage:
    // USDT -> ETH (buy ETH with USDT at ask), then ETH -> USDC (sell ETH for USDC at bid)
    const startAmount = 100; // 100 USDT
    const askPrice1 = 4220.21; // ETHUSDT ask price
    const bidPrice2 = 4220.73; // ETHUSDC bid price
    const feeRate = 0.0015; // 0.15%
    const result = this.checkTriangularArbitrageProfit(
      startAmount,
      askPrice1,
      bidPrice2,
      feeRate,
    );
    console.log('Triangular arbitrage result:', result);

    return 'Hola mundo';
  }

  /**
   * Returns all possible stablecoin -> coin1 -> coin2 -> stablecoin cuadrangular arbitrage paths
   * E.g. USDT->BTC->ETH->USDC
   * @param tradingPairs Array of trading pairs, e.g. [ {pairSymbol: 'BTCUSDT', id: 1}, ... ]
   * @param stablecoins Array of stablecoin symbols, e.g. [ 'USDT', 'USDC', 'BUSD' ]
   * @returns Array of CuadrangularPath
   */
  getCuadrangularPaths(
    tradingPairs: { pairSymbol: string; id: number }[],
    stablecoins: string[],
  ): CuadrangularPath[] {
    const paths: CuadrangularPath[] = [];
    const tradingPairsMap = new Map<string, number>();
    for (const pair of tradingPairs) {
      tradingPairsMap.set(pair.pairSymbol, pair.id);
    }
    const tradingPairsStr = tradingPairs.map((p) => p.pairSymbol);
    const coins = this.getCoinsFromPairs(tradingPairsStr, stablecoins);
    for (const startStable of stablecoins) {
      for (const endStable of stablecoins) {
        if (endStable === startStable) continue;
        for (const coin1 of coins) {
          if (stablecoins.includes(coin1)) continue;
          for (const coin2 of coins) {
            if (coin2 === coin1 || stablecoins.includes(coin2)) continue;
            // Find the three pairs: startStable->coin1, coin1->coin2, coin2->endStable
            const pair1 = this.findPair(tradingPairsStr, coin1, startStable);
            const pair2 = this.findPair(tradingPairsStr, coin2, coin1);
            const pair3 = this.findPair(tradingPairsStr, coin2, endStable);
            if (pair1 && pair2 && pair3) {
              const priceTypes: ['ask', 'ask', 'bid'] = ['ask', 'ask', 'bid'];
              const tradingPairIds: [number, number, number] = [
                tradingPairsMap.get(pair1) ?? 0,
                tradingPairsMap.get(pair2) ?? 0,
                tradingPairsMap.get(pair3) ?? 0,
              ];
              paths.push({
                startStable,
                coin1,
                coin2,
                endStable,
                path: [pair1, pair2, pair3],
                priceTypes,
                tradingPairIds,
              });
            }
          }
        }
      }
    }
    return paths;
  }

  /**
   * Checks if a cuadrangular arbitrage is profitable.
   * @param startAmount Initial stablecoin amount (e.g., 1000 USDT)
   * @param askPrice1 Ask price for first buy (e.g., BTCUSDT)
   * @param askPrice2 Ask price for second buy (e.g., ETHBTC)
   * @param bidPrice3 Bid price for final sell (e.g., ETHUSDC)
   * @param feeRate Total fee rate (e.g., 0.0015 for 0.15%)
   * @returns { profit: number, profitPercent: number, isProfitable: boolean }
   */
  /**
   * Handles direction for each pair: if the pair is BASEQUOTE, then:
   *   - To buy BASE with QUOTE, use ask price: amount / askPrice
   *   - To sell BASE for QUOTE, use bid price: amount * bidPrice
   * If the pair is QUOTEBASE, reverse the operation.
   * This function auto-detects direction for each step.
   */
  checkCuadrangularArbitrageProfit(
    startAmount: number,
    askPrice1: number,
    askPrice2: number,
    bidPrice3: number,
    feeRate = 0.00075, // 0.075% per trade
    path?: [string, string, string],
    startStable?: string,
    coin1?: string,
    coin2?: string,
    endStable?: string,
  ) {
    // Step 1: Buy coin1 with startStable
    // If pair1 is coin1+startStable, then buy coin1 with startStable: amount / askPrice
    // If pair1 is startStable+coin1, then buy coin1 with startStable: amount * askPrice
    let coin1Amount: number;
    if (path && startStable && coin1) {
      if (path[0] === coin1 + startStable) {
        coin1Amount = (startAmount / askPrice1) * (1 - feeRate);
      } else if (path[0] === startStable + coin1) {
        coin1Amount = startAmount * askPrice1 * (1 - feeRate);
      } else {
        throw new Error('Invalid pair1 direction');
      }
    } else {
      coin1Amount = (startAmount / askPrice1) * (1 - feeRate);
    }

    // Step 2: Buy coin2 with coin1
    // If pair2 is coin2+coin1, then buy coin2 with coin1: coin1Amount / askPrice2
    // If pair2 is coin1+coin2, then buy coin2 with coin1: coin1Amount * askPrice2
    let coin2Amount: number;
    if (path && coin1 && coin2) {
      if (path[1] === coin2 + coin1) {
        coin2Amount = (coin1Amount / askPrice2) * (1 - feeRate);
      } else if (path[1] === coin1 + coin2) {
        coin2Amount = coin1Amount * askPrice2 * (1 - feeRate);
      } else {
        throw new Error('Invalid pair2 direction');
      }
    } else {
      coin2Amount = (coin1Amount / askPrice2) * (1 - feeRate);
    }

    // Step 3: Sell coin2 for endStable
    // If pair3 is coin2+endStable, then sell coin2 for endStable: coin2Amount * bidPrice3
    // If pair3 is endStable+coin2, then sell coin2 for endStable: coin2Amount / bidPrice3
    let finalStablecoin: number;
    if (path && coin2 && endStable) {
      if (path[2] === coin2 + endStable) {
        finalStablecoin = coin2Amount * bidPrice3 * (1 - feeRate);
      } else if (path[2] === endStable + coin2) {
        finalStablecoin = (coin2Amount / bidPrice3) * (1 - feeRate);
      } else {
        throw new Error('Invalid pair3 direction');
      }
    } else {
      finalStablecoin = coin2Amount * bidPrice3 * (1 - feeRate);
    }

    // Calculate profit
    const profit = finalStablecoin - startAmount;
    const profitPercent = (profit / startAmount) * 100;
    const isProfitable = profit > 0;
    return { profit, profitPercent, isProfitable };
  }

  /**
   * Checks a single cuadrangular opportunity for profitability and logs the result.
   */
  async checkCuadrangularOpportunity(path: CuadrangularPath): Promise<boolean> {
    const [pairId1, pairId2, pairId3] = path.tradingPairIds;
    const prices1 = await this.cryptoService.getPricesByTradingPair(pairId1);
    if (!prices1) {
      this.logger.log('No prices found for first trading pair');
      return false;
    }
    const askPrice1 = Number(prices1.askPrice);
    const prices2 = await this.cryptoService.getPricesByTradingPair(pairId2);
    if (!prices2) {
      this.logger.log('No prices found for second trading pair');
      return false;
    }
    const askPrice2 = Number(prices2.askPrice);
    const prices3 = await this.cryptoService.getPricesByTradingPair(pairId3);
    if (!prices3) {
      this.logger.log('No prices found for third trading pair');
      return false;
    }
    const bidPrice3 = Number(prices3.bidPrice);
    // Use the profit check
    const startAmount = 100; // Example amount
    const { profitPercent, isProfitable } =
      this.checkCuadrangularArbitrageProfit(
        startAmount,
        askPrice1,
        askPrice2,
        bidPrice3,
        0.00075,
        path.path,
        path.startStable,
        path.coin1,
        path.coin2,
        path.endStable,
      );
    // Write result to file instead of logging
    const resultLine = JSON.stringify({
      path,
      askPrice1,
      askPrice2,
      bidPrice3,
      profitPercent,
      isProfitable,
      minProfitPercent: this.minProfitPercentage,
      profitable: isProfitable && profitPercent >= this.minProfitPercentage,
      timestamp: new Date().toISOString(),
    });
    if (isProfitable && profitPercent >= this.minProfitPercentage) {
      const newOpportunity: CreateArbitrageOpportunityDto = {
        profitPercentage: profitPercent,
        minProfitPercent: this.minProfitPercentage,
        firstTradingPairId: path.tradingPairIds[0],
        secondTradingPairId: path.tradingPairIds[1],
        thirdTradingPairId: path.tradingPairIds[2],
        askPrice1: askPrice1,
        askPrice2: askPrice2,
        bidPrice: bidPrice3,
      };
      await this.createArbitrageOpportunity(newOpportunity);
      return true;
    }
    return false;
  }

  /**
   * Checks all cuadrangular opportunities for profitability.
   */
  async checkCuadrangularOpportunities() {
    const tradingPairs = await this.cryptoService.getAllTradingPairs();
    const tradingPairsStr = tradingPairs.map((pair) => ({
      pairSymbol: pair.pairSymbol,
      id: pair.id,
    }));
    const stablecoins = await this.cryptoService.getStablecoins();
    const stablecoinStr = stablecoins.map((coin) => coin.symbol);
    const paths = this.getCuadrangularPaths(tradingPairsStr, stablecoinStr);

    for (const path of paths) {
      await this.checkCuadrangularOpportunity(path);
    }
  }
  // Helper interface for triangular path

  /**
   * Returns all possible stablecoin -> coin -> stablecoin triangular arbitrage paths
   * based on available trading pairs. E.g. USDT->ETH->USDC, USDC->ETH->USDT, etc.
   *
   * @param tradingPairs Array of trading pairs, e.g. [ 'ETHUSDT', 'ETHUSDC', ... ]
   * @param stablecoins Array of stablecoin symbols, e.g. [ 'USDT', 'USDC', 'BUSD' ]
   * @returns Array of TriangularPath
   */
  /**
   * tradingPairs: array of objects { pairSymbol: string, id: string }
   * stablecoins: array of strings
   */
  getTriangularPaths(
    tradingPairs: { pairSymbol: string; id: number }[],
    stablecoins: string[],
  ): TriangularPath[] {
    const paths: TriangularPath[] = [];
    const tradingPairsMap = new Map<string, number>();
    for (const pair of tradingPairs) {
      tradingPairsMap.set(pair.pairSymbol, pair.id);
    }
    const tradingPairsStr = tradingPairs.map((p) => p.pairSymbol);
    for (const startStable of stablecoins) {
      for (const endStable of stablecoins) {
        if (endStable === startStable) continue;
        const coins = this.getCoinsFromPairs(tradingPairsStr, stablecoins);
        for (const coin of coins) {
          const pair1 = this.findPair(tradingPairsStr, coin, startStable);
          const pair2 = this.findPair(tradingPairsStr, coin, endStable);
          if (pair1 && pair2) {
            const priceTypes: ['ask', 'bid'] = ['ask', 'bid'];
            const tradingPairIds: [number, number] = [
              tradingPairsMap.get(pair1) ?? 0,
              tradingPairsMap.get(pair2) ?? 0,
            ];
            paths.push({
              startStable,
              coin,
              endStable,
              path: [pair1, pair2],
              priceTypes,
              tradingPairIds,
            });
          }
        }
      }
    }
    return paths;
  }

  /**
   * Helper to extract all coins (non-stablecoins) from trading pairs
   */
  getCoinsFromPairs(tradingPairs: string[], stablecoins: string[]): string[] {
    const coins = new Set<string>();
    for (const pair of tradingPairs) {
      for (const stable of stablecoins) {
        if (pair.endsWith(stable)) {
          const coin = pair.slice(0, pair.length - stable.length);
          if (coin && !stablecoins.includes(coin)) {
            coins.add(coin);
          }
        }
      }
    }
    return Array.from(coins);
  }

  /**
   * Helper to find a trading pair for coin and stablecoin, returns pair string or undefined
   * Looks for both COINSTABLE and STABLECOINCOIN (for both directions)
   */
  findPair(
    tradingPairs: string[],
    coin: string,
    stable: string,
  ): string | undefined {
    const direct = coin + stable;
    const inverse = stable + coin;
    if (tradingPairs.includes(direct)) return direct;
    if (tradingPairs.includes(inverse)) return inverse;
    return undefined;
  }
}
