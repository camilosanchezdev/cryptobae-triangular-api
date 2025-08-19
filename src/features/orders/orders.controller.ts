import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/auth/auth.guard';
import { CreateBuyOrderDto } from './dtos/create-buy-order.dto';
import { CreateSellOrderDto } from './dtos/create-sell-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
  @UseGuards(ApiKeyGuard)
  @Post('create-buy-order')
  async createBuyOrder(@Body() body: CreateBuyOrderDto) {
    return this.ordersService.createBuyOrder(body);
  }

  @UseGuards(ApiKeyGuard)
  @Post('create-sell-order')
  async createSellOrder(@Body() body: CreateSellOrderDto) {
    return this.ordersService.createSellOrder(body);
  }

  @UseGuards(ApiKeyGuard)
  @Get('order-types')
  async getOrderTypes() {
    return this.ordersService.getOrderTypes();
  }
  @UseGuards(ApiKeyGuard)
  @Get()
  async getOrders(
    @Query('page') page: number,
    @Query('orderTypeId') orderTypeId: number,
  ) {
    return this.ordersService.getOrders(orderTypeId, page);
  }
}
