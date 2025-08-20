import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createHmac } from 'crypto';
import { ErrorLogsService } from '../error-logs/error-logs.service';
import { BuyCryptoDto } from './dtos/buy-crypto.dto';
import { SellCryptoDto } from './dtos/sell-crypto.dto';

export interface BinanceSymbolFilter {
  filterType: string;
  minPrice?: string;
  maxPrice?: string;
  tickSize?: string;
  minQty?: string;
  maxQty?: string;
  stepSize?: string;
  minNotional?: string;
  notional?: string;
}

export interface BinanceSymbol {
  symbol: string;
  status: string;
  baseAsset: string;
  baseAssetPrecision: number;
  quoteAsset: string;
  quotePrecision: number;
  filters: BinanceSymbolFilter[];
}

export interface BinanceExchangeInfo {
  symbols: BinanceSymbol[];
}

export interface BinanceBalance {
  asset: string;
  free: string;
  locked: string;
}

export interface BinanceAccountInfo {
  balances: BinanceBalance[];
}

export interface BinanceOrderResponse {
  symbol: string;
  orderId: number;
  orderListId: number;
  clientOrderId: string;
  transactTime: number;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  origQuoteOrderQty: string;
  status: string;
  timeInForce: string;
  type: string;
  side: string;
  workingTime: number;
  fills: Array<{
    price: string;
    qty: string;
    commission: string;
    commissionAsset: string;
    tradeId: number;
  }>;
}

@Injectable()
export class BinanceService {
  private readonly apiKey: string;
  private readonly apiSecret: string;
  private readonly baseUrl = 'https://api.binance.com';

  constructor(private readonly errorLogsService: ErrorLogsService) {
    this.apiKey = process.env.BINANCE_API_KEY!;
    this.apiSecret = process.env.BINANCE_SECRET_KEY!;
  }

