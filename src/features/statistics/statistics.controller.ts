import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '../../auth/auth.guard';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}
  @UseGuards(ApiKeyGuard)
  @Get('results')
  async getResults(@Query('page') page: number) {
    return this.statisticsService.getResults(page);
  }
}
