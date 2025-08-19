import { NestFactory } from '@nestjs/core';
import { ConfigurationsSeedService } from './configurations/configurations-seed.service';
import { CryptocurrenciesSeedService } from './cryptocurrencies/cryptocurrencies-seed.service';
import { CryptosSeedService } from './cryptos/cryptos-seed.service';
import { TradingPairsSeedService } from './cryptos/trading-pairs-seed.service';
import { EvaluationTypesSeedService } from './evaluation-types/evaluation-types-seed.service';
import { OrderTypesSeedService } from './order-types/order-types-seed.service';
import { RecommendedActionsSeedService } from './recommended-actions/recommended-actions-seed.service';
import { SeedModule } from './seed.module';
import { TransactionTypesSeedService } from './transaction-types/transaction-types-seed.service';
import { VaultsSeedService } from './vaults/vaults-seed.service';
import { WalletsSeedService } from './wallets/wallets-seed.service';

const runSeed = async () => {
  const app = await NestFactory.create(SeedModule);

  // run
  await app.get(CryptocurrenciesSeedService).run();
  await app.get(EvaluationTypesSeedService).run();
  await app.get(RecommendedActionsSeedService).run();
  await app.get(WalletsSeedService).run();
  await app.get(TransactionTypesSeedService).run();
  await app.get(VaultsSeedService).run();
  await app.get(ConfigurationsSeedService).run();
  await app.get(OrderTypesSeedService).run();
  await app.get(CryptosSeedService).run();
  await app.get(TradingPairsSeedService).run();
  await app.close();
};

void runSeed();
