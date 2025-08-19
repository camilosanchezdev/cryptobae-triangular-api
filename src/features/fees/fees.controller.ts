import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/auth/auth.guard';
import { FeesService } from './fees.service';

@Controller('fees')
export class FeesController {
  constructor(private readonly feesService: FeesService) {}
  //   @UseGuards(ApiKeyGuard)
  //   @Post('create-buy-order')
  //   async createBuyOrder(@Body() body: CreateBuyOrderDto) {
  //     return this.ordersService.createBuyOrder(body);
  //   }

  //   @UseGuards(ApiKeyGuard)
  //   @Post('create-sell-order')
  //   async createSellOrder(@Body() body: CreateSellOrderDto) {
  //     return this.ordersService.createSellOrder(body);
  //   }

  @UseGuards(ApiKeyGuard)
  @Get()
  async getEvaluations(@Query('page') page: number) {
    return this.feesService.getFees(page);
  }
}
