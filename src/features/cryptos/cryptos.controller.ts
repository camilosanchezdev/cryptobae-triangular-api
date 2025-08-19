import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/auth/auth.guard';
import { CryptosService } from './cryptos.service';

@Controller('cryptos')
export class CryptosController {
  constructor(private readonly cryptosService: CryptosService) {}
  @UseGuards(ApiKeyGuard)
  @Get('trading-pairs')
  async getTradingPairs(@Query('page') page: number) {
    return this.cryptosService.getTradingPairs(page);
  }
  @UseGuards(ApiKeyGuard)
  @Get('trading-pairs/all')
  async getAllTradingPairs() {
    return this.cryptosService.getAllTradingPairs();
  }
  @UseGuards(ApiKeyGuard)
  @Get('market-data')
  async getMarketData(@Query('page') page: number) {
    return this.cryptosService.getMarketData(page);
  }
  @UseGuards(ApiKeyGuard)
  @Get()
  async getCryptos(@Query('page') page: number) {
    return this.cryptosService.getCryptos(page);
  }
}
