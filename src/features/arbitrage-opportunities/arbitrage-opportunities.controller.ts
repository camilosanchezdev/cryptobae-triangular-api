import { Controller } from '@nestjs/common';
import { ArbitrageOpportunitiesService } from './arbitrage-opportunities.service';

@Controller('arbitrage-opportunities')
export class ArbitrageOpportunitiesController {
  constructor(
    private readonly arbitrageOpportunitiesService: ArbitrageOpportunitiesService,
  ) {}
}
