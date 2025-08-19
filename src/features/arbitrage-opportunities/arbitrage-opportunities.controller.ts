import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/auth/auth.guard';
import { ArbitrageOpportunitiesService } from './arbitrage-opportunities.service';

@Controller('arbitrage-opportunities')
export class ArbitrageOpportunitiesController {
  constructor(
    private readonly arbitrageOpportunitiesService: ArbitrageOpportunitiesService,
  ) {}
  @UseGuards(ApiKeyGuard)
  @Get()
  async getArbitrageOpportunities(@Query('page') page: number) {
    return this.arbitrageOpportunitiesService.getArbitrageOpportunities(page);
  }

  @UseGuards(ApiKeyGuard)
  @Get('analyze-triangular')
  async analyzeTriangularArbitrage(
    @Query('minProfitPercentage') minProfitPercentage?: number,
  ) {
    return this.arbitrageOpportunitiesService.analyzeTriangularArbitrage(
      minProfitPercentage,
    );
  }

  @UseGuards(ApiKeyGuard)
  @Get('analyze-triangular-detailed')
  async getTriangularArbitrageAnalysisDetails(
    @Query('minProfitPercentage') minProfitPercentage?: number,
  ) {
    return this.arbitrageOpportunitiesService.getTriangularArbitrageAnalysisDetails(
      minProfitPercentage,
    );
  }

  @UseGuards(ApiKeyGuard)
  @Get('stablecoin-pairs')
  async findStablecoinPairs() {
    return this.arbitrageOpportunitiesService.findStablecoinPairs();
  }

  @Get('debug/stablecoin-pairs')
  async debugStablecoinPairs() {
    return this.arbitrageOpportunitiesService.findStablecoinPairs();
  }

  @Get('debug/analyze-triangular')
  async debugAnalyzeTriangularArbitrage(
    @Query('minProfitPercentage') minProfitPercentage?: number,
  ) {
    return this.arbitrageOpportunitiesService.analyzeTriangularArbitrage(
      minProfitPercentage || 0.01,
    );
  }
}
