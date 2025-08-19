import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/auth/auth.guard';
import { ArbitrageOpportunitiesService } from './arbitrage-opportunities.service';

@Controller('arbitrage-opportunities')
export class ArbitrageOpportunitiesController {
  constructor(
    private readonly arbitrageOpportunitiesService: ArbitrageOpportunitiesService,
  ) {}
  @UseGuards(ApiKeyGuard)
  @Get('check')
  async checkOpportunities() {
    return this.arbitrageOpportunitiesService.checkOpportunities();
  }
}
