import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import appConfig from './config/app.config';
import databaseConfig from './database/config/database.config';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { ArbitrageOpportunitiesModule } from './features/arbitrage-opportunities/arbitrage-opportunities.module';
import { BinanceModule } from './features/binance/binance.module';
import { ConfigurationsModule } from './features/configurations/configurations.module';
import { CryptosModule } from './features/cryptos/cryptos.module';
import { ErrorLogsModule } from './features/error-logs/error-logs.module';
import { FeesModule } from './features/fees/fees.module';
import { OrdersModule } from './features/orders/orders.module';
import { StatisticsModule } from './features/statistics/statistics.module';
import { TransactionsModule } from './features/transactions/transactions.module';
import { VaultsModule } from './features/vaults/vaults.module';

@Module({
  imports: [
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
    HttpModule,
    TransactionsModule,
    VaultsModule,
    BinanceModule,
    AuthModule,
    StatisticsModule,
    ConfigurationsModule,
    OrdersModule,
    FeesModule,
    ErrorLogsModule,
    CryptosModule,
    ArbitrageOpportunitiesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
