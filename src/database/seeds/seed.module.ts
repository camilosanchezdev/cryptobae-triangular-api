import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from 'src/config/app.config';
import databaseConfig from 'src/database/config/database.config';
import { TypeOrmConfigService } from 'src/database/typeorm-config.service';

import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigurationsSeedModule } from './configurations/configurations-seed.module';
import { CryptocurrenciesSeedModule } from './cryptocurrencies/cryptocurrencies-seed.module';
import { CryptosSeedModule } from './cryptos/cryptos-seed.module';
import { EvaluationTypesSeedModule } from './evaluation-types/evaluation-types-seed.module';
import { OrderTypesSeedModule } from './order-types/order-types-seed.module';
import { RecommendedActionsSeedModule } from './recommended-actions/recommended-actions-seed.module';
import { TransactionTypesSeedModule } from './transaction-types/transaction-types-seed.module';
import { VaultsSeedModule } from './vaults/vaults-seed.module';
import { WalletsSeedModule } from './wallets/wallets-seed.module';

@Module({
  imports: [
    CryptocurrenciesSeedModule,
    EvaluationTypesSeedModule,
    RecommendedActionsSeedModule,
    WalletsSeedModule,
    TransactionTypesSeedModule,
    VaultsSeedModule,
    ConfigurationsSeedModule,
    OrderTypesSeedModule,
    CryptosSeedModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
      envFilePath: ['.env'],
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
      dataSourceFactory: async (options: DataSourceOptions) => {
        return new DataSource(options).initialize();
      },
    }),
  ],
})
export class SeedModule {}
