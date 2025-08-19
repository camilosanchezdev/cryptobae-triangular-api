import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CryptoEntity } from 'src/features/cryptos/entities/crypto.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CryptosSeedService {
  constructor(
    @InjectRepository(CryptoEntity)
    private cryptoRepository: Repository<CryptoEntity>,
  ) {}

  async run() {
    const items = [
      // Stablecoins
      {
        name: 'Tether',
        symbol: 'USDT',
        type: 'stablecoin',
      },
      {
        name: 'USD Coin',
        symbol: 'USDC',
        type: 'stablecoin',
      },
      {
        name: 'XUSD',
        symbol: 'XUSD',
        type: 'stablecoin',
      },
      {
        name: 'First Digital USD',
        symbol: 'FDUSD',
        type: 'stablecoin',
      },
      {
        name: 'Dai',
        symbol: 'DAI',
        type: 'stablecoin',
      },
      {
        name: 'TrueUSD',
        symbol: 'TUSD',
        type: 'stablecoin',
      },
      {
        name: 'Pax Dollar',
        symbol: 'USDP',
        type: 'stablecoin',
      },
      // Cryptocoins
      {
        name: 'Bitcoin',
        symbol: 'BTC',
        type: 'cryptocoin',
      },
      {
        name: 'Ethereum',
        symbol: 'ETH',
        type: 'cryptocoin',
      },
      {
        name: 'XRP',
        symbol: 'XRP',
        type: 'cryptocoin',
      },
      {
        name: 'BNB',
        symbol: 'BNB',
        type: 'cryptocoin',
      },
      {
        name: 'Solana',
        symbol: 'SOL',
        type: 'cryptocoin',
      },
      {
        name: 'Dogecoin',
        symbol: 'DOGE',
        type: 'cryptocoin',
      },
      {
        name: 'TRON',
        symbol: 'TRX',
        type: 'cryptocoin',
      },
      {
        name: 'Cardano',
        symbol: 'ADA',
        type: 'cryptocoin',
      },
      {
        name: 'Sui',
        symbol: 'SUI',
        type: 'cryptocoin',
      },
      {
        name: 'Stellar',
        symbol: 'XLM',
        type: 'cryptocoin',
      },
      {
        name: 'Chainlink',
        symbol: 'LINK',
        type: 'cryptocoin',
      },
      {
        name: 'Hedera',
        symbol: 'HBAR',
        type: 'cryptocoin',
      },
      {
        name: 'Bitcoin Cash',
        symbol: 'BCH',
        type: 'cryptocoin',
      },
      {
        name: 'Avalanche',
        symbol: 'AVAX',
        type: 'cryptocoin',
      },
      {
        name: 'Litecoin',
        symbol: 'LTC',
        type: 'cryptocoin',
      },
      {
        name: 'Toncoin',
        symbol: 'TON',
        type: 'cryptocoin',
      },
      {
        name: 'Shiba Inu',
        symbol: 'SHIB',
        type: 'cryptocoin',
      },
      {
        name: 'Uniswap',
        symbol: 'UNI',
        type: 'cryptocoin',
      },
      {
        name: 'Polkadot',
        symbol: 'DOT',
        type: 'cryptocoin',
      },
      {
        name: 'Ethena',
        symbol: 'ENA',
        type: 'cryptocoin',
      },
      {
        name: 'Pepe',
        symbol: 'PEPE',
        type: 'cryptocoin',
      },
      {
        name: 'Aave',
        symbol: 'AAVE',
        type: 'cryptocoin',
      },
      {
        name: 'Bittensor',
        symbol: 'TAO',
        type: 'cryptocoin',
      },
      {
        name: 'Ethereum Classic',
        symbol: 'ETC',
        type: 'cryptocoin',
      },
      {
        name: 'NEAR Protocol',
        symbol: 'NEAR',
        type: 'cryptocoin',
      },
      {
        name: 'Aptos',
        symbol: 'APT',
        type: 'cryptocoin',
      },
      {
        name: 'Ondo',
        symbol: 'ONDO',
        type: 'cryptocoin',
      },
      {
        name: 'Internet Computer',
        symbol: 'ICP',
        type: 'cryptocoin',
      },
      {
        name: 'Arbitrum',
        symbol: 'ARB',
        type: 'cryptocoin',
      },
      {
        name: 'Polygon',
        symbol: 'POL',
        type: 'cryptocoin',
      },
      {
        name: 'Algorand',
        symbol: 'ALGO',
        type: 'cryptocoin',
      },
      {
        name: 'Pudgy Penguins',
        symbol: 'PENGU',
        type: 'cryptocoin',
      },
      {
        name: 'VeChain',
        symbol: 'VET',
        type: 'cryptocoin',
      },
      {
        name: 'Cosmos',
        symbol: 'ATOM',
        type: 'cryptocoin',
      },
      {
        name: 'Bonk',
        symbol: 'BONK',
        type: 'cryptocoin',
      },
      {
        name: 'Render',
        symbol: 'RENDER',
        type: 'cryptocoin',
      },
      {
        name: 'Sei',
        symbol: 'SEI',
        type: 'cryptocoin',
      },
      {
        name: 'TRUMP',
        symbol: 'TRUMP',
        type: 'cryptocoin',
      },
      {
        name: 'Filecoin',
        symbol: 'FIL',
        type: 'cryptocoin',
      },
      {
        name: 'Fetch.ai',
        symbol: 'FET',
        type: 'cryptocoin',
      },
      {
        name: 'Jupiter',
        symbol: 'JUP',
        type: 'cryptocoin',
      },
      {
        name: 'Celestia',
        symbol: 'TIA',
        type: 'cryptocoin',
      },
      {
        name: 'Forma',
        symbol: 'FORM',
        type: 'cryptocoin',
      },
      {
        name: 'IOTA',
        symbol: 'IOTA',
        type: 'cryptocoin',
      },
      {
        name: 'Optimism',
        symbol: 'OP',
        type: 'cryptocoin',
      },
      {
        name: 'Curve DAO Token',
        symbol: 'CRV',
        type: 'cryptocoin',
      },
      {
        name: 'Quant',
        symbol: 'QNT',
        type: 'cryptocoin',
      },
      {
        name: 'Stacks',
        symbol: 'STX',
        type: 'cryptocoin',
      },
      {
        name: 'Lido DAO',
        symbol: 'LDO',
        type: 'cryptocoin',
      },
      {
        name: 'FLOKI',
        symbol: 'FLOKI',
        type: 'cryptocoin',
      },
    ];
    const count = await this.cryptoRepository.count();
    if (count > 0) {
      return;
    }
    // Insert with specific IDs
    for (const item of items) {
      await this.cryptoRepository.save(
        this.cryptoRepository.create({
          ...item,
        }),
      );
    }
  }
  //   async runTradingPairs() {
  //     // First, get all crypto entities to map symbols to IDs
  //     const cryptos = await this.cryptoRepository.find();
  //     const cryptoMap = new Map<string, number>();
  //     cryptos.forEach((crypto) => {
  //       cryptoMap.set(crypto.symbol, crypto.id);
  //     });

  //     // Helper function to create trading pair
  //     const createTradingPair = (
  //       baseSymbol: string,
  //       quoteSymbol: string,
  //     ): {
  //       pairSymbol: string;
  //       baseCryptoId: number;
  //       quoteCryptoId: number;
  //     } | null => {
  //       const baseCryptoId = cryptoMap.get(baseSymbol);
  //       const quoteCryptoId = cryptoMap.get(quoteSymbol);

  //       if (!baseCryptoId || !quoteCryptoId) {
  //         console.warn(
  //           `Skipping pair ${baseSymbol}${quoteSymbol} - crypto not found`,
  //         );
  //         return null;
  //       }

  //       return {
  //         pairSymbol: `${baseSymbol}${quoteSymbol}`,
  //         baseCryptoId,
  //         quoteCryptoId,
  //       };
  //     };

  //     const allPairs: ReturnType<typeof createTradingPair>[] = [];

  //     // Bitcoin pairs
  //     // Bitcoin + Stablecoins
  //     const btcStablePairs = [
  //       createTradingPair('BTC', 'USDT'),
  //       createTradingPair('BTC', 'USDC'),
  //       createTradingPair('BTC', 'FDUSD'),
  //       createTradingPair('BTC', 'DAI'),
  //       createTradingPair('BTC', 'TUSD'),
  //     ];

  //     // Bitcoin + Other cryptos
  //     const btcCryptoPairs = [
  //       createTradingPair('ETH', 'BTC'),
  //       createTradingPair('XRP', 'BTC'),
  //       createTradingPair('BNB', 'BTC'),
  //       createTradingPair('SOL', 'BTC'),
  //       createTradingPair('DOGE', 'BTC'),
  //       createTradingPair('TRX', 'BTC'),
  //       createTradingPair('ADA', 'BTC'),
  //       createTradingPair('SUI', 'BTC'),
  //       createTradingPair('XLM', 'BTC'),
  //       createTradingPair('LINK', 'BTC'),
  //       createTradingPair('HBAR', 'BTC'),
  //       createTradingPair('BCH', 'BTC'),
  //       createTradingPair('AVAX', 'BTC'),
  //       createTradingPair('LTC', 'BTC'),
  //     ];

  //     // Ethereum pairs
  //     // Ethereum + Stablecoins
  //     const ethStablePairs = [
  //       createTradingPair('ETH', 'USDT'),
  //       createTradingPair('ETH', 'USDC'),
  //       createTradingPair('ETH', 'FDUSD'),
  //       createTradingPair('ETH', 'DAI'),
  //       createTradingPair('ETH', 'TUSD'),
  //     ];

  //     // Ethereum + Other cryptos
  //     const ethCryptoPairs = [
  //       createTradingPair('XRP', 'ETH'),
  //       createTradingPair('BNB', 'ETH'),
  //       createTradingPair('SOL', 'ETH'),
  //       createTradingPair('TRX', 'ETH'),
  //       createTradingPair('ADA', 'ETH'),
  //       createTradingPair('XLM', 'ETH'),
  //       createTradingPair('LINK', 'ETH'),
  //       createTradingPair('AVAX', 'ETH'),
  //       createTradingPair('LTC', 'ETH'),
  //     ];

  //     // XRP pairs
  //     // XRP + Stablecoins
  //     const xrpStablePairs = [
  //       createTradingPair('XRP', 'USDT'),
  //       createTradingPair('XRP', 'USDC'),
  //       createTradingPair('XRP', 'FDUSD'),
  //       createTradingPair('XRP', 'TUSD'),
  //     ];

  //     // XRP + Other cryptos
  //     const xrpCryptoPairs = [
  //       createTradingPair('XRP', 'BNB'),
  //       createTradingPair('TRX', 'XRP'),
  //     ];

  //     // BNB pairs
  //     // BNB + Stablecoins
  //     const bnbStablePairs = [
  //       createTradingPair('BNB', 'USDT'),
  //       createTradingPair('BNB', 'USDC'),
  //       createTradingPair('BNB', 'FDUSD'),
  //       createTradingPair('BNB', 'TUSD'),
  //     ];

  //     // BNB + Other cryptos
  //     const bnbCryptoPairs = [
  //       createTradingPair('SOL', 'BNB'),
  //       createTradingPair('TRX', 'BNB'),
  //       createTradingPair('ADA', 'BNB'),
  //       createTradingPair('SUI', 'BNB'),
  //       createTradingPair('LINK', 'BNB'),
  //       createTradingPair('HBAR', 'BNB'),
  //       createTradingPair('BCH', 'BNB'),
  //       createTradingPair('AVAX', 'BNB'),
  //       createTradingPair('LTC', 'BNB'),
  //     ];

  //     // Combine all pairs
  //     allPairs.push(
  //       ...btcStablePairs,
  //       ...btcCryptoPairs,
  //       ...ethStablePairs,
  //       ...ethCryptoPairs,
  //       ...xrpStablePairs,
  //       ...xrpCryptoPairs,
  //       ...bnbStablePairs,
  //       ...bnbCryptoPairs,
  //     );

  //     // Filter out nulls (failed pairs) and remove duplicates
  //     const validTradingPairs = allPairs.filter(
  //       (pair): pair is NonNullable<typeof pair> => pair !== null,
  //     );

  //     const uniquePairs = validTradingPairs.filter(
  //       (pair, index, self) =>
  //         index === self.findIndex((p) => p.pairSymbol === pair.pairSymbol),
  //     );

  //     const count = await this.tradingPairRepository.count();
  //     if (count > 0) {
  //       return;
  //     }

  //     // Insert trading pairs
  //     for (const pair of uniquePairs) {
  //       await this.tradingPairRepository.save(
  //         this.tradingPairRepository.create(pair),
  //       );
  //     }
  //   }
}
