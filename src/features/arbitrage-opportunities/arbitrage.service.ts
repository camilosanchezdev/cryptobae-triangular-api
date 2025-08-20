import { Injectable } from '@nestjs/common';
import { BinanceService } from '../binance/binance.service';
import { BuyCryptoDto } from '../binance/dtos/buy-crypto.dto';
import { SellCryptoDto } from '../binance/dtos/sell-crypto.dto';
import { VaultsService } from '../vaults/vaults.service';
import { CreateArbitrageDto } from './dtos/create-arbitrage.dto';

@Injectable()
export class ArbitrageService {
  constructor(
    private readonly binanceService: BinanceService,
    private readonly vaultsService: VaultsService,
  ) {}
  async createArbitrage(body: CreateArbitrageDto, tradingPairs: string[]) {
    const vault = await this.vaultsService.getVaultByName(body.startStable);
    if (vault.amount < 0) {
      return;
    }
    const initialAmount = vault.amount;
    // Step 1: buy cryptocurrency 1
    const firstOrderQuantity = initialAmount / body.firstOrderPrice;
    // Example
    // HBAR/USDT - ask price 1 = 0.23396
    // firstOrderQuantity = 100 / 0.23396 = 427.56
    const marketBuyOrder: BuyCryptoDto = {
      symbol: body.firstOrderSymbol,
      quantity: firstOrderQuantity,
    };
    const firstOrder =
      await this.binanceService.placeMarketBuyOrder(marketBuyOrder);

    // Step 2: buy cryptocurrency 2
    const secondOrderQuantity =
      Number(firstOrder.executedQty) / body.secondOrderPrice;
    // Example
    // HBAR/BTC - ask price 2 = 0.00000207
    // secondOrderQuantity = 427.56 * 0.00000207 = 0.000885
    const marketBuyOrder2: BuyCryptoDto = {
      symbol: body.secondOrderSymbol,
      quantity: secondOrderQuantity,
    };
    const secondOrder =
      await this.binanceService.placeMarketBuyOrder(marketBuyOrder2);
    // Step 3: sell cryptocurrency 2
    const thirdOrderQuantity =
      Number(secondOrder.executedQty) * body.thirdOrderPrice;
    // Example
    // BTC/TUSD - ask price 3 = 113686.84
    // thirdOrderQuantity = 0.000885 * 113686.84 = 100.6128534
    const marketSellOrder: SellCryptoDto = {
      symbol: body.secondOrderSymbol,
      quantity: thirdOrderQuantity,
    };
    const thirdOrder =
      await this.binanceService.placeMarketSellOrder(marketSellOrder);

    const returnSymbol = this.getReturnSymbol(
      body.finalAsset,
      body.startStable,
      tradingPairs,
    );
    if (returnSymbol) {
      // Step 4: buy the initial currency
      const thirdOrderQuantity = Number(thirdOrder.executedQty);
      const marketBuyOrder3: BuyCryptoDto = {
        symbol: returnSymbol,
        quantity: thirdOrderQuantity,
      };
      await this.binanceService.placeMarketBuyOrder(marketBuyOrder3);
    }
  }
  getReturnSymbol(
    finalAsset: string,
    initialAsset: string,
    tradingPairs: string[],
  ): string | null {
    const symbol1 = `${finalAsset}${initialAsset}`;
    const symbol2 = `${initialAsset}${finalAsset}`;
    if (tradingPairs.includes(symbol1)) return symbol1;
    if (tradingPairs.includes(symbol2)) return symbol2;
    return null;
  }
}
