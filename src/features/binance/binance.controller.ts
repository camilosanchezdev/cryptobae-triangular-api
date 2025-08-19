// Only for testing
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../../auth/auth.guard';
import { BinanceService } from './binance.service';
import { BuyCryptoDto } from './dtos/buy-crypto.dto';
import { SellCryptoDto } from './dtos/sell-crypto.dto';

@Controller('binance')
export class BinanceController {
  constructor(private readonly binanceService: BinanceService) {}

  @UseGuards(ApiKeyGuard)
  @Get('account-info')
  async getAccountInfo() {
    return this.binanceService.getAccountInfo();
  }
  @UseGuards(ApiKeyGuard)
  @Post('sell')
  async placeMarketSellOrder(body: SellCryptoDto) {
    return await this.binanceService.placeMarketSellOrder(body);
  }

  @UseGuards(ApiKeyGuard)
  @Post('buy')
  async placeMarketBuyOrder(@Body() body: BuyCryptoDto) {
    return await this.binanceService.placeMarketBuyOrder(body);
  }

  @UseGuards(ApiKeyGuard)
  @Get('symbol-info')
  async getSymbolInfo(@Query('symbol') symbol: string) {
    return this.binanceService.getSymbolInfo(symbol);
  }

  @UseGuards(ApiKeyGuard)
  @Get('min-quantity')
  async getMinQuantity(@Query('symbol') symbol: string): Promise<number> {
    return this.binanceService.getMinQuantity(symbol);
  }
}
