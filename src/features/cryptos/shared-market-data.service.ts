import { Injectable } from '@nestjs/common';
import { CreateMarketDataDto } from './dtos/create-market-data.dto';

@Injectable()
export class SharedMarketDataService {
  private currentPrices: Map<string, CreateMarketDataDto> = new Map();

  updatePrice(symbol: string, priceData: CreateMarketDataDto): void {
    this.currentPrices.set(symbol, priceData);
  }

  getCurrentPrices(): Map<string, CreateMarketDataDto> {
    return new Map(this.currentPrices); // Return a copy to prevent external modifications
  }

  getCurrentPrice(symbol: string): CreateMarketDataDto | undefined {
    return this.currentPrices.get(symbol);
  }

  getPriceCount(): number {
    return this.currentPrices.size;
  }

  clearAllPrices(): void {
    this.currentPrices.clear();
  }
}
