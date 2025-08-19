import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CryptoEntity } from 'src/features/cryptos/entities/crypto.entity';
import { TradingPairEntity } from 'src/features/cryptos/entities/trading-pair.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TradingPairsSeedService {
  constructor(
    @InjectRepository(TradingPairEntity)
    private tradingPairRepository: Repository<TradingPairEntity>,
    @InjectRepository(CryptoEntity)
    private cryptoRepository: Repository<CryptoEntity>,
  ) {}

  async run() {
    // First, get all crypto entities to map symbols to IDs
    const cryptos = await this.cryptoRepository.find();
    const cryptoMap = new Map<string, number>();
    cryptos.forEach((crypto) => {
      cryptoMap.set(crypto.symbol, crypto.id);
    });

    // Helper function to create trading pair
    const createTradingPair = (
      baseSymbol: string,
      quoteSymbol: string,
    ): {
      pairSymbol: string;
      baseCryptoId: number;
      quoteCryptoId: number;
    } | null => {
      const baseCryptoId = cryptoMap.get(baseSymbol);
      const quoteCryptoId = cryptoMap.get(quoteSymbol);

      if (!baseCryptoId || !quoteCryptoId) {
        console.warn(
          `Skipping pair ${baseSymbol}${quoteSymbol} - crypto not found`,
        );
        return null;
      }

      return {
        pairSymbol: `${baseSymbol}${quoteSymbol}`,
        baseCryptoId,
        quoteCryptoId,
      };
    };

    const allPairs: ReturnType<typeof createTradingPair>[] = [];

    // Bitcoin pairs
    // Bitcoin + Stablecoins
    const btcStablePairs = [
      createTradingPair('BTC', 'USDT'),
      createTradingPair('BTC', 'USDC'),
      createTradingPair('BTC', 'FDUSD'),
      createTradingPair('BTC', 'DAI'),
      createTradingPair('BTC', 'TUSD'),
    ];

    // Bitcoin + Other cryptos
    const btcCryptoPairs = [
      createTradingPair('ETH', 'BTC'),
      createTradingPair('XRP', 'BTC'),
      createTradingPair('BNB', 'BTC'),
      createTradingPair('SOL', 'BTC'),
      createTradingPair('DOGE', 'BTC'),
      createTradingPair('TRX', 'BTC'),
      createTradingPair('ADA', 'BTC'),
      createTradingPair('SUI', 'BTC'),
      createTradingPair('XLM', 'BTC'),
      createTradingPair('LINK', 'BTC'),
      createTradingPair('HBAR', 'BTC'),
      createTradingPair('BCH', 'BTC'),
      createTradingPair('AVAX', 'BTC'),
      createTradingPair('LTC', 'BTC'),
    ];

    // Ethereum pairs
    // Ethereum + Stablecoins
    const ethStablePairs = [
      createTradingPair('ETH', 'USDT'),
      createTradingPair('ETH', 'USDC'),
      createTradingPair('ETH', 'FDUSD'),
      createTradingPair('ETH', 'DAI'),
      createTradingPair('ETH', 'TUSD'),
    ];

    // Ethereum + Other cryptos
    const ethCryptoPairs = [
      createTradingPair('XRP', 'ETH'),
      createTradingPair('BNB', 'ETH'),
      createTradingPair('SOL', 'ETH'),
      createTradingPair('TRX', 'ETH'),
      createTradingPair('ADA', 'ETH'),
      createTradingPair('XLM', 'ETH'),
      createTradingPair('LINK', 'ETH'),
      createTradingPair('AVAX', 'ETH'),
      createTradingPair('LTC', 'ETH'),
    ];

    // XRP pairs
    // XRP + Stablecoins
    const xrpStablePairs = [
      createTradingPair('XRP', 'USDT'),
      createTradingPair('XRP', 'USDC'),
      createTradingPair('XRP', 'FDUSD'),
      createTradingPair('XRP', 'TUSD'),
    ];

    // XRP + Other cryptos
    const xrpCryptoPairs = [
      createTradingPair('XRP', 'BNB'),
      createTradingPair('TRX', 'XRP'),
    ];

    // BNB pairs
    // BNB + Stablecoins
    const bnbStablePairs = [
      createTradingPair('BNB', 'USDT'),
      createTradingPair('BNB', 'USDC'),
      createTradingPair('BNB', 'FDUSD'),
      createTradingPair('BNB', 'TUSD'),
    ];

    // BNB + Other cryptos
    const bnbCryptoPairs = [
      createTradingPair('SOL', 'BNB'),
      createTradingPair('TRX', 'BNB'),
      createTradingPair('ADA', 'BNB'),
      createTradingPair('SUI', 'BNB'),
      createTradingPair('LINK', 'BNB'),
      createTradingPair('HBAR', 'BNB'),
      createTradingPair('BCH', 'BNB'),
      createTradingPair('AVAX', 'BNB'),
      createTradingPair('LTC', 'BNB'),
    ];

    // SOL pairs
    // SOL + Stablecoins
    const solStablePairs = [
      createTradingPair('SOL', 'USDC'),
      createTradingPair('SOL', 'FDUSD'),
      createTradingPair('SOL', 'TUSD'),
    ];

    // DOGE pairs
    // DOGE + Stablecoins
    const dogeStablePairs = [
      createTradingPair('DOGE', 'USDC'),
      createTradingPair('DOGE', 'FDUSD'),
      createTradingPair('DOGE', 'TUSD'),
    ];

    // TRX pairs
    // TRX + Stablecoins
    const trxStablePairs = [
      createTradingPair('TRX', 'USDC'),
      createTradingPair('TRX', 'FDUSD'),
    ];

    // Additional USDT pairs for all remaining cryptocurrencies
    const additionalUsdtPairs = [
      createTradingPair('SOL', 'USDT'),
      createTradingPair('DOGE', 'USDT'),
      createTradingPair('TRX', 'USDT'),
      createTradingPair('ADA', 'USDT'),
      createTradingPair('SUI', 'USDT'),
      createTradingPair('XLM', 'USDT'),
      createTradingPair('LINK', 'USDT'),
      createTradingPair('HBAR', 'USDT'),
      createTradingPair('BCH', 'USDT'),
      createTradingPair('AVAX', 'USDT'),
      createTradingPair('LTC', 'USDT'),
      createTradingPair('TON', 'USDT'),
      createTradingPair('SHIB', 'USDT'),
      createTradingPair('UNI', 'USDT'),
      createTradingPair('DOT', 'USDT'),
      createTradingPair('ENA', 'USDT'),
      createTradingPair('PEPE', 'USDT'),
      createTradingPair('AAVE', 'USDT'),
      createTradingPair('TAO', 'USDT'),
      createTradingPair('ETC', 'USDT'),
      createTradingPair('NEAR', 'USDT'),
      createTradingPair('APT', 'USDT'),
      createTradingPair('ONDO', 'USDT'),
      createTradingPair('ICP', 'USDT'),
      createTradingPair('ARB', 'USDT'),
      createTradingPair('POL', 'USDT'),
      createTradingPair('ALGO', 'USDT'),
      createTradingPair('PENGU', 'USDT'),
      createTradingPair('VET', 'USDT'),
      createTradingPair('ATOM', 'USDT'),
      createTradingPair('BONK', 'USDT'),
      createTradingPair('RENDER', 'USDT'),
      createTradingPair('SEI', 'USDT'),
      createTradingPair('TRUMP', 'USDT'),
      createTradingPair('FIL', 'USDT'),
      createTradingPair('FET', 'USDT'),
      createTradingPair('JUP', 'USDT'),
      createTradingPair('TIA', 'USDT'),
      createTradingPair('FORM', 'USDT'),
      createTradingPair('IOTA', 'USDT'),
      createTradingPair('OP', 'USDT'),
      createTradingPair('CRV', 'USDT'),
      createTradingPair('QNT', 'USDT'),
      createTradingPair('STX', 'USDT'),
      createTradingPair('LDO', 'USDT'),
      createTradingPair('FLOKI', 'USDT'),
    ];

    // Combine all pairs
    allPairs.push(
      ...btcStablePairs,
      ...btcCryptoPairs,
      ...ethStablePairs,
      ...ethCryptoPairs,
      ...xrpStablePairs,
      ...xrpCryptoPairs,
      ...bnbStablePairs,
      ...bnbCryptoPairs,
      ...solStablePairs,
      ...dogeStablePairs,
      ...trxStablePairs,
      ...additionalUsdtPairs,
    );

    // Filter out nulls (failed pairs) and remove duplicates
    const validTradingPairs = allPairs.filter(
      (pair): pair is NonNullable<typeof pair> => pair !== null,
    );

    const uniquePairs = validTradingPairs.filter(
      (pair, index, self) =>
        index === self.findIndex((p) => p.pairSymbol === pair.pairSymbol),
    );

    const count = await this.tradingPairRepository.count();
    if (count > 0) {
      return;
    }

    // Insert trading pairs
    for (const pair of uniquePairs) {
      await this.tradingPairRepository.save(
        this.tradingPairRepository.create(pair),
      );
    }
  }
}
