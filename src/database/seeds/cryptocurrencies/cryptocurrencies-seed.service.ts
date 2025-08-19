import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CryptocurrencyEntity } from 'src/features/prices/entities/cryptocurrency.entity';
import { Cryptocurrencies } from 'src/features/prices/enums/cryptocurrencies.enum';
import { Repository } from 'typeorm';

@Injectable()
export class CryptocurrenciesSeedService {
  constructor(
    @InjectRepository(CryptocurrencyEntity)
    private repository: Repository<CryptocurrencyEntity>,
  ) {}

  async run() {
    const cryptocurrencies = [
      {
        id: Number(Cryptocurrencies.BTCUSDT),
        symbol: 'BTC/USDT',
        name: 'Bitcoin',
      },
      {
        id: Number(Cryptocurrencies.ETHUSDT),
        symbol: 'ETH/USDT',
        name: 'Ethereum',
      },
      {
        id: Number(Cryptocurrencies.XRPUSDT),
        symbol: 'XRP/USDT',
        name: 'XRP',
      },
      {
        id: Number(Cryptocurrencies.BNBUSDT),
        symbol: 'BNB/USDT',
        name: 'BNB',
      },
      {
        id: Number(Cryptocurrencies.SOLUSDT),
        symbol: 'SOL/USDT',
        name: 'Solana',
      },
      {
        id: Number(Cryptocurrencies.DOGEUSDT),
        symbol: 'DOGE/USDT',
        name: 'Dogecoin',
      },
      {
        id: Number(Cryptocurrencies.TRXUSDT),
        symbol: 'TRX/USDT',
        name: 'TRON',
      },
      {
        id: Number(Cryptocurrencies.ADAUSDT),
        symbol: 'ADA/USDT',
        name: 'Cardano',
      },
      {
        id: Number(Cryptocurrencies.SUIUSDT),
        symbol: 'SUI/USDT',
        name: 'Sui',
      },
      {
        id: Number(Cryptocurrencies.XLMUSDT),
        symbol: 'XLM/USDT',
        name: 'Stellar',
      },
      {
        id: Number(Cryptocurrencies.LINKUSDT),
        symbol: 'LINK/USDT',
        name: 'Chainlink',
      },
      {
        id: Number(Cryptocurrencies.HBARUSDT),
        symbol: 'HBAR/USDT',
        name: 'Hedera',
      },
      {
        id: Number(Cryptocurrencies.BCHUSDT),
        symbol: 'BCH/USDT',
        name: 'Bitcoin Cash',
      },
      {
        id: Number(Cryptocurrencies.AVAXUSDT),
        symbol: 'AVAX/USDT',
        name: 'Avalanche',
      },
      {
        id: Number(Cryptocurrencies.LTCUSDT),
        symbol: 'LTC/USDT',
        name: 'Litecoin',
      },
      {
        id: Number(Cryptocurrencies.TONUSDT),
        symbol: 'TON/USDT',
        name: 'Toncoin',
      },
      {
        id: Number(Cryptocurrencies.SHIBUSDT),
        symbol: 'SHIB/USDT',
        name: 'Shiba Inu',
      },
      {
        id: Number(Cryptocurrencies.UNIUSDT),
        symbol: 'UNI/USDT',
        name: 'Uniswap',
      },
      {
        id: Number(Cryptocurrencies.DOTUSDT),
        symbol: 'DOT/USDT',
        name: 'Polkadot',
      },
      {
        id: Number(Cryptocurrencies.ENAUSDT),
        symbol: 'ENA/USDT',
        name: 'Enjin Coin',
      },
      {
        id: Number(Cryptocurrencies.PEPEUSDT),
        symbol: 'PEPE/USDT',
        name: 'Pepe',
      },
      {
        id: Number(Cryptocurrencies.AAVEUSDT),
        symbol: 'AAVE/USDT',
        name: 'Aave',
      },
      {
        id: Number(Cryptocurrencies.TAOUSDT),
        symbol: 'TAO/USDT',
        name: 'Taos',
      },
      {
        id: Number(Cryptocurrencies.ETCUSDT),
        symbol: 'ETC/USDT',
        name: 'Ethereum Classic',
      },
      {
        id: Number(Cryptocurrencies.NEARUSDT),
        symbol: 'NEAR/USDT',
        name: 'Near Protocol',
      },
      {
        id: Number(Cryptocurrencies.APTUSDT),
        symbol: 'APT/USDT',
        name: 'Aptos',
      },
      {
        id: Number(Cryptocurrencies.ONDOUSDT),
        symbol: 'ONDO/USDT',
        name: 'Ondo Finance',
      },
      {
        id: Number(Cryptocurrencies.ICPUSDT),
        symbol: 'ICP/USDT',
        name: 'Internet Computer',
      },
      {
        id: Number(Cryptocurrencies.ARBUSDT),
        symbol: 'ARB/USDT',
        name: 'Arbitrum',
      },
      {
        id: Number(Cryptocurrencies.POLUSDT),
        symbol: 'POL/USDT',
        name: 'Polymath',
      },
      {
        id: Number(Cryptocurrencies.ALGOUSDT),
        symbol: 'ALGO/USDT',
        name: 'Algorand',
      },
      {
        id: Number(Cryptocurrencies.PENGUUSDT),
        symbol: 'PENGU/USDT',
        name: 'Penguin Finance',
      },
      {
        id: Number(Cryptocurrencies.VETUSDT),
        symbol: 'VET/USDT',
        name: 'VeChain',
      },
      {
        id: Number(Cryptocurrencies.ATOMUSDT),
        symbol: 'ATOM/USDT',
        name: 'Cosmos',
      },
      {
        id: Number(Cryptocurrencies.BONKUSDT),
        symbol: 'BONK/USDT',
        name: 'Bonk',
      },
      {
        id: Number(Cryptocurrencies.RENDERUSDT),
        symbol: 'RENDER/USDT',
        name: 'Render Token',
      },
      {
        id: Number(Cryptocurrencies.SEIUSDT),
        symbol: 'SEI/USDT',
        name: 'Sei Network',
      },
      {
        id: Number(Cryptocurrencies.TRUMPUSDT),
        symbol: 'TRUMP/USDT',
        name: 'TrumpCoin',
      },
      {
        id: Number(Cryptocurrencies.FILUSDT),
        symbol: 'FIL/USDT',
        name: 'Filecoin',
      },
      {
        id: Number(Cryptocurrencies.FETUSDT),
        symbol: 'FET/USDT',
        name: 'Fetch.ai',
      },
      {
        id: Number(Cryptocurrencies.JUPUSDT),
        symbol: 'JUP/USDT',
        name: 'Jupiter',
      },
      {
        id: Number(Cryptocurrencies.TIAUSDT),
        symbol: 'TIA/USDT',
        name: 'Tia',
      },
      {
        id: Number(Cryptocurrencies.FORMUSDT),
        symbol: 'FORM/USDT',
        name: 'Form',
      },
      {
        id: Number(Cryptocurrencies.IOTAUSDT),
        symbol: 'IOTA/USDT',
        name: 'IOTA',
      },
      {
        id: Number(Cryptocurrencies.OPUSDT),
        symbol: 'OP/USDT',
        name: 'Optimism',
      },
      {
        id: Number(Cryptocurrencies.CRVUSDT),
        symbol: 'CRV/USDT',
        name: 'Curve DAO Token',
      },
      {
        id: Number(Cryptocurrencies.QNTUSDT),
        symbol: 'QNT/USDT',
        name: 'Quant',
      },
      {
        id: Number(Cryptocurrencies.STXUSDT),
        symbol: 'STX/USDT',
        name: 'Stacks',
      },
      {
        id: Number(Cryptocurrencies.LDOUSDT),
        symbol: 'LDO/USDT',
        name: 'Lido DAO',
      },
      {
        id: Number(Cryptocurrencies.FLOKIUSDT),
        symbol: 'FLOKI/USDT',
        name: 'Floki Inu',
      },
    ];
    // const count = await this.repository.count();
    const cryptocurrenciesFiltered = cryptocurrencies.filter(
      (crypto) => crypto.id > 15,
    );
    const count = 0;
    if (count === 0) {
      // Insert with specific IDs
      for (const crypto of cryptocurrenciesFiltered) {
        await this.repository.save(
          this.repository.create({
            id: crypto.id,
            symbol: crypto.symbol,
            name: crypto.name,
          }),
        );
      }
    }
  }
}
