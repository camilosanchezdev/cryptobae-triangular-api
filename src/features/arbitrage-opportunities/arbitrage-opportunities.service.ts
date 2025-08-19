import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CryptosService } from '../cryptos/cryptos.service';
import { ArbitrageOpportunityEntity } from './entities/arbitrage-opportunity.entity';
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
