import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../../auth/auth.guard';
import { EvaluationsService } from './evaluations.service';

@Controller('evaluations')
export class EvaluationsController {
  constructor(private readonly evaluationsService: EvaluationsService) {}

  @UseGuards(ApiKeyGuard)
  @Post('evaluate-cryptocurrency')
  async evaluateCryptocurrency(
    @Body('cryptocurrencyId') cryptocurrencyId: number,
    @Body('price') price: number,
    @Body('symbol') symbol: string,
  ) {
    return this.evaluationsService.evaluateCryptocurrency(
      cryptocurrencyId,
      price,
      symbol,
    );
  }
  @UseGuards(ApiKeyGuard)
  @Get('evaluation-types')
  async getEvaluationTypes() {
    return this.evaluationsService.getEvaluationTypes();
  }

  @UseGuards(ApiKeyGuard)
  @Get('recommended-actions')
  async getRecommendedActions() {
    return this.evaluationsService.getRecommendedActions();
  }

  @UseGuards(ApiKeyGuard)
  @Get('signal')
  async signal(@Query('symbol') symbol: string) {
    return this.evaluationsService.signal(symbol);
  }
  @UseGuards(ApiKeyGuard)
  @Get()
  async getEvaluations(
    @Query('page') page: number,
    @Query('cryptocurrencyId') cryptocurrencyId: number,
    @Query('evaluationTypeId') evaluationTypeId: number,
    @Query('recommendedActionId') recommendedActionId: number,
  ) {
    return this.evaluationsService.getEvaluations(
      cryptocurrencyId,
      evaluationTypeId,
      recommendedActionId,
      page,
    );
  }
  @UseGuards(ApiKeyGuard)
  @Post('reset')
  async resetEvaluations(@Body('token') token: string) {
    return this.evaluationsService.resetEvaluations(token);
  }

  @UseGuards(ApiKeyGuard)
  @Get('evaluations-buy')
  async getEvaluationsBuy(
    @Query('page') page: number,
    @Query('cryptocurrencyId') cryptocurrencyId: number,
    @Query('recommendedActionId') recommendedActionId: number,
  ) {
    return this.evaluationsService.getEvaluationsBuy(
      cryptocurrencyId,
      recommendedActionId,
      page,
    );
  }

  @UseGuards(ApiKeyGuard)
  @Get('evaluations-sell')
  async getEvaluationsSell(
    @Query('page') page: number,
    @Query('cryptocurrencyId') cryptocurrencyId: number,
    @Query('recommendedActionId') recommendedActionId: number,
    @Query('walletId') walletId: number,
  ) {
    return this.evaluationsService.getEvaluationsSell(
      cryptocurrencyId,
      recommendedActionId,
      walletId,
      page,
    );
  }
}
