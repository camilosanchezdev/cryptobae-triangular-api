import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from 'src/config/app.config';
import databaseConfig from 'src/database/config/database.config';
import { TypeOrmConfigService } from 'src/database/typeorm-config.service';

import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigurationsSeedModule } from './configurations/configurations-seed.module';
import { CryptosSeedModule } from './cryptos/cryptos-seed.module';
import { OrderTypesSeedModule } from './order-types/order-types-seed.module';
import { TransactionTypesSeedModule } from './transaction-types/transaction-types-seed.module';
import { VaultsSeedModule } from './vaults/vaults-seed.module';

@Module({
  imports: [
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
