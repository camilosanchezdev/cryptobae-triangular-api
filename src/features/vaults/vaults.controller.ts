import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiKeyGuard } from '../../auth/auth.guard';
import { DepositDto } from './dtos/deposit.dto';
import { WithdrawalDto } from './dtos/withdrawal.dto';
import { VaultsService } from './vaults.service';

@Controller('vaults')
export class VaultsController {
  constructor(private readonly vaultsService: VaultsService) {}

  @UseGuards(ApiKeyGuard)
  @Post('reset')
  async resetVaults(@Body('token') token: string) {
    return this.vaultsService.resetVaults(token);
  }
  @UseGuards(ApiKeyGuard)
  @Post('withdrawal')
  async createWithdrawal(@Body() body: WithdrawalDto) {
    return this.vaultsService.createWithdrawal(body);
  }
  @UseGuards(ApiKeyGuard)
  @Post('deposit')
  async createDeposit(@Body() body: DepositDto) {
    return this.vaultsService.createDeposit(body);
  }
  @UseGuards(ApiKeyGuard)
  @Get('master-vaults')
  async getMasterVaults() {
    return this.vaultsService.getMasterVaults();
  }

  @UseGuards(ApiKeyGuard)
  @Get('master-vaults/:id/movements')
  async getMasterVaultMovements(
    @Param('id') id: number,
    @Query('page') page: number,
  ) {
    return this.vaultsService.getMasterVaultMovements(id, page);
  }
  @UseGuards(ApiKeyGuard)
  @Get('master-vaults/capital')
  async getMasterVaultCapital() {
    return this.vaultsService.getMasterVaultCapital();
  }
}
