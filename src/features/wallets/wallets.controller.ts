import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../../auth/auth.guard';
import { CreateWalletDto } from './dtos/create-wallet.dto';
import { WalletsService } from './wallets.service';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @UseGuards(ApiKeyGuard)
  @Post()
  async createWallet(@Body() body: CreateWalletDto) {
    return this.walletsService.createWallet(body);
  }

  @UseGuards(ApiKeyGuard)
  @Get()
  async getWallets(
    @Query('page') page: number,
    @Query('cryptocurrencyId') cryptocurrencyId: number,
    @Query('walletTypeId') walletTypeId: number,
    @Query('walletStatusId') walletStatusId: number,
  ) {
    return this.walletsService.getWallets(
      cryptocurrencyId,
      walletTypeId,
      walletStatusId,
      page,
    );
  }

  @UseGuards(ApiKeyGuard)
  @Post('reset')
  async resetWallets(@Body('token') token: string) {
    return this.walletsService.resetWallets(token);
  }

  @UseGuards(ApiKeyGuard)
  @Get('wallet-types')
  async getWalletTypes() {
    return this.walletsService.getWalletTypes();
  }

  @UseGuards(ApiKeyGuard)
  @Get('wallet-statuses')
  async getWalletStatuses() {
    return this.walletsService.getWalletStatuses();
  }

  @UseGuards(ApiKeyGuard)
  @Get('wallets-with-amount')
  async getWalletsWithAmount(
    @Query('cryptocurrencyId') cryptocurrencyId: number,
  ) {
    return this.walletsService.getWalletsWithAmount(cryptocurrencyId);
  }

  @UseGuards(ApiKeyGuard)
  @Get('stats')
  async getWalletsStats() {
    return this.walletsService.getWalletsStats();
  }
}