  private createSignature(query: string): string {
    return createHmac('sha256', this.apiSecret).update(query).digest('hex');
  }

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    params: Record<string, any> = {},
    requiresAuth = false,
  ): Promise<T> {
    const timestamp = Date.now();

    if (requiresAuth) {
      params.timestamp = timestamp;
    }

    const queryString = new URLSearchParams(params).toString();
    let url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      headers['X-MBX-APIKEY'] = this.apiKey;
      const signature = this.createSignature(queryString);
      url += `?${queryString}&signature=${signature}`;
    } else if (queryString) {
      url += `?${queryString}`;
    }

    const response = await fetch(url, {
      method,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Binance API Error: ${response.status} - ${errorText}`);
    }

    return response.json() as T;
  }

  async getAccountInfo(): Promise<BinanceAccountInfo> {
    try {
      return await this.makeRequest<BinanceAccountInfo>(
        '/api/v3/account',
        'GET',
        {},
        true,
      );
    } catch (error) {
      console.error('Error fetching account info:', error);
      throw error;
    }
  }

  async getSpotBalance(asset: string = 'USDT'): Promise<number> {
    try {
      const accountInfo = await this.getAccountInfo();
      const balance = accountInfo.balances.find((b) => b.asset === asset);
      return Number(balance?.free || 0);
    } catch (error) {
      console.error('Error fetching spot balance:', error);
      throw error;
    }
  }

  async getSymbolInfo(symbol: string): Promise<BinanceExchangeInfo> {
    try {
      return await this.makeRequest<BinanceExchangeInfo>(
        '/api/v3/exchangeInfo',
        'GET',
        { symbol },
      );
    } catch (error) {
      console.error('Error fetching symbol info:', error);
      throw error;
    }
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      const response = await this.makeRequest<{
        symbol: string;
        price: string;
      }>('/api/v3/ticker/price', 'GET', { symbol });
      return Number(response.price);
    } catch (error) {
      console.error('Error fetching current price:', error);
      throw error;
    }
  }

  async getMinQuantity(symbol: string): Promise<number> {
    try {
      const info = await this.getSymbolInfo(symbol);
      const lotSizeFilter = info.symbols[0].filters.find(
        (f) => f.filterType === 'LOT_SIZE',
      );
      return Number(lotSizeFilter?.minQty || 0);
    } catch (error) {
      console.error('Error fetching symbol info:', error);
      throw error;
    }
  }

  async getSymbolFilters(symbol: string) {
    try {
      const info = await this.getSymbolInfo(symbol);
      const symbolData = info.symbols[0];

      const lotSizeFilter = symbolData.filters.find(
        (f) => f.filterType === 'LOT_SIZE',
      );

      const marketLotSizeFilter = symbolData.filters.find(
        (f) => f.filterType === 'MARKET_LOT_SIZE',
      );

      const minNotionalFilter = symbolData.filters.find(
        (f) => f.filterType === 'NOTIONAL',
      );

      return {
        baseAssetPrecision: symbolData.baseAssetPrecision,
        quotePrecision: symbolData.quotePrecision,
        lotSize: {
          minQty: Number(lotSizeFilter?.minQty || 0),
          maxQty: Number(lotSizeFilter?.maxQty || 0),
          stepSize: Number(lotSizeFilter?.stepSize || 0),
        },
        marketLotSize: marketLotSizeFilter
          ? {
              minQty: Number(marketLotSizeFilter.minQty || 0),
              maxQty: Number(marketLotSizeFilter.maxQty || 0),
              stepSize: Number(marketLotSizeFilter.stepSize || 0),
            }
          : null,
        minNotional: {
          minNotional: Number(
            minNotionalFilter?.minNotional || minNotionalFilter?.notional || 0,
          ),
        },
      };
    } catch (error) {
      console.error('Error fetching symbol filters:', error);
      throw error;
    }
  }

  adjustQuantityToStepSize(quantity: number, stepSize: number): number {
    // If stepSize is 0, no adjustment needed
    if (stepSize === 0) {
      return quantity;
    }

    const precision = stepSize.toString().split('.')[1]?.length || 0;
    const adjustedQuantity = Math.floor(quantity / stepSize) * stepSize;
    return Number(adjustedQuantity.toFixed(precision));
  }

  /**
   * Aggregates multiple fills from a Binance order response into summary data
   * @param fills - Array of fills from Binance order response
   * @returns Aggregated fill data with weighted average price and total quantities
   */
  aggregateFills(
    fills: Array<{
      price: string;
      qty: string;
      commission: string;
      commissionAsset: string;
      tradeId: number;
    }>,
  ) {
    return fills.reduce(
      (acc, fill) => {
        const fillQty = Number(fill.qty);
        const fillPrice = Number(fill.price);
        const fillCommission = Number(fill.commission);

        acc.totalQty += fillQty;
        acc.totalCommission += fillCommission;
        // Calculate weighted average price
        acc.weightedPrice =
          (acc.weightedPrice * acc.totalValue + fillPrice * fillQty) /
          (acc.totalValue + fillQty);
        acc.totalValue += fillQty;
        acc.commissionAsset = fill.commissionAsset; // Use the last commission asset
        acc.lastTradeId = fill.tradeId; // Use the last trade ID

        return acc;
      },
      {
        totalQty: 0,
        totalCommission: 0,
        weightedPrice: 0,
        totalValue: 0,
        commissionAsset: '',
        lastTradeId: 0,
      },
    );
  }

  async placeMarketBuyOrder({
    symbol,
    quantity,
  }: BuyCryptoDto): Promise<BinanceOrderResponse> {
    try {
      // Get symbol filters to validate quantity
      const filters = await this.getSymbolFilters(symbol);

      // Get current price to calculate notional value
      const currentPrice = await this.getCurrentPrice(symbol);

      // Use market lot size if available, otherwise regular lot size
      const lotSize = filters.marketLotSize || filters.lotSize;

      // For market orders, if marketLotSize exists but has minQty = 0,
      // we should still check the regular lotSize for minimum quantity
      const minQty =
        lotSize.minQty > 0 ? lotSize.minQty : filters.lotSize.minQty;
      const stepSize =
        lotSize.stepSize > 0 ? lotSize.stepSize : filters.lotSize.stepSize;

      // Adjust quantity to step size
      let adjustedQuantity = this.adjustQuantityToStepSize(quantity, stepSize);

      // Calculate notional value (quantity * price)
      let notionalValue = adjustedQuantity * currentPrice;
      const minNotional = filters.minNotional.minNotional;

      // If notional value is too low, increase quantity to meet minimum notional
      if (notionalValue < minNotional) {
        // Add a small buffer (1.01x) to ensure we exceed the minimum
        const requiredQuantity = (minNotional * 1.01) / currentPrice;
        adjustedQuantity = this.adjustQuantityToStepSize(
          requiredQuantity,
          stepSize,
        );
        notionalValue = adjustedQuantity * currentPrice;

        // Double check - if still below minimum, round up one more step
        if (notionalValue < minNotional) {
          adjustedQuantity = adjustedQuantity + stepSize;
          notionalValue = adjustedQuantity * currentPrice;
        }
      }

      // Check USDT balance before placing order

      // Validate minimum quantity
      if (adjustedQuantity < minQty) {
        throw new Error(
          `Quantity ${adjustedQuantity} is below minimum required ${minQty}`,
        );
      }

      const order = await this.makeRequest<BinanceOrderResponse>(
        '/api/v3/order',
        'POST',
        {
          symbol,
          side: 'BUY',
          type: 'MARKET',
          quantity: adjustedQuantity.toString(),
        },
        true,
      );

      return order;
    } catch (error) {
      const customResponse = JSON.stringify({
        symbol,
        quantity,
      });
      const customError =
        error instanceof Error ? error.message : String(error);
      await this.errorLogsService.createErrorLog({
        message: 'Error placing market buy order',
        details: JSON.stringify({ customResponse, customError }),
        context: 'BinanceService.placeMarketBuyOrder',
      });
      throw new InternalServerErrorException('Failed to place buy order');
    }
  }

  async placeMarketSellOrder({
    symbol,
    quantity,
  }: SellCryptoDto): Promise<BinanceOrderResponse> {
    try {
      // Get symbol filters to validate quantity
      const filters = await this.getSymbolFilters(symbol);

      // Get current price to calculate notional value
      const currentPrice = await this.getCurrentPrice(symbol);

      // Use market lot size if available, otherwise regular lot size
      const lotSize = filters.marketLotSize || filters.lotSize;

      // For market orders, if marketLotSize exists but has minQty = 0,
      // we should still check the regular lotSize for minimum quantity
      const minQty =
        lotSize.minQty > 0 ? lotSize.minQty : filters.lotSize.minQty;
      const stepSize =
        lotSize.stepSize > 0 ? lotSize.stepSize : filters.lotSize.stepSize;

      // Adjust quantity to step size
      let adjustedQuantity = this.adjustQuantityToStepSize(quantity, stepSize);

      // Calculate notional value (quantity * price)
      let notionalValue = adjustedQuantity * currentPrice;
      const minNotional = filters.minNotional.minNotional;

      // If notional value is too low, increase quantity to meet minimum notional
      if (notionalValue < minNotional) {
        // Add a small buffer (1.01x) to ensure we exceed the minimum
        const requiredQuantity = (minNotional * 1.01) / currentPrice;
        adjustedQuantity = this.adjustQuantityToStepSize(
          requiredQuantity,
          stepSize,
        );
        notionalValue = adjustedQuantity * currentPrice;

        // Double check - if still below minimum, round up one more step
        if (notionalValue < minNotional) {
          adjustedQuantity = adjustedQuantity + stepSize;
          notionalValue = adjustedQuantity * currentPrice;
        }
      }

      // Validate minimum quantity
      if (adjustedQuantity < minQty) {
        throw new Error(
          `Quantity ${adjustedQuantity} is below minimum required ${minQty}`,
        );
      }

      const order = await this.makeRequest<BinanceOrderResponse>(
        '/api/v3/order',
        'POST',
        {
          symbol,
          side: 'SELL',
          type: 'MARKET',
          quantity: adjustedQuantity.toString(),
        },
        true,
      );
      return order;
    } catch (error) {
      const customResponse = JSON.stringify({
        symbol,
        quantity,
      });
      const customError =
        error instanceof Error ? error.message : String(error);

      await this.errorLogsService.createErrorLog({
        message: 'Error placing market sell order',
        details: JSON.stringify({ customResponse, customError }),
        context: 'BinanceService.placeMarketSellOrder',
      });
      throw new InternalServerErrorException('Failed to place sell order');
    }
  }
}
