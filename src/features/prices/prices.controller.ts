import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PricesService } from './prices.service';
import { ApiKeyGuard } from '../../auth/auth.guard';

@Controller('prices')
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  @UseGuards(ApiKeyGuard)
  @Get('check-min-price')
  async checkMinPrice(@Query('cryptocurrencyId') cryptocurrencyId: number) {
    return this.pricesService.checkMinPrice(+cryptocurrencyId);
  }

  @UseGuards(ApiKeyGuard)
  @Get('cryptocurrencies')
  async getCryptocurrencies() {
    return this.pricesService.getCryptocurrencies();
  }
  @UseGuards(ApiKeyGuard)
  @Get('lowest-price-frame')
  async lowestPriceOfFrame(
    @Query('cryptocurrencyId') cryptocurrencyId: number,
  ) {
    return this.pricesService.lowestPriceOfFrame(cryptocurrencyId);
  }

  @UseGuards(ApiKeyGuard)
  @Get('min-price-yesterday')
  async minPriceYesterday(@Query('cryptocurrencyId') cryptocurrencyId: number) {
    return this.pricesService.minPriceYesterday(cryptocurrencyId);
  }
  @UseGuards(ApiKeyGuard)
  @Get('current-volume')
  async getCurrentVolume(@Query('symbol') symbol: string) {
    return this.pricesService.currentVolume(symbol);
  }

  @UseGuards(ApiKeyGuard)
  @Get('average-volume')
  async getAverageVolume(@Query('symbol') symbol: string) {
    return this.pricesService.averageVolume(symbol);
  }
  @UseGuards(ApiKeyGuard)
  @Get('average-price-week')
  async getAveragePriceWeek(
    @Query('cryptocurrencyId') cryptocurrencyId: number,
  ) {
    return this.pricesService.getAveragePriceWeek(cryptocurrencyId);
  }
}
