import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CryptocurrencyEntity } from 'src/features/prices/entities/cryptocurrency.entity';
import { CryptocurrenciesSeedService } from './cryptocurrencies-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([CryptocurrencyEntity])],
  providers: [CryptocurrenciesSeedService],
  exports: [CryptocurrenciesSeedService],
})
export class CryptocurrenciesSeedModule {}
