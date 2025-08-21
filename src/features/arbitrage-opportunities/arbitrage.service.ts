import { Injectable } from '@nestjs/common';
import {
  BinanceOrderResponse,
  BinanceService,
} from '../binance/binance.service';
import { BuyCryptoDto } from '../binance/dtos/buy-crypto.dto';
import { SellCryptoDto } from '../binance/dtos/sell-crypto.dto';
import { CreateFeeDto } from '../fees/dtos/create-fee.dto';
import { FeesService } from '../fees/fees.service';
import { CreateBuyOrderDto } from '../orders/dtos/create-buy-order.dto';
import { OrdersService } from '../orders/orders.service';
import { CreateTransactionDto } from '../transactions/dtos/create-transaction.dto';
import { TransactionTypeEnum } from '../transactions/enums/transaction-type.enum';
import { TransactionsService } from '../transactions/transactions.service';
import { VaultsService } from '../vaults/vaults.service';
import { CreateArbitrageDto } from './dtos/create-arbitrage.dto';
import { SaveOrdersRequest } from './interfaces/save-orders-request.interface';

@Injectable()
export class ArbitrageService {
  private readonly minCryptoPosition = Number(process.env.CRYPTO_POSITION);
  constructor(
    private readonly binanceService: BinanceService,
    private readonly vaultsService: VaultsService,
    private readonly transactionsService: TransactionsService,
    private readonly ordersService: OrdersService,
    private readonly feesService: FeesService,
  ) {}
  async createArbitrage(
    body: CreateArbitrageDto,
  ): Promise<SaveOrdersRequest | null> {
    const vault = await this.vaultsService.getVaultByName(body.startStable);
    if (vault.amount <= 0 || vault.amount < this.minCryptoPosition) {
      return null;
    }
    const initialAmount = vault.amount;
    let haveAsset = body.startStable;
    let amount = initialAmount;
    // Step 1
    const {
      side: side1,
      quantity: qty1,
      nextAsset: asset1,
    } = this.getOrderTypeAndQuantity(
      haveAsset,
      body.firstOrderSymbol.replace(haveAsset, ''),
      body.firstOrderSymbol,
      body.firstOrderPrice,
      amount,
    );
    let firstOrder: BinanceOrderResponse;
    if (side1 === 'BUY') {
      const order: BuyCryptoDto = {
        symbol: body.firstOrderSymbol,
        quantity: qty1,
      };
      console.log(
        '🚀 ~ ArbitrageService ~ createArbitrage ~ firstOrder (BUY):',
        order,
      );
      firstOrder = await this.binanceService.placeMarketBuyOrder(order);
    } else {
      const order: SellCryptoDto = {
        symbol: body.firstOrderSymbol,
        quantity: qty1,
      };
      console.log(
        '🚀 ~ ArbitrageService ~ createArbitrage ~ firstOrder (SELL):',
        order,
      );
      firstOrder = await this.binanceService.placeMarketSellOrder(order);
    }
    console.log(
      '🚀 ~ ArbitrageService ~ createArbitrage ~ firstOrder:',
      firstOrder,
    );
    haveAsset = asset1;
    amount = Number(firstOrder.executedQty);

    // Step 2
    const {
      side: side2,
      quantity: qty2,
      nextAsset: asset2,
    } = this.getOrderTypeAndQuantity(
      haveAsset,
      body.secondOrderSymbol.replace(haveAsset, ''),
      body.secondOrderSymbol,
      body.secondOrderPrice,
      amount,
    );
    let secondOrder: BinanceOrderResponse;
    if (side2 === 'BUY') {
      const order: BuyCryptoDto = {
        symbol: body.secondOrderSymbol,
        quantity: qty2,
      };
      console.log(
        '🚀 ~ ArbitrageService ~ createArbitrage ~ secondOrder (BUY):',
        order,
      );
      secondOrder = await this.binanceService.placeMarketBuyOrder(order);
    } else {
      const order: SellCryptoDto = {
        symbol: body.secondOrderSymbol,
        quantity: qty2,
      };
      console.log(
        '🚀 ~ ArbitrageService ~ createArbitrage ~ secondOrder (SELL):',
        order,
      );
      secondOrder = await this.binanceService.placeMarketSellOrder(order);
    }
    console.log(
      '🚀 ~ ArbitrageService ~ createArbitrage ~ secondOrder:',
      secondOrder,
    );
    haveAsset = asset2;
    amount = Number(secondOrder.executedQty); // This is the BTC you received from selling DOGE

    // Step 3
    const { side: side3, quantity: qty3 } = this.getOrderTypeAndQuantity(
      haveAsset,
      body.thirdOrderSymbol.replace(haveAsset, ''),
      body.thirdOrderSymbol,
      body.thirdOrderPrice,
      amount,
    );
    let thirdOrder: BinanceOrderResponse;
    if (side3 === 'BUY') {
      const order: BuyCryptoDto = {
        symbol: body.thirdOrderSymbol,
        quantity: qty3,
      };
      console.log(
        '🚀 ~ ArbitrageService ~ createArbitrage ~ thirdOrder (BUY):',
        order,
      );
      thirdOrder = await this.binanceService.placeMarketBuyOrder(order);
    } else {
      const order: SellCryptoDto = {
        symbol: body.thirdOrderSymbol,
        quantity: qty3,
      };
      console.log(
        '🚀 ~ ArbitrageService ~ createArbitrage ~ thirdOrder (SELL):',
        order,
      );
      thirdOrder = await this.binanceService.placeMarketSellOrder(order);
    }
    console.log(
      '🚀 ~ ArbitrageService ~ createArbitrage ~ thirdOrder:',
      thirdOrder,
    );
    // Step 4
    // re buy USDT
    const rebuyUSDTOrder = await this.rebuyUSDT(
      body.finalAsset,
      Number(thirdOrder.executedQty),
    );
    console.log(
      '🚀 ~ ArbitrageService ~ createArbitrage ~ rebuyUSDTOrder:',
      rebuyUSDTOrder,
    );
    return {
      orders: [firstOrder, secondOrder, thirdOrder] as BinanceOrderResponse[],
      firstTradingPairId: body.firstTradingPairId,
      secondTradingPairId: body.secondTradingPairId,
      thirdTradingPairId: body.thirdTradingPairId,
      startStable: body.startStable,
      finalAsset: body.finalAsset,
      rebuyAmount: Number(rebuyUSDTOrder.cummulativeQuoteQty),
    };
  }
  async updateVault(
    amount: number,
    transactionId: number,
    name: string,
    isBuy: boolean,
  ) {
    let normalAmount = amount;
    if (isBuy) {
      normalAmount *= -1;
    }
    const normalizedAmount = Object.is(normalAmount, -0) ? 0 : normalAmount;
    await this.vaultsService.updateVaultCapital(
      name,
      normalizedAmount,
      transactionId,
    );
  }
  async createOrder(order: BinanceOrderResponse, tradingPairId: number) {
    // Aggregate all fills from the order response
    const aggregatedFills = this.binanceService.aggregateFills(order.fills);
    const finalAmountBuy = aggregatedFills.totalQty;
    const finalPriceBuy = aggregatedFills.weightedPrice;
    const newTransaction: CreateTransactionDto = {
      amount: finalAmountBuy,
      pricePerUnit: finalPriceBuy,
      status: 'FILLED',
      tradingPairId,
      transactionTypeId: TransactionTypeEnum.BUY,
    };
    const transaction =
      await this.transactionsService.createTransaction(newTransaction);
    // Create order
    // Create buy order using aggregated fills data
    const createBuyOrderDto: CreateBuyOrderDto = {
      symbol: order.symbol,
      externalOrderId: order.orderId,
      orderListId: order.orderListId,
      clientOrderId: order.clientOrderId,
      transactTime: order.transactTime,
      price: order.price,
      origQty: order.origQty,
      executedQty: order.executedQty,
      origQuoteOrderQty: order.origQuoteOrderQty,
      cummulativeQuoteQty: order.cummulativeQuoteQty,
      status: order.status,
      timeInForce: order.timeInForce,
      type: order.type,
      side: order.side,
      workingTime: order.workingTime,
      fillsPrice: aggregatedFills.weightedPrice.toString(),
      fillsQty: aggregatedFills.totalQty.toString(),
      fillsCommission: aggregatedFills.totalCommission.toString(),
      fillsCommissionAsset: aggregatedFills.commissionAsset,
      fillsTradeId: aggregatedFills.lastTradeId,
      transactionId: transaction.id,
    };

    const amountFee = (-aggregatedFills.totalCommission).toString(); // Negative because it's a fee
    const responseNewOrder =
      await this.ordersService.createBuyOrder(createBuyOrderDto);
    // create fee
    const createFeeDto: CreateFeeDto = {
      amount: amountFee,
      orderId: responseNewOrder.id,
    };
    await this.feesService.createFee(createFeeDto);
    // update master vault fee
    await this.vaultsService.updateMasterVaultFee(
      Number(amountFee),
      transaction.id,
    );

    return { finalAmountBuy, finalPriceBuy, transactionId: transaction.id };
  }
  async saveOrders(requests: SaveOrdersRequest[]) {
    for (const request of requests) {
      const firstOrder = request.orders[0];
      const secondOrder = request.orders[1];
      const thirdOrder = request.orders[2];
      // TRANSACTIONS & ORDERS
      // Order #1
      const firstOperation = await this.createOrder(
        firstOrder,
        request.firstTradingPairId,
      );
      // Order #2
      await this.createOrder(secondOrder, request.secondTradingPairId);
      // Order #3
      const lastOperation = await this.createOrder(
        thirdOrder,
        request.thirdTradingPairId,
      );

      // Update master vault capital
      // Decrease initial vault
      const firstOperationAmount =
        firstOperation.finalAmountBuy * firstOperation.finalPriceBuy;
      await this.updateVault(
        firstOperationAmount,
        firstOperation.transactionId,
        request.startStable,
        true,
      );

      // Increase final vault
      const lastOperationAmount =
        lastOperation.finalAmountBuy * lastOperation.finalPriceBuy;
      await this.updateVault(
        lastOperationAmount,
        lastOperation.transactionId,
        request.finalAsset,
        false,
      );

      // Increase initial vault after rebuy
      const rebuyAmount = request.rebuyAmount;

      await this.updateVault(
        rebuyAmount,
        lastOperation.transactionId,
        request.startStable,
        false,
      );
    }
  }
  /**
   * Re-buy USDT from a given asset by placing a market order.
   * @param fromAsset The asset to convert to USDT (e.g., BTC, ETH)
   * @param amount The amount of the asset to convert
   * @returns BinanceOrderResponse
   */
  async rebuyUSDT(
    fromAsset: string,
    amount: number,
  ): Promise<BinanceOrderResponse> {
    const symbol = fromAsset + 'USDT';
    // Try to sell the asset for USDT
    const order = {
      symbol,
      quantity: amount,
    };
    console.log('🚀 ~ ArbitrageService ~ rebuyUSDT:', order);
    // Place a market sell order (selling fromAsset to get USDT)
    return this.binanceService.placeMarketSellOrder(order);
  }
  getOrderTypeAndQuantity(
    haveAsset: string,
    wantAsset: string,
    symbol: string,
    price: number,
    amount: number,
  ) {
    console.log('🚀 ~ getOrderTypeAndQuantity ~ haveAsset:', haveAsset);
    // Robustly extract base and quote from symbol
    let base = '';
    let quote = '';
    if (symbol.endsWith(haveAsset)) {
      // haveAsset is quote
      quote = haveAsset;
      base = symbol.slice(0, symbol.length - haveAsset.length);
    } else if (symbol.startsWith(haveAsset)) {
      // haveAsset is base
      base = haveAsset;
      quote = symbol.slice(haveAsset.length);
    } else {
      // fallback: try wantAsset
      if (symbol.endsWith(wantAsset)) {
        quote = wantAsset;
        base = symbol.slice(0, symbol.length - wantAsset.length);
      } else if (symbol.startsWith(wantAsset)) {
        base = wantAsset;
        quote = symbol.slice(wantAsset.length);
      } else {
        throw new Error('Cannot determine base/quote from symbol');
      }
    }
    console.log('🚀 ~ getOrderTypeAndQuantity ~ base:', base);
    console.log('🚀 ~ getOrderTypeAndQuantity ~ quote:', quote);

    if (haveAsset === quote) {
      // BUY: spend quote, get base
      return {
        side: 'BUY',
        quantity: amount / price, // how much base you get
        nextAsset: base,
      };
    } else if (haveAsset === base) {
      // SELL: spend base, get quote
      return {
        side: 'SELL',
        quantity: amount, // how much base you sell
        nextAsset: quote,
      };
    } else {
      throw new Error('Asset flow mismatch');
    }
  }
}
